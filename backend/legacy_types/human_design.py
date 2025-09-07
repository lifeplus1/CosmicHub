# backend/types/human_design.py
"""
Human Design Type Bridge - Pydantic models mirroring TypeScript types
Part of the unified Type Bridge System for CosmicHub
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, validator


class LocationInfo(BaseModel):
    """Location information for Human Design calculations"""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in degrees")
    timezone: str = Field(..., description="Timezone identifier (e.g., 'America/New_York')")


class BirthInfo(BaseModel):
    """Birth time information for Human Design"""
    conscious_time: str = Field(..., description="Conscious birth time (ISO format)")
    unconscious_time: str = Field(..., description="Unconscious design time (ISO format)")
    location: LocationInfo


class PlanetActivation(BaseModel):
    """Planetary activation in Human Design"""
    gate: int = Field(..., ge=1, le=64, description="I Ching gate number (1-64)")
    line: int = Field(..., ge=1, le=6, description="Line number within gate (1-6)")
    position: float = Field(..., ge=0, lt=360, description="Astronomical position in degrees")
    center: str = Field(..., description="Human Design center name")
    planet: str = Field(..., description="Planet name")
    planet_symbol: str = Field(..., description="Unicode planet symbol")

    @validator('center')
    def validate_center(cls, v):
        valid_centers = {
            "Head", "Ajna", "Throat", "G", "Heart", 
            "Spleen", "Solar Plexus", "Sacral", "Root"
        }
        if v not in valid_centers:
            raise ValueError(f"Invalid center: {v}")
        return v


class ChannelInfo(BaseModel):
    """Human Design Channel information"""
    name: str = Field(..., description="Channel name")
    circuit: str = Field(..., description="Circuit type (Individual/Collective/Tribal)")
    theme: str = Field(..., description="Channel theme")
    gates: List[int] = Field(..., description="Two gates forming the channel")


class CenterInfo(BaseModel):
    """Human Design Center information"""
    defined: bool = Field(..., description="Whether the center is defined")
    gates: List[int] = Field(default_factory=list, description="Activated gates in this center")
    center_type: str = Field(..., description="Center type (Motor/Awareness/Pressure/Identity)")
    theme: str = Field(..., description="Center theme")
    color: str = Field(..., description="Center color")


class ProfileInfo(BaseModel):
    """Human Design Profile information"""
    number: str = Field(..., description="Profile number (e.g., '1/3')")
    personality_line: int = Field(..., ge=1, le=6, description="Personality line (conscious)")
    design_line: int = Field(..., ge=1, le=6, description="Design line (unconscious)")
    description: str = Field(..., description="Profile description")


class IncarnationCross(BaseModel):
    """Human Design Incarnation Cross"""
    name: str = Field(..., description="Cross name")
    gates: Dict[str, int] = Field(..., description="Four gates of the cross")
    description: str = Field(..., description="Cross description")


class Variables(BaseModel):
    """Human Design Variables (PHS - Primary Health System)"""
    digestion: str = Field(..., description="Optimal digestion strategy")
    environment: str = Field(..., description="Optimal environment")
    awareness: str = Field(..., description="Awareness type")
    perspective: str = Field(..., description="Perspective type")
    tone: int = Field(..., ge=1, le=6, description="Tone number")
    color: int = Field(..., ge=1, le=6, description="Color number")
    description: str = Field(..., description="Variables description")


class TypeInfo(BaseModel):
    """Human Design Type information"""
    name: str = Field(..., description="Type name")
    description: str = Field(..., description="Type description")
    strategy: str = Field(..., description="Type strategy")
    signature: str = Field(..., description="Type signature")
    not_self: str = Field(..., description="Not-self theme")
    percentage: str = Field(..., description="Population percentage")


class Definition(BaseModel):
    """Human Design Definition analysis"""
    defined_gates: List[int] = Field(default_factory=list, description="List of defined gates")
    defined_centers: List[str] = Field(default_factory=list, description="List of defined centers")
    undefined_centers: List[str] = Field(default_factory=list, description="List of undefined centers")
    center_activations: Dict[str, List[int]] = Field(default_factory=dict, description="Gates by center")
    channels: List[str] = Field(default_factory=list, description="Formed channels")


class GateInfo(BaseModel):
    """Enhanced gate information with planet and type"""
    number: int = Field(..., ge=1, le=64, description="Gate number")
    line: int = Field(..., ge=1, le=6, description="Line number")
    name: str = Field(..., description="Gate name")
    center: str = Field(..., description="Center name")
    planet: str = Field(..., description="Planet name")
    planet_symbol: str = Field(..., description="Planet symbol")
    type: str = Field(..., description="Type: 'personality' or 'design'")
    position: float = Field(..., description="Astronomical position")

    @validator('type')
    def validate_type(cls, v):
        if v not in ['personality', 'design']:
            raise ValueError("Type must be 'personality' or 'design'")
        return v


class HumanDesignChart(BaseModel):
    """Complete Human Design Chart Response"""
    birth_info: BirthInfo
    type: str = Field(..., description="Human Design type")
    strategy: str = Field(..., description="Type strategy")
    authority: str = Field(..., description="Inner authority")
    signature: str = Field(..., description="Type signature")
    not_self_theme: str = Field(..., description="Not-self theme")
    type_info: TypeInfo
    authority_info: str = Field(..., description="Authority description")
    
    # Activations
    activations: Dict[str, Dict[str, PlanetActivation]] = Field(
        ..., description="Conscious and unconscious activations"
    )
    
    # Definition and Centers
    definition: Definition
    defined_centers: List[str] = Field(..., description="Defined centers")
    undefined_centers: List[str] = Field(..., description="Undefined centers")
    centers: Dict[str, CenterInfo] = Field(..., description="All centers with info")
    
    # Gates and Channels
    gates: List[GateInfo] = Field(..., description="All activated gates with details")
    channels: List[str] = Field(..., description="Formed channels")
    
    # Advanced Information
    profile: ProfileInfo
    incarnation_cross: IncarnationCross
    variables: Variables

    class Config:
        """Pydantic configuration"""
        schema_extra = {
            "example": {
                "birth_info": {
                    "conscious_time": "1990-01-01T12:00:00Z",
                    "unconscious_time": "1989-10-04T12:00:00Z",
                    "location": {
                        "latitude": 40.7128,
                        "longitude": -74.0060,
                        "timezone": "America/New_York"
                    }
                },
                "type": "Generator",
                "strategy": "Respond to life",
                "authority": "Sacral",
                "signature": "Satisfaction",
                "not_self_theme": "Frustration"
            }
        }


class HumanDesignRequest(BaseModel):
    """Request model for Human Design calculations"""
    year: int = Field(..., ge=1900, le=2100, description="Birth year")
    month: int = Field(..., ge=1, le=12, description="Birth month")
    day: int = Field(..., ge=1, le=31, description="Birth day")
    hour: int = Field(..., ge=0, le=23, description="Birth hour")
    minute: int = Field(..., ge=0, le=59, description="Birth minute")
    latitude: float = Field(..., ge=-90, le=90, description="Birth latitude")
    longitude: float = Field(..., ge=-180, le=180, description="Birth longitude")
    timezone: str = Field(..., description="Birth timezone")

    @validator('day')
    def validate_day(cls, v, values):
        """Validate day based on month"""
        if 'month' in values:
            month = values['month']
            if month in [4, 6, 9, 11] and v > 30:
                raise ValueError(f"Month {month} only has 30 days")
            elif month == 2 and v > 29:
                raise ValueError("February cannot have more than 29 days")
        return v


class HumanDesignResponse(BaseModel):
    """Response wrapper for Human Design calculations"""
    success: bool = Field(default=True, description="Whether calculation succeeded")
    data: Optional[HumanDesignChart] = Field(None, description="Human Design chart data")
    error: Optional[str] = Field(None, description="Error message if calculation failed")
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), 
                             description="Response generation timestamp")

    class Config:
        """Pydantic configuration"""
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "type": "Generator",
                    "strategy": "Respond to life",
                    "authority": "Sacral"
                },
                "generated_at": "2025-09-04T00:00:00Z"
            }
        }


class HumanDesignHealthCheck(BaseModel):
    """Health check response for Human Design service"""
    service: str = Field(default="human_design", description="Service name")
    status: str = Field(..., description="Service status")
    redis_connected: bool = Field(..., description="Redis connection status")
    swisseph_available: bool = Field(..., description="Swiss Ephemeris availability")
    last_calculation: Optional[str] = Field(None, description="Last successful calculation")
    
    class Config:
        """Pydantic configuration"""
        schema_extra = {
            "example": {
                "service": "human_design",
                "status": "healthy",
                "redis_connected": True,
                "swisseph_available": True,
                "last_calculation": "2025-09-04T00:00:00Z"
            }
        }
