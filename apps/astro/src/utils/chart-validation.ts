/**
 * Chart Validation Utilities
 *
 * This module provides validation functions for astrological data structures
 * by leveraging the type guards from @cosmichub/types.
 */

import { type AstrologyChart } from '@cosmichub/types';
import {
  isAstrologyChart,
  isUserProfile,
  isNumerologyData,
  validateAstrologyChart,
  safeParseAstrologyChart,
  getAstrologyDataType,
} from '../../../../packages/types/src/type-guards';

/**
 * Validates chart data before processing or display
 * Returns validation errors if any, or null if chart is valid
 */
export function validateChart(chart: unknown): string[] | null {
  if (!isAstrologyChart(chart)) {
    return [`Invalid chart data: ${getAstrologyDataType(chart)}`];
  }

  const errors = validateAstrologyChart(chart);
  return errors.length > 0 ? errors : null;
}

/**
 * Safely parses a chart from JSON with detailed validation
 * Returns the parsed chart and any validation errors
 */
export function parseChartSafely(jsonString: string): {
  chart: AstrologyChart | null;
  errors: string[];
  isValid: boolean;
} {
  const [chart, errors] = safeParseAstrologyChart(jsonString);
  return {
    chart,
    errors,
    isValid: errors.length === 0 && chart !== null,
  };
}

/**
 * Type-aware function to determine the type of data
 * Returns a user-friendly type name for display
 */
export function getDataTypeName(
  data: unknown
): 'Astrology Chart' | 'User Profile' | 'Numerology Data' | 'Unknown Data' {
  if (isAstrologyChart(data)) return 'Astrology Chart';
  if (isUserProfile(data)) return 'User Profile';
  if (isNumerologyData(data)) return 'Numerology Data';
  return 'Unknown Data';
}

/**
 * Validates a user profile
 * Returns validation errors if any, or null if profile is valid
 */
export function validateUserProfile(profile: unknown): string[] | null {
  if (!isUserProfile(profile)) {
    return ['Invalid user profile data'];
  }

  const errors: string[] = [];

  // Additional validation beyond type structure
  const typedProfile = profile;

  if (
    typedProfile.userId === undefined ||
    typedProfile.userId === null ||
    typedProfile.userId.trim().length === 0
  ) {
    errors.push('User ID is required');
  }

  if (
    typedProfile.birthData.date === undefined ||
    typedProfile.birthData.date === null ||
    !/^\d{4}-\d{2}-\d{2}$/.test(typedProfile.birthData.date)
  ) {
    errors.push('Birth date must be in YYYY-MM-DD format');
  }

  if (
    typedProfile.birthData.time === undefined ||
    typedProfile.birthData.time === null ||
    !/^\d{2}:\d{2}(:\d{2})?$/.test(typedProfile.birthData.time)
  ) {
    errors.push('Birth time must be in HH:MM or HH:MM:SS format');
  }

  if (
    typedProfile.birthData.location === undefined ||
    typedProfile.birthData.location === null ||
    typedProfile.birthData.location.trim().length === 0
  ) {
    errors.push('Birth location is required');
  }

  return errors.length > 0 ? errors : null;
}

/**
 * Validates numerology data
 * Returns validation errors if any, or null if data is valid
 */
export function validateNumerologyData(data: unknown): string[] | null {
  if (!isNumerologyData(data)) {
    return ['Invalid numerology data'];
  }

  const errors: string[] = [];

  // Additional validation beyond type structure
  const typedData = data;

  // Life path should be between 1-9 or 11, 22, 33 (master numbers)
  const validLifePathNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
  if (!validLifePathNumbers.includes(typedData.lifePath)) {
    errors.push(
      'Life path must be a valid numerology number (1-9, 11, 22, or 33)'
    );
  }

  // Destiny should be between 1-9 or 11, 22, 33 (master numbers)
  if (!validLifePathNumbers.includes(typedData.destiny)) {
    errors.push(
      'Destiny must be a valid numerology number (1-9, 11, 22, or 33)'
    );
  }

  // Personal year should be between 1-9
  if (typedData.personalYear < 1 || typedData.personalYear > 9) {
    errors.push('Personal year must be between 1 and 9');
  }

  return errors.length > 0 ? errors : null;
}

/**
 * Universal data validator that automatically detects the data type
 * and applies the appropriate validation
 */
export function validateAstrologyData(data: unknown): {
  type: string;
  isValid: boolean;
  errors: string[] | null;
} {
  const type = getDataTypeName(data);
  let isValid = false;
  let errors: string[] | null = null;

  if (isAstrologyChart(data)) {
    errors = validateChart(data);
    isValid = errors === null;
  } else if (isUserProfile(data)) {
    errors = validateUserProfile(data);
    isValid = errors === null;
  } else if (isNumerologyData(data)) {
    errors = validateNumerologyData(data);
    isValid = errors === null;
  } else {
    errors = ['Unknown or invalid data type'];
    isValid = false;
  }

  return { type, isValid, errors };
}
