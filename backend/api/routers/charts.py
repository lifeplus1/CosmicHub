# backend/api/routers/charts.py
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from database import save_chart, get_charts, delete_chart_by_id, ChartData, BirthData
from auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/charts", tags=["charts"])

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
    chart_data: ChartData

class ChartListResponse(BaseModel):
    charts: List[ChartData]
    total: int

@router.post("/save-chart", response_model=SaveChartResponse)
async def save_user_chart(
    request: SaveChartRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Save a calculated birth chart for the authenticated user"""
    user_id = user.get("uid", "unknown")
    try:
        # Import here to avoid circular imports
        from astro.calculations.chart import calculate_chart
        
        # Calculate the chart first
        chart_data = calculate_chart(
            year=request.year,
            month=request.month,
            day=request.day,
            hour=request.hour,
            minute=request.minute,
            lat=request.lat,
            lon=request.lon,
            city=request.city,
            timezone=request.timezone or "UTC"
        )
        
        # Prepare birth data
        birth_data: BirthData = {
            "year": request.year,
            "month": request.month,
            "day": request.day,
            "hour": request.hour,
            "minute": request.minute,
            "city": request.city,
            "timezone": chart_data.get("timezone", request.timezone),
            "lat": chart_data.get("latitude", request.lat),
            "lon": chart_data.get("longitude", request.lon)
        }
        
        # Save to database
        saved_chart = save_chart(
            user_id=user_id,
            chart_type="natal",
            birth_data=birth_data,
            chart_data=chart_data
        )
        
        logger.info(f"Chart saved successfully for user {user_id}: {saved_chart['id']}")
        
        return SaveChartResponse(
            id=saved_chart["id"],
            message="Chart saved successfully",
            chart_data=saved_chart
        )
        
    except Exception as e:
        logger.error(f"Error saving chart for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save chart: {str(e)}")

@router.post("/test-save-chart", response_model=SaveChartResponse)
async def test_save_user_chart(request: SaveChartRequest):
    """Test save chart endpoint without authentication - for development only"""
    try:
        # Import here to avoid circular imports
        from astro.calculations.chart import calculate_chart
        
        # Use a test user ID
        user_id = "test_user_dev_123"
        
        # Calculate the chart first
        chart_data = calculate_chart(
            year=request.year,
            month=request.month,
            day=request.day,
            hour=request.hour,
            minute=request.minute,
            lat=request.lat,
            lon=request.lon,
            city=request.city,
            timezone=request.timezone or "UTC"
        )
        
        # Prepare birth data
        birth_data: BirthData = {
            "year": request.year,
            "month": request.month,
            "day": request.day,
            "hour": request.hour,
            "minute": request.minute,
            "city": request.city,
            "timezone": chart_data.get("timezone", request.timezone),
            "lat": chart_data.get("latitude", request.lat),
            "lon": chart_data.get("longitude", request.lon)
        }
        
        # Save to database
        saved_chart = save_chart(
            user_id=user_id,
            chart_type="natal",
            birth_data=birth_data,
            chart_data=chart_data
        )
        
        logger.info(f"Test chart saved successfully for user {user_id}: {saved_chart['id']}")
        
        return SaveChartResponse(
            id=saved_chart["id"],
            message="Test chart saved successfully",
            chart_data=saved_chart
        )
        
    except Exception as e:
        logger.error(f"Error saving test chart: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save test chart: {str(e)}")

@router.get("/", response_model=ChartListResponse)
async def get_user_charts(
    limit: int = 50,
    start_after: Optional[str] = None,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Get all saved charts for the authenticated user"""
    user_id = user.get("uid", "unknown")
    try:
        charts = get_charts(user_id=user_id, limit=limit, start_after=start_after)
        
        return ChartListResponse(
            charts=charts,
            total=len(charts)
        )
        
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
