import { describe, it, expect } from 'vitest';
import { toUnifiedBirthData, parseTextBirthData, type UnifiedBirthData, type TextBirthData } from '@cosmichub/types';

describe('Birth Data Converters', () => {
  it('converts UnifiedBirthData through toUnifiedBirthData unchanged', () => {
    const unified: UnifiedBirthData = {
      year: 1984,
      month: 10,
      day: 12,
      hour: 8,
      minute: 45,
      city: 'London',
      lat: 51.5074,
      lon: -0.1278,
      timezone: 'Europe/London'
    };
    expect(toUnifiedBirthData(unified)).toEqual(unified);
  });

  it('parses TextBirthData correctly', () => {
    const text: TextBirthData = {
      birth_date: '1990-06-21',
      birth_time: '14:30:00',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      city: 'New York'
    };
    const parsed = parseTextBirthData(text);
    expect(parsed).toMatchObject({
      year: 1990,
      month: 6,
      day: 21,
      hour: 14,
      minute: 30,
      city: 'New York',
      lat: 40.7128,
      lon: -74.006,
      timezone: 'America/New_York'
    });
  });

  it('toUnifiedBirthData dispatches TextBirthData path', () => {
    const text: TextBirthData = {
      birth_date: '2000-01-01',
      birth_time: '00:00:00',
      city: 'Testville'
    };
    const unified = toUnifiedBirthData(text);
    expect(unified).toMatchObject({ year: 2000, month: 1, day: 1, hour: 0, minute: 0, city: 'Testville' });
  });

  it('throws on unsupported shape', () => {
    // @ts-expect-error intentional bad shape
    expect(() => toUnifiedBirthData({ foo: 'bar' })).toThrow();
  });
});
