import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@cosmichub/auth';
import { useBirthData } from '../contexts/BirthDataContext';
import { fetchChartDataUnified, saveChart } from '../services/api';
import type { ChartData } from '../types/astrology.types';
import type { ChartBirthData } from '@cosmichub/types';
// Local lightweight SaveChartRequest subset (avoid broken re-export)
interface SaveChartRequest {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  house_system?: string;
  chart_name?: string;
  timezone?: string;
  lat?: number;
  lon?: number;
}
// (Removed ok() usage for local result typing to avoid bringing in broader ApiResult inference)

// Lightweight chart fetch (safe) – replace missing fetchSavedChartById with guarded fetch
interface SavedChartPayload {
  chart_data: ChartData;
  birth_data: Record<string, unknown>;
}
type LocalResult<T> =
  | { success: true; data: T }
  | { success: false; error?: string };
function isSuccess<T>(v: LocalResult<T>): v is { success: true; data: T } {
  return v.success === true;
}
function isFailure<T>(
  v: LocalResult<T>
): v is { success: false; error?: string } {
  return v.success === false;
}
interface RawBirthData {
  birth_date?: string;
  birth_time?: string;
  city?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
}

const toRawBirthData = (v: unknown): RawBirthData => {
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return {
      birth_date: typeof o.birth_date === 'string' ? o.birth_date : undefined,
      birth_time: typeof o.birth_time === 'string' ? o.birth_time : undefined,
      city: typeof o.city === 'string' ? o.city : undefined,
      lat: typeof o.lat === 'number' ? o.lat : undefined,
      lon: typeof o.lon === 'number' ? o.lon : undefined,
      timezone: typeof o.timezone === 'string' ? o.timezone : undefined,
      year: typeof o.year === 'number' ? o.year : undefined,
      month: typeof o.month === 'number' ? o.month : undefined,
      day: typeof o.day === 'number' ? o.day : undefined,
      hour: typeof o.hour === 'number' ? o.hour : undefined,
      minute: typeof o.minute === 'number' ? o.minute : undefined,
    };
  }
  return {};
};
const safeFetchSavedChartById = async (
  chartId: string
): Promise<LocalResult<SavedChartPayload>> => {
  try {
    const res = await fetch(`/api/charts/${encodeURIComponent(chartId)}`);
    if (!res.ok) return { success: false, error: `Failed (${res.status})` };
    const data: unknown = await res.json();
    if (data && typeof data === 'object' && 'chart_data' in data) {
      const typed = data as SavedChartPayload;
      return { success: true, data: typed };
    }
    return { success: false, error: 'Malformed chart response' };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
};

// Extremely small presentation stub for testing
const ChartDisplay: React.FC<{ onSaveChart?: () => void }> = ({
  onSaveChart,
}) => (
  <div>
    <h1>Astrological Chart</h1>
    {onSaveChart && (
      <button
        onClick={() => {
          void onSaveChart();
        }}
      >
        Save Chart
      </button>
    )}
  </div>
);

export const UnifiedChartForTest: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { birthData, setBirthData } = useBirthData();

  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartId =
    location.pathname.split('/chart/')[1] ??
    searchParams.get('id') ??
    undefined;
  const shouldCalculate = searchParams.get('calculate') === 'true';

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        if (chartId && !shouldCalculate) {
          const result = await safeFetchSavedChartById(chartId);
          if (!active) return;
          if (isSuccess(result)) {
            const chartPayload = result.data.chart_data;
            setChartData(chartPayload);
            if (setBirthData) {
              const bd = toRawBirthData(result.data.birth_data);
              const birthDate = bd.birth_date ?? '';
              const birthTime = bd.birth_time ?? '12:00';
              if (
                birthDate &&
                (bd.year === undefined ||
                  bd.month === undefined ||
                  bd.day === undefined)
              ) {
                const parts = birthDate.split('-');
                const yStr = parts[0] ?? '0';
                const mStr = parts[1] ?? '0';
                const dStr = parts[2] ?? '0';
                const [hhStr = '12', mmStr = '0'] = birthTime.split(':');
                const y = Number(yStr),
                  m = Number(mStr),
                  d = Number(dStr);
                const hh = Number(hhStr),
                  mm = Number(mmStr);
                if (
                  Number.isFinite(y) &&
                  Number.isFinite(m) &&
                  Number.isFinite(d)
                ) {
                  setBirthData({
                    year: y,
                    month: m,
                    day: d,
                    hour: Number.isFinite(hh) ? hh : 12,
                    minute: Number.isFinite(mm) ? mm : 0,
                    location: bd.city,
                    latitude: bd.lat ?? 0,
                    longitude: bd.lon ?? 0,
                    timezone: bd.timezone ?? 'UTC',
                  });
                }
              } else if (bd.year && bd.month && bd.day) {
                setBirthData({
                  year: bd.year,
                  month: bd.month,
                  day: bd.day,
                  hour: bd.hour ?? 12,
                  minute: bd.minute ?? 0,
                  location: bd.city,
                  latitude: bd.lat ?? 0,
                  longitude: bd.lon ?? 0,
                  timezone: bd.timezone ?? 'UTC',
                });
              }
            }
          } else if (isFailure(result)) {
            setError(
              typeof result.error === 'string'
                ? result.error
                : 'Failed to load chart'
            );
          }
          return;
        }
        if (shouldCalculate || sessionStorage.getItem('birthData')) {
          const raw = sessionStorage.getItem('birthData');
          if (!raw) return;
          let parsed: unknown;
          try {
            parsed = JSON.parse(raw);
          } catch {
            setError('Invalid stored birth data');
            return;
          }
          if (!parsed || typeof parsed !== 'object') {
            setError('Malformed birth data');
            return;
          }
          const rec = toRawBirthData(parsed);
          const dateStr = rec.birth_date ?? '';
          const timeStr = rec.birth_time ?? '12:00';
          const parts = dateStr.split('-');
          const yStr = parts[0] ?? '0';
          const mStr = parts[1] ?? '0';
          const dStr = parts[2] ?? '0';
          const [hhStr, mmStr] = timeStr.split(':');
          const payload = {
            year: Number(yStr),
            month: Number(mStr),
            day: Number(dStr),
            hour: Number(hhStr ?? 12),
            minute: Number(mmStr ?? 0),
            lat: rec.lat ?? 0,
            lon: rec.lon ?? 0,
            city: rec.city ?? 'Unknown',
            timezone: rec.timezone ?? 'UTC',
            birth_date: dateStr,
            birth_time: timeStr,
          } satisfies ChartBirthData;
          const rawUnified: unknown = await fetchChartDataUnified(
            payload as ChartBirthData
          );
          if (!active) return;
          interface SuccessU<T> {
            success: true;
            data: T;
          }
          interface FailureU {
            success: false;
            error?: string;
          }
          const isUnifiedSuccess = <T,>(v: unknown): v is SuccessU<T> =>
            typeof v === 'object' &&
            v !== null &&
            (v as { success?: unknown }).success === true &&
            'data' in (v as Record<string, unknown>);
          const isUnifiedFailure = (v: unknown): v is FailureU =>
            typeof v === 'object' &&
            v !== null &&
            (v as { success?: unknown }).success === false;
          if (isUnifiedSuccess<ChartData>(rawUnified)) {
            setChartData(rawUnified.data);
            if (setBirthData) {
              setBirthData({
                year: Number(payload.year),
                month: Number(payload.month),
                day: Number(payload.day),
                hour: Number(payload.hour),
                minute: Number(payload.minute),
                location: payload.city,
                latitude: Number(payload.lat),
                longitude: Number(payload.lon),
                timezone: payload.timezone,
              });
            }
          } else if (isUnifiedFailure(rawUnified)) {
            setError(
              typeof rawUnified.error === 'string'
                ? rawUnified.error
                : 'Calculation failed'
            );
          }
          return;
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [chartId, shouldCalculate, setBirthData]);

  const handleSave = useCallback(async () => {
    if (!chartData || !birthData || !user?.uid) return;
    const req: SaveChartRequest = {
      year: birthData.year,
      month: birthData.month,
      day: birthData.day,
      hour: birthData.hour ?? 12,
      minute: birthData.minute ?? 0,
      city:
        (typeof (birthData as unknown as { city?: unknown }).city === 'string'
          ? (birthData as unknown as { city?: string }).city
          : typeof birthData.location === 'string'
            ? birthData.location
            : 'Unknown') ?? 'Unknown',
      house_system: 'placidus',
      chart_name: 'Test Chart',
      timezone: birthData.timezone ?? 'UTC',
      lat:
        (birthData as unknown as { lat?: number }).lat ??
        birthData.latitude ??
        0,
      lon:
        (birthData as unknown as { lon?: number }).lon ??
        birthData.longitude ??
        0,
    };
    try {
      await saveChart(req);
    } catch {
      /* swallow for test */
    }
  }, [chartData, birthData, user?.uid]);

  if (loading) return <div>Loading</div>;
  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>No Chart Data</div>;
  return (
    <ChartDisplay
      onSaveChart={
        user
          ? () => {
              void handleSave();
            }
          : undefined
      }
    />
  );
};

export default UnifiedChartForTest;
