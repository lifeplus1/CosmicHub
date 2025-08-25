"""
Firebase Auth Service with Circuit Breaker Protection
Implementation of REL-012: Firebase Auth Dependency Timeout Investigation

This service wraps Firebase Admin SDK auth operations with:
- Circuit breaker protection for network timeouts
- Proper async/await patterns for non-blocking execution
- Configurable timeouts and retry logic
- Test environment mocking support
"""

import asyncio
import logging
import os
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Optional, Protocol

import firebase_admin
from firebase_admin import auth

from .circuit_breaker import (
    CircuitBreaker, CircuitBreakerConfig, CircuitBreakerError,
    register_circuit_breaker
)


class FirebaseAuthToken(Protocol):
    """Protocol for Firebase auth token data structure"""
    uid: str
    email: Optional[str]
    email_verified: Optional[bool]
    iss: str
    aud: str
    auth_time: int
    iat: int
    exp: int
    firebase: Dict[str, Any]

logger = logging.getLogger(__name__)

# Thread pool for Firebase Admin SDK calls (which are synchronous)
_firebase_auth_executor = ThreadPoolExecutor(
    max_workers=4, thread_name_prefix="firebase_auth"
)


class FirebaseAuthConfig:
    """Configuration for Firebase Auth service"""

    def __init__(self):
        # 5 second default timeout
        self.timeout = float(os.getenv("FIREBASE_AUTH_TIMEOUT", "5.0"))
        # 3 failures before circuit opens
        self.failure_threshold = int(
            os.getenv("FIREBASE_AUTH_FAILURE_THRESHOLD", "3")
        )
        # 30 second recovery timeout
        self.recovery_timeout = float(
            os.getenv("FIREBASE_AUTH_RECOVERY_TIMEOUT", "30.0")
        )
        # Circuit breaker enable flag
        self.enable_circuit_breaker = os.getenv(
            "FIREBASE_AUTH_CIRCUIT_BREAKER", "true"
        ).lower() in ("true", "1", "yes")


class FirebaseAuthService:
    """
    Firebase Auth service with circuit breaker protection and timeout handling.

    This service addresses the timeout issue identified in REL-012 by:
    1. Wrapping synchronous Firebase Admin SDK calls in async executor
    2. Adding configurable timeouts to prevent indefinite hangs
    3. Using circuit breaker pattern to fail fast when Firebase is unavailable
    4. Providing proper test environment mocking
    """

    def __init__(self, config: Optional[FirebaseAuthConfig] = None):
        self.config = config or FirebaseAuthConfig()
        self._circuit_breaker: Optional[CircuitBreaker] = None
        self._test_mode = self._is_test_environment()

        if self.config.enable_circuit_breaker:
            self._setup_circuit_breaker()

        logger.info(
            "Firebase Auth Service initialized - "
            f"timeout: {self.config.timeout}s, "
            f"test_mode: {self._test_mode}, "
            f"circuit_breaker: {self.config.enable_circuit_breaker}"
        )

    def _is_test_environment(self) -> bool:
        """Check if we're running in test environment"""
        return (
            os.getenv("PYTEST_CURRENT_TEST") is not None
            or os.getenv("CI") is not None
            or os.getenv("TEST_MODE", "0") in ("1", "true", "yes")
        )

    def _setup_circuit_breaker(self):
        """Setup circuit breaker for Firebase auth operations"""
        circuit_config = CircuitBreakerConfig(
            failure_threshold=self.config.failure_threshold,
            recovery_timeout=self.config.recovery_timeout,
            timeout=self.config.timeout,
            initial_delay=1.0,
            max_delay=30.0,
            backoff_multiplier=2.0,
            jitter=True
        )

        self._circuit_breaker = register_circuit_breaker(
            CircuitBreaker("firebase_auth", circuit_config)
        )

        logger.info(
            "Firebase Auth circuit breaker configured - "
            f"failure_threshold: {circuit_config.failure_threshold}, "
            f"timeout: {circuit_config.timeout}s"
        )

    async def _verify_token_sync(
        self, token: str, check_revoked: bool = False
    ) -> Dict[str, Any]:
        """
        Synchronous Firebase token verification wrapped for async execution.
        This is the actual Firebase Admin SDK call that was causing timeouts.
        
        Note: Firebase Admin SDK auth.verify_id_token has incomplete type annotations,
        so we handle the unknown return type explicitly and convert to typed dict.
        """
        try:
            # Run the synchronous Firebase Admin SDK call in a thread pool
            # This prevents blocking the main event loop
            loop = asyncio.get_event_loop()

            # Use run_in_executor to make the sync call async
            # Firebase Admin SDK returns a dict but types are incomplete
            result: Any = await loop.run_in_executor(
                _firebase_auth_executor,
                # Explicit type ignore for Firebase SDK's incomplete typing
                lambda: auth.verify_id_token(  # type: ignore[misc]
                    token, check_revoked=check_revoked
                )
            )

            # Convert to typed dict - Firebase always returns dict with fields
            # We validate the structure to ensure it matches our expectations
            if not isinstance(result, dict):
                raise ValueError("Firebase auth returned non-dict result")
            
            # Explicitly cast the unknown Firebase result to our known structure
            # Firebase Admin SDK guarantees this is a dict[str, Any] but typing is incomplete
            token_data: Dict[str, Any] = result  # type: ignore[assignment]
            
            # Validate required fields are present
            required_fields = ['uid', 'iss', 'aud', 'iat', 'exp']
            missing_fields = [field for field in required_fields if field not in token_data]
            if missing_fields:
                raise ValueError(f"Firebase token missing required fields: {missing_fields}")

            logger.debug(
                "Firebase token verification successful for uid: "
                f"{token_data.get('uid', 'unknown')}"
            )
            return token_data

        except Exception as e:
            logger.error(f"Firebase token verification failed: {e}")
            raise

    async def verify_id_token(
        self,
        token: str,
        check_revoked: bool = False
    ) -> Dict[str, Any]:
        """
        Verify Firebase ID token with circuit breaker protection and timeout.

        This method addresses the core issue in REL-012 by:
        1. Using async execution to prevent blocking
        2. Adding proper timeout handling
        3. Implementing circuit breaker protection
        4. Providing test environment bypasses

        Args:
            token: Firebase ID token to verify
            check_revoked: Whether to check if token is revoked

        Returns:
            Decoded token data containing user information

        Raises:
            CircuitBreakerError: If circuit breaker is open
            asyncio.TimeoutError: If verification times out
            ValueError: If token is invalid or verification fails
        """

        # Fast path for test environments - avoid Firebase entirely
        if self._test_mode:
            logger.debug("Test mode: using mock token verification")
            return self._mock_token_verification(token)

        # Check if Firebase Admin is properly initialized
        try:
            firebase_admin.get_app()  # type: ignore[misc]
        except ValueError:
            logger.error("Firebase Admin SDK not initialized")
            raise ValueError("Firebase Admin SDK not initialized")

        # Use circuit breaker if enabled
        if self._circuit_breaker:
            try:
                return await self._circuit_breaker.call(
                    self._verify_token_sync,
                    token,
                    check_revoked
                )
            except CircuitBreakerError as e:
                logger.warning(f"Firebase Auth circuit breaker is open: {e}")
                # In production, you might want to return a degraded response
                # For now, we'll re-raise the circuit breaker error
                raise
        else:
            # Direct call with timeout (fallback if circuit breaker disabled)
            try:
                return await asyncio.wait_for(
                    self._verify_token_sync(token, check_revoked),
                    timeout=self.config.timeout
                )
            except asyncio.TimeoutError:
                logger.error(
                    "Firebase token verification timed out after "
                    f"{self.config.timeout}s"
                )
                raise asyncio.TimeoutError(
                    "Firebase token verification timed out after "
                    f"{self.config.timeout}s"
                )

    def _mock_token_verification(self, token: str) -> Dict[str, Any]:
        """
        Mock token verification for test environments.
        This prevents network calls to Firebase during testing.
        """
        # Extract mock UID from token, or use default
        uid = token if token and token != "test" else "dev-user"

        # Remove any "Bearer " prefix
        if uid.startswith("Bearer "):
            uid = uid[7:]  # len("Bearer ") = 7

        # Build mock response with proper typing
        mock_result: Dict[str, Any] = {
            "uid": uid,
            "email": f"{uid}@test.com",
            "email_verified": True,
            "name": f"Test User ({uid})",
            "picture": None,
            "iss": "https://securetoken.google.com/mock-project",
            "aud": "mock-project",
            "auth_time": int(time.time()),
            "iat": int(time.time()),
            "exp": int(time.time()) + 3600,
            "firebase": {
                "identities": {"email": [f"{uid}@test.com"]},
                "sign_in_provider": "password"
            }
        }

        logger.debug(f"Mock token verification for uid: {uid}")
        return mock_result

    def get_health_status(self) -> Dict[str, Any]:
        """Get health status including circuit breaker state"""
        status: Dict[str, Any] = {
            "service": "firebase_auth",
            "test_mode": self._test_mode,
            "config": {
                "timeout": self.config.timeout,
                "circuit_breaker_enabled": self.config.enable_circuit_breaker,
                "failure_threshold": self.config.failure_threshold,
                "recovery_timeout": self.config.recovery_timeout,
            }
        }

        if self._circuit_breaker:
            status["circuit_breaker"] = self._circuit_breaker.get_state()

        return status


# Global instance (singleton pattern)
_firebase_auth_service: Optional[FirebaseAuthService] = None


def get_firebase_auth_service() -> FirebaseAuthService:
    """
    Get global Firebase Auth service instance.
    Uses singleton pattern for consistent configuration across the application.
    """
    global _firebase_auth_service

    if _firebase_auth_service is None:
        _firebase_auth_service = FirebaseAuthService()

    return _firebase_auth_service


def configure_firebase_auth_service(
    config: FirebaseAuthConfig
) -> FirebaseAuthService:
    """
    Configure global Firebase Auth service with custom settings.
    Useful for testing or custom deployment configurations.
    """
    global _firebase_auth_service
    _firebase_auth_service = FirebaseAuthService(config)
    return _firebase_auth_service


# Convenience function for backward compatibility
async def verify_firebase_token(
    token: str, check_revoked: bool = False
) -> Dict[str, Any]:
    """
    Convenience function for verifying Firebase tokens.

    This function provides a drop-in replacement for direct
    auth.verify_id_token() calls with added timeout protection
    and circuit breaker functionality.
    """
    service = get_firebase_auth_service()
    return await service.verify_id_token(token, check_revoked)
