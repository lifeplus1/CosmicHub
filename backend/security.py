"""
Security middleware and utilities for the CosmicHub API
Implements rate limiting, input validation, and security headers
"""

import hashlib
import re
import time
from collections import defaultdict, deque
from typing import Any, Dict, Optional, TypedDict, Union

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse


class LocationData(TypedDict):
    """Type definition for location data"""

    lat: Union[str, int, float]
    lng: Union[str, int, float]
    name: str


class RateLimiter:
    """
    Thread-safe rate limiter using sliding window algorithm
    """

    def __init__(self, max_requests: int = 100, window_seconds: int = 3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, deque[float]] = defaultdict(lambda: deque())

    def is_allowed(self, identifier: str) -> bool:
        """Check if request is allowed for given identifier"""
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old requests
        user_requests = self.requests[identifier]
        while user_requests and user_requests[0] < window_start:
            user_requests.popleft()

        # Check if under limit
        if len(user_requests) >= self.max_requests:
            return False

        # Add current request
        user_requests.append(now)
        return True


class InputValidator:
    """
    Centralized input validation and sanitization
    """

    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        return bool(re.match(pattern, email))

    @staticmethod
    def validate_birth_data(birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and sanitize birth data"""
        required_fields = ["date", "time", "location"]

        for field in required_fields:
            if field not in birth_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}",
                )

        # Validate date format (YYYY-MM-DD)
        date_pattern = r"^\d{4}-\d{2}-\d{2}$"
        if not re.match(date_pattern, birth_data["date"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD",
            )

        # Validate time format (HH:MM)
        time_pattern = r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
        if not re.match(time_pattern, birth_data["time"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid time format. Use HH:MM",
            )

        # Validate location with type casting
        location = birth_data["location"]
        if not isinstance(location, dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Location must be an object",
            )

        required_location_fields = ["lat", "lng", "name"]
        for field in required_location_fields:
            if field not in location:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required location field: {field}",
                )

        # Validate coordinates with proper type checking
        try:
            # Extract values with runtime type validation
            lat_value = location["lat"]  # type: ignore[misc]
            lng_value = location["lng"]  # type: ignore[misc]

            if lat_value is None or lng_value is None:
                raise ValueError("Coordinates cannot be None")

            # Type guard and conversion for latitude
            lat: float
            if isinstance(lat_value, (int, float)):
                lat = float(lat_value)
            elif isinstance(lat_value, str):
                lat = float(lat_value)  # May raise ValueError if invalid
            else:
                raise ValueError(f"Invalid latitude type: {type(lat_value).__name__}")  # type: ignore[misc]

            # Type guard and conversion for longitude
            lng: float
            if isinstance(lng_value, (int, float)):
                lng = float(lng_value)
            elif isinstance(lng_value, str):
                lng = float(lng_value)  # May raise ValueError if invalid
            else:
                raise ValueError(f"Invalid longitude type: {type(lng_value).__name__}")  # type: ignore[misc]

            # Range validation
            if not (-90 <= lat <= 90):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Latitude must be between -90 and 90",
                )

            if not (-180 <= lng <= 180):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Longitude must be between -180 and 180",
                )

        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Latitude and longitude must be valid numbers",
            )

        # Sanitize location name with type safety
        name_value = location["name"]  # type: ignore[misc]
        if isinstance(name_value, str):
            location["name"] = name_value.strip()[:100]
        else:
            # Convert non-string to string first
            location["name"] = str(name_value).strip()[:100]  # type: ignore[misc]

        return birth_data

    @staticmethod
    def validate_frequency_settings(
        settings: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Validate frequency generator settings"""
        # Validate base frequency (20Hz - 2000Hz for safety)
        if "baseFrequency" in settings:
            freq = settings["baseFrequency"]
            if not isinstance(freq, (int, float)) or not (20 <= freq <= 2000):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Base frequency must be between 20 and 2000 Hz",
                )

        # Validate binaural beat (0.5Hz - 100Hz)
        if "binauralBeat" in settings:
            beat = settings["binauralBeat"]
            if not isinstance(beat, (int, float)) or not (0.5 <= beat <= 100):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Binaural beat must be between 0.5 and 100 Hz",
                )

        # Validate volume (0-100)
        if "volume" in settings:
            volume = settings["volume"]
            if not isinstance(volume, (int, float)) or not (
                0 <= volume <= 100
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Volume must be between 0 and 100",
                )

        # Validate duration (1-120 minutes)
        if "duration" in settings:
            duration = settings["duration"]
            if not isinstance(duration, (int, float)) or not (
                1 <= duration <= 120
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Duration must be between 1 and 120 minutes",
                )

        return settings


class SecurityHeaders:
    """
    Security headers middleware
    """

    @staticmethod
    def add_security_headers(response: JSONResponse) -> JSONResponse:
        """Add security headers to response"""
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://astrology-app-0emh.onrender.com"
        )
        return response


def get_client_ip(request: Request) -> str:
    """
    Get client IP address, considering proxy headers
    """
    # Check for common proxy headers
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take the first IP in the chain
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Fallback to direct connection
    if request.client:
        return request.client.host

    return "unknown"


def create_rate_limit_key(
    request: Request, user_id: Optional[str] = None
) -> str:
    """
    Create a unique key for rate limiting
    Combines user ID (if available) with IP address
    """
    ip = get_client_ip(request)

    if user_id:
        # Hash user ID for privacy
        user_hash = hashlib.sha256(user_id.encode()).hexdigest()[:16]
        return f"user:{user_hash}:{ip}"

    return f"ip:{ip}"


# Global rate limiters for different endpoints
general_limiter = RateLimiter(
    max_requests=100, window_seconds=3600
)  # 100 requests per hour
auth_limiter = RateLimiter(
    max_requests=10, window_seconds=900
)  # 10 auth attempts per 15 minutes
heavy_limiter = RateLimiter(
    max_requests=20, window_seconds=3600
)  # 20 heavy operations per hour
