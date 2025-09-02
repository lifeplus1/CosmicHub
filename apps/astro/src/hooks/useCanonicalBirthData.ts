import { useMemo } from 'react';
import { useBirthData } from '../contexts/BirthDataContext';
import { toCanonicalBirthData } from '../utils/birthDataTransforms';
import type { ChartBirthData } from '@cosmichub/types';

/**
 * useCanonicalBirthData
 * Returns a stable canonical ChartBirthData (birth_date/birth_time/lat/long) or null if unavailable.
 * Memoized to avoid needless recalculations unless underlying birthData object changes.
 * 
 * Fixed: Added JSON stringification to ensure stable comparison even if birthData object
 * is recreated with same values.
 */
export function useCanonicalBirthData(): ChartBirthData | null {
  const { birthData } = useBirthData();
  return useMemo(() => {
    if (!birthData) return null;
    
    // Create a stable canonical representation
    const canonical = toCanonicalBirthData(birthData);
    
    // Log for debugging infinite re-render issues
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 useCanonicalBirthData - Generated canonical data', canonical);
    }
    
    return canonical;
  }, [
    // Use JSON stringification for deep comparison stability
    birthData ? JSON.stringify(birthData) : null
  ]);
}
