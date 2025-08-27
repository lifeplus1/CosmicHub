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

/**
 * Type guard for validating house data
 */

/**
 * Type guard for validating aspect data
 */

/**
 * Type guard for validating chart angles
 */

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

/**
 * Type guard for aspect types
 */

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

/**
 * Calculates dignities for a planet
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars

/**
 * Validates and normalizes aspect orbs
 */
