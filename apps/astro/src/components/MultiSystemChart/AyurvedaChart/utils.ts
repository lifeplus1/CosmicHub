/**
 * AyurvedaChart Utility Functions
 * Helper functions for Ayurveda system components
 */

export const getDoshaIcon = (dosha: string): string => {
  const iconMap: Record<string, string> = {
    'Vata': '💨',
    'Pitta': '🔥', 
    'Kapha': '🌍'
  };
  return iconMap[dosha] ?? '⚪';
};

export const getDoshaColor = (dosha: string): string => {
  const colorMap: Record<string, string> = {
    'Vata': 'bg-gray-500',
    'Pitta': 'bg-red-500',
    'Kapha': 'bg-green-500'
  };
  return colorMap[dosha] ?? 'bg-gray-500';
};

export const getPlanetIcon = (planet: string): string => {
  const iconMap: Record<string, string> = {
    'Sun': '☉',
    'Moon': '☽',
    'Mars': '♂',
    'Mercury': '☿',
    'Jupiter': '♃',
    'Venus': '♀',
    'Saturn': '♄',
    'Rahu': '☊',
    'Ketu': '☋'
  };
  return iconMap[planet] ?? '🪐';
};
