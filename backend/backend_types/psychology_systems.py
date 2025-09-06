# backend/types/psychology_systems.py
"""
Centralized Psychology System Types for CosmicHub Backend

Provides strongly typed Pydantic models for psychological assessments,
personality analysis, and therapeutic insights.

This file serves as the single source of truth for psychology-related
data structures in the backend, ensuring type safety and API consistency.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel, Field, field_validator

# ===== TYPE DEFINITIONS =====

# Personality dimensions
PersonalityDimension = Literal[
    'extraversion', 'introversion', 'sensing', 'intuition', 
    'thinking', 'feeling', 'judging', 'perceiving'
]

# Big Five traits
BigFiveTrait = Literal[
    'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'
]

# Psychological temperaments
Temperament = Literal[
    'sanguine', 'choleric', 'melancholic', 'phlegmatic'
]

# Therapeutic approaches
TherapeuticApproach = Literal[
    'cognitive_behavioral', 'psychoanalytic', 'humanistic', 'systemic', 'integrative'
]

# Assessment types
AssessmentType = Literal[
    'mbti', 'big_five', 'enneagram', 'temperament', 'cognitive', 'emotional'
]

# ===== CORE PSYCHOLOGY ENTITIES =====

class PersonalityTrait(BaseModel):
    """Individual personality trait measurement"""
    name: str = Field(..., description="Trait name")
    value: float = Field(..., ge=0, le=100, description="Trait score (0-100)")
    percentile: Optional[float] = Field(default=None, ge=0, le=100, description="Percentile ranking")
    description: Optional[str] = Field(default=None, description="Trait description")
    category: Optional[str] = Field(default=None, description="Trait category")


class CognitiveFunction(BaseModel):
    """Cognitive function assessment"""
    name: str = Field(..., description="Function name (e.g., 'Extraverted Thinking')")
    code: str = Field(..., description="Function code (e.g., 'Te', 'Fi')")
    strength: float = Field(..., ge=0, le=100, description="Function strength")
    position: int = Field(..., ge=1, le=8, description="Position in function stack")
    attitude: Literal['extraverted', 'introverted'] = Field(..., description="Function attitude")


class EmotionalProfile(BaseModel):
    """Emotional intelligence and regulation profile"""
    emotional_intelligence: float = Field(..., ge=0, le=100, description="EI score")
    self_awareness: float = Field(..., ge=0, le=100, description="Self-awareness score")
    self_regulation: float = Field(..., ge=0, le=100, description="Self-regulation score")
    motivation: float = Field(..., ge=0, le=100, description="Internal motivation score")
    empathy: float = Field(..., ge=0, le=100, description="Empathy score")
    social_skills: float = Field(..., ge=0, le=100, description="Social skills score")


class StressIndicator(BaseModel):
    """Stress and coping mechanism indicator"""
    stress_level: float = Field(..., ge=0, le=100, description="Current stress level")
    primary_stressors: List[str] = Field(default_factory=list, description="Main stress sources")
    coping_strategies: List[str] = Field(default_factory=list, description="Preferred coping methods")
    resilience_score: float = Field(..., ge=0, le=100, description="Resilience measurement")
    burnout_risk: Literal['low', 'moderate', 'high'] = Field(..., description="Burnout risk level")


# ===== ASSESSMENT MODELS =====

class MBTIAssessment(BaseModel):
    """Myers-Briggs Type Indicator assessment"""
    type_code: str = Field(..., min_length=4, max_length=4, description="MBTI type (e.g., 'ENFP')")
    type_name: str = Field(..., description="Type name (e.g., 'The Campaigner')")
    cognitive_functions: List[CognitiveFunction] = Field(..., description="Cognitive function stack")
    dimensions: Dict[str, float] = Field(..., description="Dimension scores")
    confidence_level: float = Field(..., ge=0, le=100, description="Assessment confidence")
    
    @field_validator("type_code")
    @classmethod
    def validate_mbti_code(cls, v: str) -> str:
        """Validate MBTI type code format"""
        if len(v) != 4:
            raise ValueError("MBTI type code must be 4 characters")
        valid_chars = {0: ['E', 'I'], 1: ['N', 'S'], 2: ['T', 'F'], 3: ['J', 'P']}
        for i, char in enumerate(v.upper()):
            if char not in valid_chars[i]:
                raise ValueError(f"Invalid character '{char}' at position {i+1}")
        return v.upper()


class BigFiveAssessment(BaseModel):
    """Big Five personality assessment"""
    openness: PersonalityTrait = Field(..., description="Openness to experience")
    conscientiousness: PersonalityTrait = Field(..., description="Conscientiousness")
    extraversion: PersonalityTrait = Field(..., description="Extraversion")
    agreeableness: PersonalityTrait = Field(..., description="Agreeableness")
    neuroticism: PersonalityTrait = Field(..., description="Neuroticism")
    overall_profile: str = Field(..., description="Overall personality profile")


class EnneagramAssessment(BaseModel):
    """Enneagram personality assessment"""
    primary_type: int = Field(..., ge=1, le=9, description="Primary Enneagram type")
    wing: Optional[int] = Field(default=None, ge=1, le=9, description="Wing type")
    instinctual_variant: Literal['self_preservation', 'social', 'sexual'] = Field(..., description="Instinctual variant")
    integration_direction: int = Field(..., ge=1, le=9, description="Integration type")
    disintegration_direction: int = Field(..., ge=1, le=9, description="Disintegration type")
    type_scores: Dict[str, float] = Field(..., description="Scores for all 9 types")


class TemperamentAssessment(BaseModel):
    """Four temperaments assessment"""
    primary_temperament: Temperament = Field(..., description="Dominant temperament")
    secondary_temperament: Optional[Temperament] = Field(default=None, description="Secondary temperament")
    temperament_scores: Dict[str, float] = Field(..., description="Scores for all temperaments")
    blend_description: str = Field(..., description="Temperament blend description")


# ===== COMPREHENSIVE PSYCHOLOGY PROFILE =====

class PsychologyProfile(BaseModel):
    """Comprehensive psychological profile"""
    user_id: str = Field(..., description="User identifier")
    assessment_date: datetime = Field(..., description="When assessment was completed")
    
    # Core assessments
    mbti: Optional[MBTIAssessment] = Field(default=None, description="MBTI assessment")
    big_five: Optional[BigFiveAssessment] = Field(default=None, description="Big Five assessment")
    enneagram: Optional[EnneagramAssessment] = Field(default=None, description="Enneagram assessment")
    temperament: Optional[TemperamentAssessment] = Field(default=None, description="Temperament assessment")
    
    # Emotional and cognitive profiles
    emotional_profile: Optional[EmotionalProfile] = Field(default=None, description="Emotional intelligence")
    stress_indicators: Optional[StressIndicator] = Field(default=None, description="Stress assessment")
    
    # Meta-information
    assessment_completeness: float = Field(..., ge=0, le=100, description="Profile completeness percentage")
    reliability_score: float = Field(..., ge=0, le=100, description="Assessment reliability")


# ===== THERAPEUTIC RECOMMENDATIONS =====

class TherapeuticRecommendation(BaseModel):
    """Therapeutic approach recommendation"""
    approach: TherapeuticApproach = Field(..., description="Recommended therapeutic approach")
    rationale: str = Field(..., description="Reasoning for recommendation")
    suitability_score: float = Field(..., ge=0, le=100, description="Suitability percentage")
    focus_areas: List[str] = Field(default_factory=list, description="Areas to focus on")
    techniques: List[str] = Field(default_factory=list, description="Recommended techniques")


class GrowthRecommendation(BaseModel):
    """Personal growth recommendation"""
    area: str = Field(..., description="Growth area")
    current_level: float = Field(..., ge=0, le=100, description="Current development level")
    target_level: float = Field(..., ge=0, le=100, description="Target development level")
    strategies: List[str] = Field(default_factory=list, description="Growth strategies")
    timeline: str = Field(..., description="Recommended timeline")
    resources: List[str] = Field(default_factory=list, description="Helpful resources")


class WellnessInsight(BaseModel):
    """Mental wellness insight"""
    category: Literal['strength', 'challenge', 'opportunity', 'risk'] = Field(..., description="Insight category")
    title: str = Field(..., description="Insight title")
    description: str = Field(..., description="Detailed description")
    priority: Literal['low', 'medium', 'high', 'critical'] = Field(..., description="Priority level")
    actionable: bool = Field(default=True, description="Whether insight is actionable")
    related_traits: List[str] = Field(default_factory=list, description="Related personality traits")


# ===== API RESPONSE MODELS =====

class PsychologyAssessmentResponse(BaseModel):
    """Psychology assessment API response"""
    success: bool = Field(default=True, description="Assessment success")
    user_id: str = Field(..., description="User identifier")
    assessment_type: AssessmentType = Field(..., description="Type of assessment")
    results: Dict[str, Any] = Field(..., description="Assessment results")
    insights: List["WellnessInsight"] = Field(default_factory=list, description="Key insights")
    recommendations: List["TherapeuticRecommendation | GrowthRecommendation"] = Field(
        default_factory=list, description="Personalized recommendations"
    )
    processing_time_ms: float = Field(..., description="Processing time")
    generated_at: str = Field(..., description="Generation timestamp")


class PsychologyProfileResponse(BaseModel):
    """Complete psychology profile response"""
    success: bool = Field(default=True, description="Profile generation success")
    profile: PsychologyProfile = Field(..., description="Complete psychology profile")
    summary: Dict[str, Any] = Field(..., description="Profile summary")
    insights: List["WellnessInsight"] = Field(default_factory=list, description="Key insights")
    recommendations: List["TherapeuticRecommendation | GrowthRecommendation"] = Field(
        default_factory=list, description="Personalized recommendations"
    )
    compatibility_notes: Optional[Dict[str, Any]] = Field(default=None, description="Relationship compatibility insights")
    processing_time_ms: float = Field(..., description="Processing time")
    generated_at: str = Field(..., description="Generation timestamp")


class PsychologyComparisonResponse(BaseModel):
    """Psychology profile comparison response"""
    success: bool = Field(default=True, description="Comparison success")
    user1_profile: PsychologyProfile = Field(..., description="First user's profile")
    user2_profile: PsychologyProfile = Field(..., description="Second user's profile")
    compatibility_score: float = Field(..., ge=0, le=100, description="Overall compatibility")
    compatibility_breakdown: Dict[str, float] = Field(..., description="Detailed compatibility scores")
    shared_strengths: List[str] = Field(default_factory=list, description="Common strengths")
    potential_challenges: List[str] = Field(default_factory=list, description="Potential relationship challenges")
    growth_opportunities: List[str] = Field(default_factory=list, description="Joint growth opportunities")
    communication_style_match: float = Field(..., ge=0, le=100, description="Communication compatibility")
    processing_time_ms: float = Field(..., description="Processing time")
    generated_at: str = Field(..., description="Generation timestamp")


# ===== SERVICE MODELS =====

class PsychologyHealthCheck(BaseModel):
    """Health check response for psychology services"""
    service: str = Field(default="psychology", description="Service name")
    status: Literal["healthy", "degraded", "unhealthy"] = Field(..., description="Service status")
    assessments_available: bool = Field(..., description="Whether assessments are available")
    models_loaded: List[str] = Field(..., description="Available assessment models")
    last_assessment: Optional[str] = Field(default=None, description="Last successful assessment")
    uptime_seconds: Optional[float] = Field(default=None, description="Service uptime")
    timestamp: str = Field(..., description="Health check timestamp")


# ===== RESEARCH AND ANALYTICS MODELS =====

class PsychometricValidation(BaseModel):
    """Psychometric validation data"""
    assessment_type: AssessmentType = Field(..., description="Assessment being validated")
    sample_size: int = Field(..., ge=1, description="Validation sample size")
    reliability_coefficient: float = Field(..., ge=0, le=1, description="Reliability measure")
    validity_measures: Dict[str, float] = Field(..., description="Various validity measures")
    test_retest_correlation: Optional[float] = Field(default=None, ge=0, le=1, description="Test-retest reliability")
    internal_consistency: float = Field(..., ge=0, le=1, description="Cronbach's alpha or similar")
    validation_date: datetime = Field(..., description="When validation was performed")


class PopulationNorms(BaseModel):
    """Population norms for psychological assessments"""
    assessment_type: AssessmentType = Field(..., description="Assessment type")
    population_segment: str = Field(..., description="Population segment (age, culture, etc.)")
    sample_size: int = Field(..., ge=1, description="Norm sample size")
    means: Dict[str, float] = Field(..., description="Mean scores by dimension")
    standard_deviations: Dict[str, float] = Field(..., description="Standard deviations")
    percentile_ranks: Dict[str, List[float]] = Field(..., description="Percentile conversion tables")
    demographic_data: Dict[str, Any] = Field(default_factory=dict, description="Demographic breakdowns")
    last_updated: datetime = Field(..., description="When norms were last updated")
