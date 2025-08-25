/**
 * Ephemeris types and client utilities for shared use across applications.
 * 
 * This module provides TypeScript types and utility functions for interacting
 * with the ephemeris server, ensuring consistency across astro and healwave apps.
 */

export interface PlanetPosition {
  /** Position in degrees (0-360) */
  position: number;
  /** Whether the planet is in retrograde motion */
  retrograde: boolean;
}

export interface CalculationRequest {
  /** Julian Day Number for the calculation */
  julian_day: number;
  /** Planet name (e.g., 'sun', 'moon', 'mercury') */
  planet: string;
}

export interface CalculationResponse {
  /** Planet name */
  planet: string;
  /** Julian Day Number */
  julian_day: number;
  /** Position data */
  position: PlanetPosition;
  /** UTC timestamp of calculation */
  calculation_time: string;
}

export interface BatchCalculationRequest {
  /** Array of calculations to perform */
  calculations: CalculationRequest[];
}

export interface BatchCalculationResponse {
  /** Array of calculation results */
  results: CalculationResponse[];
  /** UTC timestamp of batch calculation */
  calculation_time: string;
}

export interface EphemerisHealthResponse {
  /** Service status */
  status: 'healthy' | 'unhealthy';
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
  'vesta'
] as const;

export type PlanetName = typeof SUPPORTED_PLANETS[number];

/**
 * Configuration for ephemeris client.
 */
export interface EphemerisConfig {
  /** Backend API base URL */
  apiBaseUrl: string;
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
export class EphemerisClient {
  private config: Required<EphemerisConfig>;

  constructor(config: EphemerisConfig) {
    this.config = {
      timeout: 30000,
      ...config,
      apiKey: config.apiKey ?? ''
    };
  }

  /**
   * Create request headers with authentication if available.
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  /**
   * Make HTTP request with error handling.
   */
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options?.headers,
      },
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json() as T;
  }

  /**
   * Calculate planetary position for a specific date and planet.
   */
  async calculatePosition(julianDay: number, planet: PlanetName): Promise<CalculationResponse> {
    const request: CalculationRequest = {
      julian_day: julianDay,
      planet,
    };

    return this.makeRequest<CalculationResponse>('/api/ephemeris/calculate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Calculate multiple planetary positions in a single request.
   */
  async calculateBatchPositions(calculations: CalculationRequest[]): Promise<BatchCalculationResponse> {
    const request: BatchCalculationRequest = {
      calculations,
    };

    return this.makeRequest<BatchCalculationResponse>('/api/ephemeris/calculate/batch', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get all planetary positions for a specific Julian Day.
   */
  async getAllPlanetaryPositions(julianDay: number): Promise<Record<PlanetName, PlanetPosition>> {
    const calculations = SUPPORTED_PLANETS.map(planet => ({
      julian_day: julianDay,
      planet,
    }));

    const response = await this.calculateBatchPositions(calculations);
    
    const positions: Record<string, PlanetPosition> = {};
    for (const result of response.results) {
      positions[result.planet] = result.position;
    }

    return positions as Record<PlanetName, PlanetPosition>;
  }

  /**
   * Check ephemeris service health.
   */
  async healthCheck(): Promise<EphemerisHealthResponse> {
    return this.makeRequest<EphemerisHealthResponse>('/api/ephemeris/health');
  }

  /**
   * Get list of supported planets.
   */
  async getSupportedPlanets(): Promise<PlanetName[]> {
    return this.makeRequest<PlanetName[]>('/api/ephemeris/planets');
  }
}

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
  
  const jdn = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  // Add fractional day
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  
  const fractionalDay = (hours - 12) / 24 + minutes / 1440 + seconds / 86400 + milliseconds / 86400000;
  
  return jdn + fractionalDay;
}

/**
 * Utility function to convert Julian Day Number to Date.
 * 
 * @param julianDay - Julian Day Number
 * @returns Date object
 */
export function julianDayToDate(julianDay: number): Date {
  const jd = julianDay + 0.5;
  const z = Math.floor(jd);
  const f = jd - z;
  
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  
  // Calculate time from fractional part
  const totalSeconds = f * 86400;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);
  
  return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
}

/**
 * Utility function to format planet position for display.
 * 
 * @param position - Planet position data
 * @param precision - Number of decimal places (default: 2)
 * @returns Formatted position string
 */
export function formatPlanetPosition(position: PlanetPosition, precision: number = 2): string {
  const pos = position.position.toFixed(precision);
  const retrograde = position.retrograde ? ' ℞' : '';
  return `${pos}°${retrograde}`;
}

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
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
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
export function createEphemerisClient(config: EphemerisConfig): EphemerisClient {
  return new EphemerisClient(config);
}
