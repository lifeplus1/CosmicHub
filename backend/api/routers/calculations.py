# backend/api/routers/calculations.py
"""
Modular chart calculation router for better code organization.
Extracted from main.py for improved maintainability.
"""

from fastapi import APIRouter, Request, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel, Field, field_validator, ValidationInfo
from typing import Optional, Dict, Any, List, cast, Callable, Awaitable, TYPE_CHECKING, Protocol
import logging

from astro.calculations.chart import calculate_chart, calculate_multi_system_chart
from astro.calculations.human_design import calculate_human_design

# Import vectorized function if available at runtime; provide type-only import for static analysis
try:  # Runtime optional import
    from utils.vectorized_multi_system_utils import calculate_multi_system_chart_fast  # type: ignore
    vectorized_multi_system_available = True
except Exception:  # Broad except to avoid hard dependency failure in environments lacking optional deps
    calculate_multi_system_chart_fast = None  # type: ignore[assignment]
    vectorized_multi_system_available = False

if TYPE_CHECKING:
    class _VectorizedMultiSystemFunc(Protocol):  # pragma: no cover - type definition only
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
            house_system: str
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

    @field_validator('day')
    @classmethod
    def validate_day(cls, v: int, info: ValidationInfo) -> int:  # type: ignore[override]
        raw = getattr(info, 'data', {})  # ValidationInfo exposes incoming data
        if isinstance(raw, dict):
            month = raw.get('month')  # type: ignore[attr-defined]
            year = raw.get('year')  # type: ignore[attr-defined]
            if isinstance(month, int) and isinstance(year, int):
                if month in [4, 6, 9, 11] and v > 30:
                    raise ValueError('Invalid day for month')
                if month == 2:
                    leap = (year % 4 == 0 and (year % 100 != 0 or year % 400 == 0))
                    if (leap and v > 29) or (not leap and v > 28):
                        raise ValueError('Invalid day for February')
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
    rate_limiter_func: Optional[Callable[[Request], Awaitable[None]]] = None
):
    """Calculate astrological chart with enhanced validation and caching."""
    if rate_limiter_func:
        await rate_limiter_func(request)
    
    # Debug: Log incoming request data
    logger.info(f"Chart calculation request: lat={data.lat}, lon={data.lon}, timezone={data.timezone}, city={data.city}")
    
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
            timezone=data.timezone or "UTC"
        )
        
        # Convert houses list to dictionary format if needed
        houses_data: Any = chart.get('houses', {})
        if isinstance(houses_data, list):
            # Convert list of houses to dictionary format
            houses_dict: Dict[str, Any] = {}
            houses_list = cast(List[Dict[str, Any]], houses_data)
            for house in houses_list:
                if 'house' in house:
                    houses_dict[f"house_{house['house']}"] = house
            houses_data = houses_dict
        
        # Provide multi-system expansion in background if desired
        background_tasks.add_task(lambda: None)  # placeholder for future async tasks
        
        return ChartResponse(
            planets=chart.get('planets', {}),
            houses=houses_data,
            aspects=chart.get('aspects', []),
            angles=chart.get('angles'),
            systems=chart.get('systems') if 'systems' in chart else None,
            latitude=chart.get('latitude'),  # Use resolved coordinates from chart calculation
            longitude=chart.get('longitude'),  # Use resolved coordinates from chart calculation
            timezone=chart.get('timezone'),  # Use resolved timezone from chart calculation
            julian_day=chart.get('julian_day')
        )
        
    except Exception as e:
        logger.error(f"Chart calculation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chart calculation failed: {str(e)}")

@router.post("/multi-system-chart")
async def calculate_multi_system_chart_endpoint(
    data: BirthData, 
    request: Request, 
    background_tasks: BackgroundTasks, 
    house_system: str = Query("P", enum=["P", "E"]),
    use_vectorized: bool = Query(False, description="Use vectorized calculations for better performance"),
    rate_limiter_func: Optional[Callable[[Request], Awaitable[None]]] = None
) -> Dict[str, Any]:
    """Calculate multi-system astrological chart (Western, Vedic, Chinese, Mayan, Uranian) with optional vectorization."""
    if rate_limiter_func:
        await rate_limiter_func(request)
    
    logger.info(f"Multi-system chart calculation: vectorized={use_vectorized}, available={vectorized_multi_system_available}")
    
    try:
        # Use vectorized calculation if requested and available
        if use_vectorized and vectorized_multi_system_available and calculate_multi_system_chart_fast is not None:
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
                house_system=house_system
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
                house_system=house_system
            )
        
        # Add performance metadata
        chart["api_metadata"] = {
            "endpoint": "multi-system-chart",
            "vectorized_requested": use_vectorized,
            "vectorized_available": vectorized_multi_system_available,
            "vectorized_used": use_vectorized and vectorized_multi_system_available,
            "house_system": house_system
        }
        
        return chart
        
    except Exception as e:
        logger.error(f"Multi-system chart calculation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Multi-system chart calculation failed: {str(e)}")

@router.post("/human-design")
async def calculate_human_design_endpoint(
    data: BirthData, 
    request: Request,
    rate_limiter_func: Optional[Callable[[Request], Awaitable[None]]] = None
):
    """Calculate Human Design chart with enhanced geocoding and validation."""
    if rate_limiter_func:
        await rate_limiter_func(request)
    
    # Debug: Log incoming request data
    logger.info(f"Human Design calculation request: year={data.year}, month={data.month}, day={data.day}")
    logger.info(f"Location data: lat={data.lat}, lon={data.lon}, timezone={data.timezone}, city={data.city}")
    
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
                logger.info(f"Location resolved: lat={lat}, lon={lon}, timezone={timezone}")
            except Exception as geo_error:
                logger.error(f"Geocoding failed for city '{data.city}': {str(geo_error)}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid city '{data.city}' or geocoding service unavailable. Please provide valid latitude and longitude coordinates."
                )
        
        # Validate required coordinates
        if lat is None or lon is None:
            raise HTTPException(
                status_code=400,
                detail="Latitude and longitude are required for Human Design calculation"
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
            timezone=timezone
        )
        
        return {"human_design": human_design_chart}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Human Design calculation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Human Design calculation failed: {str(e)}")

# Cache for chart calculations with Redis integration ready
import time

chart_cache: Dict[str, Any] = {}

def cache_chart_result(cache_key: str, result: Dict[str, Any], ttl: int = 3600) -> None:
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
        'result': result,
        'timestamp': time.time(),
        'ttl': ttl,
        'expires_at': time.time() + ttl
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
    if time.time() > cached_item['expires_at']:
        del chart_cache[cache_key]
        return None
    
    return cached_item['result']

def clear_expired_cache() -> int:
    """
    Clean up expired cache entries (in-memory only).
    Redis handles TTL automatically.
    """
    current_time = time.time()
    expired_keys = [
        key for key, value in chart_cache.items() 
        if current_time > value['expires_at']
    ]
    
    for key in expired_keys:
        del chart_cache[key]
    
    return len(expired_keys)
    
    # Simple cleanup for in-memory cache
    if len(chart_cache) > 100:
        current_time = __import__('time').time()
        expired_keys = [
            key for key, data in chart_cache.items()
            if current_time - data['timestamp'] > data['ttl']
        ]
        for key in expired_keys:
            del chart_cache[key]

def generate_cache_key(data: BirthData, calculation_type: str = "chart") -> str:
    """Generate cache key for chart calculations."""
    return f"{calculation_type}:{data.year}:{data.month}:{data.day}:{data.hour}:{data.minute}:{data.lat}:{data.lon}:{data.timezone}"
