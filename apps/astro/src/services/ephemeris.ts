/**
 * Ephemeris service for the astro frontend application.
 * 
 * This service provides lazy-loaded, cached access to ephemeris data
 * via the backend API, which proxies to the dedicated ephemeris server.
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import {
  createEphemerisClient,
  type EphemerisConfig,
  type PlanetPosition,
  type PlanetName,
  dateToJulianDay,
  SUPPORTED_PLANETS
} from '@cosmichub/integrations';
import type {
  CalculationResponse,
  BatchCalculationResponse,
  EphemerisHealthResponse
} from '@cosmichub/integrations';

// Configuration for the ephemeris client
const getEphemerisConfig = (): EphemerisConfig => ({
  // Use the backend API base (frontend talks to backend, which proxies ephemeris)
  apiBaseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
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
export const useEphemerisClient = (): ReturnType<typeof createEphemerisClient> =>
  useMemo(() => createEphemerisClient(getEphemerisConfig()), []);

/**
 * Hook to check ephemeris service health
 */
export const useEphemerisHealth = (): UseQueryResult<EphemerisHealthResponse, Error> => {
  const client = useEphemerisClient();
  return useQuery<EphemerisHealthResponse, Error>({
    queryKey: ephemerisKeys.health(),
    queryFn: () => client.healthCheck(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

/**
 * Hook to get supported planets list
 */
export const useSupportedPlanets = (): UseQueryResult<PlanetName[], Error> => {
  const client = useEphemerisClient();
  return useQuery<PlanetName[], Error>({
    queryKey: ephemerisKeys.planets(),
    queryFn: () => client.getSupportedPlanets(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - rarely changes
    gcTime: 24 * 60 * 60 * 1000
  });
};

/**
 * Hook to calculate planetary position for a specific date and planet
 */
export const usePlanetaryPosition = (
  date: Date | null,
  planet: PlanetName,
  options?: { enabled?: boolean }
): UseQueryResult<CalculationResponse, Error> => {
  const client = useEphemerisClient();
  const julianDay = date !== null && date !== undefined ? dateToJulianDay(date) : null;
  const isEnabled = options?.enabled !== false && julianDay !== null && julianDay !== undefined;
  return useQuery<CalculationResponse, Error>({
  queryKey: julianDay != null ? ephemerisKeys.calculation(julianDay, planet) : [],
    queryFn: () => {
      if (julianDay == null) throw new Error('Date is required');
      return client.calculatePosition(julianDay, planet);
    },
    enabled: isEnabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000
  });
};

/**
 * Hook to get all planetary positions for a specific date
 */
export const useAllPlanetaryPositions = (
  date: Date | null,
  options?: { enabled?: boolean; planets?: PlanetName[] }
): UseQueryResult<Record<PlanetName, PlanetPosition>, Error> => {
  const client = useEphemerisClient();
  const julianDay = date != null ? dateToJulianDay(date) : null;
  const hasCustomPlanets = Array.isArray(options?.planets) && options?.planets !== undefined && options.planets.length > 0;
  const planetsToCalculate: PlanetName[] = hasCustomPlanets
    ? [...new Set(options!.planets!)] // dedupe if caller passes duplicates
    : [...SUPPORTED_PLANETS]; // spread to mutable array
  const isEnabled = options?.enabled !== false && julianDay != null;
  return useQuery<Record<PlanetName, PlanetPosition>, Error>({
  queryKey: julianDay != null ? ephemerisKeys.allPositions(julianDay) : [],
    queryFn: async () => {
      if (julianDay == null) throw new Error('Date is required');
      const calculations = planetsToCalculate.map((planet) => ({
        julian_day: julianDay,
        planet
      }));
      const response = await client.calculateBatchPositions(calculations);
      const positions: Partial<Record<PlanetName, PlanetPosition>> = {};
      for (const result of response.results) {
        const planetName = result.planet as PlanetName;
        positions[planetName] = result.position;
      }
      return positions as Record<PlanetName, PlanetPosition>;
    },
    enabled: isEnabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000
  });
};

/**
 * Hook to batch calculate multiple planetary positions
 */
export const useBatchPlanetaryCalculation = (): UseMutationResult<
  BatchCalculationResponse,
  Error,
  Array<{ date: Date; planet: PlanetName }>,
  unknown
> => {
  const client = useEphemerisClient();
  const queryClient = useQueryClient();
  return useMutation<BatchCalculationResponse, Error, Array<{ date: Date; planet: PlanetName }>>({
    mutationFn: async (requests) => {
      const calculations = requests.map((req) => ({
        julian_day: dateToJulianDay(req.date),
        planet: req.planet
      }));
      return client.calculateBatchPositions(calculations);
    },
    onSuccess: (data, variables) => {
      data.results.forEach((result, index) => {
  const request = variables[index];
  if (request !== null && request !== undefined) {
          const julianDay = dateToJulianDay(request.date);
          // Cache the full calculation response for the single planet/date
          queryClient.setQueryData(
            ephemerisKeys.calculation(julianDay, request.planet),
            result
          );
        }
      });
    }
  });
};

/**
 * Utility hook to preload planetary positions for a date range
 */
export const usePrefetchPlanetaryPositions = (): { prefetchPositions: (
  startDate: Date,
  endDate: Date,
  planets?: PlanetName[]
) => Promise<void> } => {
  const queryClient = useQueryClient();
  const client = useEphemerisClient();

  const prefetchPositions = async (
    startDate: Date,
    endDate: Date,
    planets: PlanetName[] = [...SUPPORTED_PLANETS]
  ): Promise<void> => {
    if (endDate < startDate) return; // no-op on invalid range
    const uniquePlanets = [...new Set(planets)];
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const batchSize = 10;
    for (let i = 0; i < dates.length; i += batchSize) {
      const batch = dates.slice(i, i + batchSize);
      await Promise.all(
        batch.map((date) => {
          const julianDay = dateToJulianDay(date);
          return queryClient.prefetchQuery({
            queryKey: ephemerisKeys.allPositions(julianDay),
            queryFn: () => client.getAllPlanetaryPositions(julianDay),
            staleTime: 60 * 60 * 1000
          });
        })
      );
    }
  };

  return { prefetchPositions };
};

/**
 * Hook to invalidate ephemeris cache (useful for forcing refresh)
 */
export const useInvalidateEphemerisCache = (): {
  invalidateAll: () => void;
  invalidateCalculation: (julianDay: number, planet: PlanetName) => void;
  invalidateAllPositions: (julianDay: number) => void;
} => {
  const queryClient = useQueryClient();
  const invalidateAll = (): void => {
    void queryClient.invalidateQueries({ queryKey: ephemerisKeys.all });
  };
  const invalidateCalculation = (julianDay: number, planet: PlanetName): void => {
    void queryClient.invalidateQueries({
      queryKey: ephemerisKeys.calculation(julianDay, planet)
    });
  };
  const invalidateAllPositions = (julianDay: number): void => {
    void queryClient.invalidateQueries({
      queryKey: ephemerisKeys.allPositions(julianDay)
    });
  };
  return { invalidateAll, invalidateCalculation, invalidateAllPositions };
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
