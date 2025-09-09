import { describe, it, expect } from 'vitest';
import {
  serializeAstrologyData,
  deserializeAstrologyData,
} from './serialize';
import type {
  AstrologyChart,
  UserProfile,
  NumerologyData,
} from './astrology.types';
import {
  isAstrologyChart,
  isUserProfile,
  isNumerologyData,
  validateAstrologyChart,
  safeParseAstrologyChart,
} from './type-guards';

// Typed sample chart aligning with ChartSchema and AstrologyChart interface
const sampleChart: AstrologyChart = {
  planets: {
    Sun: {
      name: 'Sun',
      position: 120.5,
      degree: 120.5,
      sign: 'Leo',
      house: 5,
      retrograde: false,
      speed: 1,
      dignity: 'domicile',
      element: 'fire',
      modality: 'fixed'
    }
  },
  houses: [
    { number: 1, cusp: 0, sign: 'Aries', ruler: 'Mars', degree: 0, size: 30 },
    { number: 2, cusp: 30, sign: 'Taurus', ruler: 'Venus', degree: 30, size: 30 },
    { number: 3, cusp: 60, sign: 'Gemini', ruler: 'Mercury', degree: 60, size: 30 },
    { number: 4, cusp: 90, sign: 'Cancer', ruler: 'Moon', degree: 90, size: 30 },
    { number: 5, cusp: 120, sign: 'Leo', ruler: 'Sun', degree: 120, size: 30 },
    { number: 6, cusp: 150, sign: 'Virgo', ruler: 'Mercury', degree: 150, size: 30 },
    { number: 7, cusp: 180, sign: 'Libra', ruler: 'Venus', degree: 180, size: 30 },
    { number: 8, cusp: 210, sign: 'Scorpio', ruler: 'Mars', degree: 210, size: 30 },
    { number: 9, cusp: 240, sign: 'Sagittarius', ruler: 'Jupiter', degree: 240, size: 30 },
    { number: 10, cusp: 270, sign: 'Capricorn', ruler: 'Saturn', degree: 270, size: 30 },
    { number: 11, cusp: 300, sign: 'Aquarius', ruler: 'Saturn', degree: 300, size: 30 },
    { number: 12, cusp: 330, sign: 'Pisces', ruler: 'Jupiter', degree: 330, size: 30 }
  ],
  aspects: [
    { 
      aspect_type: 'square', 
      planet1: 'Sun', 
      planet2: 'Moon', 
      orb: 2, 
      applying: true, 
      exact: false, 
      power: 75,
      aspect_angle: 90
    }
  ],
  asteroids: {
    Chiron: { 
      name: 'Chiron', 
      position: 45.2, 
      degree: 45.2,
      sign: 'Taurus', 
      house: 2, 
      retrograde: false, 
      speed: 0.5 
    }
  },
  angles: {
    ascendant: 0,
    midheaven: 90,
    descendant: 180,
    imumcoeli: 270
  },
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  julian_day: 2447892.0,
  house_system: 'placidus',
  chart_metadata: {
    calculation_timestamp: '2023-01-01T12:00:00Z',
    ephemeris_source: 'swiss',
    coordinate_system: 'tropical'
  }
};

// Sample user profile
const sampleProfile: UserProfile = {
  userId: 'user123',
  birthData: {
    date: '1990-01-01',
    time: '12:00',
    location: 'New York, NY',
  },
};

// Sample numerology data
const sampleNumerology: NumerologyData = {
  lifePath: 7,
  destiny: 9,
  personalYear: 3,
};

describe('serializeAstrologyData round-trip', () => {
  it('serializes and deserializes a chart consistently', () => {
    const json = serializeAstrologyData(sampleChart);
    expect(typeof json).toBe('string');
    const parsed = deserializeAstrologyData<AstrologyChart>(json);
    expect(Object.keys(parsed.planets)).toHaveLength(1);
    const firstPlanet = parsed.planets.Sun;
    expect(firstPlanet?.name).toBe('Sun');
    expect(parsed.aspects).toEqual([
      { 
        aspect_type: 'square', 
        planet1: 'Sun', 
        planet2: 'Moon', 
        orb: 2, 
        applying: true, 
        exact: false, 
        power: 75,
        aspect_angle: 90
      }
    ]);
  });

  it('throws on unknown type', () => {
    // Using a function wrapper preserves the thrown error for expect().toThrow
    const fn: () => string = () =>
      serializeAstrologyData({} as unknown as AstrologyChart);
    expect(fn).toThrow();
  });
});

describe('Type guards', () => {
  it('correctly identifies an AstrologyChart', () => {
    expect(isAstrologyChart(sampleChart)).toBe(true);
    expect(isAstrologyChart(sampleProfile)).toBe(false);
    expect(isAstrologyChart(sampleNumerology)).toBe(false);
    expect(isAstrologyChart({})).toBe(false);
  });

  it('correctly identifies a UserProfile', () => {
    expect(isUserProfile(sampleProfile)).toBe(true);
    expect(isUserProfile(sampleChart)).toBe(false);
    expect(isUserProfile(sampleNumerology)).toBe(false);
    expect(isUserProfile({})).toBe(false);
  });

  it('correctly identifies NumerologyData', () => {
    expect(isNumerologyData(sampleNumerology)).toBe(true);
    expect(isNumerologyData(sampleChart)).toBe(false);
    expect(isNumerologyData(sampleProfile)).toBe(false);
    expect(isNumerologyData({})).toBe(false);
  });

  it('validates AstrologyChart structure', () => {
    const errors = validateAstrologyChart(sampleChart);
    // Debug: print actual errors
    if (errors.length > 0) {
      console.error('Validation errors found:', errors);
    }
    expect(errors.length).toBe(0);

    // Test invalid chart
    const invalidChart = { ...sampleChart, planets: 'not a record' };
    const invalidErrors = validateAstrologyChart(invalidChart);
    expect(invalidErrors.length).toBeGreaterThan(0);
  });

  it('safely parses JSON into AstrologyChart', () => {
    const json = JSON.stringify(sampleChart);
    const [parsed, errors] = safeParseAstrologyChart(json);

    expect(errors.length).toBe(0);
    expect(parsed).not.toBeNull();
    expect(Object.keys(parsed?.planets || {})).toHaveLength(1);

    // Test invalid JSON
    const [invalidParsed, invalidErrors] =
      safeParseAstrologyChart('{not valid json}');
    expect(invalidParsed).toBeNull();
    expect(invalidErrors.length).toBeGreaterThan(0);
  });
});
