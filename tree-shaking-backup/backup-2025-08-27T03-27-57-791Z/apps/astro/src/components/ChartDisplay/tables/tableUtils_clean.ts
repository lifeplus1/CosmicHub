// Centralized symbol maps for celestial bodies

// Utility functions
export const getPlanetSymbol = (name: string): string => {
  return PLANET_SYMBOLS[name] ?? name;
};

export const getAsteroidSymbol = (name: string): string => {
  return ASTEROID_SYMBOLS[name] ?? PLANET_SYMBOLS[name] ?? name;
};

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
