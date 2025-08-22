"""
Enhanced Security Headers middleware for CosmicHub API
Implements comprehensive security headers and CSP
Part of SEC-006: Threat Model Mitigation (Batch 1)
"""

import os
from typing import Dict, List, Optional
from urllib.parse import urlparse

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response as StarletteResponse


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Enhanced security headers middleware with configurable CSP
    """
    
    def __init__(self, app, config: Optional[Dict[str, str]] = None):
        super().__init__(app)
        self.config = config or {}
        
        # Default security headers
        self.default_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "X-Permitted-Cross-Domain-Policies": "none",
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Resource-Policy": "cross-origin",
        }
        
        # HSTS header (only for HTTPS)
        self.hsts_header = "max-age=31536000; includeSubDomains; preload"
        
    def _build_csp_header(self, request: StarletteRequest) -> str:
        """Build Content Security Policy header based on environment and request"""
        
        # Get environment
        env = os.getenv("DEPLOY_ENVIRONMENT", "development").lower()
        
        # Base CSP directives
        directives = {
            "default-src": ["'self'"],
            "script-src": [
                "'self'",
                "'unsafe-inline'",  # Required for Vite in development
                "'unsafe-eval'",    # Required for some dependencies
                "https://js.stripe.com",
                "https://checkout.stripe.com",
            ],
            "style-src": [
                "'self'",
                "'unsafe-inline'",  # Required for CSS-in-JS
                "https://fonts.googleapis.com",
            ],
            "font-src": [
                "'self'",
                "data:",
                "https://fonts.gstatic.com",
            ],
            "img-src": [
                "'self'",
                "data:",
                "https:",
                "blob:",
            ],
            "connect-src": [
                "'self'",
                "https://api.stripe.com",
                "https://checkout.stripe.com",
                "wss:",  # WebSocket connections
            ],
            "frame-src": [
                "https://js.stripe.com",
                "https://checkout.stripe.com",
            ],
            "object-src": ["'none'"],
            "base-uri": ["'self'"],
            "form-action": ["'self'"],
            "frame-ancestors": ["'none'"],
            "upgrade-insecure-requests": [],  # No value needed
        }
        
        # Add backend URLs based on environment
        if env == "development":
            # Development backend URLs
            dev_backends = [
                "http://localhost:8000",
                "http://127.0.0.1:8000",
                "https://astrology-app-0emh.onrender.com",
            ]
            directives["connect-src"].extend(dev_backends)
        else:
            # Production backend URLs
            prod_backends = [
                "https://astrology-app-0emh.onrender.com",
                # Add other production backend URLs here
            ]
            directives["connect-src"].extend(prod_backends)
        
        # Add Firebase domains
        firebase_domains = [
            "https://*.firebaseapp.com",
            "https://*.googleapis.com",
            "https://*.google.com",
        ]
        directives["connect-src"].extend(firebase_domains)
        directives["script-src"].extend(firebase_domains)
        
        # In development, be more permissive
        if env == "development":
            directives["script-src"].extend([
                "http://localhost:*",
                "http://127.0.0.1:*",
            ])
            directives["connect-src"].extend([
                "ws://localhost:*",
                "ws://127.0.0.1:*",
                "http://localhost:*",
                "http://127.0.0.1:*",
            ])
        
        # Build CSP string
        csp_parts = []
        for directive, sources in directives.items():
            if sources:
                csp_parts.append(f"{directive} {' '.join(sources)}")
            else:
                csp_parts.append(directive)  # For directives with no value
        
        return "; ".join(csp_parts)
    
    def _should_add_hsts(self, request: StarletteRequest) -> bool:
        """Check if HSTS header should be added (only for HTTPS)"""
        # Check if request is HTTPS
        if request.url.scheme == "https":
            return True
        
        # Check for proxy headers indicating HTTPS
        if request.headers.get("x-forwarded-proto") == "https":
            return True
        
        if request.headers.get("x-forwarded-ssl") == "on":
            return True
        
        return False
    
    def _get_report_uri(self) -> Optional[str]:
        """Get CSP report URI if configured"""
        return os.getenv("CSP_REPORT_URI", "/csp/report")
    
    async def dispatch(self, request: StarletteRequest, call_next) -> StarletteResponse:
        response = await call_next(request)
        
        # Add default security headers
        for header, value in self.default_headers.items():
            response.headers[header] = value
        
        # Add HSTS if HTTPS
        if self._should_add_hsts(request):
            response.headers["Strict-Transport-Security"] = self.hsts_header
        
        # Build and add CSP header
        csp = self._build_csp_header(request)
        
        # Add report URI if configured
        report_uri = self._get_report_uri()
        if report_uri:
            csp += f"; report-uri {report_uri}"
        
        response.headers["Content-Security-Policy"] = csp
        
        # Add custom headers from config
        for header, value in self.config.items():
            response.headers[header] = value
        
        # Add security information headers for debugging (only in development)
        if os.getenv("DEPLOY_ENVIRONMENT", "development").lower() == "development":
            response.headers["X-Security-Headers"] = "enabled"
            response.headers["X-CSP-Report-URI"] = report_uri or "none"
        
        return response


class SecurityUtility:
    """
    Security utility functions
    """
    
    @staticmethod
    def validate_origin(origin: str, allowed_origins: List[str]) -> bool:
        """
        Validate request origin against allowed origins list
        
        Args:
            origin: Origin header value
            allowed_origins: List of allowed origins
        
        Returns:
            True if origin is allowed, False otherwise
        """
        if not origin:
            return False
        
        # Exact match
        if origin in allowed_origins:
            return True
        
        # Wildcard subdomain matching (e.g., "*.example.com")
        for allowed in allowed_origins:
            if allowed.startswith("*."):
                domain = allowed[2:]  # Remove "*."
                if origin.endswith(f".{domain}") or origin == domain:
                    return True
        
        return False
    
    @staticmethod
    def sanitize_header_value(value: str) -> str:
        """
        Sanitize header value to prevent header injection
        
        Args:
            value: Header value to sanitize
        
        Returns:
            Sanitized header value
        """
        if not value:
            return ""
        
        # Remove control characters and newlines
        sanitized = "".join(char for char in value if ord(char) >= 32 and char not in ['\r', '\n'])
        
        # Limit length
        return sanitized[:1000]
    
    @staticmethod
    def is_safe_redirect_url(url: str, allowed_hosts: List[str]) -> bool:
        """
        Check if redirect URL is safe (prevents open redirect attacks)
        
        Args:
            url: URL to check
            allowed_hosts: List of allowed hosts for redirection
        
        Returns:
            True if URL is safe for redirection, False otherwise
        """
        if not url:
            return False
        
        try:
            parsed = urlparse(url)
            
            # Relative URLs are generally safe
            if not parsed.netloc:
                return url.startswith('/') and not url.startswith('//')
            
            # Check against allowed hosts
            return parsed.netloc in allowed_hosts
            
        except Exception:
            return False
    
    @staticmethod
    def generate_nonce() -> str:
        """
        Generate a cryptographically secure nonce for CSP
        
        Returns:
            Base64-encoded nonce
        """
        import secrets
        import base64
        
        # Generate 16 bytes of random data
        nonce_bytes = secrets.token_bytes(16)
        
        # Encode as base64
        return base64.b64encode(nonce_bytes).decode()


# Helper function to create security headers middleware
def create_security_headers_middleware(config: Optional[Dict[str, str]] = None):
    """
    Create security headers middleware with optional configuration
    
    Args:
        config: Optional dictionary of additional headers
    
    Returns:
        SecurityHeadersMiddleware instance
    """
    return lambda app: SecurityHeadersMiddleware(app, config)
