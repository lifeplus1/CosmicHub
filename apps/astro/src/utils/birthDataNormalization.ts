/**
 * Shared birth data normalization utilities.
 * Supports both numeric (year/month/day/hour/minute) and string (birth_date/birth_time) variants.
 */

// Flexible incoming shape (subset of fields accepted from various sources)
export interface AnyIncomingBirthData {
  year?: number; month?: number; day?: number; hour?: number; minute?: number;
  birth_date?: string; birth_time?: string;
  city?: string; location?: string;
  latitude?: number; longitude?: number; lat?: number; lon?: number;
  timezone?: string;
  [key: string]: unknown;
}

export interface NormalizedNumericBirthData {
  year: number; month: number; day: number; hour: number; minute: number;
  city: string; lat: number; lon: number; timezone: string;
}

/**
 * Extract a fully numeric birth data representation from multiple possible input formats.
 * Returns null when insufficient information is available.
 */
export function extractNumericBirthData(bd: AnyIncomingBirthData | null | undefined): NormalizedNumericBirthData | null {
  if (!bd || typeof bd !== 'object') return null;

  // Case 1: Already numeric variant (must at least have year/month/day)
  if (typeof bd.year === 'number' && typeof bd.month === 'number' && typeof bd.day === 'number') {
    return {
      year: bd.year,
      month: bd.month,
      day: bd.day,
      hour: typeof bd.hour === 'number' ? bd.hour : 12,
      minute: typeof bd.minute === 'number' ? bd.minute : 0,
      city: (bd.city as string) ?? (bd.location as string) ?? 'Unknown',
      lat: (bd.latitude as number) ?? (bd.lat as number) ?? 0,
      lon: (bd.longitude as number) ?? (bd.lon as number) ?? 0,
      timezone: (bd.timezone as string) ?? 'UTC',
    };
  }

  // Case 2: birth_date / birth_time variant (ISO-like strings)
  if (typeof bd.birth_date === 'string') {
    const dateParts = bd.birth_date.split('-').map(n => Number(n));
    if (dateParts.length === 3 && dateParts.every(n => Number.isFinite(n))) {
      const [y, m, d] = dateParts as [number, number, number];
      let h = 12; let min = 0;
      if (typeof bd.birth_time === 'string') {
        const timeParts = bd.birth_time.split(':').map(n => Number(n));
        if (timeParts.length >= 2 && timeParts.every(n => Number.isFinite(n))) {
          [h, min] = timeParts as [number, number];
        }
      }
      return {
        year: y, month: m, day: d, hour: h, minute: min,
        city: (bd.city as string) ?? (bd.location as string) ?? 'Unknown',
        lat: (bd.latitude as number) ?? (bd.lat as number) ?? 0,
        lon: (bd.longitude as number) ?? (bd.lon as number) ?? 0,
        timezone: (bd.timezone as string) ?? 'UTC',
      };
    }
  }

  return null;
}

/** Convenience helper to transform numeric data back into library birth_date / birth_time strings */
export function toLibraryBirthStrings(data: NormalizedNumericBirthData | null | undefined): { birth_date: string; birth_time: string } | null {
  if (!data) return null;
  const { year, month, day, hour, minute } = data;
  const birth_date = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const birth_time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return { birth_date, birth_time };
}
