/**
 * Psychology Chart Validation Schemas
 * Following Type Bridge system with Zod validation
 * Mirrors backend Pydantic models for psychology integration
 */

import { z } from 'zod';
import type { UnifiedBirthData } from '@cosmichub/types';

// Birth data schema for proper typing
const UnifiedBirthDataSchema = z.object({
  year: z.number(),
  month: z.number(),
  day: z.number(),
  hour: z.number(),
  minute: z.number(),
  city: z.string(),
  lat: z.number(),
  lon: z.number(),
  timezone: z.string(),
}).partial() as z.ZodType<Partial<UnifiedBirthData>>;

// Base psychology types following Type Bridge patterns
export const CognitiveFunctionSchema = z.object({
  name: z.string(),
  fullName: z.string(),
  position: z.enum(['dominant', 'auxiliary', 'tertiary', 'inferior']),
  planetaryCorrelation: z.string(),
  elementalAssociation: z.string(),
  strength: z.number().min(0).max(1),
  description: z.string(),
});

export const MBTIProfileSchema = z.object({
  type: z.string().regex(/^[EI][NS][TF][JP]$/), // MBTI type pattern
  name: z.string(),
  description: z.string(),
  temperament: z.string(),
  cognitiveStack: z.array(CognitiveFunctionSchema),
  elementalCorrelation: z.string(),
  astrologicalSigns: z.array(z.string()),
  strengths: z.array(z.string()),
  growthAreas: z.array(z.string()),
  compatibility: z.record(z.string()),
});

export const EnneagramProfileSchema = z.object({
  type: z.number().min(1).max(9),
  name: z.string(),
  description: z.string(),
  coreMotivation: z.string(),
  coreFear: z.string(),
  wing: z.number().min(1).max(9).optional(),
  instinctualVariant: z.enum(['self-preservation', 'social', 'sexual']).optional(),
  growthDirection: z.number().min(1).max(9),
  stressDirection: z.number().min(1).max(9),
  levelOfDevelopment: z.number().min(1).max(9),
  astrologicalHouses: z.array(z.number().min(1).max(12)),
  compatibility: z.record(z.string()),
});

export const AstrologyCorrelationSchema = z.object({
  planetary_influences: z.array(z.object({
    planet: z.string(),
    aspect: z.string(),
    correlation_strength: z.number().min(0).max(1),
    interpretation: z.string(),
  })),
  elemental_balance: z.object({
    fire: z.number().min(0).max(1),
    earth: z.number().min(0).max(1),
    air: z.number().min(0).max(1),
    water: z.number().min(0).max(1),
  }),
  house_emphasis: z.array(z.object({
    house: z.number().min(1).max(12),
    planets: z.array(z.string()),
    psychological_themes: z.array(z.string()),
  })),
});

export const PsychologySynthesisSchema = z.object({
  personality_themes: z.array(z.string()),
  spiritual_path_indicators: z.array(z.string()),
  growth_opportunities: z.array(z.string()),
  potential_challenges: z.array(z.string()),
  astrological_timing_guidance: z.array(z.string()),
  integration_level: z.number().min(0).max(1),
  development_phase: z.enum(['forming', 'developing', 'integrating', 'mastering']),
});

export const AssessmentResultsSchema = z.object({
  mbti: z.object({
    type: z.string(),
    confidence: z.number().min(0).max(1),
    function_scores: z.record(z.number()),
    type_probabilities: z.record(z.number()),
  }).optional(),
  enneagram: z.object({
    type: z.number().min(1).max(9),
    confidence: z.number().min(0).max(1),
    wing_probabilities: z.record(z.number()),
    instinctual_variant: z.enum(['self-preservation', 'social', 'sexual']),
    type_scores: z.record(z.number()),
  }).optional(),
  assessment_id: z.string(),
  completed_at: z.string(),
  user_id: z.string().optional(),
});

export const PsychologyChartDataSchema = z.object({
  mbti: z.object({
    profile: MBTIProfileSchema,
    birth_correlation: AstrologyCorrelationSchema,
    assessment_score: z.number().min(0).max(1).optional(),
  }).optional(),
  enneagram: z.object({
    profile: EnneagramProfileSchema,
    astrological_indicators: AstrologyCorrelationSchema,
    assessment_score: z.number().min(0).max(1).optional(),
  }).optional(),
  synthesis: PsychologySynthesisSchema.optional(),
  assessment_data: AssessmentResultsSchema.optional(),
  metadata: z.object({
    generated_at: z.string(),
    chart_id: z.string().optional(),
    user_id: z.string().optional(),
    confidence_level: z.number().min(0).max(1),
    data_sources: z.array(z.string()),
  }),
});

// Component-specific prop schemas
export const PsychologyChartPropsSchema = z.object({
  data: PsychologyChartDataSchema.optional(),
  birthData: UnifiedBirthDataSchema.optional(),
  isLoading: z.boolean().default(false),
  onTabChange: z.function().args(z.string()).returns(z.void()).optional(),
  onAssessmentComplete: z.function().args(AssessmentResultsSchema).returns(z.void()).optional(),
  className: z.string().default(''),
  'data-testid': z.string().default('psychology-chart'),
});

export const MBTIDetailViewPropsSchema = z.object({
  profile: MBTIProfileSchema,
  astrology: AstrologyCorrelationSchema.optional(),
  onFunctionSelect: z.function().args(CognitiveFunctionSchema).returns(z.void()).optional(),
  showAstrology: z.boolean().default(true),
  className: z.string().default(''),
});

export const EnneagramDetailViewPropsSchema = z.object({
  profile: EnneagramProfileSchema,
  astrology: AstrologyCorrelationSchema.optional(),
  onTypeSelect: z.function().args(z.number()).returns(z.void()).optional(),
  showWings: z.boolean().default(true),
  className: z.string().default(''),
});

export const PsychologySynthesisViewPropsSchema = z.object({
  synthesis: PsychologySynthesisSchema,
  mbtiProfile: MBTIProfileSchema.optional(),
  enneagramProfile: EnneagramProfileSchema.optional(),
  onInsightExpand: z.function().args(z.string()).returns(z.void()).optional(),
  showDevelopmentPath: z.boolean().default(true),
  className: z.string().default(''),
});

export const PsychologyTabControlsPropsSchema = z.object({
  activeTab: z.enum(['mbti', 'enneagram', 'synthesis', 'assessment']),
  onTabChange: z.function().args(z.enum(['mbti', 'enneagram', 'synthesis', 'assessment'])).returns(z.void()),
  availableTabs: z.array(z.enum(['mbti', 'enneagram', 'synthesis', 'assessment'])),
  showProgress: z.boolean().default(false),
  completionStatus: z.object({
    mbti: z.boolean(),
    enneagram: z.boolean(),
    synthesis: z.boolean(),
    assessment: z.boolean(),
  }).optional(),
  className: z.string().default(''),
});

export const PsychologyAssessmentPanelPropsSchema = z.object({
  onComplete: z.function().args(AssessmentResultsSchema).returns(z.void()),
  onCancel: z.function().returns(z.void()).optional(),
  assessmentType: z.enum(['quick', 'full', 'both']).default('both'),
  existingResults: AssessmentResultsSchema.optional(),
  showProgress: z.boolean().default(true),
  className: z.string().default(''),
});

// Analytics event schema for psychology interactions
export const PsychologyAnalyticsSchema = z.object({
  action: z.enum([
    'tab_switch',
    'assessment_start',
    'assessment_complete',
    'function_select',
    'type_explore',
    'synthesis_view',
    'export_results',
  ]),
  psychologyType: z.enum(['mbti', 'enneagram', 'synthesis']).optional(),
  timestamp: z.string(),
  userSettings: z.record(z.any()).optional(),
  completionRate: z.number().min(0).max(1).optional(),
  confidenceLevel: z.number().min(0).max(1).optional(),
});

// Type exports from schemas
export type CognitiveFunction = z.infer<typeof CognitiveFunctionSchema>;
export type MBTIProfile = z.infer<typeof MBTIProfileSchema>;
export type EnneagramProfile = z.infer<typeof EnneagramProfileSchema>;
export type AstrologyCorrelation = z.infer<typeof AstrologyCorrelationSchema>;
export type PsychologySynthesis = z.infer<typeof PsychologySynthesisSchema>;
export type AssessmentResults = z.infer<typeof AssessmentResultsSchema>;
export type PsychologyChartData = z.infer<typeof PsychologyChartDataSchema>;
export type PsychologyAnalytics = z.infer<typeof PsychologyAnalyticsSchema>;

// Component prop types
export type PsychologyChartProps = z.infer<typeof PsychologyChartPropsSchema>;
export type MBTIDetailViewProps = z.infer<typeof MBTIDetailViewPropsSchema>;
export type EnneagramDetailViewProps = z.infer<typeof EnneagramDetailViewPropsSchema>;
export type PsychologySynthesisViewProps = z.infer<typeof PsychologySynthesisViewPropsSchema>;
export type PsychologyTabControlsProps = z.infer<typeof PsychologyTabControlsPropsSchema>;
export type PsychologyAssessmentPanelProps = z.infer<typeof PsychologyAssessmentPanelPropsSchema>;
