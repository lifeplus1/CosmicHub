/**
 * Validation utilities for chart data and API responses
 */
import type {
  ChartData,
  Planet,
  House,
  Aspect,
  PlanetName,
  ZodiacSign,
  AspectType,
  ChartAngles,
} from './api.types';

/**
 * Type guard for validating planet data
 */
export function isPlanet(obj: unknown): obj is Planet {
  if (obj === null || obj === undefined || typeof obj !== 'object') return false;
  
  const planet = obj as Planet;
  return (
    typeof planet.name === 'string' &&
    typeof planet.position === 'number' &&
    planet.position >= 0 &&
    planet.position < 360 &&
    typeof planet.sign === 'string' &&
    typeof planet.house === 'number' &&
    planet.house >= 1 &&
    planet.house <= 12 &&
    typeof planet.retrograde === 'boolean' &&
    typeof planet.speed === 'number'
  );
}

/**
 * Type guard for validating house data
 */
export function isHouse(obj: unknown): obj is House {
  if (obj === null || obj === undefined || typeof obj !== 'object') return false;
  
  const house = obj as House;
  return (
    typeof house.number === 'number' &&
    house.number >= 1 &&
    house.number <= 12 &&
    typeof house.cusp === 'number' &&
    house.cusp >= 0 &&
    house.cusp < 360 &&
    typeof house.sign === 'string'
  );
}

/**
 * Type guard for validating aspect data
 */
export function isAspect(obj: unknown): obj is Aspect {
  if (obj === null || obj === undefined || typeof obj !== 'object') return false;
  
  const aspect = obj as Aspect;
  return (
    typeof aspect.aspect_type === 'string' &&
    typeof aspect.planet1 === 'string' &&
    typeof aspect.planet2 === 'string' &&
    typeof aspect.orb === 'number' &&
    typeof aspect.applying === 'boolean' &&
    typeof aspect.exact === 'boolean'
  );
}

/**
 * Type guard for validating chart angles
 */
export function isChartAngles(obj: unknown): obj is ChartAngles {
  if (obj === null || obj === undefined || typeof obj !== 'object') return false;
  
  const angles = obj as ChartAngles;
  return (
    typeof angles.ascendant === 'number' &&
    typeof angles.midheaven === 'number' &&
    typeof angles.descendant === 'number' &&
    typeof angles.imumcoeli === 'number'
  );
}

/**
 * Type guard for validating complete chart data
 */
export function isValidChartData(obj: unknown): obj is ChartData {
  if (obj === null || obj === undefined || typeof obj !== 'object') return false;
  
  const chart = obj as ChartData;
  return (
    typeof chart.planets === 'object' &&
    Object.values(chart.planets).every(isPlanet) &&
    Array.isArray(chart.houses) &&
    chart.houses.every(isHouse) &&
    Array.isArray(chart.aspects) &&
    chart.aspects.every(isAspect) &&
    isChartAngles(chart.angles) &&
    typeof chart.latitude === 'number' &&
    typeof chart.longitude === 'number' &&
    typeof chart.timezone === 'string' &&
    typeof chart.julian_day === 'number' &&
    typeof chart.house_system === 'string'
  );
}

/**
 * Type guard for zodiac signs
 */
export function isZodiacSign(value: string): value is ZodiacSign {
  const validSigns: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  return validSigns.includes(value as ZodiacSign);
}

/**
 * Type guard for planet names
 */
export function isPlanetName(value: string): value is PlanetName {
  const validPlanets: PlanetName[] = [
    'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
    'uranus', 'neptune', 'pluto', 'chiron', 'north_node', 'south_node'
  ];
  return validPlanets.includes(value as PlanetName);
}

/**
 * Type guard for aspect types
 */
export function isAspectType(value: string): value is AspectType {
  const validAspects: AspectType[] = [
    'conjunction', 'opposition', 'trine', 'square',
    'sextile', 'quincunx', 'semisextile'
  ];
  return validAspects.includes(value as AspectType);
}

/**
 * Validates all required planets are present in chart data
 */
export function hasRequiredPlanets(planets: Record<PlanetName, Planet>): boolean {
  const requiredPlanets: PlanetName[] = [
    'sun', 'moon', 'mercury', 'venus', 'mars',
    'jupiter', 'saturn'
  ];
  return requiredPlanets.every(planet => planets[planet] !== undefined);
}

/**
 * Validates house system is supported
 */
export function isValidHouseSystem(
  system: string
): system is 'placidus' | 'koch' | 'equal' | 'whole_sign' | 'regiomontanus' | 'campanus' | 'porphyry' {
  const validSystems = [
    'placidus', 'koch', 'equal', 'whole_sign',
    'regiomontanus', 'campanus', 'porphyry'
  ];
  return validSystems.includes(system);
}

/**
 * Calculates dignities for a planet
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateDignities(planet: Planet): Planet['dignity'] {
  // Implement dignity calculation logic
  return undefined; // Placeholder
}

/**
 * Validates and normalizes aspect orbs
 */
export function normalizeAspectOrb(orb: number, aspectType: AspectType): number {
  const maxOrbs: Record<AspectType, number> = {
    conjunction: 10,
    opposition: 10,
    trine: 8,
    square: 8,
    sextile: 6,
    quincunx: 3,
    semisextile: 3
  };
  
  return Math.min(Math.abs(orb), maxOrbs[aspectType]);
}
