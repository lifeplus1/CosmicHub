// Shared API error and response helpers
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

export function isStandardFailure<T>(
  r: StandardApiResponse<T>
): r is StandardFailure {
  return r.success === false;
}

export function buildFailure(
  message: string,
  code?: string,
  details?: unknown
): StandardFailure {
  return { success: false, error: message, code, details };
}

export function buildSuccess<T>(data: T, message?: string): StandardSuccess<T> {
  return { success: true, data, message };
}

export function parseErrorLike(
  input: unknown,
  fallbackCode = 'UNKNOWN'
): StandardApiError {
  if (typeof input === 'object' && input !== null) {
    const rec = input as Record<string, unknown>;
    const code = typeof rec.code === 'string' ? rec.code : fallbackCode;
    const message =
      typeof rec.message === 'string' ? rec.message : 'API request failed';
    return { code, message, details: rec.details };
  }
  if (input instanceof Error) {
    return { code: fallbackCode, message: input.message };
  }
  return { code: fallbackCode, message: 'API request failed' };
}
