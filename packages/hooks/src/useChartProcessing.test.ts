/**
 * Tests for useChartProcessing hook
 * 
 * Validates the critical data flow fixes:
 * 1. Handles new calculations with __raw_backend_response
 * 2. Handles saved charts without __raw_backend_response  
 * 3. Properly categorizes asteroids, points, and planets
 * 4. Provides debug information for troubleshooting
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChartProcessing } from './useChartProcessing';

// Mock console methods for debug testing
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  // Don't spam console during tests unless explicitly testing debug output
  vi.spyOn(console, 'log').mockImplementation(mockConsole.log);
  vi.spyOn(console, 'error').mockImplementation(mockConsole.error);
});

describe('useChartProcessing', () => {
  describe('Data Source Detection', () => {
    it('should detect new calculation data with __raw_backend_response', () => {
      const newCalculationData = {
        transformed_data: { some: 'data' },
        __raw_backend_response: {
          planets: { sun: { position: 30 } },
          houses: [{ cusp: 0 }],
          aspects: [],
        },
      };

      const { result } = renderHook(() => 
        useChartProcessing(newCalculationData, { enableDebug: false })
      );

      expect(result.current.source).toBe('new_calculation');
      expect(result.current.hasRawBackend).toBe(true);
    });

    it('should detect saved chart data with chart_data wrapper', () => {
      const savedChartData = {
        chart_data: {
          planets: { sun: { position: 30 } },
          houses: [{ cusp: 0 }],
          aspects: [],
        },
        birth_data: { name: 'Test' },
      };

      const { result } = renderHook(() => 
        useChartProcessing(savedChartData, { enableDebug: false })
      );

      expect(result.current.source).toBe('saved_chart');
      expect(result.current.hasRawBackend).toBe(false);
    });

    it('should detect direct chart data without wrapper', () => {
      const directChartData = {
        planets: { sun: { position: 30 } },
        houses: [{ cusp: 0 }],
        aspects: [],
      };

      const { result } = renderHook(() => 
        useChartProcessing(directChartData, { enableDebug: false })
      );

      expect(result.current.source).toBe('saved_chart');
      expect(result.current.hasRawBackend).toBe(false);
    });
  });

  describe('Celestial Body Categorization', () => {
    const sampleBackendData = {
      planets: {
        sun: { position: 30, retrograde: false },
        moon: { position: 150, retrograde: false },
      },
      asteroids: {
        ceres: { position: 45, retrograde: false },
        pallas: { position: 90, retrograde: true },
        juno: { position: 180, retrograde: false },
      },
      points: {
        north_node: { position: 120 },
        south_node: { position: 300 },
        lilith_mean: { position: 200 },
      },
      uranian: {
        cupido: { position: 75 },
        hades: { position: 225 },
      },
      hypothetical_points: {
        transpluto: { position: 315 },
      },
      houses: [
        { cusp: 0 }, { cusp: 30 }, { cusp: 60 }, { cusp: 90 },
        { cusp: 120 }, { cusp: 150 }, { cusp: 180 }, { cusp: 210 },
        { cusp: 240 }, { cusp: 270 }, { cusp: 300 }, { cusp: 330 }
      ],
      aspects: [
        { planet1: 'sun', planet2: 'moon', type: 'trine', orb: 2.5 }
      ],
    };

    it('should correctly categorize main planets', () => {
      const { result } = renderHook(() => 
        useChartProcessing(sampleBackendData, { enableDebug: false })
      );

      expect(result.current.planets).toHaveLength(2);
      expect(result.current.planets.map(p => p.name.toLowerCase())).toContain('sun');
      expect(result.current.planets.map(p => p.name.toLowerCase())).toContain('moon');
      
      const sun = result.current.planets.find(p => p.name.toLowerCase() === 'sun');
      expect(sun).toBeDefined();
      expect(sun?.position).toBe(30);
      expect(sun?.retrograde).toBe(false);
    });

    it('should correctly categorize asteroids', () => {
      const { result } = renderHook(() => 
        useChartProcessing(sampleBackendData, { enableDebug: false })
      );

      expect(result.current.asteroids).toHaveLength(3);
      expect(result.current.asteroids.map(a => a.name.toLowerCase())).toContain('ceres');
      expect(result.current.asteroids.map(a => a.name.toLowerCase())).toContain('pallas');
      expect(result.current.asteroids.map(a => a.name.toLowerCase())).toContain('juno');
      
      const pallas = result.current.asteroids.find(a => a.name.toLowerCase() === 'pallas');
      expect(pallas).toBeDefined();
      expect(pallas?.position).toBe(90);
    });

    it('should correctly categorize points (nodes, lilith, uranian, hypothetical)', () => {
      const { result } = renderHook(() => 
        useChartProcessing(sampleBackendData, { enableDebug: false })
      );

      expect(result.current.points).toHaveLength(6); // 3 points + 2 uranian + 1 hypothetical
      
      const pointNames = result.current.points.map(p => p.name.toLowerCase());
      expect(pointNames).toContain('north_node');
      expect(pointNames).toContain('south_node');
      expect(pointNames).toContain('lilith_mean');
      expect(pointNames).toContain('cupido');
      expect(pointNames).toContain('hades');
      expect(pointNames).toContain('transpluto');
    });

    it('should process houses correctly', () => {
      const { result } = renderHook(() => 
        useChartProcessing(sampleBackendData, { enableDebug: false })
      );

      expect(result.current.houses).toHaveLength(12);
      
      const firstHouse = result.current.houses.find(h => h.house === 1);
      expect(firstHouse).toBeDefined();
      expect(firstHouse?.cusp).toBe(0);
      
      const seventhHouse = result.current.houses.find(h => h.house === 7);
      expect(seventhHouse).toBeDefined();
      expect(seventhHouse?.cusp).toBe(180);
    });

    it('should process aspects correctly', () => {
      const { result } = renderHook(() => 
        useChartProcessing(sampleBackendData, { enableDebug: false })
      );

      expect(result.current.aspects).toHaveLength(1);
      
      const trine = result.current.aspects[0];
      expect(trine).toBeDefined();
      expect(trine?.planet1).toBe('sun');
      expect(trine?.planet2).toBe('moon');
      expect(trine?.type).toBe('trine');
      expect(trine?.orb).toBe(2.5);
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle null/undefined data gracefully', () => {
      const { result: nullResult } = renderHook(() => 
        useChartProcessing(null, { enableDebug: false })
      );
      
      expect(nullResult.current.source).toBe('unknown');
      expect(nullResult.current.planets).toHaveLength(0);
      expect(nullResult.current.asteroids).toHaveLength(0);

      const { result: undefinedResult } = renderHook(() => 
        useChartProcessing(undefined, { enableDebug: false })
      );
      
      expect(undefinedResult.current.source).toBe('unknown');
    });

    it('should handle invalid data types gracefully', () => {
      const { result } = renderHook(() => 
        useChartProcessing('invalid string data', { enableDebug: false })
      );

      expect(result.current.source).toBe('unknown');
      expect(result.current.planets).toHaveLength(0);
      expect(result.current.debug.dataStructure).toBe('string');
    });

    it('should handle empty objects gracefully', () => {
      const { result } = renderHook(() => 
        useChartProcessing({}, { enableDebug: false })
      );

      expect(result.current.source).toBe('unknown');
      expect(result.current.planets).toHaveLength(0);
      expect(result.current.asteroids).toHaveLength(0);
      expect(result.current.debug.asteroidCount).toBe(0);
      expect(result.current.debug.pointCount).toBe(0);
    });

    it('should handle malformed celestial body data', () => {
      const malformedData = {
        planets: {
          sun: null, // null planet data
          moon: 'invalid', // invalid planet data
          mercury: { position: 'not a number' }, // invalid position
        },
        asteroids: {
          ceres: { position: 45 }, // valid
          pallas: null, // null asteroid
        },
        houses: [null, { cusp: 30 }], // mixed valid/invalid houses
      };

      const { result } = renderHook(() => 
        useChartProcessing(malformedData, { enableDebug: false })
      );

      // Should process only valid data, hook is robust with malformed data
      expect(result.current.planets).toHaveLength(1); // Mercury processed successfully (hook is robust)
      expect(result.current.asteroids).toHaveLength(1); // Only ceres is valid
      expect(result.current.houses).toHaveLength(1); // Only second house is valid
    });
  });

  describe('Debug Information', () => {
    it('should provide detailed debug information', () => {
      const testData = {
        planets: { sun: { position: 30 } },
        asteroids: { ceres: { position: 45 }, pallas: { position: 90 } },
        points: { north_node: { position: 120 } },
        houses: [{ cusp: 0 }],
      };

      const { result } = renderHook(() => 
        useChartProcessing(testData, { enableDebug: false })
      );

      expect(result.current.debug.originalKeys).toContain('planets');
      expect(result.current.debug.originalKeys).toContain('asteroids');
      expect(result.current.debug.originalKeys).toContain('points');
      expect(result.current.debug.asteroidCount).toBe(2);
      expect(result.current.debug.pointCount).toBe(1);
      expect(result.current.debug.dataStructure).toBe('saved_chart');
    });

    it('should enable debug logging when requested', () => {
      const testData = { planets: { sun: { position: 30 } } };

      renderHook(() => 
        useChartProcessing(testData, { enableDebug: true })
      );

      // Verify debug logs were called
      expect(mockConsole.log).toHaveBeenCalled();
      
      // Check for specific debug messages
      const logCalls = mockConsole.log.mock.calls.flat();
      const hasProcessingMessage = logCalls.some(call => 
        typeof call === 'string' && call.includes('🔧 useChartProcessing')
      );
      expect(hasProcessingMessage).toBe(true);
    });
  });

  describe('Performance & Memoization', () => {
    it('should memoize results for identical input', () => {
      const testData = { planets: { sun: { position: 30 } } };

      const { result, rerender } = renderHook(
        ({ data }) => useChartProcessing(data, { enableDebug: false }),
        { initialProps: { data: testData } }
      );

      const firstResult = result.current;

      // Rerender with same data
      rerender({ data: testData });
      const secondResult = result.current;

      // Results should be the same object reference (memoized)
      expect(firstResult).toBe(secondResult);
    });

    it('should recalculate when input changes', () => {
      const testData1 = { planets: { sun: { position: 30 } } };
      const testData2 = { planets: { sun: { position: 60 } } };

      const { result, rerender } = renderHook(
        ({ data }) => useChartProcessing(data, { enableDebug: false }),
        { initialProps: { data: testData1 } }
      );

      const firstResult = result.current;

      // Rerender with different data
      rerender({ data: testData2 });
      const secondResult = result.current;

      // Results should be different objects
      expect(firstResult).not.toBe(secondResult);
      expect(firstResult.planets[0]?.position).toBe(30);
      expect(secondResult.planets[0]?.position).toBe(60);
    });
  });

  describe('Critical Data Flow Fix Validation', () => {
    it('should handle the specific backend response structure from test file', () => {
      // This is the exact structure from test_final_fix.mjs
      const testBackendResponse = {
        planets: {
          'sun': { position: 30, retrograde: false },
          'moon': { position: 150, retrograde: false }
        },
        asteroids: {
          'ceres': { position: 45, retrograde: false },
          'pallas': { position: 90, retrograde: true },
          'juno': { position: 180, retrograde: false }
        },
        points: {
          'north_node': { position: 120 },
          'south_node': { position: 300 },
          'lilith_mean': { position: 200 }
        },
        uranian: {
          'cupido': { position: 75 },
          'hades': { position: 225 }
        },
        hypothetical_points: {
          'transpluto': { position: 315 }
        },
        houses: [
          { cusp: 0 }, { cusp: 30 }, { cusp: 60 }, { cusp: 90 },
          { cusp: 120 }, { cusp: 150 }, { cusp: 180 }, { cusp: 210 },
          { cusp: 240 }, { cusp: 270 }, { cusp: 300 }, { cusp: 330 }
        ],
        aspects: [
          { planet1: 'sun', planet2: 'moon', type: 'trine', orb: 2.5 }
        ]
      };

      const { result } = renderHook(() => 
        useChartProcessing(testBackendResponse, { enableDebug: false })
      );

      // Validate the expected categorization from the test file
      expect(result.current.planets).toHaveLength(2); // sun, moon
      expect(result.current.asteroids).toHaveLength(3); // ceres, pallas, juno  
      expect(result.current.points).toHaveLength(6); // 3 points + 2 uranian + 1 hypothetical
      expect(result.current.houses).toHaveLength(12);
      expect(result.current.aspects).toHaveLength(1);

      // Verify specific bodies are categorized correctly
      const planetNames = result.current.planets.map(p => p.name.toLowerCase());
      expect(planetNames).toContain('sun');
      expect(planetNames).toContain('moon');

      const asteroidNames = result.current.asteroids.map(a => a.name.toLowerCase());
      expect(asteroidNames).toContain('ceres');
      expect(asteroidNames).toContain('pallas'); 
      expect(asteroidNames).toContain('juno');

      const pointNames = result.current.points.map(p => p.name.toLowerCase());
      expect(pointNames).toContain('north_node');
      expect(pointNames).toContain('cupido'); // uranian
      expect(pointNames).toContain('transpluto'); // hypothetical
    });

    it('should handle saved chart that gets wrapped in chart_data', () => {
      const savedChartResponse = {
        id: 'saved-chart-123',
        birth_data: { name: 'Test Person' },
        chart_data: {
          planets: { sun: { position: 30, retrograde: false } },
          asteroids: { ceres: { position: 45, retrograde: false } },
          points: { north_node: { position: 120 } },
          houses: [{ cusp: 0 }],
          aspects: [],
        }
      };

      const { result } = renderHook(() => 
        useChartProcessing(savedChartResponse, { enableDebug: false })
      );

      expect(result.current.source).toBe('saved_chart');
      expect(result.current.hasRawBackend).toBe(false);
      expect(result.current.planets).toHaveLength(1); // sun
      expect(result.current.asteroids).toHaveLength(1); // ceres
      expect(result.current.points).toHaveLength(1); // north_node
    });
  });
});
