import { describe, it, expect } from 'vitest';
// Import everything the package publicly exports
import * as exported from '..';

/**
 * Contract test: Guards the public ApiResult helper surface so accidental
 * removals or renames are caught early. This should evolve ONLY with a
 * deliberate versioned decision.
 */
describe('ApiResult public surface contract', () => {
  const expectedFunctionExports = [
    'ok',
    'fail',
    'toFailure',
    'isSuccess',
    'isFailure',
    'unwrap',
    'unwrapOr',
    'mapResult',
    'mapSuccess',
    'mapFailure',
    'silenceLogsForTests',
  ] as const;
  it('includes required ApiResult helper functions', () => {
    for (const name of expectedFunctionExports) {
      expect(exported, `Missing export: ${name}`).toHaveProperty(name);
      expect(
        typeof (exported as any)[name],
        `Export ${name} should be a function`
      ).toBe('function');
    }
    // logger is an object, not a function
    expect(exported).toHaveProperty('logger');
    expect(typeof (exported as any).logger).toBe('object');
  });

  it('ok/fail produce correctly discriminated unions', () => {
    const okVal: any = (exported as any).ok({ value: 1 }, 'msg');
    expect(okVal.success).toBe(true);
    expect(okVal.data.value).toBe(1);
    const failVal: any = (exported as any).fail('boom', 'X');
    expect(failVal.success).toBe(false);
    expect(failVal.error).toBe('boom');
    expect(failVal.code).toBe('X');
  });

  it('toFailure maps known HTTP status codes to expected codes', () => {
    const { toFailure } = exported as any;
    const auth = toFailure(
      { response: { status: 401 } },
      { defaultMsg: 'd', auth: 'auth msg' }
    );
    expect(auth).toMatchObject({
      success: false,
      code: '401',
      error: 'auth msg',
    });
    const notFound = toFailure(
      { response: { status: 404 } },
      { defaultMsg: 'd', notFound: 'nf' }
    );
    expect(notFound).toMatchObject({
      success: false,
      code: '404',
      error: 'nf',
    });
    const validation = toFailure(
      { response: { status: 400 } },
      { defaultMsg: 'd', validation: 'val' }
    );
    expect(validation).toMatchObject({
      success: false,
      code: '400',
      error: 'val',
    });
    const fallback = toFailure(new Error('weird'), { defaultMsg: 'fallback' });
    expect(fallback).toMatchObject({ success: false, error: 'fallback' });
  });
});
