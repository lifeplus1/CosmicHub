import type { ChartData, PlanetName, Planet } from '../services/api.types';

/**
 * Deterministic stub ChartData factory for examples and tests.
 * Accepts partial overrides for flexibility.
 */
export function createStubChartData(
  overrides: Partial<ChartData> = {}
): ChartData {
  const createPlanet = (name: PlanetName, position: number): Planet => ({
    name,
    position,
    sign: 'aries',
    house: 1,
    retrograde: false,
    speed: 0,
  });

  const base: ChartData = {
    planets: {
      sun: createPlanet('sun', 0),
      moon: createPlanet('moon', 30),
      mercury: createPlanet('mercury', 60),
      venus: createPlanet('venus', 90),
      mars: createPlanet('mars', 120),
      jupiter: createPlanet('jupiter', 150),
      saturn: createPlanet('saturn', 180),
      uranus: createPlanet('uranus', 210),
      neptune: createPlanet('neptune', 240),
      pluto: createPlanet('pluto', 270),
      chiron: createPlanet('chiron', 300),
      north_node: createPlanet('north_node', 330),
      south_node: createPlanet('south_node', 345),
    },
    houses: [
      { number: 1, cusp: 0, sign: 'aries' },
      { number: 2, cusp: 30, sign: 'taurus' },
    ],
    aspects: [
      {
        aspect_type: 'square',
        planet1: 'sun',
        planet2: 'moon',
        orb: 5,
        applying: false,
        exact: false,
      },
    ],
    angles: { ascendant: 0, midheaven: 90, descendant: 180, imumcoeli: 270 },
    latitude: 0,
    longitude: 0,
    timezone: 'UTC',
    julian_day: 0,
    house_system: 'placidus',
  };

  return { ...base, ...overrides };
}

export default createStubChartData;
