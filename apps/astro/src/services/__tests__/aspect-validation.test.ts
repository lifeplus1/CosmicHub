import { describe, it, expect } from 'vitest';
import { isAspectType } from '../validation';
import type { AspectType } from '../api.types';

describe('isAspectType', () => {
  const valid: AspectType[] = ['conjunction','opposition','trine','square','sextile','quincunx','semisextile'];
  it('accepts valid aspect types', () => {
    for (const a of valid) {
      expect(isAspectType(a)).toBe(true);
    }
  });
  it('rejects invalid aspect types', () => {
    const invalid = ['Conjunction','invalid','triangle','', 'CONJUNCTION'];
    for (const a of invalid) {
      // cast to string to satisfy type system
      expect(isAspectType(a as string)).toBe(false);
    }
  });
});
