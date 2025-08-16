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
export declare const SUPPORTED_PLANETS: readonly ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "chiron", "ceres", "pallas", "juno", "vesta"];
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
export declare class EphemerisClient {
    private config;
    constructor(config: EphemerisConfig);
    /**
     * Create request headers with authentication if available.
     */
    private getHeaders;
    /**
     * Make HTTP request with error handling.
     */
    private makeRequest;
    /**
     * Calculate planetary position for a specific date and planet.
     */
    calculatePosition(julianDay: number, planet: PlanetName): Promise<CalculationResponse>;
    /**
     * Calculate multiple planetary positions in a single request.
     */
    calculateBatchPositions(calculations: CalculationRequest[]): Promise<BatchCalculationResponse>;
    /**
     * Get all planetary positions for a specific Julian Day.
     */
    getAllPlanetaryPositions(julianDay: number): Promise<Record<PlanetName, PlanetPosition>>;
    /**
     * Check ephemeris service health.
     */
    healthCheck(): Promise<EphemerisHealthResponse>;
    /**
     * Get list of supported planets.
     */
    getSupportedPlanets(): Promise<PlanetName[]>;
}
/**
 * Utility function to convert a Date to Julian Day Number.
 *
 * @param date - The date to convert
 * @returns Julian Day Number
 */
export declare function dateToJulianDay(date: Date): number;
/**
 * Utility function to convert Julian Day Number to Date.
 *
 * @param julianDay - Julian Day Number
 * @returns Date object
 */
export declare function julianDayToDate(julianDay: number): Date;
/**
 * Utility function to format planet position for display.
 *
 * @param position - Planet position data
 * @param precision - Number of decimal places (default: 2)
 * @returns Formatted position string
 */
export declare function formatPlanetPosition(position: PlanetPosition, precision?: number): string;
/**
 * Utility function to get astrological sign from degree position.
 *
 * @param degrees - Position in degrees (0-360)
 * @returns Astrological sign information
 */
export declare function getAstrologicalSign(degrees: number): {
    sign: string;
    signDegrees: number;
    signMinutes: number;
};
/**
 * Create a configured ephemeris client instance.
 *
 * @param config - Client configuration
 * @returns Configured ephemeris client
 */
export declare function createEphemerisClient(config: EphemerisConfig): EphemerisClient;
//# sourceMappingURL=ephemeris.d.ts.map