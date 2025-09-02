/**
 * Unified Birth Data Types and Converters
 * Provides a strict shared structure for birth data across frontend features.
 */

export interface UnifiedBirthData {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  city?: string;
  lat?: number;
  lon?: number;
  latitude?: number; // Alias for lat (backwards compatibility)
  longitude?: number; // Alias for lon (backwards compatibility)
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

/**
 * Extended Birth Data - Unified interface that combines both text and numeric formats
 * This serves as the primary interface for components that need both formats
 */
export interface ExtendedBirthData extends TextBirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** Normalized latitude */
  latitude: number;
  /** Normalized longitude */
  longitude: number;
  /** Optional timezone identifier (IANA) */
  timezone?: string;
  // Flag to indicate if this came from numeric input (for internal use)
  _isFromNumeric?: boolean;
}

export type AnyBirthInput =
  | UnifiedBirthData
  | TextBirthData
  | ExtendedBirthData;

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
    return (
      value !== null &&
      value !== undefined &&
      typeof value === 'number' &&
      !Number.isNaN(value)
    );
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
  const birthDate = obj['birth_date'];
  const birthTime = obj['birth_time'];

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

export const isExtendedBirthData = (v: unknown): v is ExtendedBirthData => {
  if (v === null || v === undefined || typeof v !== 'object') {
    return false;
  }

  // Type assertion after null check
  const obj = v as Record<string, unknown>;

  // Must have both text format AND numeric format
  const hasTextFormat = 'birth_date' in obj && 'birth_time' in obj;
  const hasNumericFormat = ['year', 'month', 'day', 'hour', 'minute'].every(
    key => key in obj
  );
  const hasRequiredCoordinates = 'latitude' in obj && 'longitude' in obj;

  if (!hasTextFormat || !hasNumericFormat || !hasRequiredCoordinates) {
    return false;
  }

  // Validate text format
  if (!isTextBirthData(obj)) {
    return false;
  }

  // Validate numeric format
  const numericKeys = [
    'year',
    'month',
    'day',
    'hour',
    'minute',
    'latitude',
    'longitude',
  ];
  return numericKeys.every(key => {
    const value = obj[key];
    return (
      value !== null &&
      value !== undefined &&
      typeof value === 'number' &&
      !Number.isNaN(value)
    );
  });
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
  if (
    data['birth_date'] === undefined ||
    data['birth_date'] === null ||
    data['birth_date'] === '' ||
    data['birth_time'] === undefined ||
    data['birth_time'] === null ||
    data['birth_time'] === ''
  ) {
    throw new Error('birth_date and birth_time are required non-empty fields');
  }

  const rawDate = data['birth_date'].trim();
  const rawTime = data['birth_time'].trim();

  // Date validation YYYY-MM-DD
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawDate);
  assert(
    dateMatch !== null && dateMatch !== undefined,
    `Invalid birth_date format: ${rawDate}`
  );
  if (
    dateMatch[1] === undefined ||
    dateMatch[2] === undefined ||
    dateMatch[3] === undefined
  ) {
    throw new Error(`Invalid birth_date capture groups: ${rawDate}`);
  }
  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const day = parseInt(dateMatch[3], 10);
  assert(month >= 1 && month <= 12, `Invalid month: ${month}`);
  assert(day >= 1 && day <= 31, `Invalid day: ${day}`);
  // Use Date object to verify actual calendar validity (handles leap years)
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  assert(
    dateObj.getUTCFullYear() === year &&
      dateObj.getUTCMonth() === month - 1 &&
      dateObj.getUTCDate() === day,
    'Invalid calendar date'
  );

  // Time validation HH:MM(:SS)?
  const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(rawTime);
  assert(
    timeMatch !== null && timeMatch !== undefined,
    `Invalid birth_time format: ${rawTime}`
  );
  if (timeMatch[1] === undefined || timeMatch[2] === undefined) {
    throw new Error(`Invalid birth_time capture groups: ${rawTime}`);
  }
  const hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);
  assert(hour >= 0 && hour <= 23, `Invalid hour: ${hour}`);
  assert(minute >= 0 && minute <= 59, `Invalid minute: ${minute}`);

  const extendedData = data as Record<string, unknown>;
  const fallbackLat =
    typeof extendedData['lat'] === 'number' ? extendedData['lat'] : undefined;
  const fallbackLon =
    typeof extendedData['lon'] === 'number' ? extendedData['lon'] : undefined;

  const result: UnifiedBirthData = {
    year,
    month,
    day,
    hour,
    minute,
  } as UnifiedBirthData;
  if (
    data.city !== undefined &&
    data.city !== null &&
    data.city.trim() !== ''
  ) {
    result.city = data.city.trim();
  }
  const latVal = data.latitude ?? fallbackLat;
  if (typeof latVal === 'number') {
    result.lat = latVal;
    result.latitude = latVal; // Also set the alias
  }
  const lonVal = data.longitude ?? fallbackLon;
  if (typeof lonVal === 'number') {
    result.lon = lonVal;
    result.longitude = lonVal; // Also set the alias
  }
  if (
    data.timezone !== undefined &&
    data.timezone !== null &&
    data.timezone.trim() !== ''
  ) {
    result.timezone = data.timezone.trim();
  }
  return result;
}

/**
 * Convert TextBirthData to ExtendedBirthData format with both text and numeric fields
 */
export function textToExtendedBirthData(
  data: TextBirthData
): ExtendedBirthData {
  const unified = parseTextBirthData(data);

  const result: ExtendedBirthData = {
    ...data, // Preserve original text format
    year: unified.year,
    month: unified.month,
    day: unified.day,
    hour: unified.hour,
    minute: unified.minute,
    latitude: unified.latitude ?? data.latitude ?? 0,
    longitude: unified.longitude ?? data.longitude ?? 0,
  };

  if (unified.timezone) result.timezone = unified.timezone;
  if (unified.city) result.city = unified.city;

  return result;
}

/**
 * Convert UnifiedBirthData to ExtendedBirthData format
 */
export function unifiedToExtendedBirthData(
  data: UnifiedBirthData
): ExtendedBirthData {
  const textData = toTextBirthData(data);

  const result: ExtendedBirthData = {
    ...textData,
    year: data.year,
    month: data.month,
    day: data.day,
    hour: data.hour,
    minute: data.minute,
    latitude: data.latitude ?? data.lat ?? 0,
    longitude: data.longitude ?? data.lon ?? 0,
  };

  if (data.timezone) result.timezone = data.timezone;
  if (data.city) result.city = data.city;

  return result;
}

export function toUnifiedBirthData(input: AnyBirthInput): UnifiedBirthData {
  if (input === null || input === undefined) {
    throw new Error('Birth data is null or undefined');
  }
  if (isExtendedBirthData(input)) {
    // ExtendedBirthData already has numeric fields, just extract them
    const result: UnifiedBirthData = {
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      minute: input.minute,
    };
    if (input.city) result.city = input.city;
    if (input.latitude !== undefined) {
      result.lat = input.latitude;
      result.latitude = input.latitude;
    }
    if (input.longitude !== undefined) {
      result.lon = input.longitude;
      result.longitude = input.longitude;
    }
    if (input.timezone) result.timezone = input.timezone;
    return result;
  }
  if (isUnifiedBirthData(input)) {
    return input;
  }
  if (isTextBirthData(input)) {
    return parseTextBirthData(input);
  }
  throw new Error('Unsupported birth data shape');
}

/**
 * Convert any birth data input to ExtendedBirthData format (recommended for components)
 */
export function toExtendedBirthData(input: AnyBirthInput): ExtendedBirthData {
  if (input === null || input === undefined) {
    throw new Error('Birth data is null or undefined');
  }
  if (isExtendedBirthData(input)) {
    return input;
  }
  if (isUnifiedBirthData(input)) {
    return unifiedToExtendedBirthData(input);
  }
  if (isTextBirthData(input)) {
    return textToExtendedBirthData(input);
  }
  throw new Error('Unsupported birth data shape');
}

// Backwards compatibility exports
export type ChartBirthData = TextBirthData;

/** Result type for safe parsing */
export interface SafeParseSuccess {
  success: true;
  data: UnifiedBirthData;
}
export interface SafeParseFailure {
  success: false;
  error: Error;
}
export type SafeParseResult = SafeParseSuccess | SafeParseFailure;

/**
 * Convert UnifiedBirthData to TextBirthData format
 */
export function toTextBirthData(data: UnifiedBirthData): TextBirthData {
  const birth_date = `${data.year}-${String(data.month).padStart(2, '0')}-${String(data.day).padStart(2, '0')}`;
  const birth_time = `${String(data.hour).padStart(2, '0')}:${String(data.minute).padStart(2, '0')}`;

  const result: TextBirthData = {
    birth_date,
    birth_time,
  };

  if (data.city) result.city = data.city;
  if (data.lat !== undefined) result.latitude = data.lat;
  if (data.lon !== undefined) result.longitude = data.lon;
  if (data.timezone) result.timezone = data.timezone;

  return result;
}

/**
 * Non-throwing variant returning a discriminated union.
 */
export function safeParseTextBirthData(data: TextBirthData): SafeParseResult {
  if (data === null || data === undefined) {
    return {
      success: false,
      error: new Error('Birth data is null or undefined'),
    };
  }
  try {
    return { success: true, data: parseTextBirthData(data) };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e : new Error(String(e)),
    };
  }
}
