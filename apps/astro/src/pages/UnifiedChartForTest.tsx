import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@cosmichub/auth';
import { useBirthData } from '../contexts/BirthDataContext';
import { fetchSavedChartById, fetchChartDataUnified, saveChart } from '../services/api';
import type { ChartData, SaveChartRequest } from '../services/api.types';

// Extremely small presentation stub for testing
const ChartDisplay: React.FC<{ onSaveChart?: () => void }> = ({ onSaveChart }) => (
  <div>
    <h1>Astrological Chart</h1>
    {onSaveChart && <button onClick={onSaveChart}>Save Chart</button>}
  </div>
);

export const UnifiedChartForTest: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { birthData, setBirthData } = useBirthData();

  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartId = location.pathname.split('/chart/')[1] ?? searchParams.get('id') ?? undefined;
  const shouldCalculate = searchParams.get('calculate') === 'true';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (chartId && !shouldCalculate) {
          const result = await fetchSavedChartById(chartId as any);
          if (result.success) {
            setChartData(result.data.chart_data as ChartData);
            const bd: any = result.data.birth_data || {};
            if (setBirthData) {
              // Support birth_date + birth_time formats
              if (bd.birth_date && !bd.year) {
                const [y, m, d] = String(bd.birth_date).split('-').map(Number);
                const [hh = 12, mm = 0] = String(bd.birth_time || '12:00').split(':').map(Number);
                setBirthData({ year: y, month: m, day: d, hour: hh, minute: mm, location: bd.city, latitude: bd.lat, longitude: bd.lon, timezone: bd.timezone } as any);
              } else {
                setBirthData(bd as any);
              }
            }
          } else {
            setError(result.error || 'failed');
          }
          return;
        }

        if (shouldCalculate || sessionStorage.getItem('birthData')) {
          const raw = sessionStorage.getItem('birthData');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const [y, m, d] = parsed.date.split('-').map(Number);
            const [hh, mm] = parsed.time.split(':').map(Number);
            const birthPayload = {
              birth_date: parsed.date,
              birth_time: parsed.time,
              latitude: parsed.lat || 0,
              longitude: parsed.lon || 0,
              city: parsed.location,
              timezone: parsed.timezone || 'UTC'
            } as any;
            const result = await fetchChartDataUnified(birthPayload);
            if (result.success) {
              setChartData(result.data);
              if (setBirthData) setBirthData({ year: y, month: m, day: d, hour: hh, minute: mm, location: parsed.location, latitude: parsed.lat, longitude: parsed.lon, timezone: parsed.timezone } as any);
            } else {
              setError(result.error || 'calc failed');
            }
            return;
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [chartId, shouldCalculate, setBirthData]);

  const handleSave = useCallback(async () => {
    if (!chartData || !birthData || !user?.uid) return;
    const req: SaveChartRequest = {
      year: (birthData as any).year,
      month: (birthData as any).month,
      day: (birthData as any).day,
      hour: (birthData as any).hour || 12,
      minute: (birthData as any).minute || 0,
      city: (birthData as any).location || 'Unknown',
      house_system: 'placidus',
      chart_name: 'Test Chart',
      timezone: (birthData as any).timezone || 'UTC',
      lat: (birthData as any).latitude || (birthData as any).lat || 0,
      lon: (birthData as any).longitude || (birthData as any).lon || 0,
    };
    try { await saveChart(req); } catch { /* ignore for test */ }
  }, [chartData, birthData, user?.uid]);

  if (loading) return <div>Loading</div>;
  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>No Chart Data</div>;
  return <ChartDisplay onSaveChart={user ? handleSave : undefined} />;
};

export default UnifiedChartForTest;
