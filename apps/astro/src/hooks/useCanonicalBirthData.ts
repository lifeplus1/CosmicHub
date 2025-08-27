import { useMemo } from 'react';
import { useBirthData } from '../contexts/BirthDataContext';
import { toCanonicalBirthData } from '../utils/birthDataTransforms';
import type { ChartBirthData } from '@cosmichub/types';

/**
 * useCanonicalBirthData
 * Returns a stable canonical ChartBirthData (birth_date/birth_time/lat/long) or null if unavailable.
 * Memoized to avoid needless recalculations unless underlying birthData object changes.
 */
import { useContext } from 'react';
import { BirthDataContext } from '../contexts/BirthDataContext';

// Define ChartBirthData to match TextBirthData from @cosmichub/types
interface ChartBirthData {
  birth_date: string;
  birth_time: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  city?: string;
  [extra: string]: unknown;
}

export function useCanonicalBirthData(): ChartBirthData | null {
  const context = useContext(BirthDataContext);

  if (!context) {
    throw new Error('useCanonicalBirthData must be used within a BirthDataProvider');
  }

  const { birthData } = context;

  if (!birthData) {
    return null;
  }

  // Convert ExtendedBirthData to ChartBirthData format
  return {
    birth_date: birthData.birth_date,
    birth_time: birthData.birth_time,
    latitude: birthData.latitude,
    longitude: birthData.longitude,
    timezone: birthData.timezone,
    city: birthData.city,
  };
}
