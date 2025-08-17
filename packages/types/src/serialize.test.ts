import { describe, it, expect } from 'vitest';
import { serializeAstrologyData, deserializeAstrologyData } from './serialize.js';
import type { AstrologyChart } from './astrology.types.js';

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
