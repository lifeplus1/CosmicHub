// Centralized symbol maps for celestial bodies with proper Unicode symbols

export const getPlanetSymbol = (name: string): string => {
  console.log(
    'getPlanetSymbol called with:',
    name,
    'PLANET_SYMBOLS[name]:',
    PLANET_SYMBOLS[name]
  );
  if (typeof name !== 'string' || name.length === 0) return '●';
  return PLANET_SYMBOLS[name] !== undefined && PLANET_SYMBOLS[name].length > 0
    ? PLANET_SYMBOLS[name]
    : ASTEROID_SYMBOLS[name] !== undefined && ASTEROID_SYMBOLS[name].length > 0
      ? ASTEROID_SYMBOLS[name]
      : '●';
};

export const getSignSymbol = (sign: string): string => {
  console.log(
    'getSignSymbol called with:',
    sign,
    'SIGN_SYMBOLS[sign]:',
    SIGN_SYMBOLS[sign]
  );
  if (typeof sign !== 'string' || sign.length === 0) return '○';
  return SIGN_SYMBOLS[sign] !== undefined && SIGN_SYMBOLS[sign].length > 0
    ? SIGN_SYMBOLS[sign]
    : '○';
};

export const getAspectSymbol = (aspect: string): string => {
  console.log(
    'getAspectSymbol called with:',
    aspect,
    'ASPECT_SYMBOLS[aspect]:',
    ASPECT_SYMBOLS[aspect]
  );
  if (typeof aspect !== 'string' || aspect.length === 0) return '◇';
  if (ASPECT_SYMBOLS[aspect] !== undefined && ASPECT_SYMBOLS[aspect].length > 0)
    return ASPECT_SYMBOLS[aspect];
  const cap = aspect.charAt(0).toUpperCase() + aspect.slice(1);
  if (ASPECT_SYMBOLS[cap] !== undefined && ASPECT_SYMBOLS[cap].length > 0)
    return ASPECT_SYMBOLS[cap];
  return '◇';
};

export const getAsteroidSymbol = (name: string): string => {
  if (typeof name !== 'string' || name.length === 0) return '●';
  return ASTEROID_SYMBOLS[name] !== undefined &&
    ASTEROID_SYMBOLS[name].length > 0
    ? ASTEROID_SYMBOLS[name]
    : '●';
};

// Utility function for capitalizing strings
const capitalize = (s: string): string => {
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
  switch (sign) {
    case 'Aries':
    case 'Leo':
    case 'Sagittarius':
      return 'text-red-400';
    case 'Taurus':
    case 'Virgo':
    case 'Capricorn':
      return 'text-green-400';
    case 'Gemini':
    case 'Libra':
    case 'Aquarius':
      return 'text-yellow-400';
    case 'Cancer':
    case 'Scorpio':
    case 'Pisces':
      return 'text-blue-400';
  }

  // Fallback based on planet type
  if (sign === 'Sun') {
    return 'text-cosmic-gold';
  }

  return 'text-cosmic-silver';
}

// Export utility for consistency
