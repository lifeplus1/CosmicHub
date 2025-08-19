import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ChartBirthData } from '@cosmichub/types';

interface BirthDataContextType {
  birthData: ChartBirthData | null;
  setBirthData: (data: ChartBirthData | null) => void;
  clearBirthData: () => void;
  isDataValid: boolean;
  lastUpdated: number | null;
}

const BirthDataContext = createContext<BirthDataContextType | undefined>(undefined);

interface BirthDataProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'cosmichub_birth_data';

export const BirthDataProvider: React.FC<BirthDataProviderProps> = ({ children }) => {
  // Initialize with data from localStorage
  const [birthData, setBirthDataState] = useState<ChartBirthData | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null && stored !== '') {
        const parsed = JSON.parse(stored) as unknown;
        // Validate the data structure
        if (
          parsed !== null && 
          typeof parsed === 'object' && 
          parsed !== null &&
          'year' in parsed && typeof (parsed as Record<string, unknown>).year === 'number' && 
          'month' in parsed && typeof (parsed as Record<string, unknown>).month === 'number' && 
          'day' in parsed && typeof (parsed as Record<string, unknown>).day === 'number'
        ) {
          return parsed as ChartBirthData;
        }
      }
    } catch (error) {
      // Using a type-safe approach for error logging
      const errorMessage = error instanceof Error ? error.message : String(error);
      // eslint-disable-next-line no-console
      console.warn('Failed to parse stored birth data:', errorMessage);
    }
    return null;
  });

  const [lastUpdated, setLastUpdated] = useState<number | null>(
    birthData ? Date.now() : null
  );

  const setBirthData = useCallback((data: ChartBirthData | null) => {
    setBirthDataState(data);
    setLastUpdated(Date.now());
    
    if (data !== null) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        // Log removed for linting compliance
      } catch (error) {
        // Log retained for error case but made type-safe
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Using a safer logging approach that satisfies ESLint
        // eslint-disable-next-line no-console
        console.error('❌ Failed to save birth data:', errorMessage);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      // Log removed for linting compliance
    }
  }, []);

  const clearBirthData = useCallback(() => {
    setBirthData(null);
  }, [setBirthData]);

  const isDataValid = Boolean(
    birthData !== null &&
    birthData.year > 1900 && birthData.year < 2100 &&
    birthData.month >= 1 && birthData.month <= 12 &&
    birthData.day >= 1 && birthData.day <= 31 &&
    birthData.hour >= 0 && birthData.hour <= 23 &&
    birthData.minute >= 0 && birthData.minute <= 59
  );

  const value: BirthDataContextType = {
    birthData,
    setBirthData,
    clearBirthData,
    isDataValid,
    lastUpdated
  };

  return (
    <BirthDataContext.Provider value={value}>
      {children}
    </BirthDataContext.Provider>
  );
};

export const useBirthData = (): BirthDataContextType => {
  const context = useContext(BirthDataContext);
  if (context === undefined) {
    throw new Error('useBirthData must be used within a BirthDataProvider');
  }
  return context;
};

// Helper function to format birth data for display
export const formatBirthDataDisplay = (data: ChartBirthData): string => {
  const base = `${data.month}/${data.day}/${data.year} ${data.hour.toString().padStart(2, '0')}:${data.minute.toString().padStart(2, '0')}`;
  return data.city !== undefined && data.city !== '' ? `${base} in ${data.city}` : base;
};

// Helper function to validate coordinates
export const validateCoordinates = (lat?: number, lon?: number): boolean => {
  return (
    lat !== undefined && lon !== undefined &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  );
};
