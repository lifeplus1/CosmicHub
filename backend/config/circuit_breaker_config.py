"""
Environment configuration for Circuit Breaker settings
Part of REL-010: Circuit Breaker + Backoff Helpers
"""

import os
from dataclasses import dataclass
from typing import Dict, Any

@dataclass  # noqa: E302
class CircuitBreakerSettings:
    """Circuit breaker configuration from environment variables"""

    # Redis Circuit Breaker
    redis_failure_threshold: int = int(os.getenv("REDIS_CIRCUIT_FAILURE_THRESHOLD",  # noqa: E501
        "3"))  # noqa: E128
    redis_recovery_timeout: float = float(os.getenv("REDIS_CIRCUIT_RECOVERY_TIMEOUT",  # noqa: E501
        "30.0"))  # noqa: E128
    redis_success_threshold: int = int(os.getenv("REDIS_CIRCUIT_SUCCESS_THRESHOLD",  # noqa: E501
        "2"))  # noqa: E128
    redis_timeout: float = float(os.getenv("REDIS_CIRCUIT_TIMEOUT", "5.0"))

    # External API Circuit Breaker (xAI, Firebase, Stripe)
    external_api_failure_threshold: int = int(os.getenv("EXTERNAL_API_CIRCUIT_FAILURE_THRESHOLD",  # noqa: E501
        "5"))  # noqa: E128
    external_api_recovery_timeout: float = float(os.getenv("EXTERNAL_API_CIRCUIT_RECOVERY_TIMEOUT",  # noqa: E501
        "60.0"))  # noqa: E128
    external_api_success_threshold: int = int(os.getenv("EXTERNAL_API_CIRCUIT_SUCCESS_THRESHOLD",  # noqa: E501
        "3"))  # noqa: E128
    external_api_timeout: float = float(os.getenv("EXTERNAL_API_CIRCUIT_TIMEOUT",  # noqa: E501
        "30.0"))  # noqa: E128

    # Backoff Configuration
    initial_delay: float = float(os.getenv("CIRCUIT_BREAKER_INITIAL_DELAY",
        "1.0"))  # noqa: E128
    max_delay: float = float(os.getenv("CIRCUIT_BREAKER_MAX_DELAY", "60.0"))
    backoff_multiplier: float = float(os.getenv("CIRCUIT_BREAKER_BACKOFF_MULTIPLIER",  # noqa: E501
        "2.0"))  # noqa: E128
    jitter_enabled: bool = os.getenv("CIRCUIT_BREAKER_JITTER",
        "true").lower() == "true"  # noqa: E128

# Global settings instance
circuit_breaker_settings = CircuitBreakerSettings()  # noqa: E305

def get_redis_circuit_config() -> Dict[str, Any]:  # noqa: E302
    """Get Redis-specific circuit breaker configuration"""
    return {
        "failure_threshold": circuit_breaker_settings.redis_failure_threshold,
        "recovery_timeout": circuit_breaker_settings.redis_recovery_timeout,
        "success_threshold": circuit_breaker_settings.redis_success_threshold,
        "timeout": circuit_breaker_settings.redis_timeout,
        "initial_delay": circuit_breaker_settings.initial_delay,
        "max_delay": circuit_breaker_settings.max_delay,
        "backoff_multiplier": circuit_breaker_settings.backoff_multiplier,
        "jitter": circuit_breaker_settings.jitter_enabled,
    }

def get_external_api_circuit_config() -> Dict[str, Any]:  # noqa: E302
    """Get external API circuit breaker configuration"""
    return {
        "failure_threshold": circuit_breaker_settings.external_api_failure_threshold,  # noqa: E501
        "recovery_timeout": circuit_breaker_settings.external_api_recovery_timeout,  # noqa: E501
        "success_threshold": circuit_breaker_settings.external_api_success_threshold,  # noqa: E501
        "timeout": circuit_breaker_settings.external_api_timeout,
        "initial_delay": circuit_breaker_settings.initial_delay,
        "max_delay": circuit_breaker_settings.max_delay,
        "backoff_multiplier": circuit_breaker_settings.backoff_multiplier,
        "jitter": circuit_breaker_settings.jitter_enabled,
    }
