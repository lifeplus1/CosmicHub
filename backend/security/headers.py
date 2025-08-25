"""
Enhanced Security Headers middleware for CosmicHub API
Implements comprehensive security headers and CSP
Part of SEC-006: Threat Model Mitigation (Batch 1)
"""

import os
from typing import Any, Awaitable, Callable, Dict, List, Optional
from urllib.parse import urlparse

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response as StarletteResponse


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Enhanced security headers middleware with configurable CSP
    """
  # noqa: E114, W293
    def __init__(self, app: Any, config: Optional[Dict[str, str]] = None):
        super().__init__(app)
        self.config = config or {}
  # noqa: E114, W293
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
  # noqa: E114, W293
        # HSTS header (only for HTTPS)
        self.hsts_header = "max-age=31536000; includeSubDomains; preload"
  # noqa: E114, W293
    def _build_csp_header(self, request: StarletteRequest) -> str:  # noqa: E501, E301
        """Build Content Security Policy header based on environment and request"""  # noqa: E501
  # noqa: E114, W293
        # Get environment
        env = os.getenv("DEPLOY_ENVIRONMENT", "development").lower()
  # noqa: E114, W293
        # Base CSP directives
        directives: Dict[str, List[str]] = {
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
  # noqa: E114, W293
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
  # noqa: E114, W293
        # Add Firebase domains
        firebase_domains = [
            "https://*.firebaseapp.com",
            "https://*.googleapis.com",
            "https://*.google.com",
        ]
        directives["connect-src"].extend(firebase_domains)
        directives["script-src"].extend(firebase_domains)
  # noqa: E114, W293
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
  # noqa: E114, W293
        # Build CSP string
        csp_parts: List[str] = []
        for directive, sources in directives.items():
            if sources:
                csp_parts.append(f"{directive} {' '.join(sources)}")
            else:
                csp_parts.append(directive)  # For directives with no value
  # noqa: E114, W293
        return "; ".join(csp_parts)
  # noqa: E114, W293
    def _should_add_hsts(self, request: StarletteRequest) -> bool:  # noqa: E501, E301
        """Check if HSTS header should be added (only for HTTPS)"""
        # Check if request is HTTPS
        if request.url.scheme == "https":
            return True
  # noqa: E114, W293
        # Check for proxy headers indicating HTTPS
        if request.headers.get("x-forwarded-proto") == "https":
            return True
  # noqa: E114, W293
        if request.headers.get("x-forwarded-ssl") == "on":
            return True
  # noqa: E114, W293
        return False
  # noqa: E114, W293
    def _get_report_uri(self) -> Optional[str]:  # noqa: E301
        """Get CSP report URI if configured"""
        return os.getenv("CSP_REPORT_URI", "/csp/report")
  # noqa: E114, W293
    async def dispatch(self, request: StarletteRequest, call_next: Callable[[StarletteRequest], Awaitable[StarletteResponse]]) -> StarletteResponse:  # noqa: E301, E501
        response = await call_next(request)
  # noqa: E114, W293
        # Add default security headers
        for header, value in self.default_headers.items():
            response.headers[header] = value
  # noqa: E114, W293
        # Add HSTS if HTTPS
        if self._should_add_hsts(request):
            response.headers["Strict-Transport-Security"] = self.hsts_header
  # noqa: E114, W293
        # Build and add CSP header
        csp = self._build_csp_header(request)
  # noqa: E114, W293
        # Add report URI if configured
        report_uri = self._get_report_uri()
        if report_uri:
            csp += f"; report-uri {report_uri}"
  # noqa: E114, W293
        response.headers["Content-Security-Policy"] = csp
  # noqa: E114, W293
        # Add custom headers from config
        for header, value in self.config.items():
            response.headers[header] = value
  # noqa: E114, W293
        # Add security information headers for debugging (only in development)
        if os.getenv("DEPLOY_ENVIRONMENT", "development").lower() == "development":  # noqa: E501
            response.headers["X-Security-Headers"] = "enabled"
            response.headers["X-CSP-Report-URI"] = report_uri or "none"
  # noqa: E114, W293
        return response


class SecurityUtility:
    """
    Security utility functions
    """
  # noqa: E114, W293
    @staticmethod
    def validate_origin(origin: str, allowed_origins: List[str]) -> bool:
        """
        Validate request origin against allowed origins list
  # noqa: W293
        Args:
            origin: Origin header value
            allowed_origins: List of allowed origins
  # noqa: W293
        Returns:
            True if origin is allowed, False otherwise
        """
        if not origin:
            return False
  # noqa: E114, W293
        # Exact match
        if origin in allowed_origins:
            return True
  # noqa: E114, W293
        # Wildcard subdomain matching (e.g., "*.example.com")
        for allowed in allowed_origins:
            if allowed.startswith("*."):
                domain = allowed[2:]  # Remove "*."
                if origin.endswith(f".{domain}") or origin == domain:
                    return True
  # noqa: E114, W293
        return False
  # noqa: E114, W293
    @staticmethod  # noqa: E301
    def sanitize_header_value(value: str) -> str:
        """
        Sanitize header value to prevent header injection
  # noqa: W293
        Args:
            value: Header value to sanitize
  # noqa: W293
        Returns:
            Sanitized header value
        """
        if not value:
            return ""
  # noqa: E114, W293
        # Remove control characters and newlines
        sanitized = "".join(char for char in value if ord(char) >= 32 and char not in ['\r', '\n'])  # noqa: E501
  # noqa: E114, W293
        # Limit length
        return sanitized[:1000]
  # noqa: E114, W293
    @staticmethod  # noqa: E301
    def is_safe_redirect_url(url: str, allowed_hosts: List[str]) -> bool:
        """
        Check if redirect URL is safe (prevents open redirect attacks)
  # noqa: W293
        Args:
            url: URL to check
            allowed_hosts: List of allowed hosts for redirection
  # noqa: W293
        Returns:
            True if URL is safe for redirection, False otherwise
        """
        if not url:
            return False
  # noqa: E114, W293
        try:
            parsed = urlparse(url)
  # noqa: E114, W293
            # Relative URLs are generally safe
            if not parsed.netloc:
                return url.startswith('/') and not url.startswith('//')
  # noqa: E114, W293
            # Check against allowed hosts
            return parsed.netloc in allowed_hosts
  # noqa: E114, W293
        except Exception:
            return False
  # noqa: E114, W293
    @staticmethod  # noqa: E301
    def generate_nonce() -> str:
        """
        Generate a cryptographically secure nonce for CSP
  # noqa: W293
        Returns:
            Base64-encoded nonce
        """
        import secrets
        import base64
  # noqa: E114, W293
        # Generate 16 bytes of random data
        nonce_bytes = secrets.token_bytes(16)
  # noqa: E114, W293
        # Encode as base64
        return base64.b64encode(nonce_bytes).decode()


# Helper function to create security headers middleware
def create_security_headers_middleware(config: Optional[Dict[str, str]] = None) -> Callable[[Any], SecurityHeadersMiddleware]:  # noqa: E501
    """
    Create security headers middleware with optional configuration
  # noqa: W293
    Args:
        config: Optional dictionary of additional headers
  # noqa: W293
    Returns:
        SecurityHeadersMiddleware instance
    """
    return lambda app: SecurityHeadersMiddleware(app, config)
