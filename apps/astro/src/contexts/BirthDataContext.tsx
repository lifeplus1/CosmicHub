import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ChartBirthData } from '../services/api';

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
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate the data structure
        if (parsed && typeof parsed === 'object' && parsed.year && parsed.month && parsed.day) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to parse stored birth data:', error);
    }
    return null;
  });

  const [lastUpdated, setLastUpdated] = useState<number | null>(
    birthData ? Date.now() : null
  );

  const setBirthData = useCallback((data: ChartBirthData | null) => {
    setBirthDataState(data);
    setLastUpdated(Date.now());
    
    if (data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('✅ Birth data saved to storage:', data);
      } catch (error) {
        console.error('❌ Failed to save birth data:', error);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Birth data cleared from storage');
    }
  }, []);

  const clearBirthData = useCallback(() => {
    setBirthData(null);
  }, [setBirthData]);

  const isDataValid = Boolean(
    birthData &&
    birthData.year > 1900 && birthData.year < 2100 &&
    birthData.month >= 1 && birthData.month <= 12 &&
    birthData.day >= 1 && birthData.day <= 31 &&
    birthData.hour >= 0 && birthData.hour <= 23 &&
    birthData.minute >= 0 && birthData.minute <= 59 &&
    birthData.city
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
  return `${data.month}/${data.day}/${data.year} at ${data.hour.toString().padStart(2, '0')}:${data.minute.toString().padStart(2, '0')} in ${data.city}`;
};

// Helper function to validate coordinates
export const validateCoordinates = (lat?: number, lon?: number): boolean => {
  return (
    lat !== undefined && lon !== undefined &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  );
};
