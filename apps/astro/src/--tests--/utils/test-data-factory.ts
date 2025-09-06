/**
 * Type-safe test utilities following Type Bridge System
 * Provides consistent test data that matches the actual type definitions
 */

import { Planet, House, Aspect, AstrologyChart } from '@cosmichub/types';

/**
 * Sample planet data with all required fields
 */
export const createTestPlanet = (overrides: Partial<Planet> = {}): Planet => ({
  name: 'sun',
  position: 150.0,
  degree: 150.0,
  sign: 'leo',
  house: 5,
  retrograde: false,
  speed: 1.0,
  ...overrides,
});

/**
 * Sample house data with all required fields
 */
export const createTestHouse = (overrides: Partial<House> = {}): House => ({
  number: 1,
  cusp: 0,
  sign: 'aries',
  ruler: 'mars',
  degree: 0,
  size: 30,
  ...overrides,
});

/**
 * Sample aspect data with all required fields
 */
export const createTestAspect = (overrides: Partial<Aspect> = {}): Aspect => ({
  aspect_type: 'trine',
  planet1: 'sun',
  planet2: 'moon',
  orb: 2.1,
  applying: true,
  exact: false,
  power: 0.8,
  aspect_angle: 120,
  ...overrides,
});

/**
 * Complete test chart data structure
 */
export const createTestChart = (): AstrologyChart => ({
  planets: {
    sun: {
      name: 'sun',
      position: 150.0,
      degree: 150.0,
      sign: 'leo',
      house: 5,
      retrograde: false,
      speed: 1.0,
    },
    moon: {
      name: 'moon',
      position: 120.0,
      degree: 120.0,
      sign: 'cancer',
      house: 4,
      retrograde: false,
      speed: 12.0,
    },
  },
  houses: [
    {
      number: 1,
      cusp: 0,
      sign: 'aries',
      ruler: 'mars',
      degree: 0,
      size: 30,
      contains_planets: [],
    },
    {
      number: 2,
      cusp: 30,
      sign: 'taurus',
      ruler: 'venus',
      degree: 30,
      size: 30,
      contains_planets: [],
    },
  ],
  aspects: [
    {
      aspect_type: 'trine',
      planet1: 'sun',
      planet2: 'moon',
      orb: 2.1,
      applying: true,
      exact: false,
      power: 0.8,
      aspect_angle: 120,
    },
  ],
  angles: {
    ascendant: 0,
    midheaven: 90,
    descendant: 180,
    imumcoeli: 270,
  },
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  julian_day: 2448000.5,
  house_system: 'placidus',
  chart_metadata: {
    calculation_timestamp: new Date().toISOString(),
    ephemeris_source: 'swiss',
    coordinate_system: 'tropical',
  },
});

/**
 * Minimal valid chart for testing error cases
 */
export const createMinimalTestChart = (): AstrologyChart => ({
  planets: {},
  houses: [],
  aspects: [],
  angles: {
    ascendant: 0,
    midheaven: 90,
    descendant: 180,
    imumcoeli: 270,
  },
  latitude: 0,
  longitude: 0,
  timezone: 'UTC',
  julian_day: 2448000.5,
  house_system: 'placidus',
  chart_metadata: {
    calculation_timestamp: new Date().toISOString(),
    ephemeris_source: 'swiss',
    coordinate_system: 'tropical',
  },
});
