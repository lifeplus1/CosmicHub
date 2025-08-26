/**
 * Centralized celestial body categorization system
 * This file defines the canonical categories for all celestial bodies
 * to ensure consistency across the entire application.
 */

export type CelestialBodyCategory = 
  | 'traditional_planets'  // Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn
  | 'modern_planets'      // Uranus, Neptune, Pluto
  | 'major_asteroids'     // Chiron, Ceres, Pallas, Juno, Vesta
  | 'minor_asteroids'     // All other asteroids
  | 'lunar_nodes'         // North Node, South Node
  | 'lilith_points'       // Mean Lilith, True Lilith
  | 'angles'              // Ascendant, Midheaven, Descendant, Imum Coeli
  | 'special_points'      // Vertex, Antivertex, Part of Fortune
  | 'hypothetical';       // Uranian points, Arabic parts, etc.

/**
 * Canonical celestial body categories
 * This is the single source of truth for all categorization
 */
export const CELESTIAL_BODY_CATEGORIES: Record<string, CelestialBodyCategory> = {
  // Traditional Planets (Classical 7)
  'sun': 'traditional_planets',
  'moon': 'traditional_planets', 
  'mercury': 'traditional_planets',
  'venus': 'traditional_planets',
  'mars': 'traditional_planets',
  'jupiter': 'traditional_planets',
  'saturn': 'traditional_planets',

  // Modern Planets (Discovered post-classical)
  'uranus': 'modern_planets',
  'neptune': 'modern_planets', 
  'pluto': 'modern_planets',

  // Major Asteroids (The "Big 5" of astrology + Psyche)
  'chiron': 'major_asteroids',  // ⚠️ CHIRON IS AN ASTEROID, NOT A PLANET
  'ceres': 'major_asteroids',
  'pallas': 'major_asteroids',
  'juno': 'major_asteroids',
  'vesta': 'major_asteroids',
  'psyche': 'major_asteroids',  // Moved back to major - significant asteroid

  // Lunar Nodes
  'north_node': 'lunar_nodes',
  'south_node': 'lunar_nodes',
  'north node': 'lunar_nodes',
  'south node': 'lunar_nodes',

  // Lilith Points
  'lilith_mean': 'lilith_points',
  'lilith_true': 'lilith_points',
  'mean lilith': 'lilith_points',
  'true lilith': 'lilith_points',
  'lilith': 'lilith_points',

  // Angles (Chart structure points)
  'ascendant': 'angles',
  'midheaven': 'angles',
  'descendant': 'angles',
  'imumcoeli': 'angles',
  'imum coeli': 'angles',
  'mc': 'angles',
  'ic': 'angles',

  // Special Points
  'vertex': 'special_points',
  'antivertex': 'special_points',
  'part of fortune': 'special_points',
  'part_of_fortune': 'special_points',

  // Minor asteroids (all asteroids supported by basic ephemeris files)
  'astraea': 'minor_asteroids',      // 5
  'hebe': 'minor_asteroids',         // 6
  'iris': 'minor_asteroids',         // 7
  'flora': 'minor_asteroids',        // 8
  'metis': 'minor_asteroids',        // 9
  'hygiea': 'minor_asteroids',       // 10
  'parthenope': 'minor_asteroids',   // 11
  'victoria': 'minor_asteroids',     // 12
  'egeria': 'minor_asteroids',       // 13
  'eunomia': 'minor_asteroids',      // 15
  'thetis': 'minor_asteroids',       // 17
  'melpomene': 'minor_asteroids',    // 18
  'fortuna': 'minor_asteroids',      // 19 (asteroid, different from Part of Fortune)
  'massalia': 'minor_asteroids',     // 20
  'eros': 'minor_asteroids',         // 433
  'sedna': 'minor_asteroids',        // 90377
  'eris': 'minor_asteroids',         // 136199

  // Uranian/Hamburg School points (hypothetical trans-Neptunian bodies)
  'hades': 'hypothetical',           // Decay, medicine, occult, underground
  'zeus': 'hypothetical',            // Fire, creativity, machines, energy
  'kronos': 'hypothetical',          // Authority, leadership, government
  'apollon': 'hypothetical',         // Science, research, peace, wisdom
  'admetos': 'hypothetical',         // Raw materials, real estate, depth
  'vulkanus': 'hypothetical',        // Power, force, might, intensity
  'poseidon': 'hypothetical',        // Spirituality, ideas, media, enlightenment

  // Additional lunar points
  'intp_apog': 'special_points',     // Interpolated Lunar Apogee (Dark Moon Lilith variant)
  'intp_perg': 'special_points',     // Interpolated Lunar Perigee
};

/**
 * Category display information
 */
export const CATEGORY_INFO: Record<CelestialBodyCategory, {
  label: string;
  icon: string;
  description: string;
  displayOrder: number;
  defaultEnabled: boolean;
}> = {
  traditional_planets: {
    label: 'Traditional Planets',
    icon: '☉',
    description: 'Classical seven planets of ancient astrology',
    displayOrder: 1,
    defaultEnabled: true,
  },
  modern_planets: {
    label: 'Modern Planets', 
    icon: '♅',
    description: 'Outer planets discovered in modern times',
    displayOrder: 2,
    defaultEnabled: true,
  },
  major_asteroids: {
    label: 'Major Asteroids',
    icon: '⚷',
    description: 'The most significant asteroids in astrology',
    displayOrder: 3,
    defaultEnabled: true,
  },
  minor_asteroids: {
    label: 'Minor Asteroids',
    icon: '⚳',
    description: 'Additional asteroids and minor bodies',
    displayOrder: 4,
    defaultEnabled: false,
  },
  lunar_nodes: {
    label: 'Lunar Nodes',
    icon: '☊',
    description: 'Points where Moon\'s orbit crosses the ecliptic',
    displayOrder: 5,
    defaultEnabled: true,
  },
  lilith_points: {
    label: 'Lilith Points',
    icon: '⚸', 
    description: 'Black Moon Lilith mean and true positions',
    displayOrder: 6,
    defaultEnabled: true,
  },
  angles: {
    label: 'Angles',
    icon: '⊡',
    description: 'Chart structure points (ASC, MC, DSC, IC)',
    displayOrder: 7,
    defaultEnabled: true,
  },
  special_points: {
    label: 'Special Points',
    icon: '◊',
    description: 'Vertex, Part of Fortune, and other calculated points',
    displayOrder: 8,
    defaultEnabled: false,
  },
  hypothetical: {
    label: 'Hypothetical Points',
    icon: '◈',
    description: 'Uranian planets and theoretical points',
    displayOrder: 9,
    defaultEnabled: false,
  },
};

/**
 * Get the canonical category for a celestial body
 */
export function getCelestialBodyCategory(name: string): CelestialBodyCategory | null {
  const normalized = name.toLowerCase().trim();
  return CELESTIAL_BODY_CATEGORIES[normalized] || null;
}

/**
 * Check if a body should be considered a "planet" for traditional display
 * (i.e., traditional + modern planets, but NOT asteroids)
 */
export function isPlanetForDisplay(name: string): boolean {
  const category = getCelestialBodyCategory(name);
  return category === 'traditional_planets' || category === 'modern_planets';
}

/**
 * Check if a body is an asteroid (major or minor)
 */
export function isAsteroid(name: string): boolean {
  const category = getCelestialBodyCategory(name);
  return category === 'major_asteroids' || category === 'minor_asteroids';
}

/**
 * Check if a body is a point (nodes, lilith, special points, but NOT angles)
 */
export function isPoint(name: string): boolean {
  const category = getCelestialBodyCategory(name);
  return category === 'lunar_nodes' || 
         category === 'lilith_points' || 
         category === 'special_points' ||
         category === 'hypothetical';
}

/**
 * Get bodies by category from a mixed data structure
 */
export function categorizeBodies(bodies: Record<string, any>): Record<CelestialBodyCategory, Record<string, any>> {
  const result: Record<CelestialBodyCategory, Record<string, any>> = {
    traditional_planets: {},
    modern_planets: {},
    major_asteroids: {},
    minor_asteroids: {},
    lunar_nodes: {},
    lilith_points: {},
    angles: {},
    special_points: {},
    hypothetical: {},
  };

  for (const [name, data] of Object.entries(bodies)) {
    const category = getCelestialBodyCategory(name);
    if (category) {
      result[category][name] = data;
    } else {
      // Default unknown bodies to minor asteroids
      result.minor_asteroids[name] = data;
    }
  }

  return result;
}

/**
 * Merge traditional and modern planets into a single "planets" category for display
 */
export function getPlanetsForDisplay(categorizedBodies: Record<CelestialBodyCategory, Record<string, any>>): Record<string, any> {
  return {
    ...categorizedBodies.traditional_planets,
    ...categorizedBodies.modern_planets,
  };
}

/**
 * Get all asteroids (major + minor) for display
 */
export function getAsteroidsForDisplay(categorizedBodies: Record<CelestialBodyCategory, Record<string, any>>): Record<string, any> {
  return {
    ...categorizedBodies.major_asteroids,
    ...categorizedBodies.minor_asteroids,
  };
}

/**
 * Get all points (nodes + lilith + special) for display
 */
export function getPointsForDisplay(categorizedBodies: Record<CelestialBodyCategory, Record<string, any>>): Record<string, any> {
  return {
    ...categorizedBodies.lunar_nodes,
    ...categorizedBodies.lilith_points,
    ...categorizedBodies.special_points,
    ...categorizedBodies.hypothetical,
  };
}
