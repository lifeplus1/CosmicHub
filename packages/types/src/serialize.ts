// Type-safe serialization utility for astrology data
import { z } from 'zod';
import type { AstrologyChart, UserProfile, NumerologyData } from './astrology.types.js';

// Define Zod schemas for validation
const ChartSchema = z.object({
  planets: z.array(z.object({
    name: z.string(),
    sign: z.string(),
    degree: z.number(),
    position: z.number(),
    house: z.string(),
    retrograde: z.boolean().optional(),
    aspects: z.array(z.any()).optional()
  })),
  houses: z.array(z.object({
    house: z.number(),
    number: z.number(),
    sign: z.string(),
    degree: z.number(),
    cusp: z.number(),
    ruler: z.string()
  })),
  aspects: z.array(z.object({
    planet1: z.string(),
    planet2: z.string(),
    type: z.string(),
    orb: z.number(),
    applying: z.string()
  })),
  asteroids: z.array(z.object({
    name: z.string(),
    sign: z.string(),
    degree: z.number(),
    house: z.string()
  })),
  angles: z.array(z.object({
    name: z.string(),
    sign: z.string(),
    degree: z.number(),
    position: z.number()
  }))
});

const ProfileSchema = z.object({
  userId: z.string(),
  birthData: z.object({ date: z.string(), time: z.string(), location: z.string() }),
});

const NumerologySchema = z.object({
  lifePath: z.number(),
  destiny: z.number(),
  personalYear: z.number(),
});

// Inferred schema types to keep validatedData strongly typed and avoid unsafe any
type ChartDataValidated = z.infer<typeof ChartSchema>;
type ProfileDataValidated = z.infer<typeof ProfileSchema>;
type NumerologyDataValidated = z.infer<typeof NumerologySchema>;

// Safe replacer: ensure undefined removed, typed with unknown to avoid unsafe any returns
const removeUndefinedReplacer = (_key: string, value: unknown): unknown => (
  value === undefined ? null : value
);

// Serialization function
export function serializeAstrologyData(data: AstrologyChart | UserProfile | NumerologyData): string {
  try {
    let validatedData: ChartDataValidated | ProfileDataValidated | NumerologyDataValidated;
    if ('planets' in data) {
      validatedData = ChartSchema.parse(data);
    } else if ('userId' in data) {
      validatedData = ProfileSchema.parse(data);
    } else if ('lifePath' in data) {
      validatedData = NumerologySchema.parse(data);
    } else {
      throw new Error('Unknown data type for serialization');
    }
    // Optimize JSON size by removing undefined fields
    return JSON.stringify(validatedData, removeUndefinedReplacer);
  } catch {
    // Swallow internal error details to avoid leaking structure; rethrow generic
    throw new Error('Failed to serialize data');
  }
}

// Deserialization function
export function deserializeAstrologyData<T extends AstrologyChart | UserProfile | NumerologyData>(json: string): T {
  try {
    const parsedUnknown: unknown = JSON.parse(json);
    if (parsedUnknown !== null && typeof parsedUnknown === 'object') {
      const parsed = parsedUnknown as Record<string, unknown>;
      if ('planets' in parsed) return ChartSchema.parse(parsed) as T;
      if ('userId' in parsed) return ProfileSchema.parse(parsed) as T;
      if ('lifePath' in parsed) return NumerologySchema.parse(parsed) as T;
    }
    throw new Error('Unknown data type for deserialization');
  } catch {
    throw new Error('Failed to deserialize data');
  }
}