import { useQuery } from '@tanstack/react-query';

interface PsychologyAssessmentPayload {
  assessment_type?: string;
  user_id?: string | null;
  responses?: Record<string, unknown>;
  include_recommendations?: boolean;
  autoLoad?: boolean; // if false (default) hook starts idle until refresh called
}

interface PsychologyAssessmentResult<T = any> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function usePsychologyChartData(payload: PsychologyAssessmentPayload = {}): PsychologyAssessmentResult {
  const query = useQuery({
    queryKey: ['psychology', 'assessment', payload],
    enabled: payload.autoLoad === true,
    queryFn: async () => {
      const res = await fetch('/api/psychology/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_type: payload.assessment_type || 'big_five',
          user_id: payload.user_id ?? undefined,
          responses: payload.responses ?? {},
          include_recommendations: payload.include_recommendations ?? true,
        }),
      });
      if (!res.ok) throw new Error('Psychology assessment failed');
      return res.json();
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: (query.error as Error) || null,
    refresh: () => { void query.refetch(); },
  };
}
