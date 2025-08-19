import { useState, useCallback, useMemo } from 'react';
import { devConsole } from '../../config/environment';
import axios, { AxiosError } from 'axios';
import type { 
  TransitBirthData as BirthData, 
  TransitResult, 
  LunarTransitResult, 
  DateRange,
  TransitCalculationResponse,
  LunarTransitCalculationResponse,
  TransitAnalysisOptions,
  LunarAnalysisOptions
} from './types';

export const useTransitAnalysis = (birthData: BirthData) => {
  const [activeTab, setActiveTab] = useState<string>('transits');
  const [transitResults, setTransitResults] = useState<TransitResult[]>([]);
  const [lunarTransits, setLunarTransits] = useState<LunarTransitResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLunar, setLoadingLunar] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // API base URL - could be moved to config
  const API_BASE_URL = typeof import.meta.env.VITE_API_URL === 'string' && import.meta.env.VITE_API_URL.length > 0
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:8000';

  const calculateTransits = useCallback(async (options: TransitAnalysisOptions = {}) => {
    setLoading(true);
    setError(undefined);
    
    try {
      const requestPayload = {
        birth_data: {
          birth_date: birthData.birth_date,
          birth_time: birthData.birth_time,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone ?? 'UTC'
        },
        date_range: {
          start_date: dateRange.startDate,
          end_date: dateRange.endDate
        },
        include_minor_aspects: options.includeMinorAspects ?? false,
        include_asteroids: options.includeAsteroids ?? false,
        orb: options.orb ?? 2.0
      };

  devConsole.log?.('🚀 Calculating transits with payload:', requestPayload);

      const response = await axios.post<TransitResult[]>(
        `${API_BASE_URL}/api/astro/transits`,
        requestPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );
  if (Array.isArray(response.data) === true) {
        setTransitResults(response.data);
  devConsole.log?.(`✅ Transit calculation successful: ${response.data.length} results`);
      } else {
        devConsole.error('❌ Invalid response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (err: unknown) {
      devConsole.error('❌ Error calculating transits:', err);
  if (isAxiosError(err) && err.response != null) {
        // Server responded with error status
        const detail = (err.response.data as any)?.detail;
        const message = (err.response.data as any)?.message;
        const errorMessage = typeof detail === 'string' ? detail : (typeof message === 'string' ? message : `Server error: ${err.response.status}`);
        setError(errorMessage);
  } else if (isAxiosError(err) && err.request != null) {
        // Request was made but no response received
        setError('Unable to connect to transit calculation service. Please check your connection.');
      } else {
        // Something else happened
        setError('Failed to calculate transits. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [birthData, dateRange, API_BASE_URL]);

  const calculateLunarTransits = useCallback(async (options: LunarAnalysisOptions = {}) => {
    setLoadingLunar(true);
    setError(undefined);
    
    try {
      const requestPayload = {
        birth_data: {
          birth_date: birthData.birth_date,
          birth_time: birthData.birth_time,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone ?? 'UTC'
        },
        date_range: {
          start_date: dateRange.startDate,
          end_date: dateRange.endDate
        },
        include_void_of_course: options.includeVoidOfCourse ?? false,
        include_daily_phases: options.includeDailyPhases ?? true
      };

  devConsole.log?.('🌙 Calculating lunar transits with payload:', requestPayload);

      const response = await axios.post<LunarTransitResult[]>(
        `${API_BASE_URL}/api/astro/lunar-transits`,
        requestPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

  if (Array.isArray(response.data) === true) {
        setLunarTransits(response.data);
  devConsole.log?.(`✅ Lunar transit calculation successful: ${response.data.length} results`);
      } else {
        devConsole.error('❌ Invalid lunar response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (err: unknown) {
      devConsole.error('❌ Error calculating lunar transits:', err);
  if (isAxiosError(err) && err.response != null) {
        // Server responded with error status
        const detail = (err.response.data as any)?.detail;
        const message = (err.response.data as any)?.message;
        const errorMessage = typeof detail === 'string' ? detail : (typeof message === 'string' ? message : `Server error: ${err.response.status}`);
        setError(errorMessage);
  } else if (isAxiosError(err) && err.request != null) {
        // Request was made but no response received
        setError('Unable to connect to lunar transit service. Please check your connection.');
      } else {
        // Something else happened
        setError('Failed to calculate lunar transits. Please try again.');
      }
    } finally {
      setLoadingLunar(false);
    }
  }, [birthData, dateRange, API_BASE_URL]);

  // Clear error when user changes settings
  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  // Memoize results to prevent unnecessary re-renders
  const memoizedTransitResults = useMemo(() => transitResults, [transitResults]);
  const memoizedLunarTransits = useMemo(() => lunarTransits, [lunarTransits]);

  // Enhanced date range validation
  const isValidDateRange = useMemo(() => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    return diffDays > 0 && diffDays <= 365; // Max 1 year range
  }, [dateRange]);

  // Calculate summary statistics
  const transitSummary = useMemo(() => {
  const majorAspectSet = new Set(['conjunction', 'opposition', 'trine', 'square', 'sextile']);
  const challengingSet = new Set(['opposition', 'square']);
  const harmoniousSet = new Set(['trine', 'sextile']);
  const majorAspects = transitResults.filter(t => majorAspectSet.has(t.aspect));
  const challengingAspects = transitResults.filter(t => challengingSet.has(t.aspect));
  const harmonious = transitResults.filter(t => harmoniousSet.has(t.aspect));
    
    return {
      total: transitResults.length,
      major: majorAspects.length,
      challenging: challengingAspects.length,
      harmonious: harmonious.length,
  intensity: transitResults.length > 0
        ? Math.round(transitResults.reduce((sum, t) => sum + (t.intensity ?? 0), 0) / transitResults.length)
        : 0
    };
  }, [transitResults]);

  const lunarSummary = useMemo(() => {
  const newMoons = lunarTransits.filter(l => l.phase.toLowerCase().includes('new'));
  const fullMoons = lunarTransits.filter(l => l.phase.toLowerCase().includes('full'));
    
    return {
      total: lunarTransits.length,
      newMoons: newMoons.length,
      fullMoons: fullMoons.length,
  averageIntensity: lunarTransits.length > 0
        ? Math.round(lunarTransits.reduce((sum, l) => sum + (l.intensity ?? 0), 0) / lunarTransits.length)
        : 0
    };
  }, [lunarTransits]);

  return {
    // State
    activeTab,
    setActiveTab,
    transitResults: memoizedTransitResults,
    lunarTransits: memoizedLunarTransits,
    loading,
    loadingLunar,
    error,
    dateRange,
    setDateRange,
    
    // Actions
    calculateTransits,
    calculateLunarTransits,
    clearError,
    
    // Computed values
    isValidDateRange,
    transitSummary,
    lunarSummary,
    
    // Helper values
    hasResults: transitResults.length > 0 || lunarTransits.length > 0,
    isCalculating: loading || loadingLunar,
  };
};

function isAxiosError(error: unknown): error is AxiosError {
  const err = error as Error & { isAxiosError?: boolean };
  return err !== null && typeof err === 'object' && err.isAxiosError === true;
}