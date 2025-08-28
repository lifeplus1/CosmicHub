import type { InterpretationFocusArea } from './api.types';

/**
 * Human-readable labels for interpretation focus areas
 */
export const FOCUS_AREA_LABELS = [
  'Personality Overview',
  'Career & Life Path', 
  'Relationships & Love',
  'Life Purpose & Calling',
  'Challenges & Growth',
  'Strengths & Talents',
  'Current Life Cycle',
  'Future Trends',
  'Spiritual Growth'
] as const;

/**
 * Mapping from human-readable labels to canonical API values
 */
const FOCUS_LABEL_TO_CANONICAL: Record<string, InterpretationFocusArea> = {
  'Personality Overview': 'personality',
  'Career & Life Path': 'career',
  'Relationships & Love': 'relationships', 
  'Life Purpose & Calling': 'life_purpose',
  'Challenges & Growth': 'challenges',
  'Strengths & Talents': 'strengths',
  'Current Life Cycle': 'current_cycle',
  'Future Trends': 'future_trends',
  'Spiritual Growth': 'spiritual_growth'
};

/**
 * Convert human-readable focus label to canonical API value
 */
export const focusLabelToCanonical = (label: string): InterpretationFocusArea => {
  return FOCUS_LABEL_TO_CANONICAL[label] ?? 'personality';
};

/**
 * Convert canonical API value to human-readable label
 */
export const canonicalToFocusLabel = (canonical: InterpretationFocusArea): string => {
  const entry = Object.entries(FOCUS_LABEL_TO_CANONICAL).find(([, value]) => value === canonical);
  return entry?.[0] ?? 'Personality Overview';
};
