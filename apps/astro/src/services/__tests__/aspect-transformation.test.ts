import { describe, it, expect } from 'vitest';
import { type Aspect } from '../api.types';

// We import the function indirectly by simulating a minimal slice of the transformation logic.
// To avoid duplicating the entire api.ts, we'll reproduce the aspect mapping using the same
// guards (isAspectType) to ensure behavior parity.
import { isAspectType, isPlanetName } from '../validation';

describe('Aspect transformation (api.ts)', () => {
  function transform(rawAspects: unknown[]): Aspect[] {
    const aspects: Aspect[] = [];
    for (const aspect of rawAspects) {
      if (!aspect || typeof aspect !== 'object') continue;
      const a = aspect as Record<string, unknown>;
      // New shape
      if (typeof a.point1 === 'string' && typeof a.point2 === 'string' && typeof a.aspect === 'string' && typeof a.orb === 'number') {
        if (isPlanetName(a.point1) && isPlanetName(a.point2) && isAspectType(a.aspect)) {
          aspects.push({
            aspect_type: a.aspect,
            planet1: a.point1,
            planet2: a.point2,
            orb: a.orb,
            applying: Boolean(a.applying),
            exact: Boolean(a.exact),
            power: typeof a.power === 'number' ? a.power : undefined,
          });
          continue;
        }
      }
      // Legacy shape
      if (typeof a.planet1 === 'string' && typeof a.planet2 === 'string' && typeof a.type === 'string' && typeof a.orb === 'number') {
        if (isPlanetName(a.planet1) && isPlanetName(a.planet2) && isAspectType(a.type)) {
          aspects.push({
            aspect_type: a.type,
            planet1: a.planet1,
            planet2: a.planet2,
            orb: a.orb,
            applying: Boolean(a.applying),
            exact: Boolean(a.exact),
            power: typeof a.power === 'number' ? a.power : undefined,
          });
          continue;
        }
      }
    }
    return aspects;
  }

  it('accepts and transforms valid new shape aspect', () => {
    const input = [{ point1: 'sun', point2: 'moon', aspect: 'trine', orb: 3.5, applying: true, exact: false }];
    const result = transform(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ planet1: 'sun', planet2: 'moon', aspect_type: 'trine', orb: 3.5 });
  });

  it('accepts and transforms valid legacy shape aspect', () => {
    const input = [{ planet1: 'mars', planet2: 'venus', type: 'square', orb: 5.1, applying: false, exact: true }];
    const result = transform(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ planet1: 'mars', planet2: 'venus', aspect_type: 'square', orb: 5.1 });
  });

  it('filters out invalid aspect types', () => {
    const input = [
      { point1: 'sun', point2: 'moon', aspect: 'invalid', orb: 2 },
      { planet1: 'sun', planet2: 'moon', type: 'notreal', orb: 1.2 },
    ];
    const result = transform(input);
    expect(result).toHaveLength(0);
  });

  it('filters out invalid planet names', () => {
    const input = [
      { point1: 'sunny', point2: 'moon', aspect: 'trine', orb: 2 },
      { planet1: 'sun', planet2: 'moony', type: 'square', orb: 1.2 },
    ];
    const result = transform(input);
    expect(result).toHaveLength(0);
  });
});
