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

// Strict type definitions for enhanced type safety
interface ChartLike {
  planets?: Record<string, CelestialBodyData>;
  houses?: number[] | Record<string, HouseData>;
  aspects?: AspectData[];
  asteroids?: Record<string, CelestialBodyData>;
  angles?: Record<string, number>;
  points?: Record<string, CelestialBodyData>;
  uranian?: Record<string, CelestialBodyData>;
  hypothetical_points?: Record<string, CelestialBodyData>;
  __raw_backend_response?: ChartLike;
  chart_data?: ChartLike;
  birth_data?: BirthData;
}

interface CelestialBodyData {
  position: number;
  retrograde?: boolean;
  aspects?: AspectData[];
  house?: number;
  sign?: string;
  degree?: number;
}

interface HouseData {
  cusp?: number;
  sign?: string;
  ruler?: string;
  occupants?: string[];
}

interface BirthData {
  date?: string;
  time?: string;
  location?: string;
  timezone?: string;
}

interface AspectData {
  planet1?: string;
  planet2?: string;
  point1?: string;
  point2?: string;
  type?: string;
  aspect_type?: string;
  aspect?: string;
  orb?: number;
  applying?: string | boolean;
}

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

// Astrological rulership constants for enhanced ruler logic
const TRADITIONAL_RULERS: Record<string, string> = {
  aries: 'mars',
  taurus: 'venus', 
  gemini: 'mercury',
  cancer: 'moon',
  leo: 'sun',
  virgo: 'mercury',
  libra: 'venus',
  scorpio: 'mars',
  sagittarius: 'jupiter',
  capricorn: 'saturn',
  aquarius: 'saturn',
  pisces: 'jupiter'
} as const;

const MODERN_RULERS: Record<string, string> = {
  ...TRADITIONAL_RULERS,
  scorpio: 'pluto',
  aquarius: 'uranus',
  pisces: 'neptune'
} as const;

const EXALTATION_RULERS: Record<string, string> = {
  aries: 'sun',
  taurus: 'moon',
  gemini: 'north_node',
  cancer: 'jupiter',
  leo: 'neptune', 
  virgo: 'mercury',
  libra: 'saturn',
  scorpio: 'uranus',
  sagittarius: 'neptune',
  capricorn: 'mars',
  aquarius: 'mercury',
  pisces: 'venus'
} as const;

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
}

// Simplified astrological sign calculation (degrees 0-359 to signs)
const getSignFromDegrees = (degrees: number): string => {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedDegrees / 30);
  return signs[signIndex] ?? 'Aries';
};

const getDegreeWithinSign = (degrees: number): number => {
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  return parseFloat((normalizedDegrees % 30).toFixed(2));
};

const calculateHousePosition = (planetDegrees: number, houseCusps: number[]): number => {
  if (houseCusps.length === 0) return 1;
  
  const normalizedPlanet = ((planetDegrees % 360) + 360) % 360;
  
  for (let i = 0; i < houseCusps.length; i++) {
    const currentCuspValue = houseCusps[i];
    const nextCuspValue = houseCusps[(i + 1) % houseCusps.length];
    
    if (currentCuspValue === null || currentCuspValue === undefined || 
        nextCuspValue === null || nextCuspValue === undefined) continue;
    
    const currentCusp = ((currentCuspValue % 360) + 360) % 360;
    const nextCusp = ((nextCuspValue % 360) + 360) % 360;
    
    if (currentCusp <= nextCusp) {
      if (normalizedPlanet >= currentCusp && normalizedPlanet < nextCusp) {
        return i + 1;
      }
    } else {
      if (normalizedPlanet >= currentCusp || normalizedPlanet < nextCusp) {
        return i + 1;
      }
    }
  }
  
  return 1; // Default to first house
};

/**
 * Calculate the traditional or modern ruler of a zodiac sign
 * @param sign - The zodiac sign (lowercase)
 * @param useModern - Whether to use modern rulers (default: true)
 * @returns The ruling planet name
 */
const getRulerOfSign = (sign: string, useModern: boolean = true): string => {
  const normalizedSign = sign.toLowerCase().trim();
  const rulers = useModern ? MODERN_RULERS : TRADITIONAL_RULERS;
  return rulers[normalizedSign] ?? 'sun'; // Default to Sun if sign not found
};

/**
 * Get the exaltation ruler of a zodiac sign
 * @param sign - The zodiac sign (lowercase)  
 * @returns The exalted planet name
 */
const getExaltationRuler = (sign: string): string => {
  const normalizedSign = sign.toLowerCase().trim();
  return EXALTATION_RULERS[normalizedSign] ?? '';
};

/**
 * Calculate dignity score for a planet in a sign
 * @param planet - Planet name
 * @param sign - Sign name  
 * @param useModern - Use modern rulers
 * @returns Dignity score (5=exalted, 4=ruler, 3=own sign, 1=neutral, 0=detriment, -1=fall)
 */
const calculatePlanetDignity = (planet: string, sign: string, useModern: boolean = true): number => {
  const normalizedPlanet = planet.toLowerCase().trim();
  const normalizedSign = sign.toLowerCase().trim();
  
  // Check exaltation
  if (getExaltationRuler(normalizedSign) === normalizedPlanet) {
    return 5; // Exalted
  }
  
  // Check rulership
  if (getRulerOfSign(normalizedSign, useModern) === normalizedPlanet) {
    return 4; // Ruler
  }
  
  // Check own sign (same as ruler for most planets)
  if (getRulerOfSign(normalizedSign, useModern) === normalizedPlanet) {
    return 3; // Own sign
  }
  
  // TODO: Add detriment and fall calculations
  return 1; // Neutral
};

/**
 * Centralized chart data processing hook
 * 
 * Handles the critical data flow issue where:
 * - /calculate endpoint returns data with __raw_backend_response field
 * - /api/charts/ endpoint returns transformed data WITHOUT __raw_backend_response
 * - Processing needs raw backend data for proper categorization
 */
export function useChartProcessing(
  chartData: unknown, 
  options: UseChartProcessingOptions = {}
): ProcessedChartData {
  const { enableDebug = true, fallbackToSample = false } = options;
  
  // Stable ref for debug logging - follows React Hook Patterns Guide
  const debugRef = useRef<{ lastProcessedId: string | null }>({ lastProcessedId: null });

  return useMemo(() => {
    const dataId = chartData ? JSON.stringify(chartData).slice(0, 50) : 'null';
    
    if (enableDebug && debugRef.current.lastProcessedId !== dataId) {
      console.log('🔧 useChartProcessing - Processing new chart data...', { dataId, chartData });
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
        console.log('❌ useChartProcessing - Invalid data type:', typeof chartData);
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
    const hasRawBackend = '__raw_backend_response' in data && data.__raw_backend_response !== null;
    let rawBackendData: ChartLike;
    
    if (hasRawBackend) {
      rawBackendData = data.__raw_backend_response!;
    } else if ('chart_data' in data && data.chart_data !== null && data.chart_data !== undefined) {
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
    } else if (originalKeys.some(key => ['planets', 'houses', 'aspects'].includes(key))) {
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
    const hasAsteroids = 'asteroids' in rawBackendData && 
      rawBackendData.asteroids !== null &&
      rawBackendData.asteroids !== undefined &&
      typeof rawBackendData.asteroids === 'object' &&
      Object.keys(rawBackendData.asteroids).length > 0;

    const hasPoints = 'points' in rawBackendData && 
      rawBackendData.points !== null &&
      rawBackendData.points !== undefined &&
      typeof rawBackendData.points === 'object' &&
      Object.keys(rawBackendData.points).length > 0;

    const hasUranian = 'uranian' in rawBackendData && 
      rawBackendData.uranian !== null &&
      rawBackendData.uranian !== undefined &&
      typeof rawBackendData.uranian === 'object' &&
      Object.keys(rawBackendData.uranian).length > 0;

    const hasHypothetical = 'hypothetical_points' in rawBackendData && 
      rawBackendData.hypothetical_points !== null &&
      rawBackendData.hypothetical_points !== undefined &&
      typeof rawBackendData.hypothetical_points === 'object' &&
      Object.keys(rawBackendData.hypothetical_points).length > 0;

    // Count for debugging - stable computation
    const asteroidCount = hasAsteroids ? Object.keys(rawBackendData.asteroids as object).length : 0;
    const pointCount = [
      hasPoints ? Object.keys(rawBackendData.points as object).length : 0,
      hasUranian ? Object.keys(rawBackendData.uranian as object).length : 0,
      hasHypothetical ? Object.keys(rawBackendData.hypothetical_points as object).length : 0,
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
    const result = processChartDataInternal(rawBackendData, enableDebug);

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
    
  }, [chartData, enableDebug, fallbackToSample]); // Explicit dependency array per React Hook Patterns
}

/**
 * Internal chart processing function - self-contained normalization
 * Separated for testing and clarity
 */
function processChartDataInternal(
  rawData: ChartLike, 
  enableDebug: boolean
): Omit<ProcessedChartData, 'source' | 'hasRawBackend' | 'debug'> {
  
  // Process houses first for position calculations
  const processedHouses: ProcessedHouse[] = [];
  
  if ('houses' in rawData && rawData.houses !== null && rawData.houses !== undefined) {
    const housesData = rawData.houses;
    
    if (Array.isArray(housesData)) {
      housesData.forEach((house: unknown, index: number) => {
        if (house !== null && house !== undefined) {
          const houseNumber = index + 1;
          let cusp = 0;
          
          if (typeof house === 'number') {
            cusp = house;
          } else if (typeof house === 'object' && house !== null && 'cusp' in house) {
            const houseObj = house as { cusp?: unknown };
            cusp = typeof houseObj.cusp === 'number' ? houseObj.cusp : 0;
          }
          
          const houseSign = getSignFromDegrees(cusp);
          const houseRuler = getRulerOfSign(houseSign, true); // Use modern rulers by default
          
          processedHouses.push({
            house: houseNumber,
            number: houseNumber,
            cusp,
            sign: houseSign,
            degree: getDegreeWithinSign(cusp),
            ruler: houseRuler,
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
    const position = typeof bodyData.position === 'number' ? bodyData.position : 0;
    const sign = getSignFromDegrees(position);
    const degree = getDegreeWithinSign(position);
    const houseNumber = houseCusps.length > 0 ? 
      calculateHousePosition(position, houseCusps) : 1;

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
    const isMainPlanet = ['sun', 'moon', 'mercury', 'venus', 'mars', 
      'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(name.toLowerCase());

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
  ['planets', 'asteroids', 'points', 'uranian', 'hypothetical_points'].forEach(fieldName => {
    const fieldData = (rawData as Record<string, unknown>)[fieldName];
    if (fieldData === null || fieldData === undefined || typeof fieldData !== 'object') return;

    const category = fieldName === 'planets' ? 'planet' : 
      fieldName === 'asteroids' ? 'asteroid' : 'point';

    if (fieldData && typeof fieldData === 'object') {
      Object.entries(fieldData).forEach(([name, data]) => {
        processBodyData(name, data, category);
      });
    }
  });

  // Process aspects
  const processedAspects: ProcessedAspect[] = [];
  if ('aspects' in rawData && Array.isArray(rawData.aspects)) {
    rawData.aspects.forEach((aspect: unknown) => {
      if (aspect !== null && aspect !== undefined && typeof aspect === 'object') {
        const aspectData = aspect as AspectData;
        processedAspects.push({
          planet1: String(aspectData.planet1 ?? aspectData.point1 ?? ''),
          planet2: String(aspectData.planet2 ?? aspectData.point2 ?? ''),
          type: String(aspectData.type ?? aspectData.aspect_type ?? aspectData.aspect ?? ''),
          orb: typeof aspectData.orb === 'number' ? aspectData.orb : 0,
          applying: String(aspectData.applying ?? ''),
        });
      }
    });
  }

  // Process angles
  const processedAngles: ProcessedAngle[] = [];
  if ('angles' in rawData && rawData.angles !== null && typeof rawData.angles === 'object') {
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

/**
 * Utility functions for astrological calculations
 */
export const AstrologyUtils = {
  getRulerOfSign,
  getExaltationRuler, 
  calculatePlanetDignity,
  getSignFromDegrees,
  getDegreeWithinSign,
  calculateHousePosition
} as const;

export type { 
  ProcessedChartData, 
  UseChartProcessingOptions,
  ProcessedPlanet,
  ProcessedAsteroid, 
  ProcessedHouse,
  ProcessedAspect,
  ProcessedAngle
};
