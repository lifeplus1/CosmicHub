import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { devConsole } from '../config/environment';
import type { ChartBirthData } from '@cosmichub/types';

interface BirthDataContextType {
  birthData: ChartBirthData | null;
  setBirthData: (data: ChartBirthData | null) => void;
  clearBirthData: () => void;
  isDataValid: boolean;
  lastUpdated: number | null;
}

const BirthDataContext = createContext<BirthDataContextType | undefined>(
  undefined
);

interface BirthDataProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'cosmichub_birth_data';

export const BirthDataProvider: React.FC<BirthDataProviderProps> = ({
  children,
}) => {
  // Initialize with data from localStorage
  const [birthData, setBirthDataState] = useState<ChartBirthData | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        // Validate the data structure
        if (
          parsed !== null &&
          parsed !== undefined &&
          typeof parsed === 'object' &&
          'year' in parsed &&
          typeof (parsed as Record<string, unknown>)['year'] === 'number' &&
          'month' in parsed &&
          typeof (parsed as Record<string, unknown>)['month'] === 'number' &&
          'day' in parsed &&
          typeof (parsed as Record<string, unknown>)['day'] === 'number'
        ) {
          return parsed as ChartBirthData;
        }
      }
    } catch (error) {
      devConsole.warn?.('Failed to parse stored birth data:', error);
    }
    return null;
  });

  const [lastUpdated, setLastUpdated] = useState<number | null>(
    birthData !== null && birthData !== undefined ? Date.now() : null
  );

  const setBirthData = useCallback((data: ChartBirthData | null) => {
    setBirthDataState(data);
    setLastUpdated(Date.now());

    if (data !== null && data !== undefined) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        devConsole.log?.('✅ Birth data saved to storage:', data);
      } catch (error) {
        devConsole.error('❌ Failed to save birth data:', error);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      devConsole.log?.('🗑️ Birth data cleared from storage');
    }
  }, []);

  const clearBirthData = useCallback(() => {
    setBirthData(null);
  }, [setBirthData]);

  const isDataValid =
    birthData !== null &&
    typeof birthData === 'object' &&
    typeof birthData.year === 'number' &&
    birthData.year > 1900 &&
    birthData.year < 2100 &&
    typeof birthData.month === 'number' &&
    birthData.month >= 1 &&
    birthData.month <= 12 &&
    typeof birthData.day === 'number' &&
    birthData.day >= 1 &&
    birthData.day <= 31 &&
    typeof birthData.hour === 'number' &&
    birthData.hour >= 0 &&
    birthData.hour <= 23 &&
    typeof birthData.minute === 'number' &&
    birthData.minute >= 0 &&
    birthData.minute <= 59;

  const value: BirthDataContextType = {
    birthData,
    setBirthData,
    clearBirthData,
    isDataValid,
    lastUpdated,
  };

  return (
    <BirthDataContext.Provider value={value}>
      {children}
    </BirthDataContext.Provider>
  );
};

export const useBirthData = (): BirthDataContextType => {
  const context = useContext(BirthDataContext);
  if (context === undefined || context === null) {
    throw new Error('useBirthData must be used within a BirthDataProvider');
  }
  return context;
};

// Helper function to format birth data for display
export const formatBirthDataDisplay = (data: ChartBirthData): string => {
  const base = `${data.month}/${data.day}/${data.year} ${data.hour.toString().padStart(2, '0')}:${data.minute.toString().padStart(2, '0')}`;
  return data.city !== null && data.city !== undefined
    ? `${base} in ${data.city}`
    : base;
};

// Helper function to validate coordinates
export const validateCoordinates = (lat?: number, lon?: number): boolean => {
  return (
    lat !== undefined &&
    lat !== null &&
    typeof lat === 'number' &&
    lon !== undefined &&
    lon !== null &&
    typeof lon === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
};
