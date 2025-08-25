import { describe, it, expect, beforeEach } from 'vitest';
import {
  serializeAstrologyData,
  deserializeAstrologyData,
} from '@cosmichub/types';
import type {
  AstrologyChart,
  UserProfile,
  NumerologyData,
} from '@cosmichub/types';

describe('Serialization and Deserialization', () => {
  let mockChart: AstrologyChart;
  let mockUserProfile: UserProfile;
  let mockNumerology: NumerologyData;

  beforeEach(() => {
    mockChart = {
      planets: [
        {
          name: 'Sun',
          sign: 'Leo',
          degree: 23.5,
          position: 233.5,
          house: 'House 5',
          retrograde: false,
        },
        {
          name: 'Moon',
          sign: 'Cancer',
          degree: 12.3,
          position: 102.3,
          house: 'House 4',
          retrograde: false,
        },
      ],
      houses: [
        {
          house: 1,
          number: 1,
          sign: 'Aries',
          degree: 0,
          cusp: 0,
          ruler: 'Mars',
        },
        {
          house: 2,
          number: 2,
          sign: 'Taurus',
          degree: 30,
          cusp: 30,
          ruler: 'Venus',
        },
      ],
      aspects: [
        {
          planet1: 'Sun',
          planet2: 'Moon',
          type: 'Trine',
          orb: 2.1,
          applying: 'separating',
        },
      ],
      asteroids: [
        {
          name: 'Ceres',
          sign: 'Virgo',
          degree: 15.7,
          house: 'House 6',
        },
      ],
      angles: [
        {
          name: 'Ascendant',
          sign: 'Aries',
          degree: 0,
          position: 0,
        },
      ],
    };

    mockUserProfile = {
      userId: 'test-user-123',
      birthData: {
        date: '1990-05-15',
        time: '14:30:00',
        location: 'New York, NY, USA',
      },
    };

    mockNumerology = {
      lifePath: 7,
      destiny: 3,
      personalYear: 9,
    };
  });

  describe('AstrologyChart Serialization', () => {
    it('should correctly serialize and deserialize a complete astrology chart', () => {
      const serialized = serializeAstrologyData(mockChart);
      expect(typeof serialized).toBe('string');
      expect(serialized.length).toBeGreaterThan(0);

      const deserialized = deserializeAstrologyData<AstrologyChart>(serialized);
      expect(deserialized).toEqual(mockChart);
    });

    it('should handle charts with empty arrays', () => {
      const emptyChart: AstrologyChart = {
        planets: [],
        houses: [],
        aspects: [],
        asteroids: [],
        angles: [],
      };

      const serialized = serializeAstrologyData(emptyChart);
      const deserialized = deserializeAstrologyData<AstrologyChart>(serialized);
      expect(deserialized).toEqual(emptyChart);
    });

    it('should preserve optional fields in planets', () => {
      const chartWithOptionals: AstrologyChart = {
        ...mockChart,
        planets: [
          {
            name: 'Mercury',
            sign: 'Gemini',
            degree: 8.2,
            position: 68.2,
            house: 'House 3',
            retrograde: true,
            aspects: [
              {
                planet1: 'Mercury',
                planet2: 'Venus',
                type: 'Conjunction',
                orb: 1.5,
                applying: 'applying',
              },
            ],
          },
        ],
      };

      const serialized = serializeAstrologyData(chartWithOptionals);
      const deserialized = deserializeAstrologyData<AstrologyChart>(serialized);
      const firstPlanet = deserialized.planets[0];
      expect(firstPlanet).toBeDefined();
      if (firstPlanet !== undefined) {
        expect(firstPlanet.retrograde).toBe(true);
        expect(firstPlanet.aspects).toHaveLength(1);
      }
    });
  });

  describe('UserProfile Serialization', () => {
    it('should correctly serialize and deserialize user profiles', () => {
      const serialized = serializeAstrologyData(mockUserProfile);
      expect(typeof serialized).toBe('string');

      const deserialized = deserializeAstrologyData<UserProfile>(serialized);
      expect(deserialized).toEqual(mockUserProfile);
      expect(deserialized.userId).toBe('test-user-123');
      expect(deserialized.birthData.date).toBe('1990-05-15');
    });

    it('should handle different date and time formats', () => {
      const profileWithDifferentFormat: UserProfile = {
        userId: 'user-456',
        birthData: {
          date: '1985-12-25',
          time: '23:45:00',
          location: 'London, UK',
        },
      };

      const serialized = serializeAstrologyData(profileWithDifferentFormat);
      const deserialized = deserializeAstrologyData<UserProfile>(serialized);
      expect(deserialized).toEqual(profileWithDifferentFormat);
    });
  });

  describe('NumerologyData Serialization', () => {
    it('should correctly serialize and deserialize numerology data', () => {
      const serialized = serializeAstrologyData(mockNumerology);
      expect(typeof serialized).toBe('string');

      const deserialized = deserializeAstrologyData<NumerologyData>(serialized);
      expect(deserialized).toEqual(mockNumerology);
      expect(deserialized.lifePath).toBe(7);
      expect(deserialized.destiny).toBe(3);
      expect(deserialized.personalYear).toBe(9);
    });

    it('should handle edge case numerology numbers', () => {
      const edgeCaseNumerology: NumerologyData = {
        lifePath: 11, // Master number
        destiny: 22, // Master number
        personalYear: 1,
      };

      const serialized = serializeAstrologyData(edgeCaseNumerology);
      const deserialized = deserializeAstrologyData<NumerologyData>(serialized);
      expect(deserialized).toEqual(edgeCaseNumerology);
    });
  });

  describe('Error Handling', () => {
    it('should throw an error for invalid JSON', () => {
      expect(() => {
        deserializeAstrologyData('invalid json');
      }).toThrow();
    });

    it('should throw an error for unknown data types', () => {
      const unknownData = { unknown: 'field', random: 123 };
      expect(() => {
        serializeAstrologyData(unknownData as any);
      }).toThrow('Failed to serialize data');
    });

    it('should handle malformed chart data gracefully', () => {
      const malformedChart = {
        planets: [{ name: 'Sun' }], // Missing required fields
        houses: [],
        aspects: [],
        asteroids: [],
        angles: [],
      };

      expect(() => {
        serializeAstrologyData(malformedChart as any);
      }).toThrow();
    });
  });

  describe('JSON Size Optimization', () => {
    it('should remove undefined values during serialization', () => {
      const chartWithUndefined: any = {
        planets: [
          {
            name: 'Sun',
            sign: 'Leo',
            degree: 23.5,
            position: 233.5,
            house: 'House 5',
            retrograde: undefined,
            aspects: undefined,
          },
        ],
        houses: [],
        aspects: [],
        asteroids: [],
        angles: [],
      };

      const serialized = serializeAstrologyData(chartWithUndefined);
      expect(serialized).not.toContain('undefined');

      // The serialized string should contain null instead of undefined
      const parsed = JSON.parse(serialized);
      expect(parsed.planets[0].retrograde).toBe(null);
    });

    it('should produce compact JSON without unnecessary whitespace', () => {
      const serialized = serializeAstrologyData(mockChart);
      expect(serialized).not.toContain('  '); // No double spaces
      expect(serialized).not.toContain('\n'); // No newlines
    });
  });

  describe('Integration with Chart Components', () => {
    it('should serialize chart data in a format compatible with ChartDisplay', () => {
      const serialized = serializeAstrologyData(mockChart);
      const deserialized = deserializeAstrologyData<AstrologyChart>(serialized);

      // Verify that all essential chart display fields are present
      expect(deserialized.planets).toBeDefined();
      expect(deserialized.houses).toBeDefined();
      expect(deserialized.aspects).toBeDefined();

      // Verify planet data is complete for rendering
      const planet0 = deserialized.planets[0];
      expect(planet0).toBeDefined();
      if (planet0 !== undefined) {
        expect(planet0.name).toBeDefined();
        expect(planet0.sign).toBeDefined();
        expect(planet0.degree).toBeDefined();
      }
    });

    it('should maintain precision for degree calculations', () => {
      const preciseChart: AstrologyChart = {
        ...mockChart,
        planets: [
          {
            name: 'Sun',
            sign: 'Leo',
            degree: 23.456789123,
            position: 233.456789123,
            house: 'House 5',
          },
        ],
      };

      const serialized = serializeAstrologyData(preciseChart);
      const deserialized = deserializeAstrologyData<AstrologyChart>(serialized);

      const precise0 = deserialized.planets[0];
      expect(precise0).toBeDefined();
      if (precise0 !== undefined) {
        expect(precise0.degree).toBeCloseTo(23.456789123, 6);
        expect(precise0.position).toBeCloseTo(233.456789123, 6);
      }
    });
  });
});
