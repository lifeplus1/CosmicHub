# backend/types/astrology_systems.py
"""
Centralized Astrology System Types for CosmicHub Backend

Mirrors TypeScript types from packages/types/src/astrology.types.ts
Provides strongly typed Pydantic models for astrological calculations,
chart data, and API responses.

This file serves as the single source of truth for astrology-related
data structures in the backend, ensuring type safety and API consistency.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel, Field, field_validator, ValidationInfo

# ===== CORE ASTROLOGICAL ENTITIES =====

class Planet(BaseModel):
    """Individual planet position and properties"""
    name: str = Field(..., description="Planet name (e.g., 'sun', 'moon', 'mercury')")
    sign: str = Field(..., description="Zodiac sign")
    degree: float = Field(..., ge=0, lt=360, description="Degree position within sign")
    house: str = Field(..., description="House position")
    retrograde: bool = Field(default=False, description="Whether planet is retrograde")
    element: Optional[str] = Field(default=None, description="Element (fire, earth, air, water)")
    modality: Optional[str] = Field(default=None, description="Modality (cardinal, fixed, mutable)")


class House(BaseModel):
    """Astrological house data"""
    number: int = Field(..., ge=1, le=12, description="House number (1-12)")
    sign: str = Field(..., description="Sign on house cusp") 
    cusp_degree: float = Field(..., ge=0, lt=360, description="Cusp degree")
    ruler: str = Field(..., description="House ruler planet")


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
    angles: List[Angle] = Field(default_factory=list, description="Chart angles")


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
    birth_data: BirthData = Field(..., description="Birth information")
    charts: MultiSystemChart = Field(..., description="Chart data for all systems")
    processing_time_ms: float = Field(..., description="Total processing time")
    generated_at: str = Field(..., description="Generation timestamp")


class CompositeChartResponse(BaseModel):
    """Composite chart calculation response"""
    success: bool = Field(default=True, description="Calculation success")
    person1_birth_data: BirthData = Field(..., description="First person's birth data")
    person2_birth_data: BirthData = Field(..., description="Second person's birth data")
    composite_chart: AstrologyChart = Field(..., description="Composite chart data")
    synastry_aspects: List[Aspect] = Field(..., description="Synastry aspects between charts")
    compatibility_score: Optional[float] = Field(default=None, description="Compatibility score")
    processing_time_ms: float = Field(..., description="Processing time")
    generated_at: str = Field(..., description="Generation timestamp")


# ===== SERVICE MODELS =====

class AstrologyHealthCheck(BaseModel):
    """Health check response for astrology services"""
    service: str = Field(default="astrology", description="Service name")
    status: Literal["healthy", "degraded", "unhealthy"] = Field(..., description="Service status")
    calculations_available: bool = Field(..., description="Whether calculations are available")
    systems_online: List[str] = Field(..., description="Available astrology systems")
    last_calculation: Optional[str] = Field(default=None, description="Last successful calculation")
    uptime_seconds: Optional[float] = Field(default=None, description="Service uptime")
    timestamp: str = Field(..., description="Health check timestamp")


# ===== TRANSIT AND PROGRESSION MODELS =====

class TransitEvent(BaseModel):
    """Individual transit event"""
    transiting_planet: str = Field(..., description="Planet making the transit")
    natal_planet: str = Field(..., description="Natal planet being aspected")
    aspect_type: str = Field(..., description="Type of aspect")
    exact_date: datetime = Field(..., description="Date of exact aspect")
    orb: float = Field(..., description="Current orb")
    influence_start: datetime = Field(..., description="When influence begins")
    influence_end: datetime = Field(..., description="When influence ends")


class ProgressionEvent(BaseModel):
    """Individual progression event"""
    progressed_planet: str = Field(..., description="Planet in progression")
    natal_planet: str = Field(..., description="Natal planet being aspected")
    aspect_type: str = Field(..., description="Type of aspect")
    exact_date: datetime = Field(..., description="Date of exact aspect")
    orb: float = Field(..., description="Current orb")


class TransitResponse(BaseModel):
    """Transit calculation response"""
    birth_data: BirthData = Field(..., description="Birth information")
    current_transits: List[TransitEvent] = Field(..., description="Current active transits")
    upcoming_transits: List[TransitEvent] = Field(..., description="Upcoming transits")
    date_range: Dict[str, str] = Field(..., description="Date range for calculations")
    processing_time_ms: float = Field(..., description="Processing time")
    generated_at: str = Field(..., description="Generation timestamp")
