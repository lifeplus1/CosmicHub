/**
 * TCM Chart helper utilities
 * Following Type Bridge System patterns for data processing
 */

/**
 * Element color mapping for consistent theming
 */
export const ELEMENT_COLORS = {
  wood: 'text-green-400',
  fire: 'text-red-400', 
  earth: 'text-yellow-400',
  metal: 'text-gray-300',
  water: 'text-blue-400'
} as const;

/**
 * Balance level color mapping
 */
export const BALANCE_COLORS = {
  balanced: 'text-green-400',
  excess: 'text-red-400',
  deficient: 'text-blue-400',
  moderate: 'text-yellow-400'
} as const;

/**
 * Get color class for an element
 * @param element - Element name (wood, fire, earth, metal, water)
 * @returns Tailwind color class
 */
export const getElementColor = (element: string): string => {
  const normalizedElement = element.toLowerCase() as keyof typeof ELEMENT_COLORS;
  return ELEMENT_COLORS[normalizedElement] ?? 'text-cosmic-silver';
};

/**
 * Get color class for a balance level
 * @param level - Balance level (balanced, excess, deficient, moderate)
 * @returns Tailwind color class
 */
export const getBalanceColor = (level: string): string => {
  const normalizedLevel = level.toLowerCase() as keyof typeof BALANCE_COLORS;
  return BALANCE_COLORS[normalizedLevel] ?? 'text-cosmic-silver';
};

/**
 * Format percentage for display
 * @param value - Numeric value (0-1 or 0-100)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  const percentage = value > 1 ? value : value * 100;
  return `${Math.round(percentage)}%`;
};

/**
 * Get element emoji for visual representation
 * @param element - Element name
 * @returns Unicode emoji
 */
export const getElementEmoji = (element: string): string => {
  const elementEmojis = {
    wood: '🌱',
    fire: '🔥',
    earth: '🌍',
    metal: '⚡',
    water: '💧'
  } as const;
  
  const normalizedElement = element.toLowerCase() as keyof typeof elementEmojis;
  return elementEmojis[normalizedElement] ?? '✨';
};

/**
 * Calculate element balance category
 * @param value - Element value (0-1)
 * @returns Balance category
 */
export const getBalanceCategory = (value: number): string => {
  if (value < 0.3) return 'deficient';
  if (value > 0.7) return 'excess';
  if (value >= 0.4 && value <= 0.6) return 'balanced';
  return 'moderate';
};

/**
 * Sort elements by strength (highest to lowest)
 * @param elements - Object with element names as keys and values as numbers
 * @returns Sorted array of [element, value] tuples
 */
export const sortElementsByStrength = (elements: Record<string, number>): Array<[string, number]> => {
  return Object.entries(elements).sort(([, a], [, b]) => b - a);
};
