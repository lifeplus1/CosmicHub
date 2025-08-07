import { z } from 'zod';

// Birth chart validation schema
export const birthDataSchema = z.object({
  date: z.string().min(1, 'Birth date is required'),
  time: z.string().min(1, 'Birth time is required'),
  location: z.object({
    name: z.string().min(1, 'Birth location is required'),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    timezone: z.string().optional()
  })
});

// User profile validation schema
export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  birthData: birthDataSchema.optional(),
  preferences: z.object({
    chartStyle: z.enum(['western', 'vedic']).default('western'),
    houseSystem: z.enum(['placidus', 'whole-sign', 'equal']).default('placidus'),
    notifications: z.boolean().default(true)
  }).optional()
});

// Chart calculation validation
export const chartCalculationSchema = z.object({
  birthData: birthDataSchema,
  chartType: z.enum(['natal', 'transit', 'composite', 'synastry']).default('natal'),
  options: z.object({
    includeAspects: z.boolean().default(true),
    includeMidpoints: z.boolean().default(false),
    orbs: z.record(z.number()).optional()
  }).optional()
});

// Healwave session validation
export const healwaveSessionSchema = z.object({
  frequency: z.number().min(20).max(20000, 'Frequency must be between 20Hz and 20kHz'),
  duration: z.number().min(1).max(60, 'Duration must be between 1 and 60 minutes'),
  volume: z.number().min(0).max(100, 'Volume must be between 0 and 100'),
  personalizedFor: z.string().optional() // Chart ID
});

// Form validation helpers
export const validateBirthData = (data: unknown) => {
  try {
    return birthDataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors };
    }
    return { error: 'Invalid birth data' };
  }
};

export const validateUserProfile = (data: unknown) => {
  try {
    return userProfileSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors };
    }
    return { error: 'Invalid user profile data' };
  }
};

export const validateHealwaveSession = (data: unknown) => {
  try {
    return healwaveSessionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors };
    }
    return { error: 'Invalid healwave session data' };
  }
};

// Date and time validation utilities
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100;
};

export const isValidTime = (timeString: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

export const isValidLatitude = (lat: number): boolean => {
  return lat >= -90 && lat <= 90;
};

export const isValidLongitude = (lng: number): boolean => {
  return lng >= -180 && lng <= 180;
};

// Sanitization utilities
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeNumericInput = (input: string): number | null => {
  const num = parseFloat(input);
  return isNaN(num) ? null : num;
};

export type BirthData = z.infer<typeof birthDataSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type ChartCalculation = z.infer<typeof chartCalculationSchema>;
export type HealwaveSession = z.infer<typeof healwaveSessionSchema>;
