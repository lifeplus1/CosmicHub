import { describe, it, expect } from 'vitest';
import { toCanonicalBirthData, parseBirthParams, hasCompleteCanonicalBirthData } from '../birthDataTransforms';

describe('birthDataTransforms', () => {
  it('converts already canonical data unchanged', () => {
    const canonical = {
      birth_date: '1990-07-12',
      birth_time: '05:30',
      latitude: 40.7128,
      longitude: -74.006,
      city: 'New York',
      timezone: 'America/New_York'
    };
    const result = toCanonicalBirthData(canonical);
    expect(result).toEqual(canonical);
  });

  it('reconstructs canonical from extended numeric fields fallback', () => {
    const extended: any = {
      year: 1984, month: 3, day: 9, hour: 14, minute: 5,
      lat: 10.5, lon: -20.25, city: 'Testville', timezone: 'UTC'
    };
    const result = toCanonicalBirthData(extended);
    expect(result).toMatchObject({
      birth_date: '1984-03-09',
      birth_time: '14:05',
      latitude: 10.5,
      longitude: -20.25,
      city: 'Testville',
      timezone: 'UTC'
    });
  });

  it('parseBirthParams returns null when required missing', () => {
    const params = new URLSearchParams('year=2000&month=1&day=2&hour=3&minute=4');
    expect(parseBirthParams(params)).toBeNull();
  });

  it('parseBirthParams parses full set including optional lat/lon/timezone', () => {
    const params = new URLSearchParams('year=2000&month=1&day=2&hour=3&minute=4&city=Paris&lat=48.8566&lon=2.3522&timezone=Europe/Paris');
    const parsed = parseBirthParams(params)!;
    expect(parsed).toMatchObject({
      year: 2000, month: 1, day: 2, hour: 3, minute: 4, city: 'Paris',
      lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris'
    });
  });

  it('hasCompleteCanonicalBirthData type guard', () => {
    const incomplete = { birth_date: '2000-01-02' } as any;
    expect(hasCompleteCanonicalBirthData(incomplete)).toBe(false);
    const complete = { birth_date: '2000-01-02', birth_time: '03:04', latitude: 1, longitude: 2 };
    expect(hasCompleteCanonicalBirthData(complete)).toBe(true);
  });
});
