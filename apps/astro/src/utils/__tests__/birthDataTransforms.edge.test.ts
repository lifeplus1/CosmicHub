import { describe, it, expect } from 'vitest';
import { toCanonicalBirthData } from '../birthDataTransforms';

// These tests cover edge/fallback pathways in toCanonicalBirthData

describe('toCanonicalBirthData edge cases', () => {
  it('pads single digit month/day/hour/minute', () => {
    const result = toCanonicalBirthData({
      birth_date: '2001-01-02',
      birth_time: '03:04',
      latitude: 10,
      longitude: 20,
      city: 'Test',
      timezone: 'UTC'
    } as any);
    expect(result.birth_date).toBe('2001-01-02');
    expect(result.birth_time).toBe('03:04');
  });

  it('reconstructs from numeric style fallback object', () => {
    const result = toCanonicalBirthData({
      year: 1999,
      month: 7,
      day: 8,
      hour: 9,
      minute: 5,
      lat: 11,
      lon: 22,
      city: 'X',
      timezone: 'UTC'
    } as any);
    expect(result.birth_date).toBe('1999-07-08');
    expect(result.birth_time).toBe('09:05');
    expect(result.latitude).toBe(11);
    expect(result.longitude).toBe(22);
  });

  it('defaults missing numeric parts to zeros (defensive)', () => {
    const result = toCanonicalBirthData({} as any);
    expect(result.birth_date).toBe('0000-01-01');
    expect(result.birth_time).toBe('00:00');
  });
});
