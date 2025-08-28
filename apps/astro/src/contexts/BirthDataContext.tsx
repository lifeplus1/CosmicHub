import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { devConsole as _devConsole } from '../config/environment';
import type { ChartBirthData } from '@cosmichub/types';
import { extractNumericBirthData, type AnyIncomingBirthData } from '../utils/birthDataNormalization';
import {
  loadFromStorage,
  debouncedSave,
  clearStorage,
} from '../utils/contextPersistence';
import { useContextPerformance } from '../hooks/useContextPerformance';

// Local extended shape adding numeric components for internal logic while preserving original external fields
export interface ExtendedBirthData extends ChartBirthData {
  year: number; month: number; day: number; hour: number; minute: number;
  /** Normalized latitude (duplicate of base, retained for clarity) */
  latitude: number;
  /** Normalized longitude (duplicate of base) */
  longitude: number;
  /** Optional timezone identifier (IANA) */
  timezone?: string;
  // Internal shorthand lat/lon removed from persisted object to maintain deep equality with original tests
}

interface BirthDataContextType {
  birthData: ExtendedBirthData | null; // Always normalized extended variant here
  setBirthData: (data: ChartBirthData | AnyIncomingBirthData | ExtendedBirthData | null) => void;
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
const isValidBirthDataForLoad = (data: unknown): data is ExtendedBirthData => {
  if (!data || typeof data !== 'object') return false;
  const normalized = extractNumericBirthData(data as AnyIncomingBirthData);
  return normalized !== null;
};

// Enhanced validation with full birth data requirements
const isValidBirthData = (data: ExtendedBirthData | null): boolean => {
  if (!data) return false;
  return (
    data.year >= 1900 &&
    data.year < 2100 &&
    data.month >= 1 &&
    data.month <= 12 &&
    data.day >= 1 &&
    data.day <= 31 &&
    data.hour >= 0 &&
    data.hour <= 23 &&
    data.minute >= 0 &&
    data.minute <= 59
  );
};

export const BirthDataProvider: React.FC<BirthDataProviderProps> = ({
  children,
}) => {
  // Initialize with data from localStorage using new persistence utility
  const [birthData, setBirthDataState] = useState<ExtendedBirthData | null>(() => {
    const raw = loadFromStorage({ key: STORAGE_KEY }, isValidBirthDataForLoad);
    if (raw) return raw;
    return null;
  });

  const [lastUpdated, setLastUpdated] = useState<number | null>(
    birthData !== null && birthData !== undefined ? Date.now() : null
  );

  // Memoized validation check - only recomputes when birthData changes
  const isDataValid = useMemo(() => isValidBirthData(birthData), [birthData]);

  // Optimized setBirthData with debounced persistence
  const setBirthData = useCallback((data: ChartBirthData | AnyIncomingBirthData | ExtendedBirthData | null) => {
    if (data === null) {
      setBirthDataState(null);
      setLastUpdated(Date.now());
      clearStorage({ key: STORAGE_KEY });
      return;
    }
    // Normalize any incoming variant; if normalization fails we still set raw (test expectation for invalid data retention)
    const normalized = extractNumericBirthData(data as AnyIncomingBirthData);
    if (!normalized) {
      // Retain raw shape for inspection while marking invalid
      setBirthDataState(data as ExtendedBirthData);
      setLastUpdated(Date.now());
      return;
    }
    const dataObj = data as Record<string, unknown>;
    const cameFromNumeric =
      typeof dataObj.year === 'number' &&
      typeof dataObj.month === 'number' &&
      typeof dataObj.day === 'number';

    let ext;

    if (cameFromNumeric) {
      // Preserve original numeric shape (tests expect deep equality) and add lat/lon helpers
      ext = {
        ...dataObj,
        latitude: normalized.lat,
        longitude: normalized.lon,
        hour: normalized.hour,
        minute: normalized.minute,
      };
    } else {
      // Build extended shape including birth_date/time if not original numeric variant
      ext = {
        birth_date: `${normalized.year.toString().padStart(4, '0')}-${String(normalized.month).padStart(2, '0')}-${String(normalized.day).padStart(2, '0')}`,
        birth_time: `${String(normalized.hour).padStart(2, '0')}:${String(normalized.minute).padStart(2, '0')}`,
        latitude: normalized.lat,
        longitude: normalized.lon,
        city: normalized.city,
        timezone: normalized.timezone,
        year: normalized.year,
        month: normalized.month,
        day: normalized.day,
        hour: normalized.hour,
        minute: normalized.minute,
      };
    }
    if (typeof dataObj.country === 'string') {
      (ext as Record<string, unknown>).country = dataObj.country;
    }
    setBirthDataState(ext as ExtendedBirthData);
    setLastUpdated(Date.now());
    debouncedSave(ext, { key: STORAGE_KEY });
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
  const base = `${data.month}/${data.day}/${data.year} ${String(data.hour).padStart(2, '0')}:${String(data.minute).padStart(2, '0')}`;
  return data.city !== null && data.city !== undefined
    ? `${base} in ${data.city}`
    : base;
};

// Helper function to validate coordinates
