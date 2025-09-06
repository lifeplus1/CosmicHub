"""
Backend Types Package for CosmicHub

Contains all type definitions and schemas for the CosmicHub backend.
"""

# Import and re-export all types from submodules
from .astrology_systems import (
    BirthData, Planet, House, Aspect, Asteroid, Angle, UserProfile,
    AstrologyChart, ChartCalculationMetadata, WesternChart, VedicChart,
    UranianChart, MultiSystemChart, ChartResponse, MultiSystemChartResponse,
    CompositeChartResponse as AstrologyCompositeChartResponse, AstrologyHealthCheck, ZodiacSign, MajorPlanet,
    HouseSystem, AspectType
)

from .synastry_systems import (
    SynastryAspect, HouseOverlay, CompositePlanet, CompatibilityScore,
    ElementalCompatibility, ModalityCompatibility, RelationshipDynamic,
    PowerDynamic, CommunicationStyle, CompositeChart, ProgressedSynastry,
    SynastryAnalysis, RelationshipMatch, SynastryAnalysisSummary,
    CompatibilityBreakdown, SynastryAspectType, CompatibilityCategory,
    MatchQuality, CompositeType, AnalysisLevel, RelationshipPhase,
    SynastryAnalysisResponse, CompositeChartResponse, RelationshipMatchResponse,
    SynastryComparisonResponse, RelationshipTiming, RelationshipTransit,
    SynastryTimingResponse
)

from .psychology_systems import (
    PersonalityTrait, CognitiveFunction, EmotionalProfile, StressIndicator,
    MBTIAssessment, BigFiveAssessment, EnneagramAssessment, TemperamentAssessment,
    PsychologyProfile, TherapeuticRecommendation, GrowthRecommendation,
    WellnessInsight, PsychologyAssessmentResponse, PsychologyProfileResponse,
    PsychologyComparisonResponse, PsychologyHealthCheck, PersonalityDimension,
    BigFiveTrait, Temperament, TherapeuticApproach, AssessmentType
)

from .tcm_systems import (
    WuXingElement, TCMConstitutionType, TCMAnalysisData, OrganSystemBalance,
    MeridianFlowData, ElementInfo, ElementalBalance, ConstitutionAnalysis,
    TCMCalculationData, TCMResponse, TCMRequest, ConstitutionAnalysisResponse,
    HealthRecommendationsResponse, ElementInfoResponse, ElementData,
    TCMElementName, TCMHealthCheck, TCMAnalysisResponse, ElementalBalanceResponse
)

__all__ = [
    # Astrology systems
    'BirthData', 'Planet', 'House', 'Aspect', 'Asteroid', 'Angle', 'UserProfile',
    'AstrologyChart', 'ChartCalculationMetadata', 'WesternChart', 'VedicChart',
    'UranianChart', 'MultiSystemChart', 'ChartResponse', 'MultiSystemChartResponse',
    'CompositeChartResponse', 'AstrologyHealthCheck', 'ZodiacSign', 'MajorPlanet',
    'HouseSystem', 'AspectType',
    
    # Synastry systems
    'SynastryAspect', 'HouseOverlay', 'CompositePlanet', 'CompatibilityScore',
    'ElementalCompatibility', 'ModalityCompatibility', 'RelationshipDynamic',
    'PowerDynamic', 'CommunicationStyle', 'CompositeChart', 'ProgressedSynastry',
    'SynastryAnalysis', 'RelationshipMatch', 'SynastryAnalysisSummary',
    'CompatibilityBreakdown', 'SynastryAspectType', 'CompatibilityCategory',
    'MatchQuality', 'CompositeType', 'AnalysisLevel', 'RelationshipPhase',
    'SynastryAnalysisResponse', 'CompositeChartResponse', 'RelationshipMatchResponse',
    'SynastryComparisonResponse', 'RelationshipTiming', 'RelationshipTransit',
    'SynastryTimingResponse',
    
    # Psychology systems
    'PersonalityTrait', 'CognitiveFunction', 'EmotionalProfile', 'StressIndicator',
    'MBTIAssessment', 'BigFiveAssessment', 'EnneagramAssessment', 'TemperamentAssessment',
    'PsychologyProfile', 'TherapeuticRecommendation', 'GrowthRecommendation',
    'WellnessInsight', 'PsychologyAssessmentResponse', 'PsychologyProfileResponse',
    'PsychologyComparisonResponse', 'PsychologyHealthCheck', 'PersonalityDimension',
    'BigFiveTrait', 'Temperament', 'TherapeuticApproach', 'AssessmentType',
    
    # TCM systems
    'WuXingElement', 'TCMConstitutionType', 'TCMAnalysisData', 'OrganSystemBalance',
    'MeridianFlowData', 'ElementInfo', 'ElementalBalance', 'ConstitutionAnalysis',
    'TCMCalculationData', 'TCMResponse', 'TCMRequest', 'ConstitutionAnalysisResponse',
    'HealthRecommendationsResponse', 'ElementInfoResponse', 'ElementData',
    'TCMElementName', 'TCMHealthCheck', 'TCMAnalysisResponse', 'ElementalBalanceResponse'
]
