from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import os
from firebase_admin import credentials, auth, initialize_app
import pyswisseph as swe
from datetime import datetime
import pytz
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
import json

app = FastAPI()

# Firebase initialization
cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIALS_PATH", "astrology-app-9c2e9-firebase-adminsdk.json"))
initialize_app(cred)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://astrology-app-sigma.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load cities
with open('cities.json', 'r') as f:
    cities = json.load(f)

# Middleware to verify Firebase token
async def verify_firebase_token(request: Request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    id_token = auth_header.split('Bearer ')[1]
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token['uid']
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# Pydantic models
class BirthData(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    city: str

class TransitData(BaseModel):
    natal: BirthData
    transit_date: str

class ChartData(BaseModel):
    chart_type: str
    birth_data: dict
    chart_data: dict

# Helper functions (assumed from your existing main.py)
def get_location(city):
    if city in cities:
        return cities[city]
    geolocator = Nominatim(user_agent="astrology_app")
    location = geolocator.geocode(city)
    if not location:
        raise HTTPException(status_code=400, detail="City not found")
    tf = TimezoneFinder()
    timezone = tf.timezone_at(lat=location.latitude, lng=location.longitude)
    if not timezone:
        raise HTTPException(status_code=400, detail="Timezone not found")
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
    
    planets = {}
    for i, name in enumerate(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node', 'South Node']):
        lon, _ = swe.calc_ut(jd, i)[:2]
        sign = signs[int(lon / 30)]
        house = calculate_house(lon, houses)  # Assumed function
        retrograde = swe.calc_ut(jd, i)[3] < 0
        planets[name] = {
            "position": f"{int(lon % 30)}°{sign}{int((lon % 30 - int(lon % 30)) * 60)}'",
            "sign": sign,
            "house": house,
            "retrograde": retrograde,
            "lon": lon
        }
    
    houses = []
    for i in range(12):
        cusp = swe.houses(jd, lat, lon, b'P')[0][i]
        houses.append({
            "house": i + 1,
            "cusp": f"{int(cusp % 30)}°{signs[int(cusp / 30)]}{int((cusp % 30 - int(cusp % 30)) * 60)}'",
            "sign": signs[int(cusp / 30)]
        })
    
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
    
    aspects = calculate_aspects(planets, angles)  # Assumed function
    return {"resolved_location": {"city": city, "latitude": lat, "longitude": lon, "timezone": timezone}, "planets": planets, "houses": houses, "angles": angles, "aspects": aspects}

# Placeholder for calculate_house and calculate_aspects (replace with your actual implementations)
def calculate_house(lon, houses):
    # Your existing house calculation logic
    return 1

def calculate_aspects(planets, angles):
    # Your existing aspect calculation logic
    return []

# Endpoints
@app.post("/calculate")
async def calculate(request: Request, data: BirthData):
    if request.headers.get('X-API-Key') != os.getenv("API_KEY"):
        raise HTTPException(status_code=403, detail="Invalid API key")
    location = get_location(data.city)
    result = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, location['latitude'], location['longitude'], location['timezone'])
    return result

@app.post("/transits")
async def transits(request: Request, data: TransitData):
    if request.headers.get('X-API-Key') != os.getenv("API_KEY"):
        raise HTTPException(status_code=403, detail="Invalid API key")
    natal_location = get_location(data.natal.city)
    natal = calculate_chart(data.natal.year, data.natal.month, data.natal.day, data.natal.hour, data.natal.minute, natal_location['latitude'], natal_location['longitude'], natal_location['timezone'])
    transit_date = datetime.strptime(data.transit_date, '%Y-%m-%d')
    transit = calculate_chart(transit_date.year, transit_date.month, transit_date.day, 12, 0, natal_location['latitude'], natal_location['longitude'], natal_location['timezone'])
    transit_aspects = calculate_aspects(transit['planets'], natal['planets'])
    return {"natal": natal, "transits": transit['planets'], "transit_aspects": transit_aspects}

@app.post("/save-chart")
async def save_chart(request: Request, chart_data: ChartData):
    uid = await verify_firebase_token(request)
    chart_type = chart_data.chart_type
    birth_data = chart_data.birth_data
    chart_data = chart_data.chart_data
    
    conn = sqlite3.connect('charts.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS charts 
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, type TEXT, birth_data TEXT, chart_data TEXT, created_at TIMESTAMP)''')
    cursor.execute('INSERT INTO charts (user_id, type, birth_data, chart_data, created_at) VALUES (?, ?, ?, ?, ?)',
                   (uid, chart_type, json.dumps(birth_data), json.dumps(chart_data), datetime.now()))
    conn.commit()
    conn.close()
    return {"message": "Chart saved successfully"}

@app.get("/get-charts")
async def get_charts(request: Request):
    uid = await verify_firebase_token(request)
    conn = sqlite3.connect('charts.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, type, birth_data, chart_data, created_at FROM charts WHERE user_id = ?', (uid,))
    charts = cursor.fetchall()
    conn.close()
    return [{"id": c[0], "type": c[1], "birth_data": json.loads(c[2]), "chart_data": json.loads(c[3]), "created_at": c[4]} for c in charts]
