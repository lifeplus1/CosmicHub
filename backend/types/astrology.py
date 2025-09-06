# backend/types/astrology.py
"""
Astrology Type Bridge - Pydantic models mirroring TypeScript types
Part of the unified Type Bridge System for CosmicHub
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, validator
from enum import Enum


class ZodiacSign(str, Enum):
    ARIES = "aries"
    TAURUS = "taurus"
    GEMINI = "gemini"
    CANCER = "cancer"
    LEO = "leo"
    VIRGO = "virgo"
    LIBRA = "libra"
    SCORPIO = "scorpio"
    SAGITTARIUS = "sagittarius"
    CAPRICORN = "capricorn"
    AQUARIUS = "aquarius"
    Pisces = "pisces"


class PlanetName(str, Enum):
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
    CHIRON = "chiron"
    NORTH_NODE = "north_node"
    SOUTH_NODE = "south_node"


class AspectType(str, Enum):
    CONJUNCTION = "conjunction"
    OPPOSITION = "opposition"
    TRINE = "trine"
    SQUARE = "square"
    SEXTILE = "sextile"
    QUINCUNX = "quincunx"
    SEMI_SEXTILE = "semi-sextile"
    SEMI_SQUARE = "semi-square"
    SESQUIQUADRATE = "sesquiquadrate"


class Planet(BaseModel):
    """Enhanced Planet interface with complete type safety"""
    name: PlanetName
    position: float = Field(..., ge=0, lt=360, description="Degree in zodiac (0-360)")
    degree: Optional[float] = Field(None, ge=0, lt=360, description="Alias for position")
    sign: ZodiacSign
    house: int = Field(..., ge=1, le=12, description="House number (1-12)")
    retrograde: Optional[bool] = Field(False, description="Optional with default false")
    speed: Optional[float] = Field(None, description="Degrees per day")
    dignity: Optional[str] = Field(None, description="Planetary dignity")
    essential_dignity: Optional[float] = Field(None, ge=-5, le=5, description="Score from -5 to +5")
    aspects: Optional[List['Aspect']] = Field(None, description="Optional aspects array")
    element: Optional[str] = Field(None, description="Element type")
    modality: Optional[str] = Field(None, description="Modality type")
    house_position: Optional[str] = Field(None, description="Position within house")


class House(BaseModel):
    """Enhanced House interface with precise type constraints"""
    number: int = Field(..., ge=1, le=12)
    cusp: float = Field(..., ge=0, lt=360, description="Degree position (0-360)")
    sign: ZodiacSign
    ruler: Optional[PlanetName] = Field(None, description="Traditional ruler of the house sign")
    modern_ruler: Optional[PlanetName] = Field(None, description="Modern ruler")
    degree: Optional[float] = Field(None, ge=0, lt=360, description="Alias for cusp")
    size: Optional[float] = Field(None, description="House size in degrees")
    contains_planets: Optional[List[PlanetName]] = Field(None, description="Planets contained in this house")


class Aspect(BaseModel):
    """Enhanced Aspect interface with comprehensive aspect data"""
    aspect_type: AspectType
    planet1: PlanetName
    planet2: PlanetName
    orb: float
    applying: bool
    exact: Optional[bool] = Field(None, description="Optional with computed default")
    power: Optional[float] = Field(None, ge=0, le=1, description="Strength of the aspect (0-1)")
    aspect_angle: Optional[float] = Field(None, description="Exact angle of the aspect")
    separating: Optional[bool] = Field(None, description="Whether aspect is separating")
    mutual_reception: Optional[bool] = Field(None, description="If planets are in mutual reception")
    dignity_interaction: Optional[str] = Field(None, description="Enhancement/conflict/neutral")
    timing: Optional[Dict[str, Any]] = Field(None, description="Timing information")


class ChartAngles(BaseModel):
    """Enhanced Chart angles with comprehensive metadata"""
    ascendant: float = Field(..., ge=0, lt=360)
    midheaven: float = Field(..., ge=0, lt=360)
    descendant: float = Field(..., ge=0, lt=360)
    imumcoeli: float = Field(..., ge=0, lt=360)
    vertex: Optional[float] = Field(None, ge=0, lt=360)
    antivertex: Optional[float] = Field(None, ge=0, lt=360)
    part_of_fortune: Optional[float] = Field(None, ge=0, lt=360)
    north_node: Optional[float] = Field(None, ge=0, lt=360)
    south_node: Optional[float] = Field(None, ge=0, lt=360)
    lilith_mean: Optional[float] = Field(None, ge=0, lt=360)
    lilith_true: Optional[float] = Field(None, ge=0, lt=360)
    chiron: Optional[float] = Field(None, ge=0, lt=360)
    house_system: Optional[str] = Field(None, description="House system used")
    angles_calculated_at: Optional[str] = Field(None, description="ISO timestamp")


class AstrologyChart(BaseModel):
    """Enhanced AstrologyChart aligned with comprehensive ChartSchema"""
    planets: Dict[str, Dict[str, Any]] = Field(..., description="Planets data")
    houses: List[Dict[str, Any]] = Field(..., description="Houses data")
    aspects: List[Dict[str, Any]] = Field(..., description="Aspects data")
    asteroids: Optional[Dict[str, Dict[str, Any]]] = Field(None, description="Asteroids data")
    points: Optional[Dict[str, Dict[str, Any]]] = Field(None, description="Points data")
    angles: Dict[str, Any] = Field(..., description="Chart angles")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone: str
    julian_day: float
    house_system: str
    sidereal: Optional[Dict[str, Any]] = Field(None, description="Sidereal data")
    chart_metadata: Optional[Dict[str, Any]] = Field(None, description="Chart metadata")
    chart_patterns: Optional[Dict[str, Any]] = Field(None, description="Chart patterns")


class BirthData(BaseModel):
    """Birth data structure"""
    date: str = Field(..., description="Birth date")
    time: str = Field(..., description="Birth time")
    location: str = Field(..., description="Birth location")


class UserProfile(BaseModel):
    """Enhanced UserProfile with comprehensive user data"""
    userId: str = Field(..., description="Unique user identifier")

    # Birth data (required)
    birthData: BirthData

    # Basic profile fields
    email: Optional[str] = Field(None, description="User email")
    displayName: Optional[str] = Field(None, description="Display name")
    firstName: Optional[str] = Field(None, description="First name")
    lastName: Optional[str] = Field(None, description="Last name")
    fullName: Optional[str] = Field(None, description="Full name")
    avatar: Optional[str] = Field(None, description="Avatar URL")
    bio: Optional[str] = Field(None, description="User biography")
    timezone: Optional[str] = Field(None, description="User timezone")
    language: Optional[str] = Field(None, description="Preferred language")
    theme: Optional[str] = Field(None, description="UI theme preference")

    # Notification preferences
    notifications: Optional[Dict[str, bool]] = Field(None, description="Notification settings")

    # Privacy settings
    privacy: Optional[Dict[str, Any]] = Field(None, description="Privacy preferences")

    # User preferences
    preferences: Optional[Dict[str, Any]] = Field(None, description="User preferences")

    # Wellness data
    wellness: Optional[Dict[str, Any]] = Field(None, description="Wellness tracking data")

    # Subscription info
    subscription: Optional[Dict[str, Any]] = Field(None, description="Subscription details")

    # Metadata
    metadata: Optional[Dict[str, Any]] = Field(None, description="Account metadata")

    # Social links
    social: Optional[Dict[str, str]] = Field(None, description="Social media links")

    # Healwave-specific fields
    dateOfBirth: Optional[str] = Field(None, description="Date of birth")
    occupation: Optional[str] = Field(None, description="User occupation")
    experienceLevel: Optional[str] = Field(None, description="Experience level")
    primaryGoals: Optional[str] = Field(None, description="Primary wellness goals")
    healthConditions: Optional[str] = Field(None, description="Health conditions")
    meditationExperience: Optional[str] = Field(None, description="Meditation experience")
    preferredSessionLength: Optional[str] = Field(None, description="Preferred session length")
    notificationPreferences: Optional[Dict[str, bool]] = Field(None, description="Notification preferences")
    profileCompleted: Optional[bool] = Field(None, description="Profile completion status")
    privacyConsentGiven: Optional[bool] = Field(None, description="Privacy consent status")
    privacyConsentDate: Optional[str] = Field(None, description="Privacy consent date")
    healthDisclaimerAccepted: Optional[bool] = Field(None, description="Health disclaimer acceptance")
    healthDisclaimerDate: Optional[str] = Field(None, description="Health disclaimer date")
    hasCompletedOnboarding: Optional[bool] = Field(None, description="Onboarding completion")
    totalSessionsCompleted: Optional[int] = Field(None, description="Total sessions completed")
    totalListeningMinutes: Optional[int] = Field(None, description="Total listening minutes")
    favoriteFrequencies: Optional[List[str]] = Field(None, description="Favorite frequencies")
    moodTrackingEnabled: Optional[bool] = Field(None, description="Mood tracking enabled")
    progressTrackingEnabled: Optional[bool] = Field(None, description="Progress tracking enabled")
    reminderSettings: Optional[Dict[str, Any]] = Field(None, description="Reminder settings")


class UnifiedTransitData(BaseModel):
    """Unified TransitData interface"""
    planet: PlanetName
    sign: ZodiacSign
    house: int = Field(..., ge=1, le=12)
    degree: float = Field(..., ge=0, lt=360)
    aspect: Optional[Union[AspectType, Dict[str, Any]]] = Field(None, description="Aspect information")
    isSignificant: Optional[bool] = Field(None, description="Significance flag")
    element: Optional[str] = Field(None, description="Element")
    dignity: Optional[str] = Field(None, description="Dignity")
    modality: Optional[str] = Field(None, description="Modality")
    strength: Optional[float] = Field(None, description="Strength")
    applying: Optional[bool] = Field(None, description="Applying flag")
    exact: Optional[bool] = Field(None, description="Exact flag")
    orb: Optional[float] = Field(None, description="Orb")
    natalPlanet: Optional[PlanetName] = Field(None, description="Natal planet")
    type: Optional[str] = Field(None, description="Transit type")

    # Date range fields
    birth_data: Optional[Dict[str, Any]] = Field(None, description="Birth data")
    start_date: Optional[str] = Field(None, description="Start date")
    end_date: Optional[str] = Field(None, description="End date")
    include_retrogrades: Optional[bool] = Field(None, description="Include retrogrades")

    # Mobile-specific fields
    transitDate: Optional[str] = Field(None, description="Transit date")
    currentTransits: Optional[List['UnifiedTransitData']] = Field(None, description="Current transits")
    significantTransits: Optional[List['UnifiedTransitData']] = Field(None, description="Significant transits")
    nextMajorTransits: Optional[List['UnifiedTransitData']] = Field(None, description="Next major transits")
    lastCalculated: Optional[str] = Field(None, description="Last calculated")


class NumerologyData(BaseModel):
    """Numerology data structure"""
    lifePath: int = Field(..., ge=1, le=9, description="Life path number")
    destiny: int = Field(..., ge=1, le=9, description="Destiny number")
    personalYear: int = Field(..., ge=1, le=9, description="Personal year number")


# Update forward references
UnifiedTransitData.update_forward_refs()


class AstrologyRequest(BaseModel):
    """Request model for astrology calculations"""
    year: int = Field(..., ge=1900, le=2100, description="Birth year")
    month: int = Field(..., ge=1, le=12, description="Birth month")
    day: int = Field(..., ge=1, le=31, description="Birth day")
    hour: Optional[int] = Field(None, ge=0, le=23, description="Birth hour")
    minute: Optional[int] = Field(None, ge=0, le=59, description="Birth minute")
    latitude: float = Field(..., ge=-90, le=90, description="Birth latitude")
    longitude: float = Field(..., ge=-180, le=180, description="Birth longitude")
    timezone: str = Field(..., description="Birth timezone")
    user_id: Optional[str] = Field(None, description="User ID")

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


class AstrologyResponse(BaseModel):
    """Response wrapper for astrology calculations"""
    success: bool = Field(default=True, description="Whether calculation succeeded")
    data: Optional[Dict[str, Any]] = Field(None, description="Astrology chart data")
    error: Optional[str] = Field(None, description="Error message if calculation failed")
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat(),
                             description="Response generation timestamp")


class AstrologyHealthCheck(BaseModel):
    """Health check response for astrology service"""
    service: str = Field(default="astrology", description="Service name")
    status: str = Field(..., description="Service status")
    redis_connected: bool = Field(..., description="Redis connection status")
    swisseph_available: bool = Field(..., description="Swiss Ephemeris availability")
    last_calculation: Optional[str] = Field(None, description="Last successful calculation")

    class Config:
        """Pydantic configuration"""
        schema_extra = {
            "example": {
                "service": "astrology",
                "status": "healthy",
                "redis_connected": True,
                "swisseph_available": True,
                "last_calculation": "2025-09-05T00:00:00Z"
            }
        }
