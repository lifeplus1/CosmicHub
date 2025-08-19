import { useState, useCallback, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import type { 
  TransitBirthData as BirthData, 
  TransitResult, 
  LunarTransitResult, 
  DateRange,
  TransitAnalysisOptions,
  LunarAnalysisOptions
} from './types';

interface TransitAnalysisReturn {
  // State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  transitResults: TransitResult[];
  lunarTransits: LunarTransitResult[];
  loading: boolean;
  loadingLunar: boolean;
  error: string | null;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  
  // Actions
  calculateTransits: (options?: TransitAnalysisOptions) => Promise<void>;
  calculateLunarTransits: (options?: LunarAnalysisOptions) => Promise<void>;
  clearError: () => void;
  
  // Computed values
  isValidDateRange: boolean;
  transitSummary: {
    total: number;
    major: number;
    challenging: number;
    harmonious: number;
    intensity: number;
  };
  lunarSummary: {
    total: number;
    newMoons: number;
    fullMoons: number;
    averageIntensity: number;
  };
  
  // Helper values
  hasResults: boolean;
  isCalculating: boolean;
}

export const useTransitAnalysis = (birthData: BirthData): TransitAnalysisReturn => {
  const [activeTab, setActiveTab] = useState<string>('transits');
  const [transitResults, setTransitResults] = useState<TransitResult[]>([]);
  const [lunarTransits, setLunarTransits] = useState<LunarTransitResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLunar, setLoadingLunar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // API base URL - could be moved to config
  const API_BASE_URL: string = (typeof import.meta.env.VITE_API_URL === 'string' && import.meta.env.VITE_API_URL !== '') 
    ? import.meta.env.VITE_API_URL 
    : 'http://localhost:8000';

  const calculateTransits = useCallback(async (options: TransitAnalysisOptions = {}): Promise<void> => {
    setLoading(true);
    setError(null);
    
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
        include_minor_aspects: options.includeMinorAspects === true,
        include_asteroids: options.includeAsteroids === true,
        orb: options.orb ?? 2.0
      };

      // eslint-disable-next-line no-console
      console.log('🚀 Calculating transits with payload:', requestPayload);

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

      if (response.data !== undefined && Array.isArray(response.data)) {
        setTransitResults(response.data);
        // eslint-disable-next-line no-console
        console.log(`✅ Transit calculation successful: ${response.data.length} results`);
      } else {
        // eslint-disable-next-line no-console
        console.error('❌ Invalid response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error calculating transits:', error);
      
      const axiosError = error as AxiosError<{detail?: string; message?: string}>;
      
      if (axiosError.response !== undefined) {
        // Server responded with error status
        const errorMessage = axiosError.response.data?.detail ?? 
                          axiosError.response.data?.message ?? 
                          `Server error: ${axiosError.response.status}`;
        setError(errorMessage);
      } else if (axiosError.request !== undefined) {
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

  const calculateLunarTransits = useCallback(async (options: LunarAnalysisOptions = {}): Promise<void> => {
    setLoadingLunar(true);
    setError(null);
    
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
        include_void_of_course: options.includeVoidOfCourse === true,
        include_daily_phases: options.includeDailyPhases !== false // default to true
      };

      // eslint-disable-next-line no-console
      console.log('🌙 Calculating lunar transits with payload:', requestPayload);

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

      if (response.data !== undefined && Array.isArray(response.data)) {
        setLunarTransits(response.data);
        // eslint-disable-next-line no-console
        console.log(`✅ Lunar transit calculation successful: ${response.data.length} results`);
      } else {
        // eslint-disable-next-line no-console
        console.error('❌ Invalid lunar response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error calculating lunar transits:', error);
      
      const axiosError = error as AxiosError<{detail?: string; message?: string}>;
      
      if (axiosError.response !== undefined) {
        // Server responded with error status
        const errorMessage = axiosError.response.data?.detail ?? 
                          axiosError.response.data?.message ?? 
                          `Server error: ${axiosError.response.status}`;
        setError(errorMessage);
      } else if (axiosError.request !== undefined) {
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
    setError(null);
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
    const majorAspects = transitResults.filter(t => ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(t.aspect));
    const challengingAspects = transitResults.filter(t => ['opposition', 'square'].includes(t.aspect));
    const harmonious = transitResults.filter(t => ['trine', 'sextile'].includes(t.aspect));
    
    return {
      total: transitResults.length,
      major: majorAspects.length,
      challenging: challengingAspects.length,
      harmonious: harmonious.length,
      intensity: transitResults.length > 0 
        ? Math.round(transitResults.reduce((sum, t) => sum + (t.intensity || 0), 0) / transitResults.length)
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
        ? Math.round(lunarTransits.reduce((sum, l) => sum + (l.intensity || 0), 0) / lunarTransits.length)
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