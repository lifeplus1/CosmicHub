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
  Angle,
  UserProfile,
  NumerologyData
} from './astrology.types';

/**
 * Type guard for Planet objects
 */
export function isPlanet(value: unknown): value is Planet {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.name === 'string' &&
    typeof obj.sign === 'string' &&
    typeof obj.degree === 'number' &&
    typeof obj.position === 'number' &&
    typeof obj.house === 'string' &&
    (obj.retrograde === undefined || typeof obj.retrograde === 'boolean') &&
    (obj.aspects === undefined || Array.isArray(obj.aspects))
  );
}

/**
 * Type guard for House objects
 */
export function isHouse(value: unknown): value is House {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.house === 'number' &&
    typeof obj.number === 'number' &&
    typeof obj.sign === 'string' &&
    typeof obj.degree === 'number' &&
    typeof obj.cusp === 'number' &&
    typeof obj.ruler === 'string'
  );
}

/**
 * Type guard for Aspect objects
 */
export function isAspect(value: unknown): value is Aspect {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.planet1 === 'string' &&
    typeof obj.planet2 === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.orb === 'number' &&
    typeof obj.applying === 'string'
  );
}

/**
 * Type guard for Asteroid objects
 */
export function isAsteroid(value: unknown): value is Asteroid {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.name === 'string' &&
    typeof obj.sign === 'string' &&
    typeof obj.degree === 'number' &&
    typeof obj.house === 'string'
  );
}

/**
 * Type guard for Angle objects
 */
export function isAngle(value: unknown): value is Angle {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.name === 'string' &&
    typeof obj.sign === 'string' &&
    typeof obj.degree === 'number' &&
    typeof obj.position === 'number'
  );
}

/**
 * Type guard for AstrologyChart objects
 * Performs deep validation of nested structures
 */
export function isAstrologyChart(value: unknown): value is AstrologyChart {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  
  // Check for required arrays
  if (!Array.isArray(obj.planets) || 
      !Array.isArray(obj.houses) || 
      !Array.isArray(obj.aspects) || 
      !Array.isArray(obj.asteroids) || 
      !Array.isArray(obj.angles)) {
    return false;
  }
  
  // Validate each planet
  if (!obj.planets.every(isPlanet)) return false;
  
  // Validate each house
  if (!obj.houses.every(isHouse)) return false;
  
  // Validate each aspect
  if (!obj.aspects.every(isAspect)) return false;
  
  // Validate each asteroid
  if (!obj.asteroids.every(isAsteroid)) return false;
  
  // Validate each angle
  if (!obj.angles.every(isAngle)) return false;
  
  return true;
}

/**
 * Type guard for UserProfile objects
 */
export function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  
  if (typeof obj.userId !== 'string') return false;
  
  // Check birthData structure
  if (!obj.birthData || typeof obj.birthData !== 'object') return false;
  
  const birthData = obj.birthData as Record<string, unknown>;
  
  return (
    typeof birthData.date === 'string' &&
    typeof birthData.time === 'string' &&
    typeof birthData.location === 'string'
  );
}

/**
 * Type guard for NumerologyData objects
 */
export function isNumerologyData(value: unknown): value is NumerologyData {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.lifePath === 'number' &&
    typeof obj.destiny === 'number' &&
    typeof obj.personalYear === 'number'
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
  return isAstrologyChart(value) || isUserProfile(value) || isNumerologyData(value);
}

/**
 * Validates an astrology chart structure and reports specific validation errors
 * @returns An array of validation errors, empty if valid
 */
export function validateAstrologyChart(chart: unknown): string[] {
  const errors: string[] = [];
  
  if (!chart || typeof chart !== 'object') {
    return ['Chart must be an object'];
  }
  
  const obj = chart as Record<string, unknown>;
  
  // Check required properties
  if (!Array.isArray(obj.planets)) {
    errors.push('Chart is missing planets array');
  } else if (obj.planets.length === 0) {
    errors.push('Chart must have at least one planet');
  } else {
    // Validate each planet
    obj.planets.forEach((planet, index) => {
      if (!isPlanet(planet)) {
        errors.push(`Invalid planet at index ${index}`);
      }
    });
  }
  
  if (!Array.isArray(obj.houses)) {
    errors.push('Chart is missing houses array');
  } else if (obj.houses.length !== 12) {
    errors.push('Chart must have exactly 12 houses');
  } else {
    // Validate each house
    obj.houses.forEach((house, index) => {
      if (!isHouse(house)) {
        errors.push(`Invalid house at index ${index}`);
      }
    });
  }
  
  if (!Array.isArray(obj.aspects)) {
    errors.push('Chart is missing aspects array');
  } else {
    // Validate each aspect
    obj.aspects.forEach((aspect, index) => {
      if (!isAspect(aspect)) {
        errors.push(`Invalid aspect at index ${index}`);
      }
    });
  }
  
  if (!Array.isArray(obj.asteroids)) {
    errors.push('Chart is missing asteroids array');
  } else {
    // Validate each asteroid
    obj.asteroids.forEach((asteroid, index) => {
      if (!isAsteroid(asteroid)) {
        errors.push(`Invalid asteroid at index ${index}`);
      }
    });
  }
  
  if (!Array.isArray(obj.angles)) {
    errors.push('Chart is missing angles array');
  } else {
    // Validate each angle
    obj.angles.forEach((angle, index) => {
      if (!isAngle(angle)) {
        errors.push(`Invalid angle at index ${index}`);
      }
    });
  }
  
  return errors;
}

/**
 * Safely attempts to parse a JSON string into an AstrologyChart
 * @returns A tuple with the parsed chart (or null if invalid) and any validation errors
 */
export function safeParseAstrologyChart(jsonString: string): [AstrologyChart | null, string[]] {
  try {
    const parsed = JSON.parse(jsonString);
    const validationErrors = validateAstrologyChart(parsed);
    
    if (validationErrors.length > 0) {
      return [null, validationErrors];
    }
    
    return [parsed as AstrologyChart, []];
  } catch (error) {
    return [null, [(error instanceof Error) ? error.message : 'Unknown parsing error']];
  }
}
