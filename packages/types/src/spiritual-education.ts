/**
 * SPIRITUAL EDUCATION TYPES - Grok Response #3 Implementation
 * ==========================================================
 *
 * TypeScript interfaces for comprehensive spiritual education system
 * following traditional Golden Dawn progression with AI-powered personalization.
 *
 * Author: CosmicHub Development Team
 * Date: September 2, 2025
 * Integration: SPIRITUAL-001 Week 2 Educational Framework
 */

// ============================================================================
// CORE EDUCATIONAL TYPES
// ============================================================================

export type SpiritualLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'master';
export type LessonType = 'overview' | 'practical' | 'meditation' | 'assessment';
export type AssessmentType =
  | 'journal_analysis'
  | 'quiz'
  | 'practical_demo'
  | 'reflection_essay';
export type PaceLevel = 'gentle' | 'standard' | 'accelerated';
export type SupportLevel =
  | 'minimal_support'
  | 'moderate_support'
  | 'high_support';

// ============================================================================
// LESSON AND CURRICULUM STRUCTURES
// ============================================================================

export interface SpiritualLesson {
  id: string;
  title: string;
  content: string;
  duration_minutes: number;
  lesson_type: LessonType;
  prerequisites: string[];
  materials_needed: string[];
  traditional_sources?: string[];
  safety_notes?: string[];
}

export interface PracticalExercise {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  time_requirement: string;
  assessment_criteria: Record<string, number>;
  traditional_sources: string[];
  safety_protocols?: string[];
}

export interface SpiritualAssessment {
  id: string;
  assessment_type: AssessmentType;
  questions: string[];
  scoring_criteria: Record<string, number>;
  passing_threshold: number;
  ai_evaluation_prompts: string[];
  traditional_validation?: boolean;
}

export interface WeekData {
  theme: string;
  learning_objectives: string[];
  lessons: SpiritualLesson[];
  practical_exercises: PracticalExercise[];
  assessments: SpiritualAssessment[];
  progression_criteria: Record<string, number>;
  traditional_safeguards: string[];
  focus?: string;
}

export interface PathwayData {
  level: SpiritualLevel;
  week_range: [number, number];
  total_weeks: number;
  focus: string;
  session_duration: string;
  prerequisites: string[];
  learning_objectives: string[];
  traditional_safeguards: string[];
  weeks: Record<number, WeekData>;
}

// ============================================================================
// USER ASSESSMENT AND PROGRESS
// ============================================================================

export interface SpiritualBackground {
  meditation_years: number;
  tarot_experience: number;
  kabbalah_study: number;
  emotional_stability: boolean;
  respectful_approach: boolean;
  other_spiritual_practices?: string[];
}

export interface PracticeHistory {
  ethical_practice: number; // 0-1 score
  daily_practice: number; // 0-1 score
  grounding_ability: boolean;
  consistency_rating?: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface UserAssessmentData {
  spiritual_background: SpiritualBackground;
  practice_history: PracticeHistory;
  birth_chart_data?: any; // From existing astro system
  mentor_support: boolean;
  goals?: string[];
  time_availability?: number; // minutes per day
}

export interface SpiritualAssessmentResult {
  current_level: SpiritualLevel;
  spiritual_readiness_score: number;
  prerequisite_gaps: string[];
  recommended_pathway: SpiritualLevel;
  safety_clearance: boolean;
  personalization_factors: Record<string, any>;
  detailed_scores: {
    meditation_readiness: number;
    traditional_understanding: number;
    ethical_grounding: number;
    practice_consistency: number;
  };
}

export interface UserProgress {
  user_id: string;
  current_pathway: SpiritualLevel;
  current_week: number;
  current_lesson: number;
  mastery_scores: Record<string, number>;
  practice_log: PracticeLogEntry[];
  assessment_results: Record<string, number>;
  spiritual_readiness_indicators: Record<string, boolean>;
  started_date: string;
  last_activity: string;
}

export interface PracticeLogEntry {
  date: string;
  practice_type:
    | 'meditation'
    | 'card_study'
    | 'pathworking'
    | 'journal'
    | 'exercise';
  duration_minutes: number;
  quality_rating: number; // 1-5
  notes?: string;
  insights?: string[];
  difficulties?: string[];
}

// ============================================================================
// PERSONALIZATION AND AI FEATURES
// ============================================================================

export interface PersonalizationFactors {
  emphasized_cards?: string[];
  optimal_practice_timing?: {
    best_meditation_times: string[];
    pathworking_windows: string[];
    avoided_periods: string[];
    enhanced_practices: string[];
  };
  pace_adjustment: PaceLevel;
  emphasis_areas: string[];
  support_level: SupportLevel;
  birth_chart_integration?: {
    sun_sign_focus: string[];
    moon_phase_timing: string[];
    planetary_correspondences: Record<string, string>;
  };
}

export interface PersonalizedCurriculum {
  base_pathway: PathwayData;
  personalization: PersonalizationFactors;
  adaptive_elements: {
    pace_adjustment: PaceLevel;
    emphasis_areas: string[];
    support_level: SupportLevel;
  };
  safety_monitoring: {
    required_check_ins: 'daily' | 'weekly' | 'bi_weekly';
    red_flag_monitoring: boolean;
    mentor_alerts: boolean;
  };
}

// ============================================================================
// EVALUATION AND FEEDBACK
// ============================================================================

export interface LessonResponse {
  written_response?: string;
  practice_log?: Record<string, any>;
  meditation_notes?: string;
  insights?: string[];
  questions?: string[];
  completion_time?: number;
  difficulty_rating?: number; // 1-5
}

export interface LessonEvaluation {
  completion_score: number;
  depth_score: number;
  safety_score: number;
  readiness_for_next: boolean;
  feedback: string[];
  areas_for_improvement: string[];
  strengths_identified: string[];
  ai_insights?: string[];
  traditional_alignment?: number; // How well aligned with traditional teachings
}

export interface ProgressAnalytics {
  overall_progress: {
    pathway_level: SpiritualLevel;
    weeks_completed: number;
    mastery_percentage: number;
    next_milestone: string;
  };
  learning_analytics: {
    consistency_score: number;
    depth_progression:
      | 'declining'
      | 'stable'
      | 'steady_growth'
      | 'accelerating';
    safety_indicators: 'concerning' | 'needs_attention' | 'good' | 'all_green';
    traditional_alignment: 'poor' | 'fair' | 'good' | 'excellent';
  };
  personalized_recommendations: string[];
  ai_insights: string[];
}

// ============================================================================
// SAFETY AND TRADITIONAL PROTOCOLS
// ============================================================================

export interface SafetyProtocols {
  ethical_foundation: {
    required_understanding: string[];
    warning_signs: string[];
    corrective_actions: string[];
  };
  meditation_safety: {
    preparation_requirements: string[];
    session_protocols: string[];
    emergency_procedures: string[];
  };
  pathworking_safety: {
    prerequisite_mastery: string[];
    traditional_protections: string[];
    warning_indicators: string[];
  };
}

export interface SafetyAssessment {
  user_id: string;
  safety_score: number;
  ethical_grounding: boolean;
  emotional_stability: boolean;
  practice_balance: boolean;
  warning_signs: string[];
  recommendations: string[];
  clearance_level:
    | 'basic'
    | 'intermediate_approved'
    | 'advanced_cleared'
    | 'master_level';
  next_safety_check: string;
}

// ============================================================================
// MOBILE EDUCATION FEATURES
// ============================================================================

export interface MobileLesson {
  lesson_type: 'micro' | 'standard' | 'extended';
  duration: number;
  components: string[];
  interaction_methods: string[];
  assessment_type:
    | 'swipe_response'
    | 'voice_input'
    | 'tap_selection'
    | 'draw_response';
  mobile_features: {
    haptic_feedback?: boolean;
    voice_guidance?: boolean;
    ar_visualization?: boolean;
    offline_capability?: boolean;
  };
}

export interface MobileFeatures {
  micro_lessons: {
    duration_target: string;
    swipe_interactions: boolean;
    voice_guided_meditations: boolean;
    haptic_feedback: boolean;
  };
  interactive_elements: {
    tap_to_reveal_correspondences: boolean;
    ar_tree_of_life_overlay: boolean;
    card_flip_animations: boolean;
    hebrew_letter_tracing: boolean;
  };
  push_notifications: {
    daily_card_reminders: boolean;
    astrological_practice_alerts: boolean;
    full_moon_sephirot_alignment: boolean;
    mentor_check_in_prompts: boolean;
  };
  biometric_security: {
    secure_journal_access: boolean;
    practice_log_protection: boolean;
    spiritual_progress_privacy: boolean;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SpiritualEducationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  timestamp: string;
  details?: string;
}

export interface PathwaysResponse {
  pathways: Record<string, Omit<PathwayData, 'weeks'>>;
  total_pathways: number;
  total_curriculum_weeks: number;
}

export interface WeekOverview {
  pathway: SpiritualLevel;
  week_number: number;
  theme: string;
  learning_objectives: string[];
  lessons_count: number;
  practical_exercises: PracticalExercise[];
  assessments: SpiritualAssessment[];
  progression_criteria: Record<string, number>;
  traditional_safeguards: string[];
  estimated_time_commitment: string;
}

export interface HealthStatus {
  education_engine: 'operational' | 'degraded' | 'offline';
  mobile_education: 'operational' | 'degraded' | 'offline';
  analytics_engine: 'operational' | 'degraded' | 'offline';
  curriculum_data: 'loaded' | 'loading' | 'error';
  safety_protocols: 'active' | 'inactive' | 'error';
  pathways_available: number;
  total_weeks: number;
  grok_response_3: 'implemented' | 'partial' | 'pending';
  traditional_authenticity:
    | 'golden_dawn_compliant'
    | 'modern_adaptation'
    | 'uncertain';
}

// ============================================================================
// CURRICULUM METADATA
// ============================================================================

export interface CurriculumMetadata {
  total_weeks: 52;
  pathways: {
    beginner: { weeks: [1, 4]; focus: 'foundational_learning' };
    intermediate: { weeks: [5, 12]; focus: 'depth_building' };
    advanced: { weeks: [13, 26]; focus: 'synthesis_mastery' };
    master: { weeks: [27, 52]; focus: 'teaching_preparation' };
  };
  traditional_sources: string[];
  safety_requirements: string[];
  ai_features: string[];
  mobile_optimizations: string[];
}

// ============================================================================
// HOOK INTEGRATION TYPES
// ============================================================================

export interface UseSpiritualEducation {
  // Assessment methods
  assessLevel: {
    data: SpiritualAssessmentResult | null;
    loading: boolean;
    error: string | null;
    assess: (userData: UserAssessmentData) => Promise<void>;
  };

  // Curriculum management
  curriculum: {
    data: PersonalizedCurriculum | null;
    loading: boolean;
    error: string | null;
    generate: (
      assessment: SpiritualAssessmentResult,
      birthChart?: any
    ) => Promise<void>;
  };

  // Lesson management
  lessons: {
    currentLesson: SpiritualLesson | null;
    loading: boolean;
    error: string | null;
    getLesson: (
      pathway: SpiritualLevel,
      week: number,
      lesson: number
    ) => Promise<void>;
    submitCompletion: (
      lessonId: string,
      response: LessonResponse
    ) => Promise<LessonEvaluation>;
  };

  // Progress tracking
  progress: {
    data: ProgressAnalytics | null;
    loading: boolean;
    error: string | null;
    refresh: (userId: string) => Promise<void>;
  };

  // Mobile features
  mobile: {
    dailyLesson: MobileLesson | null;
    loading: boolean;
    error: string | null;
    generateDaily: (
      userLevel: SpiritualLevel,
      minutes: number
    ) => Promise<void>;
  };

  // Safety monitoring
  safety: {
    assessment: SafetyAssessment | null;
    loading: boolean;
    error: string | null;
    checkSafety: (userId: string, recentData: any) => Promise<void>;
  };
}

export interface SpiritualEducationContextValue extends UseSpiritualEducation {
  // Additional context methods
  pathways: Record<string, Omit<PathwayData, 'weeks'>> | null;
  healthStatus: HealthStatus | null;
  metadata: CurriculumMetadata | null;

  // Utility methods
  getPathwayInfo: () => Promise<void>;
  checkHealth: () => Promise<void>;
  resetProgress: () => void;
}

// ============================================================================
// TRADITIONAL CORRESPONDENCE TYPES (Integration with existing spiritual.py)
// ============================================================================

export interface TraditionalCorrespondence {
  hebrew_letter: string;
  tree_path: number;
  astrological_correspondence: string;
  traditional_meaning: string;
  golden_dawn_source: boolean;
  meditation_focus: string[];
}

export interface SephiraEducationalData {
  name: string;
  hebrew: string;
  meaning: string;
  position: number;
  traditional_correspondence: string;
  meditation_practice: string;
  educational_focus: string[];
  safety_considerations: string[];
}

// ============================================================================
// NOTE: All types are already exported at their definition points above
// No need for duplicate export declarations
// ============================================================================

// Default export for convenience
export default UseSpiritualEducation;
