import { describe, it, expect } from 'vitest';
import { buildSuccess, buildFailure, parseErrorLike } from '../utils/api/error';

describe('api error helpers', () => {
  it('builds success', () => {
    const s = buildSuccess({ a: 1 }, 'ok');
    expect(s.success).toBe(true);
    expect(s.data.a).toBe(1);
    expect(s.message).toBe('ok');
  });
  it('builds failure', () => {
    const f = buildFailure('nope', 'X');
    expect(f.success).toBe(false);
    expect(f.error).toBe('nope');
    expect(f.code).toBe('X');
  });
  it('parses object error-like', () => {
    const p = parseErrorLike({ code: 'Z', message: 'boom', details: { d: 1 } });
    expect(p.code).toBe('Z');
    expect(p.message).toBe('boom');
  });
  it('parses Error instance', () => {
    const p = parseErrorLike(new Error('bad'));
    expect(p.message).toBe('bad');
  });
});
