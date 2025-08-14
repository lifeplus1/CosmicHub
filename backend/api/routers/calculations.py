# backend/api/routers/calculations.py
"""
Modular chart calculation router for better code organization.
Extracted from main.py for improved maintainability.
"""

from fastapi import APIRouter, Request, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel, Field, field_validator, FieldValidationInfo
from typing import Optional, Dict, Any, List, cast, Callable, Awaitable
import logging

from ...astro.calculations.chart import calculate_chart
from ...astro.calculations.human_design import calculate_human_design

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
    def validate_day(cls, v: int, info: FieldValidationInfo) -> int:  # type: ignore[override]
        raw = getattr(info, 'data', {})  # type: ignore[attr-defined]
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

# Cache for chart calculations (Redis integration would go here)
chart_cache: Dict[str, Any] = {}

def cache_chart_result(cache_key: str, result: Dict[str, Any], ttl: int = 3600) -> None:
    """Cache chart calculation result."""
    # TODO: Integrate with Redis for production
    chart_cache[cache_key] = {
        'result': result,
        'timestamp': __import__('time').time(),
        'ttl': ttl
    }
    
    # Simple cleanup for in-memory cache
    if len(chart_cache) > 100:
        current_time = __import__('time').time()
        expired_keys = [
            key for key, data in chart_cache.items()
            if current_time - data['timestamp'] > data['ttl']
        ]
        for key in expired_keys:
            del chart_cache[key]

def get_cached_chart(cache_key: str) -> Optional[Dict[str, Any]]:
    """Get cached chart calculation result."""
    if cache_key in chart_cache:
        data = chart_cache[cache_key]
        current_time = __import__('time').time()
        if current_time - data['timestamp'] <= data['ttl']:
            return data['result']
        else:
            del chart_cache[cache_key]
    return None

def generate_cache_key(data: BirthData, calculation_type: str = "chart") -> str:
    """Generate cache key for chart calculations."""
    return f"{calculation_type}:{data.year}:{data.month}:{data.day}:{data.hour}:{data.minute}:{data.lat}:{data.lon}:{data.timezone}"
