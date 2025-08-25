"""
Circuit Breaker Pattern Implementation with Exponential Backoff
Part of REL-010: Circuit Breaker + Backoff Helpers
"""

import asyncio
import logging
import random
import time
from enum import Enum
from dataclasses import dataclass
from functools import wraps
from typing import TypeVar, Optional, Callable, Awaitable, Any

logger = logging.getLogger(__name__)

T = TypeVar('T')


class CircuitState(Enum):
    """Circuit breaker states"""
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, reject calls
    HALF_OPEN = "half_open"  # Testing if service recovered


@dataclass
class CircuitBreakerConfig:
    """Circuit breaker configuration"""
    failure_threshold: int = 5  # Failures before opening circuit
    recovery_timeout: float = 60.0  # Seconds before trying recovery
    success_threshold: int = 2  # Successes needed to close circuit
    timeout: float = 30.0  # Operation timeout in seconds

    # Exponential backoff config
    initial_delay: float = 1.0  # Initial backoff delay
    max_delay: float = 60.0  # Maximum backoff delay
    backoff_multiplier: float = 2.0  # Backoff multiplier
    jitter: bool = True  # Add random jitter to delays


class CircuitBreakerError(Exception):
    """Raised when circuit breaker is open"""
    pass


class CircuitBreaker:
    """
    Circuit breaker with exponential backoff for async operations.

    States:
    - CLOSED: Normal operation, calls pass through
    - OPEN: Service is failing, calls are rejected immediately
    - HALF_OPEN: Testing if service has recovered
    """

    def __init__(self,
        name: str,
        config: Optional[CircuitBreakerConfig] = None):
        self.name = name
        self.config = config or CircuitBreakerConfig()
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = 0.0
        self.next_attempt_time = 0.0

    def _calculate_backoff_delay(self, attempt: int) -> float:
        """Calculate exponential backoff delay with jitter"""
        delay = min(
            self.config.initial_delay * (self.config.backoff_multiplier ** attempt),
            self.config.max_delay
        )

        if self.config.jitter:
            # Add ±25% jitter
            jitter_range = delay * 0.25
            delay += random.uniform(-jitter_range, jitter_range)

        return max(0, delay)

    def _should_attempt_reset(self) -> bool:
        """Check if we should attempt to reset the circuit"""
        if self.state != CircuitState.OPEN:
            return False

        return time.time() >= self.next_attempt_time

    def _on_success(self):
        """Handle successful operation"""
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.config.success_threshold:
                self.state = CircuitState.CLOSED
                self.failure_count = 0
                self.success_count = 0
                logger.info(f"Circuit breaker '{self.name}' closed after recovery")
        elif self.state == CircuitState.CLOSED:
            # Reset failure count on success
            self.failure_count = 0

    def _on_failure(self, error: Exception):
        """Handle failed operation"""
        self.failure_count += 1
        self.last_failure_time = time.time()

        if self.state == CircuitState.CLOSED:
            if self.failure_count >= self.config.failure_threshold:
                self.state = CircuitState.OPEN
                backoff_delay = self._calculate_backoff_delay(self.failure_count - self.config.failure_threshold)
                self.next_attempt_time = time.time() + max(backoff_delay,
                    self.config.recovery_timeout)
                logger.warning(
                    f"Circuit breaker '{self.name}' opened after {self.failure_count} failures. "
                    f"Next attempt in {self.next_attempt_time - time.time():.1f}s"
                )
        elif self.state == CircuitState.HALF_OPEN:
            # Failed during recovery, go back to open
            self.state = CircuitState.OPEN
            self.success_count = 0
            backoff_delay = self._calculate_backoff_delay(self.failure_count - self.config.failure_threshold)
            self.next_attempt_time = time.time() + max(backoff_delay,
                self.config.recovery_timeout)
            logger.warning(
                f"Circuit breaker '{self.name}' failed during recovery, reopening. "
                f"Next attempt in {self.next_attempt_time - time.time():.1f}s"
            )

    async def call(self,
        func: Callable[...,
        Awaitable[T]],
        *args: Any,
        **kwargs: Any) -> T:
        """
        Execute function with circuit breaker protection.

        Args:
            func: Async function to execute
            *args, **kwargs: Arguments to pass to func

        Returns:
            Result of func execution

        Raises:
            CircuitBreakerError: If circuit is open
            asyncio.TimeoutError: If operation times out
            Exception: Original exception from func
        """
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
                logger.info(f"Circuit breaker '{self.name}' attempting recovery")
            else:
                time_until_retry = self.next_attempt_time - time.time()
                raise CircuitBreakerError(
                    f"Circuit breaker '{self.name}' is open. "
                    f"Retry in {time_until_retry:.1f}s. "
                    f"Failures: {self.failure_count}"
                )

        # Execute with timeout
        try:
            result = await asyncio.wait_for(
                func(*args, **kwargs),
                timeout=self.config.timeout
            )
            self._on_success()
            return result

        except Exception as error:
            self._on_failure(error)
            raise

    def get_state(self) -> dict[str, Any]:
        """Get current circuit breaker state for monitoring"""
        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self.failure_count,
            "success_count": self.success_count,
            "last_failure_time": self.last_failure_time,
            "next_attempt_time": self.next_attempt_time if self.state == CircuitState.OPEN else None,
            "time_until_retry": max(0,
                self.next_attempt_time - time.time()) if self.state == CircuitState.OPEN else 0,
        }


def circuit_breaker(name: str, config: Optional[CircuitBreakerConfig] = None):
    """
    Decorator to add circuit breaker protection to async functions.

    Usage:
        @circuit_breaker("redis_operations")


        async def connect_to_redis():
            # your async code here
            pass
    """
    breaker = CircuitBreaker(name, config)

    def decorator(func: Callable[...,
        Awaitable[T]]) -> Callable[...,
        Awaitable[T]]:
        @wraps(func)


        async def wrapper(*args: Any, **kwargs: Any) -> T:
            return await breaker.call(func, *args, **kwargs)

        # Attach breaker to function for monitoring
        wrapper._circuit_breaker = breaker  # type: ignore
        return wrapper

    return decorator


# Global registry for monitoring all circuit breakers
_circuit_breakers: dict[str, CircuitBreaker] = {}


def register_circuit_breaker(breaker: CircuitBreaker) -> CircuitBreaker:
    """Register a circuit breaker for global monitoring"""
    _circuit_breakers[breaker.name] = breaker
    return breaker


def get_all_circuit_breakers() -> dict[str, dict[str, Any]]:
    """Get state of all registered circuit breakers for monitoring"""
    return {name: breaker.get_state() for name,
        breaker in _circuit_breakers.items()}


def get_circuit_breaker_health() -> dict[str, Any]:
    """Get overall health status of all circuit breakers"""
    breakers = get_all_circuit_breakers()

    total = len(breakers)
    open_count = sum(1 for b in breakers.values() if b["state"] == "open")
    half_open_count = sum(1 for b in breakers.values() if b["state"] == "half_open")
    closed_count = total - open_count - half_open_count

    return {
        "total_breakers": total,
        "healthy": closed_count,
        "degraded": half_open_count,
        "failing": open_count,
        "overall_health": "healthy" if open_count == 0 else "degraded" if half_open_count > 0 else "failing"
    }
