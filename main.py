from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import logging
import os
from backend.astro_calculations import calculate_chart, get_location, validate_inputs, get_planetary_positions

app = FastAPI()
logger = logging.getLogger(__name__)

class BirthData(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    city: str
    timezone: str = None
    lat: float = None
    lon: float = None

@app.post("/calculate")
async def calculate(data: BirthData, x_api_key: str = Header(...)):
    """
    Calculate astrological chart based on birth data.
    """
    logger.debug(f"Received request: {data.dict()}")
    try:
        # Validate API key
        expected_api_key = os.getenv("API_KEY")
        if x_api_key != expected_api_key:
            raise HTTPException(status_code=401, detail="Invalid API key")

        # Validate inputs
        validate_inputs(
            year=data.year,
            month=data.month,
            day=data.day,
            hour=data.hour,
            minute=data.minute,
            lat=data.lat,
            lon=data.lon,
            timezone=data.timezone,
            city=data.city
        )

        # Calculate chart
        chart_data = calculate_chart(
            year=data.year,
            month=data.month,
            day=data.day,
            hour=data.hour,
            minute=data.minute,
            lat=data.lat,
            lon=data.lon,
            timezone=data.timezone,
            city=data.city
        )

        # Optionally get planetary positions
        planets = get_planetary_positions(chart_data["julian_day"])
        chart_data["planets"] = planets

        return chart_data

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
