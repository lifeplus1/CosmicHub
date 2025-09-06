# backend/types/astrology_systems.py
"""
Centralized Astrology System Types for CosmicHub Backend

Mirrors TypeScript types from packages/types/src/astrology.types.ts
Provides strongly typed Pydantic models for astrological calculations,
chart data, and API responses.

This file serves as the single source of truth for astrology-related
data structures in the backend, ensuring type safety and API consistency.

The TypeScript types have been consolidated into packages/types/src/astrology.types.ts
which now contains both the original Planet/House/Aspect interfaces and the
app-specific PlanetData/HouseData/AspectData variants for different use cases.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel, Field, field_validator, ValidationInfo

# ===== TYPE DEFINITIONS =====

# Zodiac signs
ZodiacSign = Literal[
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
]

# Major planets 
MajorPlanet = Literal[
    'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
    'uranus', 'neptune', 'pluto'
]

# ===== CORE ASTROLOGICAL ENTITIES =====

class Planet(BaseModel):
    """Individual planet position and properties"""
    name: str = Field(..., min_length=1, description="Planet name (e.g., 'sun', 'moon', 'mercury')")
    sign: str = Field(..., min_length=1, description="Zodiac sign")
    degree: float = Field(..., ge=0, lt=360, description="Degree position within sign")
    position: float = Field(..., ge=0, lt=360, description="Absolute position in zodiac")
    house: str = Field(..., description="House number or position")
    retrograde: bool = Field(default=False, description="Whether planet is retrograde")
    aspects: Optional[List["Aspect"]] = Field(default=None, description="Aspects to other planets")

    @field_validator('name')
    @classmethod
    def validate_planet_name(cls, v: str) -> str:
        """Validate planet name"""
        valid_planets = {
            'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
            'uranus', 'neptune', 'pluto', 'north_node', 'south_node', 'chiron',
            'ascendant', 'midheaven', 'descendant', 'ic', 'lilith', 'ceres',
            'pallas', 'juno', 'vesta', 'part_of_fortune'
        }
        if v.lower() not in valid_planets:
            raise ValueError(f"Invalid planet name: {v}")
        return v.lower()

    @field_validator('sign')
    @classmethod
    def validate_zodiac_sign(cls, v: str) -> str:
        """Validate zodiac sign"""
        valid_signs = {
            'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        }
        if v.lower() not in valid_signs:
            raise ValueError(f"Invalid zodiac sign: {v}")
        return v.lower()

    @field_validator('house')
    @classmethod
    def validate_house(cls, v: str) -> str:
        """Validate house designation"""
        # Allow both numeric (1-12) and descriptive houses
        if v.isdigit() and not (1 <= int(v) <= 12):
            raise ValueError("House number must be between 1 and 12")
        return v


class House(BaseModel):
    """Astrological house information"""
    house: int = Field(..., ge=1, le=12, description="House number")
    number: int = Field(..., ge=1, le=12, description="House number (alias)")
    sign: str = Field(..., min_length=1, description="Sign on the cusp")
    degree: float = Field(..., ge=0, lt=360, description="Degree of cusp")
    cusp: float = Field(..., ge=0, lt=360, description="Cusp position")
    ruler: str = Field(..., min_length=1, description="Ruling planet")

    @field_validator('sign')
    @classmethod
    def validate_sign(cls, v: str) -> str:
        """Validate zodiac sign on cusp"""
        valid_signs = {
            'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        }
        if v.lower() not in valid_signs:
            raise ValueError(f"Invalid zodiac sign: {v}")
        return v.lower()

    @field_validator('ruler')
    @classmethod
    def validate_ruler(cls, v: str) -> str:
        """Validate ruling planet"""
        valid_rulers = {
            'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
            'uranus', 'neptune', 'pluto'
        }
        if v.lower() not in valid_rulers:
            raise ValueError(f"Invalid ruling planet: {v}")
        return v.lower()

    @field_validator('house', 'number')
    @classmethod
    def validate_house_consistency(cls, v: int, info: ValidationInfo) -> int:
        """Ensure house and number fields are consistent"""
        if hasattr(info, 'data') and info.data:
            other_field = info.data.get('house') if info.field_name == 'number' else info.data.get('number')
            if other_field is not None and other_field != v:
                raise ValueError("House and number fields must match")
        return v


class Aspect(BaseModel):
    """Aspect between two planetary bodies"""
    planet1: str = Field(..., description="First planet in aspect")
    planet2: str = Field(..., description="Second planet in aspect")
    type: str = Field(..., description="Aspect type (conjunction, trine, etc.)")
    orb: float = Field(..., ge=0, description="Orb in degrees")
    applying: str = Field(..., description="Whether aspect is applying or separating")


class Asteroid(BaseModel):
    """Asteroid position and properties"""
    name: str = Field(..., description="Asteroid name")
    sign: str = Field(..., description="Zodiac sign")
    degree: float = Field(..., ge=0, lt=360, description="Degree position")
    house: str = Field(..., description="House position")


class Angle(BaseModel):
    """Chart angles (Ascendant, Midheaven, etc.)"""
    name: str = Field(..., description="Angle name (ASC, MC, DSC, IC)")
    sign: str = Field(..., description="Sign of the angle")
    degree: float = Field(..., ge=0, lt=360, description="Degree position")
    position: float = Field(..., ge=0, lt=360, description="Absolute position")


# ===== BIRTH DATA AND USER INFORMATION =====

class BirthData(BaseModel):
    """Birth data for astrological calculations"""
    year: int = Field(..., ge=1900, le=2100, description="Birth year")
    month: int = Field(..., ge=1, le=12, description="Birth month")
    day: int = Field(..., ge=1, le=31, description="Birth day")
    hour: int = Field(..., ge=0, le=23, description="Birth hour")
    minute: int = Field(..., ge=0, le=59, description="Birth minute")
    city: str = Field(..., min_length=1, description="Birth city")
    timezone: Optional[str] = Field(default=None, description="Timezone identifier")
    lat: Optional[float] = Field(default=None, description="Latitude")
    lon: Optional[float] = Field(default=None, description="Longitude")

    @field_validator("day")
    @classmethod
    def validate_day(cls, v: int, info: ValidationInfo) -> int:
        """Validate day based on month and year"""
        raw = getattr(info, "data", {})
        if isinstance(raw, dict):
            month = raw.get("month")
            year = raw.get("year")
            if isinstance(month, int) and isinstance(year, int):
                # Validate days in month
                if month in [4, 6, 9, 11] and v > 30:
                    raise ValueError("Invalid day for month")
                if month == 2:
                    # Leap year calculation
                    leap = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
                    if (leap and v > 29) or (not leap and v > 28):
                        raise ValueError("Invalid day for February")
        return v


class UserProfile(BaseModel):
    """User profile with birth data"""
    user_id: str = Field(..., description="Unique user identifier")
    birth_data: BirthData = Field(..., description="Birth information")
    preferences: Optional[Dict[str, Any]] = Field(default=None, description="User preferences")


# ===== CHART STRUCTURES =====

class AstrologyChart(BaseModel):
    """Complete astrological chart data"""
    planets: List[Planet] = Field(..., description="Planetary positions")
    houses: List[House] = Field(..., description="House cusps and rulers") 
    aspects: List[Aspect] = Field(..., description="Planetary aspects")
    asteroids: List[Asteroid] = Field(default_factory=list, description="Asteroid positions")
    angles: List[Angle] = Field(..., description="Chart angles")


class ChartCalculationMetadata(BaseModel):
    """Metadata for chart calculations"""
    calculation_time: datetime = Field(..., description="When chart was calculated")
    calculation_method: str = Field(default="swiss_ephemeris", description="Calculation method used")
    house_system: str = Field(default="Placidus", description="House system used")
    ayanamsa: Optional[str] = Field(default=None, description="Ayanamsa for Vedic calculations")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")


# ===== SYSTEM-SPECIFIC TYPES =====

class WesternChart(AstrologyChart):
    """Western astrology chart"""
    house_system: str = Field(default="Placidus", description="House system")
    tropical: bool = Field(default=True, description="Tropical zodiac")


class VedicChart(AstrologyChart):
    """Vedic astrology chart"""
    ayanamsa: str = Field(default="Lahiri", description="Ayanamsa used")
    sidereal: bool = Field(default=True, description="Sidereal zodiac")
    nakshatras: Optional[List[Dict[str, Any]]] = Field(default=None, description="Nakshatra data")


class UranianChart(BaseModel):
    """Uranian astrology chart with hypothetical planets"""
    planets: List[Planet] = Field(..., description="Including hypothetical planets")
    midpoints: List[Dict[str, Any]] = Field(default_factory=list, description="Midpoint structures")
    planetary_pictures: List[Dict[str, Any]] = Field(default_factory=list, description="Planetary pictures")


# ===== MULTI-SYSTEM CHART =====

class MultiSystemChart(BaseModel):
    """Multi-system astrological chart containing multiple traditions"""
    western: Optional[WesternChart] = Field(default=None, description="Western astrology data")
    vedic: Optional[VedicChart] = Field(default=None, description="Vedic astrology data")
    chinese: Optional[Dict[str, Any]] = Field(default=None, description="Chinese astrology data")
    mayan: Optional[Dict[str, Any]] = Field(default=None, description="Mayan astrology data")
    uranian: Optional[UranianChart] = Field(default=None, description="Uranian astrology data")
    metadata: ChartCalculationMetadata = Field(..., description="Calculation metadata")


# ===== API RESPONSE MODELS =====

class ChartResponse(BaseModel):
    """Standard chart calculation response"""
    success: bool = Field(default=True, description="Calculation success")
    planets: Dict[str, Any] = Field(..., description="Planet data")
    houses: Dict[str, Any] = Field(..., description="House data") 
    aspects: List[Any] = Field(..., description="Aspect data")
    asteroids: Optional[Dict[str, Any]] = Field(default=None, description="Asteroid data")
    points: Optional[Dict[str, Any]] = Field(default=None, description="Special points (nodes, lilith)")
    angles: Optional[Dict[str, Any]] = Field(default=None, description="Chart angles")
    systems: Optional[Dict[str, Any]] = Field(default=None, description="System-specific data")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Calculation metadata")
    generated_at: str = Field(..., description="Generation timestamp")


class MultiSystemChartResponse(BaseModel):
    """Multi-system chart calculation response"""
    success: bool = Field(default=True, description="Calculation success")
    birth_data: BirthData = Field(..., description="Input birth data")
    charts: MultiSystemChart = Field(..., description="Multi-system chart data")
    calculation_method: str = Field(default="multi_system", description="Calculation method")
    processing_time_ms: float = Field(..., description="Total processing time")
    api_version: str = Field(default="1.0", description="API version")
    generated_at: str = Field(..., description="Generation timestamp")


class CompositeChartResponse(BaseModel):
    """Composite chart calculation response"""
    success: bool = Field(default=True, description="Calculation success")
    composite_chart: Dict[str, Any] = Field(..., description="Composite chart data")
    relationship_analysis: Dict[str, Any] = Field(..., description="Relationship analysis")
    participants: List[BirthData] = Field(..., description="Participant birth data")
    method: str = Field(default="midpoint", description="Composite method used")
    generated_at: str = Field(..., description="Generation timestamp")


# ===== HEALTH CHECK =====

class AstrologyHealthCheck(BaseModel):
    """Health check response for astrology service"""
    service: str = Field(default="Astrology Systems API", description="Service name")
    status: Literal['healthy', 'unhealthy'] = Field(..., description="Service status")
    calculations_available: bool = Field(..., description="Whether calculations are available")
    systems_online: List[str] = Field(..., description="Available astrological systems")
    version: str = Field(default="1.0", description="Service version")
    timestamp: str = Field(..., description="Health check timestamp")


# ===== TYPE ALIASES AND CONSTANTS (additional) =====

# House systems (non-duplicated)
HouseSystem = Literal[
    'placidus', 'koch', 'equal', 'whole_sign', 'campanus', 'regiomontanus'
]

# Aspect types
AspectType = Literal[
    'conjunction', 'opposition', 'trine', 'square', 'sextile',
    'quincunx', 'semi-sextile', 'semi-square', 'sesquiquadrate'
]

# Chart angles
ChartAngle = Literal['asc', 'mc', 'dsc', 'ic']

# Fix forward references
Planet.model_rebuild()

# ===== EXPORT ALL TYPES =====
__all__ = [
    # Core entities
    'Planet', 'House', 'Aspect', 'Asteroid', 'Angle',
    
    # Birth data and user
    'BirthData', 'UserProfile',
    
    # Chart structures  
    'AstrologyChart', 'ChartCalculationMetadata',
    'WesternChart', 'VedicChart', 'UranianChart', 'MultiSystemChart',
    
    # API responses
    'ChartResponse', 'MultiSystemChartResponse', 'CompositeChartResponse',
    'AstrologyHealthCheck',
    
    # Type aliases
    'ZodiacSign', 'MajorPlanet', 'HouseSystem', 'AspectType', 'ChartAngle'
]
