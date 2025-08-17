// Centralized feature key constants to avoid string drift across frontend & backend
// These map to subscription gating and analytics identifiers
export const FEATURE_KEYS = {
  SYNSTRY_ANALYSIS: 'synastry_analysis',
  AI_INTERPRETATION: 'ai_interpretation',
  TRANSIT_ANALYSIS: 'transit_analysis',
  MULTI_SYSTEM_ANALYSIS: 'multi_system_analysis'
} as const;

export type FeatureKey = typeof FEATURE_KEYS[keyof typeof FEATURE_KEYS];

export const isFeatureKey = (value: string): value is FeatureKey =>
  Object.values(FEATURE_KEYS).includes(value as FeatureKey);

// Tier requirement mapping (mirrors current business rules)
export const FEATURE_REQUIRED_TIERS: Record<FeatureKey, 'premium' | 'elite'> = {
  [FEATURE_KEYS.SYNSTRY_ANALYSIS]: 'premium',
  [FEATURE_KEYS.AI_INTERPRETATION]: 'elite',
  [FEATURE_KEYS.TRANSIT_ANALYSIS]: 'elite',
  [FEATURE_KEYS.MULTI_SYSTEM_ANALYSIS]: 'premium'
};

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  [FEATURE_KEYS.SYNSTRY_ANALYSIS]: 'Synastry Compatibility',
  [FEATURE_KEYS.AI_INTERPRETATION]: 'AI Interpretation',
  [FEATURE_KEYS.TRANSIT_ANALYSIS]: 'Transit Analysis',
  [FEATURE_KEYS.MULTI_SYSTEM_ANALYSIS]: 'Multi-System Analysis'
};

export const ALL_FEATURE_KEYS = Object.values(FEATURE_KEYS);

