/**
 * Strongly-typed definitions for processed chart data used in displays
 */
import type { PlanetData, AsteroidData, HouseData } from './astrology.types';

/**
 * Processed planet data with formatted degree for display
 */
export interface ProcessedPlanetData extends Omit<PlanetData, 'degree'> {
  /** Formatted degree string with decimal precision */
  degree: string;
  /** Whether the planet is in retrograde motion */
  retrograde?: boolean;
  /** Position in degrees (0-360) */
  position?: number;
}

/**
 * Processed asteroid data with formatted degree and aspects for display
 */
export interface ProcessedAsteroidData extends Omit<AsteroidData, 'degree' | 'aspects'> {
  /** Formatted degree string with decimal precision */
  degree: string;
  /** Formatted aspect string describing aspects to other points */
  aspects: string;
  /** Position in degrees (0-360) */
  position?: number;
}

/**
 * Processed angle data with formatted degree for display
 */
export interface ProcessedAngleData {
  /** Name of the angle (e.g., "Ascendant", "Midheaven") */
  name: string;
  /** Zodiac sign of the angle */
  sign: string;
  /** Formatted degree string with decimal precision */
  degree: string;
  /** Position in degrees (0-360) */
  position?: number;
}

/**
 * Processed house data with formatted cusp degree for display
 */
export interface ProcessedHouseData extends HouseData {
  /** Formatted cusp degree string with decimal precision */
  cuspDegree: string;
  /** List of planets in this house as a formatted string */
  planetsInHouse: string;
  /** House number as string (e.g., "1st", "2nd") */
  house: string;
  /** Original house data for reference */
  originalHouse?: Record<string, unknown>;
}

/**
 * Processed aspect data with formatted orb and status for display
 */
export interface ProcessedAspectData {
  /** Name of the first planet/point */
  planet1: string;
  /** Name of the second planet/point */
  planet2: string;
  /** Type of aspect (e.g., "Conjunction", "Trine") */
  type: string;
  /** Formatted orb string with decimal precision */
  orb: string;
  /** Status of the aspect (e.g., "Applying", "Separating", "Exact") */
  applying: string;
}

/**
 * Collection of all processed chart sections
 */
export interface ProcessedChartSections {
  /** Processed planet data */
  planets: ProcessedPlanetData[];
  /** Processed asteroid data */
  asteroids: ProcessedAsteroidData[];
  /** Processed angle data */
  angles: ProcessedAngleData[];
  /** Processed house data */
  houses: ProcessedHouseData[];
  /** Processed aspect data */
  aspects: ProcessedAspectData[];
}

/**
 * Type guard to check if an object is a valid ProcessedAngleData
 */
export function isProcessedAngleData(obj: unknown): obj is ProcessedAngleData {
  if (obj === null || typeof obj !== 'object') return false;
  
  const angle = obj as ProcessedAngleData;
  return (
    typeof angle.name === 'string' &&
    typeof angle.sign === 'string' &&
    typeof angle.degree === 'string'
  );
}

/**
 * Type guard to check if an array contains valid ProcessedAngleData
 */
export function isProcessedAngleDataArray(arr: unknown[]): arr is ProcessedAngleData[] {
  return arr.length > 0 && isProcessedAngleData(arr[0]);
}
