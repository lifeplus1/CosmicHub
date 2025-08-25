/**
 * Strict type definitions for binaural settings component
 * Ensures complete type safety across all operations
 */

// Core binaural frequency types
export type BinauralColor =
  | 'purple'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'gray';

export interface BinauralRange {
  readonly min: number;
  readonly max: number;
  readonly name: string;
  readonly color: BinauralColor;
  readonly description?: string;
  readonly benefits?: readonly string[];
}

export interface BinauralRangeWithKey extends BinauralRange {
  readonly key: string;
}

export type BinauralRangeKey =
  | 'delta'
  | 'theta'
  | 'alpha'
  | 'beta'
  | 'gamma'
  | 'custom';

// Settings validation schemas
export interface AudioSettingsConstraints {
  readonly volume: { min: 0; max: 100; step: 1 };
  readonly duration: { min: 1; max: 120; step: 1 };
  readonly fadeIn: { min: 0; max: 30; step: 1 };
  readonly fadeOut: { min: 0; max: 30; step: 1 };
}

export interface FrequencyConstraints {
  readonly baseFrequency: { min: 20; max: 2000; step: 1 };
  readonly binauralBeat: { min: 0.5; max: 100; step: 0.5 };
}

// Error types for robust error handling
export type BinauralSettingsError =
  | {
      type: 'INVALID_FREQUENCY';
      frequency: number;
      constraints: FrequencyConstraints['baseFrequency'];
    }
  | {
      type: 'INVALID_BEAT';
      beat: number;
      constraints: FrequencyConstraints['binauralBeat'];
    }
  | {
      type: 'INVALID_VOLUME';
      volume: number;
      constraints: AudioSettingsConstraints['volume'];
    }
  | { type: 'AUDIO_ENGINE_ERROR'; message: string }
  | { type: 'PRESET_CREATION_ERROR'; message: string };

// Analytics events for marketability tracking
export interface BinauralAnalyticsEvent {
  readonly event:
    | 'preset_created'
    | 'range_selected'
    | 'advanced_mode_toggled'
    | 'custom_frequency_used';
  readonly properties: Record<string, string | number | boolean>;
  readonly timestamp: number;
  readonly userId?: string;
}

// Accessibility configuration
export interface AccessibilityConfig {
  readonly announceRangeChanges: boolean;
  readonly useHighContrast: boolean;
  readonly enableKeyboardShortcuts: boolean;
  readonly reduceMotion: boolean;
}

// Security validation
export interface InputValidation {
  readonly sanitize: (input: string) => string;
  readonly validateNumeric: (
    value: number,
    constraints: { min: number; max: number }
  ) => boolean;
  readonly preventXSS: (input: string) => string;
}

// Performance optimization types
export interface PerformanceMetrics {
  readonly renderTime: number;
  readonly interactionLatency: number;
  readonly memoryUsage: number;
}

export const BINAURAL_RANGES: Readonly<
  Record<BinauralRangeKey, BinauralRange>
> = {
  delta: {
    min: 0.5,
    max: 4,
    name: 'Delta (Deep Sleep)',
    color: 'purple',
    description: 'Promotes deep sleep and healing',
    benefits: [
      'Deep restorative sleep',
      'Growth hormone release',
      'Immune system boost',
    ],
  },
  theta: {
    min: 4,
    max: 8,
    name: 'Theta (Meditation)',
    color: 'blue',
    description: 'Enhances meditation and creativity',
    benefits: ['Deep meditation', 'Enhanced creativity', 'Intuitive insights'],
  },
  alpha: {
    min: 8,
    max: 14,
    name: 'Alpha (Relaxation)',
    color: 'green',
    description: 'Promotes relaxed awareness',
    benefits: ['Stress reduction', 'Improved learning', 'Mental clarity'],
  },
  beta: {
    min: 14,
    max: 30,
    name: 'Beta (Focus)',
    color: 'yellow',
    description: 'Enhances focus and concentration',
    benefits: ['Improved focus', 'Mental alertness', 'Problem solving'],
  },
  gamma: {
    min: 30,
    max: 100,
    name: 'Gamma (Awareness)',
    color: 'red',
    description: 'Heightens consciousness and awareness',
    benefits: ['Peak awareness', 'Enhanced cognition', 'Binding consciousness'],
  },
  custom: {
    min: 0,
    max: 0,
    name: 'Custom',
    color: 'gray',
    description: 'User-defined frequency range',
  },
} as const;

export const AUDIO_CONSTRAINTS: Readonly<AudioSettingsConstraints> = {
  volume: { min: 0, max: 100, step: 1 },
  duration: { min: 1, max: 120, step: 1 },
  fadeIn: { min: 0, max: 30, step: 1 },
  fadeOut: { min: 0, max: 30, step: 1 },
} as const;

export const FREQUENCY_CONSTRAINTS: Readonly<FrequencyConstraints> = {
  baseFrequency: { min: 20, max: 2000, step: 1 },
  binauralBeat: { min: 0.5, max: 100, step: 0.5 },
} as const;
