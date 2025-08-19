/**
 * Unified Birth Data Types and Converters
 * Provides a strict shared structure for birth data across frontend features.
 */

export interface UnifiedBirthData {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
  hour: number;  // 0-23
  minute: number; // 0-59
  city?: string;
  lat?: number;
  lon?: number;
  timezone?: string; // IANA TZ name preferred
  /** Allow light extension without defeating strictness */
  [extra: string]: unknown;
}

// Legacy textual form used in some UI flows
export interface TextBirthData {
  birth_date: string; // YYYY-MM-DD
  birth_time: string; // HH:MM(:SS)?
  latitude?: number;
  longitude?: number;
  timezone?: string;
  city?: string;
  [extra: string]: unknown;
}

export type AnyBirthInput = UnifiedBirthData | TextBirthData;

export const isUnifiedBirthData = (v: unknown): v is UnifiedBirthData => {
  if (v === null || v === undefined || typeof v !== 'object') {
    return false;
  }
  
  // Type assertion after null check
  const obj = v as Record<string, unknown>;
  const requiredKeys = ['year', 'month', 'day', 'hour', 'minute'];
  
  // First ensure all required keys exist
  if (!requiredKeys.every(key => key in obj)) {
    return false;
  }
  
  // Then check their values are valid numbers
  return requiredKeys.every(key => {
    const value = obj[key];
    return value !== null && value !== undefined && typeof value === 'number' && !Number.isNaN(value);
  });
};

export const isTextBirthData = (v: unknown): v is TextBirthData => {
  if (v === null || v === undefined || typeof v !== 'object') {
    return false;
  }
  
  // Type assertion after null check
  const obj = v as Record<string, unknown>;
  
  // First ensure required properties exist
  if (!('birth_date' in obj) || !('birth_time' in obj)) {
    return false;
  }
  
  // Then check if they're valid strings
  const birthDate = obj.birth_date;
  const birthTime = obj.birth_time;
  
  return (
    birthDate !== null && 
    birthDate !== undefined && 
    typeof birthDate === 'string' && 
    birthDate !== '' &&
    birthTime !== null && 
    birthTime !== undefined && 
    typeof birthTime === 'string' && 
    birthTime !== ''
  );
};

function assert(condition: unknown, message: string): asserts condition {
  if (condition === null || condition === undefined || condition === false) {
    throw new Error(message);
  }
}

/**
 * Parse legacy TextBirthData into UnifiedBirthData with validation.
 * Accepts birth_time with optional seconds (HH:MM or HH:MM:SS) and trims whitespace.
 * Throws descriptive errors for invalid formats or out-of-range values.
 */
export function parseTextBirthData(data: TextBirthData): UnifiedBirthData {
  // Start with explicit existence and type checks on required fields
  if (data.birth_date === undefined || data.birth_date === null || data.birth_date === '' ||
      data.birth_time === undefined || data.birth_time === null || data.birth_time === '') {
    throw new Error('birth_date and birth_time are required non-empty fields');
  }

  const rawDate = data.birth_date.trim();
  const rawTime = data.birth_time.trim();

  // Date validation YYYY-MM-DD
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawDate);
  assert(dateMatch !== null && dateMatch !== undefined, `Invalid birth_date format: ${rawDate}`);
  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const day = parseInt(dateMatch[3], 10);
  assert(month >= 1 && month <= 12, `Invalid month: ${month}`);
  assert(day >= 1 && day <= 31, `Invalid day: ${day}`);
  // Use Date object to verify actual calendar validity (handles leap years)
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  assert(dateObj.getUTCFullYear() === year && dateObj.getUTCMonth() === month - 1 && dateObj.getUTCDate() === day, 'Invalid calendar date');

  // Time validation HH:MM(:SS)?
  const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(rawTime);
  assert(timeMatch !== null && timeMatch !== undefined, `Invalid birth_time format: ${rawTime}`);
  const hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);
  assert(hour >= 0 && hour <= 23, `Invalid hour: ${hour}`);
  assert(minute >= 0 && minute <= 59, `Invalid minute: ${minute}`);

  const extendedData = data as Record<string, unknown>;
  const fallbackLat = typeof extendedData.lat === 'number' ? extendedData.lat : undefined;
  const fallbackLon = typeof extendedData.lon === 'number' ? extendedData.lon : undefined;

  return {
    year,
    month,
    day,
    hour,
    minute,
    city: data.city === undefined || data.city === null ? undefined : data.city.trim(),
    lat: data.latitude ?? fallbackLat,
    lon: data.longitude ?? fallbackLon,
    timezone: data.timezone === undefined || data.timezone === null ? undefined : data.timezone.trim()
  };
}

export function toUnifiedBirthData(input: AnyBirthInput): UnifiedBirthData {
  if (input === null || input === undefined) {
    throw new Error('Birth data is null or undefined');
  }
  if (isUnifiedBirthData(input)) {
    return input;
  }
  if (isTextBirthData(input)) {
    return parseTextBirthData(input);
  }
  throw new Error('Unsupported birth data shape');
}

// Backwards compatibility exports
export type ChartBirthData = UnifiedBirthData;

/** Result type for safe parsing */
export interface SafeParseSuccess { success: true; data: UnifiedBirthData; }
export interface SafeParseFailure { success: false; error: Error; }
export type SafeParseResult = SafeParseSuccess | SafeParseFailure;

/**
 * Non-throwing variant returning a discriminated union.
 */
export function safeParseTextBirthData(data: TextBirthData): SafeParseResult {
  if (data === null || data === undefined) {
    return { success: false, error: new Error('Birth data is null or undefined') };
  }
  try {
    return { success: true, data: parseTextBirthData(data) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}
