// Core types for transit analysis birth data (textual form)
// NOTE: This differs from the shared ChartBirthData (numeric unified form)
export interface TransitBirthData {
  birth_date: string; // ISO format: YYYY-MM-DD
  birth_time: string; // HH:MM:SS
  latitude: number;
  longitude: number;
  timezone?: string;
  city?: string;
}

export interface DateRange {
  startDate: string; // ISO format: YYYY-MM-DD
  endDate: string; // ISO format: YYYY-MM-DD
}

// Enhanced transit result interface
export interface TransitResult {
  id: string;
  planet: string;
  aspect: string;
  natal_planet: string;
  date: string; // ISO format: YYYY-MM-DD
  degree: number;
  exact_time?: string;
  orb: number;
  intensity: number; // 0-100 scale
  energy: string;
  duration_days: number;
  description?: string;
}

// Enhanced lunar transit result interface
export interface LunarTransitResult {
  phase: string;
  date: string; // ISO format: YYYY-MM-DD
  exact_time: string;
  energy: string;
  degree: number;
  moon_sign: string;
  intensity: number; // 0-100 scale
  description?: string;
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

// Transit analysis options
export interface TransitAnalysisOptions {
  includeMinorAspects?: boolean;
  includeAsteroids?: boolean;
  orb?: number;
}

export interface LunarAnalysisOptions {
  includeVoidOfCourse?: boolean;
  includeDailyPhases?: boolean;
}
