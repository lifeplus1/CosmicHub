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
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return ['year','month','day','hour','minute'].every(k => typeof obj[k] === 'number');
};

export const isTextBirthData = (v: unknown): v is TextBirthData => {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return typeof obj.birth_date === 'string';
};

function assert(condition: unknown, message: string): asserts condition {
  if (condition === false || condition === null || condition === undefined) {
    throw new Error(message);
  }
}

/**
 * Parse legacy TextBirthData into UnifiedBirthData with validation.
 * Accepts birth_time with optional seconds (HH:MM or HH:MM:SS) and trims whitespace.
 * Throws descriptive errors for invalid formats or out-of-range values.
 */
export function parseTextBirthData(data: TextBirthData): UnifiedBirthData {
  const rawDate = (data.birth_date || '').trim();
  const rawTime = (data.birth_time || '').trim();

  // Date validation YYYY-MM-DD
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawDate);
  assert(dateMatch, `Invalid birth_date format: ${rawDate}`);
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
  assert(timeMatch, `Invalid birth_time format: ${rawTime}`);
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
    city: data.city?.trim(),
    lat: data.latitude ?? fallbackLat,
    lon: data.longitude ?? fallbackLon,
    timezone: data.timezone?.trim()
  };
}

export function toUnifiedBirthData(input: AnyBirthInput): UnifiedBirthData {
  if (isUnifiedBirthData(input)) return input;
  if (isTextBirthData(input)) return parseTextBirthData(input);
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
  try {
    return { success: true, data: parseTextBirthData(data) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}
