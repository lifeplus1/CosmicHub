import logging
import pytz
import swisseph as swe
from datetime import datetime
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
import os

logger = logging.getLogger(__name__)

# Set ephemeris path for pyswisseph (if needed)
swe.set_ephe_path(os.getenv("EPHE_PATH", "/usr/share/swisseph"))

def calculate_chart(year: int, month: int, day: int, hour: int, minute: int, lat: float = None, lon: float = None, timezone: str = None, city: str = None):
    """
    Calculate astrological chart data based on birth details.
    Args:
        year: Year of birth (e.g., 2000)
        month: Month of birth (1-12)
        day: Day of birth (1-31)
        hour: Hour of birth (0-23)
        minute: Minute of birth (0-59)
        lat: Latitude of birth location (optional if city provided)
        lon: Longitude of birth location (optional if city provided)
        timezone: Timezone name (e.g., 'America/New_York', optional)
        city: City name (e.g., 'New York, NY, USA') for geocoding if lat/lon missing
    Returns:
        dict: Dictionary containing the Julian day and other chart data
    Raises:
        ValueError: If the date, timezone, or coordinates are invalid
    """
    logger.debug(f"Input: year={year}, month={month}, day={day}, hour={hour}, minute={minute}, lat={lat}, lon={lon}, timezone={timezone}, city={city}")
    try:
        # Geocode city if lat/lon not provided
        if city and (lat is None or lon is None):
            geolocator = Nominatim(user_agent="astrology_app")
            location = geolocator.geocode(city)
            if not location:
                raise ValueError(f"Could not geocode city: {city}")
            lat, lon = location.latitude, location.longitude
            logger.debug(f"Geocoded {city} to lat={lat}, lon={lon}")

        # Determine timezone if not provided
        if not timezone and lat is not None and lon is not None:
            tf = TimezoneFinder()
            timezone = tf.timezone_at(lat=lat, lng=lon)
            if not timezone:
                raise ValueError(f"Could not determine timezone for lat={lat}, lon={lon}")
            logger.debug(f"Inferred timezone: {timezone}")
        timezone = timezone or "UTC"

        # Validate and convert to UTC
        tz = pytz.timezone(timezone)
        dt = datetime(year, month, day, hour, minute)
        logger.debug(f"Local datetime: {dt}")
        dt_utc = tz.localize(dt).astimezone(pytz.UTC)
        logger.debug(f"UTC datetime: {dt_utc}")

        # Calculate Julian day
        jd = swe.utc_to_jd(dt_utc.year, dt_utc.month, dt_utc.day, dt_utc.hour, dt_utc.minute, 0, 1)  # Seconds=0
        logger.debug(f"Julian day ET: {jd[0]}, UT: {jd[1]}")
        julian_day = jd[1]  # Use UT for calculations

        # Placeholder for additional calculations
        chart_data = {
            "julian_day": julian_day,
            "latitude": lat,
            "longitude": lon,
            "timezone": timezone
        }

        return chart_data

    except swe.SwissephError as e:
        logger.error(f"SwissephError in Julian day calculation: {str(e)}")
        raise ValueError(f"Invalid date for Julian day calculation: {str(e)}")
    except pytz.exceptions.UnknownTimeZoneError:
        logger.error(f"Invalid timezone: {timezone}")
        raise ValueError(f"Invalid timezone: {timezone}")
    except Exception as e:
        logger.error(f"Error in calculation: {str(e)}")
        raise ValueError(f"Invalid date for Julian day calculation: {str(e)}")

def validate_inputs(year: int, month: int, day: int, hour: int, minute: int, lat: float = None, lon: float = None, timezone: str = None, city: str = None) -> bool:
    """
    Validate input parameters for chart calculation.
    Returns True if valid, raises ValueError otherwise.
    """
    logger.debug(f"Validating: year={year}, month={month}, day={day}, hour={hour}, minute={minute}, lat={lat}, lon={lon}, timezone={timezone}, city={city}")
    try:
        # Validate date
        datetime(year, month, day, hour, minute)
        # Validate lat/lon if provided
        if lat is not None and lon is not None:
            if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                raise ValueError(f"Invalid coordinates: lat={lat}, lon={lon}")
        # Validate timezone if provided
        if timezone:
            pytz.timezone(timezone)
        return True
    except Exception as e:
        logger.error(f"Validation error: {str(e)}")
        raise ValueError(f"Invalid input: {str(e)}")

def get_planetary_positions(julian_day: float) -> dict:
    """
    Calculate planetary positions for a given Julian day.
    Args:
        julian_day: Julian day (UT) for calculations
    Returns:
        dict: Planetary positions (e.g., Sun, Moon)
    """
    try:
        planets = {
            "sun": swe.calc_ut(julian_day, swe.SUN)[0],
            "moon": swe.calc_ut(julian_day, swe.MOON)[0],
            # Add other planets as needed
        }
        logger.debug(f"Planetary positions: {planets}")
        return planets
    except swe.SwissephError as e:
        logger.error(f"Error calculating planetary positions: {str(e)}")
        raise ValueError(f"Error in planetary position calculation: {str(e)}")
