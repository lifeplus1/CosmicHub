import { useMemo } from 'react';
import { useBirthData } from '../contexts/BirthDataContext';
import { toCanonicalBirthData } from '../utils/birthDataTransforms';
import type { ChartBirthData } from '@cosmichub/types';

/**
 * useCanonicalBirthData
 * Returns a stable canonical ChartBirthData (birth_date/birth_time/lat/long) or null if unavailable.
 * Memoized to avoid needless recalculations unless underlying birthData object changes.
 */
export function useCanonicalBirthData(): ChartBirthData | null {
  const { birthData } = useBirthData();
  return useMemo(() => (birthData ? toCanonicalBirthData(birthData) : null), [birthData]);
}
