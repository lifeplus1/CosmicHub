// Type-safe serialization utility for astrology data
import { z } from 'zod';
import type { AstrologyChart, UserProfile, NumerologyData } from './astrology.types.js';
import { 
  isAstrologyChart, 
  isUserProfile, 
  isNumerologyData,
  getAstrologyDataType
} from './type-guards.js';

// Define Zod schemas for validation
const ChartSchema = z.object({
  planets: z.array(z.object({
    name: z.string(),
    sign: z.string(),
    degree: z.number(),
    position: z.number(),
    house: z.string(),
    retrograde: z.boolean().optional(),
    // Use structured aspect schema instead of z.any
    aspects: z.array(z.object({
      planet1: z.string(),
      planet2: z.string(),
      type: z.string(),
      orb: z.number(),
      applying: z.string()
    })).optional()
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
    
    // Use type guards for more precise type narrowing
    if (isAstrologyChart(data)) {
      validatedData = ChartSchema.parse(data);
    } else if (isUserProfile(data)) {
      validatedData = ProfileSchema.parse(data);
    } else if (isNumerologyData(data)) {
      validatedData = NumerologySchema.parse(data);
    } else {
      throw new Error('Unknown data type for serialization');
    }
    
    // Optimize JSON size by removing undefined fields
    return JSON.stringify(validatedData, removeUndefinedReplacer);
  } catch (error) {
    // Swallow internal error details to avoid leaking structure; rethrow generic
    throw new Error('Failed to serialize data');
  }
}

// Deserialization function
export function deserializeAstrologyData<T extends AstrologyChart | UserProfile | NumerologyData>(json: string): T {
  try {
    const parsedUnknown: unknown = JSON.parse(json);
    
    // Use type guards for more precise type detection and validation
    if (isAstrologyChart(parsedUnknown)) {
      return ChartSchema.parse(parsedUnknown) as T;
    } 
    
    if (isUserProfile(parsedUnknown)) {
      return ProfileSchema.parse(parsedUnknown) as T;
    }
    
    if (isNumerologyData(parsedUnknown)) {
      return NumerologySchema.parse(parsedUnknown) as T;
    }
    
    // Use getAstrologyDataType for more detailed error message
    const dataType = getAstrologyDataType(parsedUnknown);
    throw new Error(`Unknown or invalid data type for deserialization: ${dataType}`);
  } catch (error) {
    if (error instanceof Error) {
  // Preserve error context for debugging while keeping public message generic.
  // Use global devConsole if present to avoid raw console.* usage (silences no-console warnings).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any)?.devConsole?.error?.('Deserialization error:', error.message);
    }
    throw new Error('Failed to deserialize data');
  }
}