// Type Guards Framework
// Advanced type validation and runtime type checking utilities

// Base type guard interface
export interface TypeGuard<T> {
  (value: unknown): value is T;
  typeName: string;
}

// Primitive type guards
export const isString: TypeGuard<string> = (value: unknown): value is string => {
  return typeof value === 'string';
};
isString.typeName = 'string';

export const isNumber: TypeGuard<number> = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};
isNumber.typeName = 'number';

export const isBoolean: TypeGuard<boolean> = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};
isBoolean.typeName = 'boolean';

export const isUndefined: TypeGuard<undefined> = (value: unknown): value is undefined => {
  return value === undefined;
};
isUndefined.typeName = 'undefined';

export const isNull: TypeGuard<null> = (value: unknown): value is null => {
  return value === null;
};
isNull.typeName = 'null';

// Object type guards
export const isObject: TypeGuard<Record<string, unknown>> = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};
isObject.typeName = 'object';

export const isArray: TypeGuard<unknown[]> = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};
isArray.typeName = 'array';

// Advanced type guards with validation
export const isNonEmptyString: TypeGuard<string> = (value: unknown): value is string => {
  return isString(value) && value.trim().length > 0;
};
isNonEmptyString.typeName = 'non-empty string';

export const isPositiveNumber: TypeGuard<number> = (value: unknown): value is number => {
  return isNumber(value) && value > 0;
};
isPositiveNumber.typeName = 'positive number';

export const isInteger: TypeGuard<number> = (value: unknown): value is number => {
  return isNumber(value) && Number.isInteger(value);
};
isInteger.typeName = 'integer';

// API response type guards
export interface APIResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
  timestamp: string;
}

export const isAPIResponse = <T>(
  value: unknown,
  dataGuard?: TypeGuard<T>
): value is APIResponse<T> => {
  if (!isObject(value)) return false;

  const obj = value;
  if (!isBoolean(obj.success) || !isString(obj.timestamp)) return false;

  if (obj.error !== undefined && !isString(obj.error)) return false;
  if (obj.data !== undefined && dataGuard && !dataGuard(obj.data)) return false;

  return true;
};

// Chart data type guards
export interface ChartData {
  planets: Array<{
    name: string;
    longitude: number;
    latitude: number;
    speed: number;
  }>;
  houses: Array<{
    number: number;
    longitude: number;
  }>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }>;
}

export const isChartData: TypeGuard<ChartData> = (value: unknown): value is ChartData => {
  if (!isObject(value)) return false;

  const obj = value;

  // Validate planets
  if (!isArray(obj.planets)) return false;
  for (const planet of obj.planets) {
    if (!isObject(planet)) return false;
    const p = planet;
    if (!isString(p.name) || !isNumber(p.longitude) || !isNumber(p.latitude) || !isNumber(p.speed)) {
      return false;
    }
  }

  // Validate houses
  if (!isArray(obj.houses)) return false;
  for (const house of obj.houses) {
    if (!isObject(house)) return false;
    const h = house;
    if (!isNumber(h.number) || !isNumber(h.longitude)) {
      return false;
    }
  }

  // Validate aspects
  if (!isArray(obj.aspects)) return false;
  for (const aspect of obj.aspects) {
    if (!isObject(aspect)) return false;
    const a = aspect;
    if (!isString(a.planet1) || !isString(a.planet2) || !isString(a.aspect) || !isNumber(a.orb)) {
      return false;
    }
  }

  return true;
};
isChartData.typeName = 'ChartData';

// Transit prediction type guards
export interface TransitPrediction {
  id: string;
  transitType: string;
  exactDate: string;
  theme: string;
  influence: 'minor' | 'moderate' | 'major';
  opportunities: string[];
  recommendations: string[];
  confidence: number;
  duration: {
    start: string;
    end: string;
  };
}

export const isTransitPrediction: TypeGuard<TransitPrediction> = (value: unknown): value is TransitPrediction => {
  if (!isObject(value)) return false;

  const obj = value;

  return (
    isString(obj.id) &&
    isString(obj.transitType) &&
    isString(obj.exactDate) &&
    isString(obj.theme) &&
    (obj.influence === 'minor' || obj.influence === 'moderate' || obj.influence === 'major') &&
    isArray(obj.opportunities) &&
    obj.opportunities.every(isString) &&
    isArray(obj.recommendations) &&
    obj.recommendations.every(isString) &&
    isNumber(obj.confidence) &&
    isObject(obj.duration) &&
    isString(obj.duration.start) &&
    isString(obj.duration.end)
  );
};
isTransitPrediction.typeName = 'TransitPrediction';

// Validation result interface
export interface ValidationResult<T> {
  isValid: boolean;
  value: T | null;
  errors: string[];
}

// Advanced validation function
export const validateWithTypeGuard = <T>(
  value: unknown,
  guard: TypeGuard<T>,
  fieldName = 'value'
): ValidationResult<T> => {
  const errors: string[] = [];

  if (!guard(value)) {
    errors.push(`Invalid ${fieldName}: expected ${guard.typeName}, got ${typeof value}`);
    return { isValid: false, value: null, errors };
  }

  return { isValid: true, value, errors: [] };
};

// Batch validation for multiple fields
export const validateObject = <T extends Record<string, unknown>>(
  obj: unknown,
  schema: Record<keyof T, TypeGuard<unknown>>
): ValidationResult<T> => {
  const errors: string[] = [];

  if (!isObject(obj)) {
    return { isValid: false, value: null, errors: ['Input must be an object'] };
  }

  const validatedObj = {} as T;

  for (const [key, guard] of Object.entries(schema)) {
    const fieldValue = obj[key];
    const result = validateWithTypeGuard(fieldValue, guard, key);

    if (!result.isValid) {
      errors.push(...result.errors);
    } else {
      validatedObj[key as keyof T] = result.value as T[keyof T];
    }
  }

  return errors.length === 0
    ? { isValid: true, value: validatedObj, errors: [] }
    : { isValid: false, value: null, errors };
};

// Safe property access with type guards
export const safeGet = <T>(
  obj: unknown,
  key: string,
  guard: TypeGuard<T>
): T | null => {
  if (!isObject(obj)) return null;

  const value = obj[key];
  return guard(value) ? value : null;
};

// Array validation
export const validateArray = <T>(
  arr: unknown,
  itemGuard: TypeGuard<T>
): ValidationResult<T[]> => {
  if (!isArray(arr)) {
    return { isValid: false, value: null, errors: ['Input must be an array'] };
  }

  const errors: string[] = [];
  const validatedItems: T[] = [];

  for (let i = 0; i < arr.length; i++) {
    const result = validateWithTypeGuard(arr[i], itemGuard, `item[${i}]`);
    if (result.isValid && result.value !== null) {
      validatedItems.push(result.value);
    } else {
      errors.push(...result.errors);
    }
  }

  return errors.length === 0
    ? { isValid: true, value: validatedItems, errors: [] }
    : { isValid: false, value: null, errors };
};
