import { useQuery } from '@tanstack/react-query';

// Define synthesis types locally to avoid circular dependency issues
interface SynthesisInput {
  birth_data: {
    planets?: Array<{
      name: string;
      strength: number;
      sign?: string;
      house?: number;
    }>;
    life_path: number;
    transits?: Array<{
      planet: string;
      aspect: string;
      orb: number;
      timing?: string;
    }>;
    chinese_elements?: string[];
    user_level?: string;
  };
  spiritual_systems: {
    kabbalah?: {
      elements: string[];
      active_sephirot?: string[];
    };
    tarot?: {
      active_cards?: string[];
      spreads?: string[];
    };
  };
}

interface SynthesisOutput {
  themes: string[];
  recommendations: Array<{
    path: string;
    practice: string;
    explanation: string;
  }>;
  confidence_score: number;
  synthesis_type: string;
}

interface SynthesisPayload {
  birth_data?: SynthesisInput['birth_data'];
  spiritual_systems?: SynthesisInput['spiritual_systems'];
  include_all_systems?: boolean;
  synthesis_type?: 'full' | 'focused' | 'summary';
  autoLoad?: boolean; // if false (default) hook starts idle until refresh called
}

interface SynthesisChartResult {
  data: SynthesisOutput | undefined;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useSynthesisChartData(payload: SynthesisPayload = {}): SynthesisChartResult {
  const query = useQuery({
    queryKey: ['synthesis', 'analysis', payload],
    enabled: payload.autoLoad === true,
    queryFn: async (): Promise<SynthesisOutput> => {
      const res = await fetch('/api/synthesis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birth_data: payload.birth_data ?? {},
          spiritual_systems: payload.spiritual_systems ?? {},
          include_all_systems: payload.include_all_systems ?? true,
          synthesis_type: payload.synthesis_type ?? 'full',
        }),
      });
      if (!res.ok) throw new Error('Synthesis analysis failed');
      const result = await res.json() as unknown;
      
      // Basic runtime validation - in production this would use Zod
      if (typeof result === 'object' && result !== null) {
        return result as SynthesisOutput;
      }
      throw new Error('Invalid response format');
    },
    // Cache synthesis results for 10 minutes since they're computationally expensive
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: (query.error as Error) ?? null,
    refresh: () => { void query.refetch(); },
  };
}
