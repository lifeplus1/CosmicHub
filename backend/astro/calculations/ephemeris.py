# backend/astro/calculations/ephemeris.py
import swisseph as swe  # type: ignore
import os
import logging
from typing import Dict, TypedDict, Final, Any

logger = logging.getLogger(__name__)

# Type-safe constants for planetary bodies
# Define with known integer values to avoid type errors
SUN: Final[int] = 0
MOON: Final[int] = 1  
MERCURY: Final[int] = 2
VENUS: Final[int] = 3
MARS: Final[int] = 4
JUPITER: Final[int] = 5
SATURN: Final[int] = 6
URANUS: Final[int] = 7
NEPTUNE: Final[int] = 8
PLUTO: Final[int] = 9
CHIRON: Final[int] = 15
CERES: Final[int] = 17
PALLAS: Final[int] = 18
JUNO: Final[int] = 19
VESTA: Final[int] = 20

class PlanetPosition(TypedDict):
    position: float
    retrograde: bool

def init_ephemeris() -> None:
    logger.debug("Initializing ephemeris")
    try:
        set_ephe_path = getattr(swe, 'set_ephe_path')
        set_ephe_path(os.getenv('EPHE_PATH', './ephe'))
        logger.debug(f"Ephemeris path set to {os.getenv('EPHE_PATH', './ephe')}")
    except Exception as e:
        logger.error(f"Error initializing ephemeris: {str(e)}", exc_info=True)
        raise ValueError(f"Error initializing ephemeris: {str(e)}")

def get_planetary_positions(julian_day: float) -> Dict[str, PlanetPosition]:
    """
    Calculate planetary positions for given Julian Day.
    
    Args:
        julian_day: Julian Day Number as float
        
    Returns:
        Dictionary with planet names as keys and position data as values.
        Each planet entry contains 'position' (degrees) and 'retrograde' (boolean).
    """
    logger.debug(f"Calculating planetary positions for JD: {julian_day}")
    try:
        planets: Dict[str, int] = {
            "sun": SUN,
            "moon": MOON,
            "mercury": MERCURY,
            "venus": VENUS,
            "mars": MARS,
            "jupiter": JUPITER,
            "saturn": SATURN,
            "uranus": URANUS,
            "neptune": NEPTUNE,
            "pluto": PLUTO,
            "chiron": CHIRON,
            "ceres": CERES,
            "pallas": PALLAS,
            "juno": JUNO,
            "vesta": VESTA,
        }
        positions: Dict[str, PlanetPosition] = {}
        
        # Get calc_ut and flags from swe module safely
        calc_ut = getattr(swe, 'calc_ut')
        flg_swieph = getattr(swe, 'FLG_SWIEPH', 2)
        flg_speed = getattr(swe, 'FLG_SPEED', 256)
        
        for name, body in planets.items():
            pos: Any = calc_ut(julian_day, body, flg_swieph | flg_speed)
            if pos[0][0] < 0:
                logger.error(f"Error calculating position for {name}: {pos[0][0]}")
                raise ValueError(f"Error calculating position for {name}")
            positions[name] = {
                "position": float(pos[0][0]),
                "retrograde": bool(pos[0][3] < 0)
            }
        logger.debug(f"Planetary positions: {positions}")
        return positions
    except Exception as e:
        logger.error(f"Error in planetary positions: {str(e)}", exc_info=True)
        return {}  # Fallback to empty dict