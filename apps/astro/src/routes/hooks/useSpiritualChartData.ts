import { useQuery } from '@tanstack/react-query';

interface SpiritualPayload {
  year?: number; month?: number; day?: number; hour?: number; minute?: number;
  include_ai_interpretation?: boolean;
  autoLoad?: boolean;
}

interface SpiritualAnalysisData {
  spiritual_level?: string;
  learning_stage?: string;
  recommendations?: string[];
  ai_interpretation?: string;
  generated_at?: string;
  [key: string]: unknown;
}

interface SpiritualResult {
  data: SpiritualAnalysisData | undefined;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useSpiritualChartData(payload: SpiritualPayload = {}): SpiritualResult {
  const now = new Date();
  const query = useQuery({
    queryKey: ['spiritual', 'analysis', payload],
    enabled: payload.autoLoad === true,
    queryFn: async (): Promise<SpiritualAnalysisData> => {
      const res = await fetch('/api/spiritual/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: payload.year ?? now.getUTCFullYear(),
          month: payload.month ?? now.getUTCMonth() + 1,
          day: payload.day ?? now.getUTCDate(),
          hour: payload.hour ?? 12,
          minute: payload.minute ?? 0,
          include_ai_interpretation: payload.include_ai_interpretation ?? true,
        }),
      });
      if (!res.ok) throw new Error('Spiritual analysis failed');
      const result = await res.json() as unknown;
      if (typeof result === 'object' && result !== null) {
        return result as SpiritualAnalysisData;
      }
      throw new Error('Invalid response format');
    },
  });
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: (query.error as Error) ?? null,
    refresh: () => { void query.refetch(); },
  };
}
