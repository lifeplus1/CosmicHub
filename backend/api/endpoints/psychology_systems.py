"""Psychology system API endpoints (PSYCHOLOGY-001)

Provides assessment, profile generation, comparison, and health checks.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import logging

from backend.api.bridges.psychology_type_bridge import PsychologyTypeBridge
from backend.types.psychology_systems import (
    AssessmentType,
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


@psychology_router.post('/assessment', response_model=Dict[str, Any])
async def run_psychology_assessment(request: PsychologyAssessmentRequest) -> Dict[str, Any]:
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

        return assessment.model_dump()  # type: ignore[attr-defined]
    except Exception as e:
        logger.error(f"Psychology assessment failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@psychology_router.post('/profile', response_model=Dict[str, Any])
async def build_psychology_profile(request: PsychologyProfileRequest) -> Dict[str, Any]:
    """Build a (mock) psychology profile until real aggregation pipeline is integrated."""
    try:
        logger.info(f"[Psychology] profile user={request.user_id}")
        return {
            "user_id": request.user_id,
            "summary": "Well-balanced archetypal pattern.",
            "enriched": request.enrich,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        logger.error(f"Profile build failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@psychology_router.get('/health', response_model=Dict[str, Any])
async def psychology_health() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "PSYCHOLOGY-001-v1.0",
    }


__all__ = ["psychology_router"]
