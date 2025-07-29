import logging
import pytz
import swisseph as swe
from datetime import datetime
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
import os

logger = logging.getLogger(__name__)

swe.set_ephe_path(os.getenv("EPHE_PATH", "/usr/share/swisseph"))

def get_location(city: str) -> dict:
    logger.debug(f"Resolving location for city: {city}")
    try:
        geolocator = Nominatim(user_agent="astrology_app")
        location = geolocator.geocode(city)
        if not location:
            raise ValueError(f"Could not geocode city: {city}")
        lat, lon = location.latitude, location.longitude
        tf = TimezoneFinder()
        timezone = tf.timezone_at(lat=lat, lng=lon)
        if not timezone:
            raise ValueError(f"Could not determine timezone for {city}")
        return {"latitude": lat, "longitude": lon, "timezone": timezone}
    except Exception as e:
        logger.error(f"Error in get_location: {str(e)}")
        raise ValueError(f"Error resolving location: {str(e)}")

def calculate_chart(year: int, month: int, day: int, hour: int, minute: int, lat: float = None, lon: float = None, timezone: str = None, city: str = None):
    logger.debug(f"Input: year={year}, month={month}, day={day}, hour={hour}, minute={minute}, lat={lat}, lon={lon}, timezone={timezone}, city={city}")
    try:
        if city and (lat is None or lon is None):
            loc = get_location(city)
            lat, lon, timezone = loc["latitude"], loc["longitude"], loc["timezone"] or timezone
        timezone = timezone or "UTC"
        tz = pytz.timezone(timezone)
        dt = datetime(year, month, day, hour, minute)
        logger.debug(f"Local datetime: {dt}")
        dt_utc = tz.localize(dt).astimezone(pytz.UTC)
        logger.debug(f"UTC datetime: {dt_utc}")
        jd = swe.utc_to_jd(dt_utc.year, dt_utc.month, dt_utc.day, dt_utc.hour, dt_utc.minute, 0, 1)
        logger.debug(f"Julian day ET: {jd[0]}, UT: {jd[1]}")
        julian_day = jd[1]

        # Calculate houses
        houses = swe.houses(julian_day, lat, lon, b'P')[0]  # Placidus system
        houses_data = [{"house": i+1, "cusp": cusp} for i, cusp in enumerate(houses)]

        # Calculate angles (ASC, MC)
        angles = {
            "ascendant": houses[0],  # House 1 cusp
            "mc": houses[9]         # House 10 cusp
        }

        # Calculate aspects (simplified example)
        planets = get_planetary_positions(julian_day)
        aspects = []
        for p1, pos1 in planets.items():
            for p2, pos2 in planets.items():
                if p1 < p2:
                    diff = abs(pos1 - pos2)
                    if diff > 180:
                        diff = 360 - diff
                    if 0 <= diff <= 2:  # Conjunction
                        aspects.append({"point1": p1, "point2": p2, "aspect": "conjunction", "orb": diff})
                    elif 178 <= diff <= 182:  # Opposition
                        aspects.append({"point1": p1, "point2": p2, "aspect": "opposition", "orb": abs(180 - diff)})

        chart_data = {
            "julian_day": julian_day,
            "latitude": lat,
            "longitude": lon,
            "timezone": timezone,
            "planets": planets,
            "houses": houses_data,
            "angles": angles,
            "aspects": aspects
        }
        return chart_data
    except swe.SwissephError as e:
        logger.error(f"SwissephError: {str(e)}")
        raise ValueError(f"Invalid date: {str(e)}")
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise ValueError(f"Invalid date: {str(e)}")

def validate_inputs(year: int, month: int, day: int, hour: int, minute: int, lat: float = None, lon: float = None, timezone: str = None, city: str = None) -> bool:
    logger.debug(f"Validating: year={year}, month={month}, day={day}, hour={hour}, minute={minute}, lat={lat}, lon={lon}, timezone={timezone}, city={city}")
    try:
        datetime(year, month, day, hour, minute)
        if lat is not None and lon is not None:
            if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                raise ValueError(f"Invalid coordinates: lat={lat}, lon={lon}")
        if timezone:
            pytz.timezone(timezone)
        return True
    except Exception as e:
        logger.error(f"Validation error: {str(e)}")
        raise ValueError(f"Invalid input: {str(e)}")

def get_planetary_positions(julian_day: float) -> dict:
    logger.debug(f"Calculating planetary positions for JD: {julian_day}")
    try:
        planets = {
            "sun": swe.calc_ut(julian_day, swe.SUN)[0],
            "moon": swe.calc_ut(julian_day, swe.MOON)[0],
            "mercury": swe.calc_ut(julian_day, swe.MERCURY)[0],
            "venus": swe.calc_ut(julian_day, swe.VENUS)[0],
            "mars": swe.calc_ut(julian_day, swe.MARS)[0],
            "jupiter": swe.calc_ut(julian_day, swe.JUPITER)[0],
            "saturn": swe.calc_ut(julian_day, swe.SATURN)[0]
        }
        logger.debug(f"Planetary positions: {planets}")
        return planets
    except swe.SwissephError as e:
        logger.error(f"Error in planetary positions: {str(e)}")
        raise ValueError(f"Error in planetary calculation: {str(e)}")
