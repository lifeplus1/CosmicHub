import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BirthDataProvider, useBirthData } from '../../contexts/BirthDataContext';
import Chart from '../Chart';

// Silence component logger noise
vi.mock('../../utils/componentLogger', () => ({
  componentLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

// Stub ChartDisplay to keep DOM minimal
vi.mock('../../components/ChartDisplay/ChartDisplay', () => ({ default: () => <div data-testid='chart-display'/> }));

// Analytics spies
const trackCosmicHubChartCalculation = vi.fn();
const trackCosmicHubChartView = vi.fn();
vi.mock('../../services/analytics', () => ({
  trackCosmicHubChartCalculation: (data: any) => trackCosmicHubChartCalculation(data),
  trackCosmicHubChartView: (data: any) => trackCosmicHubChartView(data)
}));

// Mock processing hook to avoid external dependency loading
vi.mock('@cosmichub/hooks', () => ({
  useChartProcessing: (data: any) => ({
    source: data ? 'new_calculation' : 'none',
    hasRawBackend: false,
    planets: [],
    asteroids: [],
    points: [],
    houses: [],
    aspects: [],
    debug: {}
  })
}));

afterEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  vi.clearAllMocks();
});

describe('Chart page analytics integration', () => {
  it('fires success calculation + view analytics on successful fetch', async () => {
    // Deterministic timing
    const dateSpy = vi
      .spyOn(Date, 'now')
      .mockImplementationOnce(() => 1000) // startTime
      .mockImplementation(() => 1100); // calculation end
    const fetchFn = vi.fn().mockResolvedValue({ success: true, data: { planets: {}, houses: [], aspects: [], angles: { ascendant:0, midheaven:0, descendant:180, imumcoeli:180 }, latitude:0, longitude:0, timezone:'UTC', julian_day:0, house_system:'placidus' } });

    const SeedBirthData: React.FC = () => {
      const { setBirthData } = useBirthData();
      React.useEffect(() => {
        setBirthData({ year: 1990, month: 1, day: 2, hour: 3, minute: 4, lat: 10, lon: 20, city: 'AnalyticsTown', timezone: 'UTC' } as any);
      }, [setBirthData]);
      return null;
    };

    render(
      <MemoryRouter initialEntries={['/chart']}>
        <BirthDataProvider>
          <SeedBirthData />
          <Chart fetchFn={fetchFn} />
        </BirthDataProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(trackCosmicHubChartCalculation).toHaveBeenCalledTimes(1));
    const calcArgs = trackCosmicHubChartCalculation.mock.calls[0]![0];
    expect(calcArgs.success).toBe(true);
    expect(calcArgs.chart_type).toBe('natal');
  expect(calcArgs.calculation_time_ms).toBe(100); // 1100 - 1000
    expect(calcArgs.house_system).toBe('placidus');
  dateSpy.mockRestore();

    await waitFor(() => expect(trackCosmicHubChartView).toHaveBeenCalledTimes(1));
    const viewArgs = trackCosmicHubChartView.mock.calls[0]![0];
    expect(viewArgs.chart_type).toBe('natal');
  });

  it('fires api_error analytics on backend-reported failure and no view event', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ success: false, error: 'backend failure' });

    const SeedBirthData: React.FC = () => {
      const { setBirthData } = useBirthData();
      React.useEffect(() => {
        setBirthData({ year: 1988, month: 8, day: 8, hour: 8, minute: 8, lat: 1, lon: 2, city: 'FailVille', timezone: 'UTC' } as any);
      }, [setBirthData]);
      return null;
    };

    render(
      <MemoryRouter initialEntries={['/chart']}>
        <BirthDataProvider>
          <SeedBirthData />
          <Chart fetchFn={fetchFn} />
        </BirthDataProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(trackCosmicHubChartCalculation).toHaveBeenCalledTimes(1));
    const calcArgs = trackCosmicHubChartCalculation.mock.calls[0]![0];
    expect(calcArgs.success).toBe(false);
    expect(calcArgs.error_type).toBe('api_error');
    expect(trackCosmicHubChartView).not.toHaveBeenCalled();
  });

  it('fires exception analytics on thrown error path', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('boom'));

    const SeedBirthData: React.FC = () => {
      const { setBirthData } = useBirthData();
      React.useEffect(() => {
        setBirthData({ year: 1975, month: 5, day: 15, hour: 6, minute: 7, lat: 3, lon: 4, city: 'ExceptionCity', timezone: 'UTC' } as any);
      }, [setBirthData]);
      return null;
    };

    render(
      <MemoryRouter initialEntries={['/chart']}>
        <BirthDataProvider>
          <SeedBirthData />
          <Chart fetchFn={fetchFn} />
        </BirthDataProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(trackCosmicHubChartCalculation).toHaveBeenCalledTimes(1));
    const calcArgs = trackCosmicHubChartCalculation.mock.calls[0]![0];
    expect(calcArgs.success).toBe(false);
    expect(calcArgs.error_type).toBe('exception');
  });

  it('does not call fetch or analytics when URL params incomplete (parseBirthParams returns null)', async () => {
    const fetchFn = vi.fn();
    render(
      <MemoryRouter initialEntries={['/chart?year=2000&month=1&day=2']}> {/* missing hour/minute etc */}
        <BirthDataProvider>
          <Chart fetchFn={fetchFn} />
        </BirthDataProvider>
      </MemoryRouter>
    );

    // Wait a tick for effects
    await waitFor(() => {
      // Expect fallback heading present
      expect(screen.getByRole('heading', { name: /No Birth Data Available/i })).toBeInTheDocument();
    });
    expect(fetchFn).not.toHaveBeenCalled();
    expect(trackCosmicHubChartCalculation).not.toHaveBeenCalled();
    expect(trackCosmicHubChartView).not.toHaveBeenCalled();
  });
});
