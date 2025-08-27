/**
 * Ephemeris types and client utilities for shared use across applications.
 *
 * This module provides TypeScript types and utility functions for interacting
 * with the ephemeris server, ensuring consistency across astro and healwave apps.
 */

  /** Whether the planet is in retrograde motion */
  retrograde: boolean;
}

  /** Planet name (e.g., 'sun', 'moon', 'mercury') */
  planet: string;
}

  /** Julian Day Number */
  julian_day: number;
  /** Position data */
  position: PlanetPosition;
  /** UTC timestamp of calculation */
  calculation_time: string;
}

}

  /** UTC timestamp of batch calculation */
  calculation_time: string;
}

  /** Health check timestamp */
  timestamp: string;
  /** Whether ephemeris is properly initialized */
  ephemeris_initialized: boolean;
}

/**
 * Supported planetary bodies in the ephemeris system.
 */
export const SUPPORTED_PLANETS = [
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
  'ceres',
  'pallas',
  'juno',
  'vesta',
] as const;

/**
 * Configuration for ephemeris client.
 */
  /** API key for authentication (if required) */
  apiKey?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Client for fetching ephemeris data from the backend API.
 *
 * This client abstracts the communication with the backend, which in turn
 * communicates with the dedicated ephemeris server.
 */

/**
 * Utility function to convert a Date to Julian Day Number.
 *
 * @param date - The date to convert
 * @returns Julian Day Number
 */
export function dateToJulianDay(date: Date): number {
  const a = Math.floor((14 - date.getMonth() - 1) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = date.getMonth() + 1 + 12 * a - 3;

  const jdn =
    date.getDate() +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Add fractional day
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();

  const fractionalDay =
    (hours - 12) / 24 +
    minutes / 1440 +
    seconds / 86400 +
    milliseconds / 86400000;

  return jdn + fractionalDay;
}

/**
 * Utility function to convert Julian Day Number to Date.
 *
 * @param julianDay - Julian Day Number
 * @returns Date object
 */

/**
 * Utility function to format planet position for display.
 *
 * @param position - Planet position data
 * @param precision - Number of decimal places (default: 2)
 * @returns Formatted position string
 */

/**
 * Utility function to get astrological sign from degree position.
 *
 * @param degrees - Position in degrees (0-360)
 * @returns Astrological sign information
 */
export function getAstrologicalSign(degrees: number): {
  sign: string;
  signDegrees: number;
  signMinutes: number;
} {
  const signs = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];

  const normalizedDegrees = degrees % 360;
  const signIndex = Math.floor(normalizedDegrees / 30);

  // Ensure signIndex is within valid bounds
  const clampedSignIndex = Math.max(0, Math.min(signIndex, signs.length - 1));
  const sign = signs[clampedSignIndex];

  if (!sign) {
    // Fallback to Aries if something goes wrong
    return {
      sign: 'Aries',
      signDegrees: 0,
      signMinutes: 0,
    };
  }

  const signDegrees = normalizedDegrees % 30;
  const signMinutes = (signDegrees % 1) * 60;

  return {
    sign,
    signDegrees: Math.floor(signDegrees),
    signMinutes: Math.floor(signMinutes),
  };
}

/**
 * Create a configured ephemeris client instance.
 *
 * @param config - Client configuration
 * @returns Configured ephemeris client
 */
export function createEphemerisClient(
  config: EphemerisConfig
): EphemerisClient {
  return new EphemerisClient(config);
}
