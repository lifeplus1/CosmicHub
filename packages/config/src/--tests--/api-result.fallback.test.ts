import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toFailure, ErrorCode } from '../utils/api/result';
import { logger } from '../utils/logger';

describe('toFailure fallback + logger.once', () => {
  const opts = { defaultMsg: 'Default fail' };
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation((): void => {
      /* silent */
    });
    logger.setLevel('debug');
  });

  it('emits a single warn when hitting fallback path multiple times', () => {
    const f1 = toFailure(new Error('boom'), opts);
    const f2 = toFailure(new Error('boom again'), opts);
    expect(f1).toMatchObject({ success: false, error: 'Default fail' });
    expect(f2).toMatchObject({ success: false, error: 'Default fail' });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('does not warn for mapped status codes', () => {
    warnSpy.mockClear();
    const mapped = toFailure(
      { response: { status: 401 } },
      { defaultMsg: 'x', auth: 'auth msg' }
    );
    expect(mapped.code).toBe(ErrorCode.AUTH);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('logger level filtering', () => {
  it('suppresses info when level set to error', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation((): void => {
      /* silent */
    });
    logger.setLevel('error');
    logger.info('should not appear');
    expect(infoSpy).not.toHaveBeenCalled();
  });
});
