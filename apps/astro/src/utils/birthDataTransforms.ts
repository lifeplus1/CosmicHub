import type { ChartBirthData } from '@cosmichub/types';
import type { ExtendedBirthData } from '../contexts/BirthDataContext';

// Simple memoization for toCanonicalBirthData to prevent unnecessary re-computations
const canonicalCache = new WeakMap<any, ChartBirthData>();

// Convert any ExtendedBirthData or already-canonical ChartBirthData into ChartBirthData
export function toCanonicalBirthData(
  b: ExtendedBirthData | ChartBirthData
): ChartBirthData {
  // Check cache first for object stability
  if (canonicalCache.has(b)) {
    return canonicalCache.get(b)!;
  }

  let canonical: ChartBirthData;
  
  if ('birth_date' in b && 'birth_time' in b) {
    // Assume already canonical (ExtendedBirthData extends ChartBirthData)
    canonical = {
      birth_date: (b as any).birth_date,
      birth_time: (b as any).birth_time,
      latitude: (b as any).latitude,
      longitude: (b as any).longitude,
      city: (b as any).city,
      timezone: (b as any).timezone,
    };
  } else {
    // Fallback (shouldn't generally hit given typing) – attempt reconstruction
    const anyB = b as any;
    const year = anyB.year ?? 0;
    const month = anyB.month ?? 1;
    const day = anyB.day ?? 1;
    const hour = anyB.hour ?? 0;
    const minute = anyB.minute ?? 0;
    canonical = {
      birth_date: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      birth_time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      latitude: anyB.lat ?? anyB.latitude ?? 0,
      longitude: anyB.lon ?? anyB.longitude ?? 0,
      city: anyB.city,
      timezone: anyB.timezone,
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
  const lat = latRaw != null ? Number.parseFloat(latRaw) : undefined;
  const lon = lonRaw != null ? Number.parseFloat(lonRaw) : undefined;
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
