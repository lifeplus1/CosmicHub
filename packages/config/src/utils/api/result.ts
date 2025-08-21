
// Unified minimal ApiResult used across frontend apps (astro, integrations, etc.)
export interface ApiSuccess<T> { success: true; data: T; message?: string }
export interface ApiFailure { success: false; error: string; code?: string; details?: unknown }
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

// Centralized error code constants to avoid magic strings
export const ErrorCode = {
  AUTH: '401',
  NOT_FOUND: '404',
  VALIDATION: '400',
  INVALID_SHAPE: 'invalid_shape'
} as const;
export type ErrorCodeValue = typeof ErrorCode[keyof typeof ErrorCode];

export const ok = <T>(data: T, message?: string): ApiSuccess<T> => ({ success: true, data, message });
export const fail = (error: string, code?: string, details?: unknown): ApiFailure => ({ success: false, error, code, details });

export interface FailureMapOptions {
  auth?: string; // 401
  notFound?: string; // 404
  validation?: string; // 400
  defaultMsg: string;
}
import { logger } from '../logger';

export const toFailure = (error: unknown, opts: FailureMapOptions): ApiFailure => {
  if (typeof error === 'object' && error !== null) {
    const maybeResp = (error as { response?: { status?: unknown } }).response;
    const status = typeof maybeResp?.status === 'number' ? maybeResp.status : undefined;
  if (status === 401) return fail(opts.auth ?? 'Authentication required', ErrorCode.AUTH);
  if (status === 404) return fail(opts.notFound ?? 'Resource not found', ErrorCode.NOT_FOUND);
  if (status === 400) return fail(opts.validation ?? 'Validation error', ErrorCode.VALIDATION);
  }
  logger.once('warn', 'apiresult.fallback', 'ApiResult toFailure fallback path used', { errorType: typeof error });
  return fail(opts.defaultMsg);
};

export const isSuccess = <T>(r: ApiResult<T>): r is ApiSuccess<T> => r.success;
export const isFailure = <T>(r: ApiResult<T>): r is ApiFailure => r.success === false;

// unwrap: returns data or throws an Error with failure message/code
export const unwrap = <T>(r: ApiResult<T>): T => {
  if (r.success) return r.data;
  const codePart = r.code ? ` (code ${r.code})` : '';
  throw new Error(`ApiResult failure: ${r.error}${codePart}`);
};

// unwrapOr: returns data or provided fallback
export const unwrapOr = <T>(r: ApiResult<T>, fallback: T): T => (r.success ? r.data : fallback);

// mapResult: transform success or failure independently
export const mapResult = <A, B>(
  r: ApiResult<A>,
  onSuccess: (data: A) => B,
  onFailure: (f: ApiFailure) => B
): B => (r.success ? onSuccess(r.data) : onFailure(r));

// mapSuccess: apply function to success data preserving message
export const mapSuccess = <A, B>(r: ApiResult<A>, fn: (data: A) => B): ApiResult<B> => (
  r.success ? ok(fn(r.data), r.message) : r
) as ApiResult<B>;

// mapFailure: transform failure error/code
export const mapFailure = <T>(r: ApiResult<T>, fn: (f: ApiFailure) => ApiFailure): ApiResult<T> => (
  r.success ? r : fn(r)
);
