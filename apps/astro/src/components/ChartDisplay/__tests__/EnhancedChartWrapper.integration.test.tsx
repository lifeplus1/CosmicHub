import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import {
  BirthDataProvider,
  useBirthData,
} from '../../../contexts/BirthDataContext';
import { EnhancedChartWrapper } from '../EnhancedChartWrapper';

// Lightweight stub for ChartDisplay to avoid deep tree
vi.mock('../ChartDisplay', () => ({
  ChartDisplay: () => <div data-testid='chart-display' />,
}));

describe('EnhancedChartWrapper (integration via injected fetchFn)', () => {
  it('calls injected fetchFn with canonical birth data once data is set', async () => {
    const mockResult = {
      success: true,
      data: {
        planets: [],
        houses: [],
        aspects: [],
        angles: [],
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
        julian_day: 0,
        house_system: 'placidus',
      },
    } as any;
    const fetchFn = vi.fn().mockResolvedValue(mockResult);

    const SetBirthData: React.FC = () => {
      const { setBirthData } = useBirthData();
      React.useEffect(() => {
        // Clear any existing birth data first
        setBirthData(null as any);
        // Then set the test data
        setBirthData({
          year: 1990,
          month: 5,
          day: 6,
          hour: 7,
          minute: 8,
          lat: 1,
          lon: 2,
          city: 'X',
          timezone: 'UTC',
        } as any);
      }, [setBirthData]);
      return null;
    };

    render(
      <BirthDataProvider>
        <SetBirthData />
        <EnhancedChartWrapper birthData={{} as any} fetchFn={fetchFn} />
      </BirthDataProvider>
    );

    await waitFor(() => expect(fetchFn).toHaveBeenCalled(), { timeout: 15000 });
    // The fetch function might be called multiple times due to re-renders,
    // but we only care about the first call with correct arguments
    const calls = fetchFn.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const arg = calls[0]![0];
    expect(arg.birth_date).toBe('1990-05-06');
    expect(arg.birth_time).toBe('07:08');
  }, 20000);
});
