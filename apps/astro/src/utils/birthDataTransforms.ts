import type { ChartBirthData, ExtendedBirthData } from '@cosmichub/types';

// Type guard to check if data has text format properties
function isTextBirthData(data: unknown): data is ChartBirthData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'birth_date' in data &&
    'birth_time' in data
  );
}

// Type guard to check if data has numeric format properties
function _hasNumericBirthData(data: unknown): data is ExtendedBirthData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'year' in data &&
    'month' in data &&
    'day' in data
  );
}

// Simple memoization for toCanonicalBirthData to prevent unnecessary re-computations
const canonicalCache = new WeakMap<
  ExtendedBirthData | ChartBirthData,
  ChartBirthData
>();

// Convert any ExtendedBirthData or already-canonical ChartBirthData into ChartBirthData
export function toCanonicalBirthData(
  b: ExtendedBirthData | ChartBirthData
): ChartBirthData {
  // Check cache first for object stability
  if (canonicalCache.has(b)) {
    return canonicalCache.get(b)!;
  }

  let canonical: ChartBirthData;

  if (isTextBirthData(b)) {
    // Already in canonical text format
    canonical = {
      birth_date: b.birth_date,
      birth_time: b.birth_time,
      latitude: b.latitude,
      longitude: b.longitude,
      city: b.city,
      timezone: b.timezone,
    };
  } else {
    // Convert from ExtendedBirthData (numeric) to ChartBirthData (text)
    const extendedData = b as ExtendedBirthData & { lat?: number; lon?: number };
    const year = extendedData.year ?? 0;
    const month = extendedData.month ?? 1;
    const day = extendedData.day ?? 1;
    const hour = extendedData.hour ?? 0;
    const minute = extendedData.minute ?? 0;

    canonical = {
      birth_date: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      birth_time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      latitude: extendedData.lat ?? extendedData.latitude ?? 0,
      longitude: extendedData.lon ?? extendedData.longitude ?? 0,
      city: extendedData.city,
      timezone: extendedData.timezone,
    };
  }

  // Cache the result for future calls with same input
  canonicalCache.set(b, canonical);
  return canonical;
}

export function hasCompleteCanonicalBirthData(
  b: Partial<ChartBirthData>
): b is ChartBirthData {
  return (
    typeof b.birth_date === 'string' &&
    typeof b.birth_time === 'string' &&
    typeof b.latitude === 'number' &&
    typeof b.longitude === 'number'
  );
}

// ---------------------------
// URL Parameter Parsing
// ---------------------------
export interface RawNumericBirthData {
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

export function isRawNumericBirthData(
  data: unknown
): data is RawNumericBirthData {
  if (data === null || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  return (
    [o.year, o.month, o.day, o.hour, o.minute].every(v =>
      Number.isInteger(v)
    ) && typeof o.city === 'string'
  );
}

export function parseBirthParams(
  sp: URLSearchParams
): RawNumericBirthData | null {
  const required = ['year', 'month', 'day', 'hour', 'minute', 'city'] as const;
  for (const key of required) {
    const v = sp.get(key);
    if (!v) return null;
  }
  const year = Number.parseInt(sp.get('year')!, 10);
  const month = Number.parseInt(sp.get('month')!, 10);
  const day = Number.parseInt(sp.get('day')!, 10);
  const hour = Number.parseInt(sp.get('hour')!, 10);
  const minute = Number.parseInt(sp.get('minute')!, 10);
  const city = sp.get('city')!;
  const latRaw = sp.get('lat');
  const lonRaw = sp.get('lon');
  const timezone = sp.get('timezone') ?? 'UTC';
  const lat = latRaw !== null ? Number.parseFloat(latRaw) : undefined;
  const lon = lonRaw !== null ? Number.parseFloat(lonRaw) : undefined;
  const candidate: RawNumericBirthData = {
    year,
    month,
    day,
    hour,
    minute,
    city,
    lat,
    lon,
    timezone,
  };
  return isRawNumericBirthData(candidate) ? candidate : null;
}
