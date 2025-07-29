import logging
import os
import json
from fastapi import FastAPI
from firebase_admin import credentials, initialize_app

logging.basicConfig(level=logging.DEBUG, filename="/app/app.log", format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)

logger.info("Starting FastAPI application")

try:
    firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "/app/firebase-adminsdk.json")
    if os.path.exists(firebase_cred_path):
        logger.info(f"Using Firebase credentials file: {firebase_cred_path}")
        cred = credentials.Certificate(firebase_cred_path)
    else:
        firebase_creds = os.getenv("FIREBASE_CREDENTIALS")
        if not firebase_creds:
            logger.error("FIREBASE_CREDENTIALS or FIREBASE_CREDENTIALS_PATH not set")
            raise ValueError("FIREBASE_CREDENTIALS or FIREBASE_CREDENTIALS_PATH not set")
        try:
            creds_dict = json.loads(firebase_creds)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid FIREBASE_CREDENTIALS format: {str(e)}")
            raise ValueError(f"Invalid FIREBASE_CREDENTIALS JSON: {str(e)}")
        cred = credentials.Certificate(creds_dict)
    initialize_app(cred)
    logger.info("Firebase initialized successfully")
except Exception as e:
    logger.error(f"Firebase initialization failed: {str(e)}", exc_info=True)
    raise

app = FastAPI()
# Rest of main.py unchanged

@app.post("/calculate")
async def calculate(data: BirthData, x_api_key: str = Header(...)):
    logger.info(f"Received /calculate request: {data.dict()}")
    try:
        if x_api_key != os.getenv("API_KEY"):
            logger.error(f"Invalid API key: {x_api_key}")
            raise HTTPException(401, "Invalid API key")
        validate_inputs(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        chart_data["planets"] = get_planetary_positions(chart_data["julian_day"])
        logger.debug(f"Chart calculated: {chart_data}")
        return chart_data
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"Unexpected error in /calculate: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")
