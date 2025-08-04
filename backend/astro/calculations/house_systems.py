import swisseph as swe
import logging
from typing import TypedDict, List, Tuple

logger = logging.getLogger(__name__)

class HouseData(TypedDict):
    house: int
    cusp: float

class AnglesData(TypedDict):
    ascendant: float
    mc: float
    vertex: float

class HousesResult(TypedDict):
    houses: List[HouseData]
    angles: AnglesData

def calculate_houses(julian_day: float, lat: float, lon: float, system: str = 'P') -> HousesResult:
    logger.debug(f"Calculating houses for JD: {julian_day}, lat: {lat}, lon: {lon}, system: {system}")
    try:
        # Calculate houses with extended flags for Vertex
        houses_result: Tuple[List[float], List[float]] = swe.houses_ex(julian_day, lat, lon, flags=0, hsys=system.encode('ascii'))
        from typing import cast
        cusps: List[float] = list(cast(List[float], houses_result[0]))  # House cusps (0-11)
        ascmc: list[float] = list(houses_result[1])  # Angles: Ascendant (0), MC (1), Vertex (3), etc.

        houses_data: List[HouseData] = [{"house": i+1, "cusp": float(cusps[i])} for i in range(12)]
        angles: AnglesData = {
            "ascendant": float(ascmc[0]),
            "mc": float(ascmc[1]),
            "vertex": float(ascmc[3]),  # Vertex
        }
        logger.debug(f"Houses calculated: {houses_data}, Angles: {angles}")
        return {"houses": houses_data, "angles": angles}
    except Exception as e:
        logger.error(f"Error in house calculation: {str(e)}", exc_info=True)
        raise ValueError(f"Error in house calculation: {str(e)}")