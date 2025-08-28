/**
 * Validation utilities for chart data and API responses
 */
import type { PlanetName, AspectType } from '@cosmichub/types';

// Local type definitions
type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

// Local interfaces for validation
interface Planet {
  name: string;
  position: number;
  sign: string;
  house: number;
  retrograde: boolean;
  speed: number;
  dignity?: 'domicile' | 'exaltation' | 'fall' | 'detriment';
}

interface House {
  number: number;
  cusp: number;
  sign: string;
}

interface Aspect {
  planet1: string;
  planet2: string;
  aspect_type: string;
  type: string;
  orb: number;
  applying: boolean;
  exact: boolean;
}

interface ChartAngles {
  ascendant: number;
  midheaven: number;
  descendant: number;
  imumcoeli: number;
}

interface ChartData {
  planets: Record<string, Planet>;
  houses: House[];
  aspects: Aspect[];
  angles: ChartAngles;
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  house_system: string;
}

/**
 * Type guard for validating planet data
 */
export function isPlanet(obj: unknown): obj is Planet {
  if (obj === null || typeof obj !== 'object') return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p.name === 'string' &&
    typeof p.position === 'number' &&
    p.position >= 0 &&
    p.position < 360 &&
    typeof p.sign === 'string' &&
    typeof p.house === 'number' &&
    p.house >= 1 &&
    p.house <= 12 &&
    typeof p.retrograde === 'boolean' &&
    typeof p.speed === 'number'
  );
}

/**
 * Type guard for validating house data
 */
export function isHouse(obj: unknown): obj is House {
  if (obj === null || typeof obj !== 'object') return false;
  const h = obj as House;
  return (
    typeof h.number === 'number' &&
    h.number >= 1 &&
    h.number <= 12 &&
    typeof h.cusp === 'number' &&
    h.cusp >= 0 &&
    h.cusp < 360 &&
    typeof h.sign === 'string'
  );
}

/**
 * Type guard for validating aspect data
 */
export function isAspect(obj: unknown): obj is Aspect {
  if (obj === null || typeof obj !== 'object') return false;
  const a = obj as Aspect;
  return (
    typeof a.aspect_type === 'string' &&
    typeof a.planet1 === 'string' &&
    typeof a.planet2 === 'string' &&
    typeof a.orb === 'number' &&
    typeof a.applying === 'boolean' &&
    typeof a.exact === 'boolean'
  );
}

/**
 * Type guard for validating chart angles
 */
export function isChartAngles(obj: unknown): obj is ChartAngles {
  if (obj === null || typeof obj !== 'object') return false;
  const ang = obj as ChartAngles;
  return (
    typeof ang.ascendant === 'number' &&
    typeof ang.midheaven === 'number' &&
    typeof ang.descendant === 'number' &&
    typeof ang.imumcoeli === 'number'
  );
}

/**
 * Type guard for validating complete chart data
 */
export function isValidChartData(obj: unknown): obj is ChartData {
  if (obj === null || obj === undefined || typeof obj !== 'object')
    return false;

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
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];
  return validSigns.includes(value as ZodiacSign);
}

/**
 * Type guard for planet names
 */
export function isPlanetName(value: string): value is PlanetName {
  const list: PlanetName[] = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
    'chiron',
    'north_node',
    'south_node',
  ];
  return list.includes(value as PlanetName);
}

/**
 * Type guard for aspect types
 */
export function isAspectType(value: string): value is AspectType {
  const list: AspectType[] = [
    'conjunction',
    'opposition',
    'trine',
    'square',
    'sextile',
    'quincunx',
    'semi-sextile',
  ];
  return list.includes(value as AspectType);
}

/**
 * Validates all required planets are present in chart data
 */
export function hasRequiredPlanets(
  planets: Record<PlanetName, Planet>
): boolean {
  const requiredPlanets: PlanetName[] = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
  ];
  return requiredPlanets.every(planet => planets[planet] !== undefined);
}

/**
 * Validates house system is supported
 */
export function isValidHouseSystem(
  system: string
): system is ChartData['house_system'] {
  const list = [
    'placidus',
    'koch',
    'equal',
    'whole_sign',
    'regiomontanus',
    'campanus',
    'porphyry',
  ];
  return list.includes(system);
}

/**
 * Calculates dignities for a planet
 */

export function calculateDignities(_planet: Planet): Planet['dignity'] {
  return undefined; // placeholder implementation
}

/**
 * Validates and normalizes aspect orbs
 */
export function normalizeAspectOrb(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
