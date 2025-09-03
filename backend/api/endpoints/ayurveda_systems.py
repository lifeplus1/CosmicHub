"""
API Endpoints for Ayurveda Constitutional Analysis System
AI #3: Backend Architecture Specialist Implementation
Following Integration Strategy: ENHANCE vs CREATE NEW approach
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

try:
    from ...calculations.ayurveda_engine import AyurvedaEngine, calculate_ayurveda_constitution
    from ...calculations.ayurveda_schema import AyurvedaAnalysisResult, AYURVEDA_QUICK_REFERENCE
    AYURVEDA_AVAILABLE = True
except ImportError:
    AYURVEDA_AVAILABLE = False
    AyurvedaEngine = None
    calculate_ayurveda_constitution = None

# Setup logging and router
logger = logging.getLogger(__name__)
ayurveda_router = APIRouter(prefix="/api/ayurveda", tags=["ayurveda"])

# Request/Response Models
class AyurvedaRequest(BaseModel):
    """Request model for Ayurveda constitutional analysis"""
    birth_data: Dict[str, Any] = Field(..., description="Birth chart data with planetary positions and houses")
    user_id: Optional[str] = Field(None, description="Optional user identifier")
    include_correlations: bool = Field(True, description="Include astrological correlations in response")
    include_guidance: bool = Field(True, description="Include health and lifestyle guidance")

class DoshaBalanceResponse(BaseModel):
    """Response model for dosha balance analysis"""
    vata: float = Field(..., ge=0, le=1, description="Vata dosha percentage (0-1)")
    pitta: float = Field(..., ge=0, le=1, description="Pitta dosha percentage (0-1)") 
    kapha: float = Field(..., ge=0, le=1, description="Kapha dosha percentage (0-1)")
    primary_dosha: str = Field(..., description="Dominant dosha")
    constitution_type: str = Field(..., description="Overall constitutional type")

class AyurvedaResponse(BaseModel):
    """Complete response model for Ayurveda analysis"""
    success: bool = Field(True, description="Analysis success status")
    data: Dict[str, Any] = Field(..., description="Complete Ayurveda analysis data")
    constitution_summary: str = Field(..., description="Brief constitution summary")
    primary_recommendations: List[str] = Field(..., description="Key recommendations")
    calculation_method: str = Field(..., description="Method used for analysis")
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")
    api_version: str = Field("1.0", description="API version")
    generated_at: str = Field(..., description="Response generation timestamp")

class HealthGuidanceResponse(BaseModel):
    """Response model for health guidance"""
    constitution_type: str = Field(..., description="Constitutional type")
    dietary_guidelines: List[str] = Field(..., description="Personalized dietary recommendations")
    lifestyle_recommendations: List[str] = Field(..., description="Lifestyle guidance")
    seasonal_adjustments: Dict[str, List[str]] = Field(..., description="Seasonal recommendations")
    exercise_recommendations: List[str] = Field(..., description="Exercise guidance")
    meditation_practices: List[str] = Field(..., description="Meditation recommendations")

class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = Field(False, description="Always false for errors")
    error: str = Field(..., description="Error message")
    error_code: str = Field(..., description="Error code")
    timestamp: str = Field(..., description="Error timestamp")

# Helper Functions
def get_ayurveda_engine():
    """Dependency to get Ayurveda engine"""
    if not AYURVEDA_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Ayurveda analysis engine not available"
        )
    return AyurvedaEngine()

def validate_birth_data(birth_data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate and normalize birth data"""
    required_fields = ['planetary_strengths', 'house_emphasis']
    
    for field in required_fields:
        if field not in birth_data:
            logger.warning(f"Missing {field} in birth data, using defaults")
            
    # Ensure basic structure
    if 'planetary_strengths' not in birth_data:
        birth_data['planetary_strengths'] = {
            'sun': 0.5, 'moon': 0.5, 'mars': 0.5, 'mercury': 0.5,
            'jupiter': 0.5, 'venus': 0.5, 'saturn': 0.5
        }
        
    if 'house_emphasis' not in birth_data:
        birth_data['house_emphasis'] = {str(i): 0.5 for i in range(1, 13)}
        
    return birth_data

# API Endpoints

@ayurveda_router.get("/health", response_model=Dict[str, Any])
async def health_check():
    """Health check endpoint for Ayurveda API"""
    return {
        "status": "healthy",
        "service": "Ayurveda Constitutional Analysis API",
        "version": "1.0",
        "available": AYURVEDA_AVAILABLE,
        "timestamp": datetime.now().isoformat(),
        "features": [
            "Constitutional Analysis",
            "Dosha Balance Assessment", 
            "Astrological Correlations",
            "Health & Lifestyle Guidance",
            "Seasonal Recommendations"
        ]
    }

@ayurveda_router.post("/analyze", response_model=AyurvedaResponse)
async def analyze_constitution(
    request: AyurvedaRequest,
    engine: AyurvedaEngine = Depends(get_ayurveda_engine)
):
    """
    Complete Ayurvedic constitutional analysis with astrological integration
    
    Analyzes birth chart data to determine:
    - Prakruti (natural constitution) 
    - Vikruti (current imbalances)
    - Dosha balance with planetary influences
    - Personalized health and lifestyle guidance
    - Seasonal recommendations with astrological timing
    """
    start_time = datetime.now()
    
    try:
        # Validate and normalize birth data
        birth_data = validate_birth_data(request.birth_data.copy())
        
        # Perform constitutional analysis
        result = engine.analyze_constitution(birth_data, request.user_id)
        
        # Create constitution summary
        constitution_type = result['constitution']['constitution_type']
        primary_dosha = result['constitution']['primary_dosha']
        confidence = result['analysis_confidence']
        
        constitution_summary = (
            f"{constitution_type.replace('_', '-').title()} constitution with "
            f"{primary_dosha.title()} dominance (confidence: {confidence:.1%})"
        )
        
        # Extract key recommendations
        primary_recommendations = []
        if request.include_guidance and 'health_guidance' in result:
            guidance = result['health_guidance']
            primary_recommendations.extend(guidance.get('dietary_guidelines', [])[:2])
            primary_recommendations.extend(guidance.get('lifestyle_recommendations', [])[:2])
        
        # Calculate processing time
        processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        # Build response
        response_data = {
            "constitution": result['constitution'],
            "dosha_analysis": result['dosha_analysis']
        }
        
        if request.include_guidance:
            response_data["health_guidance"] = result['health_guidance']
            response_data["seasonal_recommendations"] = result['seasonal_recommendations']
            
        if request.include_correlations:
            response_data["astrological_correlations"] = result['astrological_correlations']
        
        return AyurvedaResponse(
            success=True,
            data=response_data,
            constitution_summary=constitution_summary,
            primary_recommendations=primary_recommendations,
            calculation_method=result['calculation_method'],
            processing_time_ms=processing_time,
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in Ayurveda analysis: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

@ayurveda_router.post("/dosha-balance", response_model=DoshaBalanceResponse)
async def get_dosha_balance(
    request: AyurvedaRequest,
    engine: AyurvedaEngine = Depends(get_ayurveda_engine)
):
    """
    Get basic dosha balance analysis from birth chart data
    
    Returns simplified dosha percentages and constitutional type
    without full health guidance.
    """
    try:
        # Validate birth data
        birth_data = validate_birth_data(request.birth_data.copy())
        
        # Extract planetary and house data
        planetary_strengths = engine._extract_planetary_strengths(birth_data)
        house_emphasis = engine._extract_house_emphasis(birth_data)
        elemental_balance = engine._calculate_elemental_balance(birth_data)
        
        # Calculate dosha balance
        prakruti = engine._calculate_prakruti(planetary_strengths, house_emphasis, elemental_balance)
        constitution_type = engine._determine_constitution_type(prakruti)
        
        # Determine primary dosha
        primary_dosha = max(prakruti.items(), key=lambda x: x[1])[0]
        
        return DoshaBalanceResponse(
            vata=prakruti.get('vata', 0.33),
            pitta=prakruti.get('pitta', 0.33),
            kapha=prakruti.get('kapha', 0.33),
            primary_dosha=primary_dosha,
            constitution_type=str(constitution_type)
        )
        
    except Exception as e:
        logger.error(f"Error in dosha balance calculation: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Dosha balance calculation failed: {str(e)}"
        )

@ayurveda_router.post("/health-guidance", response_model=HealthGuidanceResponse)
async def get_health_guidance(
    request: AyurvedaRequest,
    engine: AyurvedaEngine = Depends(get_ayurveda_engine)
):
    """
    Get personalized health and lifestyle guidance based on constitution
    
    Provides detailed recommendations for diet, lifestyle, exercise,
    meditation practices, and seasonal adjustments.
    """
    try:
        # Get full analysis first
        birth_data = validate_birth_data(request.birth_data.copy())
        result = engine.analyze_constitution(birth_data, request.user_id)
        
        constitution_type = result['constitution']['constitution_type']
        health_guidance = result['health_guidance']
        
        return HealthGuidanceResponse(
            constitution_type=str(constitution_type),
            dietary_guidelines=health_guidance['dietary_guidelines'],
            lifestyle_recommendations=health_guidance['lifestyle_recommendations'],
            seasonal_adjustments=health_guidance['seasonal_adjustments'],
            exercise_recommendations=health_guidance['exercise_recommendations'],
            meditation_practices=health_guidance['meditation_practices']
        )
        
    except Exception as e:
        logger.error(f"Error generating health guidance: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Health guidance generation failed: {str(e)}"
        )

@ayurveda_router.get("/constitution-types", response_model=Dict[str, Any])
async def get_constitution_types():
    """
    Get information about all Ayurvedic constitution types
    
    Returns educational information about the different constitutional
    types and their characteristics.
    """
    try:
        if not AYURVEDA_AVAILABLE:
            raise HTTPException(
                status_code=503,
                detail="Ayurveda reference data not available"
            )
            
        return {
            "constitution_types": AYURVEDA_QUICK_REFERENCE.get("constitution_types", {}),
            "balancing_keywords": AYURVEDA_QUICK_REFERENCE.get("dosha_balancing_keywords", {}),
            "astrological_timing": AYURVEDA_QUICK_REFERENCE.get("astrological_health_timing", {}),
            "description": "Ayurvedic constitutional types with astrological correlations",
            "educational_note": (
                "This information is for educational purposes. "
                "Consult qualified Ayurvedic practitioners for personalized guidance."
            )
        }
        
    except Exception as e:
        logger.error(f"Error retrieving constitution types: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve constitution type information"
        )

@ayurveda_router.get("/seasonal-guidance/{constitution_type}", response_model=Dict[str, Any])
async def get_seasonal_guidance(constitution_type: str):
    """
    Get seasonal guidance for specific constitution type
    
    Returns detailed seasonal recommendations including dietary adjustments,
    lifestyle changes, and astrological timing information.
    """
    try:
        if not AYURVEDA_AVAILABLE:
            raise HTTPException(
                status_code=503, 
                detail="Ayurveda analysis not available"
            )
            
        # Validate constitution type
        valid_types = [
            "vata", "pitta", "kapha", "vata_pitta", 
            "pitta_kapha", "vata_kapha", "tridoshic"
        ]
        
        if constitution_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid constitution type. Must be one of: {', '.join(valid_types)}"
            )
        
        # Generate seasonal recommendations
        engine = AyurvedaEngine()
        seasonal_recommendations = engine._generate_seasonal_recommendations(
            constitution_type, {}  # type: ignore
        )
        
        return {
            "constitution_type": constitution_type,
            "seasonal_recommendations": seasonal_recommendations,
            "generated_at": datetime.now().isoformat(),
            "educational_note": (
                "Seasonal guidance based on Ayurvedic principles and astrological timing. "
                "Adjust recommendations based on individual needs and local climate."
            )
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating seasonal guidance: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate seasonal guidance"
        )

# Error Handlers
@ayurveda_router.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Handle HTTP exceptions with proper error response"""
    return ErrorResponse(
        success=False,
        error=exc.detail,
        error_code=f"HTTP_{exc.status_code}",
        timestamp=datetime.now().isoformat()
    )

@ayurveda_router.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception in Ayurveda API: {str(exc)}", exc_info=True)
    return ErrorResponse(
        success=False,
        error="Internal server error",
        error_code="INTERNAL_ERROR", 
        timestamp=datetime.now().isoformat()
    )

# Export router for inclusion in main app
__all__ = ['ayurveda_router']
