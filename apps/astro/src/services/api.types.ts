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
export type BrandedType<K, T extends string> = K & { __brand: T };

export type ChartId = BrandedType<string, 'ChartId'>;
export type UserId = BrandedType<string, 'UserId'>;
export type InterpretationId = BrandedType<string, 'InterpretationId'>;

// Type guards for branded types
export function isChartId(id: string): id is ChartId {
  return typeof id === 'string' && id.trim().length > 0;
}

export function isUserId(id: string): id is UserId {
  return typeof id === 'string' && id.trim().length > 0;
}

export function isInterpretationId(id: string): id is InterpretationId {
  return typeof id === 'string' && id.trim().length > 0;
}

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
  | 'server_error'
  | 'partial'
  | 'cached';

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
export interface ApiSuccessResponseBase<T> extends ApiResponseBase {
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
export interface ApiErrorResponseBase extends ApiResponseBase {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string; // Only included in development
  };
}

/**
 * Specific error response types
 */
export interface ApiValidationErrorResponse extends ApiErrorResponseBase {
  status: 'validation_error';
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: Record<string, string[]>;
  };
}

export interface ApiNotFoundResponse extends ApiErrorResponseBase {
  status: 'not_found';
  error: {
    code: 'NOT_FOUND';
    message: string;
    details: {
      resource: string;
      id: string;
    };
  };
}

export interface ApiUnauthorizedResponse extends ApiErrorResponseBase {
  status: 'unauthorized';
  error: {
    code: 'UNAUTHORIZED';
    message: string;
  };
}

export interface ApiForbiddenResponse extends ApiErrorResponseBase {
  status: 'forbidden';
  error: {
    code: 'FORBIDDEN';
    message: string;
  };
}

export interface ApiServerErrorResponse extends ApiErrorResponseBase {
  status: 'server_error';
  error: {
    code: 'SERVER_ERROR';
    message: string;
    details?: {
      errorId: string;
    };
  };
}

export interface ApiGenericErrorResponse extends ApiErrorResponseBase {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Specialized response types
 */
export interface ApiPartialResponseType<T> extends ApiResponseBase {
  status: 'partial';
  data: Partial<T>;
  error?: {
    code: string;
    message: string;
    failedFields: string[];
  };
}

export interface ApiCachedResponseType<T> extends ApiResponseBase {
  status: 'cached';
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
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponseBase<T> {
  return response.status === 'success';
}

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
export function isErrorStatus(status: ApiResponseStatus): boolean {
  return [
    'error',
    'validation_error',
    'not_found',
    'unauthorized',
    'forbidden',
    'server_error',
  ].includes(status);
}

export function isValidationError(
  response: ApiResponse<unknown>
): response is ApiValidationErrorResponse {
  return response.status === 'validation_error';
}

export function isNotFoundError(
  response: ApiResponse<unknown>
): response is ApiNotFoundResponse {
  return response.status === 'not_found';
}

export function isUnauthorizedError(
  response: ApiResponse<unknown>
): response is ApiUnauthorizedResponse {
  return response.status === 'unauthorized';
}

export function isForbiddenError(
  response: ApiResponse<unknown>
): response is ApiForbiddenResponse {
  return response.status === 'forbidden';
}

export function isServerError(
  response: ApiResponse<unknown>
): response is ApiServerErrorResponse {
  return response.status === 'server_error';
}

export function isCachedResponse<T>(
  response: ApiResponse<T>
): response is ApiCachedResponseType<T> {
  return response.status === 'cached';
}

export function isPartialResponse<T>(
  response: ApiResponse<T>
): response is ApiPartialResponseType<T> {
  return response.status === 'partial';
}

/**
 * Union type of all possible API responses
 */
export type ApiErrorResponse =
  | ApiValidationErrorResponse
  | ApiNotFoundResponse
  | ApiUnauthorizedResponse
  | ApiForbiddenResponse
  | ApiServerErrorResponse
  | ApiGenericErrorResponse;

export type ApiResponse<T> =
  | ApiSuccessResponseBase<T>
  | ApiErrorResponse
  | ApiPartialResponseType<T>
  | ApiCachedResponseType<T>;

// Consolidated all response types above

/**
 * Chart Types with Improved Type Safety
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

export interface Planet {
  name: PlanetName;
  position: number; // Degree in zodiac (0-360)
  sign: ZodiacSign;
  house: number;
  retrograde: boolean;
  speed: number; // Degrees per day
  dignity?: 'domicile' | 'exaltation' | 'fall' | 'detriment';
  essential_dignity?: number; // Score from -5 to +5
}

export interface House {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  cusp: number; // Degree position (0-360)
  sign: ZodiacSign;
}

export type AspectType =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'
  | 'quincunx'
  | 'semisextile';

export interface Aspect {
  aspect_type: AspectType;
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
  part_of_fortune?: number;
}

export interface ChartData {
  planets: Record<PlanetName, Planet>;
  houses: House[];
  aspects: Aspect[];
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
export interface SavedChart {
  id: ChartId;
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

export interface SavedChartsResponse {
  charts: SavedChart[];
  total: number;
}

export interface SaveChartRequest {
  year: number;
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

export interface SaveChartResponse {
  id: ChartId;
  message: string;
  chart_data: ChartData;
}

/**
 * Interpretation Types with Enhanced Type Safety
 */
export type InterpretationType =
  | 'natal'
  | 'transit'
  | 'synastry'
  | 'composite'
  | 'solar_return'
  | 'progression'
  | 'solar_arc'
  | 'lunar_return'
  | 'draconic';

export type InterpretationFocusArea =
  | 'personality'
  | 'relationships'
  | 'career'
  | 'health'
  | 'spirituality'
  | 'finances'
  | 'family'
  | 'education'
  | 'life_purpose'
  | 'challenges';

export type InterpretationCategory =
  | 'planets'
  | 'houses'
  | 'aspects'
  | 'patterns'
  | 'elements'
  | 'modalities'
  | 'transits'
  | 'progressions';

export interface InterpretationSection {
  title: string;
  content: string;
  category: InterpretationCategory;
  confidence: number; // 0-1 confidence score
  sources?: string[];
  aspectsAnalyzed?: Aspect[];
  planetsAnalyzed?: PlanetName[];
  housesAnalyzed?: number[];
}

export interface Interpretation {
  id: InterpretationId;
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

export interface InterpretationRequest {
  chartId: ChartId;
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

export interface InterpretationResponse
  extends ApiSuccessResponseBase<Interpretation[]> {
  meta: {
    total: number;
    processing_time: number;
    techniques_used: string[];
    data_sources: string[];
  };
}

/**
 * Auth Types
 */
export interface AuthHeaders {
  Authorization: string;
  'Content-Type': string;
}

/**
 * Error Types - Strongly typed error hierarchy
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

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

export class ForbiddenError extends ApiError {
  constructor(message = 'Access forbidden', details?: Record<string, unknown>) {
    super(message, 'FORBIDDEN', 403, details);
    this.name = 'ForbiddenError';
  }
}

export class ServerError extends ApiError {
  constructor(
    message = 'Internal server error',
    details?: Record<string, unknown>
  ) {
    super(message, 'SERVER_ERROR', 500, details);
    this.name = 'ServerError';
  }
}
