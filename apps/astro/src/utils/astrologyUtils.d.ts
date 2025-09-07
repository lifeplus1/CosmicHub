/**
 * Centralized Astrology Utilities
 *
 * This module provides a single source of truth for all astrological calculations,
 * eliminating redundant implementations across the codebase.
 */
export type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';
export declare const ZODIAC_SIGNS: ZodiacSign[];
export declare const ZODIAC_SIGNS_CAPITALIZED: string[];
export declare const SIGN_ELEMENTS: Record<ZodiacSign, 'fire' | 'earth' | 'air' | 'water'>;
export declare const SIGN_QUALITIES: Record<ZodiacSign, 'cardinal' | 'fixed' | 'mutable'>;
export declare const SIGN_RULERS: Record<ZodiacSign, string>;
/**
 * Convert degrees to zodiac sign
 * @param degrees - Position in degrees (0-360)
 * @returns Zodiac sign in lowercase
 */
export declare function getSignFromDegrees(degrees: number): ZodiacSign;
/**
 * Convert degrees to zodiac sign (capitalized)
 * @param degrees - Position in degrees (0-360)
 * @returns Zodiac sign in capitalized form
 */
export declare function getSignFromDegreesCapitalized(degrees: number): string;
/**
 * Get degree within sign (0-29.999...)
 * @param degrees - Position in degrees (0-360)
 * @returns Degrees within the sign
 */
export declare function getDegreeWithinSign(degrees: number): number;
/**
 * Get detailed sign information
 * @param degrees - Position in degrees (0-360)
 * @returns Detailed astrological sign information
 */
export declare function getAstrologicalSign(degrees: number): {
    sign: string;
    signDegrees: number;
    signMinutes: number;
};
/**
 * Calculate house position from planet degrees and house cusps
 * @param planetDegrees - Planet position in degrees (0-360)
 * @param houseCusps - Array of house cusp degrees
 * @returns House number (1-12)
 */
export declare function calculateHousePosition(planetDegrees: number, houseCusps: number[]): number;
/**
 * Get element from zodiac sign
 * @param sign - Zodiac sign (lowercase)
 * @returns Element ('fire', 'earth', 'air', 'water')
 */
export declare function getElementFromSign(sign: ZodiacSign): 'fire' | 'earth' | 'air' | 'water';
/**
 * Get quality from zodiac sign
 * @param sign - Zodiac sign (lowercase)
 * @returns Quality ('cardinal', 'fixed', 'mutable')
 */
export declare function getQualityFromSign(sign: ZodiacSign): 'cardinal' | 'fixed' | 'mutable';
/**
 * Get planetary ruler from zodiac sign
 * @param sign - Zodiac sign (lowercase)
 * @returns Planetary ruler name
 */
export declare function getRulerFromSign(sign: ZodiacSign): string;
/**
 * Normalize angle to 0-360 range
 * @param angle - Angle in degrees
 * @returns Normalized angle
 */
export declare function normalizeAngle(angle: number): number;
/**
 * Calculate angle difference (shortest path)
 * @param angle1 - First angle in degrees
 * @param angle2 - Second angle in degrees
 * @returns Angle difference (-180 to 180)
 */
export declare function angleDifference(angle1: number, angle2: number): number;
/**
 * Check if a position value is valid
 * @param position - Position to validate
 * @returns True if position is a valid number
 */
export declare function isValidPosition(position: unknown): position is number;
/**
 * Format planet position for display
 * @param position - Position in degrees
 * @param retrograde - Whether planet is retrograde
 * @param precision - Decimal places (default: 2)
 * @returns Formatted position string
 */
export declare function formatPlanetPosition(position: number, retrograde?: boolean, precision?: number): string;
export declare function isZodiacSign(value: unknown): value is ZodiacSign;
export declare function isHouseNumber(value: unknown): value is number;
//# sourceMappingURL=astrologyUtils.d.ts.map