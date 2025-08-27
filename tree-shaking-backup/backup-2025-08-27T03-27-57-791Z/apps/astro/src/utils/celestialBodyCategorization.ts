/**
 * Centralized celestial body categorization system
 * This file defines the canonical categories for all celestial bodies
 * to ensure consistency across the entire application.
 */

export type CelestialBodyCategory =
  | 'traditional_planets' // Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn
  | 'modern_planets' // Uranus, Neptune, Pluto
  | 'major_asteroids' // Chiron, Ceres, Pallas, Juno, Vesta
  | 'minor_asteroids' // All other asteroids
  | 'lunar_nodes' // North Node, South Node
  | 'lilith_points' // Mean Lilith, True Lilith
  | 'angles' // Ascendant, Midheaven, Descendant, Imum Coeli
  | 'special_points' // Vertex, Antivertex, Part of Fortune
  | 'hypothetical'; // Uranian points, Arabic parts, etc.

/**
 * Canonical celestial body categories
 * This is the single source of truth for all categorization
 */

/**
 * Category display information
 */
    icon: string;
    description: string;
    displayOrder: number;
    defaultEnabled: boolean;
  }
> = {
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
    description: "Points where Moon's orbit crosses the ecliptic",
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
export function getCelestialBodyCategory(
  name: string
): CelestialBodyCategory | null {
  const normalized = name.toLowerCase().trim();
  return CELESTIAL_BODY_CATEGORIES[normalized] ?? null;
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

/**
 * Check if a body is a point (nodes, lilith, special points, but NOT angles)
 */

/**
 * Get bodies by category from a mixed data structure
 */

/**
 * Merge traditional and modern planets into a single "planets" category for display
 */

/**
 * Get all asteroids (major + minor) for display
 */

/**
 * Get all points (nodes + lilith + special) for display
 */
