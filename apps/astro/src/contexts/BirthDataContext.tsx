import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { devConsole as _devConsole } from '../config/environment';
import {
  toExtendedBirthData,
  type ChartBirthData,
  type ExtendedBirthData,
  type AnyBirthInput,
} from '@cosmichub/types';
import { type AnyIncomingBirthData } from '../utils/birthDataNormalization';
import {
  loadFromStorage,
  debouncedSave,
  clearStorage,
} from '../utils/contextPersistence';
import { useContextPerformance } from '../hooks/useContextPerformance';

interface BirthDataContextType {
  birthData: ExtendedBirthData | null;
  setBirthData: (
    data: ChartBirthData | AnyIncomingBirthData | ExtendedBirthData | null
  ) => void;
  clearBirthData: () => void;
  isDataValid: boolean;
  lastUpdated: number;
}

const BirthDataContext = createContext<BirthDataContextType | undefined>(
  undefined
);

interface BirthDataProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'cosmichub_birth_data';

// Type guard for birth data validation using unified type system
const isValidBirthDataForLoad = (data: unknown): data is ExtendedBirthData => {
  if (!data || typeof data !== 'object') return false;
  try {
    toExtendedBirthData(data as AnyBirthInput);
    return true;
  } catch {
    return false;
  }
};

// Enhanced validation with unified birth data requirements
const isValidBirthData = (data: ExtendedBirthData | null): boolean => {
  if (!data) return false;

  try {
    const extended = toExtendedBirthData(data as AnyBirthInput);
    // Check required numeric fields are valid
    return (
      typeof extended.year === 'number' &&
      typeof extended.month === 'number' &&
      typeof extended.day === 'number' &&
      typeof extended.hour === 'number' &&
      typeof extended.minute === 'number' &&
      extended.year >= 1900 &&
      extended.year < 2100 &&
      extended.month >= 1 &&
      extended.month <= 12 &&
      extended.day >= 1 &&
      extended.day <= 31 &&
      extended.hour >= 0 &&
      extended.hour <= 23 &&
      extended.minute >= 0 &&
      extended.minute <= 59
    );
  } catch {
    return false;
  }
};

export const BirthDataProvider: React.FC<BirthDataProviderProps> = ({
  children,
}) => {
  // Initialize with data from localStorage using new persistence utility
  const [birthData, setBirthDataState] = useState<ExtendedBirthData | null>(
    () => {
      const raw = loadFromStorage(
        { key: STORAGE_KEY },
        isValidBirthDataForLoad
      );
      if (raw) {
        try {
          return toExtendedBirthData(raw as AnyBirthInput);
        } catch {
          return null;
        }
      }
      return null;
    }
  );

  const [lastUpdated, setLastUpdated] = useState<number>(
    birthData !== null && birthData !== undefined ? Date.now() : Date.now()
  );

  // Memoized validation check - only recomputes when birthData changes
  const isDataValid = useMemo(() => isValidBirthData(birthData), [birthData]);

  // Optimized setBirthData with debounced persistence using unified type system
  const setBirthData = useCallback(
    (
      data: ChartBirthData | AnyIncomingBirthData | ExtendedBirthData | null
    ) => {
      if (data === null) {
        setBirthDataState(null);
        setLastUpdated(Date.now());
        clearStorage({ key: STORAGE_KEY });
        return;
      }

      try {
        // Use the unified converter from types package
        const extended = toExtendedBirthData(data as AnyBirthInput);
        setBirthDataState(extended);
        setLastUpdated(Date.now());
        debouncedSave(extended, { key: STORAGE_KEY });
      } catch (error) {
        console.warn('Birth data conversion failed, storing raw data:', error);
        // If conversion fails, store the raw data for inspection (maintains test expectations)
        setBirthDataState(data as unknown as ExtendedBirthData);
        setLastUpdated(Date.now());
      }
    },
    []
  );

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
export const formatBirthDataDisplay = (data: ExtendedBirthData): string => {
  try {
    const extended = toExtendedBirthData(data as AnyBirthInput);
    const base = `${extended.month}/${extended.day}/${extended.year} ${String(extended.hour).padStart(2, '0')}:${String(extended.minute).padStart(2, '0')}`;
    return extended.city ? `${base} in ${extended.city}` : base;
  } catch {
    return 'Invalid date';
  }
};

// Helper function to validate coordinates
