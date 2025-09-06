# backend/types/sacred_geometry.py
"""
Sacred Geometry Type Definitions
SPIRITUAL-003.5 Implementation

Pydantic models for Sacred Geometry & Cosmometry API endpoints
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, List, Optional, Tuple, Any, Union
from datetime import datetime

# ===== REQUEST MODELS =====

class SacredGeometryRequest(BaseModel):
    """Request model for sacred geometry analysis"""
    model_config = ConfigDict(str_strip_whitespace=True)
    
    year: int = Field(..., ge=1900, le=2100, description="Birth year")
    month: int = Field(..., ge=1, le=12, description="Birth month")
    day: int = Field(..., ge=1, le=31, description="Birth day")
    hour: int = Field(default=12, ge=0, le=23, description="Birth hour (24-hour format)")
    minute: int = Field(default=0, ge=0, le=59, description="Birth minute")
    
    lat: float = Field(default=0.0, ge=-90, le=90, description="Latitude in degrees")
    lon: float = Field(default=0.0, ge=-180, le=180, description="Longitude in degrees")
    timezone: str = Field(default="UTC", description="Timezone identifier")
    
    include_tcm_integration: bool = Field(default=True, description="Include TCM integration")
    user_id: Optional[str] = Field(default=None, description="User identifier")

class GoldenRatioRequest(BaseModel):
    """Request model for Golden Ratio analysis only"""
    model_config = ConfigDict(str_strip_whitespace=True)
    
    year: int = Field(..., ge=1900, le=2100)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: int = Field(default=12, ge=0, le=23)
    minute: int = Field(default=0, ge=0, le=59)
    lat: float = Field(default=0.0, ge=-90, le=90)
    lon: float = Field(default=0.0, ge=-180, le=180)

class FibonacciTimingRequest(BaseModel):
    """Request model for Fibonacci timing analysis"""
    model_config = ConfigDict(str_strip_whitespace=True)
    
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    duration_months: int = Field(default=12, ge=1, le=60, description="Analysis duration in months")
    include_lunar_phases: bool = Field(default=True, description="Include lunar phase alignment")

class MandalaGenerationRequest(BaseModel):
    """Request model for personalized mandala generation"""
    model_config = ConfigDict(str_strip_whitespace=True)
    
    year: int = Field(..., ge=1900, le=2100)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    
    mandala_size: int = Field(default=512, ge=256, le=2048, description="Mandala size in pixels")
    color_scheme: str = Field(default="tcm_elements", description="Color scheme preference")
    complexity_level: str = Field(default="intermediate", description="Geometric complexity")

# ===== RESPONSE MODELS =====

class GeometricPatternModel(BaseModel):
    """Geometric pattern data model"""
    name: str
    ratio: float
    angle_degrees: float
    frequency_hz: Optional[float] = None
    element_correspondence: Optional[str] = None
    chakra_correspondence: Optional[int] = None

class GoldenRatioAnalysisModel(BaseModel):
    """Golden Ratio analysis response model"""
    primary_phi_ratio: float = Field(..., description="Primary Golden Ratio value")
    phi_aspects: List[Tuple[str, str, float]] = Field(..., description="Planetary aspects with phi ratios")
    harmonic_ratios: List[float] = Field(..., description="Harmonic ratio values")
    resonance_strength: float = Field(..., ge=0, le=1, description="Resonance strength (0-1)")
    optimal_meditation_times: List[str] = Field(..., description="Optimal daily meditation times")

class FibonacciTimingModel(BaseModel):
    """Fibonacci timing model"""
    sequence_position: int
    days_from_start: int
    optimal_date: str  # ISO date string
    activity_type: str
    lunar_phase_alignment: Optional[str] = None

class MandalaDataModel(BaseModel):
    """Mandala generation data model"""
    center_point: Tuple[float, float]
    primary_radius: float
    golden_ratio_rings: List[float]
    symmetry_order: int
    color_harmonics: List[str]
    geometric_elements: List[str]
    meditation_focus: str

class PlatonicSolidModel(BaseModel):
    """Platonic solid properties model"""
    name: str
    faces: int
    vertices: int
    edges: int
    dihedral_angle: float
    tcm_element: str
    chakra_correspondence: Optional[int] = None

class SacredGeometryAnalysisResponse(BaseModel):
    """Complete sacred geometry analysis response"""
    user_id: str
    birth_data: Dict[str, Any]
    golden_ratio_analysis: GoldenRatioAnalysisModel
    fibonacci_timing: List[FibonacciTimingModel]
    platonic_solid_correspondences: Dict[str, str]  # element -> solid name
    mandala_data: MandalaDataModel
    tcm_geometric_integration: Dict[str, Any]
    wellness_applications: List[str]
    analysis_confidence: float = Field(..., ge=0, le=1)
    generated_at: str

class GoldenRatioResponse(BaseModel):
    """Golden Ratio analysis only response"""
    golden_ratio_analysis: GoldenRatioAnalysisModel
    birth_data: Dict[str, Any]
    generated_at: str
    analysis_confidence: float

class FibonacciTimingResponse(BaseModel):
    """Fibonacci timing analysis response"""
    timing_sequence: List[FibonacciTimingModel]
    start_date: str
    duration_months: int
    total_optimal_dates: int
    lunar_integration: bool
    generated_at: str

class MandalaResponse(BaseModel):
    """Mandala generation response"""
    mandala_data: MandalaDataModel
    mandala_svg: str  # SVG markup for the mandala
    color_meanings: Dict[str, str]  # Color -> meaning mapping
    meditation_guide: str
    generated_at: str

class PlatonicSolidsResponse(BaseModel):
    """Platonic solids correspondence response"""
    correspondences: Dict[str, PlatonicSolidModel]
    primary_solid: str
    elemental_harmony: float
    meditation_recommendations: List[str]
    generated_at: str

# ===== SPECIALIZED RESPONSE MODELS =====

class SacredGeometryHealthApplicationsResponse(BaseModel):
    """Health and wellness applications response"""
    golden_ratio_breathing: Dict[str, Any]
    fibonacci_exercise_timing: List[Dict[str, Any]]
    geometric_meditation_practices: List[Dict[str, Any]]
    tcm_geometry_integration: Dict[str, Any]
    daily_practice_schedule: List[Dict[str, str]]
    
class SacredGeometryCompatibilityResponse(BaseModel):
    """Sacred geometry compatibility analysis"""
    person1_geometry: SacredGeometryAnalysisResponse
    person2_geometry: SacredGeometryAnalysisResponse
    geometric_harmony_score: float
    shared_patterns: List[str]
    complementary_aspects: List[str]
    joint_practices: List[str]
    relationship_mandala: MandalaDataModel

class SacredGeometryProgressResponse(BaseModel):
    """Sacred geometry spiritual progress tracking"""
    baseline_analysis: SacredGeometryAnalysisResponse
    current_resonance: float
    growth_patterns: List[str]
    next_fibonacci_milestone: FibonacciTimingModel
    recommended_practices: List[str]
    progress_mandala: MandalaDataModel

# ===== ERROR RESPONSE MODELS =====

class SacredGeometryError(BaseModel):
    """Error response for sacred geometry calculations"""
    error_type: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: str

class ValidationError(BaseModel):
    """Validation error response"""
    field_errors: List[Dict[str, str]]
    message: str = "Validation failed"

# ===== UTILITY MODELS =====

class SacredGeometryConstants(BaseModel):
    """Sacred geometry mathematical constants"""
    golden_ratio: float = 1.618033988749
    phi_inverse: float = 0.618033988749
    pi: float = 3.141592653589793
    tau: float = 6.283185307179586
    fibonacci_sequence: List[int] = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]

class SacredGeometryMetadata(BaseModel):
    """Metadata for sacred geometry analysis"""
    calculation_engine_version: str = "1.0.0"
    mathematical_accuracy: str = "high_precision"
    cultural_authenticity: str = "traditional_sources"
    integration_systems: List[str] = ["tcm", "astrology", "chakras"]
    supported_applications: List[str] = ["meditation", "wellness", "spiritual_development"]

# ===== CONFIGURATION MODELS =====

class SacredGeometryConfig(BaseModel):
    """Configuration for sacred geometry calculations"""
    precision_level: str = Field(default="high", description="Calculation precision")
    include_advanced_patterns: bool = Field(default=True, description="Include advanced geometric patterns")
    cultural_sensitivity_mode: bool = Field(default=True, description="Enable cultural sensitivity checks")
    meditation_time_zones: List[str] = Field(default=["UTC"], description="Time zones for meditation timing")
    mandala_generation_quality: str = Field(default="high", description="Mandala generation quality")

# ===== SUMMARY MODELS =====

class SacredGeometrySummary(BaseModel):
    """Summary of sacred geometry analysis"""
    user_id: str
    dominant_pattern: str
    primary_golden_ratio: float
    strongest_element_correspondence: str
    recommended_practice_frequency: str
    next_optimal_practice_date: str
    overall_harmony_score: float
    
class SacredGeometryInsights(BaseModel):
    """Key insights from sacred geometry analysis"""
    spiritual_geometry_type: str
    natural_rhythm_pattern: str
    optimal_meditation_style: str
    geometric_strengths: List[str]
    areas_for_development: List[str]
    synchronicity_indicators: List[str]
