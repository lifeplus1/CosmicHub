import swisseph as swe  # pyswisseph
import pytz
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from geopy.geocoders import Nominatim
import timezonefinder
import traceback  # For error logging
import itertools  # For planet pairs
from fastapi.middleware.cors import CORSMiddleware

# Set path to ephemeris files (update if your path differs)
swe.set_ephe_path('ephe')

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (change to specific for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BirthData(BaseModel):
    year: int  # e.g., 1990
    month: int  # 1-12
    day: int  # 1-31
    hour: int  # 0-23
    minute: int  # 0-59
    city: str  # e.g., 'New York' or 'New York, USA' for accuracy

@app.post("/calculate")
def calculate_positions(data: BirthData):
    try:
        # Get lat/lon from city
        geolocator = Nominatim(user_agent="astro_app")
        location = geolocator.geocode(data.city)
        if not location:
            raise HTTPException(status_code=404, detail="City not found. Try including country, e.g., 'Paris, France'.")
        
        latitude = location.latitude
        longitude = location.longitude
        
        # Get timezone from lat/lon
        tf = timezonefinder.TimezoneFinder()
        timezone_str = tf.timezone_at(lng=longitude, lat=latitude)
        if not timezone_str:
            raise HTTPException(status_code=404, detail="Timezone not found for this location.")
        
        # Convert local time to UTC
        local_tz = pytz.timezone(timezone_str)
        local_dt = datetime(data.year, data.month, data.day, data.hour, data.minute)
        try:
            utc_dt = local_tz.localize(local_dt, is_dst=None).astimezone(pytz.utc)  # Handle DST ambiguity
        except pytz.AmbiguousTimeError:
            raise HTTPException(status_code=400, detail="Ambiguous time due to DST. Specify exact DST status if needed.")
        except pytz.UnknownTimeZoneError:
            raise HTTPException(status_code=400, detail="Invalid timezone.")
        
        # Convert to Julian Day for Swiss Ephemeris
        jd = swe.utc_to_jd(utc_dt.year, utc_dt.month, utc_dt.day, utc_dt.hour, utc_dt.minute, utc_dt.second, 1)[1]
        
        # Add house cusps and angles (Placidus system)
        house_data = swe.houses(jd, latitude, longitude, b'P')
        cusps = house_data[0]  # 12 house cusps
        ascmc = house_data[1]  # Asc, MC, ARMC, etc.
        
        # Obliquity (epsilon)
        eps = swe.calc_ut(jd, swe.ECL_NUT)[0][0]
        
        # Planet IDs
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
        }
        
        # Zodiac signs list
        signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        
        # Calculate planet positions (longitudes)
        planets_lon = {}
        planet_data = {}
        for planet, ipl in planet_ids.items():
            xx = swe.calc_ut(jd, ipl)[0]
            lon = xx[0] % 360
            lat = xx[1]
            speed = xx[3]  # For retrograde
            retrograde = speed < 0
            degrees = int(lon)
            minutes = int((lon - degrees) * 60)
            sign_index = int(lon // 30)
            sign = signs[sign_index]
            # House calculation
            house_pos = swe.house_pos(ascmc[2], latitude, eps, [lon, lat], b'P')
            house = int(house_pos)
            fraction = house_pos - house
            if fraction > 0.9:  # Close to next cusp
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
        
        # House data with cusps and signs
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
        
        # Angles (Ascendant, Midheaven, Vertex, Antivertex, IC)
        angles = {
            'Ascendant': f"{ascmc[0]:.2f} degrees",
            'Midheaven': f"{ascmc[1]:.2f} degrees",
            'Vertex': f"{ascmc[3]:.2f} degrees",
            'Antivertex': f"{(ascmc[3] + 180) % 360:.2f} degrees",
            'IC': f"{(ascmc[1] + 180) % 360:.2f} degrees"
        }
        
        # Aspect definitions (major aspects with orbs)
        aspect_types = {
            'Conjunction': (0, 8),
            'Sextile': (60, 4),
            'Square': (90, 6),
            'Trine': (120, 6),
            'Opposition': (180, 8),
        }
        
        # Calculate aspects
        aspects = []
        for p1, p2 in itertools.combinations(planet_ids.keys(), 2):
            diff = abs(planets_lon[p1] - planets_lon[p2])
            diff = min(diff, 360 - diff)  # Shortest arc
            for asp_name, (target, orb) in aspect_types.items():
                if abs(diff - target) <= orb:
                    aspects.append({
                        'planet1': p1,
                        'planet2': p2,
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
            'angles': angles,
            'aspects': aspects
        }
    except Exception as e:
        print("Error:", traceback.format_exc())  # Log to console for debugging
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
