# backend/types/synastry_systems.py
"""
Centralized Synastry System Types for CosmicHub Backend

Provides strongly typed Pydantic models for relationship compatibility analysis,
synastry chart calculations, and composite chart interpretations.

This file serves as the single source of truth for synastry-related
data structures in the backend, ensuring type safety and API consistency.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator, ValidationInfo

# Import related types
from .astrology_systems import BirthData, Planet, House, Aspect
from .psychology_systems import PsychologyProfile


# Structured types for API responses
class SynastryAnalysisSummary(BaseModel):
    """Structured summary for synastry analysis"""
    strengths: List[str] = Field(default_factory=list, description="Relationship strengths")
    challenges: List[str] = Field(default_factory=list, description="Relationship challenges")
    advice: List[str] = Field(default_factory=list, description="Relationship advice")
    key_themes: List[str] = Field(default_factory=list, description="Key relationship themes")
    overall_compatibility: float = Field(..., description="Overall compatibility score (0-1)")
    

class CompatibilityBreakdown(BaseModel):
    """Detailed compatibility breakdown structure"""
    emotional_compatibility: float = Field(..., description="Emotional compatibility score")
    intellectual_compatibility: float = Field(..., description="Intellectual compatibility score")
    physical_compatibility: float = Field(..., description="Physical compatibility score")
    spiritual_compatibility: float = Field(..., description="Spiritual compatibility score")
    communication_score: float = Field(..., description="Communication compatibility score")
    long_term_potential: float = Field(..., description="Long-term relationship potential score")
    areas_of_harmony: List[str] = Field(default_factory=list, description="Areas where partners harmonize")
    growth_opportunities: List[str] = Field(default_factory=list, description="Areas for mutual growth")

# ===== TYPE DEFINITIONS =====

# Synastry aspect types
SynastryAspectType = Literal[
    'conjunction', 'opposition', 'trine', 'square', 'sextile', 
    'quincunx', 'semisextile', 'semisquare', 'sesquiquadrate'
]

# Relationship compatibility categories
CompatibilityCategory = Literal[
    'romantic', 'friendship', 'business', 'family', 'mentor', 'creative'
]

# Match quality ratings
MatchQuality = Literal[
    'excellent', 'very_good', 'good', 'fair', 'challenging'
]

# Composite chart types
CompositeType = Literal[
    'midpoint', 'davison', 'draconic', 'harmonic'
]

# Synastry analysis levels
AnalysisLevel = Literal[
    'basic', 'intermediate', 'advanced', 'professional'
]

# Relationship phases
RelationshipPhase = Literal[
    'attraction', 'bonding', 'commitment', 'challenge', 'growth', 'transformation'
]

# ===== SYNASTRY ASPECT MODELS =====

class SynastryAspect(BaseModel):
    """Individual synastry aspect between two charts"""
    person1_planet: str = Field(..., description="Planet from person 1's chart")
    person2_planet: str = Field(..., description="Planet from person 2's chart")
    aspect_type: SynastryAspectType = Field(..., description="Type of aspect")
    orb: float = Field(..., ge=0, le=10, description="Orb in degrees")
    exactness: float = Field(..., ge=0, le=100, description="How exact the aspect is (percentage)")
    strength: float = Field(..., ge=0, le=100, description="Aspect strength")
    harmony_score: float = Field(..., ge=-100, le=100, description="Harmony score (-100 to +100)")
    interpretation: str = Field(..., min_length=1, description="Aspect interpretation")
    keywords: List[str] = Field(default_factory=list, description="Key themes")
    category: Literal['harmonious', 'challenging', 'dynamic', 'neutral'] = Field(..., description="Aspect category")

    @field_validator('person1_planet', 'person2_planet')
    @classmethod
    def validate_planet_names(cls, v: str) -> str:
        """Validate planet names are recognized astrological bodies"""
        valid_planets = {
            'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
            'uranus', 'neptune', 'pluto', 'north_node', 'south_node', 'chiron',
            'ascendant', 'midheaven', 'descendant', 'ic'
        }
        if v.lower() not in valid_planets:
            raise ValueError(f"Invalid planet name: {v}. Must be one of {valid_planets}")
        return v.lower()

    @field_validator('interpretation')
    @classmethod
    def validate_interpretation(cls, v: str) -> str:
        """Ensure interpretation is meaningful"""
        if len(v.strip()) < 10:
            raise ValueError("Interpretation must be at least 10 characters long")
        return v.strip()

    @field_validator('keywords')
    @classmethod
    def validate_keywords(cls, v: List[str]) -> List[str]:
        """Validate keywords list"""
        if len(v) > 20:
            raise ValueError("Too many keywords (max 20)")
        return [keyword.strip().lower() for keyword in v if keyword.strip()]


class HouseOverlay(BaseModel):
    """Person 1's planet in Person 2's house"""
    person1_planet: str = Field(..., description="Planet from person 1")
    person2_house: int = Field(..., ge=1, le=12, description="House number in person 2's chart")
    house_meaning: str = Field(..., description="House meaning and themes")
    overlay_interpretation: str = Field(..., description="Overlay interpretation")
    activation_level: float = Field(..., ge=0, le=100, description="How much this activates the house")
    mutual: bool = Field(default=False, description="Whether overlay is mutual")


class CompositePlanet(BaseModel):
    """Planet in composite chart"""
    planet: str = Field(..., description="Planet name")
    sign: str = Field(..., description="Zodiac sign")
    house: int = Field(..., ge=1, le=12, description="House position")
    degree: float = Field(..., ge=0, lt=360, description="Degree position")
    interpretation: str = Field(..., min_length=1, description="Composite planet interpretation")
    relationship_theme: str = Field(..., min_length=1, description="What this represents in the relationship")

    @field_validator('planet')
    @classmethod
    def validate_planet(cls, v: str) -> str:
        """Validate planet name"""
        valid_planets = {
            'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
            'uranus', 'neptune', 'pluto', 'north_node', 'south_node', 'chiron'
        }
        if v.lower() not in valid_planets:
            raise ValueError(f"Invalid planet: {v}")
        return v.lower()

    @field_validator('sign')
    @classmethod
    def validate_sign(cls, v: str) -> str:
        """Validate zodiac sign"""
        valid_signs = {
            'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        }
        if v.lower() not in valid_signs:
            raise ValueError(f"Invalid zodiac sign: {v}")
        return v.lower()

    @field_validator('interpretation', 'relationship_theme')
    @classmethod
    def validate_text_fields(cls, v: str) -> str:
        """Validate text fields are meaningful"""
        if len(v.strip()) < 5:
            raise ValueError("Field must be at least 5 characters long")
        return v.strip()


# ===== COMPATIBILITY SCORING =====

class CompatibilityScore(BaseModel):
    """Detailed compatibility scoring"""
    overall_score: float = Field(..., ge=0, le=100, description="Overall compatibility percentage")
    romantic_score: float = Field(..., ge=0, le=100, description="Romantic compatibility")
    emotional_score: float = Field(..., ge=0, le=100, description="Emotional compatibility")
    mental_score: float = Field(..., ge=0, le=100, description="Mental/intellectual compatibility")
    physical_score: float = Field(..., ge=0, le=100, description="Physical/sexual compatibility")
    spiritual_score: float = Field(..., ge=0, le=100, description="Spiritual compatibility")
    communication_score: float = Field(..., ge=0, le=100, description="Communication compatibility")
    conflict_resolution_score: float = Field(..., ge=0, le=100, description="Conflict resolution capability")


class ElementalCompatibility(BaseModel):
    """Elemental compatibility analysis"""
    fire_fire: float = Field(..., ge=0, le=100, description="Fire element interaction")
    earth_earth: float = Field(..., ge=0, le=100, description="Earth element interaction")
    air_air: float = Field(..., ge=0, le=100, description="Air element interaction")
    water_water: float = Field(..., ge=0, le=100, description="Water element interaction")
    fire_earth: float = Field(..., ge=0, le=100, description="Fire-Earth interaction")
    fire_air: float = Field(..., ge=0, le=100, description="Fire-Air interaction")
    fire_water: float = Field(..., ge=0, le=100, description="Fire-Water interaction")
    earth_air: float = Field(..., ge=0, le=100, description="Earth-Air interaction")
    earth_water: float = Field(..., ge=0, le=100, description="Earth-Water interaction")
    air_water: float = Field(..., ge=0, le=100, description="Air-Water interaction")
    overall_elemental_harmony: float = Field(..., ge=0, le=100, description="Overall elemental harmony")


class ModalityCompatibility(BaseModel):
    """Modal compatibility analysis"""
    cardinal_cardinal: float = Field(..., ge=0, le=100, description="Cardinal-Cardinal interaction")
    fixed_fixed: float = Field(..., ge=0, le=100, description="Fixed-Fixed interaction")
    mutable_mutable: float = Field(..., ge=0, le=100, description="Mutable-Mutable interaction")
    cardinal_fixed: float = Field(..., ge=0, le=100, description="Cardinal-Fixed interaction")
    cardinal_mutable: float = Field(..., ge=0, le=100, description="Cardinal-Mutable interaction")
    fixed_mutable: float = Field(..., ge=0, le=100, description="Fixed-Mutable interaction")
    overall_modal_harmony: float = Field(..., ge=0, le=100, description="Overall modal harmony")


# ===== RELATIONSHIP DYNAMICS =====

class RelationshipDynamic(BaseModel):
    """Key relationship dynamic"""
    theme: str = Field(..., min_length=1, description="Dynamic theme")
    description: str = Field(..., min_length=10, description="Detailed description")
    strength: float = Field(..., ge=0, le=100, description="How strong this dynamic is")
    supportive_aspects: List[SynastryAspect] = Field(default_factory=list, description="Aspects supporting this dynamic")
    challenging_aspects: List[SynastryAspect] = Field(default_factory=list, description="Aspects challenging this dynamic")
    advice: str = Field(..., min_length=5, description="Advice for managing this dynamic")

    @field_validator('theme')
    @classmethod
    def validate_theme(cls, v: str) -> str:
        """Validate theme is descriptive"""
        if len(v.strip()) < 3:
            raise ValueError("Theme must be at least 3 characters long")
        return v.strip().title()

    @field_validator('description', 'advice')
    @classmethod
    def validate_text_content(cls, v: str) -> str:
        """Validate text content is meaningful"""
        stripped = v.strip()
        if not stripped:
            raise ValueError("Text content cannot be empty")
        return stripped

    @field_validator('supportive_aspects', 'challenging_aspects')
    @classmethod
    def validate_aspect_lists(cls, v: List[SynastryAspect]) -> List[SynastryAspect]:
        """Validate aspect lists"""
        if len(v) > 50:
            raise ValueError("Too many aspects (max 50)")
        return v


class PowerDynamic(BaseModel):
    """Power balance in relationship"""
    person1_power_score: float = Field(..., ge=0, le=100, description="Person 1's power/dominance")
    person2_power_score: float = Field(..., ge=0, le=100, description="Person 2's power/dominance")
    balance_score: float = Field(..., ge=0, le=100, description="How balanced the power dynamic is")
    dominant_areas_person1: List[str] = Field(default_factory=list, description="Areas where person 1 dominates")
    dominant_areas_person2: List[str] = Field(default_factory=list, description="Areas where person 2 dominates")
    collaborative_areas: List[str] = Field(default_factory=list, description="Areas of equal collaboration")


class CommunicationStyle(BaseModel):
    """Communication compatibility analysis"""
    person1_style: str = Field(..., min_length=1, description="Person 1's communication style")
    person2_style: str = Field(..., min_length=1, description="Person 2's communication style")
    compatibility_score: float = Field(..., ge=0, le=100, description="Communication compatibility")
    potential_misunderstandings: List[str] = Field(default_factory=list, description="Potential communication issues")
    strengths: List[str] = Field(default_factory=list, description="Communication strengths")
    improvement_suggestions: List[str] = Field(default_factory=list, description="Ways to improve communication")

    @field_validator('person1_style', 'person2_style')
    @classmethod
    def validate_communication_styles(cls, v: str) -> str:
        """Validate communication style descriptions"""
        valid_styles = {
            'direct', 'indirect', 'emotional', 'logical', 'intuitive', 'analytical', 
            'expressive', 'reserved', 'assertive', 'passive', 'collaborative', 'competitive'
        }
        # Allow custom styles but validate format
        stripped = v.strip().lower()
        if len(stripped) < 3:
            raise ValueError("Communication style must be at least 3 characters")
        return stripped

    @field_validator('potential_misunderstandings', 'strengths', 'improvement_suggestions')
    @classmethod
    def validate_string_lists(cls, v: List[str]) -> List[str]:
        """Validate string lists"""
        if len(v) > 20:
            raise ValueError("Too many items (max 20)")
        return [item.strip() for item in v if item.strip()]


# ===== COMPOSITE CHART MODELS =====

class CompositeChart(BaseModel):
    """Composite chart for the relationship"""
    composite_type: CompositeType = Field(..., description="Type of composite chart")
    planets: List["CompositePlanet"] = Field(..., description="Composite planets")
    aspects: List[Aspect] = Field(default_factory=list, description="Composite chart aspects")
    houses: List[House] = Field(default_factory=list, description="Composite houses")
    chart_ruler: str = Field(..., description="Chart ruler planet")
    relationship_purpose: str = Field(..., description="Purpose/mission of the relationship")
    key_themes: List[str] = Field(default_factory=list, description="Key relationship themes")
    growth_areas: List[str] = Field(default_factory=list, description="Areas for growth")
    challenges: List[str] = Field(default_factory=list, description="Relationship challenges")


class ProgressedSynastry(BaseModel):
    """Progressed synastry analysis"""
    current_phase: RelationshipPhase = Field(..., description="Current relationship phase")
    upcoming_transits: List["RelationshipTransit"] = Field(default_factory=list, description="Upcoming significant transits")
    progressed_aspects: List[SynastryAspect] = Field(default_factory=list, description="Current progressed aspects")
    timing_insights: List[str] = Field(default_factory=list, description="Timing-related insights")
    next_major_shift: Optional[str] = Field(default=None, description="When next major shift might occur")


# ===== COMPREHENSIVE SYNASTRY ANALYSIS =====

class SynastryAnalysis(BaseModel):
    """Complete synastry analysis"""
    person1_birth_data: BirthData = Field(..., description="Person 1's birth data")
    person2_birth_data: BirthData = Field(..., description="Person 2's birth data")
    analysis_date: datetime = Field(..., description="When analysis was performed")
    analysis_level: AnalysisLevel = Field(default="intermediate", description="Depth of analysis")
    
    # Core synastry components
    synastry_aspects: List[SynastryAspect] = Field(..., description="All synastry aspects")
    house_overlays_1_to_2: List[HouseOverlay] = Field(default_factory=list, description="Person 1's planets in Person 2's houses")
    house_overlays_2_to_1: List[HouseOverlay] = Field(default_factory=list, description="Person 2's planets in Person 1's houses")
    composite_chart: Optional[CompositeChart] = Field(default=None, description="Composite chart")
    
    # Compatibility analysis
    compatibility_scores: CompatibilityScore = Field(..., description="Detailed compatibility scores")
    elemental_compatibility: ElementalCompatibility = Field(..., description="Elemental compatibility")
    modality_compatibility: ModalityCompatibility = Field(..., description="Modal compatibility")
    
    # Relationship dynamics
    relationship_dynamics: List["RelationshipDynamic"] = Field(default_factory=list, description="Key dynamics")
    power_dynamic: PowerDynamic = Field(..., description="Power balance analysis")
    communication_style: CommunicationStyle = Field(..., description="Communication compatibility")
    
    # Advanced analysis
    progressed_synastry: Optional[ProgressedSynastry] = Field(default=None, description="Progressed analysis")
    karmic_connections: List[str] = Field(default_factory=list, description="Karmic connection indicators")
    soul_mate_indicators: List[str] = Field(default_factory=list, description="Soul mate connection signs")


# ===== RELATIONSHIP MATCHING =====

class RelationshipMatch(BaseModel):
    """Relationship compatibility match"""
    person1_id: str = Field(..., min_length=1, description="First person's ID")
    person2_id: str = Field(..., min_length=1, description="Second person's ID")
    match_score: float = Field(..., ge=0, le=100, description="Overall match percentage")
    match_type: CompatibilityCategory = Field(..., description="Type of compatibility")
    
    # Quick compatibility indicators
    sun_sign_compatibility: float = Field(..., ge=0, le=100, description="Sun sign compatibility")
    moon_sign_compatibility: float = Field(..., ge=0, le=100, description="Moon sign compatibility")
    venus_mars_compatibility: float = Field(..., ge=0, le=100, description="Venus-Mars compatibility")
    mercury_compatibility: float = Field(..., ge=0, le=100, description="Communication compatibility")
    
    # Strengths and challenges
    top_strengths: List[str] = Field(default_factory=list, description="Top 3 relationship strengths")
    main_challenges: List[str] = Field(default_factory=list, description="Main challenges to address")
    growth_potential: float = Field(..., ge=0, le=100, description="Potential for growth together")
    
    # Additional insights
    psychological_compatibility: Optional[float] = Field(default=None, ge=0, le=100, description="Psychology-based compatibility")
    recommended_relationship_type: str = Field(..., min_length=1, description="Recommended relationship approach")

    @field_validator('person1_id', 'person2_id')
    @classmethod
    def validate_person_ids(cls, v: str) -> str:
        """Validate person IDs are properly formatted"""
        if not v.strip():
            raise ValueError("Person ID cannot be empty")
        if len(v.strip()) > 100:
            raise ValueError("Person ID too long (max 100 characters)")
        return v.strip()

    @field_validator('top_strengths')
    @classmethod
    def validate_strengths(cls, v: List[str]) -> List[str]:
        """Validate strengths list"""
        if len(v) > 10:
            raise ValueError("Too many strengths listed (max 10)")
        return [strength.strip() for strength in v if strength.strip()]

    @field_validator('main_challenges')
    @classmethod
    def validate_challenges(cls, v: List[str]) -> List[str]:
        """Validate challenges list"""
        if len(v) > 10:
            raise ValueError("Too many challenges listed (max 10)")
        return [challenge.strip() for challenge in v if challenge.strip()]

    @field_validator('recommended_relationship_type')
    @classmethod
    def validate_relationship_type(cls, v: str) -> str:
        """Validate recommended relationship type"""
        if len(v.strip()) < 3:
            raise ValueError("Relationship type must be at least 3 characters")
        return v.strip()


# ===== API RESPONSE MODELS =====

class SynastryAnalysisResponse(BaseModel):
    """Synastry analysis API response"""
    success: bool = Field(default=True, description="Analysis success")
    analysis: SynastryAnalysis = Field(..., description="Complete synastry analysis")
    summary: SynastryAnalysisSummary = Field(..., description="Structured analysis summary")
    insights: List[str] = Field(default_factory=list, description="Key insights")
    recommendations: List[str] = Field(default_factory=list, description="Relationship recommendations")
    processing_time_ms: float = Field(..., description="Processing time")
    generated_at: str = Field(..., description="Generation timestamp")


class CompositeChartResponse(BaseModel):
    """Composite chart analysis response"""
    success: bool = Field(default=True, description="Analysis success")
    composite_chart: CompositeChart = Field(..., description="Composite chart data")
    relationship_insights: List[str] = Field(default_factory=list, description="Relationship insights")
    timing_guidance: List[str] = Field(default_factory=list, description="Timing-related guidance")
    processing_time_ms: float = Field(..., description="Processing time")
    generated_at: str = Field(..., description="Generation timestamp")


class RelationshipMatchResponse(BaseModel):
    """Relationship match API response"""
    success: bool = Field(default=True, description="Match success")
    compatibility_score: float = Field(..., description="Overall compatibility")
    match_quality: MatchQuality = Field(..., description="Quality rating")
    detailed_breakdown: CompatibilityBreakdown = Field(..., description="Structured compatibility breakdown")
    dominant_themes: List[str] = Field(default_factory=list, description="Key themes")
    growth_opportunities: List[str] = Field(default_factory=list, description="Growth areas")
    processing_time_ms: float = Field(..., description="Processing time")
    generated_at: str = Field(..., description="Generation timestamp")


class SynastryComparisonResponse(BaseModel):
    """Multiple relationship comparison response"""
    success: bool = Field(default=True, description="Comparison success")
    base_person_id: str = Field(..., description="Base person for comparison")
    comparisons: List["RelationshipMatch"] = Field(..., description="List of relationship matches")
    ranking: List[str] = Field(..., description="Person IDs ranked by compatibility")
    comparison_insights: List[str] = Field(default_factory=list, description="Comparative insights")
    processing_time_ms: float = Field(..., description="Processing time")
    generated_at: str = Field(..., description="Generation timestamp")


# ===== SERVICE MODELS =====

class SynastryHealthCheck(BaseModel):
    """Health check response for synastry services"""
    service: str = Field(default="synastry", description="Service name")
    status: Literal["healthy", "degraded", "unhealthy"] = Field(..., description="Service status")
    calculations_available: bool = Field(..., description="Whether calculations are available")
    analysis_types: List[str] = Field(..., description="Available analysis types")
    last_analysis: Optional[str] = Field(default=None, description="Last successful analysis")
    composite_charts_available: bool = Field(default=True, description="Whether composite charts are available")
    uptime_seconds: Optional[float] = Field(default=None, description="Service uptime")
    timestamp: str = Field(..., description="Health check timestamp")


# ===== TRANSIT AND TIMING MODELS =====

class RelationshipTiming(BaseModel):
    """Relationship timing analysis"""
    current_phase: RelationshipPhase = Field(..., description="Current relationship phase")
    phase_start: Optional[datetime] = Field(default=None, description="When current phase started")
    phase_peak: Optional[datetime] = Field(default=None, description="When phase reaches peak intensity")
    phase_end: Optional[datetime] = Field(default=None, description="When phase is expected to end")
    next_phase: RelationshipPhase = Field(..., description="Next expected phase")
    transition_period: Optional[str] = Field(default=None, description="Transition timeline")


class RelationshipTransit(BaseModel):
    """Significant transit affecting the relationship"""
    transiting_planet: str = Field(..., min_length=1, description="Planet making the transit")
    transit_type: str = Field(..., min_length=1, description="Type of transit")
    start_date: datetime = Field(..., description="When transit begins")
    peak_date: datetime = Field(..., description="When transit is exact/peak")
    end_date: datetime = Field(..., description="When transit ends")
    intensity: float = Field(..., ge=0, le=100, description="Transit intensity")
    relationship_impact: str = Field(..., min_length=5, description="How this affects the relationship")
    advice: str = Field(..., min_length=5, description="Advice for navigating this transit")

    @field_validator('transiting_planet')
    @classmethod
    def validate_transiting_planet(cls, v: str) -> str:
        """Validate transiting planet name"""
        valid_planets = {
            'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
            'uranus', 'neptune', 'pluto', 'north_node', 'south_node', 'chiron'
        }
        if v.lower() not in valid_planets:
            raise ValueError(f"Invalid transiting planet: {v}")
        return v.lower()

    @field_validator('transit_type')
    @classmethod
    def validate_transit_type(cls, v: str) -> str:
        """Validate transit type"""
        valid_types = {
            'conjunction', 'opposition', 'trine', 'square', 'sextile',
            'quincunx', 'return', 'ingress', 'station', 'eclipse'
        }
        if v.lower() not in valid_types:
            # Allow custom types but validate format
            if len(v.strip()) < 3:
                raise ValueError("Transit type must be at least 3 characters")
        return v.lower()

    @field_validator('end_date')
    @classmethod
    def validate_end_after_start(cls, v: datetime, info: ValidationInfo) -> datetime:
        """Validate end date is after start date"""
        if hasattr(info, 'data') and info.data and 'start_date' in info.data:
            start_date = info.data['start_date']
            if isinstance(start_date, datetime) and v <= start_date:
                raise ValueError("End date must be after start date")
        return v

    @field_validator('peak_date')
    @classmethod
    def validate_peak_between_dates(cls, v: datetime, info: ValidationInfo) -> datetime:
        """Validate peak date is between start and end dates"""
        if hasattr(info, 'data') and info.data:
            start_date = info.data.get('start_date')
            end_date = info.data.get('end_date')
            if isinstance(start_date, datetime) and v < start_date:
                raise ValueError("Peak date must be after start date")
            if isinstance(end_date, datetime) and v > end_date:
                raise ValueError("Peak date must be before end date")
        return v


class SynastryTimingResponse(BaseModel):
    """Synastry timing analysis response"""
    success: bool = Field(default=True, description="Timing analysis success")
    current_timing: RelationshipTiming = Field(..., description="Current relationship timing")
    significant_transits: List[RelationshipTransit] = Field(default_factory=list, description="Significant upcoming transits")
    best_timing_windows: List[str] = Field(default_factory=list, description="Optimal timing for relationship milestones")
    challenging_periods: List[str] = Field(default_factory=list, description="Periods to be aware of")
    long_term_outlook: str = Field(..., description="Long-term relationship outlook")
    processing_time_ms: float = Field(..., description="Processing time")
    generated_at: str = Field(..., description="Generation timestamp")
