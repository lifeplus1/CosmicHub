// Centralized ApiResult helpers for astro app
import axios from 'axios';

export interface Success<T> { success: true; data: T; message?: string }
export interface Failure { success: false; error: string; code?: string }
export type ApiResult<T> = Success<T> | Failure;

export const ok = <T>(data: T, message?: string): Success<T> => ({ success: true, data, message });
export const fail = (error: string, code?: string): Failure => ({ success: false, error, code });

// Generic axios -> ApiResult error mapper. Accepts mapping messages.
export interface FailureMapOpts {
  auth?: string; // 401
  notFound?: string; // 404
  validation?: string; // 400
  defaultMsg: string;
}
export const toFailure = (error: unknown, opts: FailureMapOpts): Failure => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) return fail(opts.auth ?? 'Authentication required', '401'); // ALLOW_FAIL_USAGE - local helper
    if (status === 404) return fail(opts.notFound ?? 'Resource not found', '404'); // ALLOW_FAIL_USAGE - local helper
    if (status === 400) return fail(opts.validation ?? 'Validation error', '400'); // ALLOW_FAIL_USAGE - local helper
  }
  return fail(opts.defaultMsg); // ALLOW_FAIL_USAGE - local helper
};

// Utility helpers for ergonomic ApiResult handling
export const isSuccess = <T>(r: ApiResult<T>): r is Success<T> => r.success;
export const isFailure = <T>(r: ApiResult<T>): r is Failure => !r.success;

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
  onFailure: (f: Failure) => B
): B => (r.success ? onSuccess(r.data) : onFailure(r));

// mapSuccess: apply function to success data preserving message
export const mapSuccess = <A, B>(r: ApiResult<A>, fn: (data: A) => B): ApiResult<B> => (
  r.success ? ok(fn(r.data), r.message) : r
) as ApiResult<B>;

// mapFailure: transform failure error/code
export const mapFailure = <T>(r: ApiResult<T>, fn: (f: Failure) => Failure): ApiResult<T> => (
  r.success ? r : fn(r)
);
