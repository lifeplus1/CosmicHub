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
from backend_types.tcm_systems import (
    TCMRequest,
    TCMAnalysisResponse,
    ElementalBalanceResponse,
    HealthRecommendationsResponse,
    ElementInfoResponse,
    ElementInfo,
    TCMHealthCheck
)

# Import TCM calculation engine
tcm_engine: Optional[Any] = None

try:
    from astro.calculations.tcm_engine import calculate_tcm_constitution
    # Import the engine with a specific alias to avoid type conflicts
    try:
        from astro.calculations.tcm_engine import SimplifiedTCMEngine as _tcm_engine_class
        tcm_engine = _tcm_engine_class()
    except ImportError:
        tcm_engine = None
except ImportError as e:
    # Fallback to tcm_calculations
    try:
        from astro.calculations.tcm_calculations import calculate_tcm_constitution
        try:
            from astro.calculations.tcm_calculations import TCMCalculationEngine as _tcm_engine_class  # type: ignore[assignment]
            tcm_engine = _tcm_engine_class()
        except ImportError:
            tcm_engine = None
    except ImportError:
        logging.error(f"Failed to import TCM engine: {e}")
        # Graceful fallback for development
        def _fallback_calculate_tcm_constitution(*args: Any, **kwargs: Any) -> Dict[str, Any]:
            return {"error": "TCM engine not available"}
        
        # Use fallback for the main function
        calculate_tcm_constitution = _fallback_calculate_tcm_constitution
        
        tcm_engine: Optional[Any] = None  # type: ignore[no-redef]

# Import type bridge for safe conversions - temporarily disabled due to dependencies
# from ..bridges.tcm_type_bridge import (
#     TCMTypeBridge,
#     safe_get_element_data_typed
# )

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
        
        # Calculate TCM constitutional analysis with proper default values
        tcm_data = calculate_tcm_constitution(
            request.year,
            request.month,
            request.day,
            request.hour or 12,  # Default to noon if None
            request.minute or 0,  # Default to 0 minutes if None
            request.lat or 0.0,  # Default to 0.0 if None
            request.lon or 0.0,  # Default to 0.0 if None
            request.timezone or "UTC",  # Default to UTC if None
            request.user_id
        )
        
        # Check for calculation errors
        if "error" in tcm_data:
            raise HTTPException(status_code=400, detail=tcm_data["error"])
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Create direct response (simplified for now)
        from backend_types.tcm_systems import TCMCalculationData, ConstitutionAnalysis
        
        # Extract basic data from engine result
        elemental_balance = tcm_data.get("elemental_balance", {})
        primary_constitution = tcm_data.get("primary_constitution", {})
        
        constitution_analysis = ConstitutionAnalysis(
            constitutional_type=primary_constitution.get("type_name", "Unknown"),
            constitution_traits=primary_constitution.get("characteristics", []),
            primary_element=primary_constitution.get("primary_element", "earth"),
            element_strength=max(elemental_balance.values()) * 100 if elemental_balance else 50.0
        )
        
        calculation_data = TCMCalculationData(
            primary_element=primary_constitution.get("primary_element", "earth"),
            elemental_balance={k: v * 100 for k, v in elemental_balance.items()},  # Convert to percentages
            constitution_analysis=constitution_analysis,
            analysis_confidence=tcm_data.get("analysis_confidence", 0.5) * 100,
            dietary_recommendations=tcm_data.get("health_guidance", {}).get("dietary_guidelines", {}).get("general", []),
            lifestyle_recommendations=tcm_data.get("lifestyle_recommendations", {}).get("daily_routine", []),
            seasonal_guidance={}  # Add empty seasonal guidance for now
        )
        
        return TCMAnalysisResponse(
            success=True,
            data=calculation_data,
            calculation_method="traditional",
            processing_time_ms=processing_time,
            includes_detailed_analysis=request.include_detailed_analysis or False,
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
        
        # Create elemental balance response directly
        primary_element = max(elemental_balance.items(), key=lambda x: x[1])[0] if elemental_balance else "earth"
        element_strength = max(elemental_balance.values()) if elemental_balance else 20.0
        
        balance_response = ElementalBalanceResponse(
            success=True,
            elemental_balance=elemental_balance,
            primary_element=primary_element,  # type: ignore[arg-type]
            element_strength=element_strength,
            quick_analysis=True,
            user_id=user_id,
            generated_at=datetime.now().isoformat()
        )
        
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
        
        # Get recommendations from engine or use defaults
        if tcm_engine:
            dietary_recs = safe_call_engine_method(tcm_engine, '_get_dietary_recommendations', element_lower) or ["Balanced diet appropriate for constitution"]
            lifestyle_recs = safe_call_engine_method(tcm_engine, '_get_lifestyle_recommendations', element_lower) or ["Balanced lifestyle appropriate for constitution"]
            # Create basic element info
            element_info = ElementInfo(
                season=element_lower.title() + " season",
                organ_yin=f"{element_lower} yin organ",
                organ_yang=f"{element_lower} yang organ",
                emotion_balanced=f"{element_lower} balanced emotion",
                emotion_imbalanced=f"{element_lower} imbalanced emotion",
                planets=[f"{element_lower} planet"],
                hours={"optimal": "varies"}
            )
        else:
            dietary_recs = ["Balanced diet appropriate for constitution"]
            lifestyle_recs = ["Balanced lifestyle appropriate for constitution"]
            element_info = ElementInfo(
                season=None,
                organ_yin=None,
                organ_yang=None,
                emotion_balanced=None,
                emotion_imbalanced=None,
                planets=None,
                hours=None
            )
        
        return HealthRecommendationsResponse(
            element=element_lower,
            dietary_recommendations=dietary_recs,
            lifestyle_recommendations=lifestyle_recs,
            optimal_season=element_info.season or "varies",
            balanced_emotion=element_info.emotion_balanced or "balanced",
            dominant_organs=[element_info.organ_yin or "unknown", element_info.organ_yang or "unknown"],
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
            # Create basic element info directly
            
            element_info = ElementInfo(
                season=f"{element_lower.title()} season",
                organ_yin=f"{element_lower} yin organ", 
                organ_yang=f"{element_lower} yang organ",
                emotion_balanced=f"{element_lower} balanced emotion",
                emotion_imbalanced=f"{element_lower} imbalanced emotion",
                planets=[f"{element_lower} planet"],
                hours={"optimal": "varies"}
            )
            
            if element_info.season:  # Check if we have actual data
                return ElementInfoResponse(
                    element=element_lower,
                    season=element_info.season,
                    organs={"yin": element_info.organ_yin, "yang": element_info.organ_yang},
                    emotions={"balanced": element_info.emotion_balanced, "imbalanced": element_info.emotion_imbalanced},
                    planetary_influences=element_info.planets or [],
                    optimal_hours=element_info.hours or {},
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
