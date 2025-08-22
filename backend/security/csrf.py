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
from starlette.applications import Starlette


class CSRFProtection:
    """
    CSRF token generation and validation utility
    """
    
    def __init__(self, secret_key: Optional[str] = None, token_lifetime: int = 3600):
        """
        Initialize CSRF protection
        
        Args:
            secret_key: Secret key for HMAC signing (defaults to env CSRF_SECRET_KEY)
            token_lifetime: Token lifetime in seconds (default: 1 hour)
        """
        self.secret_key = secret_key or os.getenv("CSRF_SECRET_KEY", "")
        if not self.secret_key:
            # Generate a random secret key if none provided (not recommended for production)
            self.secret_key = secrets.token_urlsafe(32)
            if os.getenv("DEPLOY_ENVIRONMENT", "development").lower() != "development":
                raise ValueError("CSRF_SECRET_KEY environment variable is required in production")
        
        self.token_lifetime = token_lifetime
    
    def generate_token(self, user_id: Optional[str] = None, session_id: Optional[str] = None) -> str:
        """
        Generate a CSRF token
        
        Args:
            user_id: Optional user ID to bind token to
            session_id: Optional session ID to bind token to
        
        Returns:
            Base64-encoded CSRF token
        """
        # Create timestamp
        timestamp = str(int(time.time()))
        
        # Create random component
        random_component = secrets.token_urlsafe(16)
        
        # Create payload (timestamp:random:user_id:session_id)
        payload_parts = [timestamp, random_component]
        if user_id:
            payload_parts.append(f"u:{user_id}")
        if session_id:
            payload_parts.append(f"s:{session_id}")
        
        payload = ":".join(payload_parts)
        
        # Create HMAC signature
        signature = hmac.new(
            self.secret_key.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Combine payload and signature
        token = f"{payload}:{signature}"
        
        # Base64 encode for safe transport
        import base64
        return base64.urlsafe_b64encode(token.encode()).decode().rstrip('=')
    
    def validate_token(self, token: str, user_id: Optional[str] = None, session_id: Optional[str] = None) -> bool:
        """
        Validate a CSRF token
        
        Args:
            token: Base64-encoded CSRF token
            user_id: Optional user ID to verify against
            session_id: Optional session ID to verify against
        
        Returns:
            True if token is valid, False otherwise
        """
        try:
            # Base64 decode
            import base64
            # Add padding if needed
            padded_token = token + '=' * (4 - len(token) % 4)
            decoded = base64.urlsafe_b64decode(padded_token).decode()
            
            # Split payload and signature
            parts = decoded.split(':')
            if len(parts) < 3:
                return False
            
            signature = parts[-1]
            payload = ':'.join(parts[:-1])
            
            # Verify HMAC signature
            expected_signature = hmac.new(
                self.secret_key.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(signature, expected_signature):
                return False
            
            # Parse payload
            payload_parts = payload.split(':')
            if len(payload_parts) < 2:
                return False
            
            timestamp_str = payload_parts[0]
            # random_component = payload_parts[1]  # Not needed for validation
            
            # Check timestamp
            try:
                token_timestamp = int(timestamp_str)
                current_time = int(time.time())
                
                if current_time - token_timestamp > self.token_lifetime:
                    return False
                    
                # Don't allow tokens from the future (with small tolerance for clock skew)
                if token_timestamp > current_time + 60:
                    return False
                    
            except ValueError:
                return False
            
            # Validate user/session binding if provided
            if user_id:
                # Look for 'u' followed by user_id in consecutive parts
                user_found = False
                for i in range(len(payload_parts) - 1):
                    if payload_parts[i] == 'u' and payload_parts[i + 1] == user_id:
                        user_found = True
                        break
                if not user_found:
                    return False
            
            if session_id:
                # Look for 's' followed by session_id in consecutive parts  
                session_found = False
                for i in range(len(payload_parts) - 1):
                    if payload_parts[i] == 's' and payload_parts[i + 1] == session_id:
                        session_found = True
                        break
                if not session_found:
                    return False
            
            return True
            
        except Exception:
            return False


class CSRFMiddleware(BaseHTTPMiddleware):
    """
    CSRF protection middleware for FastAPI
    """
    
    def __init__(self, app: Any, csrf_protection: CSRFProtection, exempt_paths: Optional[List[str]] = None):
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
    
    def _is_exempt(self, path: str) -> bool:
        """Check if path is exempt from CSRF protection"""
        return any(path.startswith(exempt) for exempt in self.exempt_paths)
    
    def _get_csrf_token_from_request(self, request: StarletteRequest) -> Optional[str]:
        """Extract CSRF token from request headers or form data"""
        # Check X-CSRF-Token header
        token = request.headers.get("X-CSRF-Token")
        if token:
            return token
        
        # Check X-CSRFToken header (alternative name)
        token = request.headers.get("X-CSRFToken")
        if token:
            return token
        
        return None
    
    async def dispatch(self, request: StarletteRequest, call_next: Callable[[StarletteRequest], Awaitable[StarletteResponse]]) -> StarletteResponse:
        """Process CSRF protection"""
        # Skip if method doesn't need protection
        if request.method not in self.protected_methods:
            response = await call_next(request)
            # Add CSRF token to safe responses for client consumption
            if request.method == "GET" and not self._is_exempt(request.url.path):
                # Generate token for client
                user_id = getattr(request.state, 'user_id', None)
                session_id = request.session.get('id') if hasattr(request, 'session') else None
                csrf_token = self.csrf.generate_token(user_id, session_id)
                response.headers["X-CSRF-Token"] = csrf_token
            return response
        
        # Skip if path is exempt
        if self._is_exempt(request.url.path):
            return await call_next(request)
        
        # Get CSRF token from request
        csrf_token = self._get_csrf_token_from_request(request)
        
        if not csrf_token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token missing. Include X-CSRF-Token header."
            )
        
        # Validate token
        user_id = getattr(request.state, 'user_id', None)
        session_id = request.session.get('id') if hasattr(request, 'session') else None
        
        if not self.csrf.validate_token(csrf_token, user_id, session_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or expired CSRF token"
            )
        
        # Token is valid, proceed
        response = await call_next(request)
        return response


# Global CSRF protection instance
csrf_protection = CSRFProtection()


def get_csrf_token(user_id: Optional[str] = None, session_id: Optional[str] = None) -> str:
    """
    Generate a CSRF token for client use
    
    Args:
        user_id: Optional user ID to bind token to
        session_id: Optional session ID to bind token to
    
    Returns:
        CSRF token string
    """
    return csrf_protection.generate_token(user_id, session_id)


def verify_csrf_token(token: str, user_id: Optional[str] = None, session_id: Optional[str] = None) -> bool:
    """
    Verify a CSRF token
    
    Args:
        token: CSRF token to verify
        user_id: Optional user ID to verify against
        session_id: Optional session ID to verify against
    
    Returns:
        True if token is valid, False otherwise
    """
    return csrf_protection.validate_token(token, user_id, session_id)
