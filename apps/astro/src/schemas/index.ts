// Central Zod schemas (initial scaffold)
import { z } from 'zod';

export const BirthDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  city: z.string().min(1),
  country: z.string().min(1).optional(),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
  timezone: z.string().min(1),
  datetime: z.string().optional(),
});

export const CompatibilityOverridesSchema = z.record(z.string(), z.number().min(0).max(100));

export const AdvancedSynastryRequestSchema = z.object({
  person1: BirthDataSchema,
  person2: BirthDataSchema,
  include_aspects: z.boolean().default(true),
  include_house_overlays: z.boolean().default(true),
  compatibility_overrides: CompatibilityOverridesSchema.optional(),
});

export type BirthData = z.infer<typeof BirthDataSchema>;
export type AdvancedSynastryRequest = z.infer<typeof AdvancedSynastryRequestSchema>;

// Research Platform Schemas
export * from './research';

// Sacred Geometry Schemas
export * from './sacredGeometry';

// Chart Display Component Schemas
export * from './chartDisplay';

// Psychology Chart Component Schemas
export * from './psychologyChart';

// AI Interpretation Form Component Schemas
export * from './interpretationForm';
