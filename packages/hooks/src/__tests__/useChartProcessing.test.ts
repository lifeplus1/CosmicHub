import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useChartProcessing } from '../useChartProcessing';

describe('useChartProcessing - Critical Data Flow Fix Demo', () => {
  it('should handle the backend structure from test_final_fix.mjs', () => {
    // This is the exact structure from your test_final_fix.mjs file
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

    console.log('✅ HOOK RESULTS:');
    console.log('  - Main planets:', result.current.planets.length);
    console.log('  - Asteroids:', result.current.asteroids.length);
    console.log('  - Points:', result.current.points.length);  
    console.log('  - Houses:', result.current.houses.length);
    console.log('  - Aspects:', result.current.aspects.length);

    // Validate the categorization matches your expectations from test_final_fix.mjs
    expect(result.current.planets).toHaveLength(2); // sun, moon
    expect(result.current.asteroids).toHaveLength(3); // ceres, pallas, juno  
    expect(result.current.points).toHaveLength(6); // 3 points + 2 uranian + 1 hypothetical
    expect(result.current.houses).toHaveLength(12);
    expect(result.current.aspects).toHaveLength(1);

    // Verify specific categorizations
    const sunPlanet = result.current.planets.find(p => p.name.toLowerCase() === 'sun');
    expect(sunPlanet).toBeDefined();
    expect(sunPlanet?.position).toBe(30);

    const ceresAsteroid = result.current.asteroids.find(a => a.name.toLowerCase() === 'ceres');
    expect(ceresAsteroid).toBeDefined(); 
    expect(ceresAsteroid?.position).toBe(45);

    const northNodePoint = result.current.points.find(p => p.name.toLowerCase() === 'north_node');
    expect(northNodePoint).toBeDefined();
    expect(northNodePoint?.position).toBe(120);

    const cupidoPoint = result.current.points.find(p => p.name.toLowerCase() === 'cupido');
    expect(cupidoPoint).toBeDefined();
    expect(cupidoPoint?.position).toBe(75);
  });

  it('should handle saved chart data structure', () => {
    const savedChartData = {
      id: 'saved-123',
      birth_data: { name: 'Test Person' },
      chart_data: {
        planets: { sun: { position: 30, retrograde: false } },
        asteroids: { ceres: { position: 45, retrograde: false } },
        houses: [{ cusp: 0 }],
        aspects: [],
      }
    };

    const { result } = renderHook(() => 
      useChartProcessing(savedChartData, { enableDebug: false })
    );

    expect(result.current.source).toBe('saved_chart');
    expect(result.current.hasRawBackend).toBe(false);
    expect(result.current.planets).toHaveLength(1);
    expect(result.current.asteroids).toHaveLength(1);
  });

  it('should handle new calculation data with __raw_backend_response', () => {
    const newCalculationData = {
      transformed_data: { /* API transformed version */ },
      __raw_backend_response: {
        planets: { sun: { position: 60, retrograde: false } },
        houses: [{ cusp: 0 }],
        aspects: [],
      },
    };

    const { result } = renderHook(() => 
      useChartProcessing(newCalculationData, { enableDebug: false })
    );

    expect(result.current.source).toBe('new_calculation');
    expect(result.current.hasRawBackend).toBe(true);
    expect(result.current.planets).toHaveLength(1);
    expect(result.current.planets[0]?.position).toBe(60); // Uses raw backend data, not transformed
  });
});
