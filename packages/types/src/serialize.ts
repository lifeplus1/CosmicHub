// Type-safe serialization utility for astrology data
import { z } from 'zod';
import type {
  AstrologyChart,
  UserProfile,
  NumerologyData,
} from './astrology.types.js';
import {
  isAstrologyChart,
  isUserProfile,
  isNumerologyData,
  getAstrologyDataType,
} from './type-guards.js';

// Enhanced Type Bridge System: Backward compatible Zod schema aligned with TypeScript interfaces
const ChartSchema = z.object({
  planets: z.record(
    z.string(), // PlanetName key
    z.object({
      name: z.string(),
      position: z.number(),
      degree: z.number().optional(), // Optional, defaults to position
      sign: z.string(),
      house: z.number(),
      retrograde: z.boolean().optional().default(false), // Optional with default
      speed: z.number().optional(), // Optional - can be computed
      dignity: z.enum(['domicile', 'exaltation', 'fall', 'detriment']).optional(),
      essential_dignity: z.number().optional(),
      aspects: z.array(
        z.object({
          aspect_type: z.string(),
          planet1: z.string(),
          planet2: z.string(),
          orb: z.number(),
          applying: z.boolean(),
          exact: z.boolean().optional(), // Optional with computed default
          power: z.number().optional(), // Optional with computed default
          aspect_angle: z.number().optional(), // Optional enhanced field
          separating: z.boolean().optional(),
          mutual_reception: z.boolean().optional(),
          dignity_interaction: z.enum(['enhancement', 'conflict', 'neutral']).optional(),
          timing: z.object({
            peak_exact: z.string().optional(),
            duration_days: z.number().optional(),
          }).optional(),
        })
      ).optional(),
      element: z.enum(['fire', 'earth', 'air', 'water']).optional(),
      modality: z.enum(['cardinal', 'fixed', 'mutable']).optional(),
      house_position: z.enum(['early', 'middle', 'late']).optional(),
    })
  ),
  houses: z.array(
    z.object({
      number: z.number().int().min(1).max(12),
      cusp: z.number(),
      sign: z.string(),
      ruler: z.string().optional(), // PlanetName - optional for backward compatibility
      modern_ruler: z.string().optional(),
      degree: z.number().optional(), // Alias for cusp - optional
      size: z.number().optional(), // Optional enhanced field
      contains_planets: z.array(z.string()).optional(),
    })
  ),
  aspects: z.array(
    z.object({
      aspect_type: z.string(),
      planet1: z.string(),
      planet2: z.string(),
      orb: z.number(),
      applying: z.boolean(),
      exact: z.boolean().optional(), // Optional with computed default
      power: z.number().optional(), // Optional with computed default
      aspect_angle: z.number().optional(), // Optional enhanced field
      separating: z.boolean().optional(),
      mutual_reception: z.boolean().optional(),
      dignity_interaction: z.enum(['enhancement', 'conflict', 'neutral']).optional(),
      timing: z.object({
        peak_exact: z.string().optional(),
        duration_days: z.number().optional(),
      }).optional(),
    })
  ),
  asteroids: z.record(z.string(), z.object({
    name: z.string(),
    position: z.number(),
    degree: z.number(),
    sign: z.string(),
    house: z.number(),
    retrograde: z.boolean(),
    speed: z.number(),
  })).optional(),
  points: z.record(z.string(), z.object({
    name: z.string(),
    position: z.number(),
    degree: z.number(),
    sign: z.string(),
    house: z.number(),
    retrograde: z.boolean(),
    speed: z.number(),
  })).optional(),
  angles: z.object({
    ascendant: z.number(),
    midheaven: z.number(),
    descendant: z.number(),
    imumcoeli: z.number(),
    vertex: z.number().optional(),
    antivertex: z.number().optional(),
    part_of_fortune: z.number().optional(),
    north_node: z.number().optional(),
    south_node: z.number().optional(),
    lilith_mean: z.number().optional(),
    lilith_true: z.number().optional(),
    chiron: z.number().optional(),
    house_system: z.enum(['placidus', 'koch', 'equal', 'whole_sign', 'regiomontanus', 'campanus', 'porphyry']).optional(),
    angles_calculated_at: z.string().optional(),
  }),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  julian_day: z.number(),
  house_system: z.enum(['placidus', 'koch', 'equal', 'whole_sign', 'regiomontanus', 'campanus', 'porphyry']),
  sidereal: z.object({
    ayanamsa: z.enum(['lahiri', 'raman', 'krishnamurti', 'fagan_bradley']),
    offset: z.number(),
  }).optional(),
  chart_metadata: z.object({
    calculation_timestamp: z.string(),
    ephemeris_source: z.enum(['swiss', 'jpl', 'moshier']),
    coordinate_system: z.enum(['tropical', 'sidereal']),
    house_system_details: z.object({
      obliquity: z.number().optional(),
      mean_node: z.boolean().optional(),
    }).optional(),
    location_metadata: z.object({
      place_name: z.string().optional(),
      country: z.string().optional(),
      altitude: z.number().optional(),
      dst_offset: z.number().optional(),
    }).optional(),
  }).optional(),
  chart_patterns: z.object({
    grand_trines: z.array(z.object({
      element: z.enum(['fire', 'earth', 'air', 'water']),
      planets: z.tuple([z.string(), z.string(), z.string()]),
      strength: z.number(),
    })).optional(),
    t_squares: z.array(z.object({
      focal_planet: z.string(),
      opposition_planets: z.tuple([z.string(), z.string()]),
      strength: z.number(),
    })).optional(),
    stelliums: z.array(z.object({
      sign: z.string().optional(),
      house: z.number().optional(),
      planets: z.array(z.string()),
      concentration_strength: z.number(),
    })).optional(),
  }).optional(),
});

const ProfileSchema = z.object({
  userId: z.string(),
  birthData: z.object({
    date: z.string(),
    time: z.string(),
    location: z.string(),
  }),
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
const removeUndefinedReplacer = (_key: string, value: unknown): unknown =>
  value === undefined ? null : value;

// Size optimization helper: remove null/undefined fields before serialization
export function optimizeForSerialization<T extends Record<string, unknown>>(
  data: T
): Partial<T> {
  const optimized: Partial<T> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') {
      optimized[key as keyof T] = value as T[keyof T];
    }
  }

  return optimized;
}

// Enhanced serialization with optimization options
export function serializeAstrologyData(
  data: AstrologyChart | UserProfile | NumerologyData,
  options: { optimize?: boolean } = {}
): string {
  try {
    let validatedData:
      | ChartDataValidated
      | ProfileDataValidated
      | NumerologyDataValidated;

    // Apply optimization before validation if requested
    const processedData = options.optimize
      ? optimizeForSerialization(data as unknown as Record<string, unknown>)
      : data;

    if (isAstrologyChart(processedData)) {
      validatedData = ChartSchema.parse(processedData);
    } else if (isUserProfile(processedData)) {
      validatedData = ProfileSchema.parse(processedData);
    } else if (isNumerologyData(processedData)) {
      validatedData = NumerologySchema.parse(processedData);
    } else {
      throw new Error('Unknown data type for serialization');
    }

    return JSON.stringify(validatedData, removeUndefinedReplacer);
  } catch {
    throw new Error('Failed to serialize data');
  }
}

// Deserialization function
export function deserializeAstrologyData<
  T extends AstrologyChart | UserProfile | NumerologyData,
>(json: string): T {
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
    throw new Error(
      `Unknown or invalid data type for deserialization: ${dataType}`
    );
  } catch (err) {
    if (err instanceof Error) {
      const g: unknown = globalThis as unknown;
      // Narrow devConsole shape safely
      const maybeConsole = (
        g as {
          devConsole?: { error?: (msg: unknown, detail?: unknown) => void };
        }
      ).devConsole;
      if (maybeConsole && typeof maybeConsole.error === 'function') {
        maybeConsole.error('Deserialization error:', err.message);
      }
    }
    throw new Error('Failed to deserialize data');
  }
}
