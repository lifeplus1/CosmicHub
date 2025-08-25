import { describe, it, expect } from 'vitest';
import {
  ok,
  fail,
  toFailure,
  isSuccess,
  isFailure,
  unwrap,
  unwrapOr,
  mapResult,
  mapSuccess,
  mapFailure,
} from '@cosmichub/config';
import type { ApiResult, NotificationStats } from '@cosmichub/config';

// Contract test: ensures shared ApiResult & NotificationStats surface remains stable

describe('ApiResult contract', () => {
  it('exports constructors and type guards', () => {
    const s = ok(1, 'm');
    const f = fail('err', '400');
    expect(s.success).toBe(true);
    expect(f.success).toBe(false);
    expect(isSuccess(s)).toBe(true);
    expect(isFailure(f)).toBe(true);
  });

  it('unwrap / unwrapOr behaviors', () => {
    expect(unwrap(ok('x'))).toBe('x');
    expect(unwrapOr(fail('bad') as ApiResult<string>, 'fallback')).toBe(
      'fallback'
    );
  });

  it('map helpers behave', () => {
    const tripled = mapSuccess(ok(2), v => v * 3);
    if (isSuccess(tripled)) expect(tripled.data).toBe(6);
    const modified = mapFailure(fail('oops'), f => fail(f.error + '!'));
    if (isFailure(modified)) expect(modified.error.endsWith('!')).toBe(true);
    const summary = mapResult(
      ok(5),
      v => `v:${v}`,
      f => f.error
    );
    expect(summary).toBe('v:5');
  });

  it('toFailure maps status codes', () => {
    const notFound = toFailure(
      { response: { status: 404 } },
      { defaultMsg: 'x', notFound: 'nf' }
    );
    if (isFailure(notFound)) {
      expect(notFound.code).toBe('404');
      expect(notFound.error).toBe('nf');
    }
  });
});

describe('NotificationStats contract', () => {
  it('shape compatibility', () => {
    const stats: NotificationStats = {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      queuedNotifications: 0,
      permissionStatus: 'default',
      totalSent: 0,
      totalDelivered: 0,
      totalClicked: 0,
      avgDeliveryTime: 0,
      errors: 0,
    };
    expect(stats.permissionStatus).toBe('default');
  });
});
