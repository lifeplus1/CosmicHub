import swisseph as swe
import logging

logger = logging.getLogger(__name__)

def calculate_houses(julian_day: float, lat: float, lon: float, system: str = 'P') -> dict:
    logger.debug(f"Calculating houses for JD: {julian_day}, lat: {lat}, lon: {lon}, system: {system}")
    try:
        houses_result = swe.houses_ex(julian_day, lat, lon, system.encode('ascii'), swe.FLG_VERTEX)
        houses = houses_result[0]
        angles = houses_result[1]
        houses_data = [{"house": i+1, "cusp": float(cusp)} for i, cusp in enumerate(houses)]
        return {
            "houses": houses_data,
            "angles": {
                "ascendant": float(angles[0]),
                "mc": float(angles[1]),
            },
            "vertex": float(angles[8]),  # Vertex from houses_ex
        }
    except Exception as e:
        logger.error(f"Error in house calculation: {str(e)}", exc_info=True)
        raise ValueError(f"Error in house calculation: {str(e)}")