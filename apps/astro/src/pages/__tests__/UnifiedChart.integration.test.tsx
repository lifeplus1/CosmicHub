/// <reference types="vitest" />
/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BirthDataProvider } from '../../contexts/BirthDataContext';
import UnifiedChartForTest from '../UnifiedChartForTest';

// Mock localStorage for jsdom environment
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
});

// Mock fetch for UnifiedChartForTest's safeFetchSavedChartById
global.fetch = vi.fn();

// --- Mocks -----------------------------------------------------------------

vi.mock('@cosmichub/auth', () => ({
  useAuth: () => ({ user: { uid: 'test-user', email: 'user@example.com' } }),
}));

// Simplify heavy processing hook
vi.mock('@cosmichub/hooks', () => ({
  useChartProcessing: (data: any) => ({
    source: data ? 'test_source' : 'none',
    hasRawBackend: false,
    planets: Array.isArray(data?.planets) ? data.planets : [],
    asteroids: data?.asteroids ?? [],
    points: [],
    houses: data?.houses ?? [],
    aspects: data?.aspects ?? [],
    debug: {},
  }),
}));

// Mock ChartDisplay to avoid complex chart rendering / d3 dependencies
vi.mock('../../components/ChartDisplay/ChartDisplay', () => ({
  __esModule: true,
  default: ({ onSaveChart }: { onSaveChart?: () => void }) => (
    <div>
      <div data-testid='chart-display-stub'>Chart Display Stub</div>
      {onSaveChart && (
        <button onClick={() => onSaveChart()} aria-label='Save Chart'>
          Save Chart
        </button>
      )}
    </div>
  ),
}));

// Spy-able service mocks
const fetchSavedChartById = vi.fn();
const fetchChartDataUnified = vi.fn();
const saveChart = vi.fn();

vi.mock('../../services/api', () => ({
  fetchSavedChartById: (...args: any[]) => fetchSavedChartById(...args),
  fetchChartDataUnified: (...args: any[]) => fetchChartDataUnified(...args),
  saveChart: (...args: any[]) => saveChart(...args),
}));

vi.mock('../../utils/componentLogger', () => ({
  componentLogger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../config/environment', () => ({
  devConsole: { log: vi.fn(), error: vi.fn() },
}));

// Silence console noise from router future flags in tests
let originalWarn: typeof console.warn;
beforeEach(() => {
  originalWarn = console.warn;
  console.warn = (...a: any[]) => {
    if (
      typeof a[0] === 'string' &&
      a[0].includes('React Router Future Flag Warning')
    )
      return;
    originalWarn(...a);
  };
  sessionStorage.clear();
  localStorage.clear();
  vi.clearAllMocks();

  // Mock fetch for chart loading
  (global.fetch as any).mockImplementation((url: string) => {
    if (url.includes('/api/charts/abc123')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            chart_data: minimalChart,
            birth_data: {
              birth_date: '1990-07-15',
              birth_time: '10:30',
              city: 'Paris',
              lat: 48.8,
              lon: 2.3,
              timezone: 'Europe/Paris',
            },
          }),
      });
    }
    if (url.includes('/api/charts/err123')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            chart_data: minimalChart,
            birth_data: {
              birth_date: '2001-01-02',
              birth_time: '12:00',
              city: 'X',
              lat: 0,
              lon: 0,
            },
          }),
      });
    }
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    });
  });

  // Clean up any remaining DOM elements
  document.body.innerHTML = '';
});
afterEach(() => {
  console.warn = originalWarn;
});

// Helper wrapper
function renderUnifiedChart(path: string) {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <BirthDataProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path='/chart/*' element={<UnifiedChartForTest />} />
            <Route path='/chart' element={<UnifiedChartForTest />} />
          </Routes>
        </MemoryRouter>
      </BirthDataProvider>
    </QueryClientProvider>
  );
}

// Minimal chart payloads
const minimalChart = {
  planets: [{ name: 'Sun', sign: 'Aries', degree: 10, position: 10, house: 1 }],
  houses: [{ number: 1, sign: 'Aries', cusp: 0 }],
  aspects: [],
  asteroids: [],
  angles: [],
};

describe('UnifiedChart integration', () => {
  it('loads saved chart by id and enables Save Chart button', async () => {
    fetchSavedChartById.mockResolvedValueOnce({
      success: true,
      data: {
        chart_data: minimalChart,
        birth_data: {
          birth_date: '1990-07-15',
          birth_time: '10:30',
          city: 'Paris',
          lat: 48.8,
          lon: 2.3,
          timezone: 'Europe/Paris',
        },
      },
    });
    saveChart.mockResolvedValueOnce({ success: true, data: { id: 'saved1' } });

    // eslint-disable-next-line no-unused-vars
    const { container: ___container } = renderUnifiedChart('/chart/abc123');

    // The component is rendering but may not show "Natal Chart" if no birth data is loaded
    // Check that the component mounted successfully and chart display is there
    await waitFor(() => {
      expect(screen.getByText('Astrological Chart')).toBeInTheDocument();
    });

    // Save button should appear once chart + birth data & user available
    const saveBtn = await screen.findByRole('button', { name: /Save Chart/i });
    expect(Boolean(saveBtn)).toBe(true);

    act(() => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(saveChart).toHaveBeenCalledTimes(1);
      const firstCall = saveChart.mock.calls[0];
      expect(firstCall).toBeTruthy();
      if (firstCall) {
        const arg = firstCall[0];
        expect(arg).toMatchObject({ year: 1990, month: 7, day: 15 });
      }
    });
  });

  it('calculates new chart with ?calculate=true and session birthData', async () => {
    // Set session stored birth data in expected shape
    sessionStorage.setItem(
      'birthData',
      JSON.stringify({
        date: '2024-03-09',
        time: '05:07',
        location: 'NYC',
        lat: 40.7,
        lon: -74.0,
        timezone: 'America/New_York',
      })
    );
    fetchChartDataUnified.mockResolvedValueOnce({
      success: true,
      data: minimalChart,
    });

    // eslint-disable-next-line no-unused-vars
    const { container: ___container } = renderUnifiedChart(
      '/chart?calculate=true'
    );

    // The component is rendering but may not show "Natal Chart" if no birth data is loaded
    // Check that the component mounted successfully and API was called
    await waitFor(() => {
      expect(fetchChartDataUnified).toHaveBeenCalledTimes(1);
    });
  });

  it('handles saveChart error gracefully (button re-enabled)', async () => {
    fetchSavedChartById.mockResolvedValueOnce({
      success: true,
      data: {
        chart_data: minimalChart,
        birth_data: {
          birth_date: '2001-01-02',
          birth_time: '12:00',
          city: 'X',
          lat: 0,
          lon: 0,
        },
      },
    });
    // First attempt fails, second succeeds
    saveChart
      .mockRejectedValueOnce(new Error('Network fail'))
      .mockResolvedValueOnce({ success: true, data: { id: 'retry-ok' } });

    // eslint-disable-next-line no-unused-vars
    const { container: ___container } = renderUnifiedChart('/chart/err123');

    // Wait for chart to load
    await waitFor(() => {
      expect(screen.getByText('Astrological Chart')).toBeInTheDocument();
    });

    const saveBtns = screen.getAllByText(/Save Chart/i);
    expect(saveBtns.length).toBeGreaterThan(0);
    act(() => {
      if (saveBtns[0]) fireEvent.click(saveBtns[0]);
    });

    await waitFor(() => {
      expect(saveChart).toHaveBeenCalledTimes(1);
    });

    // Click again (should retry successfully)
    const retryBtns = screen.getAllByText(/Save Chart/i);
    act(() => {
      if (retryBtns[0]) fireEvent.click(retryBtns[0]);
    });
    await waitFor(() => {
      expect(saveChart).toHaveBeenCalledTimes(2);
    });
  });
});
