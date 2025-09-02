// Centralized symbol maps for celestial bodies with proper Unicode symbols
import {
  getCelestialSymbol,
  getZodiacSymbol,
  getAspectSymbol as getAspectSymbolFromService,
  getElementColor as getElementColorFromService,
} from '@/services/symbolService';

// Basic interpretation constants (placeholder implementations)
const MOON_SIGN_INTERPRETATIONS: Record<string, string> = {};
const SIGN_INTERPRETATIONS: Record<string, string> = {};
type PlanetInterpretationFn = (planet: string, sign: string) => string;

export const getPlanetSymbol = (name: string): string => {
  console.log('getPlanetSymbol called with:', name);
  return getCelestialSymbol(name);
};

export const getSignSymbol = (sign: string): string => {
  console.log('getSignSymbol called with:', sign);
  return getZodiacSymbol(sign);
};

export const getAspectSymbol = (aspect: string): string => {
  console.log('getAspectSymbol called with:', aspect);
  return getAspectSymbolFromService(aspect);
};

export const getAsteroidSymbol = (name: string): string => {
  return getCelestialSymbol(name);
};

// Utility function for capitalizing strings
const _capitalize = (s: string): string => {
  if (!s || typeof s !== 'string') return '';
  const first = s.charAt(0).toUpperCase();
  return first + s.slice(1).toLowerCase();
};

// Lightweight interpretation subset (avoid pulling heavy logic)

export const getPlanetInterpretation: PlanetInterpretationFn = (
  planet,
  sign
) => {
  if (planet === 'Moon') {
    return (
      MOON_SIGN_INTERPRETATIONS[sign] ??
      SIGN_INTERPRETATIONS[sign] ??
      'Emotional influence'
    );
  }
  return SIGN_INTERPRETATIONS[sign] ?? 'Planetary influence';
};

// Element-based color scheme
export function getElementColor(sign: string): string {
  return getElementColorFromService(sign);
}

// Export utility for consistency
