import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { devConsole } from '../config/environment';
import type { ChartBirthData } from '@cosmichub/types';
import { loadFromStorage, debouncedSave, clearStorage } from '../utils/contextPersistence';
import { useContextPerformance } from '../hooks/useContextPerformance';

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

// Type guard for birth data validation
const isValidBirthDataForLoad = (data: unknown): data is ChartBirthData => {
  return (
    data !== null &&
    data !== undefined &&
    typeof data === 'object' &&
    'year' in data &&
    typeof (data as Record<string, unknown>)['year'] === 'number' &&
    'month' in data &&
    typeof (data as Record<string, unknown>)['month'] === 'number' &&
    'day' in data &&
    typeof (data as Record<string, unknown>)['day'] === 'number'
  );
};

// Enhanced validation with full birth data requirements
const isValidBirthData = (data: ChartBirthData | null): boolean => {
  return (
    data !== null &&
    typeof data === 'object' &&
    typeof data.year === 'number' &&
    data.year > 1900 &&
    data.year < 2100 &&
    typeof data.month === 'number' &&
    data.month >= 1 &&
    data.month <= 12 &&
    typeof data.day === 'number' &&
    data.day >= 1 &&
    data.day <= 31 &&
    typeof data.hour === 'number' &&
    data.hour >= 0 &&
    data.hour <= 23 &&
    typeof data.minute === 'number' &&
    data.minute >= 0 &&
    data.minute <= 59
  );
};

export const BirthDataProvider: React.FC<BirthDataProviderProps> = ({
  children,
}) => {
  // Initialize with data from localStorage using new persistence utility
  const [birthData, setBirthDataState] = useState<ChartBirthData | null>(() => {
    return loadFromStorage({ key: STORAGE_KEY }, isValidBirthDataForLoad);
  });

  const [lastUpdated, setLastUpdated] = useState<number | null>(
    birthData !== null && birthData !== undefined ? Date.now() : null
  );

  // Memoized validation check - only recomputes when birthData changes
  const isDataValid = useMemo(() => isValidBirthData(birthData), [birthData]);

  // Optimized setBirthData with debounced persistence
  const setBirthData = useCallback((data: ChartBirthData | null) => {
    setBirthDataState(data);
    setLastUpdated(Date.now());
    
    if (data) {
      debouncedSave(data, { key: STORAGE_KEY });
    } else {
      clearStorage({ key: STORAGE_KEY });
    }
  }, []);

  const clearBirthData = useCallback(() => {
    setBirthData(null);
  }, [setBirthData]);

  // Memoized context value - prevents unnecessary re-renders
  const contextValue = useMemo<BirthDataContextType>(() => ({
    birthData,
    setBirthData,
    clearBirthData,
    isDataValid,
    lastUpdated,
  }), [birthData, setBirthData, clearBirthData, isDataValid, lastUpdated]);

  // Performance monitoring in development
  useContextPerformance('BirthData', [birthData, isDataValid, lastUpdated]);

  return (
    <BirthDataContext.Provider value={contextValue}>
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
