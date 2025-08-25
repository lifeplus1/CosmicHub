import { z } from 'zod';
import { isChartLike, type ChartLike } from './normalizeChart';

// Stricter schemas for nested structures while remaining tolerant of partial data
const planetSchema = z
  .object({
    name: z.string().min(1).optional(),
    position: z.number().min(0).max(360).optional(),
    retrograde: z.boolean().optional(),
    speed: z.number().optional(),
  })
  .passthrough();

const houseSchema = z
  .object({
    number: z.number().int().min(1).max(12),
    cusp: z.number().min(0).max(360),
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
    ascendant: z.number().min(0).max(360).optional(),
    midheaven: z.number().min(0).max(360).optional(),
    descendant: z.number().min(0).max(360).optional(),
    imumcoeli: z.number().min(0).max(360).optional(),
  })
  .partial();

// Zod schema to validate a normalized chart-like object
export const chartLikeSchema = z
  .object({
    planets: z.record(planetSchema).optional(),
    houses: z.array(houseSchema).min(1).max(12).optional(),
    aspects: z.array(aspectSchema).optional(),
    asteroids: z.record(planetSchema).optional(),
    angles: anglesSchema.optional(),
  })
  .refine(
    obj => Object.values(obj).some(v => v !== undefined),
    'At least one chart section must be present'
  );

export type ValidChartLike = z.infer<typeof chartLikeSchema> & ChartLike;

export function validateChart(input: unknown): ValidChartLike | null {
  if (!isChartLike(input)) return null;
  const parsed = chartLikeSchema.safeParse(input);
  if (!parsed.success) return null;
  return parsed.data as ValidChartLike;
}
