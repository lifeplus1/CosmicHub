# /Users/Chris/Projects/CosmicHub/backend/api/interpretations.py

import time
from datetime import datetime, timezone
from os import getenv
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from astro.calculations.ai_interpretations import (
    INTERPRETATION_SCHEMA_VERSION,
    generate_interpretation,
)
from auth import get_current_user
from database import db

metrics_enabled_flag = getenv("ENABLE_METRICS", "true").lower() == "true"
try:  # Optional Prometheus import without importing main
    if metrics_enabled_flag:
        from prometheus_client import Counter, Histogram  # type: ignore

        INTERP_COUNTER = Counter("interpretations_total", "Total interpretation generation attempts", ["result", "level"])  # type: ignore  # noqa: E501
        INTERP_LATENCY = Histogram("interpretation_generation_seconds", "Interpretation generation latency seconds", buckets=(0.05, 0.1, 0.25, 0.5, 1, 2, 5))  # type: ignore  # noqa: E501
        INTERP_CACHE = Counter("interpretation_cache_events_total", "Interpretation cache events", ["event"])  # type: ignore  # noqa: E501
    else:
        INTERP_COUNTER = None  # type: ignore
        INTERP_LATENCY = None  # type: ignore
        INTERP_CACHE = None  # type: ignore
except Exception:
    INTERP_COUNTER = None  # type: ignore
    INTERP_LATENCY = None  # type: ignore
    INTERP_CACHE = None  # type: ignore
from .services.astro_service import get_astro_service  # noqa: E402

router = APIRouter(prefix="/api/interpretations", tags=["interpretations"])


class InterpretationRequest(BaseModel):
    chartId: str
    userId: str
    type: Optional[str] = "natal"
    focus: Optional[List[str]] = []
    question: Optional[str] = None


class GenerateInterpretationRequest(BaseModel):
    chartId: str
    userId: str
    type: Optional[str] = "natal"
    focus: Optional[List[str]] = []
    question: Optional[str] = None
    interpretation_level: Optional[str] = (
        "advanced"  # basic, focused, advanced
    )


class Interpretation(BaseModel):
    id: str
    chartId: str
    userId: str
    type: str
    title: str
    content: str
    summary: str
    tags: List[str]
    confidence: float
    createdAt: str
    updatedAt: str
    version: Optional[str] = None
    schemaVersion: Optional[str] = None


import logging  # noqa: E402

logger = logging.getLogger(__name__)


class InterpretationResponse(BaseModel):
    data: List[Interpretation]
    success: bool
    message: Optional[str] = None


@router.post("/", response_model=InterpretationResponse)
async def get_interpretations(
    request: InterpretationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> InterpretationResponse:
    """
    Fetch existing interpretations for a chart and user.
    """
    try:
        # Query Firestore for existing interpretations
        interpretations_ref = db.collection("interpretations")
        query = interpretations_ref.where("userId", "==", request.userId).where("chartId", "==", request.chartId)  # type: ignore[misc]  # noqa: E501
        docs = query.stream()

        interpretations: List[Interpretation] = []
        for doc in docs:  # type: ignore[misc]
            doc_data = doc.to_dict()  # type: ignore[attr-defined]
            if doc_data:
                doc_data["id"] = doc.id  # type: ignore[attr-defined]
                try:
                    interpretation = Interpretation(**doc_data)  # type: ignore[arg-type]  # noqa: E501
                    interpretations.append(interpretation)
                except Exception:
                    # Skip malformed documents
                    continue

        return InterpretationResponse(
            data=interpretations,
            success=True,
            message=f"Found {len(interpretations)} interpretations",
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch interpretations: {str(e)}",
        )


@router.post("/generate", response_model=InterpretationResponse)
async def generate_interpretation_endpoint(
    request: GenerateInterpretationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    astro_service: Any = Depends(get_astro_service),
) -> InterpretationResponse:
    """
    Generate a new AI interpretation with Redis caching for performance.
    """
    import os as _os  # local import for debug flag
    _trace = _os.getenv("DEBUG_REQUEST_TRACE") in ("1", "true", "yes")
    try:
        if _trace:  # pragma: no cover - debug only
            print(f"[TRACE] generate_interpretation:enter chartId={request.chartId} userId={request.userId}")
        # Check cache first for previously generated interpretation
        cache_key = f"interpretation:{request.chartId}:{request.userId}:{request.type or 'natal'}"  # noqa: E501
        ttl_env = int(getenv("INTERPRETATION_CACHE_TTL", "1800"))
        cached_interpretation = await astro_service.get_cached_data(cache_key)

        if cached_interpretation:
            print(f"Cache hit for interpretation: {cache_key}")
            if _trace:  # pragma: no cover - debug only
                print(f"[TRACE] generate_interpretation:cache_hit key={cache_key}")
            if "id" not in cached_interpretation:
                cached_interpretation["id"] = cache_key  # type: ignore[index]
            cached_interpretation.setdefault(
                "version", INTERPRETATION_SCHEMA_VERSION
            )
            cached_interpretation.setdefault(
                "schemaVersion", INTERPRETATION_SCHEMA_VERSION
            )
            if INTERP_CACHE:
                try:
                    INTERP_CACHE.labels("hit").inc()  # type: ignore
                except Exception:
                    pass
            logger.info(
                "interpretation_cache_hit",
                extra={
                    "chart_id": request.chartId,
                    "user_id": request.userId,
                    "level": request.interpretation_level or "advanced",
                },
            )
            return InterpretationResponse(
                data=[Interpretation(**cached_interpretation)],
                success=True,
                message="Interpretation retrieved from cache",
            )
        else:
            if INTERP_CACHE:
                try:
                    INTERP_CACHE.labels("miss").inc()  # type: ignore
                except Exception:
                    pass

        # Get chart data from storage (with caching)
        chart_data = await astro_service.get_chart_data(request.chartId)
        if _trace:  # pragma: no cover - debug only
            print(f"[TRACE] generate_interpretation:chart_data {'found' if chart_data else 'missing'}")

        if not chart_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chart data not found. Please generate a chart first.",
            )

        # Normalize chart_data if planets provided as a list (unified serialization format)  # noqa: E501
        try:
            if isinstance(chart_data.get("planets"), list):  # type: ignore[index]  # noqa: E501
                planet_list = chart_data["planets"]  # type: ignore[index]
                new_planets: Dict[str, Dict[str, Any]] = {}
                for p in planet_list:  # type: ignore[assignment]
                    if not isinstance(p, dict):
                        continue
                    name_val = p.get("name")  # type: ignore[assignment]
                    if not name_val:
                        continue
                    # Ensure name is string for key normalization
                    if not isinstance(name_val, str):  # type: ignore[unreachable]  # noqa: E501
                        try:
                            name_str = str(name_val)  # type: ignore[arg-type]
                        except Exception:
                            continue
                    else:
                        name_str = name_val
                    key = name_str.replace(" ", "_").lower()
                    new_planets[key] = {  # type: ignore[index]
                        "sign": p.get("sign"),  # type: ignore[index]
                        "position": p.get("degree") or p.get("position"),  # type: ignore[index]  # noqa: E501
                        "degree": p.get("degree"),  # type: ignore[index]
                        "house": p.get("house"),  # type: ignore[index]
                    }
                chart_data["planets"] = new_planets  # type: ignore[index]
        except Exception:
            # Non-fatal; proceed with original structure
            pass

        # Use interpretation engine
        interpretation_level = request.interpretation_level or "advanced"
        start_time = time.time()
        raw_interpretation = generate_interpretation(
            chart_data, interpretation_level
        )
        elapsed = time.time() - start_time
        if _trace:  # pragma: no cover - debug only
            print(f"[TRACE] generate_interpretation:engine_complete duration_ms={int(elapsed*1000)}")
        if INTERP_LATENCY:
            try:
                INTERP_LATENCY.observe(elapsed)  # type: ignore
            except Exception:
                pass
        logger.info(
            "interpretation_generated",
            extra={
                "chart_id": request.chartId,
                "user_id": request.userId,
                "level": interpretation_level,
                "duration_ms": int(elapsed * 1000),
            },
        )

        if "error" in raw_interpretation:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Interpretation generation failed: {raw_interpretation['error']}",  # noqa: E501
            )

        # Format the interpretation for frontend consumption
        formatted_interpretation: Dict[str, Any] = (
            format_interpretation_for_frontend(
                raw_interpretation, request, interpretation_level
            )
        )

        # Cache + persist
        formatted_interpretation.setdefault(
            "version", INTERPRETATION_SCHEMA_VERSION
        )
        formatted_interpretation.setdefault(
            "schemaVersion", INTERPRETATION_SCHEMA_VERSION
        )

        await astro_service.cache_serialized_data(
            cache_key, formatted_interpretation, expire_seconds=ttl_env
        )
        if _trace:  # pragma: no cover - debug only
            print(f"[TRACE] generate_interpretation:cached key={cache_key}")

        # Save to Firestore if available (skip in test mode)
        import os

        if db is not None and os.environ.get("TEST_MODE") != "1":  # type: ignore[truthy-bool]  # noqa: E501
            try:
                doc_ref = db.collection("interpretations").document()  # type: ignore[attr-defined]  # noqa: E501
                formatted_interpretation["id"] = doc_ref.id  # type: ignore[attr-defined]  # noqa: E501
                doc_ref.set(formatted_interpretation)  # type: ignore[arg-type]
            except Exception:
                # Non-fatal in generation path
                formatted_interpretation.setdefault("id", cache_key)
        else:
            formatted_interpretation.setdefault("id", cache_key)

        interpretation = Interpretation(**formatted_interpretation)
        if INTERP_COUNTER:
            try:
                INTERP_COUNTER.labels(result="success", level=interpretation_level).inc()  # type: ignore  # noqa: E501
            except Exception:
                pass

        return InterpretationResponse(
            data=[interpretation],
            success=True,
            message="Interpretation generated successfully using advanced astrological analysis",  # noqa: E501
        )

    except HTTPException as http_e:
        if _trace:  # pragma: no cover - debug only
            print(f"[TRACE] generate_interpretation:http_exception status={http_e.status_code} detail={http_e.detail}")
        if INTERP_COUNTER:
            try:
                INTERP_COUNTER.labels(result="http_error", level=request.interpretation_level or "advanced").inc()  # type: ignore  # noqa: E501
            except Exception:
                pass
        raise http_e
    except Exception as e:
        if _trace:  # pragma: no cover - debug only
            print(f"[TRACE] generate_interpretation:exception err={type(e).__name__} msg={e}")
        if INTERP_COUNTER:
            try:
                INTERP_COUNTER.labels(result="error", level=request.interpretation_level or "advanced").inc()  # type: ignore  # noqa: E501
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate interpretation: {str(e)}",
        )


@router.get("/{interpretation_id}")
async def get_interpretation_by_id(
    interpretation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get a specific interpretation by ID.
    """
    try:
        doc_ref = db.collection("interpretations").document(interpretation_id)
        doc = doc_ref.get()  # type: ignore[call-arg]

        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interpretation not found",
            )

        data = doc.to_dict()  # type: ignore[attr-defined]
        if data:
            data["id"] = doc.id  # type: ignore[attr-defined]

            # Verify user owns this interpretation
            if data.get("userId") != current_user.get("uid"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )

            return {"data": Interpretation(**data), "success": True}  # type: ignore[arg-type]  # noqa: E501
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interpretation data not found",
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch interpretation: {str(e)}",
        )


@router.delete("/{interpretation_id}")
async def delete_interpretation(
    interpretation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Delete an interpretation.
    """
    try:
        doc_ref = db.collection("interpretations").document(interpretation_id)
        doc = doc_ref.get()  # type: ignore[call-arg]

        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interpretation not found",
            )

        data = doc.to_dict()  # type: ignore[attr-defined]
        if data:
            # Verify user owns this interpretation
            if data.get("userId") != current_user.get("uid"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )

            doc_ref.delete()
            return {
                "success": True,
                "message": "Interpretation deleted successfully",
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interpretation data not found",
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete interpretation: {str(e)}",
        )


async def get_chart_data(
    chart_id: str, user_id: str
) -> Optional[Dict[str, Any]]:
    """
    Retrieve chart data for interpretation generation.
    This integrates with your existing chart storage system.
    """
    try:
        # Option 1: Get from saved charts
        if chart_id != "default":
            charts_ref = db.collection("charts")
            query = charts_ref.where("userId", "==", user_id).where("id", "==", chart_id)  # type: ignore  # noqa: E501
            docs = list(query.stream())

            if docs:
                chart_doc = docs[0]
                chart_data = chart_doc.to_dict()  # type: ignore[attr-defined]
                if chart_data:
                    return chart_data.get("chart_data", {})  # type: ignore[return-value]  # noqa: E501

        # Option 2: Return None to indicate chart data needs to be provided
        # This would integrate with your existing chart calculation system
        return None

    except Exception as e:
        print(f"Error retrieving chart data: {str(e)}")
        return None


def format_interpretation_for_frontend(
    raw_interpretation: Dict[str, Any],
    request: GenerateInterpretationRequest,
    interpretation_level: str,
) -> Dict[str, Any]:
    """
    Format the raw interpretation data for frontend consumption.
    Note: This function handles dynamic astrological data structures from ai_interpretations.py  # noqa: E501
    """
    # Extract content from different interpretation sections
    content_sections: List[str] = []
    summary_parts: List[str] = []
    tags: List[str] = []

    # Process core identity - type: ignore for dynamic astrological data
    if "core_identity" in raw_interpretation:
        core = raw_interpretation["core_identity"]
        if "sun_identity" in core:
            sun = core["sun_identity"]
            content_sections.append(f"**Core Identity ({sun.get('archetype', 'Unknown')})**: {sun.get('description', '')}")  # type: ignore  # noqa: E501
            summary_parts.append(f"{sun.get('archetype', 'Unknown')} with {sun.get('element', '')} energy")  # type: ignore  # noqa: E501
            tags.extend(["identity", sun.get("element", ""), sun.get("quality", "")])  # type: ignore  # noqa: E501

        if "moon_nature" in core:
            moon = core["moon_nature"]
            content_sections.append(f"**Emotional Nature**: {moon.get('description', '')}")  # type: ignore  # noqa: E501
            summary_parts.append(f"seeks {moon.get('needs', 'emotional fulfillment')}")  # type: ignore  # noqa: E501
            tags.extend(["emotions", "intuition"])  # type: ignore

    # Process life purpose - type: ignore for dynamic astrological data
    if "life_purpose" in raw_interpretation:
        purpose = raw_interpretation["life_purpose"]
        if "soul_purpose" in purpose:
            soul = purpose["soul_purpose"]
            content_sections.append(f"**Soul Purpose**: {soul.get('growth_direction', '')}")  # type: ignore  # noqa: E501
            tags.extend(["purpose", "growth"])  # type: ignore

        if "life_mission" in purpose:
            content_sections.append(f"**Life Mission**: {purpose['life_mission']}")  # type: ignore  # noqa: E501

    # Process relationship patterns - type: ignore for dynamic astrological data  # noqa: E501
    if "relationship_patterns" in raw_interpretation:
        relationships = raw_interpretation["relationship_patterns"]
        if "love_style" in relationships:
            love = relationships["love_style"]
            content_sections.append(f"**Love Style**: {love.get('attraction_style', '')}")  # type: ignore  # noqa: E501
            tags.extend(["relationships", "love"])  # type: ignore

    # Process career path - type: ignore for dynamic astrological data
    if "career_path" in raw_interpretation:
        career = raw_interpretation["career_path"]
        if "career_direction" in career:
            direction = career["career_direction"]
            content_sections.append(f"**Career Direction**: {direction.get('natural_calling', '')}")  # type: ignore  # noqa: E501
            tags.extend(["career", "profession"])  # type: ignore

    # Process growth challenges - type: ignore for dynamic astrological data
    if "growth_challenges" in raw_interpretation:
        challenges = raw_interpretation["growth_challenges"]
        if "saturn_lessons" in challenges:
            saturn = challenges["saturn_lessons"]
            content_sections.append(f"**Growth Challenges**: {saturn.get('mastery_challenge', '')}")  # type: ignore  # noqa: E501
            tags.extend(["growth", "challenges"])  # type: ignore

    # Process spiritual gifts - type: ignore for dynamic astrological data
    if "spiritual_gifts" in raw_interpretation:
        spiritual = raw_interpretation["spiritual_gifts"]
        if "psychic_abilities" in spiritual:
            psychic = spiritual["psychic_abilities"]
            if psychic.get("intuitive_gifts"):
                content_sections.append(f"**Spiritual Gifts**: {psychic['intuitive_gifts']}")  # type: ignore  # noqa: E501
                tags.extend(["spirituality", "intuition"])  # type: ignore

    # Clean up tags - type: ignore for list comprehension with dynamic data
    tags = list(set([tag for tag in tags if tag and tag != ""]))[:8]  # type: ignore  # noqa: E501

    # Create title based on interpretation type and level
    title_map = {
        "natal": "Natal Chart Analysis",
        "transit": "Current Transit Analysis",
        "synastry": "Relationship Compatibility",
        "composite": "Composite Chart Reading",
    }

    request_type = request.type or "natal"
    title = title_map.get(request_type, "Astrological Analysis")
    if interpretation_level == "advanced":
        title = f"Advanced {title}"
    elif interpretation_level == "focused":
        title = f"Focused {title}"

    # Combine content
    full_content = (
        "\n\n".join(content_sections)
        if content_sections
        else "Detailed interpretation generated using advanced astrological analysis."  # noqa: E501
    )

    # Create summary
    summary = (
        ". ".join(summary_parts[:3])
        if summary_parts
        else "Comprehensive astrological insights based on your unique chart."
    )

    # Calculate confidence based on data completeness
    confidence = calculate_confidence(raw_interpretation)

    return {
        "chartId": request.chartId,
        "userId": request.userId,
        "type": request.type or "natal",
        "title": title,
        "content": full_content,
        "summary": summary,
        "tags": tags,
        "confidence": confidence,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }


def calculate_confidence(raw_interpretation: Dict[str, Any]) -> float:
    """
    Calculate confidence score based on interpretation completeness.
    """
    total_sections = 8  # core_identity, life_purpose, relationships, career, growth, spiritual, current_phase, integration  # noqa: E501
    completed_sections = 0

    key_sections = [
        "core_identity",
        "life_purpose",
        "relationship_patterns",
        "career_path",
        "growth_challenges",
        "spiritual_gifts",
        "current_life_phase",
        "integration_themes",
    ]

    for section in key_sections:
        if section in raw_interpretation and raw_interpretation[section]:
            completed_sections += 1

    base_confidence = completed_sections / total_sections

    # Boost confidence if core sections are complete
    if (
        "core_identity" in raw_interpretation
        and raw_interpretation["core_identity"]
    ):
        base_confidence += 0.1

    return min(0.95, max(0.65, base_confidence))  # Keep between 65% and 95%
