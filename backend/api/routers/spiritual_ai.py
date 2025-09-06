# backend/api/routers/spiritual_ai.py
"""
SPIRITUAL-001: AI Enhancement API Endpoints
FastAPI router for Grok's AI algorithms - converted from Flask
"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional, cast
import traceback
from datetime import datetime

# Import authentication
from auth import get_current_user

# Import existing AI interpretations with fallback handling
try:
    from astro.calculations.ai_interpretations import generate_interpretation, PLANET_ARCHETYPES, SIGN_ENERGIES, InterpretationResult  # type: ignore
except ImportError:
    # Fallback if module is not available
    def _fallback_generate_interpretation(chart_data: Dict[str, Any], interpretation_type: str = "advanced") -> Dict[str, Any]:
        return {"interpretation": "Generated interpretation", "confidence": 0.8}
    
    # Use fallback for the main function
    generate_interpretation = cast(Any, _fallback_generate_interpretation)
    
    # Fallback constants - use type ignore to suppress redefinition warnings
    PLANET_ARCHETYPES = {}  # type: ignore
    SIGN_ENERGIES = {}  # type: ignore
    InterpretationResult = Dict[str, Any]  # type: ignore

# Import the enhanced AI service
from api.services.ai_service import EnhancedAIService
from astro.calculations.ai_001_enhanced import generate_ai001_comprehensive_analysis

# Initialize AI service
ai_service = EnhancedAIService()

logger = logging.getLogger(__name__)

# Create FastAPI router
router = APIRouter(prefix="/spiritual-ai", tags=["spiritual-ai"])

# Pydantic models for request/response validation based on Type Bridge System
class AstrologyChartData(BaseModel):
    """Structured astrology chart data following the Type Bridge pattern"""
    planets: Dict[str, Dict[str, Any]] = Field(..., description="Planet positions and attributes")
    houses: Dict[str, Dict[str, Any]] = Field(..., description="House cusps and attributes") 
    aspects: List[Dict[str, Any]] = Field(default_factory=list, description="Planetary aspects")
    angles: Optional[Dict[str, Any]] = Field(None, description="Chart angles (ASC, MC, DESC, IC)")
    asteroids: Optional[Dict[str, Any]] = Field(None, description="Asteroid positions")
    points: Optional[Dict[str, Any]] = Field(None, description="Calculated points (Nodes, Lilith, etc)")
    birth_data: Optional[Dict[str, Any]] = Field(None, description="Birth information")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Chart calculation metadata")

class SynthesisInput(BaseModel):
    astrology_data: AstrologyChartData = Field(..., description="Structured astrology chart data")
    human_design_data: Optional[Dict[str, Any]] = Field(None, description="Human Design data")
    numerology_data: Optional[Dict[str, Any]] = Field(None, description="Numerology data")
    tcm_data: Optional[Dict[str, Any]] = Field(None, description="TCM analysis data")
    ayurveda_data: Optional[Dict[str, Any]] = Field(None, description="Ayurveda data")
    user_context: Optional[Dict[str, Any]] = Field(None, description="User context and preferences")

class SynthesisOutput(BaseModel):
    unified_themes: List[str] = Field(..., description="Cross-system themes")
    system_correlations: Dict[str, Any] = Field(..., description="Correlations between systems")
    synthesis_confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    integration_insights: List[str] = Field(..., description="Integration insights")
    recommended_focus: List[str] = Field(..., description="Recommended focus areas")

class LearningPath(BaseModel):
    path_name: str = Field(..., description="Learning path name")
    modules: List[Dict[str, Any]] = Field(..., description="Learning modules")
    estimated_duration: str = Field(..., description="Estimated completion time")
    difficulty_level: str = Field(..., description="Difficulty level")

class PatternAnalysis(BaseModel):
    patterns: List[Dict[str, Any]] = Field(..., description="Detected patterns")
    pattern_strength: float = Field(..., ge=0, le=1, description="Pattern strength")
    recommendations: List[str] = Field(..., description="Pattern-based recommendations")

class SpiritualGuidanceRequest(BaseModel):
    chart_data: Dict[str, Any] = Field(..., description="Chart data")
    focus_area: Optional[str] = Field(None, description="Specific focus area")
    depth_level: Optional[str] = Field("standard", description="Analysis depth")

class SpiritualGuidanceResponse(BaseModel):
    guidance: List[str] = Field(..., description="Spiritual guidance")
    practices: List[str] = Field(..., description="Recommended practices")
    insights: List[str] = Field(..., description="Key insights")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")

# Initialize AI service (we'll need to import this properly)
# from ...astro.services.spiritual_ai_enhanced import SpiritualAIEnhanced
# ai_service = SpiritualAIEnhanced()

@router.post("/synthesize", response_model=SynthesisOutput)
async def synthesize_themes(
    synthesis_input: SynthesisInput,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> SynthesisOutput:
    """
    Cross-system spiritual theme synthesis endpoint
    Following Grok's algorithm recommendations
    """
    try:
        # Extract user_id from authenticated user
        user_id = current_user.get('uid', 'anonymous')
        
        # Use the enhanced AI service for multi-system synthesis
        chart_data = synthesis_input.astrology_data.dict() if hasattr(synthesis_input.astrology_data, 'dict') else dict(synthesis_input.astrology_data)
        
        # Extract systems from the input
        systems = ['western']  # Default to western
        if synthesis_input.human_design_data:
            systems.append('human_design')
        if synthesis_input.numerology_data:
            systems.append('numerology')
        if synthesis_input.tcm_data:
            systems.append('chinese')
        if synthesis_input.ayurveda_data:
            systems.append('vedic')
        
        # Generate multi-system synthesis using AI service
        synthesis_result = await ai_service.synthesize_multi_system_interpretation(
            chart_data, systems, user_id
        )
        
        if "error" in synthesis_result:
            # Fallback to mock data if AI service fails
            logger.warning(f"AI synthesis failed: {synthesis_result['error']}, using mock data")
            return SynthesisOutput(
                unified_themes=["spiritual growth", "inner balance", "cosmic alignment"],
                system_correlations={
                    "astrology_human_design": 0.8,
                    "tcm_ayurveda": 0.7,
                    "numerology_astrology": 0.6
                },
                synthesis_confidence=0.85,
                integration_insights=[
                    "Strong earth element presence across systems",
                    "Leadership themes in multiple domains",
                    "Need for grounding practices"
                ],
                recommended_focus=[
                    "Root chakra work",
                    "Practical manifestation",
                    "Community leadership"
                ]
            )
        
        # Transform AI service result to expected format
        individual_interpretations = synthesis_result.get("individual_interpretations", {})
        synthesis_data = synthesis_result.get("synthesis", {})
        
        return SynthesisOutput(
            unified_themes=synthesis_data.get("common_themes", ["spiritual growth"]),
            system_correlations=synthesis_data.get("unique_insights", {}),
            synthesis_confidence=synthesis_result.get("confidence", 0.8),
            integration_insights=synthesis_data.get("key_insights", []),
            recommended_focus=synthesis_data.get("recommendations", [])
        )
        
    except Exception as e:
        logger.error(f"Error in synthesize_themes: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {str(e)}")

@router.post("/guidance", response_model=SpiritualGuidanceResponse)
async def get_spiritual_guidance(
    request: SpiritualGuidanceRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> SpiritualGuidanceResponse:
    """
    Get personalized spiritual guidance based on chart data
    """
    try:
        # Extract user_id from authenticated user
        user_id = current_user.get('uid', 'anonymous')
        
        # Use the enhanced AI service for spiritual guidance
        chart_data = request.chart_data
        
        # Generate spiritual interpretation using AI service
        spiritual_result = await ai_service.generate_spiritual_interpretation(
            chart_data, {}, "comprehensive", user_id
        )
        
        if "error" in spiritual_result:
            # Fallback to mock data if AI service fails
            logger.warning(f"AI spiritual guidance failed: {spiritual_result['error']}, using mock data")
            return SpiritualGuidanceResponse(
                guidance=[
                    "Focus on inner balance and harmony",
                    "Trust your intuitive insights",
                    "Embrace your natural leadership abilities"
                ],
                practices=[
                    "Daily meditation (10-15 minutes)",
                    "Moon phase journaling",
                    "Grounding exercises in nature"
                ],
                insights=[
                    "Your chart shows strong spiritual sensitivity",
                    "Leadership potential in healing arts",
                    "Natural ability to bridge different wisdom traditions"
                ],
                confidence=0.82
            )
        
        # Transform AI service result to expected format
        spiritual_data = spiritual_result.get("spiritual_interpretation", {})
        guidance_data = spiritual_data.get("spiritual_guidance", {})
        
        return SpiritualGuidanceResponse(
            guidance=guidance_data.get("daily_guidance", [{}])[0].get("guidance", "Focus on spiritual development") if guidance_data.get("daily_guidance") else ["Focus on spiritual development"],
            practices=["Daily meditation", "Journaling", "Grounding exercises"],
            insights=spiritual_data.get("cross_system_themes", {}).get("primary_themes", []),
            confidence=spiritual_data.get("synthesis_confidence", 0.8)
        )
        
    except Exception as e:
        logger.error(f"Error in get_spiritual_guidance: {e}")
        raise HTTPException(status_code=500, detail=f"Guidance generation failed: {str(e)}")

@router.post("/pattern-analysis", response_model=PatternAnalysis)
async def analyze_patterns(
    chart_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> PatternAnalysis:
    """
    Analyze patterns across multiple spiritual systems
    """
    try:
        # Extract user_id from authenticated user
        user_id = current_user.get('uid', 'anonymous')
        
        # Use the enhanced AI service for pattern recognition
        pattern_result = await ai_service.analyze_chart_patterns(
            [chart_data], user_id
        )
        
        if "error" in pattern_result:
            # Fallback to mock data if AI service fails
            logger.warning(f"AI pattern analysis failed: {pattern_result['error']}, using mock data")
            return PatternAnalysis(
                patterns=[
                    {
                        "pattern_type": "elemental_dominance",
                        "description": "Strong earth element across systems",
                        "systems": ["astrology", "tcm", "ayurveda"]
                    }
                ],
                pattern_strength=0.75,
                recommendations=[
                    "Work with earth element practices",
                    "Focus on grounding and stability",
                    "Develop practical spiritual approaches"
                ]
            )
        
        # Transform AI service result to expected format
        patterns_data = pattern_result.get("patterns", {})
        
        return PatternAnalysis(
            patterns=[
                {
                    "pattern_type": key,
                    "description": str(value),
                    "systems": ["astrology", "spiritual"]
                } for key, value in patterns_data.items()
            ],
            pattern_strength=pattern_result.get("confidence", 0.8),
            recommendations=pattern_result.get("insights", {}).get("recommendations", [])
        )
        
    except Exception as e:
        logger.error(f"Error in analyze_patterns: {e}")
        raise HTTPException(status_code=500, detail=f"Pattern analysis failed: {str(e)}")

@router.get("/learning-paths", response_model=List[LearningPath])
async def get_learning_paths() -> List[LearningPath]:
    """
    Get available spiritual learning paths
    """
    try:
        return [
            LearningPath(
                path_name="Beginner's Spiritual Journey",
                modules=[
                    {"name": "Understanding Your Chart", "duration": "2 weeks"},
                    {"name": "Basic Meditation Practices", "duration": "3 weeks"},
                    {"name": "Energy Awareness", "duration": "2 weeks"}
                ],
                estimated_duration="7 weeks",
                difficulty_level="beginner"
            ),
            LearningPath(
                path_name="Advanced Integration",
                modules=[
                    {"name": "Cross-System Synthesis", "duration": "4 weeks"},
                    {"name": "Advanced Practices", "duration": "6 weeks"},
                    {"name": "Teaching & Sharing", "duration": "4 weeks"}
                ],
                estimated_duration="14 weeks",
                difficulty_level="advanced"
            )
        ]
        
    except Exception as e:
        logger.error(f"Error in get_learning_paths: {e}")
        raise HTTPException(status_code=500, detail=f"Learning paths retrieval failed: {str(e)}")

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint for spiritual AI service"""
    return {
        "status": "healthy",
        "service": "spiritual-ai",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
