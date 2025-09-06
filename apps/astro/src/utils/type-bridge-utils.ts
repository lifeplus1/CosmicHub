/**
 * Type Bridge Utilities
 * 
 * Handles conversion between backend API format and frontend TypeScript types
 * following the Type Bridge System and Unified Type & Validation Strategy.
 * 
 * This ensures consistency between Python Pydantic models and TypeScript interfaces.
 */

import type { 
  Planet, 
  PlanetName, 
  ZodiacSign, 
  Aspect, 
  AspectType, 
  House,
  BackendPlanetData, 
  BackendAspectData, 
  BackendHouseData 
} from '@cosmichub/types';

/**
 * Convert planet name from backend format to frontend format
 * Backend: can be any case, but validates to lowercase
 * Frontend: expects lowercase PlanetName literals
 */
export function normalizePlanetName(name: string): PlanetName {
  const normalizedName = name.toLowerCase().trim() as PlanetName;
  
  // Validate against known planet names
  const validPlanetNames: PlanetName[] = [
    'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
    'uranus', 'neptune', 'pluto', 'chiron', 'north_node', 'south_node'
  ];
  
  if (!validPlanetNames.includes(normalizedName)) {
    console.warn(`Invalid planet name: ${name}, defaulting to 'sun'`);
    return 'sun';
  }
  
  return normalizedName;
}

/**
 * Convert zodiac sign from backend format to frontend format
 * Backend: validates to lowercase
 * Frontend: expects lowercase ZodiacSign literals
 */
export function normalizeZodiacSign(sign: string): ZodiacSign {
  const normalizedSign = sign.toLowerCase().trim() as ZodiacSign;
  
  // Validate against known zodiac signs
  const validSigns: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  
  if (!validSigns.includes(normalizedSign)) {
    console.warn(`Invalid zodiac sign: ${sign}, defaulting to 'aries'`);
    return 'aries';
  }
  
  return normalizedSign;
}

/**
 * Convert house from backend format to frontend format
 * Backend: string field (can be "1", "2", etc.)
 * Frontend: number field (1, 2, etc.)
 */
export function normalizeHouse(house: string | number): number {
  if (typeof house === 'number') {
    return Math.max(1, Math.min(12, Math.round(house)));
  }
  
  if (typeof house === 'string') {
    const parsed = parseInt(house, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) {
      return parsed;
    }
  }
  
  console.warn(`Invalid house value: ${house}, defaulting to 1`);
  return 1;
}

/**
 * Convert aspect applying field from backend format to frontend format
 * Backend: string field ("applying", "separating", etc.)
 * Frontend: boolean field (true for applying, false for separating)
 */
export function normalizeApplying(applying: string | boolean): boolean {
  if (typeof applying === 'boolean') {
    return applying;
  }
  
  if (typeof applying === 'string') {
    const normalized = applying.toLowerCase().trim();
    return normalized === 'applying' || normalized === 'true';
  }
  
  return false;
}

/**
 * Convert aspect type from backend format to frontend format
 * Backend: uses "type" field
 * Frontend: uses "aspect_type" field
 */
export function normalizeAspectType(type: string): AspectType {
  const normalizedType = type.toLowerCase().trim() as AspectType;
  
  // Validate against known aspect types
  const validAspects: AspectType[] = [
    'conjunction', 'opposition', 'trine', 'square', 'sextile',
    'quincunx', 'semi-sextile', 'semi-square', 'sesquiquadrate'
  ];
  
  if (!validAspects.includes(normalizedType)) {
    console.warn(`Invalid aspect type: ${type}, defaulting to 'conjunction'`);
    return 'conjunction';
  }
  
  return normalizedType;
}

/**
 * Convert backend planet data to frontend Planet interface
 */
export function convertBackendPlanet(data: BackendPlanetData): Planet {
  return {
    name: normalizePlanetName(data.name ?? ''),
    position: Number(data.position) ?? 0,
    degree: Number(data.degree) ?? Number(data.position) ?? 0,
    sign: normalizeZodiacSign(data.sign ?? ''),
    house: data.house, // Now properly typed as number (1-12)
    retrograde: Boolean(data.retrograde),
    speed: Number(data.speed) ?? 0,
    dignity: data.dignity, // Now properly typed with descriptive union
    essential_dignity: data.essential_dignity,
    aspects: data.aspects ? data.aspects.map(convertBackendAspect) : [],
    element: data.element, // Now properly typed with descriptive union
    modality: data.modality, // Now properly typed with descriptive union
    house_position: data.house_position // Now properly typed with descriptive union
  };
}

/**
 * Convert backend aspect data to frontend Aspect interface
 */
export function convertBackendAspect(data: BackendAspectData): Aspect {
  // Convert strength to power
  const getPowerFromStrength = (strength?: 'weak' | 'moderate' | 'strong' | 'very_strong'): number => {
    switch (strength) {
      case 'very_strong': return 1.0;
      case 'strong': return 0.8;
      case 'moderate': return 0.6;
      case 'weak': return 0.4;
      default: return 0.5;
    }
  };

  return {
    aspect_type: normalizeAspectType(data.aspect_type ?? data.type ?? 'conjunction'),
    planet1: normalizePlanetName(data.planet1 ?? ''),
    planet2: normalizePlanetName(data.planet2 ?? ''),
    orb: Number(data.orb) ?? 0,
    applying: Boolean(data.applying),
    exact: Boolean(data.exactness && Number(data.exactness) < 1),
    power: getPowerFromStrength(data.strength),
    aspect_angle: 0, // Not available in backend, default to 0
    separating: Boolean(data.separating),
    mutual_reception: undefined, // Not available in backend
    dignity_interaction: undefined, // Not available in backend
    timing: undefined // Not available in backend
  };
}

/**
 * Convert backend house data to frontend House interface
 */
export function convertBackendHouse(data: BackendHouseData): House {
  return {
    number: data.number as House['number'], // Now properly typed as number (1-12)
    cusp: Number(data.cusp) || Number(data.degree) || 0,
    sign: normalizeZodiacSign(data.sign || ''),
    ruler: data.ruler ? normalizePlanetName(data.ruler) : undefined,
    modern_ruler: undefined, // Not available in backend
    degree: Number(data.degree) || Number(data.cusp) || 0,
    size: 30, // Default house size, not available in backend
    contains_planets: [] // Not available in backend, will be calculated separately
  };
}
