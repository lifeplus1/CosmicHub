/**
 * API Type Definitions
 *
 * This file contains comprehensive type definitions for API requests and responses,
 * including discriminated unions and branded types for improved type safety.
 */

import type { ChartBirthData } from '@cosmichub/types';

/**
 * Branded Types for IDs - prevents confusing different ID types
 */
export type UserId = string & { readonly __brand: 'UserId' };
export type ChartId = string & { readonly __brand: 'ChartId' };

// Type guards for branded types
export const isUserId = (value: string): value is UserId => 
  typeof value === 'string' && value.length > 0;
export const isChartId = (value: string): value is ChartId => 
  typeof value === 'string' && value.length > 0;

/**
 * Planet and zodiac type definitions
 */
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

export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export type AspectType =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'
  | 'quincunx'
  | 'semisextile';

export type InterpretationType = 'natal' | 'transit' | 'synastry' | 'composite';

export type InterpretationFocusArea =
  | 'personality'
  | 'career'
  | 'relationships'
  | 'life_purpose'
  | 'challenges'
  | 'strengths'
  | 'current_cycle'
  | 'future_trends'
  | 'spiritual_growth';

export type InterpretationCategory =
  | 'sun_sign'
  | 'moon_sign'
  | 'rising_sign'
  | 'planets'
  | 'houses'
  | 'aspects'
  | 'elements'
  | 'modalities'
  | 'patterns'
  | 'transits';

/**
 * API Response Status Union Type - ensures exhaustive handling of responses
 */
export type ApiResponseStatus = 
  | 'success' 
  | 'error' 
  | 'validation_error' 
  | 'not_found' 
  | 'unauthorized' 
  | 'forbidden' 
  | 'server_error';

/**
 * Base API Response with metadata
 */
export interface ApiResponseBase {
  status: ApiResponseStatus;
  message?: string;
  timestamp: string;
  requestId?: string;
  version?: string;
}

/**
 * Base interface for successful responses
 */
export interface ApiSuccessResponse<T> extends ApiResponseBase {
  status: 'success';
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  };
}

/**
 * Base interface for error responses
 */
export interface ApiErrorResponse extends ApiResponseBase {
  status: Exclude<ApiResponseStatus, 'success'>;
  error: {
    message: string;
    details?: Record<string, unknown>;
    stack?: string; // Only included in development
  };
}

/**
 * Specific error response types
 */
export interface ValidationErrorResponse {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: Record<string, string[]>;
  };
}

export interface NotFoundErrorResponse {
  error: {
    code: 'NOT_FOUND';
    message: string;
    details: {
      resource: string;
      id: string;
    };
  };
}

export interface UnauthorizedErrorResponse extends ApiResponseBase {
  error: {
    code: 'UNAUTHORIZED';
    message: string;
  };
}

export interface ForbiddenErrorResponse extends ApiResponseBase {
  error: {
    code: 'FORBIDDEN';
    message: string;
  };
}

export interface ServerErrorResponse extends ApiResponseBase {
  error: {
    code: 'SERVER_ERROR';
    message: string;
    details?: {
      errorId: string;
    };
  };
}

export interface GenericErrorResponse extends ApiResponseBase {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Specialized response types
 */
export interface PartialSuccessResponse<T> extends ApiResponseBase {
  data: Partial<T>;
  error?: {
    code: string;
    message: string;
    failedFields: string[];
  };
}

export interface CachedResponse<T> extends ApiSuccessResponse<T> {
  data: T;
  meta: {
    cachedAt: string;
    ttl: number;
    source: 'memory' | 'redis' | 'filesystem';
  };
}

/**
 * Type guards for response types
 */

export function isErrorResponse<T>(
  response: ApiResponse<T>
): response is ApiErrorResponse {
  return [
    'error',
    'validation_error',
    'not_found',
    'unauthorized',
    'forbidden',
    'server_error',
  ].includes(response.status);
}

// Convenience helper when only status string is available

/**
 * Union type of all possible API responses
 */

// Consolidated all response types above

/**
 * Chart Types with Improved Type Safety
 */

export interface Planet {
  position: number; // Degree in zodiac (0-360)
  sign: ZodiacSign;
  house: number;
  retrograde: boolean;
  speed: number; // Degrees per day
  dignity?: 'domicile' | 'exaltation' | 'fall' | 'detriment';
  essential_dignity?: number; // Score from -5 to +5
}

export interface House {
  cusp: number; // Degree position (0-360)
  sign: ZodiacSign;
}

export interface Aspect {
  planet1: PlanetName;
  planet2: PlanetName;
  orb: number;
  applying: boolean;
  exact: boolean;
  power?: number; // Strength of the aspect (0-1)
}

export interface ChartAngles {
  ascendant: number;
  midheaven: number;
  descendant: number;
  imumcoeli: number;
  vertex?: number;
  antivertex?: number; // Add antivertex
  part_of_fortune?: number;
}

export interface ChartData {
  planets: Record<PlanetName, Planet>;
  houses: House[];
  aspects: Aspect[];
  asteroids?: Record<string, Planet>; // Add optional asteroids field
  points?: Record<string, Planet>; // Add optional points field (lunar nodes, lilith, etc.)
  angles: ChartAngles;
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  house_system:
    | 'placidus'
    | 'koch'
    | 'equal'
    | 'whole_sign'
    | 'regiomontanus'
    | 'campanus'
    | 'porphyry';
  sidereal?: {
    ayanamsa: 'lahiri' | 'raman' | 'krishnamurti' | 'fagan_bradley';
    offset: number;
  };
}

/**
 * Chart API Types
 */
export interface Chart {
  id: ChartId;
  user_id: UserId;
  name: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  chart_type: string;
  created_at: string;
  updated_at: string;
  birth_data: ChartBirthData;
  chart_data: ChartData;
}

export interface ChartListResponse {
  charts: Chart[];
  total: number;
}
}

  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  house_system?: string;
  chart_name?: string;
  timezone?: string;
  lat?: number;
  lon?: number;
}

  message: string;
  chart_data: ChartData;
}

/**
 * Interpretation Types with Enhanced Type Safety
 */

  content: string;
  category: InterpretationCategory;
  confidence: number; // 0-1 confidence score
  sources?: string[];
  aspectsAnalyzed?: Aspect[];
  planetsAnalyzed?: PlanetName[];
  housesAnalyzed?: number[];
}

  chartId: ChartId;
  userId: UserId;
  type: InterpretationType;
  title: string;
  sections: InterpretationSection[];
  summary: string;
  focus_areas: InterpretationFocusArea[];
  tags: string[];
  confidence: number; // Overall confidence score (0-1)
  metadata: {
    chart_date: string;
    chart_location?: string;
    interpretation_method: 'ai' | 'traditional' | 'modern' | 'hybrid';
    techniques_used: string[];
    version: string;
  };
  createdAt: string;
  updatedAt: string;
}

  userId: UserId;
  type: InterpretationType;
  focus_areas: InterpretationFocusArea[];
  categories?: InterpretationCategory[];
  question?: string;
  options?: {
    max_sections?: number;
    min_confidence?: number;
    include_sources?: boolean;
    technique_preference?: 'traditional' | 'modern' | 'hybrid';
    language_style?: 'technical' | 'casual' | 'metaphorical';
  };
}

    processing_time: number;
    techniques_used: string[];
    data_sources: string[];
  };
}

/**
 * Auth Types
 */
  'Content-Type': string;
}

/**
 * Error Types - Strongly typed error hierarchy
 */

export class AuthenticationError extends ApiError {
  constructor(
    message = 'Authentication failed',
    details?: Record<string, unknown>
  ) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id: string, details?: Record<string, unknown>) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, validationErrors: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 422, { validationErrors });
    this.name = 'ValidationError';
  }
}
