import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchSavedChart } from '../../../services/astrologyService';
import { validateChart } from '../validateChart';
import { isChartLike, hasChartContent, type ChartLike } from '../normalizeChart';
import { sampleChartData } from '../sampleData';

interface UseChartDataArgs {
  chart: unknown;
  chartId?: string | null;
  chartType?: string;
  enabled?: boolean;
}

export function useChartData({ chart, chartId, chartType = 'natal', enabled }: UseChartDataArgs) {
  const query = useQuery({
    queryKey: ['chartData', chartId, chartType],
    queryFn: async () => {
      if (!chartId) throw new Error('Missing chartId');
      return fetchSavedChart(chartId, chartType as 'natal' | 'transit' | 'composite');
    },
    enabled,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (failureCount < 2) {
        const msg = error?.message || '';
        return !msg.includes('Missing chartId') && !msg.includes('validation');
      }
      return false;
    },
    retryDelay: i => Math.min(1000 * 2 ** i, 30000),
    staleTime: 300_000,
    gcTime: 600_000,
  });

  const chartData = useMemo<ChartLike>(() => {
    const provided = chart ?? query.data;
    const fallback = sampleChartData as ChartLike;
    if (!provided || typeof provided !== 'object') return fallback;
    if (!isChartLike(provided as ChartLike) || !hasChartContent(provided as ChartLike)) return fallback;
    const validated = validateChart(provided as ChartLike);
    if (!validated || typeof validated !== 'object') return fallback;
    return validated;
  }, [chart, query.data]);

  return { chartData, ...query };
}
