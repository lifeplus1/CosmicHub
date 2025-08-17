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
  | 'partial' 
  | 'cached' 
  | 'unauthorized';

/**
 * Base API Response
 */
export interface ApiResponseBase {
  status: ApiResponseStatus;
  message?: string;
  timestamp: string;
}

/**
 * Discriminated Union for API Responses
 */
export interface ApiSuccessResponse<T> extends ApiResponseBase {
  status: 'success';
  data: T;
}

export interface ApiErrorResponse extends ApiResponseBase {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ApiPartialResponse<T> extends ApiResponseBase {
  status: 'partial';
  data: T;
  missing: string[];
}

export interface ApiCachedResponse<T> extends ApiResponseBase {
  status: 'cached';
  data: T;
  cachedAt: string;
}

export interface ApiUnauthorizedResponse extends ApiResponseBase {
  status: 'unauthorized';
  requiredRole?: string;
}

/**
 * Union type for all possible API responses
 */
export type ApiResponse<T> = 
  | ApiSuccessResponse<T> 
  | ApiErrorResponse 
  | ApiPartialResponse<T> 
  | ApiCachedResponse<T> 
  | ApiUnauthorizedResponse;

/**
 * Type guard functions for API responses
 */
export function isApiSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.status === 'success';
}

export function isApiErrorResponse<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return response.status === 'error';
}

export function isApiPartialResponse<T>(response: ApiResponse<T>): response is ApiPartialResponse<T> {
  return response.status === 'partial';
}

export function isApiCachedResponse<T>(response: ApiResponse<T>): response is ApiCachedResponse<T> {
  return response.status === 'cached';
}

export function isApiUnauthorizedResponse<T>(response: ApiResponse<T>): response is ApiUnauthorizedResponse {
  return response.status === 'unauthorized';
}

/**
 * Chart Types
 */
export interface Planet {
  name: string;
  position: number; // Degree in zodiac (0-360)
  retrograde?: boolean;
  speed?: number;
}

export interface House {
  number: number;
  cusp: number; // Degree position
  sign: string;
}

export interface ChartData {
  planets: Record<string, Planet>;
  houses: House[];
  aspects?: unknown[];
  angles?: {
    ascendant: number;
    midheaven: number;
    descendant: number;
    imumcoeli: number;
  };
  latitude?: number;
  longitude?: number;
  timezone?: string;
  julian_day?: number;
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
 * Interpretation Types
 */
export type InterpretationType = 
  | 'natal' 
  | 'transit' 
  | 'synastry' 
  | 'composite' 
  | 'solar_return' 
  | 'progression';

export interface Interpretation {
  id: InterpretationId;
  chartId: ChartId;
  userId: UserId;
  type: InterpretationType;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  confidence: number; // 0-1 confidence score
  createdAt: string;
  updatedAt: string;
}

export interface InterpretationRequest {
  chartId: ChartId;
  userId: UserId;
  type?: InterpretationType;
  focus?: string[];
  question?: string;
}

export interface InterpretationResponse {
  data: Interpretation[];
  success: boolean;
  message?: string;
}

/**
 * Auth Types
 */
export interface AuthHeaders {
  Authorization: string;
  'Content-Type': string;
}

/**
 * Error Types
 */
export class ApiError extends Error {
  code: string;
  details?: Record<string, unknown>;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHENTICATED', 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`Resource not found: ${resource}`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}
