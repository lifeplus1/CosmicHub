import { describe, it, expect } from 'vitest';
import {
  getCelestialBodyCategory,
  isPlanetForDisplay,
  isAsteroid,
  isPoint,
} from '../celestialBodyCategorization';

describe('celestialBodyCategorization', () => {
  it('categorizes traditional planets', () => {
    expect(getCelestialBodyCategory('Sun')).toBe('traditional_planets');
    expect(isPlanetForDisplay('Sun')).toBe(true);
  });
  it('categorizes modern planets', () => {
    expect(getCelestialBodyCategory('Uranus')).toBe('modern_planets');
    expect(isPlanetForDisplay('Uranus')).toBe(true);
  });
  it('categorizes major asteroids', () => {
    expect(getCelestialBodyCategory('Ceres')).toBe('major_asteroids');
    expect(isAsteroid('Ceres')).toBe(true);
  });
  it('categorizes points', () => {
    expect(getCelestialBodyCategory('North_Node')).toBe('lunar_nodes');
  });
  it('returns null for unknown', () => {
    expect(getCelestialBodyCategory('UnknownBodyXYZ')).toBeNull();
    expect(isPlanetForDisplay('UnknownBodyXYZ')).toBe(false);
    expect(isAsteroid('UnknownBodyXYZ')).toBe(false);
    expect(isPoint('UnknownBodyXYZ')).toBe(false);
  });
});
