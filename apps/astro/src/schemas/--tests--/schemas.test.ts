import { describe, it, expect } from 'vitest';
import { AdvancedSynastryRequestSchema } from '../index';

describe('AdvancedSynastryRequestSchema', () => {
  it('accepts valid payload', () => {
    const parsed = AdvancedSynastryRequestSchema.parse({
      person1: {
        date: '1990-01-01',
        time: '12:00',
        city: 'NYC',
        latitude: 40.7,
        longitude: -74.0,
        timezone: 'America/New_York',
      },
      person2: {
        date: '1992-02-02',
        time: '06:30',
        city: 'LA',
        latitude: 34.05,
        longitude: -118.25,
        timezone: 'America/Los_Angeles',
      },
      compatibility_overrides: { overall: 85 },
    });
    expect(parsed.compatibility_overrides?.overall).toBe(85);
  });

  it('rejects invalid latitude', () => {
    expect(() =>
      AdvancedSynastryRequestSchema.parse({
        person1: {
          date: '1990-01-01',
          time: '12:00',
          city: 'NYC',
          latitude: 400, // invalid
          longitude: -74.0,
          timezone: 'UTC',
        },
        person2: {
          date: '1992-02-02',
          time: '06:30',
          city: 'LA',
          latitude: 34.05,
          longitude: -118.25,
          timezone: 'UTC',
        },
      })
    ).toThrow();
  });
});