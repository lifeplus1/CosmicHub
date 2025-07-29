# In backend/main.py (partial update)
from backend.astro_calculations import calculate_chart, get_location, validate_inputs
from backend.astro.personality import get_personality_traits
from backend.astro.ephemeris import get_planetary_positions

@app.post("/calculate")
async def calculate(data: BirthData, x_api_key: str = Header(...), house_system: str = Query("P", enum=["P", "E"])):
    logger.debug(f"Received data: {data.dict()}, API Key: {x_api_key}, House System: {house_system}")
    try:
        expected_key = os.getenv("API_KEY")
        logger.debug(f"Expected API Key: {expected_key}")
        if x_api_key != expected_key:
            logger.error(f"Invalid API key: {x_api_key}")
            raise HTTPException(401, "Invalid API key")
        logger.debug("Starting input validation")
        validate_inputs(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        logger.debug("Input validation passed, calculating chart")
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city, house_system)
        logger.debug(f"Chart calculated: {chart_data}")
        return chart_data
    except ValueError as e:
        logger.error(f"Validation error in /calculate: {str(e)}")
        raise HTTPException(400, f"Invalid input: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in /calculate: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/analyze-personality")
async def analyze_personality(data: BirthData, uid: str = Depends(verify_firebase_token)):
    try:
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        personality = get_personality_traits(chart_data)
        return personality
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"Error analyzing personality: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")