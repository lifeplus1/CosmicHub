import { describe, it, expect } from 'vitest';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - importing ESM .mjs module
import { buildLintBadge } from '../../../../../scripts/lib/build-lint-badge.mjs';

describe('buildLintBadge (fast)', () => {
  it('classifies colors across thresholds', () => {
    const mk = (baseline: number, current: number) => buildLintBadge({ totalBaseline: baseline, totalCurrent: current });
    expect(mk(100, 100).color).toBe('red'); // 0%
    expect(mk(100, 110).color).toBe('red'); // regression negative pct
    expect(mk(100, 90).color).toBe('orange'); // 10%
    expect(mk(100, 60).color).toBe('yellow'); // 40%
    expect(mk(100, 30).color).toBe('green'); // 70%
    expect(mk(100, 10).color).toBe('brightgreen'); // 90%
  });
});
