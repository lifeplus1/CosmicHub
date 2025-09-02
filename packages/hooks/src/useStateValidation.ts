/**
 * useStateValidation Hook - Comprehensive State Validation Management
 *
 * Provides enterprise-grade state validation with:
 * - Centralized validation logic for birth data, chart data, and user inputs
 * - Type guards with detailed error messages
 * - Validation caching to prevent redundant checks
 * - Progressive validation patterns for complex forms
 * - Real-time validation feedback
 * - Custom validation rules and business logic
 *
 * This hook consolidates all validation logic that was previously
 * scattered across contexts and components.
 */

import { useState, useCallback, useMemo, useRef } from 'react';

// Core validation types
export interface ValidationRule<T = unknown> {
  name: string;
  validator: (value: T) => boolean | Promise<boolean>;
  message: string;
  severity: 'error' | 'warning' | 'info';
  async?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  value?: unknown;
}

export interface ValidationCache {
  [key: string]: {
    result: ValidationResult;
    timestamp: number;
    expiry: number;
  };
}

// Birth data validation types
export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  lat?: number;
  lon?: number;
  timezone?: string;
}

// Chart data validation types
export interface PlanetData {
  position: number;
  house?: number;
  retrograde?: boolean;
}

export interface HouseData {
  number: number;
  cusp: number;
  sign: string;
}

export interface AspectData {
  point1: string;
  point2: string;
  aspect: string;
  orb: number;
}

export interface ChartData {
  planets?: Record<string, PlanetData>;
  houses?: HouseData[];
  aspects?: AspectData[];
  asteroids?: Record<string, PlanetData>;
  angles?: Record<string, PlanetData>;
}

// Validation configuration
export interface UseStateValidationOptions {
  enableCache?: boolean;
  cacheExpiry?: number; // milliseconds
  enableAsyncValidation?: boolean;
  strictMode?: boolean;
  customRules?: ValidationRule[];
}

/**
 * Comprehensive State Validation Hook
 */
export function useStateValidation(options: UseStateValidationOptions = {}) {
  const {
    enableCache = true,
    cacheExpiry = 5 * 60 * 1000, // 5 minutes
    enableAsyncValidation = true,
    strictMode = false,
    customRules = [],
  } = options;

  const [validationState, setValidationState] = useState<{
    isValidating: boolean;
    lastValidation: number;
    validationCount: number;
  }>({
    isValidating: false,
    lastValidation: 0,
    validationCount: 0,
  });

  const cacheRef = useRef<ValidationCache>({});

  // Generate cache key for validation
  const getCacheKey = useCallback(
    <T>(data: unknown, rules: ValidationRule<T>[]): string => {
      const dataHash = JSON.stringify(data);
      const rulesHash = rules.map(r => r.name).join(',');
      return `${dataHash}-${rulesHash}`;
    },
    []
  );

  // Get cached validation result
  const getCachedResult = useCallback(
    (cacheKey: string): ValidationResult | null => {
      if (!enableCache) return null;

      const cached = cacheRef.current[cacheKey];
      if (cached && cached.expiry > Date.now()) {
        return cached.result;
      }

      // Clean expired cache entries
      if (cached && cached.expiry <= Date.now()) {
        delete cacheRef.current[cacheKey];
      }

      return null;
    },
    [enableCache]
  );

  // Set cached validation result
  const setCachedResult = useCallback(
    (cacheKey: string, result: ValidationResult): void => {
      if (!enableCache) return;

      cacheRef.current[cacheKey] = {
        result,
        timestamp: Date.now(),
        expiry: Date.now() + cacheExpiry,
      };
    },
    [enableCache, cacheExpiry]
  );

  // Core validation engine
  const validateWithRules = useCallback(
    async <T>(
      data: T,
      rules: ValidationRule<T>[],
      fieldName: string = 'data'
    ): Promise<ValidationResult> => {
      const errors: ValidationError[] = [];
      const warnings: ValidationError[] = [];
      const info: ValidationError[] = [];

      for (const rule of rules) {
        try {
          let isValid: boolean;

          if (rule.async && enableAsyncValidation) {
            isValid = await rule.validator(data);
          } else {
            isValid = rule.validator(data) as boolean;
          }

          if (!isValid) {
            const error: ValidationError = {
              field: fieldName,
              rule: rule.name,
              message: rule.message,
              severity: rule.severity,
              value: data,
            };

            switch (rule.severity) {
              case 'error':
                errors.push(error);
                break;
              case 'warning':
                warnings.push(error);
                break;
              case 'info':
                info.push(error);
                break;
            }
          }
        } catch (error) {
          errors.push({
            field: fieldName,
            rule: rule.name,
            message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'error',
            value: data,
          });
        }
      }

      return {
        isValid:
          errors.length === 0 && (strictMode ? warnings.length === 0 : true),
        errors,
        warnings,
        info,
      };
    },
    [enableAsyncValidation, strictMode]
  );

  // Birth data validation rules
  const birthDataRules: ValidationRule<BirthData>[] = useMemo(
    () => [
      {
        name: 'required_fields',
        validator: (data: BirthData) => {
          return !!(
            data &&
            typeof data.year === 'number' &&
            typeof data.month === 'number' &&
            typeof data.day === 'number' &&
            typeof data.hour === 'number' &&
            typeof data.minute === 'number' &&
            typeof data.city === 'string' &&
            data.city.trim().length > 0
          );
        },
        message:
          'All required fields must be provided (year, month, day, hour, minute, city)',
        severity: 'error',
      },
      {
        name: 'valid_year',
        validator: (data: BirthData) => {
          if (!data || typeof data.year !== 'number') return false;
          const currentYear = new Date().getFullYear();
          return data.year >= 1900 && data.year <= currentYear + 1;
        },
        message: 'Year must be between 1900 and current year + 1',
        severity: 'error',
      },
      {
        name: 'valid_month',
        validator: (data: BirthData) => {
          if (!data || typeof data.month !== 'number') return false;
          return data.month >= 1 && data.month <= 12;
        },
        message: 'Month must be between 1 and 12',
        severity: 'error',
      },
      {
        name: 'valid_day',
        validator: (data: BirthData) => {
          if (
            !data ||
            typeof data.day !== 'number' ||
            typeof data.month !== 'number' ||
            typeof data.year !== 'number'
          ) {
            return false;
          }

          // Check day range based on month and year
          const daysInMonth = new Date(data.year, data.month, 0).getDate();
          return data.day >= 1 && data.day <= daysInMonth;
        },
        message: 'Day must be valid for the given month and year',
        severity: 'error',
      },
      {
        name: 'valid_hour',
        validator: (data: BirthData) => {
          if (!data || typeof data.hour !== 'number') return false;
          return data.hour >= 0 && data.hour <= 23;
        },
        message: 'Hour must be between 0 and 23',
        severity: 'error',
      },
      {
        name: 'valid_minute',
        validator: (data: BirthData) => {
          if (!data || typeof data.minute !== 'number') return false;
          return data.minute >= 0 && data.minute <= 59;
        },
        message: 'Minute must be between 0 and 59',
        severity: 'error',
      },
      {
        name: 'valid_coordinates',
        validator: (data: BirthData) => {
          if (!data) return true; // Optional coordinates

          const hasLat = typeof data.lat === 'number';
          const hasLon = typeof data.lon === 'number';

          // Both or neither
          if (hasLat !== hasLon) return false;

          if (hasLat && hasLon) {
            return (
              data.lat! >= -90 &&
              data.lat! <= 90 &&
              data.lon! >= -180 &&
              data.lon! <= 180
            );
          }

          return true;
        },
        message:
          'Coordinates must be valid latitude (-90 to 90) and longitude (-180 to 180)',
        severity: 'warning',
      },
      {
        name: 'city_length',
        validator: (data: BirthData) => {
          if (!data || typeof data.city !== 'string') return false;
          return data.city.trim().length >= 2 && data.city.trim().length <= 100;
        },
        message: 'City name must be between 2 and 100 characters',
        severity: 'error',
      },
      {
        name: 'future_date_warning',
        validator: (data: BirthData) => {
          if (
            !data ||
            typeof data.year !== 'number' ||
            typeof data.month !== 'number' ||
            typeof data.day !== 'number'
          ) {
            return true;
          }

          const birthDate = new Date(data.year, data.month - 1, data.day);
          const today = new Date();
          today.setHours(23, 59, 59, 999); // End of today

          return birthDate <= today;
        },
        message: 'Birth date appears to be in the future',
        severity: 'warning',
      },
      ...customRules.filter(rule => rule.name.startsWith('birth_')),
    ],
    [customRules]
  );

  // Chart data validation rules
  const chartDataRules: ValidationRule<ChartData>[] = useMemo(
    () => [
      {
        name: 'has_planets',
        validator: (data: ChartData) => {
          return !!(
            data?.planets &&
            typeof data.planets === 'object' &&
            Object.keys(data.planets).length > 0
          );
        },
        message: 'Chart data must contain planets information',
        severity: 'error',
      },
      {
        name: 'has_houses',
        validator: (data: ChartData) => {
          return !!(
            data?.houses &&
            Array.isArray(data.houses) &&
            data.houses.length > 0
          );
        },
        message: 'Chart data must contain houses information',
        severity: 'error',
      },
      {
        name: 'valid_planet_data',
        validator: (data: ChartData) => {
          if (!data?.planets) return false;

          return Object.values(data.planets).every((planet: PlanetData) => {
            if (!planet || typeof planet !== 'object') return false;
            return (
              typeof planet.position === 'number' &&
              planet.position >= 0 &&
              planet.position < 360
            );
          });
        },
        message: 'All planets must have valid position data (0-360 degrees)',
        severity: 'error',
      },
      {
        name: 'sufficient_houses',
        validator: (data: ChartData) => {
          if (!data?.houses || !Array.isArray(data.houses)) return false;
          return data.houses.length >= 12;
        },
        message: 'Chart should have at least 12 houses',
        severity: 'warning',
      },
      {
        name: 'has_aspects',
        validator: (data: ChartData) => {
          return !!(data?.aspects && Array.isArray(data.aspects));
        },
        message: 'Chart data should contain aspects information',
        severity: 'info',
      },
      ...customRules.filter(rule => rule.name.startsWith('chart_')),
    ],
    [customRules]
  );

  // Generic validation function
  const validateData = useCallback(
    async <T>(
      data: T,
      rules: ValidationRule<T>[],
      fieldName: string = 'data'
    ): Promise<ValidationResult> => {
      setValidationState(prev => ({
        ...prev,
        isValidating: true,
        validationCount: prev.validationCount + 1,
      }));

      try {
        // Check cache first
        const cacheKey = getCacheKey(data, rules);
        const cachedResult = getCachedResult(cacheKey);

        if (cachedResult) {
          return cachedResult;
        }

        // Perform validation
        const result = await validateWithRules(data, rules, fieldName);

        // Cache result
        setCachedResult(cacheKey, result);

        return result;
      } finally {
        setValidationState(prev => ({
          ...prev,
          isValidating: false,
          lastValidation: Date.now(),
        }));
      }
    },
    [getCacheKey, getCachedResult, setCachedResult, validateWithRules]
  );

  // Specific validation methods
  const validateBirthData = useCallback(
    async (data: BirthData): Promise<ValidationResult> => {
      return validateData(data, birthDataRules, 'birthData');
    },
    [validateData, birthDataRules]
  );

  const validateChartData = useCallback(
    async (data: ChartData): Promise<ValidationResult> => {
      return validateData(data, chartDataRules, 'chartData');
    },
    [validateData, chartDataRules]
  );

  // Progressive validation for forms
  const validateField = useCallback(
    async <T>(
      fieldName: string,
      value: T,
      fieldRules: ValidationRule<T>[]
    ): Promise<ValidationResult> => {
      return validateData(value, fieldRules, fieldName);
    },
    [validateData]
  );

  // Type guards
  const isBirthData = useCallback((data: unknown): data is BirthData => {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;

    return (
      typeof obj.year === 'number' &&
      typeof obj.month === 'number' &&
      typeof obj.day === 'number' &&
      typeof obj.hour === 'number' &&
      typeof obj.minute === 'number' &&
      typeof obj.city === 'string'
    );
  }, []);

  const isChartData = useCallback((data: unknown): data is ChartData => {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;

    return (
      obj.planets !== undefined ||
      obj.houses !== undefined ||
      obj.aspects !== undefined ||
      obj.asteroids !== undefined
    );
  }, []);

  // Cache management
  const clearValidationCache = useCallback((): void => {
    cacheRef.current = {};
  }, []);

  const getCacheStats = useCallback(() => {
    const entries = Object.entries(cacheRef.current);
    const activeEntries = entries.filter(
      ([, value]) => value.expiry > Date.now()
    );
    const expiredEntries = entries.length - activeEntries.length;

    return {
      totalEntries: entries.length,
      activeEntries: activeEntries.length,
      expiredEntries,
      cacheHitRatio:
        validationState.validationCount > 0
          ? (validationState.validationCount - activeEntries.length) /
            validationState.validationCount
          : 0,
    };
  }, [validationState.validationCount]);

  // Validation summary helper
  const getValidationSummary = useCallback(
    (result: ValidationResult): string => {
      const parts = [];

      if (result.errors.length > 0) {
        parts.push(
          `${result.errors.length} error${result.errors.length !== 1 ? 's' : ''}`
        );
      }

      if (result.warnings.length > 0) {
        parts.push(
          `${result.warnings.length} warning${result.warnings.length !== 1 ? 's' : ''}`
        );
      }

      if (result.info.length > 0) {
        parts.push(
          `${result.info.length} info message${result.info.length !== 1 ? 's' : ''}`
        );
      }

      if (parts.length === 0) {
        return 'All validations passed';
      }

      return parts.join(', ');
    },
    []
  );

  return {
    // Core validation methods
    validateData,
    validateBirthData,
    validateChartData,
    validateField,

    // Type guards
    isBirthData,
    isChartData,

    // State
    isValidating: validationState.isValidating,
    lastValidation: validationState.lastValidation,
    validationCount: validationState.validationCount,

    // Cache management
    clearValidationCache,
    getCacheStats,

    // Utilities
    getValidationSummary,

    // Available rules (for custom validation)
    birthDataRules,
    chartDataRules,
  };
}
