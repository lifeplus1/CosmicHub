/**
 * useChartProcessing Hook - Centralizes chart data processing logic.
 *
 * CRITICAL FIXES:
 * 1. Helper function to normalize planet positions for new calculations (/calculate)
 *    AND saved charts (/api/charts/)
 * 2. Unified normalization regardless of data source
 * 3. Robust categorization using content analysis, not fragile field name assumptions
 * 4. Debug logging to identify data flow issues
 *
 * React Hook Patterns Guide compliance:
 * - Deterministic useMemo dependencies
 * - Stable ref for debug logging
 * - Early returns to prevent unnecessary computation
 * - Explicit null checks over boolean expressions
 */
interface ProcessedPlanet {
  name: string;
  sign: string;
  degree: number;
  house: string;
  position: number;
  retrograde: boolean;
  aspects: unknown[];
}
interface ProcessedAsteroid {
  name: string;
  sign: string;
  degree: number;
  house: string;
  position?: number;
}
interface ProcessedHouse {
  house: number;
  number: number;
  cusp: number;
  sign: string;
  degree: number;
  ruler: string;
}
interface ProcessedAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying: string;
}
interface ProcessedAngle {
  name: string;
  sign: string;
  degree: number;
  position: number;
}
interface ProcessedChartData {
  planets: ProcessedPlanet[];
  asteroids: ProcessedAsteroid[];
  angles: ProcessedAngle[];
  houses: ProcessedHouse[];
  aspects: ProcessedAspect[];
  points: ProcessedPlanet[];
  source: 'new_calculation' | 'saved_chart' | 'unknown';
  hasRawBackend: boolean;
  debug: {
    originalKeys: string[];
    backendKeys: string[];
    dataStructure: string;
    asteroidCount: number;
    pointCount: number;
  };
}
interface UseChartProcessingOptions {
  enableDebug?: boolean;
  fallbackToSample?: boolean;
  useModernRulers?: boolean;
}
/**
 * Centralized chart data processing hook
 *
 * Handles the critical data flow issue where:
 * - /calculate endpoint returns data with __raw_backend_response field
 * - /api/charts/ endpoint returns transformed data WITHOUT __raw_backend_response
 * - Processing needs raw backend data for proper categorization
 */
export declare function useChartProcessing(
  chartData: unknown,
  options?: UseChartProcessingOptions
): ProcessedChartData;
export type { ProcessedChartData, UseChartProcessingOptions };
