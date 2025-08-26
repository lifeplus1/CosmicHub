/**
 * Centralized symbol service to eliminate redundant symbol mappings
 * across ChartDisplay and MultiSystemChart components
 */

// Core celestial body symbols (canonical mappings)
const CORE_CELESTIAL_SYMBOLS: Record<string, string> = {
  // Traditional planets
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',

  // Nodes
  northnode: '☊',
  southnode: '☋',

  // Major asteroids
  chiron: '⚷',
  ceres: '⚳',
  pallas: '⚴',
  juno: '⚵',
  vesta: '⚶',
  psyche: 'Ψ',

  // Minor asteroids (extended set)
  eros: '⯱',
  fortuna: '⯮',
  hygiea: '⯩',
  astraea: '⯙',
  hebe: '⯤',
  iris: '⯫',
  flora: '⯛',
  metis: '⯥',
  parthenope: '⯦',
  victoria: '⯧',
  egeria: '⯨',
  eunomia: '⯪',
  thetis: '⯬',
  melpomene: '⯭',
  massalia: '⯯',

  // Lilith points
  lilithmean: '⚸',
  lilithtrue: '⚸',

  // Angles
  ascendant: '☊',
  descendant: '☋',
  midheaven: '☉',
  imumcoeli: '☽',
  ic: '☽',
  mc: '☉',

  // Special points
  vertex: '⚹',
  antivertex: '⚺',
  partoffortune: '⊕',
  fortune: '⊕',

  // Uranian/Hamburg School
  hades: '♇₁',
  zeus: '♃₁',
  kronos: '♄₁',
  apollon: '☉₁',
  admetos: '♁',
  vulkanus: '⚡',
  poseidon: '♆₁',
  cupido: '⚷₂',
};

// Zodiac sign symbols
const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

// Aspect symbols
const ASPECT_SYMBOLS_MAP: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
  quincunx: '⚻',
  semisextile: '⚺',
  semisquare: '∠',
  sesquiquadrate: '⚼',
  quintile: 'Q',
  biquintile: 'bQ',
  septile: '⚶',
  novile: '⚷',
  decile: '⚸',
};

// Name normalization function
function normalizeName(name: string): string {
  if (typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/[_\s-]/g, '') // Remove underscores, spaces, hyphens
    .replace(/\(.*?\)/g, '') // Remove parenthetical content like "(Mean)"
    .trim();
}

// Main symbol lookup functions
export function getCelestialSymbol(name: string): string {
  if (!name) return '●';

  const normalized = normalizeName(name);
  const symbol = CORE_CELESTIAL_SYMBOLS[normalized];

  if (symbol) return symbol;

  // Fallback for common variations
  const variations = [
    normalized.replace('node', ''),
    normalized.replace('lilith', ''),
    normalized.replace('part', '').replace('of', ''),
  ];

  for (const variation of variations) {
    const fallbackSymbol = CORE_CELESTIAL_SYMBOLS[variation];
    if (fallbackSymbol) return fallbackSymbol;
  }

  return '●'; // Default fallback
}

export function getZodiacSymbol(sign: string): string {
  if (!sign) return '○';

  const normalized = normalizeName(sign);
  return ZODIAC_SYMBOLS[normalized] || '○';
}

export function getAspectSymbol(aspect: string): string {
  if (!aspect) return '◇';

  const normalized = normalizeName(aspect);
  return ASPECT_SYMBOLS_MAP[normalized] || '◇';
}

// Utility functions for formatting degrees/positions
export function formatDegreePosition(position: number): string {
  if (typeof position !== 'number' || isNaN(position)) return 'N/A';

  const zodiacSigns = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];

  const sign = Math.floor(position / 30) % 12;
  const degree = position % 30;
  const minutes = Math.floor((degree % 1) * 60);

  return `${Math.floor(degree)}°${String(minutes).padStart(2, '0')}' ${zodiacSigns[sign]}`;
}

// Export symbol maps for backward compatibility if needed
export const CelestialSymbols = CORE_CELESTIAL_SYMBOLS;
export const ZodiacSymbols = ZODIAC_SYMBOLS;
export const AspectSymbols = ASPECT_SYMBOLS_MAP;

// Element-based color mapping
export function getElementColor(sign: string): string {
  const normalized = normalizeName(sign);

  const fireSign = ['aries', 'leo', 'sagittarius'].includes(normalized);
  const earthSign = ['taurus', 'virgo', 'capricorn'].includes(normalized);
  const airSign = ['gemini', 'libra', 'aquarius'].includes(normalized);
  const waterSign = ['cancer', 'scorpio', 'pisces'].includes(normalized);

  if (fireSign) return 'text-red-400';
  if (earthSign) return 'text-green-400';
  if (airSign) return 'text-yellow-400';
  if (waterSign) return 'text-blue-400';

  return 'text-cosmic-silver';
}

// Professional validation function
export function validateCelestialName(name: string): boolean {
  if (!name) return false;
  const normalized = normalizeName(name);
  return Object.keys(CORE_CELESTIAL_SYMBOLS).includes(normalized);
}
