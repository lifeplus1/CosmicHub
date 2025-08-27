import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface RealtimeMetrics {
  realTimeUsers: number;
  chartCalculationsPerMinute: number;
  aiInteractionsPerHour: number;
  mobileAppSessions: number;
  subscriptionConversions: number;
  errorRate: number;
  averageResponseTime: number;
  averageSessionDurationMs?: number;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

export default function AnalyticsDashboard(): React.ReactElement {
  const queryClient = useQueryClient();
  const { data: realtime, refetch } = useQuery<RealtimeMetrics>({
    queryKey: ['analytics','realtime'],
    queryFn: () => fetchJSON<RealtimeMetrics>('/api/analytics/realtime'),
    refetchInterval: 5000,
  });

  const { data: astrology } = useQuery({
    queryKey: ['analytics','astrology','week'],
    queryFn: () => fetchJSON<any>('/api/analytics/astrology?timeframe=week'),
    staleTime: 60_000,
  });

  const { data: daily } = useQuery({
    queryKey: ['analytics','daily'],
    queryFn: () => fetchJSON<any>('/api/analytics/daily'),
    staleTime: 30_000,
  });

  return (
    <div className='min-h-screen bg-gradient-to-br from-cosmic-blue via-cosmic-purple to-cosmic-dark p-6'>
      <div className='max-w-7xl mx-auto space-y-8'>
        <h1 className='text-3xl font-bold text-cosmic-gold text-center'>📊 Analytics Dashboard</h1>

        <section className='grid gap-4 md:grid-cols-3 lg:grid-cols-4'>
          <MetricCard label='Active Users (1h)' value={realtime?.realTimeUsers} />
          <MetricCard label='Chart Calcs (10m)' value={realtime?.chartCalculationsPerMinute} />
          <MetricCard label='AI Interactions (1h)' value={realtime?.aiInteractionsPerHour} />
          <MetricCard label='Mobile Sessions (Today)' value={realtime?.mobileAppSessions} />
          <MetricCard label='Error Rate' value={realtime ? (realtime.errorRate * 100).toFixed(2) + '%' : undefined} />
          <MetricCard label='Avg API Response' value={realtime?.averageResponseTime ? realtime.averageResponseTime.toFixed(1) + ' ms' : undefined} />
          <MetricCard label='Avg Session Duration' value={realtime?.averageSessionDurationMs ? (realtime.averageSessionDurationMs/1000).toFixed(0) + 's' : undefined} />
          <MetricCard label='Subscriptions (mock)' value={realtime?.subscriptionConversions} />
        </section>

        <section className='cosmic-glass p-6 rounded-lg border border-cosmic-silver/20'>
          <h2 className='text-xl font-semibold text-cosmic-gold mb-4'>Chart Calculations (Week)</h2>
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
            {astrology?.chartCalculations && Object.entries(astrology.chartCalculations).map(([k,v]: any) => (
              <div key={k} className='p-3 bg-cosmic-dark/40 rounded'>
                <div className='text-cosmic-silver text-sm'>{k}</div>
                <div className='text-cosmic-gold text-lg font-bold'>{v}</div>
              </div>
            ))}
          </div>
        </section>

        <section className='cosmic-glass p-6 rounded-lg border border-cosmic-silver/20'>
          <h2 className='text-xl font-semibold text-cosmic-gold mb-4'>AI Feature Usage (Week)</h2>
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
            {astrology?.aiFeatureUsage && Object.entries(astrology.aiFeatureUsage).map(([k,v]: any) => (
              <div key={k} className='p-3 bg-cosmic-dark/40 rounded'>
                <div className='text-cosmic-silver text-sm'>{k}</div>
                <div className='text-cosmic-gold text-lg font-bold'>{v}</div>
              </div>
            ))}
          </div>
        </section>

        <section className='cosmic-glass p-6 rounded-lg border border-cosmic-silver/20'>
            <h2 className='text-xl font-semibold text-cosmic-gold mb-4'>Daily Metrics</h2>
            <pre className='text-xs overflow-x-auto whitespace-pre-wrap text-cosmic-silver'>
              {JSON.stringify(daily?.metrics || {}, null, 2)}
            </pre>
            <button onClick={() => { void refetch(); }} className='mt-4 px-4 py-2 bg-cosmic-purple hover:bg-cosmic-blue rounded text-white'>Refresh Realtime</button>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string | undefined }) {
  return (
    <div className='cosmic-glass p-4 rounded-lg border border-cosmic-silver/20 flex flex-col'>
      <span className='text-xs uppercase tracking-wide text-cosmic-silver'>{label}</span>
      <span className='mt-1 text-2xl font-semibold text-cosmic-gold'>{value ?? '—'}</span>
    </div>
  );
}
