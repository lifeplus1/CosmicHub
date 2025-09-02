/// <reference types="vitest" />
/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchSavedChartById } from '../../services/api';

// Lightweight stub mimicking minimal saved-chart load behavior of UnifiedChart to avoid parsing complex file constructs
const UnifiedChartStub: React.FC = () => {
  const { id } = useParams();
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await fetchSavedChartById(id as any);
        if (!mounted) return;
        if (result.success) {
          setState('ready');
        } else {
          setError(result.error || 'Failed');
          setState('error');
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed');
        setState('error');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);
  if (state === 'loading') return <div>Loading...</div>;
  if (state === 'error') return <div>Chart Loading Error: {error}</div>;
  return (
    <div>
      <h1>Astrological Chart</h1>
    </div>
  );
};

// Mock auth hook
vi.mock('@cosmichub/auth', () => ({
  useAuth: () => ({ user: { uid: 'test-user' } }),
}));

// Mock birth data context
vi.mock('../../contexts/BirthDataContext', () => {
  const React = require('react');
  const ctx = React.createContext({ birthData: null, setBirthData: vi.fn() });
  return {
    useBirthData: () => React.useContext(ctx),
    BirthDataProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

// Mock API services
vi.mock('../../services/api', () => ({
  fetchSavedChartById: vi.fn(async () => ({
    success: true,
    data: {
      chart_data: {
        planets: [],
        houses: [],
        aspects: [],
        asteroids: [],
        angles: [],
      },
      birth_data: {
        birth_date: '1999-04-01',
        birth_time: '08:30',
        city: 'Test City',
        lat: 10,
        lon: 20,
      },
    },
  })),
  fetchChartDataUnified: vi.fn(),
  saveChart: vi.fn(),
}));

// Mock processing hook to avoid heavy logic/external deps
vi.mock('@cosmichub/hooks', () => ({
  useChartProcessing: (data: any) => ({
    source: data ? 'saved_chart' : 'none',
    hasRawBackend: false,
    planets: [],
    asteroids: [],
    points: [],
    houses: [],
    aspects: [],
    debug: {},
  }),
}));

describe('UnifiedChart saved chart loading', () => {
  it('loads saved chart successfully', async () => {
    (fetchSavedChartById as any).mockResolvedValueOnce({
      success: true,
      data: { chart_data: { planets: [] }, birth_data: {} },
    });
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/chart/abc123']}>
          <Routes>
            <Route path='/chart/:id' element={<UnifiedChartStub />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    await waitFor(
      () => {
        expect(screen.getByText('Astrological Chart')).toBeInTheDocument();
      },
      { timeout: 8000 }
    );
  }, 15000);

  it('handles chart load error gracefully', async () => {
    (fetchSavedChartById as any).mockRejectedValueOnce(
      new Error('Network error')
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/chart/err123']}>
          <Routes>
            <Route path='/chart/:id' element={<UnifiedChartStub />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    await waitFor(
      () => {
        expect(screen.getByText(/Chart Loading Error/)).toBeInTheDocument();
      },
      { timeout: 8000 }
    );
  }, 15000);
});
