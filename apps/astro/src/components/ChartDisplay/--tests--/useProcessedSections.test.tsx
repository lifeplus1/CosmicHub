import { renderHook } from '@testing-library/react';
import { useProcessedSections } from '../hooks/useProcessedSections';
import type { ChartLike } from '../normalizeChart';

// Helper to build house cusps every 30 degrees
const houses = Array.from({ length: 12 }, (_, i) => ({
  house: i + 1,
  cusp: i * 30,
}));

describe('useProcessedSections', () => {
  // Shape matches normalizeChart expectations (object maps with position numbers)
  const baseChart: ChartLike = {
    planets: {
      Sun: { position: 10 }, // Aries 10°
      Moon: { position: 45 }, // Taurus 15°
      Mars: { position: 120 },
      Venus: { position: 75 },
      Jupiter: { position: 240 },
      Saturn: { position: 300 },
      Uranus: { position: 330 },
      Neptune: { position: 210 },
      Pluto: { position: 180 },
      'North Node': { position: 60 }, // Point (will become point category later)
      Vertex: { position: 90 },
    },
    asteroids: {
      Ceres: { position: 150 }, // sign filtering for 'cer'
      Pallas: { position: 165 },
    },
    houses,
    aspects: [
      { planet1: 'Sun', planet2: 'Moon', type: 'conjunction', orb: 0.5 },
      { planet1: 'Sun', planet2: 'Mars', type: 'square', orb: 3.2 },
    ],
    angles: {
      Ascendant: 0,
      MC: 270,
    },
  } as unknown as ChartLike;

  it('produces non-empty planet list for valid chart', () => {
    const { result } = renderHook(() => useProcessedSections(baseChart, ''));
    expect(result.current.planets.length).toBeGreaterThan(0);
  });

  it('filters by search term across entities', () => {
    const { result } = renderHook(() => useProcessedSections(baseChart, 'cer'));
    expect(result.current.asteroids.length).toBe(1);
    expect(result.current.asteroids[0]?.name.toLowerCase()).toBe('ceres');
    // Planets list should not include Sun when searching 'cer'
    expect(result.current.planets.some(p => p.name === 'sun')).toBe(false);
  });

  it('returns empty arrays for invalid chart', () => {
    const { result } = renderHook(() => useProcessedSections(null, 'Sun'));
    expect(result.current.planets).toHaveLength(0);
    expect(result.current.points).toHaveLength(0);
  });
});
