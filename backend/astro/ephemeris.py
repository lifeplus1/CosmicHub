import swisseph as swe
import os
import logging

logger = logging.getLogger(__name__)

def init_ephemeris():
    logger.debug("Initializing ephemeris")
    try:
        swe.set_ephe_path(os.getenv('EPHE_PATH', './ephe'))
        logger.debug(f"Ephemeris path set to {os.getenv('EPHE_PATH', './ephe')}")
    except Exception as e:
        logger.error(f"Error initializing ephemeris: {str(e)}", exc_info=True)
        raise ValueError(f"Error initializing ephemeris: {str(e)}")

def get_planetary_positions(julian_day: float) -> dict:
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
        positions = {}
        for name, body in planets.items():
            pos = swe.calc_ut(julian_day, body, swe.FLG_SWIEPH | swe.FLG_SPEED)
            if pos[0][0] < 0:
                logger.error(f"Error calculating position for {name}: {pos[0][0]}")
                raise ValueError(f"Error calculating position for {name}")
            positions[name] = {
                "position": float(pos[0][0]),  # Longitude
                "retrograde": pos[0][3] < 0  # Speed < 0 indicates retrograde
            }
        logger.debug(f"Planetary positions: {positions}")
        return positions
    except Exception as e:
        logger.error(f"Error in planetary positions: {str(e)}", exc_info=True)
        raise ValueError(f"Error in planetary positions: {str(e)}")