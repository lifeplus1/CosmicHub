import { describe, it, expect } from 'vitest';
import { normalizeChart, isChartLike, hasChartContent, getSignFromDegree, getRulerFromSign, getAspectOrb, type ChartLike } from '../normalizeChart';

// Helper to deeply clone via JSON for immutability checks
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

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

  it('normalizes record-shaped planets into array form with derived sign + degree', () => {
    const raw: ChartLike = { planets: { sun: { position: 150.5 }, moon: { degree: 33.2, sign: 'Taurus' } } };
    const { planets } = normalizeChart(raw);
    const sun = planets.find(p => p.name === 'Sun');
    const moon = planets.find(p => p.name === 'Moon');
    expect(sun).toBeDefined();
    expect(sun?.sign).toBe(getSignFromDegree(150.5));
    expect(sun?.degree).toBeCloseTo(150.5 % 30, 5);
    expect(moon?.sign).toBe('Taurus'); // preserves explicit sign
    expect(moon?.degree).toBeCloseTo(33.2 % 30, 5);
  });

  it('derives rulers and degrees for houses', () => {
    const raw: ChartLike = { houses: [ { number: 1, cusp: 12 }, { number: 2, cusp: 47 } ] };
    const { houses } = normalizeChart(raw);
  const h0 = houses[0];
  const h1 = houses[1];
    expect(h0).toBeDefined();
    expect(h1).toBeDefined();
    if (h0 !== undefined) {
      expect(h0.degree).toBe(12 % 30);
      expect(h0.ruler).toBe(getRulerFromSign(h0.sign));
    }
    if (h1 !== undefined) {
      expect(h1.degree).toBe(47 % 30);
    }
  });

  it('parses aspect orb intelligently and applies default when missing', () => {
    const raw: ChartLike = { aspects: [ { planet1: 'Sun', planet2: 'Moon', type: 'Conjunction', orb: '5.2' }, { planet1: 'Venus', planet2: 'Mars', type: 'Square' } ] };
    const { aspects } = normalizeChart(raw);
    const conj = aspects.find(a => a.type === 'Conjunction');
    const square = aspects.find(a => a.type === 'Square');
    expect(conj?.orb).toBeCloseTo(5.2, 5);
    // Default for square should use getAspectOrb logic (8 for non conj/opp when not provided)
    expect(square?.orb).toBe(getAspectOrb('Square'));
  });

  it('handles angles provided as mixed record', () => {
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
