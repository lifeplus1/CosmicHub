# backend/astro/calculations/chart.py
import logging
from datetime import datetime
from functools import lru_cache
from typing import Any, Dict, Optional, List, Tuple

import pytz
import swisseph as swe  # type: ignore
from geopy.exc import GeocoderTimedOut  # type: ignore
from geopy.geocoders import Nominatim  # type: ignore
from timezonefinder import TimezoneFinder
from pydantic import BaseModel, Field, validator

from .aspects import calculate_aspects
from .ephemeris import get_planetary_positions, init_ephemeris, PlanetPosition
from .house_systems import calculate_houses, HousesResult
from .mayan import calculate_mayan_astrology
from .uranian import calculate_uranian_astrology

# Type hint for calculate_aspects to suppress partially unknown warning
from .vedic import (
    calculate_vedic_houses,
    calculate_vedic_planets,
    get_vedic_chart_analysis,
)

logger = logging.getLogger(__name__)

# Constants
YEAR_MIN = 1900
YEAR_MAX = 2100
LOCATION_CACHE_SIZE = 1000
ASTEROID_NAMES = [
    'chiron', 'ceres', 'pallas', 'juno', 'vesta', 'hygiea', 
    'eros', 'psyche', 'fortuna', 'sedna', 'eris'
]
POINT_NAMES = [
    'north_node', 'south_node', 'lilith_mean', 'lilith_true', 
    'vertex', 'antivertex'
]
ZODIAC_SIGNS = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
]

# Custom exceptions
class ChartCalculationError(Exception):
    """Custom exception for chart calculation errors"""
    pass

class LocationError(Exception):
    """Custom exception for location resolution errors"""
    pass


# Pydantic models for better type safety
class ChartInput(BaseModel):
    """Input validation model for chart calculations"""
    year: int = Field(..., ge=YEAR_MIN, le=YEAR_MAX, description="Birth year")
    month: int = Field(..., ge=1, le=12, description="Birth month")
    day: int = Field(..., ge=1, le=31, description="Birth day")
    hour: int = Field(..., ge=0, le=23, description="Birth hour")
    minute: int = Field(..., ge=0, le=59, description="Birth minute")
    lat: Optional[float] = Field(None, ge=-90, le=90, description="Latitude")
    lon: Optional[float] = Field(None, ge=-180, le=180, description="Longitude")
    timezone: Optional[str] = Field(None, description="Timezone string")
    city: Optional[str] = Field(None, min_length=1, max_length=100, description="City name")
    house_system: str = Field("P", description="House system code")
    
    @validator('day')
    def validate_date(cls, v: int, values: Dict[str, Any]) -> int:
        """Validate that the date is actually valid"""
        try:
            if 'year' in values and 'month' in values:
                datetime(values['year'], values['month'], v)
        except ValueError as e:
            raise ValueError(f"Invalid date: {e}")
        return v
    
    @validator('timezone')
    def validate_timezone(cls, v: Optional[str]) -> Optional[str]:
        """Validate timezone string"""
        if v:
            try:
                pytz.timezone(v)
            except pytz.exceptions.UnknownTimeZoneError:
                raise ValueError(f"Invalid timezone: {v}")
        return v


class CoordinatesData(BaseModel):
    """Validated coordinates and timezone data"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone: str = Field(...)


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
    house_system: str = "P",
) -> ChartInput:
    """Validate chart calculation inputs using Pydantic model"""
    logger.debug(
        f"Validating inputs: year={year}, month={month}, day={day}, "
        f"hour={hour}, minute={minute}, lat={lat}, lon={lon}, "
        f"timezone={timezone}, city={city}"
    )
    
    try:
        # Use Pydantic model for validation
        validated_input = ChartInput(
            year=year,
            month=month,
            day=day,
            hour=hour,
            minute=minute,
            lat=lat,
            lon=lon,
            timezone=timezone,
            city=city,
            house_system=house_system
        )
        
        # Additional business logic validation
        if not city and (lat is None or lon is None):
            raise ValueError("Either city or both latitude and longitude must be provided")
        
        logger.debug("Input validation successful")
        return validated_input
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Unexpected validation error: {str(e)}", exc_info=True)
        raise ValueError(f"Unexpected validation error: {str(e)}")


@lru_cache(maxsize=LOCATION_CACHE_SIZE)
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


def _resolve_coordinates(
    lat: Optional[float],
    lon: Optional[float], 
    city: Optional[str]
) -> CoordinatesData:
    """Resolve latitude, longitude, and timezone from inputs"""
    if city and (lat is None or lon is None):
        logger.debug("Fetching location data for city")
        loc = get_location(city)
        resolved_lat = loc["latitude"]
        resolved_lon = loc["longitude"]
        timezone = loc["timezone"]
    else:
        resolved_lat = lat
        resolved_lon = lon
        timezone = "UTC"
    
    if resolved_lat is None or resolved_lon is None:
        logger.error("Latitude and longitude are required")
        raise ValueError("Latitude and longitude are required")
    
    return CoordinatesData(
        latitude=float(resolved_lat),
        longitude=float(resolved_lon),
        timezone=timezone or "UTC"
    )


def _calculate_julian_day(
    year: int, month: int, day: int, hour: int, minute: int, timezone: str
) -> float:
    """Calculate Julian day from date/time components"""
    logger.debug(f"Using timezone: {timezone}")
    tz = pytz.timezone(timezone)
    dt = datetime(year, month, day, hour, minute)
    logger.debug(f"Local datetime: {dt}")
    dt_utc = tz.localize(dt).astimezone(pytz.UTC)
    logger.debug(f"UTC datetime: {dt_utc}")
    
    # Use getattr for dynamic access to handle missing swisseph attributes
    utc_to_jd_func = getattr(swe, 'utc_to_jd', None)
    if utc_to_jd_func is None:
        raise AttributeError("swisseph.utc_to_jd not available")
    
    jd = utc_to_jd_func(
        dt_utc.year, dt_utc.month, dt_utc.day, 
        dt_utc.hour, dt_utc.minute, 0, 1
    )
    
    logger.debug(f"Julian day result: status={jd[0]}, julian_day={jd[1]}")
    if jd[0] < 0:
        logger.error(f"Invalid Julian day calculation, status: {jd[0]}")
        raise ChartCalculationError(f"Invalid Julian day calculation, status: {jd[0]}")
    
    # Handle the Julian day value which could be float, list, or tuple from PySwissEph
    julian_day_raw = jd[1]
    if isinstance(julian_day_raw, (list, tuple)):
        julian_day_value = float(julian_day_raw[0])
    else:
        julian_day_value = float(julian_day_raw)
    
    return julian_day_value


def _separate_celestial_bodies(planets: Dict[str, Any]) -> tuple[
    Dict[str, PlanetPosition], 
    Dict[str, Dict[str, Any]], 
    Dict[str, Dict[str, Any]]
]:
    """Separate planets, asteroids, and points from ephemeris data"""
    main_planets: Dict[str, PlanetPosition] = {}
    asteroids: Dict[str, Dict[str, Any]] = {}
    points: Dict[str, Dict[str, Any]] = {}
    
    for name, data in planets.items():
        if name in ASTEROID_NAMES:
            asteroids[name] = {
                "position": data["position"],
                "retrograde": data["retrograde"]
            }
            logger.info(f"Found asteroid {name}: position={data['position']}, retrograde={data['retrograde']}")
        elif name in POINT_NAMES:
            points[name] = {
                "position": data["position"],
                "retrograde": data["retrograde"]
            }
            logger.info(f"Found point {name}: position={data['position']}, retrograde={data['retrograde']}")
        else:
            main_planets[name] = data
    
    logger.info(f"Separated {len(main_planets)} main planets, {len(asteroids)} asteroids, and {len(points)} points")
    return main_planets, asteroids, points


def _add_calculated_points(
    points: Dict[str, Dict[str, Any]], 
    houses_data: HousesResult,
    planets: Dict[str, Any]
) -> None:
    """Add vertex, antivertex, and Part of Fortune to points"""
    # Add vertex and antivertex from angles if not already present
    if 'vertex' not in points and 'vertex' in houses_data["angles"]:
        vertex_pos = float(houses_data["angles"]["vertex"])
        points['vertex'] = {
            "position": vertex_pos,
            "retrograde": False  # Vertex is never retrograde
        }
        logger.info(f"Added vertex from angles: position={vertex_pos}")
        
    if 'antivertex' not in points:
        # Calculate antivertex as vertex + 180°
        vertex_pos = houses_data["angles"].get("vertex", 0)
        antivertex_pos = float((vertex_pos + 180) % 360)
        points['antivertex'] = {
            "position": antivertex_pos,
            "retrograde": False  # Antivertex is never retrograde
        }
        logger.info(f"Added antivertex from angles: position={antivertex_pos}")
    
    # Calculate Part of Fortune (Fortuna)
    _calculate_part_of_fortune(points, houses_data, planets)
    
    logger.info(f"Final points after adding vertex/antivertex: {list(points.keys())}")


def _calculate_part_of_fortune(
    points: Dict[str, Dict[str, Any]],
    houses_data: HousesResult, 
    planets: Dict[str, Any]
) -> None:
    """Calculate Part of Fortune based on Sun, Moon, and Ascendant positions"""
    try:
        sun_pos = float(planets.get('sun', {}).get('position', 0))
        moon_pos = float(planets.get('moon', {}).get('position', 0))
        asc_pos = float(houses_data["angles"].get("ascendant", 0))  # type: ignore
        
        # Determine if it's a day or night chart (Sun above or below horizon)
        # If Sun is in houses 7-12 (below ASC-DSC axis), it's a night chart
        sun_asc_diff = (sun_pos - asc_pos) % 360
        is_day_chart = sun_asc_diff <= 180
        
        if is_day_chart:
            # Day formula: ASC + Moon - Sun
            fortuna_pos = (asc_pos + moon_pos - sun_pos) % 360
        else:
            # Night formula: ASC + Sun - Moon  
            fortuna_pos = (asc_pos + sun_pos - moon_pos) % 360
        
        points['part_of_fortune'] = {
            "position": fortuna_pos,
            "retrograde": False  # Part of Fortune is never retrograde
        }
        logger.info(f"Added Part of Fortune: position={fortuna_pos:.2f}° ({'day' if is_day_chart else 'night'} chart)")
        
    except Exception as e:
        logger.warning(f"Failed to calculate Part of Fortune: {e}")


def _degree_to_sign(deg: float) -> str:
    """Convert degree position to zodiac sign"""
    try:
        return ZODIAC_SIGNS[int((deg % 360) // 30)]
    except Exception:
        return "aries"


def _build_enriched_houses(houses_data: HousesResult) -> Dict[str, Dict[str, Any]]:
    """Build enriched houses with sign information"""
    enriched_houses_map: Dict[str, Dict[str, Any]] = {}
    
    for h in houses_data["houses"]:  # type: ignore
        cusp_val = h.get("cusp", 0)
        try:
            cusp_deg = float(cusp_val)  # type: ignore[arg-type]
        except Exception:
            cusp_deg = 0.0
        house_no = h.get("house", 0)
        if 1 <= house_no <= 12:
            enriched_houses_map[f"house_{house_no}"] = {
                "house": house_no,
                "cusp": cusp_deg,
                "sign": _degree_to_sign(cusp_deg),
            }
    
    return enriched_houses_map


def _build_chart_response(
    julian_day: float,
    lat: float,
    lon: float,
    timezone: str,
    main_planets: Dict[str, PlanetPosition],
    asteroids: Dict[str, Dict[str, Any]],
    points: Dict[str, Dict[str, Any]],
    houses_data: HousesResult,
    aspects: List[Any]
) -> Dict[str, Any]:
    """Build the final chart data response"""
    return {
        "julian_day": float(julian_day),
        "latitude": float(lat),
        "longitude": float(lon),
        "timezone": timezone,
        "planets": {
            k: {"position": v["position"], "retrograde": v["retrograde"]} 
            for k, v in main_planets.items()
        },  # type: ignore
        "asteroids": asteroids,
        "points": points,
        "houses": _build_enriched_houses(houses_data),
        "angles": {
            "ascendant": float(houses_data["angles"].get("ascendant", 0)),  # type: ignore
            "descendant": float((houses_data["angles"].get("ascendant", 0) + 180) % 360),  # type: ignore
            "mc": float(houses_data["angles"].get("mc", 0)),  # type: ignore
            "ic": float((houses_data["angles"].get("mc", 0) + 180) % 360),  # type: ignore
            "vertex": float(houses_data["angles"].get("vertex", 0)),  # type: ignore
            "antivertex": float((houses_data["angles"].get("vertex", 0) + 180) % 360),  # type: ignore
            "part_of_fortune": float(points.get("part_of_fortune", {}).get("position", 0)),  # type: ignore
        },
        "aspects": aspects,  # type: ignore
    }


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
    """Calculate astrological chart with comprehensive data"""
    logger.debug(
        f"Calculating chart: year={year}, month={month}, day={day}, "
        f"hour={hour}, minute={minute}, lat={lat}, lon={lon}, "
        f"timezone={timezone}, city={city}, house_system={house_system}"
    )
    
    try:
        # Validate inputs first
        validated_input = validate_inputs(year, month, day, hour, minute, lat, lon, timezone, city, house_system)
        
        # Initialize ephemeris
        init_ephemeris()
        
        # Resolve coordinates and timezone
        coords = _resolve_coordinates(validated_input.lat, validated_input.lon, validated_input.city)
        final_timezone = validated_input.timezone or coords.timezone
        
        # Calculate Julian day
        julian_day = _calculate_julian_day(
            validated_input.year, validated_input.month, validated_input.day,
            validated_input.hour, validated_input.minute, final_timezone
        )
        
        # Get planetary positions
        planets = get_planetary_positions(julian_day) or {}  # type: ignore
        logger.info(f"Chart calculation - got {len(planets)} planets from ephemeris: {list(planets.keys())}")
        
        # Calculate houses
        houses_data = calculate_houses(julian_day, coords.latitude, coords.longitude, validated_input.house_system)
        
        # Separate celestial bodies
        main_planets, asteroids, points = _separate_celestial_bodies(planets)
        
        # Add calculated points (vertex, antivertex, Part of Fortune)
        _add_calculated_points(points, houses_data, planets)
        
        # Debug logging
        _log_debug_info(planets, points, asteroids)
        
        # Calculate aspects
        aspects = calculate_aspects(planets) or []  # type: ignore
        
        # Build and return chart data
        chart_data = _build_chart_response(
            julian_day, coords.latitude, coords.longitude, final_timezone,
            main_planets, asteroids, points, houses_data, aspects
        )
        
        logger.debug(f"Chart data: {chart_data}")
        return chart_data
        
    except ValueError as e:
        logger.error(f"Validation error in calculate_chart: {str(e)}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Unexpected error in calculate_chart: {str(e)}", exc_info=True)
        raise ChartCalculationError(f"Invalid date or calculation: {str(e)}")


def _log_debug_info(
    planets: Dict[str, Any], 
    points: Dict[str, Dict[str, Any]], 
    asteroids: Dict[str, Dict[str, Any]]
) -> None:
    """Log debug information about celestial bodies"""
    logger.info(f"DEBUG: Raw planets from ephemeris: {list(planets.keys())}")
    logger.info(f"DEBUG: Point names we're looking for: {POINT_NAMES}")
    
    for point_name in POINT_NAMES:
        if point_name in planets:
            logger.info(f"DEBUG: Found {point_name} in ephemeris data: {planets[point_name]}")
        else:
            logger.info(f"DEBUG: Missing {point_name} from ephemeris data")
    
    logger.info(f"DEBUG: Points found: {list(points.keys())}")
    logger.info(f"DEBUG: Asteroids found: {list(asteroids.keys())}")


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
        chinese_data: Dict[str, Any] = {}  # Chinese astrology calculation not available
        # Mayan astrology
        mayan_data = calculate_mayan_astrology(year, month, day)  # type: ignore  # noqa: E501

        # Uranian astrology
        uranian_data = calculate_uranian_astrology(julian_day, planets)  # type: ignore  # noqa: E501

        # Spiritual systems (NEW - SPIRITUAL-001)
        try:
            from .spiritual import calculate_spiritual_systems
            spiritual_data = calculate_spiritual_systems(year, month, day, hour, minute)
        except ImportError:
            logger.warning("Spiritual systems module not available")
            spiritual_data = {"error": "Spiritual systems not available"}
        except Exception as e:
            logger.error(f"Error calculating spiritual systems: {e}")
            spiritual_data = {"error": f"Spiritual calculation failed: {str(e)}"}

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
            "spiritual_systems": {
                **spiritual_data,
                "description": "Tarot and Kabbalah Tree of Life spiritual guidance with cross-system correspondences",  # noqa: E501
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
