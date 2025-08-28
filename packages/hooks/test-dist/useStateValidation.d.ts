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
export interface ValidationRule<T = any> {
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
  value?: any;
}
export interface ValidationCache {
  [key: string]: {
    result: ValidationResult;
    timestamp: number;
    expiry: number;
  };
}
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
export interface ChartData {
  planets?: Record<string, any>;
  houses?: any[];
  aspects?: any[];
  asteroids?: Record<string, any>;
  angles?: Record<string, any>;
}
export interface UseStateValidationOptions {
  enableCache?: boolean;
  cacheExpiry?: number;
  enableAsyncValidation?: boolean;
  strictMode?: boolean;
  customRules?: ValidationRule[];
}
/**
 * Comprehensive State Validation Hook
 */
export declare function useStateValidation(
  options?: UseStateValidationOptions
): {
  validateData: <T>(
    data: T,
    rules: ValidationRule<T>[],
    fieldName?: string
  ) => Promise<ValidationResult>;
  validateBirthData: (data: BirthData) => Promise<ValidationResult>;
  validateChartData: (data: ChartData) => Promise<ValidationResult>;
  validateField: <T>(
    fieldName: string,
    value: T,
    fieldRules: ValidationRule<T>[]
  ) => Promise<ValidationResult>;
  isBirthData: (data: unknown) => data is BirthData;
  isChartData: (data: unknown) => data is ChartData;
  isValidating: boolean;
  lastValidation: number;
  validationCount: number;
  clearValidationCache: () => void;
  getCacheStats: () => {
    totalEntries: number;
    activeEntries: number;
    expiredEntries: number;
    cacheHitRatio: number;
  };
  getValidationSummary: (result: ValidationResult) => string;
  birthDataRules: ValidationRule<BirthData>[];
  chartDataRules: ValidationRule<ChartData>[];
};
