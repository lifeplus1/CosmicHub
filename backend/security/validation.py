"""
Enhanced input validation for CosmicHub API
Implements comprehensive input sanitization and validation
Part of SEC-006: Threat Model Mitigation (Batch 1)
"""

import re
import html
from typing import Any, Dict, Optional, Union, cast
from datetime import datetime

from fastapi import HTTPException, status
from pydantic import BaseModel, Field, field_validator


class SecurityValidator:
    """
    Comprehensive input validation and sanitization utility
    """
  # noqa: E114, W293
    # Dangerous patterns to detect
    DANGEROUS_PATTERNS = [
        r'<script[^>]*>.*?</script>',           # Script tags
        r'javascript:',                         # JavaScript protocol
        r'data:text/html',                      # Data URLs with HTML
        r'vbscript:',                          # VBScript
        r'on\w+\s*=',                          # Event handlers
        r'expression\s*\(',                    # CSS expressions
        r'import\s+os',                        # Python imports
        r'__import__',                         # Python imports
        r'exec\s*\(',                          # Python exec
        r'eval\s*\(',                          # Python/JS eval
        r'DROP\s+TABLE',                       # SQL injection (case insensitive)  # noqa: E501
        r'DELETE\s+FROM',                      # SQL injection
        r'INSERT\s+INTO',                      # SQL injection
        r'UPDATE\s+.*\s+SET',                  # SQL injection
        r'UNION\s+SELECT',                     # SQL injection
    ]
  # noqa: E114, W293
    # Compile patterns for performance
    COMPILED_PATTERNS = [re.compile(pattern, re.IGNORECASE | re.DOTALL) for pattern in DANGEROUS_PATTERNS]  # noqa: E501
  # noqa: E114, W293
    @staticmethod  # noqa: E301
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """Sanitize string input by removing dangerous content"""
        if not value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Input cannot be empty"
            )
  # noqa: E114, W293
        # Limit length
        if len(value) > max_length:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Input too long. Maximum {max_length} characters allowed"  # noqa: E501
            )
  # noqa: E114, W293
        # Check for dangerous patterns
        for pattern in SecurityValidator.COMPILED_PATTERNS:
            if pattern.search(value):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Input contains potentially dangerous content"
                )
  # noqa: E114, W293
        # HTML escape to prevent XSS
        sanitized = html.escape(value.strip())
  # noqa: E114, W293
        # Remove null bytes and control characters except newlines and tabs
        sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', sanitized)
  # noqa: E114, W293
        return sanitized
  # noqa: E114, W293
    @staticmethod  # noqa: E301
    def validate_email(email: str) -> str:
        """Enhanced email validation"""
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
  # noqa: E114, W293
        # Length check
        if len(email) > 320:  # RFC 5321 limit
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address too long"
            )
  # noqa: E114, W293
        # Basic format validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
  # noqa: E114, W293
        # Check for dangerous patterns
        sanitized_email = SecurityValidator.sanitize_string(email, 320)
  # noqa: E114, W293
        return sanitized_email.lower()
  # noqa: E114, W293
    @staticmethod  # noqa: E301
    def validate_coordinates(lat: Union[str, int, float], lng: Union[str, int, float]) -> tuple[float, float]:  # noqa: E501
        """Enhanced coordinate validation"""
        try:
            # Convert to float
            lat_float = float(lat)
            lng_float = float(lng)
  # noqa: E114, W293
            # Range validation
            if not (-90 <= lat_float <= 90):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Latitude must be between -90 and 90 degrees"
                )
  # noqa: E114, W293
            if not (-180 <= lng_float <= 180):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Longitude must be between -180 and 180 degrees"
                )
  # noqa: E114, W293
            # Precision validation (prevent excessive precision that could indicate attack)  # noqa: E501
            if abs(lat_float) > 0 and len(str(lat_float).split('.')[-1]) > 10:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Coordinate precision too high"
                )
  # noqa: E114, W293
            if abs(lng_float) > 0 and len(str(lng_float).split('.')[-1]) > 10:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Coordinate precision too high"
                )
  # noqa: E114, W293
            return lat_float, lng_float
  # noqa: E114, W293
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coordinates must be valid numbers"
            )
  # noqa: E114, W293
    @staticmethod  # noqa: E301
    def validate_birth_date(year: int, month: int, day: int, hour: int, minute: int) -> None:  # noqa: E501
        """Enhanced birth date validation"""
        # Year validation
        current_year = datetime.now().year
        if not (1900 <= year <= current_year):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Year must be between 1900 and {current_year}"
            )
  # noqa: E114, W293
        # Month validation
        if not (1 <= month <= 12):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Month must be between 1 and 12"
            )
  # noqa: E114, W293
        # Day validation
        if not (1 <= day <= 31):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Day must be between 1 and 31"
            )
  # noqa: E114, W293
        # Hour validation
        if not (0 <= hour <= 23):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hour must be between 0 and 23"
            )
  # noqa: E114, W293
        # Minute validation
        if not (0 <= minute <= 59):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Minute must be between 0 and 59"
            )
  # noqa: E114, W293
        # Date existence validation
        try:
            datetime(year, month, day, hour, minute)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid date: {str(e)}"
            )
  # noqa: E114, W293
    @staticmethod  # noqa: E301
    def validate_city_name(city: str) -> str:
        """Enhanced city name validation"""
        if not city:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="City name is required"
            )
  # noqa: E114, W293
        # Length validation
        if len(city) > 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="City name too long"
            )
  # noqa: E114, W293
        # Character validation (allow letters, spaces, hyphens, apostrophes)
        if not re.match(r"^[a-zA-Z\s\-'.,()]+$", city):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="City name contains invalid characters"
            )
  # noqa: E114, W293
        return SecurityValidator.sanitize_string(city, 200)
  # noqa: E114, W293
    @staticmethod  # noqa: E301
    def validate_timezone(timezone_str: Optional[str]) -> Optional[str]:
        """Enhanced timezone validation"""
        if not timezone_str:
            return None
  # noqa: E114, W293
        # At this point timezone_str is guaranteed to be a non-empty string
        # Length validation
        if len(timezone_str) > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Timezone string too long"
            )
  # noqa: E114, W293
        # Pattern validation (IANA timezone format)
        if not re.match(r'^[A-Za-z_]+(/[A-Za-z_]+)*$|^UTC[+-]\d{1,2}(:\d{2})?$|^[A-Z]{3,4}$', timezone_str):  # noqa: E501
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid timezone format"
            )
  # noqa: E114, W293
        return SecurityValidator.sanitize_string(timezone_str, 50)
  # noqa: E114, W293
    @staticmethod  # noqa: E301
    def validate_json_payload(payload: Any, max_depth: int = 10, max_keys: int = 100) -> Any:  # noqa: E501
        """Enhanced JSON payload validation"""
        def check_depth(obj: Any, current_depth: int = 0) -> None:
            if current_depth > max_depth:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="JSON payload too deeply nested"
                )
  # noqa: E114, W293
            if isinstance(obj, dict):
                dict_obj = cast(Dict[Any, Any], obj)
                if len(dict_obj) > max_keys:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="JSON payload has too many keys"
                    )
                for value in dict_obj.values():
                    check_depth(value, current_depth + 1)
            elif isinstance(obj, list):
                list_obj = cast(list[Any], obj)
                if len(list_obj) > max_keys:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="JSON array too long"
                    )
                for item in list_obj:
                    check_depth(item, current_depth + 1)
  # noqa: E114, W293
        check_depth(payload)
        return payload
  # noqa: E114, W293
    @staticmethod  # noqa: E301
    def validate_frequency_settings(settings: Dict[str, Any]) -> Dict[str, Any]:  # noqa: E501
        """Enhanced frequency generator settings validation"""
        validated_settings: Dict[str, Any] = {}
  # noqa: E114, W293
        # Base frequency validation (20Hz - 2000Hz for safety)
        if "baseFrequency" in settings:
            try:
                freq = float(settings["baseFrequency"])
                if not (20 <= freq <= 2000):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Base frequency must be between 20 and 2000 Hz"
                    )
                validated_settings["baseFrequency"] = freq
            except (ValueError, TypeError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Base frequency must be a valid number"
                )
  # noqa: E114, W293
        # Binaural beat validation (0.5Hz - 100Hz)
        if "binauralBeat" in settings:
            try:
                beat = float(settings["binauralBeat"])
                if not (0.5 <= beat <= 100):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Binaural beat must be between 0.5 and 100 Hz"
                    )
                validated_settings["binauralBeat"] = beat
            except (ValueError, TypeError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Binaural beat must be a valid number"
                )
  # noqa: E114, W293
        # Volume validation (0-100)
        if "volume" in settings:
            try:
                volume = float(settings["volume"])
                if not (0 <= volume <= 100):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Volume must be between 0 and 100"
                    )
                validated_settings["volume"] = volume
            except (ValueError, TypeError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Volume must be a valid number"
                )
  # noqa: E114, W293
        # Duration validation (1-120 minutes)
        if "duration" in settings:
            try:
                duration = float(settings["duration"])
                if not (1 <= duration <= 120):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Duration must be between 1 and 120 minutes"
                    )
                validated_settings["duration"] = duration
            except (ValueError, TypeError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Duration must be a valid number"
                )
  # noqa: E114, W293
        return validated_settings

    # Backward compatibility methods for existing tests
    @staticmethod
    def validate_email_bool(email: str) -> bool:
        """Backward compatibility: validate email and return boolean"""
        try:
            SecurityValidator.validate_email(email)
            return True
        except HTTPException:
            return False
  # noqa: E114, W293
    @staticmethod  # noqa: E301
    def validate_birth_data(birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Backward compatibility: validate birth data dictionary"""
        if not birth_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Birth data is required"
            )
  # noqa: E114, W293
        validated: Dict[str, Any] = {}
  # noqa: E114, W293
        # Handle date validation
        if "date" in birth_data:
            validated["date"] = SecurityValidator.sanitize_string(str(birth_data["date"]), 20)  # noqa: E501
  # noqa: E114, W293
        # Handle time validation
        if "time" in birth_data:
            validated["time"] = SecurityValidator.sanitize_string(str(birth_data["time"]), 10)  # noqa: E501
  # noqa: E114, W293
        # Handle location validation
        if "location" in birth_data and isinstance(birth_data["location"], dict):  # noqa: E501
            location = cast(Dict[str, Any], birth_data["location"])
            validated_location: Dict[str, Any] = {}
  # noqa: E114, W293
            # Validate coordinates
            if "lat" in location and "lng" in location:
                try:
                    lat, lng = SecurityValidator.validate_coordinates(location["lat"], location["lng"])  # noqa: E501
                    validated_location["lat"] = lat
                    validated_location["lng"] = lng
                except HTTPException:
                    pass  # Skip invalid coordinates
  # noqa: E114, W293
            # Validate location name
            if "name" in location:
                try:
                    validated_location["name"] = SecurityValidator.validate_city_name(str(location["name"]))  # noqa: E501
                except HTTPException:
                    validated_location["name"] = SecurityValidator.sanitize_string(str(location["name"]), 100)  # noqa: E501
  # noqa: E114, W293
            validated["location"] = validated_location
  # noqa: E114, W293
        return validated


class SecureBirthData(BaseModel):
    """Enhanced birth data model with comprehensive validation"""
    year: int = Field(..., ge=1900, le=2030)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: int = Field(..., ge=0, le=23)
    minute: int = Field(..., ge=0, le=59)
    city: str = Field(..., min_length=1, max_length=200)
    timezone: Optional[str] = Field(None, max_length=50)
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lon: Optional[float] = Field(None, ge=-180, le=180)

    @field_validator('city')
    @classmethod
    def validate_city(cls, v: str) -> str:
        return SecurityValidator.validate_city_name(v)
  # noqa: E114, W293
    @field_validator('timezone')  # noqa: E301
    @classmethod
    def validate_timezone(cls, v: Optional[str]) -> Optional[str]:
        return SecurityValidator.validate_timezone(v)
  # noqa: E114, W293
    @field_validator('lat', 'lon')  # noqa: E301
    @classmethod
    def validate_coordinates(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            # Additional precision check
            if abs(v) > 0 and len(str(v).split('.')[-1]) > 10:
                raise ValueError("Coordinate precision too high")
        return v
  # noqa: E114, W293
    def validate_date_consistency(self) -> None:  # noqa: E301
        """Validate that the date is actually valid"""
        SecurityValidator.validate_birth_date(self.year, self.month, self.day, self.hour, self.minute)  # noqa: E501


class SecureLocationData(BaseModel):
    """Enhanced location data model with comprehensive validation"""
    lat: Union[str, int, float] = Field(...)
    lng: Union[str, int, float] = Field(...)
    name: str = Field(..., min_length=1, max_length=200)

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        return SecurityValidator.validate_city_name(v)
  # noqa: E114, W293
    def get_validated_coordinates(self) -> tuple[float, float]:  # noqa: E301
        """Get validated and sanitized coordinates"""
        return SecurityValidator.validate_coordinates(self.lat, self.lng)
