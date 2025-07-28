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
import sys
from dotenv import load_dotenv

load_dotenv()

# Configure logging with fallback to stdout
log_file = os.getenv("LOG_FILE")
if log_file:
    logging.basicConfig(
        level=logging.DEBUG,
        filename=log_file,
        filemode='a',
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
else:
    logging.basicConfig(
        level=logging.DEBUG,
        stream=sys.stdout,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
logger = logging.getLogger(__name__)

logger.debug("Starting application initialization...")

try:
    import swisseph as swe
    logger.debug(f"swisseph imported successfully, version: {swe.__version__}")
except Exception as e:
    logger.error(f"swisseph import failed: {str(e)}")
    raise

app = FastAPI()

logger.debug("FastAPI app initialized")

# Debug root endpoint
@app.get("/")
async def root():
    logger.debug("Root endpoint accessed")
    return {"message": "FastAPI is running"}

# Firebase initialization
cred_data = os.getenv("FIREBASE_CREDENTIALS")
if cred_data:
    try:
        cred = credentials.Certificate(json.loads(cred_data))
        initialize_app(cred)
        logger.debug("Firebase initialized successfully")
    except Exception as e:
        logger.error(f"Firebase initialization failed: {str(e)}")
        raise
else:
    logger.warning("FIREBASE_CREDENTIALS not set, skipping Firebase initialization")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://astrology-app-sigma.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.debug("CORS middleware configured")

# Load cities
try:
    with open('cities.json', 'r') as f:
        cities = json.load(f)
    logger.debug("cities.json loaded successfully")
except Exception as e:
    logger.error(f"Failed to load cities.json: {str(e)}")
    raise

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

logger.debug("Pydantic models defined")

# Endpoints
@app.post("/calculate")
async def calculate(request: Request, data: BirthData):
    logger.debug(f"Calculate endpoint called with data: {data}")
    if request.headers.get('X-API-Key') != os.getenv("API_KEY"):
        logger.error("Invalid API key provided")
        raise HTTPException(status_code=403, detail="Invalid API key")
    try:
        location = get_location(data.city, cities)
        result = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, location['latitude'], location['longitude'], location['timezone'])
        logger.debug("Calculate endpoint executed successfully")
        return result
    except Exception as e:
        logger.error(f"Calculate endpoint failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transits")
async def transits(request: Request, data: TransitData):
    logger.debug(f"Transits endpoint called with data: {data}")
    if request.headers.get('X-API-Key') != os.getenv("API_KEY"):
        logger.error("Invalid API key provided")
        raise HTTPException(status_code=403, detail="Invalid API key")
    try:
        natal_location = get_location(data.natal.city, cities)
        natal = calculate_chart(data.natal.year, data.natal.month, data.natal.day, data.natal.hour, data.natal.minute, natal_location['latitude'], natal_location['longitude'], natal_location['timezone'])
        transit_date = datetime.strptime(data.transit_date, '%Y-%m-%d')
        transit = calculate_chart(transit_date.year, transit_date.month, transit_date.day, 12, 0, natal_location['latitude'], natal_location['longitude'], natal_location['timezone'])
        transit_aspects = calculate_aspects(transit['planets'], natal['planets'])
        logger.debug("Transits endpoint executed successfully")
        return {"natal": natal, "transits": transit['planets'], "transit_aspects": transit_aspects}
    except Exception as e:
        logger.error(f"Transits endpoint failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-chart")
async def save_chart_endpoint(request: Request, chart_data: ChartData):
    logger.debug(f"Save-chart endpoint called with data: {chart_data}")
    if not os.getenv("FIREBASE_CREDENTIALS"):
        logger.error("Firebase not initialized")
        raise HTTPException(status_code=503, detail="Firebase not initialized")
    try:
        uid = await verify_firebase_token(request)
        result = save_chart(uid, chart_data.chart_type, chart_data.birth_data, chart_data.chart_data)
        logger.debug("Save-chart endpoint executed successfully")
        return result
    except Exception as e:
        logger.error(f"Save-chart endpoint failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-charts")
async def get_charts_endpoint(request: Request):
    logger.debug("Get-charts endpoint called")
    if not os.getenv("FIREBASE_CREDENTIALS"):
        logger.error("Firebase not initialized")
        raise HTTPException(status_code=503, detail="Firebase not initialized")
    try:
        uid = await verify_firebase_token(request)
        result = get_charts(uid)
        logger.debug("Get-charts endpoint executed successfully")
        return result
    except Exception as e:
        logger.error(f"Get-charts endpoint failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

logger.debug("Application initialization complete")
