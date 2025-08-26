from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, timezone
from enum import Enum

class PlanetName(str, Enum):
    """Supported planet names and asteroids."""
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
    # Lunar Nodes (Essential for professional astrology)
    NORTH_NODE = "north_node"
    SOUTH_NODE = "south_node"
    # Major Asteroids (supported by basic ephemeris files)
    CHIRON = "chiron"
    CERES = "ceres"
    PALLAS = "pallas"
    JUNO = "juno"
    VESTA = "vesta"
        # Additional Professional Bodies
    LILITH_MEAN = "lilith_mean"  # Mean Black Moon Lilith
    LILITH_TRUE = "lilith_true"  # True Black Moon Lilith
    # Minor Asteroids
    HYGIEA = "hygiea"
    EROS = "eros"
    PSYCHE = "psyche"
    ASTRAEA = "astraea"          # Asteroid 5 Astraea (basic ephemeris support)
    HEBE = "hebe"                # 6
    IRIS = "iris"                # 7
    FLORA = "flora"              # 8
    METIS = "metis"              # 9
    PARTHENOPE = "parthenope"    # 11
    VICTORIA = "victoria"        # 12
    EGERIA = "egeria"            # 13
    EUNOMIA = "eunomia"          # 15
    THETIS = "thetis"            # 17
    MELPOMENE = "melpomene"      # 18
    FORTUNA = "fortuna"          # 19
    MASSALIA = "massalia"        # 20
    SEDNA = "sedna"
    ERIS = "eris"
    # Additional Lunar Points
    INTP_APOG = "intp_apog"      # Interpolated Lunar Apogee (Dark Moon Lilith variant)
    INTP_PERG = "intp_perg"      # Interpolated Lunar Perigee
    # Uranian/Trans-Neptunian Points (Hamburg School astrology)
    HADES = "hades"              # Decay, medicine, occult, underground
    ZEUS = "zeus"                # Fire, creativity, machines, energy
    KRONOS = "kronos"            # Authority, leadership, government
    APOLLON = "apollon"          # Science, research, peace, wisdom
    ADMETOS = "admetos"          # Raw materials, real estate, depth
    VULKANUS = "vulkanus"        # Power, force, might, intensity
    POSEIDON = "poseidon"        # Spirituality, ideas, media, enlightenment

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
