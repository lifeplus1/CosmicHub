// Centralized symbol maps for celestial bodies with proper Unicode symbols
export const PLANET_SYMBOLS: Record<string, string> = {
  // Traditional planets (capitalized versions from normalizeChart)
  Sun: '☉', // U+2609 SUN
  Moon: '☽', // U+263D FIRST QUARTER MOON
  Mercury: '☿', // U+263F MERCURY
  Venus: '♀', // U+2640 FEMALE SIGN
  Mars: '♂', // U+2642 MALE SIGN
  Jupiter: '♃', // U+2643 JUPITER
  Saturn: '♄', // U+2644 SATURN
  Uranus: '♅', // U+2645 URANUS
  Neptune: '♆', // U+2646 NEPTUNE
  Pluto: '♇', // U+2647 PLUTO

  // Traditional planets (lowercase versions from API)
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

  // Major asteroids (proper Unicode)
  Chiron: '⚷', // U+26B7 CHIRON
  chiron: '⚷',
  Ceres: '⚳', // U+26B3 CERES
  ceres: '⚳',
  Pallas: '⚴', // U+26B4 PALLAS
  pallas: '⚴',
  Juno: '⚵', // U+26B5 JUNO
  juno: '⚵',
  Vesta: '⚶', // U+26B6 VESTA
  vesta: '⚶',
  Psyche: 'Ψ', // Greek letter PSI for Psyche
  psyche: 'Ψ',

  // Minor asteroids (using text abbreviations for better font compatibility)
  eros: 'Er',
  Eros: 'Er',
  fortuna: 'Fo',
  Fortuna: 'Fo',
  sedna: 'Se',
  Sedna: 'Se',
  eris: 'Ei',
  Eris: 'Ei',
  hygiea: 'Hy',
  Hygiea: 'Hy',
  astraea: 'As',
  Astraea: 'As',
  hebe: 'He',
  Hebe: 'He',
  iris: 'Ir',
  Iris: 'Ir',
  flora: 'Fl',
  Flora: 'Fl',
  metis: 'Me',
  Metis: 'Me',

  // Lunar Nodes (proper Unicode)
  North_node: '☊', // U+260A ASCENDING NODE
  north_node: '☊',
  South_node: '☋', // U+260B DESCENDING NODE
  south_node: '☋',

  // Lilith points (all variations)
  Lilith_mean: '⚸', // U+26B8 BLACK MOON LILITH
  lilith_mean: '⚸',
  Lilith_true: '⚸',
  lilith_true: '⚸',

  // Angles (using text abbreviations for clarity)
  Ascendant: 'AC',
  ascendant: 'AC',
  Descendant: 'DC',
  descendant: 'DC',
  Midheaven: 'MC',
  midheaven: 'MC',
  IC: 'IC',
  ic: 'IC',
  imumcoeli: 'IC',
  Imumcoeli: 'IC',
  'Imum Coeli': 'IC',

  // Special Points
  'Part of Fortune': '⊕', // U+2295 CIRCLED PLUS
  part_of_fortune: '⊕',

  // Vertex points
  Vertex: 'Vx',
  vertex: 'Vx',
  Antivertex: 'AVx',
  antivertex: 'AVx',

  // Mean Lunar Apogee (alternative Black Moon Lilith)
  'Mean Lunar Apogee': '⚸',
  mean_lunar_apogee: '⚸',

  // True Lunar Apogee
  'True Lunar Apogee': '⚸',
  true_lunar_apogee: '⚸',

  // Hamburg School / Uranian points (using text abbreviations)
  cupido: 'Cu',
  Cupido: 'Cu',
  hades: 'Ha',
  Hades: 'Ha',
  zeus: 'Ze',
  Zeus: 'Ze',
  kronos: 'Kr',
  Kronos: 'Kr',
  apollon: 'Ap',
  Apollon: 'Ap',
  admetos: 'Ad',
  Admetos: 'Ad',
  vulkanus: 'Vu',
  Vulkanus: 'Vu',
  poseidon: 'Po',
  Poseidon: 'Po',

  // Interpolated points (Hamburg School)
  intp_apog: 'IA',
  intp_perg: 'IP',
};

export const SIGN_SYMBOLS: Record<string, string> = {
  // Capitalized versions (from normalizeChart)
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
  // Lowercase versions (from API)
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

export const ASTEROID_SYMBOLS: Record<string, string> = {
  // Major asteroids (proper Unicode)
  Ceres: '⚳', // U+26B3 CERES
  ceres: '⚳',
  Pallas: '⚴', // U+26B4 PALLAS
  pallas: '⚴',
  Juno: '⚵', // U+26B5 JUNO
  juno: '⚵',
  Vesta: '⚶', // U+26B6 VESTA
  vesta: '⚶',
  Chiron: '⚷', // U+26B7 CHIRON
  chiron: '⚷',
  Lilith: '⚸', // U+26B8 BLACK MOON LILITH
  'Lilith (Mean)': '⚸',
  'Lilith (True)': '⚸',
  lilith_mean: '⚸',
  lilith_true: '⚸',
  Lilith_mean: '⚸',
  Lilith_true: '⚸',
  Psyche: 'Ψ', // Greek letter PSI
  psyche: 'Ψ',

  // Minor asteroids (using text abbreviations)
  Eros: 'Er',
  eros: 'Er',
  Fortuna: 'Fo',
  fortuna: 'Fo',
  Sedna: 'Se',
  sedna: 'Se',
  Eris: 'Ei',
  eris: 'Ei',
  Hygiea: 'Hy',
  hygiea: 'Hy',
  Astraea: 'As',
  astraea: 'As',
  Hebe: 'He',
  hebe: 'He',
  Iris: 'Ir',
  iris: 'Ir',
  Flora: 'Fl',
  flora: 'Fl',
  Metis: 'Me',
  metis: 'Me',

  // Centaurs
  Nessus: 'Ne',
  nessus: 'Ne',
  Pholus: 'Ph',
  pholus: 'Ph',

  // Trans-Neptunian Objects
  Quaoar: 'Qu',
  quaoar: 'Qu',
  Ixion: 'Ix',
  ixion: 'Ix',
  Varuna: 'Va',
  varuna: 'Va',

  // Additional numbered asteroids
  '1': '⚳', // Ceres
  '2': '⚴', // Pallas
  '3': '⚵', // Juno
  '4': '⚶', // Vesta
  '433': 'Er', // Eros
  '16': 'Ψ', // Psyche
  '19': 'Fo', // Fortuna
  '10': 'Hy', // Hygiea
};

export const ASPECT_SYMBOLS: Record<string, string> = {
  // Major aspects (proper Unicode)
  conjunction: '☌', // U+260C CONJUNCTION
  Conjunction: '☌',
  opposition: '☍', // U+260D OPPOSITION
  Opposition: '☍',
  trine: '△', // U+25B3 WHITE UP-POINTING TRIANGLE
  Trine: '△',
  square: '□', // U+25A1 WHITE SQUARE
  Square: '□',
  sextile: '⚹', // U+26B9 SEXTILE
  Sextile: '⚹',

  // Minor aspects
  quincunx: '⚻', // U+26BB QUINCUNX
  Quincunx: '⚻',
  semisextile: '⚺', // U+26BA SEMISEXTILE
  Semisextile: '⚺',
  semisquare: '∠', // U+2220 ANGLE
  Semisquare: '∠',
  sesquiquadrate: '⚼', // U+26BC SESQUIQUADRATE
  Sesquiquadrate: '⚼',
  quintile: 'Q', // Simple Q
  Quintile: 'Q',
  biquintile: 'bQ', // Simple bQ
  Biquintile: 'bQ',
  septile: 'S', // Simple S
  Septile: 'S',
  novile: 'N', // Simple N
  Novile: 'N',
  decile: 'D', // Simple D
  Decile: 'D',
};

export type PlanetInterpretationFn = (planet: string, sign: string) => string;

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
export const SIGN_INTERPRETATIONS: Record<string, string> = {
  Aries: 'Dynamic leadership energy',
  Taurus: 'Stable earthly presence',
  Gemini: 'Curious communicator',
  Cancer: 'Nurturing emotional depth',
  Leo: 'Creative radiant expression',
  Virgo: 'Analytical purpose',
  Libra: 'Harmonious balance',
  Scorpio: 'Transformative intensity',
  Sagittarius: 'Adventurous wisdom',
  Capricorn: 'Ambitious achiever',
  Aquarius: 'Innovative humanitarian',
  Pisces: 'Compassionate dreamer',
};

export const MOON_SIGN_INTERPRETATIONS: Record<string, string> = {
  Aries: 'Direct emotional expression',
  Taurus: 'Stable comfort seeking',
  Cancer: 'Deep nurturing instincts',
  Virgo: 'Practical emotional processing',
  Leo: 'Dramatic emotional flair',
  Libra: 'Harmonious emotional balance',
  Capricorn: 'Reserved emotional control',
  Aquarius: 'Detached humanitarian feelings',
  Pisces: 'Fluid empathic sensitivity',
};

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
export { capitalize };
