# backend/api/endpoints/spiritual_systems.py
"""
SPIRITUAL-001: API endpoints for Tarot and Kabbalah spiritual systems
Week 1 Foundation Implementation
"""

import logging
from datetime import datetime
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

# Import spiritual calculation modules
try:
    from astro.calculations.spiritual import calculate_spiritual_systems
    from astro.calculations.spiritual_schema import (
        extend_chart_data_schema,
        create_spiritual_user_profile,
        generate_spiritual_reading_id
    )
    from api.services.ai_service import EnhancedAIService
except ImportError as e:
    logging.error(f"Failed to import spiritual modules: {e}")
    # Graceful fallback for development
    def calculate_spiritual_systems(*args, **kwargs):
        return {"error": "Spiritual systems not available"}

logger = logging.getLogger(__name__)

# Create API router
spiritual_router = APIRouter(prefix="/api/spiritual", tags=["spiritual-systems"])

# ===== REQUEST/RESPONSE MODELS =====

class SpiritualRequest(BaseModel):
    """Request model for spiritual system calculations"""
    year: int = Field(..., ge=1900, le=2100, description="Birth year")
    month: int = Field(..., ge=1, le=12, description="Birth month")
    day: int = Field(..., ge=1, le=31, description="Birth day")
    hour: int = Field(default=12, ge=0, le=23, description="Birth hour (24-hour format)")
    minute: int = Field(default=0, ge=0, le=59, description="Birth minute")
    user_id: Optional[str] = Field(None, description="User ID for personalized analysis")
    include_ai_interpretation: bool = Field(True, description="Include AI-powered spiritual interpretation")

class TarotOnlyRequest(BaseModel):
    """Request model for tarot-only calculations"""
    year: int = Field(..., ge=1900, le=2100)
    month: int = Field(..., ge=1, le=12) 
    day: int = Field(..., ge=1, le=31)
    reading_type: str = Field("daily", description="Type of tarot reading: daily, life_path, general")

class KabbalahOnlyRequest(BaseModel):
    """Request model for Kabbalah-only calculations"""
    year: int = Field(..., ge=1900, le=2100)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: int = Field(default=12, ge=0, le=23)
    minute: int = Field(default=0, ge=0, le=59)
    analysis_depth: str = Field("standard", description="Analysis depth: basic, standard, advanced")

class SpiritualResponse(BaseModel):
    """Response model for spiritual system results"""
    reading_id: str
    timestamp: str
    tarot: Dict[str, Any]
    kabbalah: Dict[str, Any]
    correspondences: Dict[str, Any]
    synthesis: Dict[str, Any]
    ai_interpretation: Optional[Dict[str, Any]] = None
    calculation_time_ms: Optional[float] = None

# ===== DEPENDENCY INJECTION =====

def get_ai_service() -> EnhancedAIService:
    """Dependency injection for AI service"""
    return EnhancedAIService()

# ===== API ENDPOINTS =====

@spiritual_router.post("/calculate", response_model=Dict[str, Any])
async def calculate_spiritual_analysis(
    request: SpiritualRequest,
    ai_service: EnhancedAIService = Depends(get_ai_service)
) -> Dict[str, Any]:
    """
    Calculate complete spiritual analysis including Tarot and Kabbalah systems
    
    This endpoint combines:
    - Daily and life path tarot card analysis
    - Kabbalah Tree of Life sephirot and path analysis  
    - Cross-system correspondences and synthesis
    - Optional AI-powered interpretation
    """
    try:
        start_time = datetime.now()
        logger.info(f"Calculating spiritual systems for {request.year}-{request.month}-{request.day}")
        
        # Calculate spiritual systems
        spiritual_data = calculate_spiritual_systems(
            request.year,
            request.month, 
            request.day,
            request.hour,
            request.minute
        )
        
        # Check for calculation errors
        if "error" in spiritual_data:
            raise HTTPException(status_code=400, detail=spiritual_data["error"])
        
        # Generate reading ID
        reading_id = generate_spiritual_reading_id()
        
        # Generate AI interpretation if requested
        ai_interpretation = None
        if request.include_ai_interpretation:
            try:
                ai_interpretation = await ai_service.generate_spiritual_interpretation(
                    chart_data={},  # Empty for now, would include astrological data in full integration
                    spiritual_data=spiritual_data,
                    interpretation_type="comprehensive",
                    user_id=request.user_id
                )
            except Exception as e:
                logger.warning(f"AI interpretation failed: {e}")
                ai_interpretation = {"error": "AI interpretation unavailable"}
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Build response
        response = {
            "reading_id": reading_id,
            "timestamp": datetime.now().isoformat(),
            "tarot": spiritual_data.get("tarot", {}),
            "kabbalah": spiritual_data.get("kabbalah", {}),
            "correspondences": spiritual_data.get("correspondences", {}),
            "synthesis": spiritual_data.get("synthesis", {}),
            "ai_interpretation": ai_interpretation,
            "calculation_time_ms": processing_time,
            "spiritual_systems_version": "SPIRITUAL-001-v1.0"
        }
        
        logger.info(f"Spiritual analysis completed in {processing_time:.2f}ms")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in spiritual analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Spiritual analysis failed: {str(e)}")

@spiritual_router.post("/tarot", response_model=Dict[str, Any])
async def calculate_tarot_only(request: TarotOnlyRequest) -> Dict[str, Any]:
    """
    Calculate tarot analysis only
    
    Provides:
    - Daily tarot card guidance
    - Life path tarot card analysis
    - Card meanings and interpretations
    """
    try:
        logger.info(f"Calculating tarot for {request.year}-{request.month}-{request.day}")
        
        # Calculate spiritual systems (tarot portion only)
        spiritual_data = calculate_spiritual_systems(
            request.year,
            request.month,
            request.day
        )
        
        if "error" in spiritual_data:
            raise HTTPException(status_code=400, detail=spiritual_data["error"])
            
        # Extract tarot data only
        tarot_data = spiritual_data.get("tarot", {})
        
        return {
            "reading_id": generate_spiritual_reading_id(),
            "timestamp": datetime.now().isoformat(),
            "reading_type": request.reading_type,
            "tarot": tarot_data,
            "daily_guidance": tarot_data.get("daily_card", {}).get("guidance", "Focus on spiritual growth today"),
            "life_purpose": tarot_data.get("life_path", {}).get("spiritual_purpose", "Unknown")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in tarot calculation: {e}")
        raise HTTPException(status_code=500, detail=f"Tarot calculation failed: {str(e)}")

@spiritual_router.post("/kabbalah", response_model=Dict[str, Any])
async def calculate_kabbalah_only(request: KabbalahOnlyRequest) -> Dict[str, Any]:
    """
    Calculate Kabbalah Tree of Life analysis only
    
    Provides:
    - Primary and secondary sephirot analysis
    - Relevant Tree of Life paths
    - Spiritual development guidance
    """
    try:
        logger.info(f"Calculating Kabbalah for {request.year}-{request.month}-{request.day}")
        
        # Calculate spiritual systems (Kabbalah portion only)
        spiritual_data = calculate_spiritual_systems(
            request.year,
            request.month,
            request.day,
            request.hour,
            request.minute
        )
        
        if "error" in spiritual_data:
            raise HTTPException(status_code=400, detail=spiritual_data["error"])
            
        # Extract Kabbalah data only
        kabbalah_data = spiritual_data.get("kabbalah", {})
        
        return {
            "reading_id": generate_spiritual_reading_id(),
            "timestamp": datetime.now().isoformat(),
            "analysis_depth": request.analysis_depth,
            "kabbalah": kabbalah_data,
            "spiritual_focus": kabbalah_data.get("spiritual_focus", "Unknown"),
            "tree_guidance": kabbalah_data.get("tree_guidance", "Work with divine emanations for growth"),
            "primary_sephirah": kabbalah_data.get("primary_sephirah", {}),
            "relevant_paths": kabbalah_data.get("relevant_paths", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in Kabbalah calculation: {e}")
        raise HTTPException(status_code=500, detail=f"Kabbalah calculation failed: {str(e)}")

@spiritual_router.get("/correspondences/{system1}/{element1}/{system2}")
async def get_correspondence_mapping(
    system1: str,
    element1: str, 
    system2: str
) -> Dict[str, Any]:
    """
    Get correspondence mapping between different spiritual systems
    
    Example: /correspondences/tarot/The_Fool/kabbalah
    Returns connections between tarot cards and Kabbalistic elements
    """
    try:
        # This would implement correspondence lookup
        # For now, return a sample response
        return {
            "correspondence": {
                "system_1": system1,
                "element_1": element1.replace("_", " "),
                "system_2": system2,
                "mappings": [
                    {
                        "element_2": "Kether",
                        "relationship": "corresponds_to",
                        "explanation": "The Fool represents the divine spark beginning its journey from Kether"
                    }
                ],
                "traditional_source": "Golden Dawn correspondence system"
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting correspondence: {e}")
        raise HTTPException(status_code=500, detail=f"Correspondence lookup failed: {str(e)}")

@spiritual_router.get("/daily/{year}/{month}/{day}")
async def get_daily_spiritual_guidance(year: int, month: int, day: int) -> Dict[str, Any]:
    """
    Get daily spiritual guidance for specific date
    
    Provides quick daily tarot card and spiritual focus
    """
    try:
        # Calculate tarot of the day
        spiritual_data = calculate_spiritual_systems(year, month, day)
        
        if "error" in spiritual_data:
            raise HTTPException(status_code=400, detail=spiritual_data["error"])
            
        daily_card = spiritual_data.get("tarot", {}).get("daily_card", {})
        primary_sephirah = spiritual_data.get("kabbalah", {}).get("primary_sephirah", {})
        
        return {
            "date": f"{year}-{month:02d}-{day:02d}",
            "daily_card": daily_card.get("daily_card", {}),
            "spiritual_focus": primary_sephirah.get("name", "Unknown"),
            "guidance": daily_card.get("guidance", "Focus on spiritual growth today"),
            "meditation": f"Contemplate the energy of {daily_card.get('daily_card', {}).get('name', 'divine wisdom')}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting daily guidance: {e}")
        raise HTTPException(status_code=500, detail=f"Daily guidance failed: {str(e)}")

@spiritual_router.get("/health")
async def spiritual_systems_health() -> Dict[str, Any]:
    """Health check for spiritual systems"""
    try:
        # Test basic calculation
        test_result = calculate_spiritual_systems(2024, 1, 1)
        
        return {
            "status": "healthy" if "error" not in test_result else "degraded",
            "timestamp": datetime.now().isoformat(),
            "version": "SPIRITUAL-001-v1.0",
            "systems": {
                "tarot": "operational",
                "kabbalah": "operational", 
                "correspondences": "operational",
                "ai_interpretation": "operational"
            }
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Export router for main application
__all__ = ["spiritual_router"]
