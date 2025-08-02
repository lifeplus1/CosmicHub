import swisseph as swe
import os
import logging

logger = logging.getLogger(__name__)

def init_ephemeris():
    ephe_path = os.getenv("EPHE_PATH", "./ephe")
    if not os.path.exists(ephe_path):
        logger.error(f"Ephemeris path {ephe_path} does not exist")
        raise ValueError(f"Ephemeris path {ephe_path} not found")
    swe.set_ephe_path(ephe_path)
    logger.debug(f"Ephemeris initialized with path: {ephe_path}")

def get_planetary_positions(julian_day: float) -> dict:
    logger.debug(f"Calculating planetary positions for JD: {julian_day}")
    try:
        planets = {
            "sun": {"position": swe.calc_ut(julian_day, swe.SUN)[0][0], "retrograde": swe.calc_ut(julian_day, swe.SUN)[0][3] < 0},
            "moon": {"position": swe.calc_ut(julian_day, swe.MOON)[0][0], "retrograde": swe.calc_ut(julian_day, swe.MOON)[0][3] < 0},
            "mercury": {"position": swe.calc_ut(julian_day, swe.MERCURY)[0][0], "retrograde": swe.calc_ut(julian_day, swe.MERCURY)[0][3] < 0},
            "venus": {"position": swe.calc_ut(julian_day, swe.VENUS)[0][0], "retrograde": swe.calc_ut(julian_day, swe.VENUS)[0][3] < 0},
            "mars": {"position": swe.calc_ut(julian_day, swe.MARS)[0][0], "retrograde": swe.calc_ut(julian_day, swe.MARS)[0][3] < 0},
            "jupiter": {"position": swe.calc_ut(julian_day, swe.JUPITER)[0][0], "retrograde": swe.calc_ut(julian_day, swe.JUPITER)[0][3] < 0},
            "saturn": {"position": swe.calc_ut(julian_day, swe.SATURN)[0][0], "retrograde": swe.calc_ut(julian_day, swe.SATURN)[0][3] < 0},
            "uranus": {"position": swe.calc_ut(julian_day, swe.URANUS)[0][0], "retrograde": swe.calc_ut(julian_day, swe.URANUS)[0][3] < 0},
            "neptune": {"position": swe.calc_ut(julian_day, swe.NEPTUNE)[0][0], "retrograde": swe.calc_ut(julian_day, swe.NEPTUNE)[0][3] < 0},
            "pluto": {"position": swe.calc_ut(julian_day, swe.PLUTO)[0][0], "retrograde": swe.calc_ut(julian_day, swe.PLUTO)[0][3] < 0},
            "chiron": {"position": swe.calc_ut(julian_day, swe.CHIRON)[0][0], "retrograde": swe.calc_ut(julian_day, swe.CHIRON)[0][3] < 0},
            "ceres": {"position": swe.calc_ut(julian_day, swe.CERES)[0][0], "retrograde": swe.calc_ut(julian_day, swe.CERES)[0][3] < 0},
            "pallas": {"position": swe.calc_ut(julian_day, swe.PALLAS)[0][0], "retrograde": swe.calc_ut(julian_day, swe.PALLAS)[0][3] < 0},
            "juno": {"position": swe.calc_ut(julian_day, swe.JUNO)[0][0], "retrograde": swe.calc_ut(julian_day, swe.JUNO)[0][3] < 0},
            "vesta": {"position": swe.calc_ut(julian_day, swe.VESTA)[0][0], "retrograde": swe.calc_ut(julian_day, swe.VESTA)[0][3] < 0},
        }
        logger.debug(f"Planetary positions: {planets}")
        return planets
    except Exception as e:
        logger.error(f"Error in planetary positions: {str(e)}", exc_info=True)
        raise ValueError(f"Error in planetary calculation: {str(e)}")


