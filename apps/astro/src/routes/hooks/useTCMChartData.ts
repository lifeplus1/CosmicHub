import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UnifiedBirthData, TCMResponse } from '@cosmichub/types';

interface UseTCMChartDataResult {
  data: {
    raw?: TCMResponse;
    analysis?: TCMResponse['data'];
    normalizedBirthData?: UnifiedBirthData;
  } | undefined;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

const API_URL = '/api/tcm/calculate';

function buildRequestPayload(): Record<string, unknown> {
  // Placeholder birth data until user input is wired
  return {
    year: 1990,
    month: 6,
    day: 15,
    hour: 14,
    minute: 30,
    lat: 40.7,
    lon: -74.0,
    timezone: 'UTC',
    include_detailed_analysis: true,
  };
}

export function useTCMChartData(): UseTCMChartDataResult {
  const qc = useQueryClient();
  const payload = buildRequestPayload();
  const queryKey = ['tcm', 'analysis', payload];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`TCM API error: ${res.status}`);
      const json = await res.json() as unknown;
      // Basic runtime validation - in production this would use Zod
      if (typeof json !== 'object' || json === null) {
        throw new Error('Invalid TCM API response format');
      }
      const tcmResponse = json as TCMResponse;
      const normalizedBirthData: UnifiedBirthData = {
        year: payload.year as number,
        month: payload.month as number,
        day: payload.day as number,
        hour: payload.hour as number,
        minute: payload.minute as number,
        lat: payload.lat as number,
        lon: payload.lon as number,
        timezone: payload.timezone as string,
      };
      return { raw: tcmResponse, analysis: tcmResponse?.data, normalizedBirthData };
    },
    staleTime: 60_000,
    retry: 1,
  });

  const refresh = useCallback(() => {
    void qc.invalidateQueries({ queryKey });
  }, [qc, queryKey]);

  // Fallback data when error occurs
  const data = query.data ?? (query.error ? {
    normalizedBirthData: {
      year: 1990, month: 6, day: 15, hour: 14, minute: 30, lat: 40.7, lon: -74.0, timezone: 'UTC'
    }
  } : undefined);

  return { data, isLoading: query.isLoading, error: query.error ?? null, refresh };
}
