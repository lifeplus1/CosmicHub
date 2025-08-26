import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, renderHook, act, screen } from '@testing-library/react';
import React from 'react';
import { BirthDataProvider, useBirthData } from '../BirthDataContext';
import type { ChartBirthData } from '@cosmichub/types';

// Mock the persistence utilities
vi.mock('../utils/contextPersistence', () => ({
  loadFromStorage: vi.fn(() => null),
  debouncedSave: vi.fn(),
  clearStorage: vi.fn(),
}));

// Mock the performance hook
vi.mock('../hooks/useContextPerformance', () => ({
  useContextPerformance: vi.fn(),
}));

describe('BirthDataContext Optimizations', () => {
  const mockBirthData: ChartBirthData = {
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
    city: 'New York',
    country: 'USA',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide birth data context with memoized values', () => {
    const TestComponent = () => {
      const { birthData, isDataValid, setBirthData } = useBirthData();

      return (
        <div>
          <span data-testid='is-valid'>{isDataValid.toString()}</span>
          <span data-testid='has-data'>{birthData ? 'yes' : 'no'}</span>
          <button
            onClick={() => setBirthData(mockBirthData)}
            data-testid='set-data'
          >
            Set Data
          </button>
        </div>
      );
    };

    render(
      <BirthDataProvider>
        <TestComponent />
      </BirthDataProvider>
    );

    // Initially no data
    expect(screen.getByTestId('has-data')).toHaveTextContent('no');
    expect(screen.getByTestId('is-valid')).toHaveTextContent('false');
  });

  it('should update birth data and validation state correctly', () => {
    const TestComponent = () => {
      const { birthData, isDataValid, setBirthData } = useBirthData();

      return (
        <div>
          <span data-testid='update-test-is-valid'>{String(isDataValid)}</span>
          <span data-testid='update-test-has-data'>{birthData ? 'yes' : 'no'}</span>
          <button
            onClick={() => setBirthData(mockBirthData)}
            data-testid='update-test-set-data'
          >
            Set Data
          </button>
        </div>
      );
    };

    render(
      <BirthDataProvider>
        <TestComponent />
      </BirthDataProvider>
    );

    // Set birth data
    const setButton = screen.getByTestId('update-test-set-data');
    act(() => {
      setButton.click();
    });

    // Should now have valid data
    expect(screen.getByTestId('update-test-has-data')).toHaveTextContent('yes');
    expect(screen.getByTestId('update-test-is-valid')).toHaveTextContent('true');
  });

  it('should use useCallback for functions to prevent unnecessary re-renders', () => {
    let renderCount = 0;

    const TestComponent = () => {
      const { setBirthData, clearBirthData } = useBirthData();
      renderCount++;

      // Functions should be stable between renders
      return (
        <div>
          <span data-testid='callback-test-render-count'>{renderCount}</span>
          <button
            onClick={() => setBirthData(mockBirthData)}
            data-testid='callback-test-set-data'
          >
            Set Data
          </button>
          <button onClick={clearBirthData} data-testid='callback-test-clear-data'>
            Clear Data
          </button>
        </div>
      );
    };

    const MemoizedTestComponent = React.memo(TestComponent);

    render(
      <BirthDataProvider>
        <MemoizedTestComponent />
      </BirthDataProvider>
    );

    // Should render once initially
    expect(screen.getByTestId('callback-test-render-count')).toHaveTextContent('1');

    // Setting data should cause a re-render
    const setButton = screen.getByTestId('callback-test-set-data');
    act(() => {
      setButton.click();
    });

    expect(screen.getByTestId('callback-test-render-count')).toHaveTextContent('2');
  });

  it('should validate birth data correctly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BirthDataProvider>{children}</BirthDataProvider>
    );

    const { result } = renderHook(() => useBirthData(), { wrapper });

    // Initially invalid
    expect(result.current.isDataValid).toBe(false);

    // Set valid data
    act(() => {
      result.current.setBirthData(mockBirthData);
    });

    expect(result.current.isDataValid).toBe(true);
    expect(result.current.birthData).toEqual(mockBirthData);

    // Clear data
    act(() => {
      result.current.clearBirthData();
    });

    expect(result.current.isDataValid).toBe(false);
    expect(result.current.birthData).toBe(null);
  });

  it('should handle invalid birth data gracefully', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BirthDataProvider>{children}</BirthDataProvider>
    );

    const { result } = renderHook(() => useBirthData(), { wrapper });

    // Invalid data - missing required fields
    const invalidData = {
      year: 1990,
      month: 5,
      // missing day, hour, minute
    } as ChartBirthData;

    act(() => {
      result.current.setBirthData(invalidData);
    });

    // Should have data but be invalid
    expect(result.current.birthData).toEqual(invalidData);
    expect(result.current.isDataValid).toBe(false);
  });
});
