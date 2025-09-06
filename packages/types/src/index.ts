// Import types needed for local interfaces
import type { AspectType } from './astrology.types';

// Export all backend types for type bridge system
export * from './backend-types';

// Core types for birth data and date ranges
export interface BirthData {
  birth_date: string; // ISO format: YYYY-MM-DD
  birth_time: string; // HH:MM:SS
  latitude: number;
  longitude: number;
  timezone?: string;
  city?: string;
}

export * from './birth';

export interface DateRange {
  startDate: string; // ISO format: YYYY-MM-DD
  endDate: string; // ISO format: YYYY-MM-DD
}

// Transit calculation types
export interface TransitResult {
  id: string;
  planet: string;
  aspect: string;
  date: string; // ISO format: YYYY-MM-DD
  degree: number;
  description?: string;
  intensity?: number; // 0-100 scale
  duration?: string;
  energy?:
    | 'positive'
    | 'negative'
    | 'neutral'
    | 'challenging'
    | 'supportive'
    | 'transformative';
  impact?: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface LunarTransitResult {
  phase: string;
  date: string; // ISO format: YYYY-MM-DD
  energy: string;
  degree: number;
  description?: string;
  moonSign?: string;
  intensity?: number;
}

// Batch calculation types
export interface TransitBatchRequest {
  birthData: BirthData;
  dateRange: DateRange;
  includeMinorAspects?: boolean;
  includeRetrogrades?: boolean;
}

export interface LunarTransitBatchRequest {
  birthData: BirthData;
  dateRange: DateRange;
  includeDailyPhases?: boolean;
}

// API Response types
export interface TransitCalculationResponse {
  results: TransitResult[];
  totalCount: number;
  dateRange: DateRange;
  calculatedAt: string;
  cached: boolean;
}

export interface LunarTransitCalculationResponse {
  results: LunarTransitResult[];
  totalCount: number;
  dateRange: DateRange;
  calculatedAt: string;
  cached: boolean;
}

// Error handling types
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface AspectDefinition {
  name: AspectType;
  angle: number;
  orb: number;
  energy: 'harmonious' | 'challenging' | 'neutral';
  significance: 'major' | 'minor';
}

// Lunar phase types
export type LunarPhase =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

export interface LunarPhaseDefinition {
  name: LunarPhase;
  angle: number;
  description: string;
  energy: string;
  duration: number; // in days
}

// Extended types for comprehensive analysis
export interface TransitAnalysisOptions {
  includeRetrogrades: boolean;
  includeMinorAspects: boolean;
  includeAsteroids: boolean;
  orb: number; // degrees
  timeZone: string;
}

export interface LunarAnalysisOptions {
  includeDailyPhases: boolean;
  includeVoidOfCourse: boolean;
  includeMoonSigns: boolean;
  timeZone: string;
}

// Cache and performance types
export interface CacheInfo {
  key: string;
  expiresAt: string;
  hitCount: number;
  lastAccessed: string;
}

export interface PerformanceMetrics {
  calculationTime: number; // milliseconds
  cacheHit: boolean;
  itemsCalculated: number;
  serverLoad: number;
}

// Subscription and feature access types
export interface FeatureAccess {
  transitAnalysis: boolean;
  lunarAnalysis: boolean;
  extendedDateRange: boolean;
  detailedInterpretations: boolean;
  exportCapabilities: boolean;
}

export interface UsageLimits {
  maxCalculationsPerMonth: number;
  maxDateRangeDays: number;
  currentUsage: number;
  resetDate: string;
}

// Export all types - chart, user, subscription, experiment, and psychology types
// Astrology structural entities (Planet, House, Aspect, PlanetData, ChartData, etc.)
// Exposed for consolidated import usage in tests and application modules.
export * from './astrology.types';
export * from './psychology.types';
export * from './psychology-ui.types';
export * from './tcm-systems.types';
export * from './serialize';
export * from './type-guards';
export * from './utility';
export * from './experiments';
export * from './experiment-validators';
export * from './spiritual-education';
export * from './data-flow.types';
// Explicit re-exports for spiritual domains (avoid wildcard collisions)
export type {
  SpiritualLevel as SpiritualPracticeLevel,
  PracticeType,
  SafetyStatus,
  PathworkingSessionRequest,
  PathworkingResponse,
  TarotMeditationRequest,
  TarotMeditationResponse,
  HebrewLetterRequest,
  HebrewLetterResponse,
  DailyRoutineRequest,
  DailyRoutineResponse,
  PracticeReadinessRequest,
  PracticeReadinessAssessment,
  SafetyCheckRequest,
  SafetyCheckResponse,
  StartSessionRequest,
  SessionStartResponse,
  CompleteSessionRequest,
  SessionCompletionResponse,
  UserProgress as SpiritualPracticeUserProgress,
  TreePathsResource,
  HebrewLettersResource,
  UseSpiritualPracticesResult,
} from './spiritual-practices';

// Spiritual AI domain explicit re-exports (avoid enum name collision with practices SpiritualLevel)
export type {
  SpiritualLevel as SpiritualAILevel,
  SynthesisInput,
  SynthesisOutput,
  LearningPath,
  PatternAnalysis,
  UserProfile as SpiritualAIUserProfile,
  CurrentKnowledge,
  CorrespondenceWeight,
  SpiritualPractice,
  DevelopmentCycle,
  SpiritualTiming,
  SpiritualAIService,
  SpiritualSynthesisProps,
  LearningPathProps,
  PatternAnalysisProps,
  SpiritualAIResponse,
  SpiritualAIError,
  SpiritualAIConfig,
  SpiritualInsightUpdate,
  UseSpiritualAI,
} from './spiritual-ai';
