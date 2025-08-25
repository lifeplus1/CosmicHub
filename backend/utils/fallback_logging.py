"""
Fallback Outcome Logging System
Part of REL-011: Fallback Outcome Logging

Enhanced logging for fallback scenarios and degraded service modes.
"""

import logging
import time
from datetime import datetime, timezone
from enum import Enum
from dataclasses import dataclass, asdict
from contextlib import contextmanager
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)


class FallbackReason(Enum):
    """Reasons why a fallback was triggered"""
    TIMEOUT = "timeout"
    CONNECTION_ERROR = "connection_error"
    CIRCUIT_BREAKER_OPEN = "circuit_breaker_open"
    SERVICE_UNAVAILABLE = "service_unavailable"
    RATE_LIMITED = "rate_limited"
    AUTHENTICATION_ERROR = "authentication_error"
    VALIDATION_ERROR = "validation_error"
    UNKNOWN_ERROR = "unknown_error"


class ServiceType(Enum):
    """Types of services that can have fallbacks"""
    REDIS_CACHE = "redis_cache"
    FIRESTORE_DATABASE = "firestore_database"
    FIREBASE_AUTH = "firebase_auth"
    XAI_API = "xai_api"
    STRIPE_API = "stripe_api"
    EPHEMERIS_API = "ephemeris_api"
    EMAIL_SERVICE = "email_service"


@dataclass
class FallbackEvent:
    """Represents a fallback event with detailed context"""
    timestamp: datetime
    service_type: ServiceType
    primary_service: str
    fallback_service: str
    reason: FallbackReason
    error_message: str
    operation: str
    duration_ms: float
    user_id: Optional[str] = None
    request_id: Optional[str] = None
    additional_context: Optional[Dict[str, Any]] = None
    recovery_time_ms: Optional[float] = None
    performance_impact: Optional[str] = None


class FallbackLogger:
    """
    Centralized fallback logging system for tracking service degradation
    and recovery patterns.
    """

    def __init__(self):
        self.events: List[FallbackEvent] = []
        self._max_events = 1000  # Keep last 1000 events in memory

    def log_fallback(
        self,
        service_type: ServiceType,
        primary_service: str,
        fallback_service: str,
        reason: FallbackReason,
        error: Exception,
        operation: str,
        duration_ms: float,
        user_id: Optional[str] = None,
        request_id: Optional[str] = None,
        additional_context: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log a fallback event with structured data"""

        event = FallbackEvent(
            timestamp=datetime.now(timezone.utc),
            service_type=service_type,
            primary_service=primary_service,
            fallback_service=fallback_service,
            reason=reason,
            error_message=str(error),
            operation=operation,
            duration_ms=duration_ms,
            user_id=user_id,
            request_id=request_id,
            additional_context=additional_context or {},
        )

        # Add to in-memory store
        self.events.append(event)
        if len(self.events) > self._max_events:
            self.events.pop(0)

        # Determine performance impact
        impact = self._assess_performance_impact(duration_ms, service_type)
        event.performance_impact = impact

        # Log structured event
        logger.warning(
            f"FALLBACK_EVENT: {service_type.value} -> {fallback_service} "
            f"[{reason.value}] {operation} took {duration_ms:.1f}ms",
            extra={
                "event_type": "fallback",
                "service_type": service_type.value,
                "primary_service": primary_service,
                "fallback_service": fallback_service,
                "reason": reason.value,
                "error": str(error),
                "operation": operation,
                "duration_ms": duration_ms,
                "performance_impact": impact,
                "user_id": user_id,
                "request_id": request_id,
                "additional_context": additional_context,
            }
        )

    def log_recovery(
        self,
        service_type: ServiceType,
        service_name: str,
        recovery_time_ms: float,
        previous_fallback_count: int = 0
    ) -> None:
        """Log when a service recovers from fallback mode"""

        logger.info(
            f"SERVICE_RECOVERY: {service_type.value} '{service_name}' recovered "
            f"after {recovery_time_ms:.1f}ms (had {previous_fallback_count} fallbacks)",
            extra={
                "event_type": "recovery",
                "service_type": service_type.value,
                "service_name": service_name,
                "recovery_time_ms": recovery_time_ms,
                "previous_fallback_count": previous_fallback_count,
            }
        )

    def _assess_performance_impact(self,
        duration_ms: float,
        service_type: ServiceType) -> str:
        """Assess the performance impact of a fallback operation"""

        # Define baseline expected times for different services
        baselines = {
            ServiceType.REDIS_CACHE: 10,  # Redis should be < 10ms
            ServiceType.FIRESTORE_DATABASE: 100,  # Firestore < 100ms
            ServiceType.FIREBASE_AUTH: 200,  # Auth < 200ms
            ServiceType.XAI_API: 5000,  # AI APIs can be slow
            ServiceType.STRIPE_API: 2000,  # Payment APIs
            ServiceType.EPHEMERIS_API: 1000,  # Astro calculations
            ServiceType.EMAIL_SERVICE: 3000,  # Email sending
        }

        baseline = baselines.get(service_type, 1000)

        if duration_ms < baseline:
            return "minimal"
        elif duration_ms < baseline * 2:
            return "moderate"
        elif duration_ms < baseline * 5:
            return "significant"
        else:
            return "severe"

    def get_recent_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent fallback events for monitoring"""
        recent = self.events[-limit:] if len(self.events) > limit else self.events
        return [asdict(event) for event in recent]

    def get_summary_stats(self, hours: int = 24) -> Dict[str, Any]:
        """Get summary statistics for fallback events"""
        cutoff = datetime.now(timezone.utc).timestamp() - (hours * 3600)
        recent_events = [
            event for event in self.events
            if event.timestamp.timestamp() > cutoff
        ]

        if not recent_events:
            return {"total_fallbacks": 0, "services_affected": 0}

        # Group by service type
        by_service: Dict[str, int] = {}
        by_reason: Dict[str, int] = {}
        impact_counts = {"minimal": 0, "moderate": 0, "significant": 0, "severe": 0}

        for event in recent_events:
            service_key = event.service_type.value
            by_service[service_key] = by_service.get(service_key, 0) + 1

            reason_key = event.reason.value
            by_reason[reason_key] = by_reason.get(reason_key, 0) + 1

            if event.performance_impact:
                impact_counts[event.performance_impact] += 1

        return {
            "total_fallbacks": len(recent_events),
            "services_affected": len(by_service),
            "by_service": by_service,
            "by_reason": by_reason,
            "performance_impact": impact_counts,
            "time_window_hours": hours,
        }


# Global fallback logger instance
fallback_logger = FallbackLogger()


@contextmanager
def track_fallback_operation(
    service_type: ServiceType,
    primary_service: str,
    operation: str,
    user_id: Optional[str] = None,
    request_id: Optional[str] = None
):
    """
    Context manager to track operations that might fall back

    Usage:
        with track_fallback_operation(ServiceType.REDIS_CACHE,
            "redis",
            "get_key"):
            try:
                result = await redis_client.get(key)
            except Exception as e:
                # Will auto-log the fallback
                result = in_memory_cache.get(key)
                yield "in_memory_cache", FallbackReason.CONNECTION_ERROR, e
    """
    start_time = time.time()

    class FallbackTracker:
        def __init__(self):
            self.fallback_occurred = False

        def log_fallback(self,
            fallback_service: str,
            reason: FallbackReason,
            error: Exception):
            duration_ms = (time.time() - start_time) * 1000
            fallback_logger.log_fallback(
                service_type=service_type,
                primary_service=primary_service,
                fallback_service=fallback_service,
                reason=reason,
                error=error,
                operation=operation,
                duration_ms=duration_ms,
                user_id=user_id,
                request_id=request_id
            )
            self.fallback_occurred = True

    tracker = FallbackTracker()
    try:
        yield tracker
    except Exception as e:
        if not tracker.fallback_occurred:
            # Log as failed operation if no explicit fallback was logged
            duration_ms = (time.time() - start_time) * 1000
            fallback_logger.log_fallback(
                service_type=service_type,
                primary_service=primary_service,
                fallback_service="none",
                reason=FallbackReason.UNKNOWN_ERROR,
                error=e,
                operation=operation,
                duration_ms=duration_ms,
                user_id=user_id,
                request_id=request_id
            )
        raise


def log_fallback_event(
    service_type: ServiceType,
    primary_service: str,
    fallback_service: str,
    reason: FallbackReason,
    error: Exception,
    operation: str,
    duration_ms: float,
    user_id: Optional[str] = None,
    request_id: Optional[str] = None,
    additional_context: Optional[Dict[str, Any]] = None
) -> None:
    """Convenience function to log fallback events"""
    fallback_logger.log_fallback(
        service_type=service_type,
        primary_service=primary_service,
        fallback_service=fallback_service,
        reason=reason,
        error=error,
        operation=operation,
        duration_ms=duration_ms,
        user_id=user_id,
        request_id=request_id,
        additional_context=additional_context
    )


def log_service_recovery(
    service_type: ServiceType,
    service_name: str,
    recovery_time_ms: float,
    previous_fallback_count: int = 0
) -> None:
    """Convenience function to log service recovery"""
    fallback_logger.log_recovery(
        service_type=service_type,
        service_name=service_name,
        recovery_time_ms=recovery_time_ms,
        previous_fallback_count=previous_fallback_count
    )
