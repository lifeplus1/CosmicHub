import type { UnifiedBirthData } from '@cosmichub/types';

export interface ChartBirthData extends UnifiedBirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
}

// Type guard for ChartBirthData
export function isChartBirthData(value: unknown): value is ChartBirthData {
  if (value === null || typeof value !== 'object') return false;

  const data = value as Partial<ChartBirthData>;
  return (
    typeof data.year === 'number' &&
    typeof data.month === 'number' &&
    typeof data.day === 'number' &&
    typeof data.hour === 'number' &&
    typeof data.minute === 'number' &&
    typeof data.city === 'string' &&
    typeof data.lat === 'number' &&
    typeof data.lon === 'number' &&
    typeof data.timezone === 'string' &&
    data.month >= 1 &&
    data.month <= 12 &&
    data.day >= 1 &&
    data.day <= 31 &&
    data.hour >= 0 &&
    data.hour <= 23 &&
    data.minute >= 0 &&
    data.minute <= 59
  );
}

export interface StoredBirthData {
  date: string;
  time: string;
  location: string;
  lat?: number;
  lon?: number;
  timezone?: string;
}

// Type guard for StoredBirthData
export function isStoredBirthData(value: unknown): value is StoredBirthData {
  if (value === null || typeof value !== 'object') return false;

  const data = value as Partial<StoredBirthData>;
  return (
    typeof data.date === 'string' &&
    typeof data.time === 'string' &&
    typeof data.location === 'string' &&
    (data.lat === undefined || typeof data.lat === 'number') &&
    (data.lon === undefined || typeof data.lon === 'number') &&
    (data.timezone === undefined || typeof data.timezone === 'string')
  );
}
