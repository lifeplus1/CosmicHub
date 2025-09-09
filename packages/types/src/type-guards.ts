/**
 * Type Guards for Astrology Data Types
 * 
 * This module provides type predicates (type guards) for safely narrowing types
 * at runtime. These guards allow for more precise type checking in TypeScript
 * and help prevent runtime errors by validating data structures.
 */

import type {
  AstrologyChart,
  Planet,
  House,
  Aspect,
  Asteroid,
  ChartAngles,
  UserProfile,
  NumerologyData,
} from './astrology.types';

/**
 * Type guard for Planet objects (compatible with bridge system)
 */
export function isPlanet(value: unknown): value is Planet {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj['name'] === 'string' &&
    typeof obj['sign'] === 'string' &&
    typeof obj['position'] === 'number' &&
    typeof obj['house'] === 'number' &&
    (obj['degree'] === undefined || typeof obj['degree'] === 'number') &&
    (obj['retrograde'] === undefined || typeof obj['retrograde'] === 'boolean') &&
    (obj['speed'] === undefined || typeof obj['speed'] === 'number') &&
    (obj['dignity'] === undefined ||
      ['domicile', 'exaltation', 'fall', 'detriment'].includes(obj['dignity'] as string)) &&
    (obj['aspects'] === undefined || Array.isArray(obj['aspects']))
  );
}

/**
 * Type guard for House objects (compatible with bridge system)
 */
export function isHouse(value: unknown): value is House {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj['number'] === 'number' &&
    typeof obj['cusp'] === 'number' &&
    typeof obj['sign'] === 'string' &&
    typeof obj['ruler'] === 'string' &&
    typeof obj['degree'] === 'number' &&
    typeof obj['size'] === 'number' &&
    (obj['modern_ruler'] === undefined || typeof obj['modern_ruler'] === 'string') &&
    (obj['contains_planets'] === undefined || Array.isArray(obj['contains_planets']))
  );
}

/**
 * Type guard for Aspect objects (compatible with bridge system)
 */
export function isAspect(value: unknown): value is Aspect {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj['aspect_type'] === 'string' &&
    typeof obj['planet1'] === 'string' &&
    typeof obj['planet2'] === 'string' &&
    typeof obj['orb'] === 'number' &&
    typeof obj['applying'] === 'boolean' &&
    typeof obj['exact'] === 'boolean' &&
    typeof obj['power'] === 'number' &&
    typeof obj['aspect_angle'] === 'number' &&
    (obj['separating'] === undefined || typeof obj['separating'] === 'boolean') &&
    (obj['mutual_reception'] === undefined || typeof obj['mutual_reception'] === 'boolean')
  );
}

/**
 * Type guard for Asteroid objects (compatible with bridge system)
 */
export function isAsteroid(value: unknown): value is Asteroid {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj['name'] === 'string' &&
    typeof obj['position'] === 'number' &&
    typeof obj['degree'] === 'number' &&
    typeof obj['sign'] === 'string' &&
    typeof obj['house'] === 'number' &&
    typeof obj['retrograde'] === 'boolean' &&
    typeof obj['speed'] === 'number'
  );
}

/**
 * Type guard for ChartAngles objects (compatible with bridge system)
 */
export function isAngle(value: unknown): value is ChartAngles {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    (obj['ascendant'] === undefined || typeof obj['ascendant'] === 'number') &&
    (obj['descendant'] === undefined || typeof obj['descendant'] === 'number') &&
    (obj['midheaven'] === undefined || typeof obj['midheaven'] === 'number') &&
    (obj['imumcoeli'] === undefined || typeof obj['imumcoeli'] === 'number')
  );
}

/**
 * Type guard for AstrologyChart objects
 * Performs deep validation of nested structures
 */
export function isAstrologyChart(value: unknown): value is AstrologyChart {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check for required structures
  if (
    typeof obj['planets'] !== 'object' || obj['planets'] === null ||
    !Array.isArray(obj['houses']) ||
    !Array.isArray(obj['aspects']) ||
    (obj['asteroids'] !== undefined && (typeof obj['asteroids'] !== 'object' || obj['asteroids'] === null)) ||
    typeof obj['angles'] !== 'object' || obj['angles'] === null
  ) {
    return false;
  }

  // Validate planets record
  const planets = obj['planets'] as Record<string, unknown>;
  for (const planetData of Object.values(planets)) {
    if (!isPlanet(planetData)) return false;
  }

  // Validate each house
  if (!obj['houses'].every(isHouse)) return false;

  // Validate each aspect
  if (!obj['aspects'].every(isAspect)) return false;

  // Validate asteroids if present
  if (obj['asteroids']) {
    const asteroids = obj['asteroids'] as Record<string, unknown>;
    for (const asteroidData of Object.values(asteroids)) {
      if (!isAsteroid(asteroidData)) return false;
    }
  }

  // Validate angles object
  if (!isAngle(obj['angles'])) return false;

  return true;
}

/**
 * Type guard for UserProfile objects
 */
export function isUserProfile(value: unknown): value is UserProfile {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj['userId'] !== 'string') {
    return false;
  }

  // Check birthData structure
  if (
    obj['birthData'] === null ||
    obj['birthData'] === undefined ||
    typeof obj['birthData'] !== 'object'
  ) {
    return false;
  }

  const birthData = obj['birthData'] as Record<string, unknown>;

  return (
    typeof birthData['date'] === 'string' &&
    typeof birthData['time'] === 'string' &&
    typeof birthData['location'] === 'string'
  );
}

/**
 * Type guard for NumerologyData objects
 */
export function isNumerologyData(value: unknown): value is NumerologyData {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj['lifePath'] === 'number' &&
    typeof obj['destiny'] === 'number' &&
    typeof obj['personalYear'] === 'number'
  );
}

/**
 * Type-safe data discriminator
 * Returns the specific type name of the astrology-related data
 */
export function getAstrologyDataType(
  data: unknown
): 'AstrologyChart' | 'UserProfile' | 'NumerologyData' | 'Unknown' {
  if (isAstrologyChart(data)) return 'AstrologyChart';
  if (isUserProfile(data)) return 'UserProfile';
  if (isNumerologyData(data)) return 'NumerologyData';
  return 'Unknown';
}

/**
 * Type guard to check if the value is any valid astrology data type
 */
export function isAstrologyData(
  value: unknown
): value is AstrologyChart | UserProfile | NumerologyData {
  return (
    isAstrologyChart(value) || isUserProfile(value) || isNumerologyData(value)
  );
}

/**
 * Validates an astrology chart structure and reports specific validation errors
 * @returns An array of validation errors, empty if valid
 */
export function validateAstrologyChart(chart: unknown): string[] {
  const errors: string[] = [];

  if (chart === null || chart === undefined || typeof chart !== 'object') {
    return ['Chart must be an object'];
  }

  const obj = chart as Record<string, unknown>;

  // Check required properties
  if (typeof obj['planets'] !== 'object' || obj['planets'] === null) {
    errors.push('Chart is missing planets record');
  } else {
    const planets = obj['planets'] as Record<string, unknown>;
    if (Object.keys(planets).length === 0) {
      errors.push('Chart must have at least one planet');
    } else {
      // Validate each planet
      Object.entries(planets).forEach(([key, planet]) => {
        if (!isPlanet(planet)) {
          errors.push(`Invalid planet at key ${key}`);
        }
      });
    }
  }

  if (!Array.isArray(obj['houses'])) {
    errors.push('Chart is missing houses array');
  } else {
    // Validate each house
    obj['houses'].forEach((house, index) => {
      if (!isHouse(house)) {
        errors.push(`Invalid house at index ${index}`);
      }
    });
  }

  if (!Array.isArray(obj['aspects'])) {
    errors.push('Chart is missing aspects array');
  } else {
    // Validate each aspect
    obj['aspects'].forEach((aspect, index) => {
      if (!isAspect(aspect)) {
        errors.push(`Invalid aspect at index ${index}`);
      }
    });
  }

  if (obj['asteroids'] !== undefined) {
    if (typeof obj['asteroids'] !== 'object' || obj['asteroids'] === null) {
      errors.push('Asteroids must be a record if present');
    } else {
      const asteroids = obj['asteroids'] as Record<string, unknown>;
      Object.entries(asteroids).forEach(([key, asteroid]) => {
        if (!isAsteroid(asteroid)) {
          errors.push(`Invalid asteroid at key ${key}`);
        }
      });
    }
  }

  if (typeof obj['angles'] !== 'object' || obj['angles'] === null) {
    errors.push('Chart is missing angles object');
  } else {
    if (!isAngle(obj['angles'])) {
      errors.push('Invalid angles object');
    }
  }

  return errors;
}

/**
 * Safely attempts to parse a JSON string into an AstrologyChart
 * @returns A tuple with the parsed chart (or null if invalid) and any validation errors
 */
export function safeParseAstrologyChart(
  jsonString: string
): [AstrologyChart | null, string[]] {
  try {
    const parsed = JSON.parse(jsonString) as Record<string, unknown>;
    const validationErrors = validateAstrologyChart(parsed);

    if (validationErrors.length > 0) {
      return [null, validationErrors];
    }

    // Only cast to AstrologyChart if it has passed validation
    if (isAstrologyChart(parsed)) {
      return [parsed, []];
    }

    return [null, ['Invalid chart data structure']];
  } catch (error) {
    return [
      null,
      [error instanceof Error ? error.message : 'Unknown parsing error'],
    ];
  }
}
