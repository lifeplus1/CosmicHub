import { z } from 'zod';

// Zod schemas for A/B test configuration validation
const ExperimentVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  description: z.string().min(1, 'Variant description is required'),
  allocation: z.number().min(0).max(100, 'Allocation must be between 0 and 100'),
  features: z.object({
    d3Visualization: z.boolean(),
    binauralBeats: z.boolean(),
    sacredGeometry: z.boolean(),
    tierRestrictions: z.boolean(),
    customPresets: z.boolean(),
    realTimeUpdates: z.boolean(),
  }),
  ui: z.object({
    theme: z.enum(['cosmic', 'minimal', 'spiritual']),
    animations: z.enum(['framer-motion', 'css', 'none']),
    accessibility: z.enum(['wcag-aa', 'basic', 'minimal']),
  }),
});

const ExperimentMetricsSchema = z.object({
  primary: z.array(z.string()),
  secondary: z.array(z.string()),
  guardrail: z.array(z.string()),
});

const ExperimentTargetingSchema = z.object({
  user_segments: z.array(z.string()),
  device_types: z.array(z.string()),
  regions: z.array(z.string()),
  exclude_users: z.array(z.string()),
});

const ExperimentConfigSchema = z.object({
  id: z.string().min(1, 'Experiment ID is required'),
  name: z.string().min(1, 'Experiment name is required'),
  description: z.string().min(1, 'Experiment description is required'),
  status: z.enum(['draft', 'active', 'paused', 'completed']),
  duration_days: z.number().positive('Duration must be positive'),
  variants: z.record(z.string(), ExperimentVariantSchema),
  metrics: ExperimentMetricsSchema,
  targeting: ExperimentTargetingSchema,
  success_criteria: z.record(z.string(), z.number().min(0).max(100)),
  statistical_config: z.object({
    minimum_sample_size: z.number().positive(),
    confidence_level: z.number().min(0).max(1),
    power: z.number().min(0).max(1),
  }),
});

// A/B Test Configuration for Frequency Generator Comparison
const rawConfig = {
  id: 'frequency-generator-comparison',
  name: 'Frequency Generator UI Comparison',
  description: 'Compare 4 different frequency generator implementations to determine the most effective user experience',
  status: 'active' as const,
  duration_days: 21,

  variants: {
    control: {
      name: 'Classic Frequency Generator',
      description: 'Original frequency generator with basic controls',
      allocation: 25,
      features: {
        d3Visualization: false,
        binauralBeats: false,
        sacredGeometry: false,
        tierRestrictions: false,
        customPresets: false,
        realTimeUpdates: false
      },
      ui: {
        theme: 'cosmic' as const,
        animations: 'css' as const,
        accessibility: 'basic' as const
      }
    },
    'enhanced-controls': {
      name: 'Enhanced Controls',
      description: 'Advanced controls with tier restrictions and custom presets',
      allocation: 25,
      features: {
        d3Visualization: false,
        binauralBeats: true,
        sacredGeometry: false,
        tierRestrictions: true,
        customPresets: true,
        realTimeUpdates: false
      },
      ui: {
        theme: 'cosmic' as const,
        animations: 'css' as const,
        accessibility: 'basic' as const
      }
    },
    'd3-visualization': {
      name: 'D3.js Visualization',
      description: 'Professional D3.js charts with real-time frequency visualization',
      allocation: 25,
      features: {
        d3Visualization: true,
        binauralBeats: true,
        sacredGeometry: false,
        tierRestrictions: false,
        customPresets: false,
        realTimeUpdates: true
      },
      ui: {
        theme: 'cosmic',
        animations: 'framer-motion',
        accessibility: 'wcag-aa'
      }
    },
    'sacred-geometry': {
      name: 'Sacred Geometry',
      description: 'Spiritual interface with sacred geometry patterns and chakra alignment',
      allocation: 25,
      features: {
        d3Visualization: false,
        binauralBeats: true,
        sacredGeometry: true,
        tierRestrictions: false,
        customPresets: false,
        realTimeUpdates: false
      },
      ui: {
        theme: 'spiritual',
        animations: 'framer-motion',
        accessibility: 'basic'
      }
    }
  },

  metrics: {
    primary: [
      'user_engagement_score',
      'session_duration',
      'feature_discovery_rate'
    ],
    secondary: [
      'frequency_selections',
      'preset_usage_rate',
      'visualization_interactions',
      'binaural_beat_usage',
      'conversion_to_paid_features',
      'user_satisfaction_rating',
      'accessibility_compliance_score',
      'performance_metrics',
      'error_rate',
      'support_ticket_rate'
    ],
    success_criteria: {
      user_engagement_score: { target: 0.75, direction: 'increase' },
      session_duration: { target: 420, direction: 'increase' }, // 7 minutes
      feature_discovery_rate: { target: 0.4, direction: 'increase' },
      conversion_to_paid_features: { target: 0.08, direction: 'increase' },
      user_satisfaction_rating: { target: 4.2, direction: 'increase' },
      error_rate: { target: 0.02, direction: 'decrease' }
    }
  },

  targeting: {
    user_segments: [
      'free_users',
      'premium_users',
      'clinical_users',
      'new_users',
      'returning_users'
    ],
    device_types: [
      'desktop',
      'tablet',
      'mobile'
    ],
    browsers: [
      'chrome',
      'firefox',
      'safari',
      'edge'
    ]
  },

  analysis_plan: {
    statistical_method: 'bayesian_ab_test',
    minimum_sample_size: 1000, // per variant
    confidence_level: 0.95,
    analysis_periods: [
      'daily',
      'weekly',
      'final'
    ],
    guardrail_metrics: [
      'error_rate',
      'performance_metrics'
    ]
  }
} as const;

// Validate configuration at runtime using Zod schema
export const FREQUENCY_GENERATOR_EXPERIMENT_CONFIG = ExperimentConfigSchema.parse(rawConfig);

// Type exports for TypeScript
export type ExperimentVariant = z.infer<typeof ExperimentVariantSchema>;
export type ExperimentConfig = z.infer<typeof ExperimentConfigSchema>;
export type ExperimentMetrics = z.infer<typeof ExperimentMetricsSchema>;
export type ExperimentTargeting = z.infer<typeof ExperimentTargetingSchema>;

// Validation helper functions
export const validateExperimentConfig = (config: unknown): ExperimentConfig => {
  return ExperimentConfigSchema.parse(config);
};

export const isValidExperimentConfig = (config: unknown): config is ExperimentConfig => {
  return ExperimentConfigSchema.safeParse(config).success;
};

// Configuration validation for development
if (process.env.NODE_ENV === 'development') {
  ExperimentConfigSchema.parse(rawConfig);
}
