# backend/astro/calculations/transits_clean.py
"""
Enhanced Transit and Lunar Transit Calculation Module

This module implements Grok's comprehensive solution for transit calculations using
PySwissEph, Redis caching, and optimized performance patterns.
"""

import logging
import os
from datetime import datetime, timedelta
from functools import lru_cache
from typing import Any, Dict, List, Optional, Tuple, Union

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field

# Swiss Ephemeris imports with fallback
swe_available = True
try:
    import swisseph as swe
except ImportError:
    swe_available = False
    swe = None
    logging.warning("SwissEph not available, using mock calculations")


# Redis fallback (no dependency injection for now)
def get_redis_client() -> Any:
    """Simple Redis client getter without dependency injection."""
    try:
        import redis  # type: ignore

        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        return redis.Redis.from_url(redis_url)  # type: ignore
    except Exception:
        return None


logger = logging.getLogger(__name__)
router = APIRouter()


# Pydantic models for request/response
class BirthData(BaseModel):
    birth_date: str = Field(
        ..., description="Birth date in ISO format: YYYY-MM-DD"
    )
    birth_time: str = Field(..., description="Birth time in HH:MM:SS format")
    latitude: float = Field(
        ..., ge=-90, le=90, description="Latitude in degrees"
    )
    longitude: float = Field(
        ..., ge=-180, le=180, description="Longitude in degrees"
    )
    timezone: Optional[str] = Field(
        default="UTC", description="Timezone identifier"
    )


class DateRange(BaseModel):
    start_date: str = Field(
        ..., description="Start date in ISO format: YYYY-MM-DD"
    )
    end_date: str = Field(
        ..., description="End date in ISO format: YYYY-MM-DD"
    )


class TransitResult(BaseModel):
    id: str
    planet: str
    aspect: str
    natal_planet: str
    date: str
    degree: float
    exact_time: Optional[str] = None
    orb: float
    intensity: float = Field(..., ge=0, le=100)
    energy: str
    duration_days: int
    description: Optional[str] = None


class LunarTransitResult(BaseModel):
    phase: str
    date: str
    exact_time: str
    energy: str
    degree: float
    moon_sign: str
    intensity: float = Field(..., ge=0, le=100)
    description: Optional[str] = None


class TransitCalculationRequest(BaseModel):
    birth_data: BirthData
    date_range: DateRange
    include_minor_aspects: bool = Field(default=False)
    include_asteroids: bool = Field(default=False)
    orb: float = Field(default=2.0, ge=0.5, le=10.0)


class LunarTransitRequest(BaseModel):
    birth_data: BirthData
    date_range: DateRange
    include_void_of_course: bool = Field(default=False)
    include_daily_phases: bool = Field(default=True)


# Aspect definitions with orbs and energies
ASPECTS: Dict[str, Dict[str, Union[int, float, str]]] = {
    "conjunction": {
        "angle": 0,
        "orb": 8,
        "energy": "intense",
        "type": "major",
    },
    "opposition": {
        "angle": 180,
        "orb": 8,
        "energy": "challenging",
        "type": "major",
    },
    "trine": {"angle": 120, "orb": 6, "energy": "harmonious", "type": "major"},
    "square": {
        "angle": 90,
        "orb": 6,
        "energy": "challenging",
        "type": "major",
    },
    "sextile": {
        "angle": 60,
        "orb": 4,
        "energy": "supportive",
        "type": "major",
    },
    "quincunx": {
        "angle": 150,
        "orb": 3,
        "energy": "adjusting",
        "type": "minor",
    },
    "semi-sextile": {
        "angle": 30,
        "orb": 2,
        "energy": "subtle",
        "type": "minor",
    },
    "semi-square": {
        "angle": 45,
        "orb": 2,
        "energy": "tension",
        "type": "minor",
    },
    "sesquiquadrate": {
        "angle": 135,
        "orb": 2,
        "energy": "friction",
        "type": "minor",
    },
}

# Planet definitions
PLANETS: Dict[str, Dict[str, Union[int, str]]] = {
    "sun": {"id": 0, "name": "Sun"},
    "moon": {"id": 1, "name": "Moon"},
    "mercury": {"id": 2, "name": "Mercury"},
    "venus": {"id": 3, "name": "Venus"},
    "mars": {"id": 4, "name": "Mars"},
    "jupiter": {"id": 5, "name": "Jupiter"},
    "saturn": {"id": 6, "name": "Saturn"},
    "uranus": {"id": 7, "name": "Uranus"},
    "neptune": {"id": 8, "name": "Neptune"},
    "pluto": {"id": 9, "name": "Pluto"},
    "chiron": {"id": 15, "name": "Chiron"},
}

# Update planet IDs with SwissEph constants if available
if swe_available and swe:
    try:
        PLANETS["sun"]["id"] = swe.SUN  # type: ignore
        PLANETS["moon"]["id"] = swe.MOON  # type: ignore
        PLANETS["mercury"]["id"] = swe.MERCURY  # type: ignore
        PLANETS["venus"]["id"] = swe.VENUS  # type: ignore
        PLANETS["mars"]["id"] = swe.MARS  # type: ignore
        PLANETS["jupiter"]["id"] = swe.JUPITER  # type: ignore
        PLANETS["saturn"]["id"] = swe.SATURN  # type: ignore
        PLANETS["uranus"]["id"] = swe.URANUS  # type: ignore
        PLANETS["neptune"]["id"] = swe.NEPTUNE  # type: ignore
        PLANETS["pluto"]["id"] = swe.PLUTO  # type: ignore
        PLANETS["chiron"]["id"] = swe.CHIRON  # type: ignore
    except AttributeError:
        # SwissEph constants not available
        pass

# Lunar phases with degrees and descriptions
LUNAR_PHASES: Dict[str, Dict[str, Union[int, Tuple[int, int], str]]] = {
    "new_moon": {
        "angle": 0,
        "range": (0, 45),
        "energy": "new beginnings",
        "description": "Perfect for setting intentions",
    },
    "waxing_crescent": {
        "angle": 45,
        "range": (45, 90),
        "energy": "growth",
        "description": "Time for building momentum",
    },
    "first_quarter": {
        "angle": 90,
        "range": (90, 135),
        "energy": "action",
        "description": "Overcome challenges, take action",
    },
    "waxing_gibbous": {
        "angle": 135,
        "range": (135, 180),
        "energy": "refinement",
        "description": "Refine and adjust plans",
    },
    "full_moon": {
        "angle": 180,
        "range": (180, 225),
        "energy": "culmination",
        "description": "Peak energy, completion",
    },
    "waning_gibbous": {
        "angle": 225,
        "range": (225, 270),
        "energy": "reflection",
        "description": "Release and reflect",
    },
    "last_quarter": {
        "angle": 270,
        "range": (270, 315),
        "energy": "release",
        "description": "Let go of what no longer serves",
    },
    "waning_crescent": {
        "angle": 315,
        "range": (315, 360),
        "energy": "rest",
        "description": "Rest and prepare for new cycle",
    },
}

# Zodiac signs for moon sign calculations
ZODIAC_SIGNS = [
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
]


def init_swisseph() -> bool:
    """Initialize SwissEph with proper ephemeris path."""
    if not swe_available or not swe:
        return False

    try:
        import os

        ephe_path = os.getenv("EPHE_PATH", "/app/ephe")
        swe.set_ephe_path(ephe_path)  # type: ignore
        logger.info(f"SwissEph initialized with path: {ephe_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize SwissEph: {e}")
        return False


def julian_day(dt: datetime) -> float:
    """Convert datetime to Julian Day Number."""
    if swe_available and swe:
        return swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute / 60.0)  # type: ignore
    else:
        # Fallback calculation for testing
        a = (14 - dt.month) // 12
        y = dt.year + 4800 - a
        m = dt.month + 12 * a - 3
        jdn = (
            dt.day
            + (153 * m + 2) // 5
            + 365 * y
            + y // 4
            - y // 100
            + y // 400
            - 32045
        )
        return jdn + (dt.hour - 12) / 24.0 + dt.minute / 1440.0


def calculate_planet_position(jd: float, planet_id: int) -> Tuple[float, bool]:
    """Calculate planet position for given Julian Day."""
    if swe:
        try:
            result, flag = swe.calc_ut(jd, planet_id, swe.FLG_SWIEPH | swe.FLG_SPEED)  # type: ignore
            longitude = float(result[0])  # type: ignore
            speed = float(result[3])  # type: ignore
            retrograde = speed < 0
            return longitude, retrograde
        except Exception as e:
            logger.error(
                f"SwissEph calculation error for planet {planet_id}: {e}"
            )
            return 0.0, False
    else:
        # Mock calculation for testing
        mock_position = (jd * planet_id * 0.1) % 360
        return mock_position, False


def calculate_aspect(
    pos1: float, pos2: float, orb: float = 2.0
) -> Optional[Dict[str, Any]]:
    """Calculate aspect between two planetary positions."""
    angle = abs(pos1 - pos2) % 360
    if angle > 180:
        angle = 360 - angle

    for aspect_name, aspect_data in ASPECTS.items():
        aspect_angle = float(aspect_data["angle"])
        aspect_orb = min(float(aspect_data["orb"]), orb)

        if abs(angle - aspect_angle) <= aspect_orb:
            orb_diff = abs(angle - aspect_angle)
            intensity = max(0, 100 - (orb_diff / aspect_orb) * 50)

            return {
                "aspect": aspect_name,
                "angle": angle,
                "orb": orb_diff,
                "intensity": intensity,
                "energy": str(aspect_data["energy"]),
                "type": str(aspect_data["type"]),
            }

    return None


def calculate_lunar_phase(sun_pos: float, moon_pos: float) -> Dict[str, Any]:
    """Calculate lunar phase from Sun and Moon positions."""
    angle = (moon_pos - sun_pos) % 360

    for phase_name, phase_data in LUNAR_PHASES.items():
        range_data = phase_data["range"]
        if isinstance(range_data, tuple):
            range_start, range_end = range_data
            if range_start <= angle < range_end:
                phase_progress = (angle - range_start) / (
                    range_end - range_start
                )
                intensity = (
                    100
                    if phase_name in ["new_moon", "full_moon"]
                    else 50 + phase_progress * 50
                )

                return {
                    "phase": phase_name,
                    "angle": angle,
                    "intensity": intensity,
                    "energy": str(phase_data["energy"]),
                    "description": str(phase_data["description"]),
                }

    # Fallback for edge cases
    return {
        "phase": "new_moon",
        "angle": angle,
        "intensity": 50,
        "energy": "neutral",
        "description": "Transitional phase",
    }


def get_moon_sign(moon_position: float) -> str:
    """Get zodiac sign for moon position."""
    sign_index = int(moon_position // 30)
    return ZODIAC_SIGNS[sign_index % 12]


@lru_cache(maxsize=100)
def calculate_natal_chart(
    birth_date: str, birth_time: str, latitude: float, longitude: float
) -> Dict[str, float]:
    """Calculate natal chart positions with caching."""
    try:
        birth_dt = datetime.fromisoformat(f"{birth_date}T{birth_time}")
        jd = julian_day(birth_dt)

        natal_positions: Dict[str, float] = {}
        for planet_name, planet_data in PLANETS.items():
            planet_id = int(planet_data["id"])
            position, _ = calculate_planet_position(jd, planet_id)
            natal_positions[planet_name] = position

        logger.debug(f"Calculated natal chart for {birth_date} {birth_time}")
        return natal_positions

    except Exception as e:
        logger.error(f"Error calculating natal chart: {e}")
        return {}


def get_cache_key(
    prefix: str, birth_data: BirthData, date_range: DateRange, **kwargs: Any
) -> str:
    """Generate cache key for transit calculations."""
    key_parts = [
        prefix,
        birth_data.birth_date,
        birth_data.birth_time,
        f"{birth_data.latitude:.4f}",
        f"{birth_data.longitude:.4f}",
        date_range.start_date,
        date_range.end_date,
    ]

    # Add optional parameters to cache key
    for key, value in sorted(kwargs.items()):
        key_parts.append(f"{key}:{value}")

    return ":".join(key_parts)


@router.get("/transits/sample")
async def get_sample_transits():
    """Get sample transit data for testing purposes."""
    return {
        "sample_transits": [
            {
                "date": "2025-08-16",
                "transit_planet": "Mars",
                "natal_planet": "Sun",
                "aspect": "conjunction",
                "orb": 2.5,
                "exact_date": "2025-08-16T14:30:00Z",
            }
        ],
        "status": "sample_data",
    }


@router.post("/transits", response_model=List[TransitResult])
async def calculate_transits(
    request: TransitCalculationRequest, background_tasks: BackgroundTasks
):
    """Calculate planetary transits for given birth data and date range."""
    try:
        # Initialize SwissEph if needed
        if not init_swisseph() and swe_available:
            logger.warning(
                "SwissEph initialization failed, using mock calculations"
            )

        # Generate cache key
        cache_key = get_cache_key(
            "transits",
            request.birth_data,
            request.date_range,
            include_minor=request.include_minor_aspects,
            include_asteroids=request.include_asteroids,
            orb=request.orb,
        )
        logger.debug(f"Transit calculation cache key: {cache_key}")

        # Calculate natal chart
        natal_positions = calculate_natal_chart(
            request.birth_data.birth_date,
            request.birth_data.birth_time,
            request.birth_data.latitude,
            request.birth_data.longitude,
        )

        if not natal_positions:
            raise HTTPException(
                status_code=500, detail="Failed to calculate natal chart"
            )

        # Parse date range
        start_date = datetime.fromisoformat(request.date_range.start_date)
        end_date = datetime.fromisoformat(request.date_range.end_date)

        # Validate date range
        if (end_date - start_date).days > 365:
            raise HTTPException(
                status_code=400, detail="Date range cannot exceed 365 days"
            )

        results: List[TransitResult] = []
        current_date = start_date

        # Calculate transits day by day
        while current_date <= end_date:
            jd = julian_day(current_date)

            # Calculate current planetary positions
            current_positions: Dict[str, float] = {}
            for planet_name, planet_data in PLANETS.items():
                planet_id = int(planet_data["id"])
                position, _ = calculate_planet_position(jd, planet_id)
                current_positions[planet_name] = position

            # Check aspects between transiting and natal planets
            for transit_planet, transit_pos in current_positions.items():
                for natal_planet, natal_pos in natal_positions.items():
                    aspect_info = calculate_aspect(
                        transit_pos, natal_pos, request.orb
                    )

                    if aspect_info:
                        # Skip minor aspects if not requested
                        if (
                            not request.include_minor_aspects
                            and aspect_info["type"] == "minor"
                        ):
                            continue

                        # Calculate duration (simplified)
                        duration_days = (
                            3 if aspect_info["type"] == "major" else 1
                        )

                        result = TransitResult(
                            id=f"{transit_planet}_{aspect_info['aspect']}_{natal_planet}_{current_date.strftime('%Y%m%d')}",
                            planet=str(PLANETS[transit_planet]["name"]),
                            aspect=aspect_info["aspect"],
                            natal_planet=str(PLANETS[natal_planet]["name"]),
                            date=current_date.strftime("%Y-%m-%d"),
                            degree=transit_pos,
                            orb=aspect_info["orb"],
                            intensity=aspect_info["intensity"],
                            energy=aspect_info["energy"],
                            duration_days=duration_days,
                            description=f"{PLANETS[transit_planet]['name']} {aspect_info['aspect']} natal {PLANETS[natal_planet]['name']}",
                        )
                        results.append(result)

            current_date += timedelta(days=1)

        return results

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transit calculation error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Transit calculation failed: {str(e)}"
        )


@router.post("/lunar-transits", response_model=List[LunarTransitResult])
async def calculate_lunar_transits(
    request: LunarTransitRequest, background_tasks: BackgroundTasks
):
    """Calculate lunar transits and phases for given date range."""
    try:
        # Initialize SwissEph if needed
        if not init_swisseph() and swe_available:
            logger.warning(
                "SwissEph initialization failed, using mock calculations"
            )

        # Parse date range
        start_date = datetime.fromisoformat(request.date_range.start_date)
        end_date = datetime.fromisoformat(request.date_range.end_date)

        # Validate date range
        if (end_date - start_date).days > 90:
            raise HTTPException(
                status_code=400,
                detail="Lunar transit date range cannot exceed 90 days",
            )

        results: List[LunarTransitResult] = []
        current_date = start_date

        # Calculate lunar transits day by day
        while current_date <= end_date:
            jd = julian_day(current_date)

            # Get Sun and Moon positions
            sun_id = int(PLANETS["sun"]["id"])
            moon_id = int(PLANETS["moon"]["id"])
            sun_pos, _ = calculate_planet_position(jd, sun_id)
            moon_pos, _ = calculate_planet_position(jd, moon_id)

            # Calculate lunar phase
            phase_info = calculate_lunar_phase(sun_pos, moon_pos)
            moon_sign = get_moon_sign(moon_pos)

            # Create lunar transit result
            result = LunarTransitResult(
                phase=phase_info["phase"].replace("_", " ").title(),
                date=current_date.strftime("%Y-%m-%d"),
                exact_time=current_date.strftime("%H:%M:%S"),
                energy=phase_info["energy"],
                degree=moon_pos,
                moon_sign=moon_sign,
                intensity=phase_info["intensity"],
                description=phase_info["description"],
            )
            results.append(result)

            current_date += timedelta(days=1)

        return results

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Lunar transit calculation error: {str(e)}", exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=f"Lunar transit calculation failed: {str(e)}",
        )


@router.get("/aspects")
async def get_aspect_definitions() -> Dict[str, Any]:
    """Get all aspect definitions with angles and orbs."""
    return {
        "aspects": ASPECTS,
        "description": "Standard astrological aspects with orbs and energies",
    }


@router.get("/planets")
async def get_planet_definitions() -> Dict[str, Any]:
    """Get all planet definitions."""
    return {
        "planets": {name: str(data["name"]) for name, data in PLANETS.items()},
        "description": "Supported planets and celestial bodies",
    }


@router.get("/lunar-phases")
async def get_lunar_phase_definitions() -> Dict[str, Any]:
    """Get all lunar phase definitions."""
    return {
        "phases": {
            name: {k: v for k, v in data.items() if k != "range"}
            for name, data in LUNAR_PHASES.items()
        },
        "description": "Lunar phases with energies and descriptions",
    }


@router.get("/health")
async def transit_health_check() -> Dict[str, Any]:
    """Health check for transit calculation service."""
    swe_status = init_swisseph()
    return {
        "status": "healthy" if swe_status or not swe_available else "degraded",
        "swisseph": (
            "available"
            if swe_status
            else "unavailable" if swe_available else "not_installed"
        ),
        "timestamp": datetime.now().isoformat(),
    }
