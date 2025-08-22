"""
Security initialization module for CosmicHub API
Centralizes security middleware and configuration
Part of SEC-006: Threat Model Mitigation (Batch 1)
"""

import os
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from .csrf import CSRFMiddleware, CSRFProtection
from .headers import SecurityHeadersMiddleware
from .rate_limiting import rate_limiter, EnhancedRateLimiter
from .validation import SecurityValidator

# Backward compatibility aliases for existing tests
class InputValidator:
    """Backward compatibility wrapper for SecurityValidator"""
    @staticmethod
    def validate_email(email: str) -> bool:
        return SecurityValidator.validate_email_bool(email)
    
    @staticmethod
    def validate_birth_data(birth_data: Dict[str, Any]) -> Dict[str, Any]:
        return SecurityValidator.validate_birth_data(birth_data)

class RateLimiter:
    """Backward compatibility wrapper for EnhancedRateLimiter"""
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        # Store the old-style parameters
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # Simple in-memory rate limiting for backward compatibility
        from collections import defaultdict
        import time
        self._requests: Dict[str, List[float]] = defaultdict(list)
    
    def is_allowed(self, identifier: str) -> bool:
        """Check if request is allowed using simple sliding window"""
        import time
        now = time.time()
        
        # Clean old requests outside the window
        cutoff = now - self.window_seconds
        self._requests[identifier] = [
            req_time for req_time in self._requests[identifier] 
            if req_time > cutoff
        ]
        
        # Check if under limit
        if len(self._requests[identifier]) < self.max_requests:
            self._requests[identifier].append(now)
            return True
        
        return False

class SecurityHeaders:
    """Backward compatibility wrapper for SecurityHeaders"""
    @staticmethod
    def add_security_headers(response: Any) -> Any:
        """Add security headers to response (backward compatibility)"""
        # This mimics the old API expected by the tests
        headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY", 
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'",
        }
        
        for header, value in headers.items():
            response.headers[header] = value
        
        return response

def create_rate_limit_key(request: Any, user_id: Optional[str] = None) -> str:
    """Create rate limit key for backward compatibility"""
    if user_id:
        return f"user:{user_id}"
    
    # Get client IP
    client_ip = "unknown"
    if hasattr(request, 'client') and request.client:
        client_ip = str(request.client.host)
    elif hasattr(request, 'headers'):
        # Check proxy headers
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = str(forwarded_for).split(",")[0].strip()
        else:
            real_ip = request.headers.get("X-Real-IP")
            if real_ip:
                client_ip = str(real_ip)
    
    return f"ip:{client_ip}"


class SecurityManager:
    """
    Centralized security management for the API
    """
    
    def __init__(self):
        self.csrf_protection = CSRFProtection()
        self.validator = SecurityValidator()
        self.rate_limiter = rate_limiter
        
    def configure_security(self, app: FastAPI) -> None:
        """
        Configure all security middleware and settings
        
        Args:
            app: FastAPI application instance
        """
        
        # 1. Configure CORS with strict settings
        self._configure_cors(app)
        
        # 2. Add security headers middleware
        app.add_middleware(SecurityHeadersMiddleware)
        
        # 3. Add CSRF protection middleware
        csrf_middleware = CSRFMiddleware(app, self.csrf_protection)
        app.add_middleware(
            lambda app: csrf_middleware  # type: ignore
        )
        
        # 4. Add request context middleware (already exists in main.py)
        # This handles request ID, user enrichment, and structured logging
        
        # 5. Configure security endpoints
        self._add_security_endpoints(app)
        
        # 6. Log security configuration
        self._log_security_config()
    
    def _configure_cors(self, app: FastAPI) -> None:
        """Configure CORS middleware with security-conscious settings"""
        
        # Get allowed origins from environment
        allowed_origins_str = os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5174,http://localhost:5175,http://localhost:3000,http://localhost:5173"
        )
        allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]
        
        # In production, be more restrictive
        env = os.getenv("DEPLOY_ENVIRONMENT", "development").lower()
        if env == "production":
            # Only allow production domains
            production_origins = [
                origin for origin in allowed_origins 
                if not any(dev_indicator in origin for dev_indicator in ["localhost", "127.0.0.1"])
            ]
            allowed_origins = production_origins or allowed_origins
        
        app.add_middleware(
            CORSMiddleware,
            allow_origins=allowed_origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
            allow_headers=[
                "Accept",
                "Accept-Language",
                "Content-Language",
                "Content-Type",
                "Authorization",
                "X-Requested-With",
                "X-CSRF-Token",
                "X-CSRFToken",
                "X-Request-ID",
            ],
            expose_headers=[
                "X-CSRF-Token",
                "X-Request-ID",
                "X-RateLimit-Limit",
                "X-RateLimit-Remaining", 
                "X-RateLimit-Reset",
                "Retry-After",
            ],
            max_age=3600,  # Cache preflight requests for 1 hour
        )
    
    def _add_security_endpoints(self, app: FastAPI) -> None:
        """Add security-related endpoints"""
        
        @app.get("/security/csrf-token")
        async def get_csrf_token(request: Request) -> Dict[str, str]:
            """Get CSRF token for client use"""
            user_id = getattr(request.state, 'user_id', None)
            session_id = None  # Could be extracted from session if implemented
            
            token = self.csrf_protection.generate_token(user_id, session_id)
            
            return {
                "csrf_token": token,
                "expires_in": 3600,  # 1 hour
            }
        
        @app.get("/security/rate-limit-status")
        async def get_rate_limit_status(request: Request) -> Dict[str, Any]:
            """Get current rate limit status for debugging"""
            user_id = getattr(request.state, 'user_id', None)
            status = self.rate_limiter.get_rate_limit_status(request, user_id)
            
            return status
        
        @app.post("/security/validate-input")
        async def validate_input(request: Request, data: Dict[str, Any]) -> Dict[str, Any]:
            """Validate input data using security validator (for development/testing)"""
            
            # Only enable in development
            if os.getenv("DEPLOY_ENVIRONMENT", "development").lower() != "development":
                return {"error": "Endpoint not available in production"}
            
            results = {}
            
            # Validate different types of input
            if "email" in data:
                try:
                    results["email"] = self.validator.validate_email(data["email"])
                except Exception as e:
                    results["email_error"] = str(e)
            
            if "coordinates" in data:
                coords = data["coordinates"]
                if isinstance(coords, dict) and "lat" in coords and "lng" in coords:
                    try:
                        lat, lng = self.validator.validate_coordinates(coords["lat"], coords["lng"])
                        results["coordinates"] = {"lat": lat, "lng": lng}
                    except Exception as e:
                        results["coordinates_error"] = str(e)
            
            if "city" in data:
                try:
                    results["city"] = self.validator.validate_city_name(data["city"])
                except Exception as e:
                    results["city_error"] = str(e)
            
            return results
    
    def _log_security_config(self) -> None:
        """Log security configuration for monitoring"""
        import logging
        
        logger = logging.getLogger(__name__)
        
        env = os.getenv("DEPLOY_ENVIRONMENT", "development").lower()
        
        security_config = {
            "environment": env,
            "csrf_protection": "enabled",
            "rate_limiting": "enabled",
            "security_headers": "enabled",
            "input_validation": "enhanced",
            "cors": "configured",
        }
        
        # Log security status
        logger.info("Security configuration loaded", extra=security_config)
        
        # In production, log additional security details
        if env == "production":
            logger.info("Production security hardening active")
    
    async def validate_request_security(self, request: Request) -> None:
        """
        Validate request security aspects
        This can be called manually in endpoints that need extra validation
        """
        
        # Check rate limiting
        user_id = getattr(request.state, 'user_id', None)
        await self.rate_limiter.check_rate_limit(request, user_id)
        
        # Additional security checks can be added here
        # - IP reputation checking
        # - Geolocation-based restrictions
        # - Advanced bot detection
        pass
    
    def get_security_context(self, request: Request) -> Dict[str, Any]:
        """
        Get security context information for the request
        Useful for logging and monitoring
        """
        user_id = getattr(request.state, 'user_id', None)
        request_id = getattr(request.state, 'request_id', None)
        
        # Get rate limit status
        rate_limit_status = self.rate_limiter.get_rate_limit_status(request, user_id)
        
        return {
            "user_id": user_id,
            "request_id": request_id,
            "ip_address": self._get_client_ip(request),
            "user_agent": request.headers.get("user-agent", "unknown"),
            "rate_limit": rate_limit_status,
            "timestamp": int(__import__("time").time()),
        }
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address considering proxy headers"""
        # Check for common proxy headers
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct connection
        return request.client.host if request.client else "unknown"


# Global security manager instance
security_manager = SecurityManager()


def configure_security(app: FastAPI) -> None:
    """
    Configure all security features for the application
    
    Args:
        app: FastAPI application instance
    """
    security_manager.configure_security(app)


def get_security_manager() -> SecurityManager:
    """
    Get the global security manager instance
    
    Returns:
        SecurityManager instance
    """
    return security_manager
