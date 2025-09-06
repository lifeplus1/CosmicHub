/**
 * Backend Response Transformation - Focused Modules
 */
import type { Planet, House, Aspect, PlanetName, ZodiacSign, ChartData } from './api.types';
import { getSignFromDegrees, calculateHousePosition, isZodiacSign } from '../utils/astrologyUtils';
import { isAspectType } from './validation';
import { isPlanetForDisplay } from '../utils/celestialBodyCategorization';

// Backend response interfaces  
export interface BackendChartResponse {
  planets?: Record<string, unknown>;
  houses?: Record<string, unknown> | number[];
  aspects?: unknown[];
  asteroids?: Record<string, unknown>;
  points?: Record<string, unknown>;
  angles?: Record<string, unknown>;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  julian_day?: number;
  house_system?: string;
  [key: string]: unknown; // Allow additional properties
}

// Type guard to validate and cast backend response
export function isValidBackendResponse(response: unknown): response is BackendChartResponse {
  return response !== null && typeof response === 'object';
}

/**
 * Transform backend planet data to frontend format
 */
export function transformPlanets(
  rawPlanets: unknown,
  houseCusps: number[]
): Record<PlanetName, Planet> {
  const planets: Partial<Record<PlanetName, Planet>> = {};
  
  if (!rawPlanets || typeof rawPlanets !== 'object') {
    return getDefaultPlanets();
  }

  // Handle both object map and array formats
  if (Array.isArray(rawPlanets)) {
    for (const item of rawPlanets) {
      if (!item || typeof item !== 'object') continue;
      const itemData = item as Record<string, unknown>;
      const nameRaw = itemData.name;
      if (!isPlanetName(nameRaw as string)) continue;
      if (!isPlanetForDisplay(nameRaw as string)) continue;
      
      const planet = transformSinglePlanet(nameRaw as string, itemData, houseCusps);
      if (planet) {
        planets[nameRaw as PlanetName] = planet;
      }
    }
    return planets as Record<PlanetName, Planet>;
  }
  
  return transformPlanetObject(rawPlanets as Record<string, unknown>, houseCusps);
}

/**
 * Transform backend house data to frontend format
 */
export function transformHouses(rawHouses: unknown): House[] {
  const houses: House[] = [];
  
  if (Array.isArray(rawHouses)) {
    rawHouses.forEach((hv, idx) => {
      const houseNumber = idx + 1;
      if (houseNumber < 1 || houseNumber > 12) return;
      
      const cusp = typeof hv === 'number' ? hv : 0;
      houses.push({
        number: houseNumber as House['number'],
        cusp,
        sign: getSignFromDegrees(cusp),
      });
    });
  } else if (rawHouses && typeof rawHouses === 'object') {
    const houseObj = rawHouses as Record<string, unknown>;
    for (const [houseKey, houseValue] of Object.entries(houseObj)) {
      const houseNumber = houseKey.includes('house_')
        ? parseInt(houseKey.replace('house_', ''))
        : parseInt(houseKey, 10);
      if (Number.isNaN(houseNumber) || houseNumber < 1 || houseNumber > 12) continue;
      
      let cusp = 0;
      let sign: ZodiacSign = 'aries';
      
      if (typeof houseValue === 'number') {
        cusp = houseValue;
        sign = getSignFromDegrees(cusp);
      } else if (houseValue && typeof houseValue === 'object') {
        const houseData = houseValue as Record<string, unknown>;
        cusp = typeof houseData.cusp === 'number' ? houseData.cusp : 0;
        const signVal = houseData.sign;
        if (typeof signVal === 'string' && isZodiacSign(signVal)) {
          sign = signVal;
        } else {
          sign = getSignFromDegrees(cusp);
        }
      }
      
      houses.push({
        number: houseNumber as House['number'],
        cusp,
        sign,
      });
    }
  }
  
  return houses.sort((a, b) => a.number - b.number);
}

/**
 * Transform backend aspect data to frontend format
 */
export function transformAspects(rawAspects: unknown): Aspect[] {
  if (!Array.isArray(rawAspects)) return [];
  
  const aspects: Aspect[] = [];
  
  for (const aspect of rawAspects) {
    if (!aspect || typeof aspect !== 'object') continue;
    
    const transformed = transformSingleAspect(aspect as Record<string, unknown>);
    if (transformed) {
      aspects.push(transformed);
    }
  }
  
  return aspects;
}

/**
 * Transform a single aspect from backend format
 */
function transformSingleAspect(aspectData: Record<string, unknown>): Aspect | null {
  // Handle new backend format (point1/point2 + aspect)
  if (aspectData.point1 && aspectData.point2 && aspectData.aspect) {
    const { point1, point2, aspect, orb, applying, exact, power } = aspectData;
    
    if (
      typeof point1 === 'string' && isPlanetName(point1) &&
      typeof point2 === 'string' && isPlanetName(point2) &&
      typeof aspect === 'string' && isAspectType(aspect) &&
      typeof orb === 'number'
    ) {
      return {
        aspect_type: aspect,
        planet1: point1,
        planet2: point2,
        orb,
        applying: Boolean(applying),
        exact: Boolean(exact),
        power: typeof power === 'number' ? power : undefined,
      };
    }
  }
  
  // Handle legacy format (planet1/planet2 + type)
  if (aspectData.planet1 && aspectData.planet2 && aspectData.type) {
    const { planet1, planet2, type, orb, applying, exact, power } = aspectData;
    
    if (
      typeof planet1 === 'string' && isPlanetName(planet1) &&
      typeof planet2 === 'string' && isPlanetName(planet2) &&
      typeof type === 'string' && isAspectType(type) &&
      typeof orb === 'number'
    ) {
      return {
        aspect_type: type,
        planet1,
        planet2,
        orb,
        applying: Boolean(applying),
        exact: Boolean(exact),
        power: typeof power === 'number' ? power : undefined,
      };
    }
  }
  
  return null;
}

// Helper functions for focused transformation
function transformPlanetObject(
  rawPlanets: Record<string, unknown>,
  houseCusps: number[]
): Record<PlanetName, Planet> {
  const planets: Partial<Record<PlanetName, Planet>> = {};
  
  for (const [name, value] of Object.entries(rawPlanets)) {
    if (!isPlanetName(name) || !isPlanetForDisplay(name)) continue;
    if (!value || typeof value !== 'object') continue;
    
    const planetData = value as Record<string, unknown>;
    const planet = transformSinglePlanet(name, planetData, houseCusps);
    if (planet) {
      planets[name] = planet;
    }
  }
  
  return planets as Record<PlanetName, Planet>;
}

function transformSinglePlanet(
  name: string,
  data: Record<string, unknown>,
  houseCusps: number[]
): Planet | null {
  if (!isPlanetName(name)) return null;
  
  const position = typeof data.position === 'number' ? data.position
                 : typeof data.longitude === 'number' ? data.longitude
                 : 0;
                 
  const sign = typeof data.sign === 'string' && isZodiacSign(data.sign)
             ? data.sign
             : getSignFromDegrees(position);
             
  const house = typeof data.house === 'number'
              ? data.house
              : calculateHousePosition(position, houseCusps);

  return {
    name,
    position,
    retrograde: Boolean(data.retrograde),
    speed: typeof data.speed === 'number' ? data.speed : 0,
    sign,
    house,
    dignity: data.dignity as Planet['dignity'],
    essential_dignity: typeof data.essential_dignity === 'number' 
                     ? data.essential_dignity 
                     : undefined,
  };
}

// Default planets for fallback
function getDefaultPlanets(): Record<PlanetName, Planet> {
  const planetNames: PlanetName[] = [
    'sun', 'moon', 'mercury', 'venus', 'mars', 
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
  ];
  
  const planets: Partial<Record<PlanetName, Planet>> = {};
  
  planetNames.forEach(name => {
    planets[name] = {
      name,
      position: 0,
      retrograde: false,
      speed: 0,
      sign: 'aries' as ZodiacSign,
      house: 1,
    };
  });
  
  return planets as Record<PlanetName, Planet>;
}

// Type guard helpers
function isPlanetName(value: string): value is PlanetName {
  const list: PlanetName[] = [
    'sun', 'moon', 'mercury', 'venus', 'mars',
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
    'chiron', 'north_node', 'south_node'
  ];
  return list.includes(value as PlanetName);
}

/**
 * Main backend response transformation function
 * Transform complete backend response to frontend ChartData format
 */
export function transformBackendResponse(backendResponse: unknown): ChartData {
  if (!isValidBackendResponse(backendResponse)) {
    return getDefaultChartData();
  }

  const raw: BackendChartResponse = backendResponse;

  // Extract house cusps first for planet calculations
  const houseCusps = extractHouseCusps(raw);
  
  // Transform each section
  const planets = transformPlanets(raw.planets, houseCusps);
  const houses = transformHouses(raw.houses);
  const aspects = transformAspects(raw.aspects);
  const angles = transformAngles(raw.angles, houses);
  
  // Handle metadata
  const latitude = typeof raw.latitude === 'number' ? raw.latitude : 0;
  const longitude = typeof raw.longitude === 'number' ? raw.longitude : 0;
  const timezone = typeof raw.timezone === 'string' ? raw.timezone : 'UTC';
  const julian_day = typeof raw.julian_day === 'number' ? raw.julian_day : 0;
  const house_system = typeof raw.house_system === 'string' 
    ? (raw.house_system as ChartData['house_system']) 
    : 'placidus';

  return {
    planets,
    houses,
    aspects,
    angles,
    latitude,
    longitude,
    timezone,
    julian_day,
    house_system,
    // Include additional data if present
    asteroids: transformAsteroids(raw.asteroids, houseCusps),
    points: transformPoints(raw.points, houseCusps),
    // Preserve raw data for debugging
    __raw_backend_response: raw,
  } as ChartData;
}

/**
 * Extract house cusps from raw backend data
 */
function extractHouseCusps(raw: Record<string, unknown>): number[] {
  const rawHouses = raw.houses;
  const houseCusps: number[] = [];

  if (Array.isArray(rawHouses)) {
    rawHouses.forEach((h, idx) => {
      if (typeof h === 'object' && h !== null && 'cusp' in h) {
        const houseData = h as { cusp?: number };
        houseCusps.push(typeof houseData.cusp === 'number' ? houseData.cusp : idx * 30);
      } else {
        houseCusps.push(typeof h === 'number' ? h : idx * 30);
      }
    });
  } else if (rawHouses && typeof rawHouses === 'object') {
    // Handle object format
    for (let i = 1; i <= 12; i++) {
      const houseKey = `house_${i}`;
      const houseData = (rawHouses as Record<string, unknown>)[houseKey];
      if (typeof houseData === 'object' && houseData !== null && 'cusp' in houseData) {
        const cusp = (houseData as { cusp?: number }).cusp;
        houseCusps.push(typeof cusp === 'number' ? cusp : (i - 1) * 30);
      } else {
        houseCusps.push((i - 1) * 30);
      }
    }
  }

  return houseCusps.length === 12 ? houseCusps : Array.from({ length: 12 }, (_, i) => i * 30);
}

/**
 * Transform chart angles
 */
function transformAngles(rawAngles: unknown, houses: House[]): ChartData['angles'] {
  const defaultAsc = houses[0]?.cusp ?? 0;
  const defaultMc = houses[9]?.cusp ?? 0;
  
  if (rawAngles && typeof rawAngles === 'object') {
    const angles = rawAngles as Record<string, unknown>;
    return {
      ascendant: typeof angles.ascendant === 'number' ? angles.ascendant : defaultAsc,
      midheaven: typeof angles.mc === 'number' ? angles.mc : 
                 typeof angles.midheaven === 'number' ? angles.midheaven : defaultMc,
      descendant: typeof angles.descendant === 'number' ? angles.descendant : defaultAsc + 180,
      imumcoeli: typeof angles.ic === 'number' ? angles.ic :
                 typeof angles.imumcoeli === 'number' ? angles.imumcoeli : defaultMc + 180,
      vertex: typeof angles.vertex === 'number' ? angles.vertex : undefined,
      antivertex: typeof angles.antivertex === 'number' ? angles.antivertex : undefined,
      part_of_fortune: typeof angles.part_of_fortune === 'number' ? angles.part_of_fortune : undefined,
    };
  }

  return {
    ascendant: defaultAsc,
    midheaven: defaultMc,
    descendant: defaultAsc + 180,
    imumcoeli: defaultMc + 180,
  };
}

/**
 * Transform asteroids data
 */
function transformAsteroids(rawAsteroids: unknown, houseCusps: number[]): Record<string, Planet> {
  const asteroids: Record<string, Planet> = {};
  
  if (rawAsteroids && typeof rawAsteroids === 'object') {
    const asteroidsData = rawAsteroids as Record<string, unknown>;
    Object.entries(asteroidsData).forEach(([name, data]) => {
      if (data && typeof data === 'object') {
        const asteroidData = data as Record<string, unknown>;
        const position = typeof asteroidData.position === 'number' ? asteroidData.position : 0;
        asteroids[name] = {
          name: name as PlanetName,
          position,
          retrograde: Boolean(asteroidData.retrograde),
          speed: typeof asteroidData.speed === 'number' ? asteroidData.speed : 0,
          sign: typeof asteroidData.sign === 'string' && isZodiacSign(asteroidData.sign)
            ? asteroidData.sign
            : getSignFromDegrees(position),
          house: typeof asteroidData.house === 'number'
            ? asteroidData.house
            : calculateHousePosition(position, houseCusps),
        };
      }
    });
  }
  
  return asteroids;
}

/**
 * Transform points data (nodes, lilith, etc.)
 */
function transformPoints(rawPoints: unknown, houseCusps: number[]): Record<string, Planet> {
  const points: Record<string, Planet> = {};
  
  if (rawPoints && typeof rawPoints === 'object') {
    const pointsData = rawPoints as Record<string, unknown>;
    Object.entries(pointsData).forEach(([name, data]) => {
      if (data && typeof data === 'object') {
        const pointData = data as Record<string, unknown>;
        const position = typeof pointData.position === 'number' ? pointData.position : 0;
        points[name] = {
          name: name as PlanetName,
          position,
          retrograde: Boolean(pointData.retrograde),
          speed: typeof pointData.speed === 'number' ? pointData.speed : 0,
          sign: typeof pointData.sign === 'string' && isZodiacSign(pointData.sign)
            ? pointData.sign
            : getSignFromDegrees(position),
          house: typeof pointData.house === 'number'
            ? pointData.house
            : calculateHousePosition(position, houseCusps),
        };
      }
    });
  }
  
  return points;
}

/**
 * Get default chart data for fallback
 */
function getDefaultChartData(): ChartData {
  return {
    planets: getDefaultPlanets(),
    houses: [],
    aspects: [],
    angles: {
      ascendant: 0,
      midheaven: 0,
      descendant: 180,
      imumcoeli: 180,
    },
    latitude: 0,
    longitude: 0,
    timezone: 'UTC',
    julian_day: 0,
    house_system: 'placidus',
  };
}
