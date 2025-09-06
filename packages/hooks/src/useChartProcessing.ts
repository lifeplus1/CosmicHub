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

import { useMemo, useRef } from 'react';

// Import centralized astrology utilities
import {
  getSignFromDegrees,
  getDegreeWithinSign,
  calculateHousePosition,
  SIGN_RULERS,
} from '../../../apps/astro/src/utils/astrologyUtils';

// Import centralized ChartLike interface and extend it
import type { ChartLike as BaseChartLike } from '../../../apps/astro/src/components/ChartDisplay/normalizeChart';

interface ChartLike extends BaseChartLike {
  uranian?: unknown;
  hypothetical_points?: unknown;
  __raw_backend_response?: ChartLike;
  chart_data?: ChartLike;
  birth_data?: unknown;
}

// Helper interfaces for better type safety
interface CelestialBodyData {
  position?: number;
  retrograde?: boolean;
  aspects?: unknown[];
}

import type { UnifiedAspectData } from '@cosmichub/types';

type AspectData = UnifiedAspectData;

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
  /** Enable debug logging for development and troubleshooting */
  enableDebug?: boolean;
  /** Fallback to sample data if processing fails (development only) */
  fallbackToSample?: boolean;
  /** Use modern planetary rulers instead of traditional ones */
  useModernRulers?: boolean;
  /** Optional error handler callback for custom error handling */
  onError?: (error: Error, chartData: unknown) => void;
}

// Simplified astrological sign calculation (degrees 0-359 to signs)
// REMOVED: getSignFromDegrees - now imported from astrologyUtils.ts

// REMOVED: getDegreeWithinSign - now imported from astrologyUtils.ts

// REMOVED: calculateHousePosition - now imported from astrologyUtils.ts

// Traditional rulership mappings (different from centralized modern rulers)
const TRADITIONAL_RULERS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

// REMOVED: MODERN_RULERS - now using SIGN_RULERS from astrologyUtils.ts

// Calculate house ruler based on sign on the cusp
const calculateHouseRuler = (
  cuspSign: string,
  useModernRulers: boolean = true
): string => {
  if (useModernRulers) {
    // SIGN_RULERS uses lowercase keys, so convert cuspSign to lowercase
    const lowercaseSign = cuspSign.toLowerCase();
    return SIGN_RULERS[lowercaseSign as keyof typeof SIGN_RULERS] ?? '';
  } else {
    // TRADITIONAL_RULERS uses capitalized keys
    return TRADITIONAL_RULERS[cuspSign] ?? '';
  }
};

/**
 * Centralized chart data processing hook
 * 
 * @description Handles the critical data flow issue where:
 * - /calculate endpoint returns data with __raw_backend_response field
 * - /api/charts/ endpoint returns transformed data WITHOUT __raw_backend_response
 * - Processing needs raw backend data for proper categorization
 * 
 * @param chartData - Raw chart data from API endpoints (unknown type for flexibility)
 * @param options - Configuration options for processing behavior
 * @returns Processed and normalized chart data with categorized celestial bodies
 * 
 * @example
 * ```tsx
 * const processedChart = useChartProcessing(rawChartData, {
 *   enableDebug: true,
 *   useModernRulers: true
 * });
 * 
 * console.log(processedChart.planets); // Normalized planet data
 * console.log(processedChart.source); // 'new_calculation' | 'saved_chart'
 * ```
 * 
 * @performance
 * - Uses useMemo for expensive processing operations
 * - Stable ref for debug logging to prevent unnecessary re-renders
 * - Early returns for null/invalid data
 * - Error boundaries for graceful failure handling
 */
export function useChartProcessing(
  chartData: unknown,
  options: UseChartProcessingOptions = {}
): ProcessedChartData {
  const {
    enableDebug = true,
    fallbackToSample = false,
    useModernRulers = true,
    onError,
  } = options;

  // Stable ref for debug logging - follows React Hook Patterns Guide
  const debugRef = useRef<{ lastProcessedId: string | null }>({
    lastProcessedId: null,
  });

  return useMemo(() => {
    try {
      const dataId = chartData ? JSON.stringify(chartData).slice(0, 50) : 'null';

      if (enableDebug && debugRef.current.lastProcessedId !== dataId) {
        console.log('🔧 useChartProcessing - Processing new chart data...', {
          dataId,
          chartData,
        });
        debugRef.current.lastProcessedId = dataId;
      }

    // Early return for null/undefined data - prevents unnecessary computation
    if (chartData === null || chartData === undefined) {
      if (enableDebug) {
        console.log('❌ useChartProcessing - No chart data provided');
      }
      return {
        planets: [],
        asteroids: [],
        angles: [],
        houses: [],
        aspects: [],
        points: [],
        source: 'unknown',
        hasRawBackend: false,
        debug: {
          originalKeys: [],
          backendKeys: [],
          dataStructure: 'null',
          asteroidCount: 0,
          pointCount: 0,
        },
      };
    }

    // Type guard - explicit null checks per React Hook Patterns Guide
    if (typeof chartData !== 'object') {
      if (enableDebug) {
        console.log(
          '❌ useChartProcessing - Invalid data type:',
          typeof chartData
        );
      }
      return {
        planets: [],
        asteroids: [],
        angles: [],
        houses: [],
        aspects: [],
        points: [],
        source: 'unknown',
        hasRawBackend: false,
        debug: {
          originalKeys: [],
          backendKeys: [],
          dataStructure: typeof chartData,
          asteroidCount: 0,
          pointCount: 0,
        },
      };
    }

    const data = chartData as ChartLike;
    const originalKeys = Object.keys(data);

    // CRITICAL FIX: Detect data source and extract raw backend data
    const hasRawBackend =
      '__raw_backend_response' in data && data.__raw_backend_response !== null;
    let rawBackendData: ChartLike;

    if (hasRawBackend) {
      rawBackendData = data.__raw_backend_response!;
    } else if (
      'chart_data' in data &&
      data.chart_data !== null &&
      data.chart_data !== undefined
    ) {
      // Saved chart with chart_data wrapper
      rawBackendData = data.chart_data;
    } else {
      // Direct chart data or already normalized
      rawBackendData = data;
    }

    const backendKeys = Object.keys(rawBackendData);

    // Determine data source - follows stable reference patterns
    let source: 'new_calculation' | 'saved_chart' | 'unknown' = 'unknown';
    if (hasRawBackend) {
      source = 'new_calculation';
    } else if ('chart_data' in data || 'birth_data' in data) {
      source = 'saved_chart';
    } else if (
      originalKeys.some(key => ['planets', 'houses', 'aspects'].includes(key))
    ) {
      source = 'saved_chart';
    }

    if (enableDebug) {
      console.log('🔍 useChartProcessing - Data analysis:', {
        source,
        hasRawBackend,
        originalKeys: originalKeys.slice(0, 10), // Limit debug output
        backendKeys: backendKeys.slice(0, 10),
      });
    }

    // ROBUST FIELD DETECTION: Content analysis over field names
    const hasAsteroids =
      'asteroids' in rawBackendData &&
      rawBackendData.asteroids !== null &&
      rawBackendData.asteroids !== undefined &&
      typeof rawBackendData.asteroids === 'object' &&
      Object.keys(rawBackendData.asteroids).length > 0;

    const hasPoints =
      'points' in rawBackendData &&
      rawBackendData.points !== null &&
      rawBackendData.points !== undefined &&
      typeof rawBackendData.points === 'object' &&
      Object.keys(rawBackendData.points).length > 0;

    const hasUranian =
      'uranian' in rawBackendData &&
      rawBackendData.uranian !== null &&
      rawBackendData.uranian !== undefined &&
      typeof rawBackendData.uranian === 'object' &&
      Object.keys(rawBackendData.uranian).length > 0;

    const hasHypothetical =
      'hypothetical_points' in rawBackendData &&
      rawBackendData.hypothetical_points !== null &&
      rawBackendData.hypothetical_points !== undefined &&
      typeof rawBackendData.hypothetical_points === 'object' &&
      Object.keys(rawBackendData.hypothetical_points).length > 0;

    // Count for debugging - stable computation
    const asteroidCount = hasAsteroids
      ? Object.keys(rawBackendData.asteroids as object).length
      : 0;
    const pointCount = [
      hasPoints ? Object.keys(rawBackendData.points as object).length : 0,
      hasUranian ? Object.keys(rawBackendData.uranian as object).length : 0,
      hasHypothetical
        ? Object.keys(rawBackendData.hypothetical_points as object).length
        : 0,
    ].reduce((sum, count) => sum + count, 0);

    if (enableDebug) {
      console.log('📊 useChartProcessing - Field analysis:', {
        hasAsteroids,
        hasPoints,
        hasUranian,
        hasHypothetical,
        asteroidCount,
        pointCount,
      });
    }

    // Process data using internal normalization
    const result = processChartDataInternal(
      rawBackendData,
      enableDebug,
      useModernRulers
    );

    const finalResult: ProcessedChartData = {
      ...result,
      source,
      hasRawBackend,
      debug: {
        originalKeys,
        backendKeys,
        dataStructure: source,
        asteroidCount,
        pointCount,
      },
    };

    if (enableDebug) {
      console.log('✅ useChartProcessing - Processing complete:', {
        planetsCount: finalResult.planets.length,
        asteroidsCount: finalResult.asteroids.length,
        pointsCount: finalResult.points.length,
        aspectsCount: finalResult.aspects.length,
        housesCount: finalResult.houses.length,
        anglesCount: finalResult.angles.length,
        source: finalResult.source,
        hasRawBackend: finalResult.hasRawBackend,
      });
    }

    return finalResult;
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      
      if (enableDebug) {
        console.error('❌ useChartProcessing - Error during processing:', errorInstance);
      }
      
      // Call custom error handler if provided
      if (onError) {
        onError(errorInstance, chartData);
      }
      
      // Return safe fallback data structure
      return {
        planets: [],
        asteroids: [],
        angles: [],
        houses: [],
        aspects: [],
        points: [],
        source: 'unknown',
        hasRawBackend: false,
        debug: {
          originalKeys: [],
          backendKeys: [],
          dataStructure: 'error',
          asteroidCount: 0,
          pointCount: 0,
        },
      };
    }
  }, [chartData, enableDebug, fallbackToSample, useModernRulers, onError]); // Explicit dependency array per React Hook Patterns - FIXED: Added useModernRulers and onError
}

/**
 * Internal chart processing function - self-contained normalization
 * Separated for testing and clarity
 */
function processChartDataInternal(
  rawData: ChartLike,
  enableDebug: boolean,
  useModernRulers: boolean = true
): Omit<ProcessedChartData, 'source' | 'hasRawBackend' | 'debug'> {
  // Process houses first for position calculations
  const processedHouses: ProcessedHouse[] = [];

  if (
    'houses' in rawData &&
    rawData.houses !== null &&
    rawData.houses !== undefined
  ) {
    const housesData = rawData.houses;

    if (Array.isArray(housesData)) {
      housesData.forEach((house: unknown, index: number) => {
        if (house !== null && house !== undefined) {
          const houseNumber = index + 1;
          let cusp = 0;

          if (typeof house === 'number') {
            cusp = house;
          } else if (
            typeof house === 'object' &&
            house !== null &&
            'cusp' in house
          ) {
            const houseObj = house as { cusp?: unknown };
            cusp = typeof houseObj.cusp === 'number' ? houseObj.cusp : 0;
          }

          const cuspSign = getSignFromDegrees(cusp);
          processedHouses.push({
            house: houseNumber,
            number: houseNumber,
            cusp,
            sign: cuspSign,
            degree: getDegreeWithinSign(cusp),
            ruler: calculateHouseRuler(cuspSign, useModernRulers), // Use ruler preference from options
          });
        }
      });
    }
  }

  // Get house cusps for position calculations
  const houseCusps = processedHouses.map(h => h.cusp);

  // Process planets, asteroids, and points
  const allBodies: ProcessedPlanet[] = [];
  const categorizedAsteroids: ProcessedAsteroid[] = [];
  const mainPlanets: ProcessedPlanet[] = [];
  const points: ProcessedPlanet[] = [];

  // Helper to process celestial body data
  const processBodyData = (
    name: string,
    data: unknown,
    category: 'planet' | 'asteroid' | 'point'
  ): void => {
    if (data === null || data === undefined || typeof data !== 'object') return;

    const bodyData = data as CelestialBodyData;
    const position =
      typeof bodyData.position === 'number' ? bodyData.position : 0;
    const sign = getSignFromDegrees(position);
    const degree = getDegreeWithinSign(position);
    const houseNumber =
      houseCusps.length > 0 ? calculateHousePosition(position, houseCusps) : 1;

    const processedBody: ProcessedPlanet = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      sign,
      degree,
      house: String(houseNumber),
      position,
      retrograde: Boolean(bodyData.retrograde),
      aspects: Array.isArray(bodyData.aspects) ? bodyData.aspects : [],
    };

    allBodies.push(processedBody);

    // Categorize based on content and naming
    const isMainPlanet = [
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
    ].includes(name.toLowerCase());

    if (category === 'asteroid' || (!isMainPlanet && category !== 'planet')) {
      if (category === 'asteroid') {
        const asteroidData: ProcessedAsteroid = {
          name: processedBody.name,
          sign: processedBody.sign,
          degree: processedBody.degree,
          house: processedBody.house,
          position: processedBody.position,
        };
        categorizedAsteroids.push(asteroidData);
      } else {
        points.push(processedBody);
      }
    } else {
      mainPlanets.push(processedBody);
    }
  };

  // Process each data field
  ['planets', 'asteroids', 'points', 'uranian', 'hypothetical_points'].forEach(
    fieldName => {
      const fieldData = (rawData as Record<string, unknown>)[fieldName];
      if (
        fieldData === null ||
        fieldData === undefined ||
        typeof fieldData !== 'object'
      )
        return;

      const category =
        fieldName === 'planets'
          ? 'planet'
          : fieldName === 'asteroids'
            ? 'asteroid'
            : 'point';

      if (fieldData && typeof fieldData === 'object') {
        Object.entries(fieldData).forEach(([name, data]) => {
          processBodyData(name, data, category);
        });
      }
    }
  );

  // Process aspects
  const processedAspects: ProcessedAspect[] = [];
  if ('aspects' in rawData && Array.isArray(rawData.aspects)) {
    rawData.aspects.forEach((aspect: unknown) => {
      if (
        aspect !== null &&
        aspect !== undefined &&
        typeof aspect === 'object'
      ) {
        const aspectData = aspect as AspectData;
        processedAspects.push({
          planet1: String(aspectData.planet1 ?? aspectData.point1 ?? ''),
          planet2: String(aspectData.planet2 ?? aspectData.point2 ?? ''),
          type: String(
            aspectData.type ?? aspectData.aspect_type ?? aspectData.aspect ?? ''
          ),
          orb: typeof aspectData.orb === 'number' ? aspectData.orb : 0,
          applying: String(aspectData.applying ?? ''),
        });
      }
    });
  }

  // Process angles
  const processedAngles: ProcessedAngle[] = [];
  if (
    'angles' in rawData &&
    rawData.angles !== null &&
    typeof rawData.angles === 'object'
  ) {
    Object.entries(rawData.angles).forEach(([name, position]) => {
      if (typeof position === 'number') {
        processedAngles.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          sign: getSignFromDegrees(position),
          degree: getDegreeWithinSign(position),
          position,
        });
      }
    });
  }

  if (enableDebug) {
    console.log('🔧 processChartDataInternal - Results:', {
      mainPlanetsCount: mainPlanets.length,
      asteroidsCount: categorizedAsteroids.length,
      pointsCount: points.length,
      aspectsCount: processedAspects.length,
      housesCount: processedHouses.length,
      anglesCount: processedAngles.length,
    });
  }

  return {
    planets: mainPlanets,
    asteroids: categorizedAsteroids,
    angles: processedAngles,
    houses: processedHouses,
    aspects: processedAspects,
    points,
  };
}

export type { ProcessedChartData, UseChartProcessingOptions };
