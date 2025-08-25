"""
Circuit Breaker Monitoring API
Part of REL-010: Circuit Breaker + Backoff Helpers
Part of REL-011: Fallback Outcome Logging
Part of REL-012: Firebase Auth Dependency Timeout Investigation
"""

from typing import Dict, Any
from fastapi import APIRouter, Query
from utils.circuit_breaker import (
    get_all_circuit_breakers,
    get_circuit_breaker_health
)
from utils.fallback_logging import fallback_logger
from utils.firebase_auth_service import get_firebase_auth_service

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


@router.get("/circuit-breakers")
async def get_circuit_breaker_status() -> Dict[str, Any]:  # noqa: F821
    """
    Get status of all circuit breakers in the system.

    Returns:
        Dictionary with individual breaker states and overall health
    """
    return {
        "circuit_breakers": get_all_circuit_breakers(),
        "health": get_circuit_breaker_health()
    }


@router.get("/circuit-breakers/health")
async def get_circuit_breaker_health_check() -> Dict[str, Any]:  # noqa: F821
    """
    Get overall health status of circuit breakers for health checks.

    Returns:
        Simple health status suitable for load balancer health checks
    """
    health = get_circuit_breaker_health()

    # Determine HTTP status based on health
    status_code = 200
    if health["overall_health"] == "failing":
        status_code = 503  # Service Unavailable
    elif health["overall_health"] == "degraded":
        status_code = 200  # OK but degraded

    return {
        "status": health["overall_health"],
        "healthy_services": health["healthy"],
        "total_services": health["total_breakers"],
        "http_status": status_code
    }


@router.get("/fallbacks")
async def get_fallback_events() -> Dict[str, Any]:  # noqa: F821
    """
    Get recent fallback events for monitoring.
    Part of REL-011: Fallback Outcome Logging
    """
    return {
        "recent_events": fallback_logger.get_recent_events(50),
        "summary": fallback_logger.get_summary_stats(24)
    }


@router.get("/fallbacks/summary")
async def get_fallback_summary(hours: int = Query(24,
    ge=1,  # noqa: E128
    le=168)) -> Dict[str,  # noqa: E128,F821
    Any]:  # noqa: E125,E128,F821
    """
    Get fallback summary statistics for specified time window.
    Part of REL-011: Fallback Outcome Logging
    """
    return fallback_logger.get_summary_stats(hours)


@router.get("/firebase-auth")
async def get_firebase_auth_status() -> Dict[str, Any]:  # noqa: F821
    """
    Get Firebase Auth service status including circuit breaker state.
    Part of REL-012: Firebase Auth Dependency Timeout Investigation

    Returns:
        Firebase Auth service health and configuration details
    """
    auth_service = get_firebase_auth_service()
    return auth_service.get_health_status()
