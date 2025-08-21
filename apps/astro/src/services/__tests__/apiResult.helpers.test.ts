import { describe, it, expect } from 'vitest';
// Updated to import from shared config package instead of local deprecated apiResult.ts
import { ok, fail, toFailure, unwrap, unwrapOr, mapResult, mapSuccess, mapFailure, isSuccess, isFailure } from '@cosmichub/config';
import type { ApiResult, ApiFailure } from '@cosmichub/config';

describe('apiResult helpers', () => {
  it('ok constructs success', () => {
    const res = ok({ value: 1 }, 'yay');
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.value).toBe(1);
      expect(res.message).toBe('yay');
    }
  });

  it('fail constructs failure', () => {
    const res = fail('boom', '401');
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe('boom');
      expect(res.code).toBe('401');
    }
  });

  it('toFailure maps axios 401', () => {
    const error = { response: { status: 401 } } as unknown as { response: { status: number } };
    const res = toFailure(error, { defaultMsg: 'x', auth: 'Need auth' });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.code).toBe('401');
      expect(res.error).toBe('Need auth');
    }
  });

  it('toFailure maps default', () => {
    const res = toFailure(new Error('nope'), { defaultMsg: 'Generic fail' });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toBe('Generic fail');
  });

  it('unwrap and unwrapOr work', () => {
    const s = ok(5);
    expect(unwrap(s)).toBe(5);
    const f = fail('bad');
    expect(unwrapOr(f as ApiResult<number>, 9)).toBe(9);
  });

  it('mapResult / mapSuccess / mapFailure operate correctly', () => {
    const s = ok(2);
  const mapped = mapSuccess(s, (v: number) => v * 3);
    expect(isSuccess(mapped) && mapped.data).toBe(6);
    const failure = fail('oops', '500');
  const mappedFail = mapFailure(failure, (f: ApiFailure) => fail(f.error + '!', f.code));
    expect(isFailure(mappedFail) && mappedFail.error.endsWith('!')).toBe(true);
  const summary = mapResult<number, string>(ok(7), (v: number) => `ok:${v}`, (f: ApiFailure) => f.error);
    expect(summary).toBe('ok:7'.replace(' ', '')); // ensure exact
  });
});
