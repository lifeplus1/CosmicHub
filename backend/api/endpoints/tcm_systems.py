# backend/api/endpoints/tcm_systems.py
"""
TCM (Traditional Chinese Medicine) API Endpoints
AI #3: Backend Architecture Specialist Implementation
"""

import logging
from datetime import datetime
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Query, Path

# Import centralized TCM types
from backend.types.tcm_systems import (
    TCMRequest,
    TCMAnalysisResponse,
    ElementalBalanceResponse,
    HealthRecommendationsResponse,
    ElementInfoResponse,
    ElementInfo,
    TCMHealthCheck
)

# Import TCM calculation engine
try:
    from astro.calculations.tcm_engine import calculate_tcm_constitution, tcm_engine
except ImportError as e:
    logging.error(f"Failed to import TCM engine: {e}")
    # Graceful fallback for development
    def calculate_tcm_constitution(*args: Any, **kwargs: Any) -> Dict[str, Any]:
        return {"error": "TCM engine not available"}
    
    tcm_engine = None

# Import type bridge for safe conversions
from backend.api.bridges.tcm_type_bridge import (
    TCMTypeBridge,
    safe_get_element_data_typed
)

logger = logging.getLogger(__name__)

# ===== HELPER FUNCTIONS =====

def safe_call_engine_method(engine: Any, method_name: str, *args: Any) -> Any:
    """Safely call engine methods with fallback"""
    if engine and hasattr(engine, method_name):
        method = getattr(engine, method_name)
        if callable(method):
            return method(*args)
    return None

# Create API router
tcm_router: APIRouter = APIRouter(prefix="/api/tcm", tags=["tcm-systems"])

# ===== API ENDPOINTS =====

@tcm_router.post("/calculate", response_model=TCMAnalysisResponse)
async def calculate_tcm_analysis(request: TCMRequest) -> TCMAnalysisResponse:
    """
    Calculate complete TCM constitutional analysis
    
    This endpoint provides:
    - Five Element constitutional analysis
    - Organ system strength assessment  
    - Health and lifestyle recommendations
    - Seasonal adjustment guidance
    - Astrological correlations with TCM
    """
    try:
        start_time = datetime.now()
        logger.info(f"Calculating TCM analysis for {request.year}-{request.month}-{request.day}")
        
        # Calculate TCM constitutional analysis
        tcm_data = calculate_tcm_constitution(
            request.year,
            request.month,
            request.day,
            request.hour,
            request.minute,
            request.lat,
            request.lon,
            request.timezone,
            request.user_id
        )
        
        # Check for calculation errors
        if "error" in tcm_data:
            raise HTTPException(status_code=400, detail=tcm_data["error"])
        
        # Convert raw engine data to typed calculation data  
        typed_data = TCMTypeBridge.engine_to_calculation_data(tcm_data)
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Create properly typed response using type bridge
        return TCMTypeBridge.create_tcm_analysis_response(
            tcm_data=typed_data,
            processing_time_ms=processing_time,
            includes_detailed_analysis=request.include_detailed_analysis,
            generated_at=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in TCM calculation: {e}")
        raise HTTPException(status_code=500, detail=f"TCM calculation failed: {str(e)}")

@tcm_router.post("/elemental-balance", response_model=ElementalBalanceResponse)
async def calculate_elemental_balance_only(
    year: int = Query(..., ge=1900, le=2100),
    month: int = Query(..., ge=1, le=12),
    day: int = Query(..., ge=1, le=31),
    hour: int = Query(12, ge=0, le=23),
    user_id: Optional[str] = Query(None)
) -> ElementalBalanceResponse:
    """
    Calculate only the Five Element balance (quick analysis)
    """
    try:
        logger.info(f"Calculating elemental balance for {year}-{month}-{day}")
        
        # Use engine directly for just balance calculation
        elemental_balance: Dict[str, float]
        
        if tcm_engine:
            elemental_balance = safe_call_engine_method(tcm_engine, '_calculate_elemental_balance', year, month, day, hour) or {}
            if not elemental_balance:
                elemental_balance = {"wood": 0.2, "fire": 0.2, "earth": 0.2, "metal": 0.2, "water": 0.2}
        else:
            # Fallback calculation
            elemental_balance = {"wood": 0.2, "fire": 0.2, "earth": 0.2, "metal": 0.2, "water": 0.2}
        
        # Create elemental balance response using type bridge
        balance_response = TCMTypeBridge.create_elemental_balance_response(elemental_balance)
        
        # Update with additional metadata
        balance_response.user_id = user_id
        balance_response.generated_at = datetime.now().isoformat()
        
        return balance_response
        
    except Exception as e:
        logger.error(f"Error in elemental balance calculation: {e}")
        raise HTTPException(status_code=500, detail=f"Elemental balance calculation failed: {str(e)}")

@tcm_router.get("/health-recommendations/{element}", response_model=HealthRecommendationsResponse)
async def get_health_recommendations(
    element: str = Path(..., description="Element type (wood, fire, earth, metal, water)")
) -> HealthRecommendationsResponse:
    """
    Get health recommendations for specific element type
    """
    try:
        if element.lower() not in ["wood", "fire", "earth", "metal", "water"]:
            raise HTTPException(status_code=400, detail="Invalid element. Must be: wood, fire, earth, metal, water")
        
        element_lower = element.lower()
        
        # Get recommendations from engine
        if tcm_engine:
            dietary_recs = safe_call_engine_method(tcm_engine, '_get_dietary_recommendations', element_lower) or ["Balanced diet appropriate for constitution"]
            lifestyle_recs = safe_call_engine_method(tcm_engine, '_get_lifestyle_recommendations', element_lower) or ["Balanced lifestyle appropriate for constitution"]
            element_info: ElementInfo = safe_get_element_data_typed(tcm_engine, element_lower)
        else:
            dietary_recs = ["Balanced diet appropriate for constitution"]
            lifestyle_recs = ["Balanced lifestyle appropriate for constitution"]
            element_info: ElementInfo = ElementInfo()
        
        return TCMTypeBridge.create_health_recommendations_response(
            element=element_lower,
            dietary_recommendations=dietary_recs,
            lifestyle_recommendations=lifestyle_recs,
            element_info=element_info,
            generated_at=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting health recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@tcm_router.get("/element-info/{element}", response_model=ElementInfoResponse)
async def get_element_info(
    element: str = Path(..., description="Element type")
) -> ElementInfoResponse:
    """
    Get detailed information about a specific element
    """
    try:
        if element.lower() not in ["wood", "fire", "earth", "metal", "water"]:
            raise HTTPException(status_code=400, detail="Invalid element")
        
        element_lower = element.lower()
        
        if tcm_engine:
            element_info: ElementInfo = safe_get_element_data_typed(tcm_engine, element_lower)
            
            if element_info.season or element_info.organ_yin or element_info.organ_yang:  # Check if we have actual data
                return TCMTypeBridge.create_element_info_response(
                    element=element_lower,
                    element_info=element_info,
                    generated_at=datetime.now().isoformat()
                )
            else:
                raise HTTPException(status_code=404, detail="Element information not available")
        else:
            raise HTTPException(status_code=404, detail="Element information not available")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting element info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get element info: {str(e)}")

@tcm_router.get("/health", response_model=TCMHealthCheck)
async def health_check() -> TCMHealthCheck:
    """Health check endpoint for TCM service"""
    return TCMHealthCheck(
        service="TCM Systems API",
        status="healthy",
        engine_available=tcm_engine is not None,
        version="1.0",
        timestamp=datetime.now().isoformat()
    )

# ===== ERROR HANDLERS =====
# Note: Exception handlers should be on the main FastAPI app, not the router
# These can be added to main.py if needed

# @app.exception_handler(ValueError)
# async def value_error_handler(request, exc):
#     logger.error(f"Value error in TCM API: {exc}")
#     raise HTTPException(status_code=422, detail=str(exc))

# @app.exception_handler(Exception)  
# async def general_error_handler(request, exc):
#     logger.error(f"Unexpected error in TCM API: {exc}")
#     raise HTTPException(status_code=500, detail="Internal server error")

# Export router
__all__ = ["tcm_router"]
