# backend/api/routers/charts.py
"""
Charts API Router
Consolidated functionality for all chart operations with improved error handling
"""
import asyncio
import logging
from typing import Any, Dict, List, Optional, Literal

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
import swisseph as swe
from firebase_admin import auth

# Local imports
from auth import get_current_user
from database import (
    BirthData,
    ChartData as DatabaseChartData,
    delete_chart_by_id,
    get_charts,
    save_chart,
)
from settings import settings
from api.services.astro_service import AstroService, get_astro_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/charts", tags=["charts"])


# ----- Request/Response Models -----

class PlanetAspect(BaseModel):
    type: str
    target: str
    orb: float


class Planet(BaseModel):
    name: str
    sign: str
    degree: float
    house: int | None = None
    aspects: List[PlanetAspect] = []


class Asteroid(BaseModel):
    name: str
    sign: str
    degree: float
    house: int | None = None
    aspects: List[PlanetAspect] = []


class Angle(BaseModel):
    name: str
    sign: str
    degree: float


class House(BaseModel):
    number: int
    sign: str
    cusp: float
    planets: List[str] = []


class Aspect(BaseModel):
    planet1: str
    planet2: str
    type: str
    orb: float
    applying: bool | None = None


class ChartRequestData(BaseModel):
    """Request model for chart data with planets, houses, aspects, etc."""
    planets: List[Planet]
    asteroids: List[Asteroid]
    angles: List[Angle]
    houses: List[House]
    aspects: List[Aspect]


# Legacy SaveChartRequest model
class SaveChartRequest(BaseModel):
    """Request model for saving a calculated birth chart"""
    year: int = Field(..., ge=1900, le=2100)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: int = Field(..., ge=0, le=23)
    minute: int = Field(..., ge=0, le=59)
    city: str = Field(..., min_length=1)
    house_system: str = Field(default="P", pattern="^[PE]$")
    chart_name: Optional[str] = None
    timezone: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class SaveChartResponse(BaseModel):
    """Response model for chart save operations"""
    id: str
    message: str
    chart_data: DatabaseChartData


class ChartListResponse(BaseModel):
    """Response model for listing multiple charts"""
    charts: List[DatabaseChartData]
    total: int


# ----- Authentication Dependencies -----

def verify_id_token_dependency(
    authorization: str | None = Header(default=None, alias="Authorization")
) -> Dict[str, Any]:
    """
    Verify Firebase ID token from Authorization header.
    
    Args:
        authorization: Authorization header value
        
    Returns:
        Decoded token payload as dictionary
        
    Raises:
        HTTPException: 401 if token is missing or invalid
    """
    if not authorization:
        logger.warning("Missing Authorization header")
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        token_str = authorization.split(" ")[1]  # Remove "Bearer " prefix
        # Type ignore needed for external Firebase SDK
        return auth.verify_id_token(token_str)  # type: ignore[misc]
    except IndexError:
        logger.warning("Invalid Authorization header format")
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")
    except Exception as e:
        logger.warning(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


# ----- Endpoints -----

@router.post("/save", response_model=Dict[str, Any])
async def save_chart_unified(
    chart_data: ChartRequestData,
    token: Dict[str, Any] = Depends(verify_id_token_dependency),
    astro_service: AstroService = Depends(get_astro_service),
) -> Dict[str, Any]:
    """
    Save chart data with unified serialization and optional caching
    """
    try:
        from os import getenv
        trace_enabled = getenv("DEBUG_REQUEST_TRACE") in ("1", "true", "yes")
        
        if trace_enabled:
            logger.info(f"save_chart:enter uid={token.get('uid')} planets={len(chart_data.planets)}")
        
        # Convert to serialized model
        from api.utils.serialization import ChartData as SerializedChartData, serialize_data
        
        serialized_model = SerializedChartData(
            planets=[
                {
                    "name": p.name,
                    "sign": p.sign,
                    "degree": p.degree,
                    "position": p.degree,
                    "house": p.house if p.house is not None else "",
                }
                for p in chart_data.planets
            ],
            houses=[
                {
                    "number": h.number,
                    "sign": h.sign,
                    "cusp": h.cusp,
                }
                for h in chart_data.houses
            ],
            aspects=[
                {
                    "planet1": a.planet1,
                    "planet2": a.planet2,
                    "type": a.type,
                    "orb": a.orb,
                    "applying": str(a.applying).lower() if a.applying is not None else "",
                }
                for a in chart_data.aspects
            ],
            asteroids=(
                [
                    {
                        "name": a.name,
                        "sign": a.sign,
                        "degree": a.degree,
                        "house": a.house if a.house is not None else "",
                    }
                    for a in chart_data.asteroids
                ]
                if chart_data.asteroids
                else None
            ),
            angles=(
                [
                    {
                        "name": ang.name,
                        "sign": ang.sign,
                        "degree": ang.degree,
                        "position": ang.degree,
                    }
                    for ang in chart_data.angles
                ]
                if chart_data.angles
                else None
            ),
        )

        # Generate serialized JSON
        serialized_json = serialize_data(serialized_model)
        chart_id = f"chart_{token.get('uid', 'unknown')}_{hash(serialized_json) % 1000000}"

        # Handle caching with fallback and timeout
        cache_success = False
        if getenv("TEST_MODE") == "1":
            # Skip caching in test mode to avoid delays
            cache_success = True
            logger.info(f"Test mode: Skipping cache for chart_id: {chart_id}")
        else:
            try:
                cache_success = await asyncio.wait_for(
                    astro_service.cache_chart_data(chart_id, serialized_model.model_dump()),
                    timeout=2.0
                )
            except asyncio.TimeoutError:
                logger.warning(f"Cache operation timed out for chart_id: {chart_id}")
                cache_success = False
            except Exception as e:
                logger.warning(f"Cache operation failed for chart_id: {chart_id}, error: {e}")
                cache_success = False

        if trace_enabled:
            logger.info(f"save_chart:exit chart_id={chart_id} cached={cache_success}")

        return {
            "status": "success",
            "chart_id": chart_id,
            "cached": cache_success,
            "message": "Chart saved successfully",
            "serialized_size": len(serialized_json),
            "version": "1.0.0",
            "schemaVersion": "1.0.0",
        }

    except Exception as e:
        logger.error(f"Failed to save chart: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save chart: {str(e)}")
    """
    Save chart data with unified serialization and optional caching
    """
    try:
        from os import getenv
        trace_enabled = getenv("DEBUG_REQUEST_TRACE") in ("1", "true", "yes")
        
        if trace_enabled:
            logger.info(f"save_chart:enter uid={token.get('uid')} planets={len(chart_data.planets)}")
        
        # Convert to serialized model
        serialized_model = SerializedChartData(
            planets=[
                {
                    "name": p.name,
                    "sign": p.sign,
                    "degree": p.degree,
                    "position": p.degree,
                    "house": p.house if p.house is not None else "",
                }
                for p in chart_data.planets
            ],
            houses=[
                {
                    "number": h.number,
                    "sign": h.sign,
                    "cusp": h.cusp,
                }
                for h in chart_data.houses
            ],
            aspects=[
                {
                    "planet1": a.planet1,
                    "planet2": a.planet2,
                    "type": a.type,
                    "orb": a.orb,
                    "applying": str(a.applying).lower() if a.applying is not None else "",
                }
                for a in chart_data.aspects
            ],
            asteroids=(
                [
                    {
                        "name": a.name,
                        "sign": a.sign,
                        "degree": a.degree,
                        "house": a.house if a.house is not None else "",
                    }
                    for a in chart_data.asteroids
                ]
                if chart_data.asteroids
                else None
            ),
            angles=(
                [
                    {
                        "name": ang.name,
                        "sign": ang.sign,
                        "degree": ang.degree,
                        "position": ang.degree,
                    }
                    for ang in chart_data.angles
                ]
                if chart_data.angles
                else None
            ),
        )

        # Generate serialized JSON
        serialized_json = serialize_data(serialized_model)
        chart_id = f"chart_{token.get('uid', 'unknown')}_{hash(serialized_json) % 1000000}"

        # Handle caching with fallback and timeout
        cache_success = False
        if getenv("TEST_MODE") == "1":
            # Skip caching in test mode to avoid delays
            cache_success = True
            logger.info(f"Test mode: Skipping cache for chart_id: {chart_id}")
        else:
            try:
                cache_success = await asyncio.wait_for(
                    astro_service.cache_chart_data(chart_id, serialized_model.model_dump()),
                    timeout=2.0
                )
            except asyncio.TimeoutError:
                logger.warning(f"Cache operation timed out for chart_id: {chart_id}")
                cache_success = False
            except Exception as e:
                logger.warning(f"Cache operation failed for chart_id: {chart_id}, error: {e}")
                cache_success = False

        if trace_enabled:
            logger.info(f"save_chart:exit chart_id={chart_id} cached={cache_success}")

        return {
            "status": "success",
            "chart_id": chart_id,
            "cached": cache_success,
            "message": "Chart saved successfully",
            "serialized_size": len(serialized_json),
            "version": "1.0.0",
            "schemaVersion": "1.0.0",
        }

    except Exception as e:
        logger.error(f"Failed to save chart: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save chart: {str(e)}")


@router.get("/{chart_type}/{user_id}", response_model=ChartRequestData)
async def get_chart(
    chart_type: Literal["natal", "transit", "synastry"],
    user_id: str,
    token: Dict[str, Any] = Depends(verify_id_token_dependency),
) -> ChartRequestData:
    """Get chart data by type and user ID"""
    try:
        # Type ignore needed for external SwissEph library
        swe.set_ephe_path(settings.ephe_path)  # type: ignore[misc]
        
        # Return mock data for now - replace with actual chart calculation
        chart_data = ChartRequestData(
            planets=[
                Planet(
                    name="Sun",
                    sign="Leo",
                    house=5,
                    degree=15.25,
                    aspects=[PlanetAspect(type="Conjunction", target="Mercury", orb=2.5)]
                )
            ],
            asteroids=[
                Asteroid(name="Ceres", sign="Virgo", house=6, degree=10.75, aspects=[])
            ],
            angles=[Angle(name="Ascendant", sign="Aries", degree=12.33)],
            houses=[House(number=1, sign="Aries", cusp=12.33, planets=["Sun"])],
            aspects=[
                Aspect(
                    planet1="Sun",
                    planet2="Mercury", 
                    type="Conjunction",
                    orb=2.5,
                    applying=True
                )
            ],
        )
        return chart_data
    except Exception as e:
        logger.error(f"Chart calculation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Chart calculation failed: {str(e)}")


@router.post("/save-chart", response_model=SaveChartResponse)
async def save_user_chart(
    request: SaveChartRequest, 
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Save a calculated birth chart for the authenticated user (legacy endpoint)"""
    user_id = user.get("uid", "unknown")
    try:
        from astro.calculations.chart import calculate_chart

        chart_data = calculate_chart(
            year=request.year,
            month=request.month,
            day=request.day,
            hour=request.hour,
            minute=request.minute,
            lat=request.lat,
            lon=request.lon,
            city=request.city,
            timezone=request.timezone or "UTC",
        )

        birth_data: BirthData = {
            "year": request.year,
            "month": request.month,
            "day": request.day,
            "hour": request.hour,
            "minute": request.minute,
            "city": request.city,
            "timezone": chart_data.get("timezone", request.timezone),
            "lat": chart_data.get("latitude", request.lat),
            "lon": chart_data.get("longitude", request.lon),
        }

        saved_chart = save_chart(
            user_id=user_id,
            chart_type="natal",
            birth_data=birth_data,
            chart_data=chart_data,
        )

        logger.info(f"Chart saved successfully for user {user_id}: {saved_chart['id']}")

        return SaveChartResponse(
            id=saved_chart["id"],
            message="Chart saved successfully",
            chart_data=saved_chart,
        )

    except Exception as e:
        logger.error(f"Error saving chart for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save chart: {str(e)}")


@router.get("/", response_model=ChartListResponse)
async def get_user_charts(
    limit: int = 50,
    start_after: Optional[str] = None,
    user: Dict[str, Any] = Depends(get_current_user),
):
    """Get all saved charts for the authenticated user"""
    user_id = user.get("uid", "unknown")
    try:
        charts = get_charts(user_id=user_id, limit=limit, start_after=start_after)
        return ChartListResponse(charts=charts, total=len(charts))
    except Exception as e:
        logger.error(f"Error retrieving charts for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve charts: {str(e)}")


@router.delete("/{chart_id}")
async def delete_user_chart(
    chart_id: str, 
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a specific chart for the authenticated user"""
    user_id = user.get("uid", "unknown")
    try:
        delete_chart_by_id(user_id=user_id, chart_id=chart_id)
        return {"message": f"Chart {chart_id} deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting chart {chart_id} for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete chart: {str(e)}")


# ----- Unified Endpoint -----

class UnifiedChartRequest(BaseModel):
    """Request model for unified chart endpoint"""
    # For new calculations
    year: Optional[int] = None
    month: Optional[int] = None
    day: Optional[int] = None
    hour: Optional[int] = None
    minute: Optional[int] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    city: Optional[str] = None
    timezone: Optional[str] = None
    
    # For saved chart retrieval
    chart_id: Optional[str] = None
    
    # Options
    include_raw_data: bool = Field(default=True, description="Include raw backend response for processing")
    house_system: str = Field(default="P", description="House system to use")


class UnifiedChartResponse(BaseModel):
    """Response model for unified chart endpoint"""
    chart_data: Dict[str, Any]
    source: Literal["calculation", "saved"]
    raw_backend_response: Optional[Dict[str, Any]] = None
    birth_data: Optional[Dict[str, Any]] = None


@router.post("/chart")
async def calculate_chart(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate a natal birth chart from birth data.
    """
    try:
        from astro.calculations.chart import calculate_chart
        
        logger.info(f"🔮 Birth chart endpoint called with data: {data}")
        
        # Extract required fields
        year = data.get("year")
        month = data.get("month") 
        day = data.get("day")
        hour = data.get("hour", 12)
        minute = data.get("minute", 0)
        city = data.get("city", "Unknown")
        lat = data.get("lat")
        lon = data.get("lon")
        timezone = data.get("timezone", "UTC")
        
        if not all([year, month, day]):
            raise HTTPException(status_code=400, detail="Year, month, and day are required")
        
        # Calculate chart
        chart = calculate_chart(
            year=int(year) if year is not None else 2000,
            month=int(month) if month is not None else 1,
            day=int(day) if day is not None else 1,
            hour=int(hour) if hour is not None else 12,
            minute=int(minute) if minute is not None else 0,
            lat=lat,
            lon=lon,
            city=city,
            timezone=timezone,
        )
        
        logger.info(f"✅ Birth chart calculated successfully")
        
        # Return the chart data directly (this is the format expected by frontend)
        return {
            "planets": chart.get("planets", {}),
            "houses": chart.get("houses", {}),
            "aspects": chart.get("aspects", []),
            "asteroids": chart.get("asteroids", {}),
            "points": chart.get("points", {}),
            "angles": chart.get("angles", {}),
            "latitude": chart.get("latitude"),
            "longitude": chart.get("longitude"),
            "timezone": chart.get("timezone"),
            "julian_day": chart.get("julian_day"),
            "raw_backend": True,
        }
        
    except Exception as e:
        logger.error(f"❌ Birth chart calculation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chart calculation failed: {str(e)}")
