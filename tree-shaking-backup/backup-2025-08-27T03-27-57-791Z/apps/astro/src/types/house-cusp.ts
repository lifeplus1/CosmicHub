/**
 * Strongly-typed definitions for house cusp data in chart calculations
 */

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

/**
 * Type guard to check if an array contains valid HouseCusps
 */
