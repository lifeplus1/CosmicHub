// Local lightweight duplicate helpers (cannot import @cosmichub/config due to rootDir constraints)
// Source of truth for richer helpers: packages/config/src/utils/api/error.ts and result.ts
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
export const buildSuccess = <T>(
  data: T,
  message?: string
): StandardSuccess<T> => ({ success: true, data, message });
export const buildFailure = (
  error: string,
  code?: string,
  details?: unknown
): StandardFailure => ({ success: false, error, code, details });
