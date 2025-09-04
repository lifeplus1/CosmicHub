/**
 * SPIRITUAL-001 Week 2 - Grok Response #4 TypeScript Interfaces
 * ============================================================
 *
 * TypeScript interfaces for authentic spiritual practice methods:
 * - Tree of Life pathworking sessions
 * - Tarot meditation practices
 * - Hebrew letter contemplation
 * - Daily spiritual routines
 * - Safety protocols and monitoring
 *
 * Provides full type safety for spiritual practices integration.
 */

// Core spiritual practice types
export type SpiritualLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'master';
export type PracticeType =
  | 'pathworking'
  | 'tarot_meditation'
  | 'hebrew_contemplation'
  | 'daily_routine'
  | 'grounding'
  | 'protection'
  | 'banishing';
export type SafetyStatus = 'cleared' | 'caution' | 'restricted' | 'emergency';
export type PathworkingType =
  | 'visualization'
  | 'correspondence'
  | 'invocation'
  | 'full_ritual';
export type TarotMeditationType = 'daily' | 'journey' | 'correspondence';
export type CompletionQuality = 'full' | 'partial' | 'interrupted';

// Tree of Life Path Correspondences
export interface PathCorrespondence {
  path_number: number;
  from_sephirah: string;
  to_sephirah: string;
  hebrew_letter: string;
  tarot_card: string;
  color: string;
  element: string;
  visualization_tip: string;
  safety_note: string;
  frequency_hz?: number;
  duration_minutes: number;
  prerequisite_level: SpiritualLevel;
  difficulty: SpiritualLevel;
}

// Hebrew Letter Data
export interface HebrewLetterData {
  letter: string;
  name: string;
  pronunciation: string;
  gematria: number;
  meaning: string;
  element?: string;
  planet?: string;
  tarot?: string;
  meditation_focus: string;
  meditation_time: number;
  correspondences: string[];
  safety_level: 'low_risk' | 'moderate_risk' | 'high_risk' | 'protected_only';
}

// Practice Readiness Assessment
export interface PracticeReadinessRequest {
  practice_type: PracticeType;
  level: SpiritualLevel;
  session_details?: Record<string, unknown>;
}

export interface PracticeReadinessAssessment {
  ready: boolean;
  checks: {
    grounding_experience: boolean;
    meditation_foundation: boolean;
    safety_knowledge: boolean;
    progression_appropriate: boolean;
  };
  recommendations: string[];
  estimated_preparation_days: number;
  safety_protocols?: SafetyProtocol;
}

export interface SafetyProtocol {
  name: string;
  required_level: SpiritualLevel;
  prerequisites: string[];
  preparation_steps: string[];
  protection_methods: string[];
  warning_signs: string[];
  emergency_procedures: string[];
  grounding_techniques: string[];
}

// Pathworking Session
export interface PathworkingSessionRequest {
  path_number: number;
  user_level: SpiritualLevel;
  session_duration?: number;
  session_type?: PathworkingType;
}

export interface PathworkingSession {
  path_info: {
    number: number;
    from: string;
    to: string;
    hebrew_letter: string;
    tarot_correspondence: string;
    color: string;
    element: string;
  };
  preparation: PreparationPhase;
  meditation_script: MeditationScript;
  binaural_frequency?: number;
  safety_notes: string[];
  integration: IntegrationPhase;
  estimated_duration: number;
  difficulty_level: SpiritualLevel;
  safety_check?: SafetyCheckResult;
  emergency_protocol?: EmergencyProtocol;
  mobile_guidance?: MobileGuidance;
}

export interface PreparationPhase {
  duration_minutes: number;
  steps: string[];
  safety_reminders: string[];
}

export interface MeditationScript {
  duration_minutes: number;
  script_steps: string[];
  safety_note: string;
  level_specific_guidance: string[];
}

export interface IntegrationPhase {
  duration_minutes: number;
  steps: string[];
  banishing: string[];
}

export interface MobileGuidance {
  preparation_checklist: Array<{
    step: string;
    completed: boolean;
  }>;
  audio_cues: {
    binaural_frequency: number;
    voice_guidance: boolean;
    background_sounds: string;
  };
  integration_prompts: string[];
}

// Tarot Meditation
export interface TarotMeditationRequest {
  meditation_type: TarotMeditationType;
  user_level: SpiritualLevel;
  card_preference?: string;
  focus_area?: 'general' | 'relationships' | 'career' | 'spiritual';
}

export interface TarotMeditation {
  card: string;
  meditation_type: TarotMeditationType;
  preparation: TarotPreparation;
  meditation_guide: TarotMeditationGuide;
  tree_of_life_connection?: string;
  integration_prompts: string[];
  duration_minutes: number;
  safety_notes: string[];
  ai_personalization?: PersonalizedInterpretation;
  mobile_features?: TarotMobileFeatures;
}

export interface TarotPreparation {
  duration_minutes: number;
  steps: string[];
}

export interface TarotMeditationGuide {
  phases: {
    observation: PhaseGuide;
    contemplation: PhaseGuide;
    integration: PhaseGuide;
  };
  advanced_work?: AdvancedTarotWork;
}

export interface PhaseGuide {
  duration_minutes: number;
  instructions: string[];
}

export interface AdvancedTarotWork {
  hebrew_correspondence: string;
  astrological_timing: string;
  kabbalistic_placement: string;
  teaching_applications: string;
}

export interface TarotMobileFeatures {
  card_image_url: string;
  audio_pronunciation: string;
  interactive_elements: {
    tap_to_reveal: boolean;
    swipe_navigation: boolean;
    voice_notes: boolean;
  };
  daily_integration: {
    morning_reflection: string;
    evening_review: string;
    weekly_synthesis: string;
  };
}

export interface PersonalizedInterpretation {
  user_context: Record<string, string | number | boolean | string[] | number[]>;
  personalized_message: string;
  practical_applications: string[];
  timing_guidance: string;
}

// Hebrew Letter Contemplation
export interface HebrewLetterRequest {
  letter: string;
  user_level: SpiritualLevel;
  include_gematria?: boolean;
  study_focus?: 'meaning' | 'pronunciation' | 'correspondences' | 'meditation';
}

export interface HebrewLetterSession {
  letter: string;
  pronunciation: string;
  meaning: string;
  preparation: string[];
  contemplation_guide: HebrewContemplationGuide;
  gematria_work?: GematriaExercise;
  correspondences: string[];
  meditation_duration: number;
  safety_protocol: SafetyProtocol;
  integration: string[];
  cultural_respect?: CulturalRespectGuidance;
  mobile_features?: HebrewMobileFeatures;
  gematria_simplified?: SimplifiedGematria;
}

export interface HebrewContemplationGuide {
  visual: PhaseGuide;
  auditory: PhaseGuide;
  contemplative: PhaseGuide;
}

export interface GematriaExercise {
  base_value: number;
  calculation_exercises: string[];
  meditation_prompts: string[];
}

export interface CulturalRespectGuidance {
  tradition_honor: string[];
  pronunciation_guide: {
    audio_available: boolean;
    phonetic_guide: string;
    practice_recommendation: string;
  };
  safety_guidelines: string[];
}

export interface HebrewMobileFeatures {
  letter_display: {
    large_font: boolean;
    right_to_left: boolean;
    pronunciation_audio: string;
    meaning_animation: boolean;
  };
  gematria_calculator: {
    interactive: boolean;
    personal_name_calculation: boolean;
    number_meditation_timer: boolean;
  };
  practice_timer: {
    recommended_duration: number;
    gentle_chimes: boolean;
    grounding_reminder: boolean;
  };
}

export interface SimplifiedGematria {
  basic_value: number;
  simple_exercises: string[];
  advanced_note: string;
}

// Daily Spiritual Routine
export interface DailyRoutineRequest {
  user_level: SpiritualLevel;
  available_time: number; // minutes per day
  spiritual_goals: string[];
  lifestyle_constraints?: {
    time_available_minutes?: number;
    environment?: string;
    physical_limitations?: string[];
    equipment_access?: string[];
  [key: string]: string | number | string[] | undefined;
  };
  focus_areas?: string[];
}

export interface DailyRoutine {
  level: SpiritualLevel;
  morning_practice: PracticeBlock;
  evening_practice: PracticeBlock;
  completion_status: CompletionStatus;
  insights: string[];
  next_progression?: string;
  timestamp: string;
  lifestyle_adaptations?: LifestyleAdaptations;
  progress_tracking?: ProgressTracking;
  mobile_optimization?: MobileOptimization;
}

export interface PracticeBlock {
  duration: number;
  practices: string[];
  timing?: string;
}

export interface CompletionStatus {
  morning_complete: boolean;
  evening_complete: boolean;
  insights_journaled: boolean;
}

export interface LifestyleAdaptations {
  busy_schedule: {
    micro_practices: string[];
    integration_tips: string[];
  };
  travel_modifications: {
    portable_practices: string[];
    timezone_adjustments: string;
  };
}

export interface ProgressTracking {
  daily_checkpoints: Array<{
    practice: string;
    points: number;
  }>;
  weekly_goals: string[];
  advancement_milestones: {
    consistency_streak: string;
    depth_development: string;
    safety_maintenance: string;
  };
}

export interface MobileOptimization {
  notification_schedule: {
    morning_reminder: string;
    midday_check: string;
    evening_prompt: string;
  };
  quick_access: {
    widget_practices: string[];
    offline_content: boolean;
    progress_widgets: boolean;
  };
  community_features: {
    practice_sharing: string;
    group_challenges: string;
    mentor_check_ins: string;
  };
}

// Safety and Monitoring
export interface SafetyCheckRequest {
  practice_session: {
    type: PracticeType;
    level: SpiritualLevel;
    duration: number;
    preparation_complete: boolean;
    protection_invoked: boolean;
  };
  current_state: {
    grounded: boolean;
    recent_adverse_effects: string[];
    sleep_quality: 'good' | 'fair' | 'poor';
    stress_level: number; // 1-10
  };
}

export interface SafetyCheckResult {
  safe_to_proceed: boolean;
  warnings: string[];
  requirements: string[];
  emergency_contacts: string[];
  state_assessment?: StateAssessment;
  recommendations?: string[];
  emergency_protocols?: EmergencyProtocols;
  support_resources?: SupportResources;
  follow_up?: FollowUpGuidance;
}

export interface StateAssessment {
  grounding_status: 'good' | 'needs_attention';
  readiness_indicators: {
    sleep_quality: 'good' | 'fair' | 'poor' | 'unknown';
    stress_level: number;
    recent_practice_effects: string[];
  };
}

export interface EmergencyProtocol {
  immediate_grounding: string[];
  support_contact: string;
}

export interface EmergencyProtocols {
  immediate_grounding: string[];
  emotional_regulation: string[];
  when_to_seek_help: string[];
}

export interface SupportResources {
  spiritual_emergency_guidance: string;
  community_support: string;
  professional_referrals: string;
}

export interface FollowUpGuidance {
  check_in_hours: number;
  next_practice_minimum_wait: number;
}

// Practice Session Management
export interface StartSessionRequest {
  practice_type: PracticeType;
  session_content: Record<string, unknown>;
  level: SpiritualLevel;
  estimated_duration: number;
}

export interface SessionStartResponse {
  status: 'success';
  session_id: string;
  practice_type: PracticeType;
  level: SpiritualLevel;
  estimated_duration: number;
  monitoring: {
    safety_check_interval: number;
    auto_timeout: number;
    emergency_contact: boolean;
  };
  session_guidance: {
    preparation_complete: boolean;
    protection_invoked: boolean;
    grounding_verified: boolean;
    intention_set: boolean;
  };
}

export interface CompleteSessionRequest {
  insights: string[];
  adverse_effects?: string[];
  completion_quality: CompletionQuality;
  integration_plan?: string[];
}

export interface SessionCompletionSummary {
  status: 'completed_successfully' | 'completed_with_concerns';
  session_id: string;
  duration_minutes?: number;
  insights_recorded?: number;
  next_practice_available?: string;
  progress_tracking?: SessionProgress;
  integration_suggestions?: string[];
  immediate_action_required?: boolean;
  grounding_protocol?: string[];
  recommendation?: string;
  integration_support?: IntegrationSupport;
  progress_update?: ProgressUpdate;
}

export interface SessionProgress {
  completion_rate: string;
  insights_quality: 'rich' | 'moderate' | 'minimal';
  safety_maintained: boolean;
  level_appropriate: boolean;
  readiness_for_advancement: boolean;
}

export interface IntegrationSupport {
  immediate_actions: string[];
  follow_up_care: string[];
  progress_tracking: {
    insights_recorded: number;
    practice_consistency: string;
    advancement_readiness: string;
  };
}

export interface ProgressUpdate {
  progress_summary: string;
  ai_insights: string;
  achievements_unlocked: string[];
  next_recommendations: string[];
  estimated_advancement: string;
}

// Progress Tracking
export interface UserProgress {
  user_id: string;
  safety_status: UserSafetyStatus;
  progress_insights: ProgressInsights;
  practice_summary: PracticeSummary;
  recommendations: string[];
}

export interface UserSafetyStatus {
  overall_status: 'safe' | 'caution' | 'restricted';
  recent_sessions: number;
  concerns: string[];
  recommendations: string[];
}

export interface ProgressInsights {
  consistency_analysis: {
    total_sessions: number;
    total_hours: number;
    average_session_quality: string;
    practice_streak: string;
  };
  development_areas: {
    strengths: string[];
    growth_opportunities: string[];
    recommended_focus: string;
  };
  advancement_status: {
    current_level: SpiritualLevel;
    next_level_progress: string;
    estimated_advancement: string;
  };
}

export interface PracticeSummary {
  level: SpiritualLevel;
  total_experience: string;
  sessions_completed: number;
  safety_record: 'Good' | 'Needs attention';
}

// API Response Types
export interface SpiritualPracticeResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface PathworkingResponse
  extends SpiritualPracticeResponse<PathworkingSession> {
  session_id: string;
  estimated_duration: number;
  traditional_notes: {
    source: string;
    authenticity: string;
    respect: string;
  };
}

export interface TarotMeditationResponse
  extends SpiritualPracticeResponse<TarotMeditation> {
  session_id: string;
  focus_area: string;
  traditional_notes: {
    approach: string;
    integration: string;
    progression: string;
  };
}

export interface HebrewLetterResponse
  extends SpiritualPracticeResponse<HebrewLetterSession> {
  session_id: string;
  study_focus: string;
  traditional_context: {
    source_tradition: string;
    learning_approach: string;
    community_connection: string;
  };
}

export interface DailyRoutineResponse
  extends SpiritualPracticeResponse<DailyRoutine> {
  routine_id: string;
  personalization: {
    level: SpiritualLevel;
    daily_time: number;
    focus_areas: string[];
    goals: string[];
  };
  implementation_guide: {
    week_1: string;
    week_2: string;
    week_3: string;
    week_4: string;
  };
}

export interface SafetyCheckResponse
  extends SpiritualPracticeResponse<SafetyCheckResult> {
  response_type: 'safety_check'; // discriminator to avoid empty extension
}

export interface SessionCompletionResponse
  extends SpiritualPracticeResponse<SessionCompletionSummary> {
  next_session_available: string;
  celebration: string;
}

// Resource Types
export interface TreePathsResource {
  status: 'success';
  paths: Record<number, PathCorrespondence>;
  total_paths: number;
  progression_guide: {
    beginner: string;
    intermediate: string;
    advanced: string;
    master: string;
  };
}

export interface HebrewLettersResource {
  status: 'success';
  letters: Record<string, HebrewLetterData>;
  total_letters: number;
  study_progression: {
    beginner: string;
    intermediate: string;
    advanced: string;
    master: string;
  };
  cultural_notes: {
    respect: string;
    pronunciation: string;
    tradition: string;
  };
}

// Utility Types
export type SpiritualPracticeEndpoint =
  | '/assess-readiness'
  | '/pathworking/generate'
  | '/tarot/meditation'
  | '/hebrew/contemplation'
  | '/daily-routine/generate'
  | '/safety-check'
  | '/session/start'
  | '/session/:sessionId/complete'
  | '/progress/:userId'
  | '/resources/paths'
  | '/resources/hebrew-letters';

// Component Props Types
export interface SpiritualPracticeComponentProps {
  userId: string;
  level: SpiritualLevel;
  onSessionComplete?: (result: SessionCompletionSummary) => void;
  onSafetyAlert?: (alert: SafetyCheckResult) => void;
}

export interface PathworkingComponentProps
  extends SpiritualPracticeComponentProps {
  pathNumber?: number;
  sessionType?: PathworkingType;
  duration?: number;
}

export interface TarotMeditationComponentProps
  extends SpiritualPracticeComponentProps {
  meditationType?: TarotMeditationType;
  cardPreference?: string;
  focusArea?: string;
}

export interface HebrewLetterComponentProps
  extends SpiritualPracticeComponentProps {
  letter?: string;
  includeGematria?: boolean;
  studyFocus?: string;
}

export interface DailyRoutineComponentProps
  extends SpiritualPracticeComponentProps {
  availableTime?: number;
  spiritualGoals?: string[];
  lifestyleConstraints?: {
    timeAvailableMinutes?: number;
    environment?: string;
    physicalLimitations?: string[];
    equipmentAccess?: string[];
  [key: string]: string | number | string[] | undefined;
  };
}

// Hook Return Types
export interface UseSpiritualPracticesResult {
  // Practice generation
  generatePathworking: (
    request: PathworkingSessionRequest
  ) => Promise<PathworkingResponse>;
  generateTarotMeditation: (
    request: TarotMeditationRequest
  ) => Promise<TarotMeditationResponse>;
  generateHebrewSession: (
    request: HebrewLetterRequest
  ) => Promise<HebrewLetterResponse>;
  generateDailyRoutine: (
    request: DailyRoutineRequest
  ) => Promise<DailyRoutineResponse>;

  // Safety and monitoring
  assessReadiness: (
    request: PracticeReadinessRequest
  ) => Promise<PracticeReadinessAssessment>;
  performSafetyCheck: (
    request: SafetyCheckRequest
  ) => Promise<SafetyCheckResponse>;

  // Session management
  startSession: (request: StartSessionRequest) => Promise<SessionStartResponse>;
  completeSession: (
    sessionId: string,
    request: CompleteSessionRequest
  ) => Promise<SessionCompletionResponse>;

  // Progress tracking
  getProgress: (userId: string) => Promise<UserProgress>;

  // Resources
  getTreePaths: () => Promise<TreePathsResource>;
  getHebrewLetters: () => Promise<HebrewLettersResource>;

  // State
  loading: boolean;
  error: string | null;
  activeSession: SessionStartResponse | null;
}

// All types are already exported above through direct export statements
// No additional export block needed to avoid conflicts
