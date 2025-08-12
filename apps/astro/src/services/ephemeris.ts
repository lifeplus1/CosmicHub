/**
 * Ephemeris service for the astro frontend application.
 * 
 * This service provides lazy-loaded, cached access to ephemeris data
 * via the backend API, which proxies to the dedicated ephemeris server.
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createEphemerisClient,
  type EphemerisConfig,
  type PlanetPosition,
  type PlanetName,
  type CalculationResponse,
  type BatchCalculationResponse,
  type EphemerisHealthResponse,
  dateToJulianDay,
  SUPPORTED_PLANETS
} from '@cosmichub/integrations';

// Configuration for the ephemeris client
const getEphemerisConfig = (): EphemerisConfig => ({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
  timeout: 30000,
  // API key handled by backend authentication, not needed here
});

// Query keys for React Query
export const ephemerisKeys = {
  all: ['ephemeris'] as const,
  health: () => [...ephemerisKeys.all, 'health'] as const,
  planets: () => [...ephemerisKeys.all, 'planets'] as const,
  calculation: (julianDay: number, planet: string) => 
    [...ephemerisKeys.all, 'calculation', julianDay, planet] as const,
  allPositions: (julianDay: number) => 
    [...ephemerisKeys.all, 'positions', julianDay] as const,
};

/**
 * Hook to get a configured ephemeris client instance
 */
export const useEphemerisClient = () => {
  return useMemo(() => createEphemerisClient(getEphemerisConfig()), []);
};

/**
 * Hook to check ephemeris service health
 */
export const useEphemerisHealth = () => {
  const client = useEphemerisClient();
  
  return useQuery({
    queryKey: ephemerisKeys.health(),
    queryFn: () => client.healthCheck(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to get supported planets list
 */
export const useSupportedPlanets = () => {
  const client = useEphemerisClient();
  
  return useQuery({
    queryKey: ephemerisKeys.planets(),
    queryFn: () => client.getSupportedPlanets(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - rarely changes
    gcTime: 24 * 60 * 60 * 1000,
  });
};

/**
 * Hook to calculate planetary position for a specific date and planet
 */
export const usePlanetaryPosition = (
  date: Date | null,
  planet: PlanetName,
  options?: {
    enabled?: boolean;
  }
) => {
  const client = useEphemerisClient();
  const julianDay = date ? dateToJulianDay(date) : null;
  
  return useQuery({
    queryKey: julianDay ? ephemerisKeys.calculation(julianDay, planet) : [],
    queryFn: () => {
      if (!julianDay) throw new Error('Date is required');
      return client.calculatePosition(julianDay, planet);
    },
    enabled: !!(julianDay && options?.enabled !== false),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

/**
 * Hook to get all planetary positions for a specific date
 */
export const useAllPlanetaryPositions = (
  date: Date | null,
  options?: {
    enabled?: boolean;
    planets?: PlanetName[];
  }
) => {
  const client = useEphemerisClient();
  const julianDay = date ? dateToJulianDay(date) : null;
  const planetsToCalculate = options?.planets || SUPPORTED_PLANETS;
  
  return useQuery({
    queryKey: julianDay ? ephemerisKeys.allPositions(julianDay) : [],
    queryFn: async (): Promise<Record<PlanetName, PlanetPosition>> => {
      if (!julianDay) throw new Error('Date is required');
      
      // Use batch calculation for efficiency
      const calculations = planetsToCalculate.map(planet => ({
        julian_day: julianDay,
        planet,
      }));
      
      const response = await client.calculateBatchPositions(calculations);
      
      // Convert response to record format
      const positions: Record<string, PlanetPosition> = {};
      for (const result of response.results) {
        positions[result.planet] = result.position;
      }
      
      return positions as Record<PlanetName, PlanetPosition>;
    },
    enabled: !!(julianDay && options?.enabled !== false),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

/**
 * Hook to batch calculate multiple planetary positions
 */
export const useBatchPlanetaryCalculation = () => {
  const client = useEphemerisClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requests: Array<{ date: Date; planet: PlanetName }>) => {
      const calculations = requests.map(req => ({
        julian_day: dateToJulianDay(req.date),
        planet: req.planet,
      }));
      
      return client.calculateBatchPositions(calculations);
    },
    onSuccess: (data, variables) => {
      // Cache individual results for future queries
      data.results.forEach((result, index) => {
        const request = variables[index];
        if (request) {
          const julianDay = dateToJulianDay(request.date);
          queryClient.setQueryData(
            ephemerisKeys.calculation(julianDay, request.planet),
            result
          );
        }
      });
    },
  });
};

/**
 * Utility hook to preload planetary positions for a date range
 */
export const usePrefetchPlanetaryPositions = () => {
  const queryClient = useQueryClient();
  const client = useEphemerisClient();
  
  const prefetchPositions = async (
    startDate: Date,
    endDate: Date,
    planets: PlanetName[] = [...SUPPORTED_PLANETS]
  ) => {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    // Generate daily dates in range
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Prefetch in batches to avoid overwhelming the server
    const batchSize = 10;
    for (let i = 0; i < dates.length; i += batchSize) {
      const batch = dates.slice(i, i + batchSize);
      
      const promises = batch.map(date => {
        const julianDay = dateToJulianDay(date);
        return queryClient.prefetchQuery({
          queryKey: ephemerisKeys.allPositions(julianDay),
          queryFn: () => client.getAllPlanetaryPositions(julianDay),
          staleTime: 60 * 60 * 1000, // 1 hour
        });
      });
      
      await Promise.all(promises);
    }
  };
  
  return { prefetchPositions };
};

/**
 * Hook to invalidate ephemeris cache (useful for forcing refresh)
 */
export const useInvalidateEphemerisCache = () => {
  const queryClient = useQueryClient();
  
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ephemerisKeys.all });
  };
  
  const invalidateCalculation = (julianDay: number, planet: PlanetName) => {
    queryClient.invalidateQueries({
      queryKey: ephemerisKeys.calculation(julianDay, planet)
    });
  };
  
  const invalidateAllPositions = (julianDay: number) => {
    queryClient.invalidateQueries({
      queryKey: ephemerisKeys.allPositions(julianDay)
    });
  };
  
  return {
    invalidateAll,
    invalidateCalculation,
    invalidateAllPositions,
  };
};

// Export utility functions for direct use
export {
  dateToJulianDay,
  julianDayToDate,
  formatPlanetPosition,
  getAstrologicalSign,
  SUPPORTED_PLANETS,
} from '@cosmichub/integrations';

// Export types for convenience
export type {
  PlanetPosition,
  PlanetName,
  CalculationResponse,
  BatchCalculationResponse,
  EphemerisHealthResponse,
} from '@cosmichub/integrations';
