import logging
import os
import json
from fastapi import FastAPI, HTTPException, Header
from firebase_admin import credentials, auth, initialize_app

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.info("Starting FastAPI application")

firebase_creds = os.getenv("FIREBASE_CREDENTIALS")
if not firebase_creds:
    logger.error("FIREBASE_CREDENTIALS environment variable is not set")
    raise ValueError("FIREBASE_CREDENTIALS not set")
try:
    creds_dict = json.loads(firebase_creds)
except json.JSONDecodeError as e:
    logger.error(f"Invalid FIREBASE_CREDENTIALS format: {str(e)}")
    raise ValueError("Invalid FIREBASE_CREDENTIALS JSON")
cred = credentials.Certificate(creds_dict)
initialize_app(cred)

app = FastAPI()

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
