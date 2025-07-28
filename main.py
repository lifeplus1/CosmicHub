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

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set path to ephemeris files
try:
    swe.set_ephe_path('ephe')
except Exception as e:
    logger.error(f"Failed to set ephe path: {str(e)}")
    raise Exception(f"Ephe path error: {str(e)}")

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

# API Key auth (change 'your_api_key' to a secret in production)
API_KEY = "your_api_key"
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
    transit_date: str = "2025-07-28"  # Default current date

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
        # Load city cache
        city_cache = load_city_cache()

        # Check cache first
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
            
            # Save to cache
            city_cache[data.city] = {
                'latitude': latitude,
                'longitude': longitude,
                'timezone': timezone_str
            }
            save_city_cache(city_cache)
            logger.info(f"Cached {data.city}")
        
        # Convert local time to UTC
        local_tz = pytz.timezone(timezone_str)
        local_dt = datetime(data.year, data.month, data.day, data.hour, data.minute)
        try:
            utc_dt = local_tz.localize(local_dt, is_dst=None).astimezone(pytz.utc)
        except pytz.AmbiguousTimeError:
            raise HTTPException(status_code=400, detail="Ambiguous time due to DST. Specify exact DST status if needed.")
        except pytz.UnknownTimeZoneError:
            raise HTTPException(status_code=400, detail="Invalid timezone.")
        
        # Convert to Julian Day
        jd = swe.utc_to_jd(utc_dt.year, utc_dt.month, utc_dt.day, utc_dt.hour, utc_dt.minute, utc_dt.second, 1)[1]
        
        # House cusps and angles (Placidus)
        house_data = swe.houses(jd, latitude, longitude, b'P')
        cusps = house_data[0]
        ascmc = house_data[1]
        
        # Obliquity (epsilon)
        eps = swe.calc_ut(jd, swe.ECL_NUT)[0][0]
        
        # Planet IDs (added Chiron)
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
        }
        
        # Zodiac signs
        signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        
        # Planet data
        planets_lon = {}
        planet_data = {}
        for planet, ipl in planet_ids.items():
            xx = swe.calc_ut(jd, ipl)[0]
            lon = xx[0] % 360
            lat = xx[1]
            speed = xx[3]
            retrograde = speed < 0
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
                'retrograde': retrograde
            }
            planets_lon[planet] = lon
        
        # Angles longitudes
        angles_lon = {
            'Ascendant': ascmc[0] % 360,
            'Midheaven': ascmc[1] % 360,
            'Vertex': ascmc[3] % 360,
            'Antivertex': (ascmc[3] + 180) % 360,
            'IC': (ascmc[1] + 180) % 360
        }
        
        # Angles data with sign and house
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
        
        # House data
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
        
        # Aspects (planets to planets and planets to angles)
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

@app.post("/transits")
async def calculate_transits(data: TransitData, api_key: str = Depends(get_api_key)):
    # Calculate natal chart
    natal_chart = calculate_chart(data.natal)
    
    # Current transits (fixed date July 28, 2025, 12:00 UTC)
    transit_dt = datetime(2025, 7, 28, 12, 0)
    transit_jd = swe.utc_to_jd(2025, 7, 28, 12, 0, 0, 1)[1]
    
    transit_planets = {}
    for planet, ipl in planet_ids.items():
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
    
    # Transit aspects to natal
    transit_aspects = []
    for t_planet, t_lon in transit_planets.items():
        t_lon = float(t_lon['position'].split('°')[0]) + float(t_lon['position'].split('°')[1][:2]) / 60
        for n_planet, n_data in natal_chart['planets'].items():
            n_lon = float(n_data['position'].split('°')[0]) + float(n_data['position'].split('°')[1][:2]) / 60
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
