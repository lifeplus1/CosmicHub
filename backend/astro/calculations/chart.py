# backend/astro/calculations/chart.py
import logging
from datetime import datetime
from functools import lru_cache
from typing import Any, Dict, Optional

import pytz
import swisseph as swe  # type: ignore
from geopy.exc import GeocoderTimedOut  # type: ignore
from geopy.geocoders import Nominatim  # type: ignore
from timezonefinder import TimezoneFinder  # type: ignore

from .aspects import calculate_aspects
from .ephemeris import get_planetary_positions, init_ephemeris
from .house_systems import calculate_houses
from .mayan import calculate_mayan_astrology
from .uranian import calculate_uranian_astrology

# Type hint for calculate_aspects to suppress partially unknown warning
from .vedic import (
    calculate_vedic_houses,
    calculate_vedic_planets,
    get_vedic_chart_analysis,
)

logger = logging.getLogger(__name__)


def validate_inputs(
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    timezone: Optional[str] = None,
    city: Optional[str] = None,
) -> bool:
    logger.debug(
        f"Validating inputs: year={year}, month={month}, day={day}, hour={hour}, minute={minute}, lat={lat}, lon={lon}, timezone={timezone}, city={city}"  # noqa: E501
    )
    try:
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
def get_location(city: str) -> Dict[str, Any]:
    logger.debug(f"Resolving location for city: {city}")
    try:
        geolocator = Nominatim(user_agent="astrology_app")
        for attempt in range(3):
            try:
                # Explicitly specify arguments for geocode (synchronous)
                location = geolocator.geocode(query=city, exactly_one=True, timeout=10)  # type: ignore  # noqa: E501
                # If geocode returns a coroutine (async), await it
                if location is not None and hasattr(location, "__await__"):  # type: ignore  # noqa: E501
                    import asyncio

                    location = asyncio.get_event_loop().run_until_complete(location)  # type: ignore  # noqa: E501
                if not location:
                    raise ValueError(f"Could not geocode city: {city}")
                lat, lon = float(location.latitude), float(location.longitude)  # type: ignore  # noqa: E501
                tf = TimezoneFinder()
                timezone = tf.timezone_at(lat=lat, lng=lon)  # type: ignore
                if not timezone:
                    raise ValueError(
                        f"Could not determine timezone for {city}"
                    )
                logger.debug(f"Resolved: lat={lat}, lon={lon}, tz={timezone}")
                return {
                    "latitude": lat,
                    "longitude": lon,
                    "timezone": timezone,
                }
            except GeocoderTimedOut:
                logger.warning(
                    f"Geocoding timeout for {city}, attempt {attempt + 1}"
                )
                if attempt == 2:
                    raise ValueError("Geocoding service timed out")
        raise ValueError("Geocoding failed after retries")
    except ValueError as e:
        logger.error(f"Error in get_location: {str(e)}", exc_info=True)
        raise
    except Exception as e:
        logger.error(
            f"Unexpected error in get_location: {str(e)}", exc_info=True
        )
        raise ValueError(f"Error resolving location: {str(e)}")


def calculate_chart(
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    timezone: Optional[str] = None,
    city: Optional[str] = None,
    house_system: str = "P",
) -> Dict[str, Any]:
    logger.debug(
        f"Calculating chart: year={year}, month={month}, day={day}, hour={hour}, minute={minute}, lat={lat}, lon={lon}, timezone={timezone}, city={city}, house_system={house_system}"  # noqa: E501
    )
    try:
        init_ephemeris()
        if city and (lat is None or lon is None):
            logger.debug("Fetching location data for city")
            loc = get_location(city)
            lat, lon = loc["latitude"], loc["longitude"]
            timezone = loc["timezone"] or timezone
        if not lat or not lon:
            logger.error("Latitude and longitude are required")
            raise ValueError("Latitude and longitude are required")
        timezone = timezone or "UTC"
        logger.debug(f"Using timezone: {timezone}")
        tz = pytz.timezone(timezone)
        dt = datetime(year, month, day, hour, minute)
        logger.debug(f"Local datetime: {dt}")
        dt_utc = tz.localize(dt).astimezone(pytz.UTC)
        logger.debug(f"UTC datetime: {dt_utc}")
        jd = swe.utc_to_jd(dt_utc.year, dt_utc.month, dt_utc.day, dt_utc.hour, dt_utc.minute, 0, 1)  # type: ignore  # noqa: E501
        logger.debug(f"Julian day result: status={jd[0]}, julian_day={jd[1]}")
        if jd[0] < 0:
            logger.error(f"Invalid Julian day calculation, status: {jd[0]}")
            raise ValueError(
                f"Invalid Julian day calculation, status: {jd[0]}"
            )
        julian_day_value: float = jd[1]  # type: ignore
        if isinstance(julian_day_value, (list, tuple)):
            julian_day_value = julian_day_value[0]  # type: ignore
        julian_day = float(julian_day_value)  # type: ignore

        planets = get_planetary_positions(julian_day) or {}  # type: ignore
        houses_data = calculate_houses(julian_day, lat, lon, house_system) or {"houses": [], "angles": {}}  # type: ignore  # noqa: E501
        aspects = calculate_aspects(planets) or []  # type: ignore

        chart_data: Dict[str, Any] = {
            "julian_day": float(julian_day),
            "latitude": float(lat),
            "longitude": float(lon),
            "timezone": timezone,
            "planets": {k: {"position": v["position"], "retrograde": v["retrograde"]} for k, v in planets.items()},  # type: ignore  # noqa: E501
            "houses": houses_data["houses"],  # type: ignore
            "angles": {
                "ascendant": float(houses_data["angles"].get("ascendant", 0)),  # type: ignore  # noqa: E501
                "descendant": float((houses_data["angles"].get("ascendant", 0) + 180) % 360),  # type: ignore  # noqa: E501
                "mc": float(houses_data["angles"].get("mc", 0)),  # type: ignore  # noqa: E501
                "ic": float((houses_data["angles"].get("mc", 0) + 180) % 360),  # type: ignore  # noqa: E501
                "vertex": float(houses_data["angles"].get("vertex", 0)),  # type: ignore  # noqa: E501
                "antivertex": float((houses_data["angles"].get("vertex", 0) + 180) % 360),  # type: ignore  # noqa: E501
            },
            "aspects": aspects,  # type: ignore
        }
        logger.debug(f"Chart data: {chart_data}")
        return chart_data
    except ValueError as e:
        logger.error(
            f"Validation error in calculate_chart: {str(e)}", exc_info=True
        )
        raise
    except Exception as e:
        logger.error(
            f"Unexpected error in calculate_chart: {str(e)}", exc_info=True
        )
        raise ValueError(f"Invalid date or calculation: {str(e)}")


def calculate_multi_system_chart(
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    timezone: Optional[str] = None,
    city: Optional[str] = None,
    house_system: str = "P",
) -> Dict[str, Any]:
    """Calculate chart with multiple astrology systems"""
    logger.debug(
        f"Calculating multi-system chart for {year}-{month}-{day} {hour}:{minute}"  # noqa: E501
    )
    try:
        # Base Western tropical chart
        base_chart = calculate_chart(
            year,
            month,
            day,
            hour,
            minute,
            lat,
            lon,
            timezone,
            city,
            house_system,
        )
        julian_day = base_chart["julian_day"]
        planets = base_chart["planets"]
        # Extract validated coordinates from base chart
        validated_lat = base_chart["latitude"]
        validated_lon = base_chart["longitude"]

        # Vedic (Sidereal) astrology
        vedic_data = calculate_vedic_planets(julian_day)  # type: ignore
        vedic_houses = calculate_vedic_houses(julian_day, validated_lat, validated_lon)  # type: ignore  # noqa: E501
        vedic_analysis = get_vedic_chart_analysis({**vedic_data, **vedic_houses})  # type: ignore  # noqa: E501

        # Chinese astrology
        # Chinese astrology
        chinese_data = {}  # Chinese astrology calculation not available
        # Mayan astrology
        mayan_data = calculate_mayan_astrology(year, month, day)  # type: ignore  # noqa: E501

        # Uranian astrology
        uranian_data = calculate_uranian_astrology(julian_day, planets)  # type: ignore  # noqa: E501

        # Combine all systems
        multi_chart: Dict[str, Any] = {
            "birth_info": {
                "date": f"{year}-{month:02d}-{day:02d}",
                "time": f"{hour:02d}:{minute:02d}",
                "location": {
                    "latitude": lat,
                    "longitude": lon,
                    "timezone": timezone,
                },
                "julian_day": julian_day,
            },
            "western_tropical": base_chart,
            "vedic_sidereal": {
                "ayanamsa": vedic_data.get("ayanamsa", 0),  # type: ignore
                "planets": vedic_data.get("planets", {}),  # type: ignore
                "houses": vedic_houses,  # type: ignore
                "analysis": vedic_analysis,  # type: ignore
                "description": "Vedic astrology uses the sidereal zodiac and focuses on karma, dharma, and spiritual evolution",  # noqa: E501
            },
            "chinese": {
                **chinese_data,
                "description": "Chinese astrology calculation not available",
            },
            "mayan": {
                **mayan_data,
                "description": "Mayan astrology using the 260-day sacred calendar (Tzolkin) and Long Count system",  # noqa: E501
            },
            "uranian": {
                **uranian_data,
                "description": "Uranian astrology focuses on transneptunian points, midpoints, and 90-degree dial",  # noqa: E501
            },
            "synthesis": {
                "primary_themes": extract_primary_themes(base_chart, vedic_analysis, chinese_data, mayan_data),  # type: ignore  # noqa: E501
                "life_purpose": synthesize_life_purpose(base_chart, vedic_analysis, chinese_data, mayan_data),  # type: ignore  # noqa: E501
                "personality_integration": integrate_personality_traits(base_chart, vedic_analysis, chinese_data, mayan_data),  # type: ignore  # noqa: E501
                "spiritual_path": synthesize_spiritual_guidance(vedic_analysis, mayan_data, uranian_data),  # type: ignore  # noqa: E501
            },
        }

        logger.debug("Multi-system chart calculation completed")
        return multi_chart

    except Exception as e:
        logger.error(f"Error in multi-system chart calculation: {str(e)}")
        raise ValueError(f"Multi-system calculation failed: {str(e)}")


def extract_primary_themes(western_chart: Dict[str, Any], vedic_analysis: Dict[str, Any], chinese_data: Dict[str, Any], mayan_data: Dict[str, Any]) -> list:  # type: ignore  # noqa: E501
    """Extract primary themes from all astrology systems"""
    themes: list[str] = []  # type: ignore

    # Western themes from sun sign
    if western_chart.get("planets", {}).get("sun"):  # type: ignore
        sun_pos = western_chart["planets"]["sun"]["position"]  # type: ignore
        sun_sign = [
            "Aries",
            "Taurus",
            "Gemini",
            "Cancer",
            "Leo",
            "Virgo",
            "Libra",
            "Scorpio",
            "Sagittarius",
            "Capricorn",
            "Aquarius",
            "Pisces",
        ][int(sun_pos // 30)]
        themes.append(f"Western: {sun_sign} solar expression")

    # Vedic themes
    if vedic_analysis.get("moon_sign"):  # type: ignore
        themes.append(f"Vedic: {vedic_analysis['moon_sign']} moon nature")  # type: ignore  # noqa: E501

    # Chinese themes
    if chinese_data.get("year", {}).get("animal"):  # type: ignore
        themes.append(f"Chinese: {chinese_data['year']['animal']} year energy")  # type: ignore  # noqa: E501

    # Mayan themes
    if mayan_data.get("day_sign", {}).get("name"):  # type: ignore
        themes.append(f"Mayan: {mayan_data['day_sign']['name']} day sign")  # type: ignore  # noqa: E501

    return themes


from typing import List  # noqa: E402


def synthesize_life_purpose(
    western_chart: Dict[str, Any],
    vedic_analysis: Dict[str, Any],
    chinese_data: Dict[str, Any],
    mayan_data: Dict[str, Any],
) -> List[str]:
    """Synthesize life purpose from multiple systems"""
    purpose_elements: List[str] = []

    # Add Western north node if available
    purpose_elements.append(
        "Western: Growth through personal expression and relationships"
    )

    # Vedic purpose
    if vedic_analysis.get("analysis"):
        purpose_elements.append(
            f"Vedic: {vedic_analysis.get('analysis', 'Spiritual growth and karma resolution')}"  # noqa: E501
        )

    # Chinese purpose
    if chinese_data.get("personality_summary"):
        purpose_elements.append(
            f"Chinese: {chinese_data.get('personality_summary', 'Balance of elements and ancestral wisdom')}"  # noqa: E501
        )

    # Mayan purpose
    if mayan_data.get("life_purpose"):
        purpose_elements.append(
            f"Mayan: {mayan_data.get('life_purpose', 'Sacred calendar alignment')}"  # noqa: E501
        )

    return purpose_elements


def integrate_personality_traits(
    western_chart: Dict[str, Any],
    vedic_analysis: Dict[str, Any],
    chinese_data: Dict[str, Any],
    mayan_data: Dict[str, Any],
) -> Dict[str, List[str]]:
    """Integrate personality traits from all systems"""
    traits: Dict[str, List[str]] = {
        "core_nature": [],
        "emotional_patterns": [],
        "social_expression": [],
        "hidden_aspects": [],
    }

    # Western traits from sun and moon
    traits["core_nature"].append("Western: Rational, individualistic approach")

    # Vedic emotional patterns
    if vedic_analysis.get("moon_nakshatra"):
        traits["emotional_patterns"].append(
            f"Vedic: {vedic_analysis['moon_nakshatra']} lunar influence"
        )

    # Chinese social expression
    if chinese_data.get("year", {}).get("traits"):
        traits["social_expression"].append(
            f"Chinese: {chinese_data['year'].get('traits', 'Unknown')}"
        )

    # Mayan hidden aspects
    if mayan_data.get("day_sign", {}).get("traits"):
        traits["hidden_aspects"].append(
            f"Mayan: {mayan_data['day_sign'].get('traits', 'Unknown')}"
        )

    return traits


from typing import List  # noqa: E402


def synthesize_spiritual_guidance(
    vedic_analysis: Dict[str, Any],
    mayan_data: Dict[str, Any],
    uranian_data: Dict[str, Any],
) -> List[str]:
    """Synthesize spiritual guidance from relevant systems"""
    guidance: List[str] = []

    # Vedic spiritual path
    if vedic_analysis.get("moon_nakshatra"):
        guidance.append(
            f"Vedic path: Work with {vedic_analysis['moon_nakshatra']} energy for spiritual growth"  # noqa: E501
        )

    # Mayan spiritual guidance
    if mayan_data.get("spiritual_guidance"):
        guidance.append(
            f"Mayan path: {mayan_data.get('spiritual_guidance', 'Follow sacred calendar timing')}"  # noqa: E501
        )

    # Uranian collective patterns
    if uranian_data.get("pattern_analysis", {}).get("karmic_patterns"):
        karmic = uranian_data["pattern_analysis"].get("karmic_patterns", [])
        if karmic:
            guidance.append(
                f"Uranian insight: {karmic[0] if karmic else 'Work with collective unconscious patterns'}"  # noqa: E501
            )

    return guidance
