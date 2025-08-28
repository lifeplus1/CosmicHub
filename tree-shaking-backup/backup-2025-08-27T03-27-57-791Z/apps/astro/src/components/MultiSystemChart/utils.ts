/**
 * MultiSystemChart utilities - optimized and error-resistant
 * Eliminates redundant symbol mappings and expensive proxy objects
 */
import {
  getCelestialSymbol,
  getZodiacSymbol,
  getAspectSymbol,
  formatDegreePosition,
} from '../../services/symbolService';

// Re-export centralized functions for backward compatibility
export const getPlanetSymbol = getCelestialSymbol;
export const getSignSymbol = getZodiacSymbol;

// Optimized symbol lookups - replacing expensive proxy objects with efficient lookups

// Helper functions with fallback to centralized service
export const getPlanetSymbolSafe = (key: string): string => {
  return planetSymbols[key] ?? getCelestialSymbol(key);
};

export const getAspectSymbolSafe = (key: string): string => {
  return aspectSymbols[key] ?? getAspectSymbol(key);
};

// Enhanced zodiac position formatter with comprehensive error handling
export const getZodiacSign = (position: number): string => {
  // Comprehensive input validation
  if (
    typeof position !== 'number' ||
    isNaN(position) ||
    !isFinite(position) ||
    position < 0 ||
    position >= 360
  ) {
    return 'Invalid Position';
  }

  try {
    return formatDegreePosition(position);
  } catch (error) {
    console.warn('Error formatting zodiac position:', error);
    return `${position.toFixed(2)}°`;
  }
};

// Safe data validation utilities
export const isValidChartData = (
  data: unknown
): data is Record<string, unknown> => {
  return data !== null && data !== undefined && typeof data === 'object';
};

export const safeGet = <T>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue: T
): T => {
  try {
    const keys = path.split('.');
    let result: unknown = obj;

    for (const key of keys) {
      if (
        result === null ||
        result === undefined ||
        typeof result !== 'object'
      ) {
        return defaultValue;
      }
      result = (result as Record<string, unknown>)[key];
    }

    return result !== undefined ? (result as T) : defaultValue;
  } catch {
    return defaultValue;
  }
};
