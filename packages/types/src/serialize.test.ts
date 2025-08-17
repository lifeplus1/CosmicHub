import { describe, it, expect } from 'vitest';
import { serializeAstrologyData, deserializeAstrologyData } from './serialize.js';
import type { AstrologyChart, UserProfile, NumerologyData } from './astrology.types.js';
import { 
  isAstrologyChart, 
  isUserProfile, 
  isNumerologyData,
  validateAstrologyChart,
  safeParseAstrologyChart
} from './type-guards.js';

// Typed sample chart aligning with ChartSchema and AstrologyChart interface
const sampleChart: AstrologyChart = {
  planets: [
    { name: 'Sun', sign: 'Leo', degree: 15.25, position: 135.25, house: '5', aspects: [] },
    { name: 'Moon', sign: 'Aries', degree: 2.5, position: 12.5, house: '1', aspects: [] }
  ],
  houses: [
    { house: 1, number: 1, sign: 'Aries', degree: 0, cusp: 0, ruler: 'Mars' }
  ],
  aspects: [
    { planet1: 'Sun', planet2: 'Moon', type: 'Trine', orb: 5.0, applying: 'true' }
  ],
  asteroids: [
    { name: 'Ceres', sign: 'Virgo', degree: 10.0, house: '6' }
  ],
  angles: [
    { name: 'Ascendant', sign: 'Aries', degree: 0, position: 0 }
  ]
};

// Sample user profile
const sampleProfile: UserProfile = {
  userId: 'user123',
  birthData: {
    date: '1990-01-01',
    time: '12:00',
    location: 'New York, NY'
  }
};

// Sample numerology data
const sampleNumerology: NumerologyData = {
  lifePath: 7,
  destiny: 9,
  personalYear: 3
};

describe('serializeAstrologyData round-trip', () => {
  it('serializes and deserializes a chart consistently', () => {
    const json = serializeAstrologyData(sampleChart);
    expect(typeof json).toBe('string');
    const parsed = deserializeAstrologyData<AstrologyChart>(json);
    expect(parsed.planets.length).toBe(2);
    expect(parsed.planets[0].name).toBe('Sun');
    expect(parsed.aspects[0].type).toBe('Trine');
  });

  it('throws on unknown type', () => {
    // Using a function wrapper preserves the thrown error for expect().toThrow
    const fn: () => string = () => serializeAstrologyData({} as unknown as AstrologyChart);
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
    expect(errors.length).toBe(0);
    
    // Test invalid chart
    const invalidChart = { ...sampleChart, planets: 'not an array' };
    const invalidErrors = validateAstrologyChart(invalidChart);
    expect(invalidErrors.length).toBeGreaterThan(0);
  });

  it('safely parses JSON into AstrologyChart', () => {
    const json = JSON.stringify(sampleChart);
    const [parsed, errors] = safeParseAstrologyChart(json);
    
    expect(errors.length).toBe(0);
    expect(parsed).not.toBeNull();
    expect(parsed?.planets.length).toBe(2);
    
    // Test invalid JSON
    const [invalidParsed, invalidErrors] = safeParseAstrologyChart('{not valid json}');
    expect(invalidParsed).toBeNull();
    expect(invalidErrors.length).toBeGreaterThan(0);
  });
});
