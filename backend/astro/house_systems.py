import swisseph as swe
import logging

logger = logging.getLogger(__name__)

def calculate_houses(julian_day: float, lat: float, lon: float, system: str = 'P') -> dict:
    logger.debug(f"Calculating houses for JD: {julian_day}, lat: {lat}, lon: {lon}, system: {system}")
    try:
        houses = swe.houses(julian_day, lat, lon, system.encode('ascii'))[0]
        houses_data = [{"house": i+1, "cusp": float(cusp)} for i, cusp in enumerate(houses)]
        angles = {
            "ascendant": float(houses[0]),
            "mc": float(houses[9])
        }
        return {"houses": houses_data, "angles": angles}
    except Exception as e:
        logger.error(f"Error in house calculation: {str(e)}", exc_info=True)
        raise ValueError(f"Error in house calculation: {str(e)}")