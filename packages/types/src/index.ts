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

// Aspect types for calculations
export type AspectType =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'
  | 'quincunx'
  | 'semi-sextile'
  | 'semi-square'
  | 'sesquiquadrate';

export interface AspectDefinition {
  name: AspectType;
  angle: number;
  orb: number;
  energy: 'harmonious' | 'challenging' | 'neutral';
  significance: 'major' | 'minor';
}

// Planet types
export type PlanetName =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'chiron'
  | 'north_node'
  | 'south_node';

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

// Export all types - chart, user, subscription, and experiment types
export * from './astrology.types.js';
export * from './serialize.js';
export * from './type-guards.js';
export * from './utility.js';
export * from './experiments.js';
export * from './experiment-validators.js';
