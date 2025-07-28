import swisseph as swe
from datetime import datetime
import pytz
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder

signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']

def get_location(city, cities):
    if city in cities:
        return cities[city]
    geolocator = Nominatim(user_agent="astrology_app")
    location = geolocator.geocode(city)
    if not location:
        raise ValueError("City not found")
    tf = TimezoneFinder()
    timezone = tf.timezone_at(lat=location.latitude, lng=location.longitude)
    if not timezone:
        raise ValueError("Timezone not found")
    return {
        "city": city,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "timezone": timezone
    }

def calculate_chart(year, month, day, hour, minute, lat, lon, timezone):
    swe.set_ephe_path('./ephe')
    tz = pytz.timezone(timezone)
    dt = datetime(year, month, day, hour, minute)
    dt_utc = tz.localize(dt).astimezone(pytz.UTC)
    jd = swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, dt_utc.hour + dt_utc.minute / 60.0)
    
    # Define houses first
    houses = []
    for i in range(12):
        cusp = swe.houses(jd, lat, lon, b'P')[0][i]
        houses.append({
            "house": i + 1,
            "cusp": f"{int(cusp % 30)}°{signs[int(cusp / 30)]}{int((cusp % 30 - int(cusp % 30)) * 60)}'",
            "sign": signs[int(cusp / 30)]
        })
    
    planets = {}
    for i, name in enumerate(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node', 'South Node']):
        result = swe.calc_ut(jd, i)
        lon = result[0][0]  # Extract longitude from nested tuple
        sign = signs[int(lon / 30)]
        house = calculate_house(lon, houses)
        retrograde = result[3] < 0 if len(result) > 3 else False
        planets[name] = {
            "position": f"{int(lon % 30)}°{sign}{int((lon % 30 - int(lon % 30)) * 60)}'",
            "sign": sign,
            "house": house,
            "retrograde": retrograde,
            "lon": lon
        }
    
    angles = {
        "Ascendant": {
            "lon": swe.houses(jd, lat, lon, b'P')[0][0],
            "position": f"{int(swe.houses(jd, lat, lon, b'P')[0][0] % 30)}°{signs[int(swe.houses(jd, lat, lon, b'P')[0][0] / 30)]}",
            "sign": signs[int(swe.houses(jd, lat, lon, b'P')[0][0] / 30)],
            "house": 1
        },
        "Midheaven": {
            "lon": swe.houses(jd, lat, lon, b'P')[0][9],
            "position": f"{int(swe.houses(jd, lat, lon, b'P')[0][9] % 30)}°{signs[int(swe.houses(jd, lat, lon, b'P')[0][9] / 30)]}",
            "sign": signs[int(swe.houses(jd, lat, lon, b'P')[0][9] / 30)],
            "house": 10
        }
    }
    
    aspects = calculate_aspects(planets, angles)
    return {"resolved_location": {"latitude": lat, "longitude": lon, "timezone": timezone}, "planets": planets, "houses": houses, "angles": angles, "aspects": aspects}

def calculate_house(lon, houses):
    return 1

def calculate_aspects(planets, angles):
    return []
