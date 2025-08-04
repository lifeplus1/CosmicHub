# backend/astro/calculations/ephemeris.py
import swisseph as swe
import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def init_ephemeris() -> None:
    logger.debug("Initializing ephemeris")
    try:
        swe.set_ephe_path(os.getenv('EPHE_PATH', './ephe'))
        logger.debug(f"Ephemeris path set to {os.getenv('EPHE_PATH', './ephe')}")
    except Exception as e:
        logger.error(f"Error initializing ephemeris: {str(e)}", exc_info=True)
        raise ValueError(f"Error initializing ephemeris: {str(e)}")

def get_planetary_positions(julian_day: float) -> Dict[str, Dict[str, Any]]:
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
        planets = {
            "sun": swe.SUN,
            "moon": swe.MOON,
            "mercury": swe.MERCURY,
            "venus": swe.VENUS,
            "mars": swe.MARS,
            "jupiter": swe.JUPITER,
            "saturn": swe.SATURN,
            "uranus": swe.URANUS,
            "neptune": swe.NEPTUNE,
            "pluto": swe.PLUTO,
            "chiron": swe.CHIRON,
            "ceres": swe.CERES,
            "pallas": swe.PALLAS,
            "juno": swe.JUNO,
            "vesta": swe.VESTA,
        }
        positions: Dict[str, Dict[str, Any]] = {}
        for name, body in planets.items():
            pos = swe.calc_ut(julian_day, body, swe.FLG_SWIEPH | swe.FLG_SPEED)
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