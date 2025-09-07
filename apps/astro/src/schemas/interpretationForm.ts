/**
 * @fileoverview InterpretationForm Type Bridge Validation Schemas
 * 
 * Comprehensive Zod schemas for AI interpretation form component validation.
 * Provides runtime validation and TypeScript integration following Type Bridge principles.
 * 
 * @module InterpretationFormSchemas
 * @version 1.0.0
 */

import { z } from 'zod';

// ============================================================================
// Core Type Schemas
// ============================================================================

/**
 * Valid interpretation types for chart-based analysis
 */
export const InterpretationTypeSchema = z.enum([
  'natal',
  'transit', 
  'synastry',
  'composite',
]);

/**
 * Valid focus areas for interpretation analysis
 */
export const InterpretationFocusAreaSchema = z.enum([
  'personality',
  'relationships',
  'career',
  'health',
  'spirituality',
  'finances',
  'family',
  'education',
  'life_purpose',
  'challenges',
  'strengths',
  'current_cycle',
  'future_trends',
  'spiritual_growth',
]);

/**
 * Valid interpretation types for direct AI mode
 */
export const DirectInterpretationTypeSchema = z.enum([
  'general',
  'personality',
  'career',
  'relationships',
]);

/**
 * Valid modes for the interpretation form
 */
export const InterpretationModeSchema = z.enum(['chart', 'direct']);

/**
 * Toast status types for notifications
 */
export const ToastStatusSchema = z.enum(['success', 'error', 'warning', 'info']);

// ============================================================================
// Form State Schemas
// ============================================================================

/**
 * Chart form state schema for chart-based interpretation mode
 */
export const ChartFormStateSchema = z.object({
  type: InterpretationTypeSchema,
  focus: z.array(InterpretationFocusAreaSchema),
  question: z.string(),
});

/**
 * Direct form state schema for direct AI interpretation mode
 */
export const DirectFormStateSchema = z.object({
  birthDate: z.string(),
  birthTime: z.string(),
  birthLocation: z.string(),
  interpretationType: DirectInterpretationTypeSchema,
});

/**
 * Partner birth data schema for synastry interpretations
 */
export const PartnerBirthDataSchema = z.object({
  birthDate: z.string(),
  birthTime: z.string(),
  birthLocation: z.string(),
});

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Date validation schema (YYYY-MM-DD format)
 */
export const DateValidationSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be in YYYY-MM-DD format'
).refine((date) => {
  const parts = date.split('-');
  if (parts.length !== 3) return false;
  
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  );
}, 'Invalid date');

/**
 * Time validation schema (HH:MM 24-hour format)
 */
export const TimeValidationSchema = z.string().regex(
  /^\d{2}:\d{2}$/,
  'Time must be in HH:MM format'
).refine((time) => {
  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return false;
  if (hours < 0 || hours > 23) return false;
  if (minutes < 0 || minutes > 59) return false;
  
  return true;
}, 'Invalid time');

/**
 * Location validation schema (non-empty string)
 */
export const LocationValidationSchema = z.string().min(1, 'Location is required');

// ============================================================================
// API Integration Schemas
// ============================================================================

/**
 * Chart interpretation request parameters schema
 */
export const ChartInterpretationParamsSchema = z.object({
  chartId: z.string().min(1, 'Chart ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  type: InterpretationTypeSchema,
  focus: z.array(InterpretationFocusAreaSchema),
  question: z.string().optional(),
  partnerBirthDate: z.string().optional(),
  partnerBirthTime: z.string().optional(),
  partnerBirthLocation: z.string().optional(),
});

/**
 * Direct interpretation request parameters schema
 */
export const DirectInterpretationParamsSchema = z.object({
  birthDate: DateValidationSchema,
  birthTime: TimeValidationSchema,
  birthLocation: LocationValidationSchema,
  interpretationType: DirectInterpretationTypeSchema,
});

/**
 * Interpretation request schema for API calls
 */
export const InterpretationRequestSchema = z.object({
  chartId: z.string().min(1, 'Chart ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  type: InterpretationTypeSchema,
  focus_areas: z.array(InterpretationFocusAreaSchema),
  categories: z.array(z.string()).optional(),
  question: z.string().optional(),
  options: z.object({
    max_sections: z.number().positive().optional(),
    min_confidence: z.number().min(0).max(1).optional(),
    include_sources: z.boolean().optional(),
    technique_preference: z.enum(['traditional', 'modern', 'hybrid']).optional(),
    language_style: z.enum(['technical', 'casual', 'metaphorical']).optional(),
  }).optional(),
});

// ============================================================================
// Component Props Schemas
// ============================================================================

/**
 * Interpretation result schema for callbacks
 */
export const InterpretationResultSchema = z.object({
  data: z.unknown().optional(),
  content: z.string().optional(),
});

/**
 * Toast options schema for notifications
 */
export const ToastOptionsSchema = z.object({
  title: z.string(),
  description: z.string(),
  status: ToastStatusSchema,
  duration: z.number().positive().optional(),
});

/**
 * Interpretation type option schema for UI display
 */
export const InterpretationTypeOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  description: z.string(),
});

/**
 * AI interpretation type option schema for direct mode
 */
export const AIInterpretationTypeOptionSchema = z.object({
  value: DirectInterpretationTypeSchema,
  label: z.string(),
  description: z.string(),
});

/**
 * Focus area label mapping schema
 */
export const FocusAreaLabelSchema = z.object({
  label: z.string(),
  canonical: InterpretationFocusAreaSchema,
});

// ============================================================================
// Main Component Props Schemas
// ============================================================================

/**
 * InterpretationForm main component props schema
 */
export const InterpretationFormPropsSchema = z.object({
  onInterpretationGenerated: z.function()
    .args(InterpretationResultSchema)
    .returns(z.void())
    .optional(),
  chartId: z.string().optional(),
  mode: InterpretationModeSchema.default('direct'),
  defaultFocus: z.array(InterpretationFocusAreaSchema).optional(),
  defaultType: InterpretationTypeSchema.optional(),
  existingInterpretationId: z.string().optional(),
  persistUpdates: z.boolean().default(false),
});

/**
 * Interpretation form container props schema
 */
export const InterpretationFormContainerPropsSchema = z.object({
  children: z.unknown(),
  className: z.string().optional(),
  'aria-labelledby': z.string().optional(),
  role: z.string().optional(),
});

/**
 * Chart mode form props schema
 */
export const ChartModeFormPropsSchema = z.object({
  chartForm: ChartFormStateSchema,
  onChartFormChange: z.function()
    .args(ChartFormStateSchema)
    .returns(z.void()),
  interpretationTypes: z.array(InterpretationTypeOptionSchema),
  focusAreaLabels: z.array(z.string()),
  onFocusToggle: z.function()
    .args(z.string())
    .returns(z.void()),
  partnerData: PartnerBirthDataSchema.optional(),
  onPartnerDataChange: z.function()
    .args(PartnerBirthDataSchema)
    .returns(z.void())
    .optional(),
  isSynastry: z.boolean(),
});

/**
 * Direct mode form props schema
 */
export const DirectModeFormPropsSchema = z.object({
  directForm: DirectFormStateSchema,
  onDirectFormChange: z.function()
    .args(DirectFormStateSchema)
    .returns(z.void()),
  aiInterpretationTypes: z.array(AIInterpretationTypeOptionSchema),
  onValidationError: z.function()
    .args(z.string())
    .returns(z.void())
    .optional(),
});

/**
 * Generate button props schema
 */
export const GenerateButtonPropsSchema = z.object({
  isGenerating: z.boolean(),
  isLoading: z.boolean(),
  isDisabled: z.boolean(),
  onGenerate: z.function().args().returns(z.promise(z.void())),
  mode: InterpretationModeSchema,
  className: z.string().optional(),
});

/**
 * Interpretation display props schema
 */
export const InterpretationDisplayPropsSchema = z.object({
  interpretation: z.string().nullable(),
  error: z.string().nullable(),
  isLoading: z.boolean(),
  statusMessage: z.string(),
  className: z.string().optional(),
});

/**
 * Focus area selector props schema
 */
export const FocusAreaSelectorPropsSchema = z.object({
  selectedFocus: z.array(InterpretationFocusAreaSchema),
  focusAreaLabels: z.array(z.string()),
  onFocusToggle: z.function()
    .args(z.string())
    .returns(z.void()),
  className: z.string().optional(),
  disabled: z.boolean().default(false),
});

/**
 * Birth data input props schema
 */
export const BirthDataInputPropsSchema = z.object({
  birthDate: z.string(),
  birthTime: z.string(),
  birthLocation: z.string(),
  onBirthDateChange: z.function()
    .args(z.string())
    .returns(z.void()),
  onBirthTimeChange: z.function()
    .args(z.string())
    .returns(z.void()),
  onBirthLocationChange: z.function()
    .args(z.string())
    .returns(z.void()),
  showValidation: z.boolean().default(true),
  disabled: z.boolean().default(false),
  className: z.string().optional(),
});

// ============================================================================
// Hook Schemas
// ============================================================================

/**
 * AI interpretation hook return schema
 */
export const AIInterpretationHookSchema = z.object({
  interpretation: z.string().nullable(),
  loading: z.boolean(),
  error: z.string().nullable(),
  generateInterpretation: z.function()
    .args(z.unknown())
    .returns(z.promise(z.void())),
  clearInterpretation: z.function()
    .args()
    .returns(z.void()),
});

/**
 * Form validation hook return schema
 */
export const FormValidationHookSchema = z.object({
  isValidDate: z.function()
    .args(z.string())
    .returns(z.boolean()),
  isValidTime: z.function()
    .args(z.string())
    .returns(z.boolean()),
  validateChartForm: z.function()
    .args(ChartFormStateSchema)
    .returns(z.object({
      isValid: z.boolean(),
      errors: z.array(z.string()),
    })),
  validateDirectForm: z.function()
    .args(DirectFormStateSchema)
    .returns(z.object({
      isValid: z.boolean(),
      errors: z.array(z.string()),
    })),
});

// ============================================================================
// Analytics Schemas
// ============================================================================

/**
 * Analytics interaction schema
 */
export const AnalyticsInteractionSchema = z.object({
  feature: z.string(),
  input_type: z.string(),
  response_time_ms: z.number().positive(),
  model_version: z.string(),
});

/**
 * Performance tracking schema
 */
export const PerformanceTrackingSchema = z.object({
  start: z.number(),
  end: z.number(),
  duration: z.number(),
  feature: z.string(),
});

// ============================================================================
// Exported Type Definitions
// ============================================================================

export type InterpretationType = z.infer<typeof InterpretationTypeSchema>;
export type InterpretationFocusArea = z.infer<typeof InterpretationFocusAreaSchema>;
export type DirectInterpretationType = z.infer<typeof DirectInterpretationTypeSchema>;
export type InterpretationMode = z.infer<typeof InterpretationModeSchema>;
export type ToastStatus = z.infer<typeof ToastStatusSchema>;

export type ChartFormState = z.infer<typeof ChartFormStateSchema>;
export type DirectFormState = z.infer<typeof DirectFormStateSchema>;
export type PartnerBirthData = z.infer<typeof PartnerBirthDataSchema>;

export type ChartInterpretationParams = z.infer<typeof ChartInterpretationParamsSchema>;
export type DirectInterpretationParams = z.infer<typeof DirectInterpretationParamsSchema>;
export type InterpretationRequest = z.infer<typeof InterpretationRequestSchema>;

export type InterpretationResult = z.infer<typeof InterpretationResultSchema>;
export type ToastOptions = z.infer<typeof ToastOptionsSchema>;
export type InterpretationTypeOption = z.infer<typeof InterpretationTypeOptionSchema>;
export type AIInterpretationTypeOption = z.infer<typeof AIInterpretationTypeOptionSchema>;

export type InterpretationFormProps = z.infer<typeof InterpretationFormPropsSchema>;
export type InterpretationFormContainerProps = z.infer<typeof InterpretationFormContainerPropsSchema>;
export type ChartModeFormProps = z.infer<typeof ChartModeFormPropsSchema>;
export type DirectModeFormProps = z.infer<typeof DirectModeFormPropsSchema>;
export type GenerateButtonProps = z.infer<typeof GenerateButtonPropsSchema>;
export type InterpretationDisplayProps = z.infer<typeof InterpretationDisplayPropsSchema>;
export type FocusAreaSelectorProps = z.infer<typeof FocusAreaSelectorPropsSchema>;
export type BirthDataInputProps = z.infer<typeof BirthDataInputPropsSchema>;

export type AIInterpretationHook = z.infer<typeof AIInterpretationHookSchema>;
export type FormValidationHook = z.infer<typeof FormValidationHookSchema>;

export type AnalyticsInteraction = z.infer<typeof AnalyticsInteractionSchema>;
export type PerformanceTracking = z.infer<typeof PerformanceTrackingSchema>;

// ============================================================================
// Schema Validation Functions
// ============================================================================

/**
 * Validate chart form state
 */
export const validateChartFormState = (data: unknown) => {
  return ChartFormStateSchema.safeParse(data);
};

/**
 * Validate direct form state
 */
export const validateDirectFormState = (data: unknown) => {
  return DirectFormStateSchema.safeParse(data);
};

/**
 * Validate interpretation form props
 */
export const validateInterpretationFormProps = (data: unknown) => {
  return InterpretationFormPropsSchema.safeParse(data);
};

/**
 * Validate date format
 */
export const validateDate = (date: string) => {
  return DateValidationSchema.safeParse(date);
};

/**
 * Validate time format
 */
export const validateTime = (time: string) => {
  return TimeValidationSchema.safeParse(time);
};

/**
 * Validate chart interpretation parameters
 */
export const validateChartInterpretationParams = (data: unknown) => {
  return ChartInterpretationParamsSchema.safeParse(data);
};

/**
 * Validate direct interpretation parameters
 */
export const validateDirectInterpretationParams = (data: unknown) => {
  return DirectInterpretationParamsSchema.safeParse(data);
};
