# In astro_calculations.py
from datetime import datetime
import pytz
import swisseph as swe
import logging
from geopy.exc import GeocoderTimedOut
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
from functools import lru_cache

logger = logging.getLogger(__name__)

def validate_inputs(year: int, month: int, day: int, hour: int, minute: int, lat: float = None, lon: float = None, timezone: str = None, city: str = None) -> bool:
    logger.debug(f"Validating inputs: year={year}, month={month}, day={day}, hour={hour}, minute={minute}, lat={lat}, lon={lon}, timezone={timezone}, city={city}")
    try:
        # Validate date
        if not (1900 <= year <= 2100):
            logger.error(f"Year {year} outside valid range (1900-2100)")
            raise ValueError(f"Year {year} must be between 1900 and 2100")
        if not (1 <= month <= 12):
            logger.error(f"Invalid month: {month}")
            raise ValueError(f"Month {month} must be between 1 and 12")
        if not (1 <= day <= 31):
            logger.error(f"Invalid day: {day}")
            raise ValueError(f"Day {day} must be between 1 and 31")
        if not (0 <= hour <= 23):
            logger.error(f"Invalid hour: {hour}")
            raise ValueError(f"Hour {hour} must be between 0 and 23")
        if not (0 <= minute <= 59):
            logger.error(f"Invalid minute: {minute}")
            raise ValueError(f"Minute {minute} must be between 0 and 59")
        try:
            datetime(year, month, day, hour, minute)
        except ValueError as e:
            logger.error(f"Invalid date combination: {str(e)}")
            raise ValueError(f"Invalid date: {str(e)}")
        if lat is not None and not (-90 <= lat <= 90):
            logger.error(f"Invalid latitude: {lat}")
            raise ValueError(f"Latitude {lat} must be between -90 and 90")
        if lon is not None and not (-180 <= lon <= 180):
            logger.error(f"Invalid longitude: {lon}")
            raise ValueError(f"Longitude {lon} must be between -180 and 180")
        if timezone:
            try:
                pytz.timezone(timezone)
            except pytz.exceptions.UnknownTimeZoneError:
                logger.error(f"Invalid timezone: {timezone}")
                raise ValueError(f"Invalid timezone: {timezone}")
        if not city:
            logger.error("City is required")
            raise ValueError("City is required")
        logger.debug("Input validation successful")
        return True
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Unexpected validation error: {str(e)}", exc_info=True)
        raise ValueError(f"Unexpected validation error: {str(e)}")

@lru_cache(maxsize=1000)
def get_location(city: str) -> dict:
    logger.debug(f"Resolving location for city: {city}")
    try:
        geolocator = Nominatim(user_agent="astrology_app", timeout=5)
        for attempt in range(3):
            try:
                location = geolocator.geocode(city, timeout=5)
                if not location:
                    raise ValueError(f"Could not geocode city: {city}")
                lat, lon = location.latitude, location.longitude
                tf = TimezoneFinder()
                timezone = tf.timezone_at(lat=lat, lng=lon)
                if not timezone:
                    raise ValueError(f"Could not determine timezone for {city}")
                logger.debug(f"Resolved: lat={lat}, lon={lon}, tz={timezone}")
                return {"latitude": lat, "longitude": lon, "timezone": timezone}
            except GeocoderTimedOut:
                logger.warning(f"Geocoding timeout for {city}, attempt {attempt + 1}")
                if attempt == 2:
                    raise ValueError("Geocoding service timed out")
    except Exception as e:
        logger.error(f"Error in get_location: {str(e)}", exc_info=True)
        raise ValueError(f"Error resolving location: {str(e)}")

def calculate_chart(year: int, month: int, day: int, hour: int, minute: int, lat: float = None, lon: float = None, timezone: str = None, city: str = None):
    logger.debug(f"Calculating chart: year={year}, month={month}, day={day}, hour={hour}, minute={minute}, lat={lat}, lon={lon}, timezone={timezone}, city={city}")
    try:
        ephe_path = os.getenv("EPHE_PATH", "/app/ephe")
        if not os.path.exists(ephe_path):
            logger.error(f"Ephemeris path {ephe_path} does not exist")
            raise ValueError(f"Ephemeris path {ephe_path} not found")
        swe.set_ephe_path(ephe_path)

        if city and (lat is None or lon is None):
            logger.debug("Fetching location data for city")
            loc = get_location(city)
            lat, lon = loc["latitude"], loc["longitude"]
            timezone = loc["timezone"] or timezone
        timezone = timezone or "UTC"
        logger.debug(f"Using timezone: {timezone}")
        tz = pytz.timezone(timezone)
        dt = datetime(year, month, day, hour, minute)
        logger.debug(f"Local datetime: {dt}")
        dt_utc = tz.localize(dt).astimezone(pytz.UTC)
        logger.debug(f"UTC datetime: {dt_utc}")
        jd = swe.utc_to_jd(dt_utc.year, dt_utc.month, dt_utc.day, dt_utc.hour, dt_utc.minute, 0, 1)
        logger.debug(f"Julian day result: {jd}")
        if jd[0] != 0:
            logger.error(f"Invalid Julian day calculation, status: {jd[0]}")
            raise ValueError(f"Invalid Julian day calculation, status: {jd[0]}")
        julian_day = jd[1]

        # Calculate houses
        houses = swe.houses(julian_day, lat, lon, b'P')[0]
        houses_data = [{"house": i+1, "cusp": float(cusp)} for i, cusp in enumerate(houses)]

        # Calculate angles
        angles = {
            "ascendant": float(houses[0]),
            "mc": float(houses[9])
        }

        # Calculate aspects
        planets = get_planetary_positions(julian_day)
        aspects = []
        for p1, pos1 in planets.items():
            for p2, pos2 in planets.items():
                if p1 < p2:
                    diff = abs(pos1 - pos2)
                    if diff > 180:
                        diff = 360 - diff
                    if 0 <= diff <= 2:
                        aspects.append({"point1": p1, "point2": p2, "aspect": "conjunction", "orb": float(diff)})
                    elif 178 <= diff <= 182:
                        aspects.append({"point1": p1, "point2": p2, "aspect": "opposition", "orb": float(abs(180 - diff))})

        chart_data = {
            "julian_day": float(julian_day),
            "latitude": float(lat),
            "longitude": float(lon),
            "timezone": timezone,
            "planets": {k: float(v[0]) if isinstance(v, tuple) else float(v) for k, v in planets.items()},
            "houses": houses_data,
            "angles": angles,
            "aspects": aspects
        }
        logger.debug(f"Chart data: {chart_data}")
        return chart_data
    except ValueError as e:
        logger.error(f"Validation error in calculate_chart: {str(e)}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Unexpected error in calculate_chart: {str(e)}", exc_info=True)
        raise ValueError(f"Invalid date or calculation: {str(e)}")