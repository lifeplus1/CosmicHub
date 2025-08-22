"""
Enhanced input validation for CosmicHub API
Implements comprehensive input sanitization and validation
Part of SEC-006: Threat Model Mitigation (Batch 1)
"""

import re
import html
from typing import Any, Dict, Optional, Union
from datetime import datetime

from fastapi import HTTPException, status
from pydantic import BaseModel, Field, field_validator


class SecurityValidator:
    """
    Comprehensive input validation and sanitization utility
    """
    
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
        r'DROP\s+TABLE',                       # SQL injection (case insensitive)
        r'DELETE\s+FROM',                      # SQL injection
        r'INSERT\s+INTO',                      # SQL injection
        r'UPDATE\s+.*\s+SET',                  # SQL injection
        r'UNION\s+SELECT',                     # SQL injection
    ]
    
    # Compile patterns for performance
    COMPILED_PATTERNS = [re.compile(pattern, re.IGNORECASE | re.DOTALL) for pattern in DANGEROUS_PATTERNS]
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """Sanitize string input by removing dangerous content"""
        if not isinstance(value, str):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Input must be a string"
            )
        
        # Limit length
        if len(value) > max_length:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Input too long. Maximum {max_length} characters allowed"
            )
        
        # Check for dangerous patterns
        for pattern in SecurityValidator.COMPILED_PATTERNS:
            if pattern.search(value):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Input contains potentially dangerous content"
                )
        
        # HTML escape to prevent XSS
        sanitized = html.escape(value.strip())
        
        # Remove null bytes and control characters except newlines and tabs
        sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', sanitized)
        
        return sanitized
    
    @staticmethod
    def validate_email(email: str) -> str:
        """Enhanced email validation"""
        if not email or not isinstance(email, str):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required and must be a string"
            )
        
        # Length check
        if len(email) > 320:  # RFC 5321 limit
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address too long"
            )
        
        # Basic format validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Check for dangerous patterns
        sanitized_email = SecurityValidator.sanitize_string(email, 320)
        
        return sanitized_email.lower()
    
    @staticmethod
    def validate_coordinates(lat: Union[str, int, float], lng: Union[str, int, float]) -> tuple[float, float]:
        """Enhanced coordinate validation"""
        try:
            # Convert to float
            lat_float = float(lat)
            lng_float = float(lng)
            
            # Range validation
            if not (-90 <= lat_float <= 90):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Latitude must be between -90 and 90 degrees"
                )
            
            if not (-180 <= lng_float <= 180):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Longitude must be between -180 and 180 degrees"
                )
            
            # Precision validation (prevent excessive precision that could indicate attack)
            if abs(lat_float) > 0 and len(str(lat_float).split('.')[-1]) > 10:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Coordinate precision too high"
                )
            
            if abs(lng_float) > 0 and len(str(lng_float).split('.')[-1]) > 10:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Coordinate precision too high"
                )
            
            return lat_float, lng_float
            
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coordinates must be valid numbers"
            )
    
    @staticmethod
    def validate_birth_date(year: int, month: int, day: int, hour: int, minute: int) -> None:
        """Enhanced birth date validation"""
        # Year validation
        current_year = datetime.now().year
        if not (1900 <= year <= current_year):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Year must be between 1900 and {current_year}"
            )
        
        # Month validation
        if not (1 <= month <= 12):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Month must be between 1 and 12"
            )
        
        # Day validation
        if not (1 <= day <= 31):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Day must be between 1 and 31"
            )
        
        # Hour validation
        if not (0 <= hour <= 23):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hour must be between 0 and 23"
            )
        
        # Minute validation
        if not (0 <= minute <= 59):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Minute must be between 0 and 59"
            )
        
        # Date existence validation
        try:
            datetime(year, month, day, hour, minute)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid date: {str(e)}"
            )
    
    @staticmethod
    def validate_city_name(city: str) -> str:
        """Enhanced city name validation"""
        if not city or not isinstance(city, str):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="City name is required"
            )
        
        # Length validation
        if len(city) > 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="City name too long"
            )
        
        # Character validation (allow letters, spaces, hyphens, apostrophes)
        if not re.match(r"^[a-zA-Z\s\-'.,()]+$", city):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="City name contains invalid characters"
            )
        
        return SecurityValidator.sanitize_string(city, 200)
    
    @staticmethod
    def validate_timezone(timezone_str: Optional[str]) -> Optional[str]:
        """Enhanced timezone validation"""
        if not timezone_str:
            return None
        
        if not isinstance(timezone_str, str):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Timezone must be a string"
            )
        
        # Length validation
        if len(timezone_str) > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Timezone string too long"
            )
        
        # Pattern validation (IANA timezone format)
        if not re.match(r'^[A-Za-z_]+(/[A-Za-z_]+)*$|^UTC[+-]\d{1,2}(:\d{2})?$|^[A-Z]{3,4}$', timezone_str):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid timezone format"
            )
        
        return SecurityValidator.sanitize_string(timezone_str, 50)
    
    @staticmethod
    def validate_json_payload(payload: Any, max_depth: int = 10, max_keys: int = 100) -> Any:
        """Enhanced JSON payload validation"""
        def check_depth(obj: Any, current_depth: int = 0) -> None:
            if current_depth > max_depth:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="JSON payload too deeply nested"
                )
            
            if isinstance(obj, dict):
                if len(obj) > max_keys:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="JSON payload has too many keys"
                    )
                for value in obj.values():
                    check_depth(value, current_depth + 1)
            elif isinstance(obj, list):
                if len(obj) > max_keys:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="JSON array too long"
                    )
                for item in obj:
                    check_depth(item, current_depth + 1)
        
        check_depth(payload)
        return payload
    
    @staticmethod
    def validate_frequency_settings(settings: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced frequency generator settings validation"""
        validated_settings = {}
        
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
        
        return validated_settings


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
    
    @field_validator('timezone')
    @classmethod
    def validate_timezone(cls, v: Optional[str]) -> Optional[str]:
        return SecurityValidator.validate_timezone(v)
    
    @field_validator('lat', 'lon')
    @classmethod
    def validate_coordinates(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            # Additional precision check
            if abs(v) > 0 and len(str(v).split('.')[-1]) > 10:
                raise ValueError("Coordinate precision too high")
        return v
    
    def validate_date_consistency(self) -> None:
        """Validate that the date is actually valid"""
        SecurityValidator.validate_birth_date(self.year, self.month, self.day, self.hour, self.minute)


class SecureLocationData(BaseModel):
    """Enhanced location data model with comprehensive validation"""
    lat: Union[str, int, float] = Field(...)
    lng: Union[str, int, float] = Field(...)
    name: str = Field(..., min_length=1, max_length=200)

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        return SecurityValidator.validate_city_name(v)
    
    def get_validated_coordinates(self) -> tuple[float, float]:
        """Get validated and sanitized coordinates"""
        return SecurityValidator.validate_coordinates(self.lat, self.lng)
