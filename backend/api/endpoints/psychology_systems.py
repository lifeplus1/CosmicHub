"""Psychology system API endpoints (PSYCHOLOGY-001)

Provides assessment, profile generation, comparison, and health checks.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import logging

from ..bridges.psychology_type_bridge import PsychologyTypeBridge
from backend_types.psychology_systems import (
    AssessmentType, PsychologyAssessmentResponse, PsychologyProfileResponse, PsychologyHealthCheck
)

logger = logging.getLogger(__name__)

psychology_router = APIRouter(prefix="/api/psychology", tags=["psychology-systems"])


class PsychologyAssessmentRequest(BaseModel):
    user_id: Optional[str] = Field(None, description="User ID for personalized context")
    assessment_type: AssessmentType = Field(..., description="Assessment type to perform")
    responses: Dict[str, Any] = Field(default_factory=dict, description="User response payload")
    include_recommendations: bool = Field(True, description="Return growth & therapeutic recommendations")


class PsychologyProfileRequest(BaseModel):
    user_id: str = Field(..., description="User ID to build profile for")
    enrich: bool = Field(True, description="Include enrichment insights")


@psychology_router.post('/assessment', response_model=PsychologyAssessmentResponse)
async def run_psychology_assessment(request: PsychologyAssessmentRequest) -> PsychologyAssessmentResponse:
    """Run a psychology assessment and return typed result."""
    try:
        start = datetime.now(timezone.utc)
        logger.info(f"[Psychology] assessment={request.assessment_type} user={request.user_id}")

        # For now fake scoring logic; integrate real engine later.
        # Mock assessment results schema (simplified) to fit bridge expectations
        results: Dict[str, Any] = {
            "big_five": {
                "openness": 65.2,
                "conscientiousness": 58.1,
                "extraversion": 41.3,
                "agreeableness": 72.4,
                "neuroticism": 33.7,
            },
            "meta": {"questions": len(request.responses)}
        }

        # AssessmentType likely an Enum/String; cast directly to str
        assessment = PsychologyTypeBridge.create_psychology_assessment_response(
            user_id=request.user_id or "anonymous",
            assessment_type=str(request.assessment_type),
            results=results,
            insights=[{
                "category": "strength",
                "title": "Empathy",
                "description": "You demonstrate strong empathetic attunement.",
                "priority": "medium",
                "actionable": True,
                "related_traits": ["agreeableness"]
            }],
            recommendations=[{
                "type": "therapeutic",
                "approach": "integrative",
                "rationale": "Supports balanced emotional regulation",
                "suitability_score": 78.5,
                "focus_areas": ["assertiveness"],
                "techniques": ["journaling", "role_play"]
            }],
            processing_time_ms=(datetime.now(timezone.utc) - start).total_seconds() * 1000,
        )

        return assessment  # type: ignore[return-value]
    except Exception as e:
        logger.error(f"Psychology assessment failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@psychology_router.post('/profile', response_model=PsychologyProfileResponse)
async def build_psychology_profile(request: PsychologyProfileRequest) -> PsychologyProfileResponse:
    """Build a psychology profile using the type bridge."""
    try:
        start = datetime.now(timezone.utc)
        logger.info(f"[Psychology] profile user={request.user_id}")
        
        # Create mock profile data for now
        profile_data = {
            'user_id': request.user_id,
            'assessment_date': datetime.now(timezone.utc),
            'assessment_completeness': 85.0,
            'reliability_score': 78.5
        }
        
        summary = {
            'overall_type': 'Balanced Integrator',
            'strengths': ['Emotional Intelligence', 'Analytical Thinking'],
            'growth_areas': ['Social Confidence', 'Decision Making']
        }
        
        # Use the type bridge to create properly typed response
        profile_response = PsychologyTypeBridge.create_psychology_profile_response(
            profile_data=profile_data,
            summary=summary,
            insights=[{
                "category": "strength",
                "title": "Emotional Balance",
                "description": "You demonstrate strong emotional regulation and self-awareness.",
                "priority": "high",
                "actionable": True,
                "related_traits": ["emotional_intelligence", "self_regulation"]
            }],
            recommendations=[{
                "approach": "integrative",
                "rationale": "Supports holistic personal development",
                "suitability_score": 82.0,
                "focus_areas": ["leadership", "relationships"],
                "techniques": ["mindfulness", "cognitive_restructuring"]
            }],
            processing_time_ms=(datetime.now(timezone.utc) - start).total_seconds() * 1000,
        )
        
        return profile_response
    except Exception as e:
        logger.error(f"Profile build failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@psychology_router.get('/health', response_model=PsychologyHealthCheck)
async def psychology_health() -> PsychologyHealthCheck:
    """Get psychology service health status."""
    try:
        # Use the type bridge to create properly typed health check
        health_check = PsychologyTypeBridge.create_psychology_health_check(
            assessments_available=True,
            models_loaded=["mbti", "big_five", "enneagram"],
            timestamp=datetime.now(timezone.utc).isoformat(),
            last_assessment=datetime.now(timezone.utc).isoformat(),
            uptime_seconds=3600.0  # Mock uptime
        )
        return health_check
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


__all__ = ["psychology_router"]
