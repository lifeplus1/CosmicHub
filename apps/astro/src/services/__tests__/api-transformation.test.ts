import { describe, it, expect, vi } from 'vitest';
import { transformBackendResponse } from '../api';

// Mock the required dependencies
vi.mock('../../../utils/astrologyUtils', () => ({
  getSignFromDegrees: (degrees: number) => {
    // Simple mock: return sign based on degree ranges
    const signs = [
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces',
    ];
    return signs[Math.floor(degrees / 30) % 12];
  },
  calculateHousePosition: (position: number) => {
    // Simple mock: return house 1-12 based on position
    return (Math.floor(position / 30) % 12) + 1;
  },
}));

vi.mock('../../../utils/celestialBodyCategorization', () => ({
  isPlanetForDisplay: (name: string) => {
    const planets = [
      'sun',
      'moon',
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto',
    ];
    return planets.includes(name.toLowerCase());
  },
}));

describe('API Transformation - Points Processing', () => {
  const mockBackendResponse = {
    planets: {
      sun: { position: 280, retrograde: false, speed: 1.0 },
      moon: { position: 45, retrograde: false, speed: 13.2 },
    },
    houses: [
      { cusp: 0 },
      { cusp: 30 },
      { cusp: 60 },
      { cusp: 90 },
      { cusp: 120 },
      { cusp: 150 },
      { cusp: 180 },
      { cusp: 210 },
      { cusp: 240 },
      { cusp: 270 },
      { cusp: 300 },
      { cusp: 330 },
    ],
    asteroids: {
      chiron: { position: 251.64, retrograde: false },
      ceres: { position: 184.45, retrograde: false },
    },
    points: {
      north_node: { position: 125.03, retrograde: true },
      south_node: { position: 123.94, retrograde: true },
      lilith_mean: { position: 263.49, retrograde: false },
      lilith_true: { position: 253.35, retrograde: false },
    },
    aspects: [],
    angles: { ascendant: 0, mc: 90, descendant: 180, ic: 270 },
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
    julian_day: 2451545.0,
    house_system: 'placidus',
  };

  it('should process points with calculated sign and house', () => {
    const result = transformBackendResponse(mockBackendResponse);

    // Check that points are included
    expect(result.points).toBeDefined();
    expect(result.points).not.toBeNull();
    expect(Object.keys(result.points!)).toHaveLength(4);

    // Check north node
    const northNode = result.points!['north_node'];
    expect(northNode).toBeDefined();
    expect(northNode!.position).toBe(125.03);
    expect(northNode!.retrograde).toBe(true);
    expect(northNode!.sign).toBeDefined();
    expect(northNode!.house).toBeDefined();
    expect(typeof northNode!.house).toBe('number');
    expect(northNode!.house).toBeGreaterThan(0);
    expect(northNode!.house).toBeLessThanOrEqual(12);

    // Check lilith mean
    const lilithMean = result.points!['lilith_mean'];
    expect(lilithMean).toBeDefined();
    expect(lilithMean!.position).toBe(263.49);
    expect(lilithMean!.retrograde).toBe(false);
    expect(lilithMean!.sign).toBeDefined();
    expect(lilithMean!.house).toBeDefined();
  });

  it('should separate Chiron from planets into asteroids', () => {
    const result = transformBackendResponse(mockBackendResponse);

    // Check that Chiron is NOT in planets
    expect(result.planets.chiron).toBeUndefined();

    // Check that Chiron IS in asteroids
    expect(result.asteroids).toBeDefined();
    expect(result.asteroids!.chiron).toBeDefined();
    expect(result.asteroids!.chiron!.position).toBe(251.64);

    // Check that planets only contain actual planets
    const planetNames = Object.keys(result.planets);
    expect(planetNames).toContain('sun');
    expect(planetNames).toContain('moon');
    expect(planetNames).not.toContain('chiron');
  });

  it('should calculate missing sign and house for points', () => {
    // Test with a point missing sign and house
    const responseWithMissingData = {
      ...mockBackendResponse,
      points: {
        north_node: { position: 125.03, retrograde: true },
        // Missing sign and house - should be calculated
      },
    };

    const result = transformBackendResponse(responseWithMissingData);

    const northNode = result.points!['north_node'];
    expect(northNode).toBeDefined();
    expect(northNode!.sign).toBe('leo'); // 125° should be in Leo (120-150°)
    expect(northNode!.house).toBeGreaterThan(0);
    expect(northNode!.house).toBeLessThanOrEqual(12);
  });

  it('should preserve existing sign and house for points', () => {
    // Test with a point that already has sign and house
    const responseWithExistingData = {
      ...mockBackendResponse,
      points: {
        north_node: {
          position: 125.03,
          retrograde: true,
          sign: 'cancer', // Pre-existing sign
          house: 7, // Pre-existing house
        },
      },
    };

    const result = transformBackendResponse(responseWithExistingData);

    const northNode = result.points!['north_node'];
    expect(northNode).toBeDefined();
    expect(northNode!.sign).toBe('cancer'); // Should preserve existing
    expect(northNode!.house).toBe(7); // Should preserve existing
  });
});

describe('API Transformation - Categorization', () => {
  it('should correctly categorize celestial bodies', () => {
    const mockResponse = {
      planets: {
        sun: { position: 0, retrograde: false },
        chiron: { position: 251, retrograde: false }, // Should be filtered out
      },
      asteroids: {
        chiron: { position: 251, retrograde: false },
        vesta: { position: 200, retrograde: false },
      },
      points: {
        north_node: { position: 125, retrograde: true },
      },
      houses: [],
      aspects: [],
      angles: { ascendant: 0, mc: 90, descendant: 180, ic: 270 },
    };

    const result = transformBackendResponse(mockResponse);

    // Planets should contain all default planets plus any from backend
    const planetKeys = Object.keys(result.planets);
    expect(planetKeys).toContain('sun');
    expect(planetKeys.length).toBeGreaterThanOrEqual(10); // At least the 10 default planets
    expect(result.planets.chiron).toBeUndefined(); // Chiron should be in asteroids

    // Asteroids should contain asteroids including Chiron
    expect(result.asteroids).toBeDefined();
    expect(Object.keys(result.asteroids!)).toContain('chiron');
    expect(Object.keys(result.asteroids!)).toContain('vesta');

    // Points should contain nodes and lilith
    expect(result.points).toBeDefined();
    expect(Object.keys(result.points!)).toContain('north_node');
  });
});
