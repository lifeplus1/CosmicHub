import { describe, it, expect } from 'vitest';
import { extractNumericBirthData, toLibraryBirthStrings } from '../birthDataNormalization';

describe('birthDataNormalization', () => {
  it('extracts numeric data from already numeric variant', () => {
    const input = { year: 1990, month: 7, day: 15, hour: 10, minute: 30, city: 'Paris', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' };
    const result = extractNumericBirthData(input);
    expect(result).toMatchObject({ year: 1990, month: 7, day: 15, hour: 10, minute: 30, city: 'Paris' });
  });

  it('extracts numeric data from birth_date / birth_time variant', () => {
    const input = { birth_date: '1985-12-05', birth_time: '23:45', city: 'NYC', lat: 40.7, lon: -74.0 };
    const result = extractNumericBirthData(input);
    expect(result).toMatchObject({ year: 1985, month: 12, day: 5, hour: 23, minute: 45, city: 'NYC' });
  });

  it('defaults hour/minute when birth_time missing', () => {
    const input = { birth_date: '2000-01-02', city: 'LA' };
    const result = extractNumericBirthData(input);
    expect(result).toMatchObject({ hour: 12, minute: 0 });
  });

  it('returns null for invalid input', () => {
    expect(extractNumericBirthData(null)).toBeNull();
    expect(extractNumericBirthData({})).toBeNull();
  });

  it('converts back to library birth_date / birth_time strings', () => {
    const norm = { year: 2024, month: 3, day: 9, hour: 5, minute: 7, city: 'Berlin', lat: 0, lon: 0, timezone: 'UTC' };
    const result = toLibraryBirthStrings(norm);
    expect(result).toEqual({ birth_date: '2024-03-09', birth_time: '05:07' });
  });
});
