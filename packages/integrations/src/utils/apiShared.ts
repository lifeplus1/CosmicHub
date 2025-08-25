// Local lightweight duplicate helpers (cannot import @cosmichub/config due to rootDir constraints)
// Source of truth for richer helpers: packages/config/src/utils/api/error.ts and result.ts
export interface StandardApiError {
  code: string;
  message: string;
  details?: unknown;
}
export interface StandardSuccess<T> {
  success: true;
  data: T;
  message?: string;
}
export interface StandardFailure {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}
export type StandardApiResponse<T> = StandardSuccess<T> | StandardFailure;
export const buildSuccess = <T>(
  data: T,
  message?: string
): StandardSuccess<T> => ({ success: true, data, message });
export const buildFailure = (
  error: string,
  code?: string,
  details?: unknown
): StandardFailure => ({ success: false, error, code, details });
