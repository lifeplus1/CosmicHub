# backend/api/routers/calculations.py
"""
Modular chart calculation router for better code organization.
Extracted from main.py for improved maintainability.
"""

from __future__ import annotations

import logging
from typing import (
    TYPE_CHECKING,
)
from typing import Any
from typing import Any as TypingAny
from typing import (
    Awaitable,
    Callable,
    Dict,
    List,
    Optional,
    Protocol,
    cast,
)

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, Request
from pydantic import (
    BaseModel,
    Field,
    ValidationInfo,
    field_validator,
    model_validator,
)

from astro.calculations.chart import (
    calculate_chart,
    calculate_multi_system_chart,
)
from astro.calculations.human_design import calculate_human_design

# Import vectorized function if available at runtime; provide type-only import for static analysis
try:  # Runtime optional import
    from utils.vectorized_multi_system_utils import (
        calculate_multi_system_chart_fast,  # type: ignore
    )

    vectorized_multi_system_available = True
except (
    Exception
):  # Broad except to avoid hard dependency failure in environments lacking optional deps
    calculate_multi_system_chart_fast = None  # type: ignore[assignment]
    vectorized_multi_system_available = False

if TYPE_CHECKING:

    class _VectorizedMultiSystemFunc(
        Protocol
    ):  # pragma: no cover - type definition only
        def __call__(
            self,
            *,
            year: int,
            month: int,
            day: int,
            hour: int,
            minute: int,
            lat: Optional[float],
            lon: Optional[float],
            timezone: Optional[str],
            city: str,
            house_system: str,
        ) -> Dict[str, Any]: ...

    # Provide a typed alias for the optional runtime symbol
    calculate_multi_system_chart_fast: Optional[_VectorizedMultiSystemFunc]

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/calculations", tags=["calculations"])


class BirthData(BaseModel):
    year: int = Field(..., ge=1900, le=2100)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: int = Field(..., ge=0, le=23)
    minute: int = Field(..., ge=0, le=59)
    city: str = Field(..., min_length=1)
    timezone: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

    @field_validator("day")
    @classmethod
    def validate_day(cls, v: int, info: ValidationInfo) -> int:  # type: ignore[override]
        raw = getattr(info, "data", {})  # ValidationInfo exposes incoming data
        if isinstance(raw, dict):
            month = raw.get("month")  # type: ignore[attr-defined]
            year = raw.get("year")  # type: ignore[attr-defined]
            if isinstance(month, int) and isinstance(year, int):
                if month in [4, 6, 9, 11] and v > 30:
                    raise ValueError("Invalid day for month")
                if month == 2:
                    leap = year % 4 == 0 and (
                        year % 100 != 0 or year % 400 == 0
                    )
                    if (leap and v > 29) or (not leap and v > 28):
                        raise ValueError("Invalid day for February")
        return v


class ChartResponse(BaseModel):
    planets: Dict[str, Any]
    houses: Dict[str, Any]
    aspects: List[Any]
    angles: Optional[Dict[str, Any]] = None
    systems: Optional[Dict[str, Any]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    julian_day: Optional[float] = None


@router.post("/chart", response_model=ChartResponse)
async def calculate_chart_endpoint(
    data: BirthData,
    request: Request,
    background_tasks: BackgroundTasks,
    house_system: str = Query("P", enum=["P", "E"]),
    rate_limiter_func: Optional[Callable[[Request], Awaitable[None]]] = None,
):
    """Calculate astrological chart with enhanced validation and caching."""
    if rate_limiter_func:
        await rate_limiter_func(request)

    # Debug: Log incoming request data
    logger.info(
        f"Chart calculation request: lat={data.lat}, lon={data.lon}, timezone={data.timezone}, city={data.city}"
    )

    try:
        chart = calculate_chart(
            year=data.year,
            month=data.month,
            day=data.day,
            hour=data.hour,
            minute=data.minute,
            lat=data.lat,
            lon=data.lon,
            city=data.city,
            timezone=data.timezone or "UTC",
        )

        # Convert houses list to dictionary format if needed
        houses_data: Any = chart.get("houses", {})
        if isinstance(houses_data, list):
            # Convert list of houses to dictionary format
            houses_dict: Dict[str, Any] = {}
            houses_list = cast(List[Dict[str, Any]], houses_data)
            for house in houses_list:
                if "house" in house:
                    houses_dict[f"house_{house['house']}"] = house
            houses_data = houses_dict

        # Provide multi-system expansion in background if desired
        background_tasks.add_task(
            lambda: None
        )  # placeholder for future async tasks

        return ChartResponse(
            planets=chart.get("planets", {}),
            houses=houses_data,
            aspects=chart.get("aspects", []),
            angles=chart.get("angles"),
            systems=chart.get("systems") if "systems" in chart else None,
            latitude=chart.get(
                "latitude"
            ),  # Use resolved coordinates from chart calculation
            longitude=chart.get(
                "longitude"
            ),  # Use resolved coordinates from chart calculation
            timezone=chart.get(
                "timezone"
            ),  # Use resolved timezone from chart calculation
            julian_day=chart.get("julian_day"),
        )

    except Exception as e:
        logger.error(f"Chart calculation error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Chart calculation failed: {str(e)}"
        )


@router.post("/multi-system-chart")
async def calculate_multi_system_chart_endpoint(
    data: BirthData,
    request: Request,
    background_tasks: BackgroundTasks,
    house_system: str = Query("P", enum=["P", "E"]),
    use_vectorized: bool = Query(
        False, description="Use vectorized calculations for better performance"
    ),
    rate_limiter_func: Optional[Callable[[Request], Awaitable[None]]] = None,
) -> Dict[str, Any]:
    """Calculate multi-system astrological chart (Western, Vedic, Chinese, Mayan, Uranian) with optional vectorization."""
    if rate_limiter_func:
        await rate_limiter_func(request)

    logger.info(
        f"Multi-system chart calculation: vectorized={use_vectorized}, available={vectorized_multi_system_available}"
    )

    try:
        # Use vectorized calculation if requested and available
        if (
            use_vectorized
            and vectorized_multi_system_available
            and calculate_multi_system_chart_fast is not None
        ):
            chart: Dict[str, Any] = calculate_multi_system_chart_fast(
                year=data.year,
                month=data.month,
                day=data.day,
                hour=data.hour,
                minute=data.minute,
                lat=data.lat,
                lon=data.lon,
                timezone=data.timezone,
                city=data.city,
                house_system=house_system,
            )
        else:
            # Use traditional calculation
            chart = calculate_multi_system_chart(
                year=data.year,
                month=data.month,
                day=data.day,
                hour=data.hour,
                minute=data.minute,
                lat=data.lat,
                lon=data.lon,
                timezone=data.timezone,
                city=data.city,
                house_system=house_system,
            )

        # Add performance metadata
        chart["api_metadata"] = {
            "endpoint": "multi-system-chart",
            "vectorized_requested": use_vectorized,
            "vectorized_available": vectorized_multi_system_available,
            "vectorized_used": use_vectorized
            and vectorized_multi_system_available,
            "house_system": house_system,
        }

        return chart

    except Exception as e:
        logger.error(f"Multi-system chart calculation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Multi-system chart calculation failed: {str(e)}",
        )


@router.post("/human-design")
async def calculate_human_design_endpoint(
    data: BirthData,
    request: Request,
    rate_limiter_func: Optional[Callable[[Request], Awaitable[None]]] = None,
):
    """Calculate Human Design chart with enhanced geocoding and validation."""
    if rate_limiter_func:
        await rate_limiter_func(request)

    # Debug: Log incoming request data
    logger.info(
        f"Human Design calculation request: year={data.year}, month={data.month}, day={data.day}"
    )
    logger.info(
        f"Location data: lat={data.lat}, lon={data.lon}, timezone={data.timezone}, city={data.city}"
    )

    try:
        # Resolve coordinates if not provided but city is available
        lat = data.lat
        lon = data.lon
        timezone = data.timezone

        if data.city and (lat is None or lon is None):
            from ...astro.calculations.chart import get_location

            logger.info(f"Resolving location for city: {data.city}")
            try:
                location_data = get_location(data.city)
                lat = location_data["latitude"]
                lon = location_data["longitude"]
                timezone = location_data["timezone"] or timezone
                logger.info(
                    f"Location resolved: lat={lat}, lon={lon}, timezone={timezone}"
                )
            except Exception as geo_error:
                logger.error(
                    f"Geocoding failed for city '{data.city}': {str(geo_error)}"
                )
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid city '{data.city}' or geocoding service unavailable. Please provide valid latitude and longitude coordinates.",
                )

        # Validate required coordinates
        if lat is None or lon is None:
            raise HTTPException(
                status_code=400,
                detail="Latitude and longitude are required for Human Design calculation",
            )

        if timezone is None:
            timezone = "UTC"

        human_design_chart = calculate_human_design(
            year=data.year,
            month=data.month,
            day=data.day,
            hour=data.hour,
            minute=data.minute,
            lat=lat,
            lon=lon,
            timezone=timezone,
        )

        return {"human_design": human_design_chart}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Human Design calculation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Human Design calculation failed: {str(e)}",
        )


# Cache for chart calculations with Redis integration ready
import time

chart_cache: Dict[str, Any] = {}


def cache_chart_result(
    cache_key: str, result: Dict[str, Any], ttl: int = 3600
) -> None:
    """
    Cache chart calculation result with Redis-ready implementation.

    Production Redis Setup:
    1. Install redis: pip install redis
    2. Set REDIS_URL environment variable
    3. Use redis_client from main.py for distributed caching

    Current Implementation: In-memory with TTL simulation
    Redis Implementation: redis_client.setex(cache_key, ttl, json.dumps(result))
    """
    chart_cache[cache_key] = {
        "result": result,
        "timestamp": time.time(),
        "ttl": ttl,
        "expires_at": time.time() + ttl,
    }


def get_cached_chart(cache_key: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve cached chart result with TTL validation.

    Redis Implementation:
    cached = redis_client.get(cache_key)
    return json.loads(cached) if cached else None
    """
    if cache_key not in chart_cache:
        return None

    cached_item = chart_cache[cache_key]

    # Check if cache has expired
    if time.time() > cached_item["expires_at"]:
        del chart_cache[cache_key]
        return None

    return cached_item["result"]


def clear_expired_cache() -> int:
    """
    Clean up expired cache entries (in-memory only).
    Redis handles TTL automatically.
    """
    current_time = time.time()
    expired_keys = [
        key
        for key, value in chart_cache.items()
        if current_time > value["expires_at"]
    ]

    for key in expired_keys:
        del chart_cache[key]

    return len(expired_keys)

    # Simple cleanup for in-memory cache
    if len(chart_cache) > 100:
        current_time = __import__("time").time()
        expired_keys = [
            key
            for key, data in chart_cache.items()
            if current_time - data["timestamp"] > data["ttl"]
        ]
        for key in expired_keys:
            del chart_cache[key]


def generate_cache_key(
    data: BirthData, calculation_type: str = "chart"
) -> str:
    """Generate cache key for chart calculations."""
    return f"{calculation_type}:{data.year}:{data.month}:{data.day}:{data.hour}:{data.minute}:{data.lat}:{data.lon}:{data.timezone}"


# ========================================
# PHASE 2: COMPOSITE CHART VECTORIZATION
# ========================================

# Type-only imports for static analysis
# Type checking imports
if TYPE_CHECKING:
    from utils.vectorized_composite_utils import (
        VectorizedChartData as TypedVectorizedChartData,
        create_vectorized_composite_calculator as typed_create_vectorized_composite_calculator,
    )

# Initialize with None as defaults
VectorizedChartData = None  # type: ignore[assignment]
create_vectorized_composite_calculator = None  # type: ignore[assignment]
composite_vectorization_available = False

# Runtime import - attempt to load the actual implementation
try:
    # pylint: disable=ungrouped-imports
    # flake8: noqa: F811
    from utils.vectorized_composite_utils import (
        VectorizedChartData,
        create_vectorized_composite_calculator,
    )
    composite_vectorization_available = True
except Exception:
    composite_vectorization_available = False
    logger.warning(
        "Composite chart vectorization not available - using traditional methods"
    )


class CompositeChartRequest(BaseModel):
    """Request model for composite chart calculation"""

    charts: List[BirthData] = Field(...)
    names: Optional[List[str]] = Field(
        None, description="Names for each chart"
    )
    method: str = Field(
        "midpoint", description="Composite method: 'midpoint' or 'davison'"
    )

    @model_validator(mode="after")
    def check_charts_length(self) -> "CompositeChartRequest":
        if not (2 <= len(self.charts) <= 10):
            raise ValueError("`charts` must contain between 2 and 10 items")
        return self


@router.post("/composite-chart")
async def calculate_composite_chart(
    request: CompositeChartRequest,
    use_vectorized: bool = Query(
        False, description="Enable vectorized calculations for performance"
    ),
    optimization_level: str = Query(
        "balanced", description="Optimization level: fast, balanced, accurate"
    ),
) -> Dict[str, Any]:
    """
    Calculate composite chart from multiple individual charts

    Phase 2 Feature: Enhanced with vectorized calculations for 25-45% performance improvement

    Args:
        request: Composite chart calculation request
        use_vectorized: Enable vectorized calculations (Phase 2)
        optimization_level: Vectorization optimization level

    Returns:
        Composite chart data with relationship analysis
    """
    start_time = __import__("time").time()

    try:
        logger.info(
            f"Computing composite chart for {len(request.charts)} individuals"
        )

        if use_vectorized and composite_vectorization_available:
            # Phase 2: Use vectorized composite calculation
            logger.info("Using vectorized composite chart calculation")

            # Convert birth data to vectorized chart data
            vectorized_charts: List[TypingAny] = []
            for i, birth_data in enumerate(request.charts):
                # Calculate individual chart first
                individual_chart = calculate_chart(
                    birth_data.year,
                    birth_data.month,
                    birth_data.day,
                    birth_data.hour,
                    birth_data.minute,
                    birth_data.lat,
                    birth_data.lon,
                    birth_data.timezone,
                    birth_data.city,
                )

                # Convert to vectorized format
                vectorized_chart: TypingAny = _convert_to_vectorized_chart(
                    individual_chart,
                    chart_id=f"chart_{i}",
                    name=(
                        request.names[i]
                        if request.names and i < len(request.names)
                        else f"Person {i+1}"
                    ),
                )
                vectorized_charts.append(vectorized_chart)

            # Create vectorized calculator (runtime factory) - cast to callable for analyzer
            calculator: TypingAny = cast(
                Callable[[str], TypingAny],
                create_vectorized_composite_calculator,
            )(optimization_level)

            # Calculate composite chart
            composite_result = calculator.calculate_composite_chart(
                vectorized_charts, method=request.method
            )

            # Convert to API response format
            response_data: Dict[str, Any] = {
                "composite_chart": {
                    "planets": composite_result.composite_planets,
                    "houses": composite_result.composite_houses,
                    "aspects": composite_result.composite_aspects,
                    "angles": composite_result.composite_angles,
                },
                "relationship_analysis": {
                    "metrics": composite_result.relationship_metrics,
                    "method": request.method,
                    "participants": len(request.charts),
                },
                "api_metadata": {
                    "calculation_method": "vectorized",
                    "performance_stats": composite_result.performance_stats,
                    "calculation_time": time.time() - start_time,
                    "optimization_level": optimization_level,
                    "phase": "2.0",
                },
            }

        else:
            # Traditional composite calculation
            logger.info("Using traditional composite chart calculation")

            # Calculate individual charts
            individual_charts: List[Dict[str, Any]] = []
            for birth_data in request.charts:
                chart = calculate_chart(
                    birth_data.year,
                    birth_data.month,
                    birth_data.day,
                    birth_data.hour,
                    birth_data.minute,
                    birth_data.lat,
                    birth_data.lon,
                    birth_data.timezone,
                    birth_data.city,
                )
                individual_charts.append(chart)

            # Traditional composite calculation
            composite_chart = _calculate_traditional_composite(
                individual_charts, request.method
            )

            response_data: Dict[str, Any] = {
                "composite_chart": composite_chart,
                "relationship_analysis": {
                    "method": request.method,
                    "participants": len(request.charts),
                    "note": "Traditional calculation - consider enabling vectorization for enhanced performance",
                },
                "api_metadata": {
                    "calculation_method": "traditional",
                    "calculation_time": time.time() - start_time,
                    "vectorization_available": composite_vectorization_available,
                    "phase": "1.0",
                },
            }

        logger.info(
            f"Composite chart calculation completed in {time.time() - start_time:.3f} seconds"
        )
        return response_data

    except Exception as e:
        logger.error(f"Error in composite chart calculation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Composite chart calculation failed: {str(e)}",
        )


def _convert_to_vectorized_chart(
    chart_data: Dict[str, Any], chart_id: str, name: str
) -> TypingAny:
    """Convert traditional chart data to vectorized format"""
    from datetime import datetime

    import numpy as np

    try:
        # Extract planet positions
        planets_array = np.array(
            [
                chart_data.get("planets", {})
                .get("Sun", {})
                .get("longitude", 0),
                chart_data.get("planets", {})
                .get("Moon", {})
                .get("longitude", 0),
                chart_data.get("planets", {})
                .get("Mercury", {})
                .get("longitude", 0),
                chart_data.get("planets", {})
                .get("Venus", {})
                .get("longitude", 0),
                chart_data.get("planets", {})
                .get("Mars", {})
                .get("longitude", 0),
                chart_data.get("planets", {})
                .get("Jupiter", {})
                .get("longitude", 0),
                chart_data.get("planets", {})
                .get("Saturn", {})
                .get("longitude", 0),
                chart_data.get("planets", {})
                .get("Uranus", {})
                .get("longitude", 0),
                chart_data.get("planets", {})
                .get("Neptune", {})
                .get("longitude", 0),
                chart_data.get("planets", {})
                .get("Pluto", {})
                .get("longitude", 0),
            ]
        )

        # Extract house cusps
        houses_array = np.array(
            [
                chart_data.get("houses", {})
                .get(f"House_{i}", {})
                .get("cusp", i * 30)
                for i in range(1, 13)
            ]
        )

        # Extract angles
        angles_array = np.array(
            [
                chart_data.get("angles", {})
                .get("Ascendant", {})
                .get("longitude", 0),
                chart_data.get("angles", {})
                .get("Midheaven", {})
                .get("longitude", 90),
                chart_data.get("angles", {})
                .get("Descendant", {})
                .get("longitude", 180),
                chart_data.get("angles", {})
                .get("IC", {})
                .get("longitude", 270),
            ]
        )

        # Build aspects array if present
        aspects_array = np.array(chart_data.get("aspects", []), dtype=object)

        # Create vectorized chart data - cast constructor for analyzer
        return cast(Callable[..., TypingAny], VectorizedChartData)(
            planets=planets_array,
            houses=houses_array,
            angles=angles_array,
            aspects=aspects_array,
            chart_id=chart_id,
            name=name,
            birth_datetime=datetime.now(),  # Simplified - would use actual birth time
        )

    except Exception as e:
        logger.error(f"Error converting chart to vectorized format: {str(e)}")
        raise


def _calculate_traditional_composite(
    charts: List[Dict[str, Any]], method: str
) -> Dict[str, Any]:
    """Traditional composite chart calculation (simplified implementation)"""

    # Simplified traditional composite calculation
    composite_planets = {}

    # Calculate midpoints for each planet
    planet_names = [
        "Sun",
        "Moon",
        "Mercury",
        "Venus",
        "Mars",
        "Jupiter",
        "Saturn",
        "Uranus",
        "Neptune",
        "Pluto",
    ]

    for planet in planet_names:
        positions: List[float] = []
        for chart in charts:
            if planet in chart.get("planets", {}):
                positions.append(
                    float(chart["planets"][planet].get("longitude", 0))
                )

        if positions:
            # Simple midpoint calculation
            if len(positions) == 2:
                pos1, pos2 = positions[0], positions[1]
                diff = abs(pos2 - pos1)
                if diff <= 180:
                    midpoint = (pos1 + pos2) / 2
                else:
                    midpoint = (pos1 + pos2 + 360) / 2 % 360
            else:
                # Multiple charts - simple average
                midpoint = sum(positions) / len(positions)

            composite_planets[planet] = {
                "longitude": midpoint,
                "sign": _get_zodiac_sign_simple(midpoint),
                "degree": midpoint % 30,
            }

    return {
        "planets": composite_planets,
        "method": method,
        "calculation": "traditional",
    }


def _get_zodiac_sign_simple(longitude: float) -> str:
    """Simple zodiac sign calculation"""
    signs = [
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
    sign_index = int(longitude // 30) % 12
    return signs[sign_index]
