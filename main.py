from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import logging
from backend.astro_calculations import calculate_chart, get_location
from backend.database import save_chart, get_charts
from backend.auth import verify_firebase_token
from firebase_admin import credentials, initialize_app
import os

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

try:
    import swisseph as swe
    logger.debug("swisseph imported successfully")
except Exception as e:
    logger.error(f"swisseph import failed: {str(e)}")
    raise

app = FastAPI()

# Firebase initialization
cred_data = os.getenv("FIREBASE_CREDENTIALS")
if cred_data:
    cred = credentials.Certificate(json.loads(cred_data))
    initialize_app(cred)
else:
    logger.warning("FIREBASE_CREDENTIALS not set, skipping Firebase initialization for local development")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://astrology-app-sigma.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load cities
with open('cities.json', 'r') as f:
    cities = json.load(f)

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

# Endpoints
@app.post("/calculate")
async def calculate(request: Request, data: BirthData):
    if request.headers.get('X-API-Key') != os.getenv("API_KEY"):
        raise HTTPException(status_code=403, detail="Invalid API key")
    location = get_location(data.city, cities)
    result = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, location['latitude'], location['longitude'], location['timezone'])
    return result

@app.post("/transits")
async def transits(request: Request, data: TransitData):
    if request.headers.get('X-API-Key') != os.getenv("API_KEY"):
        raise HTTPException(status_code=403, detail="Invalid API key")
    natal_location = get_location(data.natal.city, cities)
    natal = calculate_chart(data.natal.year, data.natal.month, data.natal.day, data.natal.hour, data.natal.minute, natal_location['latitude'], natal_location['longitude'], natal_location['timezone'])
    transit_date = datetime.strptime(data.transit_date, '%Y-%m-%d')
    transit = calculate_chart(transit_date.year, transit_date.month, transit_date.day, 12, 0, natal_location['latitude'], natal_location['longitude'], natal_location['timezone'])
    transit_aspects = calculate_aspects(transit['planets'], natal['planets'])
    return {"natal": natal, "transits": transit['planets'], "transit_aspects": transit_aspects}

@app.post("/save-chart")
async def save_chart_endpoint(request: Request, chart_data: ChartData):
    if not os.getenv("FIREBASE_CREDENTIALS"):
        raise HTTPException(status_code=503, detail="Firebase not initialized for local development")
    uid = await verify_firebase_token(request)
    return save_chart(uid, chart_data.chart_type, chart_data.birth_data, chart_data.chart_data)

@app.get("/get-charts")
async def get_charts_endpoint(request: Request):
    if not os.getenv("FIREBASE_CREDENTIALS"):
        raise HTTPException(status_code=503, detail="Firebase not initialized for local development")
    uid = await verify_firebase_token(request)
    return get_charts(uid)
