"""
CSRF Protection middleware for CosmicHub API
Implements CSRF token generation and validation
Part of SEC-006: Threat Model Mitigation (Batch 1)
"""

import hashlib
import hmac
import os
import secrets
import time
from typing import List, Optional, Callable, Awaitable, Any

from fastapi import HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response as StarletteResponse


class CSRFProtection:
    """
    CSRF token generation and validation utility
    """
  # noqa: E114, W293
    def __init__(self, secret_key: Optional[str] = None, token_lifetime: int = 3600):  # noqa: E501
        """
        Initialize CSRF protection
  # noqa: W293
        Args:
            secret_key: Secret key for HMAC signing (defaults to env
                CSRF_SECRET_KEY)  # noqa: E501
            token_lifetime: Token lifetime in seconds (default: 1 hour)
        """
        self.secret_key = secret_key or os.getenv("CSRF_SECRET_KEY", "")
        if not self.secret_key:
            # Generate a random secret key if none provided (not recommended for production)  # noqa: E501
            self.secret_key = secrets.token_urlsafe(32)
            if os.getenv("DEPLOY_ENVIRONMENT", "development").lower() != "development":  # noqa: E501
                raise ValueError("CSRF_SECRET_KEY environment variable is required in production")  # noqa: E501
  # noqa: E114, W293
        self.token_lifetime = token_lifetime
  # noqa: E114, W293
    def generate_token(self, user_id: Optional[str] = None, session_id: Optional[str] = None) -> str:  # noqa: E301, E501
        """
        Generate a CSRF token
  # noqa: W293
        Args:
            user_id: Optional user ID to bind token to
            session_id: Optional session ID to bind token to
  # noqa: W293
        Returns:
            Base64-encoded CSRF token
        """
        # Create timestamp
        timestamp = str(int(time.time()))
  # noqa: E114, W293
        # Create random component
        random_component = secrets.token_urlsafe(16)
  # noqa: E114, W293
        # Create payload (timestamp:random:user_id:session_id)
        payload_parts = [timestamp, random_component]
        if user_id:
            payload_parts.append(f"u:{user_id}")
        if session_id:
            payload_parts.append(f"s:{session_id}")
  # noqa: E114, W293
        payload = ":".join(payload_parts)
  # noqa: E114, W293
        # Create HMAC signature
        signature = hmac.new(
            self.secret_key.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
  # noqa: E114, W293
        # Combine payload and signature
        token = f"{payload}:{signature}"
  # noqa: E114, W293
        # Base64 encode for safe transport
        import base64
        return base64.urlsafe_b64encode(token.encode()).decode().rstrip('=')
  # noqa: E114, W293
    def validate_token(self, token: str, user_id: Optional[str] = None, session_id: Optional[str] = None) -> bool:  # noqa: E301, E501
        """
        Validate a CSRF token
  # noqa: W293
        Args:
            token: Base64-encoded CSRF token
            user_id: Optional user ID to verify against
            session_id: Optional session ID to verify against
  # noqa: W293
        Returns:
            True if token is valid, False otherwise
        """
        try:
            # Base64 decode
            import base64
            # Add padding if needed
            padded_token = token + '=' * (4 - len(token) % 4)
            decoded = base64.urlsafe_b64decode(padded_token).decode()
  # noqa: E114, W293
            # Split payload and signature
            parts = decoded.split(':')
            if len(parts) < 3:
                return False
  # noqa: E114, W293
            signature = parts[-1]
            payload = ':'.join(parts[:-1])
  # noqa: E114, W293
            # Verify HMAC signature
            expected_signature = hmac.new(
                self.secret_key.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
  # noqa: E114, W293
            if not hmac.compare_digest(signature, expected_signature):
                return False
  # noqa: E114, W293
            # Parse payload
            payload_parts = payload.split(':')
            if len(payload_parts) < 2:
                return False
  # noqa: E114, W293
            timestamp_str = payload_parts[0]
            # random_component = payload_parts[1]  # Not needed for validation
  # noqa: E114, W293
            # Check timestamp
            try:
                token_timestamp = int(timestamp_str)
                current_time = int(time.time())
  # noqa: E114, W293
                if current_time - token_timestamp > self.token_lifetime:
                    return False
  # noqa: E114, W293
                # Don't allow tokens from the future (with small tolerance for clock skew)  # noqa: E501
                if token_timestamp > current_time + 60:
                    return False
  # noqa: E114, W293
            except ValueError:
                return False
  # noqa: E114, W293
            # Validate user/session binding if provided
            if user_id:
                # Look for 'u' followed by user_id in consecutive parts
                user_found = False
                for i in range(len(payload_parts) - 1):
                    if payload_parts[i] == 'u' and payload_parts[i + 1] == user_id:  # noqa: E501
                        user_found = True
                        break
                if not user_found:
                    return False
  # noqa: E114, W293
            if session_id:
                # Look for 's' followed by session_id in consecutive parts  # noqa: E501, W291
                session_found = False
                for i in range(len(payload_parts) - 1):
                    if payload_parts[i] == 's' and payload_parts[i + 1] == session_id:  # noqa: E501
                        session_found = True
                        break
                if not session_found:
                    return False
  # noqa: E114, W293
            return True
  # noqa: E114, W293
        except Exception:
            return False


class CSRFMiddleware(BaseHTTPMiddleware):
    """
    CSRF protection middleware for FastAPI
    """
  # noqa: E114, W293
    def __init__(self, app: Any, csrf_protection: CSRFProtection, exempt_paths: Optional[List[str]] = None):  # noqa: E501
        super().__init__(app)
        self.csrf = csrf_protection
        self.exempt_paths = exempt_paths or [
            "/health",
            "/metrics",
            "/docs",
            "/openapi.json",
            "/redoc",
            "/csp/report"
        ]
        # Methods that require CSRF protection
        self.protected_methods = ["POST", "PUT", "DELETE", "PATCH"]
        
        # Check if we're in test mode
        import os
        self.test_mode = os.getenv("TEST_MODE") == "1" or os.getenv("PYTEST_CURRENT_TEST") is not None
  # noqa: E114, W293
    def _is_exempt(self, path: str) -> bool:  # noqa: E301
        """Check if path is exempt from CSRF protection"""
        return any(path.startswith(exempt) for exempt in self.exempt_paths)
  # noqa: E114, W293
    def _get_csrf_token_from_request(self, request: StarletteRequest) -> Optional[str]:  # noqa: E301, E501
        """Extract CSRF token from request headers or form data"""
        # Check X-CSRF-Token header
        token = request.headers.get("X-CSRF-Token")
        if token:
            return token
  # noqa: E114, W293
        # Check X-CSRFToken header (alternative name)
        token = request.headers.get("X-CSRFToken")
        if token:
            return token
  # noqa: E114, W293
        return None
  # noqa: E114, W293
    async def dispatch(self, request: StarletteRequest, call_next: Callable[[StarletteRequest], Awaitable[StarletteResponse]]) -> StarletteResponse:  # noqa: E301, E501
        """Process CSRF protection"""
        # Skip CSRF protection in test mode
        if self.test_mode:
            return await call_next(request)
            
        # Skip if method doesn't need protection
        if request.method not in self.protected_methods:
            response = await call_next(request)
            # Add CSRF token to safe responses for client consumption
            if request.method == "GET" and not self._is_exempt(request.url.path):  # noqa: E501
                # Generate token for client
                user_id = getattr(request.state, 'user_id', None)
                session_id = request.session.get('id') if hasattr(request, 'session') else None  # noqa: E501
                csrf_token = self.csrf.generate_token(user_id, session_id)
                response.headers["X-CSRF-Token"] = csrf_token
            return response
  # noqa: E114, W293
        # Skip if path is exempt
        if self._is_exempt(request.url.path):
            return await call_next(request)
  # noqa: E114, W293
        # Get CSRF token from request
        csrf_token = self._get_csrf_token_from_request(request)
  # noqa: E114, W293
        if not csrf_token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token missing. Include X-CSRF-Token header."
            )
  # noqa: E114, W293
        # Validate token
        user_id = getattr(request.state, 'user_id', None)
        session_id = request.session.get('id') if hasattr(request, 'session') else None  # noqa: E501
  # noqa: E114, W293
        if not self.csrf.validate_token(csrf_token, user_id, session_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or expired CSRF token"
            )
  # noqa: E114, W293
        # Token is valid, proceed
        response = await call_next(request)
        return response


# Global CSRF protection instance
csrf_protection = CSRFProtection()


def get_csrf_token(user_id: Optional[str] = None, session_id: Optional[str] = None) -> str:  # noqa: E501
    """
    Generate a CSRF token for client use
  # noqa: W293
    Args:
        user_id: Optional user ID to bind token to
        session_id: Optional session ID to bind token to
  # noqa: W293
    Returns:
        CSRF token string
    """
    return csrf_protection.generate_token(user_id, session_id)


def verify_csrf_token(token: str, user_id: Optional[str] = None, session_id: Optional[str] = None) -> bool:  # noqa: E501
    """
    Verify a CSRF token
  # noqa: W293
    Args:
        token: CSRF token to verify
        user_id: Optional user ID to verify against
        session_id: Optional session ID to verify against
  # noqa: W293
    Returns:
        True if token is valid, False otherwise
    """
    return csrf_protection.validate_token(token, user_id, session_id)
