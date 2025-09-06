import { describe, it, expect } from 'vitest';
import {
  normalizeChart,
  isChartLike,
  hasChartContent,
  getAspectOrb,
  type ChartLike,
} from '../normalizeChart';
import {
  getSignFromDegreesCapitalized,
  getRulerFromSign,
} from '../../../utils/astrologyUtils';
// Test utilities - commented out until test factory is implemented
// import { createTestChart, createTestPlanet, createTestHouse, createTestAspect } from '../../../__tests__/utils/test-data-factory';

// Helper functions to match the expected test interface
const getSignFromDegree = getSignFromDegreesCapitalized;

// Helper to deeply clone via JSON for immutability checks
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj)) as T;

describe('normalizeChart utilities', () => {
  it('identifies a loose chart-like object', () => {
    const raw: ChartLike = { planets: { sun: { position: 123 } } };
    expect(isChartLike(raw)).toBe(true);
    expect(hasChartContent(raw)).toBe(true);
  });

  it('returns empty arrays for missing sections', () => {
    const result = normalizeChart({ planets: {} });
    expect(result.planets).toHaveLength(0); // empty object becomes []
    expect(result.houses).toHaveLength(0);
    expect(result.aspects).toHaveLength(0);
    expect(result.asteroids).toHaveLength(0);
    expect(result.angles).toHaveLength(0);
  });

  it.skip('normalizes record-shaped planets into array form with derived sign + degree', () => {
    const raw: ChartLike = {
      planets: {
        sun: { position: 150.5 },
        moon: { degree: 33.2, sign: 'Taurus' },
      },
    };
    const { planets } = normalizeChart(raw);

    // Debug: log the actual planets array
    console.log('planets:', planets);
    console.log('planets length:', planets.length);
    planets.forEach(p =>
      console.log('planet:', p.name, p.position, p.sign, p.degree)
    );

    const sun = planets.find(p => p.name === 'sun');
    const moon = planets.find(p => p.name === 'moon');
    expect(sun).toBeDefined();
    if (sun) {
      expect(sun.sign).toBe(getSignFromDegree(150.5));
      expect(sun.degree).toBeCloseTo(150.5 % 30, 5);
    }
    if (moon) {
      expect(moon.sign).toBe('Taurus'); // preserves explicit sign
      expect(moon.degree).toBeCloseTo(33.2 % 30, 5);
    }
  });

  it('derives rulers and degrees for houses', () => {
    const raw: ChartLike = {
      houses: [
        { number: 1, cusp: 12 },
        { number: 2, cusp: 47 },
      ],
    };
    const { houses } = normalizeChart(raw);
    const h0 = houses[0];
    const h1 = houses[1];
    expect(h0).toBeDefined();
    expect(h1).toBeDefined();
    if (h0 !== undefined) {
      expect(h0.degree).toBe(12 % 30);
      expect(h0.ruler).toBe(getRulerFromSign(h0.sign.toLowerCase() as any));
    }
    if (h1 !== undefined) {
      expect(h1.degree).toBe(47 % 30);
    }
  });

  it.skip('parses aspect orb intelligently and applies default when missing', () => {
    const raw: ChartLike = {
      aspects: [
        { planet1: 'Sun', planet2: 'Moon', type: 'Conjunction', orb: '5.2' },
        { planet1: 'Venus', planet2: 'Mars', type: 'Square' },
      ],
    };
    const { aspects } = normalizeChart(raw);
    const conj = aspects.find(a => a.aspect_type === 'conjunction');
    const square = aspects.find(a => a.aspect_type === 'square');
    expect(conj?.orb).toBeCloseTo(5.2, 5);
    // Default for square should use getAspectOrb logic (8 for non conj/opp when not provided)
    expect(square?.orb).toBe(getAspectOrb('Square'));
  });

  it.skip('handles angles provided as mixed record', () => {
    const raw: ChartLike = { angles: { ascendant: 0, mc: 182.4 } };
    const { angles } = normalizeChart(raw);
    const asc = angles.find(a => a.name === 'Ascendant');
    const mc = angles.find(a => a.name?.toLowerCase() === 'mc');
    expect(asc?.degree).toBeCloseTo(0, 5);
    expect(mc?.degree).toBeCloseTo(182.4 % 30, 5);
  });

  it('is pure and does not mutate input object', () => {
    const raw: ChartLike = { planets: { sun: { position: 10 } } };
    const snapshot = clone(raw);
    normalizeChart(raw);
    expect(raw).toEqual(snapshot);
  });
});
