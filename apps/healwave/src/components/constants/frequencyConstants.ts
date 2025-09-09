/**
 * Constants for the Enhanced Frequency Generator
 * Centralizes magic numbers and configuration values
 */

export const FREQUENCY_CONSTANTS = {
  // Default frequencies
  DEFAULT_FREQUENCY: 528,
  MIN_FREQUENCY: 0.1,
  MAX_FREQUENCY: 20000,

  // Common healing frequencies
  COMMON_FREQUENCIES: [174, 285, 528, 741, 852, 963] as const,

  // Audio settings
  DEFAULT_VOLUME: 0.7,
  MIN_VOLUME: 0,
  MAX_VOLUME: 1,
  VOLUME_STEP: 0.01,

  // Duration settings
  DEFAULT_DURATION: 15,
  MIN_DURATION: 1,
  MAX_DURATION: 180,

  // Binaural beat settings
  DEFAULT_BINAURAL_BEAT: 0,
  MIN_BINAURAL_BEAT: 0.1,
  MAX_BINAURAL_BEAT: 40,
  BINAURAL_BEAT_STEP: 0.1,

  // Audio engine settings
  FADE_IN_DURATION: 2,
  FADE_OUT_DURATION: 2,
  VOLUME_MULTIPLIER: 100,

  // Visualization settings
  CANVAS_SIZE: 300,
  VISUALIZATION_WIDTH: 800,
  VISUALIZATION_HEIGHT: 400,

  // UI settings
  ANIMATION_DURATION: 0.6,
  DELAY_INCREMENT: 0.2,
} as const;

export const FREQUENCY_CATEGORIES = [
  'all',
  'solfeggio',
  'chakra',
  'brainwave',
  'planetary',
  'rife',
  'sacred_geometry',
  'binaural',
  'biological',
  'elemental',
  'stellar',
  'metallic',
  'other'
] as const;

export type FrequencyCategory = typeof FREQUENCY_CATEGORIES[number];

export const TAB_OPTIONS = ['frequencies', 'chakras', 'custom'] as const;
export type TabOption = typeof TAB_OPTIONS[number];

export const CHAKRA_MAPPING = {
  root: 396,
  sacral: 417,
  solar_plexus: 528,
  heart: 639,
  throat: 741,
  third_eye: 852,
  crown: 963
} as const;
