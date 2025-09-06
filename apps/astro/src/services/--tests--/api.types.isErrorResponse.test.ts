import { describe, it, expect } from 'vitest';
import {
  isErrorResponse,
  type ApiResponse,
  type ApiSuccessResponseBase,
} from '../../services/api.types';

interface Foo {
  value: number;
}

function makeSuccess(): ApiSuccessResponseBase<Foo> {
  return {
    status: 'success',
    data: { value: 42 },
    timestamp: new Date().toISOString(),
  };
}

function makeError(
  status:
    | 'error'
    | 'validation_error'
    | 'not_found'
    | 'unauthorized'
    | 'forbidden'
    | 'server_error'
): {
  status: typeof status;
  timestamp: string;
  error: { code: string; message: string };
} {
  return {
    status,
    timestamp: new Date().toISOString(),
    error: { code: 'X', message: 'boom' },
  } as const;
}

describe('isErrorResponse', () => {
  it('narrows success', () => {
    const resp: ApiResponse<Foo> = makeSuccess();
    expect(isErrorResponse(resp)).toBe(false);
    if (!isErrorResponse(resp)) {
      expect(resp.data.value).toBe(42);
    }
  });

  it('narrows error', () => {
    const resp = makeError('error');
    // Explicitly cast with type assertion for testing
    const union: ApiResponse<Foo> = resp as ApiResponse<Foo>;
    expect(isErrorResponse(union)).toBe(true);
    if (isErrorResponse(union)) {
      expect(union.error.message).toBe('boom');
    }
  });
});
