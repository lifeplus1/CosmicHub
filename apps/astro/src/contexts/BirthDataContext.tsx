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

// Helper function extracted for reusability and testing
const validateBirthData = (data: unknown): data is ChartBirthData => {
  return (
    data !== null &&
    data !== undefined &&
    typeof data === 'object' &&
    'birth_date' in data &&
    typeof (data as Record<string, unknown>)['birth_date'] === 'string' &&
    'birth_time' in data &&
    typeof (data as Record<string, unknown>)['birth_time'] === 'string'
  );
};

// Enhanced validation with full birth data requirements for TextBirthData (ChartBirthData)
const isValidBirthData = (data: ChartBirthData | null): boolean => {
  if (data === null || data === undefined || typeof data !== 'object') {
    return false;
  }

  // Check if birth_date exists and is valid format
  if (
    typeof data.birth_date !== 'string' ||
    data.birth_date.trim() === '' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.birth_date)
  ) {
    return false;
  }

  // Check if birth_time exists and is valid format
  if (
    typeof data.birth_time !== 'string' ||
    data.birth_time.trim() === '' ||
    !/^\d{2}:\d{2}(?::\d{2})?$/.test(data.birth_time)
  ) {
    return false;
  }

  // Validate date parts
  const [yearStr, monthStr, dayStr] = data.birth_date.split('-');
  const year = parseInt(yearStr ?? '0', 10);
  const month = parseInt(monthStr ?? '0', 10);
  const day = parseInt(dayStr ?? '0', 10);

  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  // Validate time parts
  const [hourStr, minuteStr] = data.birth_time.split(':');
  const hour = parseInt(hourStr ?? '0', 10);
  const minute = parseInt(minuteStr ?? '0', 10);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return false;
  }

  return true;
};

// Debounced localStorage utility
let saveTimeoutId: ReturnType<typeof setTimeout> | null = null;
const debouncedSave = (key: string, data: ChartBirthData | null) => {
  if (saveTimeoutId) {
    clearTimeout(saveTimeoutId);
  }

  saveTimeoutId = setTimeout(() => {
    try {
      if (data !== null && data !== undefined) {
        localStorage.setItem(key, JSON.stringify(data));
        devConsole.log?.('✅ Birth data saved to storage:', data);
      } else {
        localStorage.removeItem(key);
        devConsole.log?.('🗑️ Birth data cleared from storage');
      }
    } catch (error) {
      devConsole.error('❌ Failed to save birth data:', error);
    }
  }, 300); // 300ms debounce
};

export const BirthDataProvider: React.FC<BirthDataProviderProps> = ({
  children,
}) => {
  // Initialize with data from localStorage
  const [birthData, setBirthDataState] = useState<ChartBirthData | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        if (validateBirthData(parsed)) {
          return parsed;
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

  // Memoized validation check - only recomputes when birthData changes
  const isDataValid = useMemo(() => isValidBirthData(birthData), [birthData]);

  // Optimized setBirthData with debounced persistence
  const setBirthData = useCallback((data: ChartBirthData | null) => {
    setBirthDataState(data);
    setLastUpdated(Date.now());
    debouncedSave(STORAGE_KEY, data);
  }, []);

  const clearBirthData = useCallback(() => {
    setBirthData(null);
  }, [setBirthData]);

  // Memoized context value - prevents unnecessary re-renders
  const contextValue = useMemo<BirthDataContextType>(
    () => ({
      birthData,
      setBirthData,
      clearBirthData,
      isDataValid,
      lastUpdated,
    }),
    [birthData, setBirthData, clearBirthData, isDataValid, lastUpdated]
  );

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
  const date = data.birth_date || '1990-01-01';
  const time = data.birth_time || '12:00';
  
  // Format date from YYYY-MM-DD to MM/DD/YYYY
  const [year, month, day] = date.split('-');
  const formattedDate = `${month}/${day}/${year}`;
  
  // Extract hour and minute from HH:MM or HH:MM:SS
  const [hour, minute] = time.split(':');
  const formattedTime = `${hour}:${minute}`;
  
  const base = `${formattedDate} ${formattedTime}`;
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