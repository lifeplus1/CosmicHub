import swisseph as swe
import logging

logger = logging.getLogger(__name__)

def calculate_houses(julian_day: float, lat: float, lon: float, system: str = 'P') -> dict:
    logger.debug(f"Calculating houses for JD: {julian_day}, lat: {lat}, lon: {lon}, system: {system}")
    try:
        # Calculate houses with extended flags for Vertex
        houses_result = swe.houses_ex(julian_day, lat, lon, flags=swe.FLG_SWIEPH | swe.FLG_SPEED, hsys=system.encode('ascii'))
        cusps = houses_result[0]  # House cusps (0-11)
        ascmc = houses_result[1]  # Angles: Ascendant (0), MC (1), Vertex (3), etc.

        houses_data = [{"house": i+1, "cusp": float(cusps[i])} for i in range(12)]
        angles = {
            "ascendant": float(ascmc[0]),
            "mc": float(ascmc[1]),
            "vertex": float(ascmc[3]),  # Vertex
        }
        logger.debug(f"Houses calculated: {houses_data}, Angles: {angles}")
        return {"houses": houses_data, "angles": angles}
    except Exception as e:
        logger.error(f"Error in house calculation: {str(e)}", exc_info=True)
        raise ValueError(f"Error in house calculation: {str(e)}")