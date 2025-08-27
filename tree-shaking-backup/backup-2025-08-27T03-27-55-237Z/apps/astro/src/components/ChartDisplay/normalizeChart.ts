import type {
  ChartDisplayPlanet,
  ChartDisplayHouse,
  ChartDisplayAspect,
  ChartDisplayAsteroid,
  ChartDisplayAngle,
} from './types';
import {
  getSignFromDegrees,
  calculateHousePosition,
  getDegreeWithinSign,
  getRulerFromSign,
  getSignFromDegreesCapitalized,
  type ZodiacSign,
} from '../../utils/astrologyUtils';

// Helper to bridge between centralized utils and display components
const getSignFromDegree = getSignFromDegreesCapitalized;

// Backend response interface
interface BackendResponseContainer {
  __raw_backend_response?: ChartLike;
  [key: string]: unknown;
}

// Unified loose chart shape supporting legacy and new forms
  houses?: unknown;
  aspects?: unknown;
  asteroids?: unknown;
  angles?: unknown;
  points?: unknown; // Add points support
  [key: string]: unknown; // Allow for dynamic field access
}

interface LoosePlanetInput {
  name?: string;
  sign?: string;
  position?: number;
  degree?: number;
  house?: string | number;
  aspects?: unknown[];
  retrograde?: boolean;
}
interface LooseHouseInput {
  house?: number;
  number?: number;
  sign?: string;
  degree?: number;
  cusp?: number;
  ruler?: string;
}
interface LooseAspectInput {
  planet1?: string;
  planet2?: string;
  point1?: string; // Backend field name
  point2?: string; // Backend field name
  type?: string;
  aspect_type?: string; // API field name
  aspect?: string; // Alternative API field name
  orb?: number | string;
  applying?: string;
}
interface LooseAsteroidInput {
  name?: string;
  sign?: string;
  degree?: number;
  position?: number;
  house?: string | number;
}
interface LooseAngleInput {
  name?: string;
  sign?: string;
  degree?: number;
  position?: number | string;
}

export function isChartLike(obj: unknown): obj is ChartLike {
  if (obj === null || typeof obj !== 'object') return false;
  const c = obj as Record<string, unknown>;
  return (
    'planets' in c ||
    'houses' in c ||
    'aspects' in c ||
    'asteroids' in c ||
    'angles' in c ||
    'points' in c
  );
}

export function hasChartContent(chart: ChartLike): boolean {
  return [
    chart.planets,
    chart.houses,
    chart.aspects,
    chart.asteroids,
    chart.angles,
    chart.points,
  ].some(section => {
    if (Array.isArray(section)) return section.length > 0;
    return section !== null && section !== undefined;
  });
}

// Helpers -------------------------------------------------------

export const getAspectOrb = (
  aspectType: string,
  currentOrb?: number
): number => {
  const aspectTypeLower =
    typeof aspectType === 'string' ? aspectType.toLowerCase() : '';
  if (
    currentOrb !== null &&
    currentOrb !== undefined &&
    Number.isNaN(currentOrb) === false
  )
    return currentOrb;
  if (
    aspectTypeLower.includes('conjunction') ||
    aspectTypeLower.includes('opposition')
  )
    return 10;
  return 8;
};

// Calculate which house a planet is in - helper that converts house objects to cusp array
const calculatePlanetHouse = (
  planetPosition: number,
  houses: ChartDisplayHouse[]
): number => {
  if (houses.length === 0) return 1;

  // Extract cusp degrees from house objects
  const houseCusps = houses.map(h => h.cusp);
  return calculateHousePosition(planetPosition, houseCusps);
};

function _toPlanetArray(
  input: unknown,
  houses: ChartDisplayHouse[] = []
): ChartDisplayPlanet[] {
  if (input === null || input === undefined) return [];
  if (Array.isArray(input)) return input as ChartDisplayPlanet[];
  if (typeof input === 'object') {
    return Object.entries(input as Record<string, LoosePlanetInput>).map(
      ([name, data]) => {
        const pos =
          typeof data.position === 'number'
            ? data.position
            : typeof data.degree === 'number'
              ? data.degree
              : 0;
        const degWithinSign = pos % 30;
        const displaySign = data.sign ?? getSignFromDegree(pos);

        // Calculate house position if not provided
        const houseNumber =
          typeof data.house === 'number'
            ? data.house
            : typeof data.house === 'string' && !isNaN(Number(data.house))
              ? Number(data.house)
              : calculatePlanetHouse(pos, houses);

        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          sign: displaySign,
          degree: degWithinSign,
          house: String(houseNumber),
          aspects: Array.isArray(data.aspects) ? data.aspects : [],
          position: pos,
          retrograde: Boolean(data.retrograde),
        } as ChartDisplayPlanet;
      }
    );
  }
  return [];
}

function _toHouseArray(input: unknown): ChartDisplayHouse[] {
  if (input === null || input === undefined) return [];
  const mapOne = (h: LooseHouseInput): ChartDisplayHouse => {
    const cusp =
      typeof h.cusp === 'number'
        ? h.cusp
        : typeof h.degree === 'number'
          ? h.degree
          : 0;
    return {
      house: h.number ?? h.house ?? 0,
      number: h.number ?? h.house ?? 0,
      sign: h.sign ?? getSignFromDegree(cusp),
      degree: cusp % 30,
      cusp,
      ruler:
        h.ruler ??
        getRulerFromSign((h.sign ?? getSignFromDegrees(cusp)) as ZodiacSign),
    } as ChartDisplayHouse;
  };
  if (Array.isArray(input)) return (input as LooseHouseInput[]).map(mapOne);
  if (typeof input === 'object')
    return Object.values(input as Record<string, LooseHouseInput>).map(mapOne);
  return [];
}

function _toAspectArray(input: unknown): ChartDisplayAspect[] {
  if (input === null || input === undefined) return [];

  const mapOne = (a: LooseAspectInput): ChartDisplayAspect => {
    // Try different field names that the API might use
    const type = a.type ?? a.aspect_type ?? a.aspect ?? 'Unknown';
    const rawOrb =
      typeof a.orb === 'number'
        ? a.orb
        : typeof a.orb === 'string'
          ? Number.isNaN(parseFloat(a.orb))
            ? 0
            : parseFloat(a.orb)
          : 0;
    const orb = getAspectOrb(type, rawOrb !== 0 ? rawOrb : undefined);
    return {
      planet1: a.planet1 ?? a.point1 ?? 'Unknown', // Backend uses point1
      planet2: a.planet2 ?? a.point2 ?? 'Unknown', // Backend uses point2
      type,
      orb,
      applying: a.applying ?? '',
    } as ChartDisplayAspect;
  };

  // Handle arrays (existing behavior)
  if (Array.isArray(input)) {
    return (input as LooseAspectInput[]).map(mapOne);
  }

  // Handle objects (new behavior to match toAsteroidArray pattern)
  if (typeof input === 'object') {
    return Object.values(input as Record<string, LooseAspectInput>).map(mapOne);
  }

  return [];
}

function _toAsteroidArray(
  input: unknown,
  houses: ChartDisplayHouse[] = []
): ChartDisplayAsteroid[] {
  if (input === null || input === undefined) return [];

  if (Array.isArray(input)) {
    return (input as LooseAsteroidInput[]).map(a => ({
      name: a.name ?? 'Unknown',
      sign: a.sign ?? 'Unknown',
      degree: a.degree ?? 0,
      house: a.house ?? 'Unknown',
    })) as ChartDisplayAsteroid[];
  }

  if (typeof input === 'object') {
    return Object.entries(input as Record<string, LooseAsteroidInput>).map(
      ([name, data]) => {
        const pos =
          typeof data.position === 'number'
            ? data.position
            : typeof data.degree === 'number'
              ? data.degree
              : 0;
        const degWithinSign = pos % 30;
        const displaySign = data.sign ?? getSignFromDegree(pos);

        // Calculate house position if not provided
        const houseNumber =
          typeof data.house === 'number'
            ? data.house
            : typeof data.house === 'string' && !isNaN(Number(data.house))
              ? Number(data.house)
              : calculatePlanetHouse(pos, houses);

        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          sign: displaySign,
          degree: degWithinSign,
          house: String(houseNumber),
          position: pos,
        } as ChartDisplayAsteroid;
      }
    );
  }

  return [];
}

function _toAngleArray(input: unknown): ChartDisplayAngle[] {
  if (Array.isArray(input)) return input as ChartDisplayAngle[];
  if (input !== null && typeof input === 'object') {
    return Object.entries(
      input as Record<string, number | string | LooseAngleInput>
    ).map(([name, val]) => {
      let position: number = 0;
      if (typeof val === 'number') position = val;
      else if (typeof val === 'string')
        position = Number.isNaN(parseFloat(val)) ? 0 : parseFloat(val);
      else if (typeof val === 'object')
        position =
          typeof val.position === 'number'
            ? val.position
            : typeof val.degree === 'number'
              ? val.degree
              : 0;
      const degree = parseFloat((position % 30).toFixed(2));
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        sign: getSignFromDegree(position),
        degree,
        position,
      } as ChartDisplayAngle;
    });
  }
  return [];
}

function _toPointArray(
  input: unknown,
  houses: ChartDisplayHouse[] = []
): ChartDisplayPlanet[] {
  if (input === null || input === undefined) return [];
  if (Array.isArray(input)) return input as ChartDisplayPlanet[];
  if (typeof input === 'object') {
    return Object.entries(input as Record<string, LoosePlanetInput>).map(
      ([name, data]) => {
        const pos =
          typeof data.position === 'number'
            ? data.position
            : typeof data.degree === 'number'
              ? data.degree
              : 0;
        const degWithinSign = pos % 30;
        const displaySign = data.sign ?? getSignFromDegree(pos);

        // Calculate house position if not provided
        const houseNumber =
          typeof data.house === 'number'
            ? data.house
            : typeof data.house === 'string' && !isNaN(Number(data.house))
              ? Number(data.house)
              : calculatePlanetHouse(pos, houses);

        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          sign: displaySign,
          degree: degWithinSign,
          house: String(houseNumber),
          aspects: Array.isArray(data.aspects) ? data.aspects : [],
          position: pos,
          retrograde: Boolean(data.retrograde),
        } as ChartDisplayPlanet;
      }
    );
  }
  return [];
}

  houses: ChartDisplayHouse[];
  aspects: ChartDisplayAspect[];
  asteroids: ChartDisplayAsteroid[];
  angles: ChartDisplayAngle[];
  points: ChartDisplayPlanet[]; // Points like nodes and Lilith, treated same as planets
}

export function normalizeChart(raw: ChartLike): {
  planets: ChartDisplayPlanet[];
  asteroids: ChartDisplayAsteroid[];
  angles: ChartDisplayAngle[];
  houses: ChartDisplayHouse[];
  aspects: ChartDisplayAspect[];
} {
  if (!raw || typeof raw !== 'object') {
    return { planets: [], asteroids: [], angles: [], houses: [], aspects: [] };
  }

  // CRITICAL FIX: Use raw backend response if available (bypasses API transformation)
  const rawContainer = raw as BackendResponseContainer;
  const backendData = rawContainer.__raw_backend_response ?? raw;

  // TEMPORARY DEBUG: Log data structure for troubleshooting
  if (typeof window !== 'undefined' && window.console) {
    window.console.group('🔍 normalizeChart Debug');
    window.console.log('Input source:', rawContainer.__raw_backend_response ? 'NEW_CALCULATION (with __raw_backend_response)' : 'SAVED_CHART (direct data)');
    window.console.log('Raw input type:', typeof raw);
    window.console.log('Raw input keys:', raw ? Object.keys(raw) : 'null');
    window.console.log('Backend data type:', typeof backendData);
    window.console.log('Backend data keys:', backendData ? Object.keys(backendData) : 'null');
    window.console.log('Backend planets:', backendData?.planets);
    window.console.log('Backend asteroids:', backendData?.asteroids);
    window.console.log('Backend aspects:', backendData?.aspects);
    window.console.log('Backend houses:', backendData?.houses);
    window.console.groupEnd();
  }

  // Process houses first for house position calculations
  const processedHouses: ChartDisplayHouse[] = [];
  const houseData = backendData.houses;

  // Handle houses data
  if (Array.isArray(houseData)) {
    houseData.forEach((house: Record<string, unknown>, index: number) => {
      const houseNumber = index + 1;
      const cusp = typeof house.cusp === 'number' ? house.cusp : (typeof house === 'number' ? house : 0);
      processedHouses.push({
        house: Number(houseNumber) || 1,
        number: Number(houseNumber) || 1,
        cusp,
        sign: getSignFromDegree(cusp),
        degree: getDegreeWithinSign(cusp),
        ruler: getRulerFromSign(getSignFromDegree(cusp) as ZodiacSign),
      });
    });
  } else if (typeof houseData === 'object' && houseData) {
    Object.entries(houseData).forEach(([key, house]: [string, Record<string, unknown>]) => {
      const houseNumber = key.replace('house_', '');
      const cusp = typeof house.cusp === 'number' ? house.cusp : (typeof house === 'number' ? house : 0);
      processedHouses.push({
        house: Number(houseNumber.replace('house_', '')) || 1,
        number: Number(houseNumber.replace('house_', '')) || 1,
        cusp,
        sign: getSignFromDegree(cusp),
        degree: getDegreeWithinSign(cusp),
        ruler: getRulerFromSign(getSignFromDegree(cusp) as ZodiacSign),
      });
    });
  }

  // Initialize collections
  const allCelestialBodies: ChartDisplayPlanet[] = [];
  const categorizedAsteroids: ChartDisplayAsteroid[] = [];
  const categorizedPoints: ChartDisplayPlanet[] = [];

  // Process asteroids from backend 'asteroids' field
  if (backendData.asteroids && typeof backendData.asteroids === 'object') {
    const asteroidsData = backendData.asteroids;
    Object.entries(asteroidsData).forEach(([name, data]: [string, Record<string, unknown>]) => {
      if (
        data &&
        typeof data === 'object' &&
        typeof data.position === 'number'
      ) {
        const pos = Number(data.position) || 0;
        const houseNumber = calculateHousePosition(
          pos,
          processedHouses.map(h => h.cusp)
        );
        const displaySign = getSignFromDegree(pos);
        const degWithinSign = getDegreeWithinSign(pos);

        // Create asteroid entry
        const asteroid: ChartDisplayAsteroid = {
          name,
          sign: displaySign,
          degree: degWithinSign,
          house: String(houseNumber),
        };
        categorizedAsteroids.push(asteroid);

        // Also add to all celestial bodies for potential point filtering
        const planetEntry: ChartDisplayPlanet = {
          name,
          position: pos,
          sign: displaySign,
          degree: degWithinSign,
          house: String(houseNumber),
          aspects: Array.isArray(data.aspects) ? data.aspects : [],
          retrograde: Boolean(data.retrograde),
        };
        allCelestialBodies.push(planetEntry);
      }
    });
  }

  // Process points from backend 'points' field
  if (backendData.points && typeof backendData.points === 'object') {
    const pointsData = backendData.points;
    Object.entries(pointsData).forEach(([name, data]: [string, Record<string, unknown>]) => {
      if (
        data &&
        typeof data === 'object' &&
        typeof data.position === 'number'
      ) {
        const pos = Number(data.position) || 0;
        const houseNumber = calculateHousePosition(
          pos,
          processedHouses.map(h => h.cusp)
        );
        const displaySign = getSignFromDegree(pos);
        const degWithinSign = getDegreeWithinSign(pos);

        const pointEntry: ChartDisplayPlanet = {
          name,
          position: pos,
          sign: displaySign,
          degree: degWithinSign,
          house: String(houseNumber),
          aspects: Array.isArray(data.aspects) ? data.aspects : [],
          retrograde: Boolean(data.retrograde),
        };
        categorizedPoints.push(pointEntry);
        allCelestialBodies.push(pointEntry);
      }
    });
  }

  // Process additional fields (uranian, hypothetical_points, etc.)
  ['uranian', 'hypothetical_points'].forEach(fieldName => {
    if (backendData[fieldName] && typeof backendData[fieldName] === 'object') {
      Object.entries(backendData[fieldName]).forEach(
        ([name, data]: [string, Record<string, unknown>]) => {
          if (
            data &&
            typeof data === 'object' &&
            typeof data.position === 'number'
          ) {
            const pos = Number(data.position) || 0;
            const houseNumber = calculateHousePosition(
              pos,
              processedHouses.map(h => h.cusp)
            );
            const displaySign = getSignFromDegree(pos);
            const degWithinSign = getDegreeWithinSign(pos);

            const pointEntry: ChartDisplayPlanet = {
              name,
              position: pos,
              sign: displaySign,
              degree: degWithinSign,
              house: String(houseNumber),
              aspects: Array.isArray(data.aspects) ? data.aspects : [],
              retrograde: Boolean(data.retrograde),
            };
            categorizedPoints.push(pointEntry);
            allCelestialBodies.push(pointEntry);
          }
        }
      );
    }
  });

  // Process main planets from backend 'planets' field
  if (backendData.planets && typeof backendData.planets === 'object') {
    const planetsData = backendData.planets;
    Object.entries(planetsData).forEach(([name, data]: [string, Record<string, unknown>]) => {
      if (
        data &&
        typeof data === 'object' &&
        typeof data.position === 'number'
      ) {
        const pos = Number(data.position) || 0;
        const houseNumber = calculateHousePosition(
          pos,
          processedHouses.map(h => h.cusp)
        );
        const displaySign = getSignFromDegree(pos);
        const degWithinSign = getDegreeWithinSign(pos);

        const planetEntry: ChartDisplayPlanet = {
          name,
          position: pos,
          sign: displaySign,
          degree: degWithinSign,
          house: String(houseNumber),
          aspects: Array.isArray(data.aspects) ? data.aspects : [],
          retrograde: Boolean(data.retrograde),
        };
        allCelestialBodies.push(planetEntry);
      }
    });
  }

  // Process aspects
  const processedAspects: ChartDisplayAspect[] = [];
  if (Array.isArray(backendData.aspects)) {
    backendData.aspects.forEach((aspect: Record<string, unknown>) => {
      if (aspect && typeof aspect === 'object') {
        processedAspects.push({
          planet1: typeof aspect.planet1 === 'string' ? aspect.planet1 : '',
          planet2: typeof aspect.planet2 === 'string' ? aspect.planet2 : '',
          type: typeof aspect.type === 'string' ? aspect.type : '',
          orb: Number(aspect.orb) || 0,
          applying: typeof aspect.applying === 'string' ? aspect.applying : '',
        });
      }
    });
  }

  // Process angles
  const processedAngles: ChartDisplayAngle[] = [];
  if (backendData.angles && typeof backendData.angles === 'object') {
    Object.entries(backendData.angles).forEach(
      ([name, position]: [string, unknown]) => {
        if (typeof position === 'number') {
          processedAngles.push({
            name,
            sign: getSignFromDegree(position),
            degree: getDegreeWithinSign(position),
            position,
          });
        }
      }
    );
  }

  // Final categorization complete

  // Filter planets vs points for final categorization
  const isMainPlanet = (body: ChartDisplayPlanet): boolean => {
    const planetNames = [
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
    ];
    return planetNames.includes(body.name.toLowerCase());
  };

  // Merge points into planets array for now (ChartDisplay will filter them)
  const allPlanets = [
    ...allCelestialBodies.filter(isMainPlanet),
    ...categorizedPoints,
  ];

  // TEMPORARY DEBUG: Log final results
  if (typeof window !== 'undefined' && window.console) {
    window.console.group('✅ normalizeChart Results');
    window.console.log('Final planets count:', allPlanets.length);
    window.console.log('Final asteroids count:', categorizedAsteroids.length);
    window.console.log('Final houses count:', processedHouses.length);
    window.console.log('Final aspects count:', processedAspects.length);
    window.console.log('Final angles count:', processedAngles.length);
    if (allPlanets.length === 0) {
      window.console.warn('🚨 NO PLANETS FOUND - Check data structure');
      window.console.log('All celestial bodies:', allCelestialBodies);
    }
    window.console.groupEnd();
  }

  return {
    planets: allPlanets,
    asteroids: categorizedAsteroids,
    houses: processedHouses,
    aspects: processedAspects,
    angles: processedAngles,
  };
}
