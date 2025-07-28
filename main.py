import swisseph as swe
import pytz
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from geopy.geocoders import Nominatim
import timezonefinder
import traceback
import logging
import itertools
import sqlite3
from typing import List, Dict

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set path to ephemeris files
try:
    swe.set_ephe_path('ephe')
except Exception as e:
    logger.error(f"Failed to set ephe path: {str(e)}")
    raise Exception(f"Ephe path error: {str(e)}")

# Initialize SQLite database
def init_db():
    try:
        conn = sqlite3.connect('charts.db')
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS charts
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      type TEXT,
                      birth_data TEXT,
                      chart_data TEXT,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise Exception(f"Database init error: {str(e)}")

init_db()

# Planet IDs (global, added South Node)
planet_ids = {
    'Sun': swe.SUN,
    'Moon': swe.MOON,
    'Mercury': swe.MERCURY,
    'Venus': swe.VENUS,
    'Mars': swe.MARS,
    'Jupiter': swe.JUPITER,
    'Saturn': swe.SATURN,
    'Uranus': swe.URANUS,
    'Neptune': swe.NEPTUNE,
    'Pluto': swe.PLUTO,
    'Chiron': swe.CHIRON,
    'North Node': swe.MEAN_NODE,
    'South Node': swe.MEAN_NODE,  # South Node uses same ID, offset by 180°
}

# Zodiac signs (global)
signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']

# Aspect types (global)
aspect_types = {
    'Conjunction': (0, 8),
    'Semi-Sextile': (30, 2),
    'Sextile': (60, 4),
    'Quintile': (72, 2),
    'Square': (90, 6),
    'Trine': (120, 6),
    'Sesquiquadrate': (135, 3),
    'Bi-Quintile': (144, 2),
    'Quincunx': (150, 3),
    'Opposition': (180, 8),
}

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://astrology-app-sigma.vercel.app",
        "https://astrology-app-git-main-christophers-projects-17e93f49.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key auth
API_KEY = os.getenv("API_KEY", "c3a579e58484f1eb21bfc96966df9a25")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return api_key

class BirthData(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    city: str

class TransitData(BaseModel):
    natal: BirthData
    transit_date: str = "2025-07-28"

class SaveChartRequest(BaseModel):
    chart_type: str
    birth_data: BirthData
    chart_data: Dict

class SavedChart(BaseModel):
    id: int
    type: str
    birth_data: dict
    chart_data: dict
    created_at: str

# Load city cache
def load_city_cache():
    try:
        if os.path.exists('cities.json'):
            with open('cities.json', 'r') as f:
                return json.load(f)
        return {}
    except Exception as e:
        logger.error(f"Failed to load cities.json: {str(e)}")
        return {}

# Save to city cache
def save_city_cache(cache):
    try:
        with open('cities.json', 'w') as f:
            json.dump(cache, f, indent=4)
    except Exception as e:
        logger.error(f"Failed to save cities.json: {str(e)}")

def calculate_chart(data: BirthData):
    try:
        logger.info(f"Processing request for city: {data.city}")
        city_cache = load_city_cache()

        if data.city in city_cache:
            logger.info(f"Using cached data for {data.city}")
            latitude = city_cache[data.city]['latitude']
            longitude = city_cache[data.city]['longitude']
            timezone_str = city_cache[data.city]['timezone']
        else:
            logger.info(f"Fetching geolocation for {data.city}")
            geolocator = Nominatim(user_agent="astro_app")
            location = geolocator.geocode(data.city, timeout=5)
            if not location:
                raise HTTPException(status_code=404, detail="City not found. Try including country, e.g., 'Paris, France'.")
            
            latitude = location.latitude
            longitude = location.longitude
            
            tf = timezonefinder.TimezoneFinder()
            timezone_str = tf.timezone_at(lng=longitude, lat=latitude)
            if not timezone_str:
                raise HTTPException(status_code=404, detail="Timezone not found for this location.")
            
            city_cache[data.city] = {
                'latitude': latitude,
                'longitude': longitude,
                'timezone': timezone_str
            }
            save_city_cache(city_cache)
            logger.info(f"Cached {data.city}")
        
        local_tz = pytz.timezone(timezone_str)
        local_dt = datetime(data.year, data.month, data.day, data.hour, data.minute)
        try:
            utc_dt = local_tz.localize(local_dt, is_dst=None).astimezone(pytz.utc)
        except pytz.AmbiguousTimeError:
            raise HTTPException(status_code=400, detail="Ambiguous time due to DST. Specify exact DST status if needed.")
        except pytz.UnknownTimeZoneError:
            raise HTTPException(status_code=400, detail="Invalid timezone.")
        
        jd = swe.utc_to_jd(utc_dt.year, utc_dt.month, utc_dt.day, utc_dt.hour, utc_dt.minute, utc_dt.second, 1)[1]
        
        house_data = swe.houses(jd, latitude, longitude, b'P')
        cusps = house_data[0]
        ascmc = house_data[1]
        
        eps = swe.calc_ut(jd, swe.ECL_NUT)[0][0]
        
        planets_lon = {}
        planet_data = {}
        for planet, ipl in planet_ids.items():
            if planet == 'South Node':
                # South Node is 180° opposite North Node
                north_node_data = planet_data.get('North Node', None)
                if north_node_data:
                    lon = (north_node_data['lon'] + 180) % 360
                    lat = -north_node_data['lat'] if 'lat' in north_node_data else 0
                    speed = 0
                    retrograde = False
                else:
                    continue  # Skip if North Node not calculated yet
            else:
                xx = swe.calc_ut(jd, ipl)[0]
                lon = xx[0] % 360
                lat = xx[1]
                speed = xx[3] if planet != 'North Node' else 0
                retrograde = speed < 0 if planet != 'North Node' else False
            
            degrees = int(lon)
            minutes = int((lon - degrees) * 60)
            sign_index = int(lon // 30)
            sign = signs[sign_index]
            house_pos = swe.house_pos(ascmc[2], latitude, eps, [lon, lat], b'P')
            house = int(house_pos)
            fraction = house_pos - house
            if fraction > 0.9:
                house += 1
                if house > 12:
                    house = 1
            planet_data[planet] = {
                'position': f"{degrees:02}°{sign[:2]}{minutes:02}'",
                'sign': sign,
                'house': house,
                'retrograde': retrograde,
                'lon': lon,
                'lat': lat
            }
            planets_lon[planet] = lon
        
        angles_lon = {
            'Ascendant': ascmc[0] % 360,
            'Midheaven': ascmc[1] % 360,
            'Vertex': ascmc[3] % 360,
            'Antivertex': (ascmc[3] + 180) % 360,
            'IC': (ascmc[1] + 180) % 360
        }
        
        angles_data = {}
        for angle, lon in angles_lon.items():
            sign_index = int(lon // 30)
            sign = signs[sign_index]
            house_pos = swe.house_pos(ascmc[2], latitude, eps, [lon, 0], b'P')
            house = int(house_pos)
            fraction = house_pos - house
            if fraction > 0.9:
                house += 1
                if house > 12:
                    house = 1
            angles_data[angle] = {
                'position': f"{int(lon):02}°{sign[:2]}{int((lon - int(lon)) * 60):02}'",
                'sign': sign,
                'house': house
            }
        
        houses = []
        for i in range(12):
            cusp = cusps[i] % 360
            sign_index = int(cusp // 30)
            sign = signs[sign_index]
            houses.append({
                'house': i + 1,
                'cusp': f"{cusp:.2f} degrees",
                'sign': sign
            })
        
        aspects = []
        all_points_lon = {**planets_lon, **angles_lon}
        for p1, p2 in itertools.combinations(all_points_lon.keys(), 2):
            diff = abs(all_points_lon[p1] - all_points_lon[p2])
            diff = min(diff, 360 - diff)
            for asp_name, (target, orb) in aspect_types.items():
                if abs(diff - target) <= orb:
                    aspects.append({
                        'point1': p1,
                        'point2': p2,
                        'aspect': asp_name,
                        'orb': f"{abs(diff - target):.2f}°"
                    })
        
        return {
            'resolved_location': {
                'city': data.city,
                'latitude': f"{latitude:.2f}",
                'longitude': f"{longitude:.2f}",
                'timezone': timezone_str
            },
            'planets': planet_data,
            'houses': houses,
            'angles': angles_data,
            'aspects': aspects
        }
    except Exception as e:
        logger.error(f"Request failed: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@app.post("/calculate")
async def calculate_positions(data: BirthData, api_key: str = Depends(get_api_key)):
    return calculate_chart(data)

@app.post("/transits")
async def calculate_transits(data: TransitData, api_key: str = Depends(get_api_key)):
    natal_chart = calculate_chart(data.natal)
    
    try:
        transit_dt = datetime.strptime(data.transit_date, "%Y-%m-%d")
        transit_jd = swe.utc_to_jd(transit_dt.year, transit_dt.month, transit_dt.day, 12, 0, 0, 1)[1]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid transit date format. Use YYYY-MM-DD.")
    
    transit_planets_lon = {}
    transit_planets = {}
    for planet, ipl in planet_ids.items():
        if planet == 'South Node':
            north_node_data = transit_planets.get('North Node', None)
            if north_node_data:
                lon = (north_node_data['lon'] + 180) % 360
                degrees = int(lon)
                minutes = int((lon - degrees) * 60)
                sign_index = int(lon // 30)
                sign = signs[sign_index]
                transit_planets[planet] = {
                    'position': f"{degrees:02}°{sign[:2]}{minutes:02}'",
                    'sign': sign
                }
                transit_planets_lon[planet] = lon
            continue
        xx = swe.calc_ut(transit_jd, ipl)[0]
        lon = xx[0] % 360
        degrees = int(lon)
        minutes = int((lon - degrees) * 60)
        sign_index = int(lon // 30)
        sign = signs[sign_index]
        transit_planets[planet] = {
            'position': f"{degrees:02}°{sign[:2]}{minutes:02}'",
            'sign': sign
        }
        transit_planets_lon[planet] = lon
    
    transit_aspects = []
    for t_planet, t_lon in transit_planets_lon.items():
        for n_planet, n_data in natal_chart['planets'].items():
            n_lon = n_data['lon']
            diff = abs(t_lon - n_lon)
            diff = min(diff, 360 - diff)
            for asp_name, (target, orb) in aspect_types.items():
                if abs(diff - target) <= orb:
                    transit_aspects.append({
                        'transit_planet': t_planet,
                        'natal_point': n_planet,
                        'aspect': asp_name,
                        'orb': f"{abs(diff - target):.2f}°"
                    })
    
    return {
        'natal': natal_chart,
        'transits': transit_planets,
        'transit_aspects': transit_aspects
    }

@app.post("/save-chart")
async def save_chart(request: SaveChartRequest, api_key: str = Depends(get_api_key)):
    try:
        logger.info(f"Saving chart: type={request.chart_type}, birth_data={request.birth_data}")
        conn = sqlite3.connect('charts.db')
        c = conn.cursor()
        c.execute("INSERT INTO charts (type, birth_data, chart_data) VALUES (?, ?, ?)",
                  (request.chart_type, json.dumps(request.birth_data.dict()), json.dumps(request.chart_data)))
        conn.commit()
        chart_id = c.lastrowid
        conn.close()
        return {"message": "Chart saved successfully", "chart_id": chart_id}
    except Exception as e:
        logger.error(f"Save chart failed: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@app.get("/get-charts", response_model=List[SavedChart])
async def get_charts(api_key: str = Depends(get_api_key)):
    try:
        conn = sqlite3.connect('charts.db')
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT id, type, birth_data, chart_data, created_at FROM charts ORDER BY created_at DESC")
        charts = c.fetchall()
        conn.close()
        return [
            {
                "id": chart['id'],
                "type": chart['type'],
                "birth_data": json.loads(chart['birth_data']),
                "chart_data": json.loads(chart['chart_data']),
                "created_at": chart['created_at']
            }
            for chart in charts
        ]
    except Exception as e:
        logger.error(f"Get charts failed: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
