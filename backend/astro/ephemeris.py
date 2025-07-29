import swisseph as swe
import os
import logging

logger = logging.getLogger(__name__)

def init_ephemeris():
    ephe_path = os.getenv("EPHE_PATH", "/app/ephe")
    if not os.path.exists(ephe_path):
        logger.error(f"Ephemeris path {ephe_path} does not exist")
        raise ValueError(f"Ephemeris path {ephe_path} not found")
    swe.set_ephe_path(ephe_path)
    logger.debug(f"Ephemeris initialized with path: {ephe_path}")

def get_planetary_positions(julian_day: float) -> dict:
    logger.debug(f"Calculating planetary positions for JD: {julian_day}")
    try:
        planets = {
            "sun": swe.calc_ut(julian_day, swe.SUN)[0][0],
            "moon": swe.calc_ut(julian_day, swe.MOON)[0][0],
            "mercury": swe.calc_ut(julian_day, swe.MERCURY)[0][0],
            "venus": swe.calc_ut(julian_day, swe.VENUS)[0][0],
            "mars": swe.calc_ut(julian_day, swe.MARS)[0][0],
            "jupiter": swe.calc_ut(julian_day, swe.JUPITER)[0][0],
            "saturn": swe.calc_ut(julian_day, swe.SATURN)[0][0]
        }
        logger.debug(f"Planetary positions: {planets}")
        return planets
    except Exception as e:
        logger.error(f"Error in planetary positions: {str(e)}", exc_info=True)
        raise ValueError(f"Error in planetary calculation: {str(e)}")