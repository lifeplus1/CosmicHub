import logging
from typing import List, TypedDict

import swisseph as swe

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


def calculate_houses(
    julian_day: float, lat: float, lon: float, system: str = "P"
) -> HousesResult:
    logger.debug(
        f"Calculating houses for JD: {julian_day}, lat: {lat}, lon: {lon}, system: {system}"  # noqa: E501
    )

    # Map house system names to bytes literals
    house_system_map = {
        "placidus": b"P",
        "koch": b"K",
        "equal": b"E",
        "whole": b"W",
        "campanus": b"C",
        "regiomontanus": b"R",
        "topocentric": b"T",
    }

    # Convert system name to bytes if needed
    if len(system) > 1:
        system_bytes = house_system_map.get(
            system.lower(), b"P"
        )  # Default to Placidus
    else:
        system_bytes = system.upper().encode("ascii")[:1]

    try:
        # Calculate houses with extended flags for Vertex
        logger.debug(
            f"Using house system bytes: {system_bytes}, type: {type(system_bytes)}, length: {len(system_bytes)}"  # noqa: E501
        )
        houses_result = swe.houses_ex(julian_day, lat, lon, flags=0, hsys=system_bytes)  # type: ignore  # noqa: E501

        # Extract cusps and angles with proper type annotations
        # Swiss Ephemeris returns a tuple of (cusps, ascmc) where both are sequences of floats  # noqa: E501
        cusps: List[float] = list(houses_result[0])  # type: ignore  # House cusps (0-11)  # noqa: E501
        ascmc: List[float] = list(houses_result[1])  # type: ignore  # Angles: Ascendant (0), MC (1), Vertex (3), etc.  # noqa: E501

        houses_data: List[HouseData] = [
            {"house": i + 1, "cusp": float(cusps[i])} for i in range(12)
        ]
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
