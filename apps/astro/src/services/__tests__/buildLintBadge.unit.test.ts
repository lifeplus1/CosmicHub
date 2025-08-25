import { describe, it, expect } from 'vitest';
// Import the ESM module directly
import { buildLintBadge } from '../../../../../scripts/lib/build-lint-badge.mjs';

describe('buildLintBadge (fast)', () => {
  it('classifies colors across thresholds', (): { color: string }[] => {
    const mk = (baseline: number, current: number): { color: string } =>
      buildLintBadge({ totalBaseline: baseline, totalCurrent: current });
    expect(mk(100, 100).color).toBe('red'); // 0%
    expect(mk(100, 110).color).toBe('red'); // regression negative pct
    expect(mk(100, 90).color).toBe('orange'); // 10%
    expect(mk(100, 60).color).toBe('yellow'); // 40%
    expect(mk(100, 30).color).toBe('green'); // 70%
    expect(mk(100, 10).color).toBe('brightgreen'); // 90%
    return [];
  });
});
