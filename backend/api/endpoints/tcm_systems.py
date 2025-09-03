# backend/api/endpoints/tcm_systems.py
"""
TCM (Traditional Chinese Medicine) API Endpoints
AI #3: Backend Architecture Specialist Implementation
"""

import logging
from datetime import datetime
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field

# Import TCM calculation engine
try:
    from astro.calculations.tcm_engine import calculate_tcm_constitution, tcm_engine
except ImportError as e:
    logging.error(f"Failed to import TCM engine: {e}")
    # Graceful fallback for development
    def calculate_tcm_constitution(*args, **kwargs) -> Dict[str, Any]:
        return {"error": "TCM engine not available"}
    
    tcm_engine = None

logger = logging.getLogger(__name__)

# Create API router
tcm_router = APIRouter(prefix="/api/tcm", tags=["tcm-systems"])

# ===== REQUEST/RESPONSE MODELS =====

class TCMRequest(BaseModel):
    """TCM constitutional analysis request"""
    year: int = Field(..., ge=1900, le=2100, description="Birth year")
    month: int = Field(..., ge=1, le=12, description="Birth month") 
    day: int = Field(..., ge=1, le=31, description="Birth day")
    hour: int = Field(12, ge=0, le=23, description="Birth hour (24-hour format)")
    minute: int = Field(0, ge=0, le=59, description="Birth minute")
    lat: float = Field(0.0, ge=-90, le=90, description="Birth latitude")
    lon: float = Field(0.0, ge=-180, le=180, description="Birth longitude")
    timezone: str = Field("UTC", description="Birth timezone")
    user_id: Optional[str] = Field(None, description="User identifier")
    include_detailed_analysis: bool = Field(True, description="Include detailed analysis")

class ElementalBalanceResponse(BaseModel):
    """Elemental balance result"""
    wood: float = Field(..., description="Wood element strength (0-1)")
    fire: float = Field(..., description="Fire element strength (0-1)")
    earth: float = Field(..., description="Earth element strength (0-1)") 
    metal: float = Field(..., description="Metal element strength (0-1)")
    water: float = Field(..., description="Water element strength (0-1)")

class ConstitutionAnalysisResponse(BaseModel):
    """Constitutional analysis result"""
    primary_element: str = Field(..., description="Dominant element")
    secondary_element: Optional[str] = Field(None, description="Secondary element")
    constitutional_type: str = Field(..., description="Constitutional type name")
    element_strength: float = Field(..., description="Primary element strength")
    constitution_traits: list[str] = Field(..., description="Constitutional traits")

# ===== API ENDPOINTS =====

@tcm_router.post("/calculate", response_model=Dict[str, Any])
async def calculate_tcm_analysis(request: TCMRequest) -> Dict[str, Any]:
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
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Build response with metadata
        response = {
            "success": True,
            "data": tcm_data,
            "calculation_method": "traditional_chinese_medicine",
            "processing_time_ms": processing_time,
            "api_version": "1.0",
            "generated_at": datetime.now().isoformat(),
            "includes_detailed_analysis": request.include_detailed_analysis
        }
        
        # Add simplified version if not detailed
        if not request.include_detailed_analysis:
            response["data"] = {
                "primary_element": tcm_data.get("primary_element"),
                "elemental_balance": tcm_data.get("elemental_balance"),
                "constitution_analysis": {
                    "constitutional_type": tcm_data.get("constitution_analysis", {}).get("constitutional_type"),
                    "constitution_traits": tcm_data.get("constitution_analysis", {}).get("constitution_traits", [])
                },
                "analysis_confidence": tcm_data.get("analysis_confidence")
            }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in TCM calculation: {e}")
        raise HTTPException(status_code=500, detail=f"TCM calculation failed: {str(e)}")

@tcm_router.post("/elemental-balance", response_model=Dict[str, Any])
async def calculate_elemental_balance_only(
    year: int = Query(..., ge=1900, le=2100),
    month: int = Query(..., ge=1, le=12),
    day: int = Query(..., ge=1, le=31),
    hour: int = Query(12, ge=0, le=23),
    user_id: Optional[str] = Query(None)
) -> Dict[str, Any]:
    """
    Calculate only the Five Element balance (quick analysis)
    """
    try:
        logger.info(f"Calculating elemental balance for {year}-{month}-{day}")
        
        # Use engine directly for just balance calculation
        if tcm_engine:
            elemental_balance = tcm_engine._calculate_elemental_balance(year, month, day, hour)
            primary_element = max(elemental_balance.items(), key=lambda x: x[1])[0]
        else:
            # Fallback calculation
            elemental_balance = {"wood": 0.2, "fire": 0.2, "earth": 0.2, "metal": 0.2, "water": 0.2}
            primary_element = "earth"
        
        return {
            "success": True,
            "elemental_balance": elemental_balance,
            "primary_element": primary_element,
            "element_strength": elemental_balance.get(primary_element, 0.2),
            "quick_analysis": True,
            "user_id": user_id,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in elemental balance calculation: {e}")
        raise HTTPException(status_code=500, detail=f"Elemental balance calculation failed: {str(e)}")

@tcm_router.get("/health-recommendations/{element}")
async def get_health_recommendations(
    element: str = Field(..., description="Element type (wood, fire, earth, metal, water)")
) -> Dict[str, Any]:
    """
    Get health recommendations for specific element type
    """
    try:
        if element.lower() not in ["wood", "fire", "earth", "metal", "water"]:
            raise HTTPException(status_code=400, detail="Invalid element. Must be: wood, fire, earth, metal, water")
        
        element_lower = element.lower()
        
        # Get recommendations from engine
        if tcm_engine:
            dietary_recs = tcm_engine._get_dietary_recommendations(element_lower)
            lifestyle_recs = tcm_engine._get_lifestyle_recommendations(element_lower)
            element_info = tcm_engine.element_data.get(element_lower, {})
        else:
            dietary_recs = ["Balanced diet appropriate for constitution"]
            lifestyle_recs = ["Balanced lifestyle appropriate for constitution"]
            element_info = {}
        
        return {
            "element": element_lower,
            "dietary_recommendations": dietary_recs,
            "lifestyle_recommendations": lifestyle_recs,
            "optimal_season": element_info.get("season", "varies"),
            "balanced_emotion": element_info.get("emotion_balanced", "balance"),
            "dominant_organs": [
                element_info.get("organ_yin", "unknown"),
                element_info.get("organ_yang", "unknown")
            ],
            "generated_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting health recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@tcm_router.get("/element-info/{element}")
async def get_element_info(
    element: str = Field(..., description="Element type")
) -> Dict[str, Any]:
    """
    Get detailed information about a specific element
    """
    try:
        if element.lower() not in ["wood", "fire", "earth", "metal", "water"]:
            raise HTTPException(status_code=400, detail="Invalid element")
        
        element_lower = element.lower()
        
        if tcm_engine and element_lower in tcm_engine.element_data:
            element_info = tcm_engine.element_data[element_lower]
            
            return {
                "element": element_lower,
                "season": element_info.get("season"),
                "organs": {
                    "yin": element_info.get("organ_yin"),
                    "yang": element_info.get("organ_yang")
                },
                "emotions": {
                    "balanced": element_info.get("emotion_balanced"),
                    "imbalanced": element_info.get("emotion_imbalanced")
                },
                "planetary_influences": element_info.get("planets", []),
                "optimal_hours": element_info.get("hours", {}),
                "generated_at": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=404, detail="Element information not available")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting element info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get element info: {str(e)}")

@tcm_router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint for TCM service"""
    return {
        "service": "TCM Systems API",
        "status": "healthy",
        "engine_available": tcm_engine is not None,
        "version": "1.0",
        "timestamp": datetime.now().isoformat()
    }

# ===== ERROR HANDLERS =====

@tcm_router.exception_handler(ValueError)
async def value_error_handler(request, exc):
    logger.error(f"Value error in TCM API: {exc}")
    raise HTTPException(status_code=422, detail=str(exc))

@tcm_router.exception_handler(Exception)  
async def general_error_handler(request, exc):
    logger.error(f"Unexpected error in TCM API: {exc}")
    raise HTTPException(status_code=500, detail="Internal server error")

# Export router
__all__ = ["tcm_router"]
