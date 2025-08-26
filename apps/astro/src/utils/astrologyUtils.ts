/**
 * Centralized Astrology Utilities
 * 
 * This module provides a single source of truth for all astrological calculations,
 * eliminating redundant implementations across the codebase.
 */

// Type definitions
export type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 
  'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

// Zodiac Signs - Single source of truth
export const ZODIAC_SIGNS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

export const ZODIAC_SIGNS_CAPITALIZED: string[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Elements and Qualities
export const SIGN_ELEMENTS: Record<ZodiacSign, 'fire' | 'earth' | 'air' | 'water'> = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water'
};

export const SIGN_QUALITIES: Record<ZodiacSign, 'cardinal' | 'fixed' | 'mutable'> = {
  aries: 'cardinal', cancer: 'cardinal', libra: 'cardinal', capricorn: 'cardinal',
  taurus: 'fixed', leo: 'fixed', scorpio: 'fixed', aquarius: 'fixed',
  gemini: 'mutable', virgo: 'mutable', sagittarius: 'mutable', pisces: 'mutable'
};

export const SIGN_RULERS: Record<ZodiacSign, string> = {
  aries: 'Mars', taurus: 'Venus', gemini: 'Mercury', cancer: 'Moon',
  leo: 'Sun', virgo: 'Mercury', libra: 'Venus', scorpio: 'Pluto',
  sagittarius: 'Jupiter', capricorn: 'Saturn', aquarius: 'Uranus', pisces: 'Neptune'
};

/**
 * Convert degrees to zodiac sign
 * @param degrees - Position in degrees (0-360)
 * @returns Zodiac sign in lowercase
 */
export function getSignFromDegrees(degrees: number): ZodiacSign {
  // Normalize degrees to 0-360 range
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedDegrees / 30);
  return ZODIAC_SIGNS[signIndex] || 'aries';
}

/**
 * Convert degrees to zodiac sign (capitalized)
 * @param degrees - Position in degrees (0-360) 
 * @returns Zodiac sign in capitalized form
 */
export function getSignFromDegreesCapitalized(degrees: number): string {
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedDegrees / 30);
  return ZODIAC_SIGNS_CAPITALIZED[signIndex] || 'Aries';
}

/**
 * Get degree within sign (0-29.999...)
 * @param degrees - Position in degrees (0-360)
 * @returns Degrees within the sign
 */
export function getDegreeWithinSign(degrees: number): number {
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  return normalizedDegrees % 30;
}

/**
 * Get detailed sign information
 * @param degrees - Position in degrees (0-360)
 * @returns Detailed astrological sign information
 */
export function getAstrologicalSign(degrees: number): {
  sign: string;
  signDegrees: number;
  signMinutes: number;
} {
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedDegrees / 30);
  const sign = ZODIAC_SIGNS_CAPITALIZED[signIndex] || 'Aries';
  const signDegrees = normalizedDegrees % 30;
  const signMinutes = (signDegrees % 1) * 60;

  return {
    sign,
    signDegrees: Math.floor(signDegrees),
    signMinutes: Math.floor(signMinutes),
  };
}

/**
 * Calculate house position from planet degrees and house cusps
 * @param planetDegrees - Planet position in degrees (0-360)
 * @param houseCusps - Array of house cusp degrees
 * @returns House number (1-12)
 */
export function calculateHousePosition(planetDegrees: number, houseCusps: number[]): number {
  if (!houseCusps || houseCusps.length === 0) return 1;
  
  // Ensure we have 12 house cusps
  if (houseCusps.length < 12) {
    console.warn(`calculateHousePosition: Only ${houseCusps.length} house cusps provided, need 12`);
    return 1;
  }
  
  // Normalize planet position to 0-360
  let normalizedPosition = ((planetDegrees % 360) + 360) % 360;
  
  // Find which house the planet is in
  for (let i = 0; i < 12; i++) {
    const currentCusp = houseCusps[i];
    const nextCusp = houseCusps[(i + 1) % 12];
    
    // Skip if cusps are undefined or invalid
    if (typeof currentCusp !== 'number' || typeof nextCusp !== 'number') {
      continue;
    }
    
    // Handle crossing 0 degrees (e.g., from 350° to 10°)
    if (nextCusp < currentCusp) {
      if (normalizedPosition >= currentCusp || normalizedPosition < nextCusp) {
        return i + 1; // Houses are numbered 1-12
      }
    } else {
      if (normalizedPosition >= currentCusp && normalizedPosition < nextCusp) {
        return i + 1; // Houses are numbered 1-12
      }
    }
  }
  
  // Default to house 1 if calculation fails
  return 1;
}

/**
 * Get element from zodiac sign
 * @param sign - Zodiac sign (lowercase)
 * @returns Element ('fire', 'earth', 'air', 'water')
 */
export function getElementFromSign(sign: ZodiacSign): 'fire' | 'earth' | 'air' | 'water' {
  return SIGN_ELEMENTS[sign] || 'fire';
}

/**
 * Get quality from zodiac sign
 * @param sign - Zodiac sign (lowercase)
 * @returns Quality ('cardinal', 'fixed', 'mutable')
 */
export function getQualityFromSign(sign: ZodiacSign): 'cardinal' | 'fixed' | 'mutable' {
  return SIGN_QUALITIES[sign] || 'cardinal';
}

/**
 * Get planetary ruler from zodiac sign
 * @param sign - Zodiac sign (lowercase)
 * @returns Planetary ruler name
 */
export function getRulerFromSign(sign: ZodiacSign): string {
  return SIGN_RULERS[sign] || 'Mars';
}

/**
 * Normalize angle to 0-360 range
 * @param angle - Angle in degrees
 * @returns Normalized angle
 */
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Calculate angle difference (shortest path)
 * @param angle1 - First angle in degrees
 * @param angle2 - Second angle in degrees
 * @returns Angle difference (-180 to 180)
 */
export function angleDifference(angle1: number, angle2: number): number {
  const diff = normalizeAngle(angle2 - angle1);
  return diff > 180 ? diff - 360 : diff;
}

/**
 * Check if a position value is valid
 * @param position - Position to validate
 * @returns True if position is a valid number
 */
export function isValidPosition(position: unknown): position is number {
  return typeof position === 'number' && !isNaN(position) && isFinite(position);
}

/**
 * Format planet position for display
 * @param position - Position in degrees
 * @param retrograde - Whether planet is retrograde
 * @param precision - Decimal places (default: 2)
 * @returns Formatted position string
 */
export function formatPlanetPosition(
  position: number, 
  retrograde: boolean = false, 
  precision: number = 2
): string {
  const pos = position.toFixed(precision);
  const retrogradeSymbol = retrograde ? ' ℞' : '';
  return `${pos}°${retrogradeSymbol}`;
}

// Validation functions
export function isZodiacSign(value: unknown): value is ZodiacSign {
  return typeof value === 'string' && ZODIAC_SIGNS.includes(value as ZodiacSign);
}

export function isHouseNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 12;
}
