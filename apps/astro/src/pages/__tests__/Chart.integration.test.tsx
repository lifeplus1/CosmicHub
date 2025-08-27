import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BirthDataProvider, useBirthData } from '../../contexts/BirthDataContext';
import Chart from '../Chart';

// Stub ChartDisplay to keep test lightweight
vi.mock('../../components/ChartDisplay/ChartDisplay', () => ({ default: () => <div data-testid='chart-display'/> }));

// Prevent analytics side-effects
vi.mock('../../services/analytics', () => ({
  trackCosmicHubChartCalculation: vi.fn(),
  trackCosmicHubChartView: vi.fn()
}));

// Mock @cosmichub/hooks useChartProcessing to bypass external package loading
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

let originalWarn: typeof console.warn;

beforeAll(() => {
  originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('React Router Future Flag Warning')) return;
    originalWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});

afterEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  vi.clearAllMocks();
});

describe('Chart page integration (canonical pipeline)', () => {
  it('performs calculation with canonical birth data produced from numeric context', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ success: true, data: { planets: {}, houses: [], aspects: [], angles: { ascendant:0, midheaven:0, descendant:180, imumcoeli:180 }, latitude:0, longitude:0, timezone:'UTC', julian_day:0, house_system:'placidus' } });

    const SeedBirthData: React.FC = () => {
      const { setBirthData } = useBirthData();
      React.useEffect(() => {
        setBirthData({ year: 1984, month: 12, day: 5, hour: 9, minute: 7, lat: 11, lon: 22, city: 'Y', timezone: 'UTC' } as any);
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
  const arg = fetchFn.mock.calls[0]![0];
    expect(arg.birth_date).toBe('1984-12-05');
    expect(arg.birth_time).toBe('09:07');
  });

  it('parses URL params into canonical fetch call', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ success: true, data: { planets: {}, houses: [], aspects: [], angles: { ascendant:0, midheaven:0, descendant:180, imumcoeli:180 }, latitude:0, longitude:0, timezone:'UTC', julian_day:0, house_system:'placidus' } });

    // No manual context seeding; rely on URL params consumed in Chart effect
    render(
      <MemoryRouter initialEntries={['/chart?year=2001&month=1&day=2&hour=3&minute=4&city=Z&lat=1&lon=2&timezone=UTC']}>
        <BirthDataProvider>
          <Chart fetchFn={fetchFn} />
        </BirthDataProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));
    const arg = fetchFn.mock.calls[0]![0];
    expect(arg.birth_date).toBe('2001-01-02');
    expect(arg.birth_time).toBe('03:04');
  });

  it('uses saved chart from storage without calling fetchFn', async () => {
    const fetchFn = vi.fn();
    const minimalChart = { planets: {}, houses: [], aspects: [], angles: { ascendant:0, midheaven:0, descendant:180, imumcoeli:180 }, latitude:0, longitude:0, timezone:'UTC', julian_day:0, house_system:'placidus' };
    const saved = {
      chart_data: minimalChart,
      birth_data: { year: 1992, month: 6, day: 7, hour: 8, minute: 9, lat: 1, lon: 2, city: 'SavedVille', timezone: 'UTC' }
    } as any;
    sessionStorage.setItem('selectedChart', JSON.stringify(saved));
    render(
      <MemoryRouter initialEntries={['/chart']}> 
        <BirthDataProvider>
          <Chart fetchFn={fetchFn} />
        </BirthDataProvider>
      </MemoryRouter>
    );
    // Give effect time to process saved chart
  // Wait for primary page heading (level 1) to appear indicating render complete
  await screen.findByRole('heading', { level: 1, name: 'Natal Chart' });
  // Also ensure saved location rendered
  expect(screen.getByText(/SavedVille/)).toBeInTheDocument();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('retries after initial failed calculation', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({ success: false, error: 'fail' })
      .mockResolvedValueOnce({ success: true, data: { planets: {}, houses: [], aspects: [], angles: { ascendant:0, midheaven:0, descendant:180, imumcoeli:180 }, latitude:0, longitude:0, timezone:'UTC', julian_day:0, house_system:'placidus' } });

    const SeedBirthData: React.FC = () => {
      const { setBirthData } = useBirthData();
      React.useEffect(() => {
        setBirthData({ year: 1980, month: 2, day: 3, hour: 4, minute: 5, lat: 6, lon: 7, city: 'RetryTown', timezone: 'UTC' } as any);
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

    // Wait for first (failing) call
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));
    // Assert error alert visible with failure message before retry
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/fail/i);
    const recalcButton = await screen.findByRole('button', { name: /Recalculate/i });
    await act(async () => { recalcButton.click(); });
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));
  });

  it('handles timezone param propagation', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ success: true, data: { planets: {}, houses: [], aspects: [], angles: { ascendant:0, midheaven:0, descendant:180, imumcoeli:180 }, latitude:0, longitude:0, timezone:'America/New_York', julian_day:0, house_system:'placidus' } });
    render(
      <MemoryRouter initialEntries={['/chart?year=2020&month=7&day=4&hour=10&minute=30&city=NYC&lat=40.7&lon=-74&timezone=America/New_York']}>
        <BirthDataProvider>
          <Chart fetchFn={fetchFn} />
        </BirthDataProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));
    const arg = fetchFn.mock.calls[0]![0];
    expect(arg.timezone).toBe('America/New_York');
    expect(arg.birth_date).toBe('2020-07-04');
    expect(arg.birth_time).toBe('10:30');
  });
});
