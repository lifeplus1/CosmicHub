import type { Interpretation } from './types';

/**
 * Format interpretation content for display
 */
export const formatInterpretationContent = (
  content: string,
  maxLength?: number
): string => {
  if (typeof maxLength !== 'number' || maxLength < 1) return content;
  return content.length > maxLength
    ? `${content.substring(0, maxLength)}...`
    : content;
};

/**
 * Get confidence level description
 */
export const getConfidenceLevel = (confidence: number): string => {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Medium';
  if (confidence >= 0.4) return 'Low';
  return 'Very Low';
};

/**
 * Sort interpretations by creation date (newest first)
 */
};

/**
 * Group interpretations by type
 */
      groups[type] ??= [];
      groups[type].push(interpretation);
      return groups;
    },
    {} as Record<string, Interpretation[]>
  );
};

/**
 * Filter interpretations by tags
 */

  return interpretations.filter(interpretation =>
    tags.some(tag => interpretation.tags.includes(tag))
  );
};

/**
 * Get interpretation type emoji
 */
export const getInterpretationTypeEmoji = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'natal':
      return '🌟';
    case 'transit':
      return '🌙';
    case 'synastry':
      return '💫';
    case 'composite':
      return '🌌';
    case 'solar_return':
      return '☀️';
    case 'lunar_return':
      return '🌙';
    case 'progression':
      return '🔄';
    default:
      return '✨';
  }
};

/**
 * Generate interpretation summary from content
 */
  if (!Array.isArray(words) || words.length <= maxWords) return content;

  return words.slice(0, maxWords).join(' ') + '...';
};
