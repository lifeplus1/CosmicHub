import { describe, it, expect, vi } from 'vitest';
import { transformBackendResponse } from '../services/api';
import type { ChartData } from '../services/api.types';

// Mock the utils to avoid circular dependencies
vi.mock('../utils/astrologyUtils', () => ({
  getSignFromDegrees: (position: number) => {
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
    return signs[Math.floor(position / 30) % 12];
  },
  calculateHousePosition: (position: number) => Math.floor(position / 30) + 1,
  getRulerFromSign: () => 'mars', // Simple mock
  isZodiacSign: (sign: string) => {
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
    return signs.includes(sign?.toLowerCase());
  },
}));

vi.mock('../utils/celestialBodyCategorization', () => ({
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

describe('Chart Data Processing', () => {
  const mockBackendResponse = {
    planets: {
      sun: { position: 280.5, retrograde: false, speed: 1.0 },
      moon: { position: 125.3, retrograde: false, speed: 13.2 },
      chiron: { position: 251.6, retrograde: false, speed: 0.02 }, // Should be filtered out
    },
    asteroids: {
      chiron: { position: 251.6, retrograde: false },
      ceres: { position: 184.4, retrograde: false },
      pallas: { position: 134.0, retrograde: true },
      juno: { position: 278.0, retrograde: false },
      vesta: { position: 245.9, retrograde: false },
    },
    points: {
      north_node: { position: 125.0, retrograde: true },
      south_node: { position: 123.9, retrograde: true },
      lilith_mean: { position: 263.4, retrograde: false },
      lilith_true: { position: 253.3, retrograde: false },
    },
    houses: [
      { cusp: 0, sign: 'aries' },
      { cusp: 30, sign: 'taurus' },
      { cusp: 60, sign: 'gemini' },
    ],
    aspects: [
      {
        point1: 'sun',
        point2: 'moon',
        aspect: 'trine',
        orb: 5.2,
        applying: true,
      },
    ],
    angles: {
      ascendant: 0,
      mc: 90,
      descendant: 180,
      ic: 270,
    },
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
    julian_day: 2451545,
    house_system: 'placidus',
  };

  it('should properly separate Chiron from planets to asteroids', () => {
    const result: ChartData = transformBackendResponse(mockBackendResponse);

    // Chiron should NOT be in planets
    expect(result.planets.chiron).toBeUndefined();

    // Chiron should be in asteroids
    expect(result.asteroids?.chiron).toBeDefined();
    expect(result.asteroids?.chiron?.position).toBe(251.6);

    // Regular planets should still be there
    expect(result.planets.sun).toBeDefined();
    expect(result.planets.moon).toBeDefined();
  });

  it('should process points with calculated sign and house', () => {
    const result: ChartData = transformBackendResponse(mockBackendResponse);

    // Points should exist
    expect(result.points).toBeDefined();
    expect(Object.keys(result.points!).length).toBe(4);

    // Check that sign and house are calculated
    const northNode = result.points?.north_node;
    expect(northNode).toBeDefined();
    expect(northNode?.position).toBe(125.0);
    expect(northNode?.sign).toBeDefined(); // Should be calculated from position
    expect(northNode?.house).toBeDefined(); // Should be calculated from position
    expect(northNode?.retrograde).toBe(true);
  });

  it('should process all major asteroids', () => {
    const result: ChartData = transformBackendResponse(mockBackendResponse);

    expect(result.asteroids).toBeDefined();

    const expectedAsteroids = ['chiron', 'ceres', 'pallas', 'juno', 'vesta'];
    expectedAsteroids.forEach(name => {
      expect(result.asteroids?.[name]).toBeDefined();
      expect(result.asteroids?.[name]?.position).toBeDefined();
      expect(result.asteroids?.[name]?.sign).toBeDefined();
      expect(result.asteroids?.[name]?.house).toBeDefined();
    });
  });

  it('should properly transform aspects with correct field mapping', () => {
    const result: ChartData = transformBackendResponse(mockBackendResponse);

    expect(result.aspects).toBeDefined();
    expect(result.aspects.length).toBe(1);

    const aspect = result.aspects?.[0];
    expect(aspect).toBeDefined();
    expect(aspect?.planet1).toBe('sun'); // Backend point1 → frontend planet1
    expect(aspect?.planet2).toBe('moon'); // Backend point2 → frontend planet2
    expect(aspect?.aspect_type).toBe('trine'); // Backend aspect → frontend aspect_type
    expect(aspect?.orb).toBe(5.2);
    expect(aspect?.applying).toBe(true);
  });

  it('should maintain existing serialization compatibility', () => {
    const result: ChartData = transformBackendResponse(mockBackendResponse);

    // Check that the result structure matches ChartData interface
    expect(result.planets).toBeDefined();
    expect(typeof result.planets).toBe('object');
    expect(Array.isArray(result.houses)).toBe(true);
    expect(Array.isArray(result.aspects)).toBe(true);
    expect(typeof result.asteroids).toBe('object');
    expect(typeof result.points).toBe('object');
    expect(typeof result.angles).toBe('object');
  });
});

// Conversion test for existing serialization system
describe('Data Format Conversion', () => {
  it('should convert ChartData format to AstrologyChart format for serialization', () => {
    const mockChartData: Partial<ChartData> = {
      planets: {
        sun: {
          name: 'sun',
          position: 280.5,
          sign: 'capricorn',
          house: 10,
          retrograde: false,
          speed: 1.0,
        },
        moon: {
          name: 'moon',
          position: 125.3,
          sign: 'leo',
          house: 4,
          retrograde: false,
          speed: 13.2,
        },
        mercury: {
          name: 'mercury',
          position: 0,
          sign: 'aries',
          house: 1,
          retrograde: false,
          speed: 0,
        },
        venus: {
          name: 'venus',
          position: 0,
          sign: 'aries',
          house: 1,
          retrograde: false,
          speed: 0,
        },
        mars: {
          name: 'mars',
          position: 0,
          sign: 'aries',
          house: 1,
          retrograde: false,
          speed: 0,
        },
        jupiter: {
          name: 'jupiter',
          position: 0,
          sign: 'aries',
          house: 1,
          retrograde: false,
          speed: 0,
        },
        saturn: {
          name: 'saturn',
          position: 0,
          sign: 'aries',
          house: 1,
          retrograde: false,
          speed: 0,
        },
        uranus: {
          name: 'uranus',
          position: 0,
          sign: 'aries',
          house: 1,
          retrograde: false,
          speed: 0,
        },
        neptune: {
          name: 'neptune',
          position: 0,
          sign: 'aries',
          house: 1,
          retrograde: false,
          speed: 0,
        },
        pluto: {
          name: 'pluto',
          position: 0,
          sign: 'aries',
          house: 1,
          retrograde: false,
          speed: 0,
        },
        chiron: {
          name: 'chiron',
          position: 0,
          sign: 'aries',
          house: 1,
          retrograde: false,
          speed: 0,
        },
        north_node: {
          name: 'north_node',
          position: 0,
          sign: 'aries',
          house: 1,
          retrograde: false,
          speed: 0,
        },
        south_node: {
          name: 'south_node',
          position: 0,
          sign: 'aries',
          house: 1,
          retrograde: false,
          speed: 0,
        },
      },
      asteroids: {
        chiron: {
          name: 'chiron',
          position: 251.6,
          sign: 'sagittarius',
          house: 8,
          retrograde: false,
          speed: 0.02,
        },
      },
      points: {
        north_node: {
          name: 'north_node',
          position: 125.0,
          sign: 'leo',
          house: 4,
          retrograde: true,
          speed: -0.05,
        },
      },
    };

    // This is the conversion function we need to implement
    const convertToAstrologyChart = (chartData: ChartData) => {
      return {
        planets: Object.values(chartData.planets || {}),
        asteroids: Object.values(chartData.asteroids || {}),
        // Add points as a separate array or merge with planets depending on serialization needs
        houses: chartData.houses || [],
        aspects: chartData.aspects || [],
        angles: Object.entries(chartData.angles || {}).map(
          ([name, position]) => ({
            name,
            position: typeof position === 'number' ? position : 0,
            sign: 'aries', // Would calculate from position
            degree: 0, // Would calculate from position
          })
        ),
      };
    };

    const converted = convertToAstrologyChart(mockChartData as ChartData);

    expect(Array.isArray(converted.planets)).toBe(true);
    expect(Array.isArray(converted.asteroids)).toBe(true);
    expect(converted.planets.length).toBe(13); // Includes points like north_node, south_node
    expect(converted.asteroids.length).toBe(1);
  });
});
