// Shared API error and response helpers
  message: string;
  details?: unknown;
}

  data: T;
  message?: string;
}

  error: string;
  code?: string;
  details?: unknown;
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
