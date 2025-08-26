// Centralized symbol maps for celestial bodies
export const PLANET_SYMBOLS: Record<string, string> = {
  // Traditional planets (capitalized versions from normalizeChart)
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',

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

  // Major asteroids
  Chiron: '⚷',
  chiron: '⚷',
  Ceres: '⚳',
  ceres: '⚳',
  Pallas: '⚴',
  pallas: '⚴',
  Juno: '⚵',
  juno: '⚵',
  Vesta: '⚶',
  vesta: '⚶',
  Psyche: 'Ψ',
  psyche: 'Ψ',

  // Minor asteroids
  eros: '⯱',
  Eros: '⯱',
  fortuna: '⯮',
  Fortuna: '⯮',
  sedna: '⯲',
  Sedna: '⯲',
  eris: '⯰',
  Eris: '⯰',
  hygiea: '⯩',
  Hygiea: '⯩',
  astraea: '⯙',
  Astraea: '⯙',
  hebe: '⯤',
  Hebe: '⯤',
  iris: '⯫',
  Iris: '⯫',
  flora: '⯛',
  Flora: '⯛',
  metis: '⯥',
  Metis: '⯥',

  // Nodes
  North_node: '☊',
  north_node: '☊',
  South_node: '☋',
  south_node: '☋',

  // Lilith points (all variations)
  Lilith_mean: '⚸',
  lilith_mean: '⚸',
  Lilith_true: '⚸',
  lilith_true: '⚸',

  // Angles (proper astronomical notation)
  Ascendant: '☌', // Use conjunction symbol for ascendant
  ascendant: '☌',
  Descendant: '☍', // Use opposition symbol for descendant
  descendant: '☍',
  Midheaven: '☊', // Use North Node symbol for MC
  midheaven: '☊',
  IC: '☋', // Use South Node symbol for IC
  ic: '☋',
  imumcoeli: '☋', // Add the missing lowercase variant that was causing the issue
  Imumcoeli: '☋',
  'Imum Coeli': '☋',

  // Special Points
  'Part of Fortune': '⊕', // Different symbol from asteroid Fortuna
  part_of_fortune: '⊕', // Add lowercase variant

  // Vertex points
  Vertex: '⚹',
  vertex: '⚹',
  Antivertex: '⚺',
  antivertex: '⚺',

  // Mean Lunar Apogee (alternative Black Moon Lilith)
  'Mean Lunar Apogee': '☾',
  mean_lunar_apogee: '☾',

  // True Lunar Apogee
  'True Lunar Apogee': '☽',
  true_lunar_apogee: '☽',

  // Hamburg School / Uranian points
  cupido: '⯙',
  Cupido: '⯙',
  hades: '⯚',
  Hades: '⯚',
  zeus: '⯛',
  Zeus: '⯛',
  kronos: '⯜',
  Kronos: '⯜',
  apollon: '⯝',
  Apollon: '⯝',
  admetos: '⯞',
  Admetos: '⯞',
  vulkanus: '⯟',
  Vulkanus: '⯟',
  poseidon: '⯠',
  Poseidon: '⯠',

  // Interpolated points (Hamburg School)
  intp_apog: '☾', // U+263E LAST QUARTER MOON (Interpolated Apogee)
  intp_perg: '☽₂', // FIRST QUARTER MOON with subscript 2 (Interpolated Perigee)
};

export const ASTEROID_SYMBOLS: Record<string, string> = {
  // Major asteroids
  Chiron: '⚷',
  chiron: '⚷',
  Ceres: '⚳',
  ceres: '⚳',
  Pallas: '⚴',
  pallas: '⚴',
  Juno: '⚵',
  juno: '⚵',
  Vesta: '⚶',
  vesta: '⚶',
  Psyche: 'Ψ',
  psyche: 'Ψ',

  // Minor asteroids with numbers
  '433': '⯱', // Eros
  eros: '⯱',
  Eros: '⯱',

  '19': '⯮', // Fortuna
  fortuna: '⯮',
  Fortuna: '⯮',

  '90377': '⯲', // Sedna
  sedna: '⯲',
  Sedna: '⯲',

  '136199': '⯰', // Eris
  eris: '⯰',
  Eris: '⯰',

  '10': '⯩', // Hygiea
  hygiea: '⯩',
  Hygiea: '⯩',
};

// Utility functions
export const getPlanetSymbol = (name: string): string => {
  return PLANET_SYMBOLS[name] || name;
};

export const getAsteroidSymbol = (name: string): string => {
  return ASTEROID_SYMBOLS[name] || PLANET_SYMBOLS[name] || name;
};

export const formatDegreeDisplay = (position: number): string => {
  const totalDegrees = Math.abs(position);
  const sign = Math.floor(totalDegrees / 30);
  const degrees = Math.floor(totalDegrees % 30);
  const minutes = Math.floor((totalDegrees % 1) * 60);
  const seconds = Math.floor((((totalDegrees % 1) * 60) % 1) * 60);

  const zodiacSigns = [
    '♈',
    '♉',
    '♊',
    '♋',
    '♌',
    '♍',
    '♎',
    '♏',
    '♐',
    '♑',
    '♒',
    '♓',
  ];

  if (seconds === 0) {
    return `${degrees}° ${zodiacSigns[sign]} ${minutes}'`;
  }
  return `${degrees}° ${zodiacSigns[sign]} ${minutes}' ${seconds}"`;
};

export const getCelestialBodyCategory = (name: string): string => {
  const lowerName = name.toLowerCase();

  // Traditional planets (Sun through Saturn)
  if (
    ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(
      lowerName
    )
  ) {
    return 'traditional';
  }

  // Modern planets (Uranus, Neptune, Pluto)
  if (['uranus', 'neptune', 'pluto'].includes(lowerName)) {
    return 'modern';
  }

  // Major asteroids (Big 5 + Psyche)
  if (
    ['chiron', 'ceres', 'pallas', 'juno', 'vesta', 'psyche'].includes(lowerName)
  ) {
    return 'major_asteroids';
  }

  // Minor asteroids
  if (
    [
      'eros',
      'fortuna',
      'sedna',
      'eris',
      'hygiea',
      'astraea',
      'hebe',
      'iris',
      'flora',
      'metis',
    ].includes(lowerName)
  ) {
    return 'minor_asteroids';
  }

  // Lunar nodes
  if (
    ['north_node', 'south_node'].includes(lowerName) ||
    name.includes('node')
  ) {
    return 'lunar_nodes';
  }

  // Lilith points
  if (lowerName.includes('lilith')) {
    return 'lilith_points';
  }

  // Special points
  if (
    ['vertex', 'antivertex', 'part of fortune', 'part_of_fortune'].includes(
      lowerName
    ) ||
    name.includes('Fortune')
  ) {
    return 'special_points';
  }

  // Hypothetical points (Uranian/Hamburg School)
  if (
    [
      'cupido',
      'hades',
      'zeus',
      'kronos',
      'apollon',
      'admetos',
      'vulkanus',
      'poseidon',
    ].includes(lowerName) ||
    name.includes('intp_')
  ) {
    return 'hypothetical_points';
  }

  // Angles
  if (
    ['ascendant', 'descendant', 'midheaven', 'ic', 'imumcoeli'].includes(
      lowerName
    ) ||
    name.includes('Coeli')
  ) {
    return 'angles';
  }

  // Default to other
  return 'other';
};
