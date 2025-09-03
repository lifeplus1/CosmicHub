/**
 * Psychology Integration Types for MBTI and Enneagram
 * 
 * These types define the structure for psychology-spirituality bridge functionality,
 * maintaining both psychological validity and spiritual authenticity.
 */

// MBTI Core Types
export type MbtiType = 
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type CognitiveFunction = 
  | 'Ni' | 'Ne' | 'Si' | 'Se'  // Intuition functions
  | 'Ti' | 'Te' | 'Fi' | 'Fe'; // Thinking/Feeling functions

export type MbtiTemperament = 'NT' | 'NF' | 'SJ' | 'SP';

export type AstrologicalElement = 'Fire' | 'Earth' | 'Air' | 'Water';
export type AstrologicalModality = 'Cardinal' | 'Fixed' | 'Mutable';

export interface MbtiProfile {
  type: MbtiType;
  temperament: MbtiTemperament;
  cognitive_functions: {
    dominant: CognitiveFunction;
    auxiliary: CognitiveFunction;
    tertiary: CognitiveFunction;
    inferior: CognitiveFunction;
  };
  description: string;
  strengths: string[];
  growth_areas: string[];
  career_preferences: string[];
  relationship_style: string;
}

export interface MbtiAstrologyCorrelation {
  mbti_type: MbtiType;
  element: AstrologicalElement;
  modality: AstrologicalModality;
  planetary_correspondences: {
    [key in CognitiveFunction]?: string;
  };
  aligned_signs: string[];
  correlation_strength: number; // 0-1 confidence level
  explanation: string;
}

// Enneagram Core Types
export type EnneagramType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type EnneagramWing = `${EnneagramType}w${EnneagramType}`;

export type InstinctualVariant = 'sp' | 'so' | 'sx'; // Self-Preservation, Social, Sexual

export type TriType = `${EnneagramType}${EnneagramType}${EnneagramType}`;

export type LevelOfDevelopment = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface EnneagramProfile {
  core_type: EnneagramType;
  wing: EnneagramWing | null;
  instinctual_variant: InstinctualVariant;
  tritype: TriType | null;
  level_of_development: LevelOfDevelopment;
  core_motivation: string;
  core_fear: string;
  core_desire: string;
  basic_proposition: string;
  key_motivations: string[];
  at_their_best: string;
  at_their_worst: string;
  direction_of_growth: EnneagramType;
  direction_of_stress: EnneagramType;
}

export interface EnneagramAstrologyCorrelation {
  enneagram_type: EnneagramType;
  astrological_house: number;
  planetary_ruler: string;
  element_affinity: AstrologicalElement;
  modality_affinity: AstrologicalModality;
  motivation_planet: string; // Planet associated with core motivation
  fear_planet: string; // Planet associated with core fear
  growth_aspects: string[]; // Beneficial astrological aspects
  stress_aspects: string[]; // Challenging astrological aspects
  correlation_explanation: string;
}

// Assessment Interfaces
export interface MbtiAssessmentQuestion {
  id: string;
  question: string;
  options: {
    a: string;
    b: string;
  };
  cognitive_function_measured: CognitiveFunction;
  weight: number; // Importance of this question (1-5)
}

export interface EnneagramAssessmentQuestion {
  id: string;
  statement: string;
  scale_description: string;
  enneagram_type: EnneagramType;
  category: 'motivation' | 'fear' | 'behavior' | 'stress' | 'growth';
  weight: number;
}

export interface AssessmentResponse {
  question_id: string;
  response: number | string;
  confidence_level?: number; // How sure the user is (1-5)
  timestamp: string;
}

export interface AssessmentResults {
  mbti?: {
    type: MbtiType;
    confidence: number;
    function_scores: Record<CognitiveFunction, number>;
    type_probabilities: Record<MbtiType, number>;
  };
  enneagram?: {
    type: EnneagramType;
    confidence: number;
    wing_probabilities: Record<string, number>;
    instinctual_variant: InstinctualVariant;
    type_scores: Record<EnneagramType, number>;
  };
  assessment_id: string;
  completed_at: string;
  user_id?: string;
}

// Psychology-Astrology Integration Types
export interface PsychologyAstrologyProfile {
  mbti_profile?: MbtiProfile;
  enneagram_profile?: EnneagramProfile;
  astrological_correlations: {
    mbti_correlations?: MbtiAstrologyCorrelation[];
    enneagram_correlations?: EnneagramAstrologyCorrelation[];
  };
  synthesis: {
    personality_themes: string[];
    spiritual_path_indicators: string[];
    growth_opportunities: string[];
    potential_challenges: string[];
    astrological_timing_guidance: string[];
  };
  ai_interpretation?: {
    psychology_astrology_synthesis: string;
    personalized_guidance: string;
    spiritual_development_path: string;
    current_life_phase_analysis: string;
    generated_at: string;
  };
}

// Cross-System Integration Types
export interface PersonalitySystemComparison {
  mbti_enneagram_alignment: {
    compatibility_score: number; // 0-100
    common_themes: string[];
    divergent_aspects: string[];
    integration_suggestions: string[];
  };
  astrology_psychology_bridges: {
    element_temperament_match: boolean;
    planetary_function_alignments: Array<{
      planet: string;
      cognitive_function?: CognitiveFunction;
      enneagram_motivation?: string;
      correlation_strength: number;
    }>;
    timing_personality_insights: string[];
  };
  holistic_profile_summary: string;
}

// Assessment Configuration Types
export interface AssessmentConfig {
  mbti: {
    questions_per_function: number;
    adaptive_questioning: boolean;
    time_limit_minutes?: number;
    include_cognitive_functions_explanation: boolean;
  };
  enneagram: {
    questions_per_type: number;
    include_instinctual_variants: boolean;
    include_wings_assessment: boolean;
    include_levels_assessment: boolean;
  };
  integration: {
    auto_correlate_with_astrology: boolean;
    require_birth_data: boolean;
    generate_ai_synthesis: boolean;
  };
}

// User Experience Types
export interface PsychologyChartDisplayData {
  mbti_data?: {
    profile: MbtiProfile;
    astrological_correlations: MbtiAstrologyCorrelation[];
    visual_representation: {
      element_color: string;
      type_symbol: string;
      function_stack_display: Array<{
        function: CognitiveFunction;
        strength: number;
        description: string;
      }>;
    };
  };
  enneagram_data?: {
    profile: EnneagramProfile;
    astrological_correlations: EnneagramAstrologyCorrelation[];
    visual_representation: {
      type_symbol: string;
      wing_indicator?: string;
      growth_direction_arrow: string;
      stress_direction_arrow: string;
      level_indicator: number;
    };
  };
  synthesis_data: {
    integration_themes: string[];
    spiritual_guidance: string;
    personality_astrology_bridges: string[];
    growth_recommendations: string[];
  };
}

// Research and Validation Types
export interface CorrelationResearchData {
  mbti_element_correlations: Array<{
    mbti_type: MbtiType;
    element: AstrologicalElement;
    research_sources: string[];
    statistical_significance?: number;
    sample_size?: number;
  }>;
  enneagram_house_correlations: Array<{
    enneagram_type: EnneagramType;
    house_number: number;
    correlation_rationale: string;
    traditional_sources: string[];
  }>;
  cross_system_validations: Array<{
    comparison_type: string;
    correlation_coefficient?: number;
    methodology: string;
    limitations: string[];
  }>;
}

// Export comprehensive psychology chart data interface
export interface PsychologyChartData {
  assessment_data?: AssessmentResults;
  personality_profiles: {
    mbti?: MbtiProfile;
    enneagram?: EnneagramProfile;
  };
  astrological_integration: PsychologyAstrologyProfile;
  cross_system_analysis: PersonalitySystemComparison;
  user_journey: {
    assessment_completion_status: {
      mbti_completed: boolean;
      enneagram_completed: boolean;
      birth_data_provided: boolean;
    };
    growth_tracking: Array<{
      date: string;
      development_notes: string;
      level_changes: {
        enneagram_level?: LevelOfDevelopment;
        mbti_development?: Record<string, number>;
        notes: string;
      };
    }>;
  };
  display_data: PsychologyChartDisplayData;
}
