from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, timezone
from enum import Enum

class PlanetName(str, Enum):
    """Supported planet names."""
    SUN = "sun"
    MOON = "moon"
    MERCURY = "mercury"
    VENUS = "venus"
    MARS = "mars"
    JUPITER = "jupiter"
    SATURN = "saturn"
    URANUS = "uranus"
    NEPTUNE = "neptune"
    PLUTO = "pluto"

class PlanetPosition(BaseModel):
    """Position data for a planetary body."""
    position: float = Field(..., description="Position in degrees")
    retrograde: bool = Field(..., description="Whether the planet is retrograde")

class CalculationRequest(BaseModel):
    """Request model for planetary position calculation."""
    julian_day: float = Field(..., description="Julian Day Number", ge=0)
    planet: str = Field(..., description="Planet name (e.g., 'sun', 'moon', 'mercury')")
    
    @field_validator('planet')
    @classmethod
    def validate_planet(cls, v: str) -> str:
        """Validate planet name."""
        valid_planets = [planet.value for planet in PlanetName]
        if v.lower() not in valid_planets:
            raise ValueError(f"Invalid planet '{v}'. Must be one of: {', '.join(valid_planets)}")
        return v.lower()

class CalculationResponse(BaseModel):
    """Response model for planetary position calculation."""
    planet: str = Field(..., description="Planet name")
    julian_day: float = Field(..., description="Julian Day Number")
    position: PlanetPosition = Field(..., description="Position data")
    calculation_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC time of calculation")
    
    model_config = {"from_attributes": True}

class BatchCalculationRequest(BaseModel):
    """Request model for batch planetary position calculations."""
    calculations: List[CalculationRequest] = Field(..., description="List of calculations to perform", max_length=50)

class BatchCalculationResponse(BaseModel):
    """Response model for batch planetary position calculations."""
    results: List[CalculationResponse] = Field(..., description="List of calculation results")
    calculation_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC time of batch calculation")

class EphemerisFileResponse(BaseModel):
    """Response model for ephemeris file serving."""
    filename: str = Field(..., description="Name of the ephemeris file")
    size: int = Field(..., description="File size in bytes")
    content_type: str = Field(default="application/octet-stream", description="MIME type")

class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str = Field(default="healthy", description="Service status")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Health check timestamp")
    ephemeris_initialized: bool = Field(..., description="Whether ephemeris is properly initialized")

class ErrorResponse(BaseModel):
    """Response model for errors."""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Error timestamp")
