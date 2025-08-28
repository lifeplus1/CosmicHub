import { z } from 'zod';
import { isChartLike, type ChartLike } from './normalizeChart';

// Stricter schemas for nested structures while remaining tolerant of partial data
const planetSchema = z
  .object({
    name: z.string().min(1).optional(),
    position: z.number().optional(), // Remove min(0).max(360) constraint
    retrograde: z.boolean().optional(),
    speed: z.number().optional(),
    sign: z.string().min(1).optional(), // Add sign field
    house: z.number().optional(), // Add house field
  })
  .passthrough();

const houseSchema = z
  .object({
    number: z.number().int().min(0).max(12), // Allow 0-12 instead of 1-12
    house: z.number().int().min(0).max(12).optional(), // Add house field
    cusp: z.number(), // Remove min(0).max(360) constraint
    sign: z.string().min(1),
  })
  .passthrough();

const aspectSchema = z
  .object({
    type: z.string().optional(),
    orb: z.number().optional(),
    bodies: z.array(z.string()).optional(),
  })
  .passthrough();

const anglesSchema = z
  .object({
    ascendant: z.number().optional(), // Remove max(360) constraint
    midheaven: z.number().optional(), // Remove max(360) constraint
    descendant: z.number().optional(), // Remove max(360) constraint
    imumcoeli: z.number().optional(), // Remove max(360) constraint
  })
  .partial();

// Zod schema to validate a normalized chart-like object
export const chartLikeSchema = z
  .object({
    planets: z.record(planetSchema).optional(),
    houses: z.array(houseSchema).min(1).max(15).optional(), // Allow up to 15 houses
    aspects: z.array(aspectSchema).optional(),
    asteroids: z.record(planetSchema).optional(),
    angles: anglesSchema.optional(),
    // Allow additional API fields
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    timezone: z.string().optional(),
    julian_day: z.number().optional(),
  })
  .passthrough() // Allow additional fields
  .refine(
    obj => Object.values(obj).some(v => v !== undefined),
    'At least one chart section must be present'
  );

export type ValidChartLike = z.infer<typeof chartLikeSchema> & ChartLike;

export function validateChart(input: unknown): ValidChartLike | null {
  if (!isChartLike(input)) {
    console.log('🚨 validateChart: Not chart-like:', input);
    return null;
  }
  const parsed = chartLikeSchema.safeParse(input);
  if (!parsed.success) {
    console.log('🚨 validateChart: Schema validation failed:');
    parsed.error.issues.forEach((issue, index) => {
      console.log(
        `  ${index + 1}. Path: ${issue.path.join('.')} - ${issue.message}`
      );
    });
    console.log(
      '🚨 validateChart: Input data keys:',
      Object.keys(input as Record<string, unknown>)
    );
    return null;
  }
  console.log('✅ validateChart: Validation passed');
  return parsed.data as ValidChartLike;
}
