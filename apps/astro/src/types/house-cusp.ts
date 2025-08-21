/**
 * Strongly-typed definitions for house cusp data in chart calculations
 */

export type ZodiacSign = 
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

export interface HouseCusp {
  /** House number (1-12) */
  house?: number;
  /** Alternative field for house number */
  number?: number;
  /** Zodiac sign of the house cusp */
  sign?: string;
  /** Absolute position in degrees (0-360) */
  cusp?: number;
  /** Degree within the sign (0-30) */
  degree?: number | string;
  /** Ruling planet of the sign */
  ruler?: string;
}

/**
 * Type guard to check if an object is a valid HouseCusp
 */
export function isHouseCusp(obj: unknown): obj is HouseCusp {
  if (obj === null || obj === undefined || typeof obj !== 'object') return false;
  
  const houseCusp = obj as HouseCusp;
  return (
    (typeof houseCusp.house === 'number' || typeof houseCusp.number === 'number') &&
    (typeof houseCusp.cusp === 'number' || 
     typeof houseCusp.degree === 'number' || 
     typeof houseCusp.degree === 'string')
  );
}

/**
 * Type guard to check if an array contains valid HouseCusps
 */
export function isHouseCuspArray(arr: unknown[]): arr is HouseCusp[] {
  return arr.length > 0 && isHouseCusp(arr[0]);
}
