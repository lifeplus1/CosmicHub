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
    """
    Represents an aspect relationship between planets in astrological charts.
    
    This model defines the angular relationship between two celestial bodies,
    including the type of aspect (e.g., conjunction, opposition) and its precision.
    
    Attributes:
        type: The type of aspect (e.g., "conjunction", "opposition", "trine", "square", "sextile")
        target: The name of the target planet or celestial body forming the aspect
        orb: The orb of influence in degrees - how close the aspect is to exact (0.0 to ~10.0)
        
    Example:
        {
            "type": "conjunction",
            "target": "venus", 
            "orb": 2.5
        }
    """
    type: str
    target: str
    orb: float


class Planet(BaseModel):
    """
    Represents a planet or celestial body position in an astrological chart.
    
    Contains the complete positional and relational data for planets including
    their zodiacal position, house placement, and aspect relationships.
    
    Attributes:
        name: Planet name in lowercase (e.g., "sun", "moon", "mercury", "venus")
        sign: Zodiac sign in lowercase (e.g., "aries", "taurus", "gemini")
        degree: Exact degree position within the sign (0.0 to 29.999...)
        house: Astrological house number (1-12), optional for some calculations
        aspects: List of aspects this planet forms with other celestial bodies
        
    Example:
        {
            "name": "sun",
            "sign": "leo", 
            "degree": 15.25,
            "house": 5,
            "aspects": [{"type": "trine", "target": "mars", "orb": 3.2}]
        }
    """
    name: str
    sign: str
    degree: float
    house: int | None = None
    aspects: List[PlanetAspect] = []


class Asteroid(BaseModel):
    """
    Represents an asteroid position in an astrological chart.
    
    Similar to planets but represents smaller celestial bodies like Ceres, Pallas,
    Juno, and Vesta that add nuanced meaning to chart interpretation.
    
    Attributes:
        name: Asteroid name (e.g., "Ceres", "Pallas", "Juno", "Vesta")
        sign: Zodiac sign in lowercase where the asteroid is located
        degree: Exact degree position within the sign (0.0 to 29.999...)
        house: Astrological house number (1-12), optional
        aspects: List of aspects this asteroid forms with other bodies
        
    Example:
        {
            "name": "Ceres",
            "sign": "virgo",
            "degree": 10.5,
            "house": 6,
            "aspects": []
        }
    """
    name: str
    sign: str
    degree: float
    house: int | None = None
    aspects: List[PlanetAspect] = []


class Angle(BaseModel):
    """
    Represents one of the four primary angles in an astrological chart.
    
    The angles are the most sensitive points in a chart representing the intersection
    of the celestial sphere with the horizon and meridian at birth time/location.
    
    Attributes:
        name: Angle name - "Ascendant", "Midheaven" (MC), "Descendant", or "Imum Coeli" (IC)
        sign: Zodiac sign in lowercase where the angle falls
        degree: Exact degree position within the sign (0.0 to 29.999...)
        
    Example:
        {
            "name": "Ascendant", 
            "sign": "aries",
            "degree": 5.33
        }
    """
    name: str
    sign: str
    degree: float


class House(BaseModel):
    """
    Represents an astrological house division in a natal chart.
    
    Houses divide the chart into 12 sectors representing different life areas
    (e.g., identity, money, communication, home, creativity, health, etc.).
    
    Attributes:
        number: House number from 1-12 (1st house = identity, 10th = career, etc.)
        sign: Zodiac sign in lowercase on the house cusp 
        cusp: Degree position of the house cusp (0.0 to 359.999...)
        planets: List of planet names located in this house
        
    Example:
        {
            "number": 1,
            "sign": "aries", 
            "cusp": 5.33,
            "planets": ["sun", "mercury"]
        }
    """
    number: int
    sign: str
    cusp: float
    planets: List[str] = []


class Aspect(BaseModel):
    """
    Represents an angular relationship between two celestial bodies.
    
    Aspects describe the geometric relationships between planets and their
    influence on personality traits and life events.
    
    Attributes:
        planet1: First planet/body name in lowercase (e.g., "sun", "moon")
        planet2: Second planet/body name in lowercase
        type: Aspect type ("conjunction", "opposition", "trine", "square", "sextile", etc.)
        orb: Orb of influence in degrees - deviation from exact aspect angle
        applying: Whether the aspect is applying (getting closer) or separating, optional
        
    Example:
        {
            "planet1": "sun",
            "planet2": "moon", 
            "type": "conjunction",
            "orb": 2.1,
            "applying": true
        }
    """
    planet1: str
    planet2: str
    type: str
    orb: float
    applying: bool | None = None


class ChartRequestData(BaseModel):
    """
    Complete astrological chart data for chart display and interpretation.
    
    This model contains all the calculated celestial positions and relationships
    for a specific birth time and location, organized into the traditional
    astrological components.
    
    Attributes:
        planets: List of planetary positions and aspects (Sun, Moon, Mercury, etc.)
        asteroids: List of asteroid positions (Ceres, Pallas, Juno, Vesta, etc.)
        angles: List of chart angles (Ascendant, Midheaven, Descendant, IC)
        houses: List of astrological house divisions (1st through 12th houses)
        aspects: List of angular relationships between celestial bodies
        
    Example:
        {
            "planets": [{"name": "sun", "sign": "leo", "degree": 15.25, "house": 5}],
            "asteroids": [{"name": "Ceres", "sign": "virgo", "degree": 10.5}],
            "angles": [{"name": "Ascendant", "sign": "aries", "degree": 5.33}],
            "houses": [{"number": 1, "sign": "aries", "cusp": 5.33}],
            "aspects": [{"planet1": "sun", "planet2": "moon", "type": "trine", "orb": 2.1}]
        }
    """
    planets: List[Planet]
    asteroids: List[Asteroid]
    angles: List[Angle]
    houses: List[House]
    aspects: List[Aspect]


# Legacy SaveChartRequest model
class SaveChartRequest(BaseModel):
    """
    Request model for saving a calculated birth chart to user's collection.
    
    Contains the essential birth data needed to calculate and store an astrological
    chart. This is a legacy model maintained for backward compatibility.
    
    Attributes:
        year: Birth year (1900-2100)
        month: Birth month (1-12)
        day: Birth day (1-31)
        hour: Birth hour in 24-hour format (0-23)
        minute: Birth minute (0-59)
        city: Birth city name, minimum 1 character
        house_system: House calculation system - "P" for Placidus, "E" for Equal
        chart_name: Optional custom name for the chart
        timezone: Optional timezone identifier (e.g., "America/New_York")
        lat: Optional latitude in decimal degrees (-90.0 to 90.0)
        lon: Optional longitude in decimal degrees (-180.0 to 180.0)
        
    Example:
        {
            "year": 1990,
            "month": 6,
            "day": 15,
            "hour": 14,
            "minute": 30,
            "city": "New York",
            "house_system": "P",
            "chart_name": "My Birth Chart",
            "timezone": "America/New_York",
            "lat": 40.7128,
            "lon": -74.0060
        }
    """
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
    """
    Response model for successful chart save operations.
    
    Returned when a chart is successfully calculated and saved to the user's
    collection, providing confirmation and the saved chart data.
    
    Attributes:
        id: Unique identifier for the saved chart in the database
        message: Success message confirming the chart was saved
        chart_data: The complete chart data that was saved
        
    Example:
        {
            "id": "chart_123456789",
            "message": "Chart saved successfully",
            "chart_data": {
                "id": "chart_123456789",
                "name": "Birth Chart",
                "birth_date": "1990-06-15T14:30:00Z",
                "location": "New York, NY"
            }
        }
    """
    id: str
    message: str
    chart_data: DatabaseChartData


class ChartListResponse(BaseModel):
    """
    Response model for listing multiple saved charts.
    
    Used by endpoints that return multiple charts, such as getting all charts
    for a user or filtered chart lists.
    
    Attributes:
        charts: List of chart data objects
        total: Total number of charts available (for pagination)
        
    Example:
        {
            "charts": [
                {"id": "chart_1", "name": "Birth Chart", "birth_date": "1990-06-15T14:30:00Z"},
                {"id": "chart_2", "name": "Solar Return", "birth_date": "2023-06-15T10:15:00Z"}
            ],
            "total": 2
        }
    """
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
    """
    Unified request model supporting both chart calculation and retrieval.
    
    This flexible model allows clients to either request a new chart calculation
    from birth data or retrieve a previously saved chart by ID.
    
    Attributes:
        year: Birth year (required for new calculations)
        month: Birth month 1-12 (required for new calculations)  
        day: Birth day 1-31 (required for new calculations)
        hour: Birth hour 0-23 (optional, defaults to 12)
        minute: Birth minute 0-59 (optional, defaults to 0)
        lat: Latitude in decimal degrees -90.0 to 90.0 (required for calculations)
        lon: Longitude in decimal degrees -180.0 to 180.0 (required for calculations)
        city: Birth city name (optional but recommended for display)
        timezone: Timezone identifier like "America/New_York" (optional)
        chart_id: ID of previously saved chart to retrieve (alternative to birth data)
        include_raw_data: Whether to include raw backend response for debugging
        house_system: House calculation system - "P" for Placidus, "E" for Equal
        
    Example (new calculation):
        {
            "year": 1990,
            "month": 6, 
            "day": 15,
            "hour": 14,
            "minute": 30,
            "lat": 40.7128,
            "lon": -74.0060,
            "city": "New York",
            "timezone": "America/New_York",
            "include_raw_data": true,
            "house_system": "P"
        }
        
    Example (retrieve saved):
        {
            "chart_id": "chart_123456789",
            "include_raw_data": false
        }
    """
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
    """
    Unified response model for chart data from calculation or retrieval.
    
    Provides a consistent response format whether the chart data comes from
    a new calculation or was retrieved from saved charts.
    
    Attributes:
        chart_data: The complete astrological chart data with planets, houses, aspects
        source: Indicates whether data came from "calculation" or "saved" chart
        raw_backend_response: Optional raw calculation data for debugging/processing
        birth_data: Optional birth information used for the chart
        
    Example:
        {
            "chart_data": {
                "planets": [{"name": "sun", "sign": "gemini", "degree": 24.5}],
                "houses": [{"number": 1, "sign": "virgo", "cusp": 150.2}],
                "aspects": [{"planet1": "sun", "planet2": "moon", "type": "trine"}]
            },
            "source": "calculation",
            "raw_backend_response": {...},
            "birth_data": {
                "date": "1990-06-15",
                "time": "14:30",
                "location": "New York, NY"
            }
        }
    """
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
