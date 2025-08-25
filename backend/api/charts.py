# backend/api/routers/charts_consolidated.py
"""
Consolidated Charts API Router
Combines functionality from both charts.py files with improved error handling
"""
import logging
import json
from typing import Any, Dict, List, Optional, Literal

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
import swisseph as swe
from typing import cast

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


class ChartData(BaseModel):
    planets: List[Planet]
    asteroids: List[Asteroid]
    angles: List[Angle]
    houses: List[House]
    aspects: List[Aspect]


# Legacy SaveChartRequest model
class SaveChartRequest(BaseModel):
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
    id: str
    message: str
    chart_data: DatabaseChartData


class ChartListResponse(BaseModel):
    charts: List[DatabaseChartData]
    total: int


# ----- Authentication Dependencies -----

def verify_id_token_dependency(
    authorization: str | None = Header(default=None, alias="Authorization")
) -> Dict[str, Any]:
    import os
    
    if os.environ.get("TEST_MODE") == "1":
        return {"uid": "dev-user"}
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    
    token_str = (
        authorization.split("Bearer ")[-1]
        if "Bearer " in authorization
        else authorization
    )
    
    try:
        # Import Firebase only when needed (not in test mode)
        from firebase_admin import auth
        decoded_token = auth.verify_id_token(token_str)  # type: ignore[no-any-return]
        return cast(Dict[str, Any], decoded_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


# ----- Endpoints -----

@router.post("/save", response_model=Dict[str, Any])
async def save_chart_unified(
    chart_data: ChartData,
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
        
        # Generate deterministic-ish ID from planets payload  
        planets_key = f"{len(chart_data.planets)}_{chart_data.planets[0].name if chart_data.planets else 'none'}"
        chart_id = f"chart_{token.get('uid', 'unknown')}_{hash(planets_key) % 1000000}"

        # Build minimal cache payload matching interpretation expectations
        cache_payload: Dict[str, Any] = {
            "planets": [
                {
                    "name": p.name,
                    "sign": p.sign.lower(),
                    # store as degree plus 'position' for downstream normalization
                    "degree": p.degree,
                    "position": p.degree,
                    "house": p.house,
                }
                for p in chart_data.planets
            ],
            "houses": [
                {
                    "number": h.number,
                    "sign": h.sign.lower(),
                    "cusp": h.cusp,
                }
                for h in chart_data.houses
            ],
            "aspects": [
                {
                    "planet1": a.planet1,
                    "planet2": a.planet2,
                    "type": a.type,
                    "orb": a.orb,
                    "applying": a.applying,
                }
                for a in chart_data.aspects
            ],
            "version": "1.0.0",
            "schemaVersion": "1.0.0",
        }

        # Cache it so /interpretations/generate can find it
        cached_ok = False
        try:
            # Very small timeout philosophy handled by caller; in-memory is instant
            cached_ok = await astro_service.cache_chart_data(chart_id, cache_payload)
        except Exception as cache_err:  # pragma: no cover - defensive
            logger.warning(f"Chart cache failed id={chart_id} err={cache_err}")

        serialized_size = len(json.dumps(cache_payload))

        if trace_enabled:
            logger.info(
                f"save_chart:exit chart_id={chart_id} cached={cached_ok} size={serialized_size}"
            )

        return {
            "status": "success",
            "chart_id": chart_id,
            "cached": cached_ok,
            "message": "Chart saved successfully",
            "serialized_size": serialized_size,
            "version": "1.0.0",
            "schemaVersion": "1.0.0",
        }

    except Exception as e:
        logger.error(f"Failed to save chart: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save chart: {str(e)}")


@router.get("/{chart_type}/{user_id}", response_model=ChartData)
async def get_chart(
    chart_type: Literal["natal", "transit", "synastry"],
    user_id: str,
    token: Dict[str, Any] = Depends(verify_id_token_dependency),
) -> ChartData:
    """Get chart data by type and user ID"""
    try:
        swe.set_ephe_path(settings.ephe_path)  # type: ignore[attr-defined]
        
        # Return mock data for now - replace with actual chart calculation
        chart_data = ChartData(
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
