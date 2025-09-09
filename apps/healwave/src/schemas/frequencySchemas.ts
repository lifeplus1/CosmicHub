/**
 * Frequency Data Validation Schemas using Zod
 * Following unified type validation strategy from docs/03-GUIDES/UNIFIED-TYPE-VALIDATION-STRATEGY.md
 */

import { z } from 'zod';

// Define the frequency category enum schema
export const FrequencyCategorySchema = z.enum([
  'solfeggio',
  'chakra', 
  'brainwave',
  'binaural',
  'rife',
  'planetary',
  'stellar',
  'metallic',
  'elemental',
  'sacred_geometry',
  'biological',
  'other',
  'custom'
]);

// Define the frequency data schema
export const FrequencyDataSchema = z.object({
  frequency: z.number().positive(),
  amplitude: z.number().min(0).max(1),
  phase: z.number(),
  binauralBeat: z.number().optional(),
  timestamp: z.number().optional(),
  label: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  category: FrequencyCategorySchema,
  benefits: z.array(z.string()).optional(),
  duration: z.number().positive().optional(),
});

// Infer TypeScript types from Zod schemas
export type FrequencyCategory = z.infer<typeof FrequencyCategorySchema>;
export type ValidatedFrequencyData = z.infer<typeof FrequencyDataSchema>;

// Create validation functions
export const validateFrequencyData = (data: unknown): ValidatedFrequencyData => {
  return FrequencyDataSchema.parse(data);
};

export const safeValidateFrequencyData = (data: unknown): { success: true; data: ValidatedFrequencyData } | { success: false; error: z.ZodError } => {
  const result = FrequencyDataSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
};

// Export type guard
export const isValidFrequencyData = (data: unknown): data is ValidatedFrequencyData => {
  return FrequencyDataSchema.safeParse(data).success;
};
