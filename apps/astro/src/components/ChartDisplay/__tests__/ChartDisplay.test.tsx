// apps/astro/src/components/ChartDisplay/__tests__/ChartDisplay.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import ChartDisplay from '../ChartDisplay';

// Mock the astrologyService module
vi.mock('@/services/astrologyService', () => ({
  fetchChartData: vi.fn(),
}));

const mockChartData = {
  planets: {
    sun: { name: 'Sun', sign: 'Leo', position: 135.25, house: 5, aspects: [{ type: 'Conjunction', target: 'Mercury', orb: 2.5 }] },
    moon: { name: 'Moon', sign: 'Pisces', position: 345.18, house: 7, aspects: [{ type: 'Trine', target: 'Sun', orb: 1.8 }] }
  },
  asteroids: [{ name: 'Ceres', sign: 'Virgo', house: 6, degree: 10.75, aspects: [] }],
  angles: {
    ascendant: { name: 'Ascendant', sign: 'Aries', position: 12.33 },
    midheaven: { name: 'Midheaven', sign: 'Capricorn', position: 282.15 }
  },
  houses: [
    { number: 1, sign: 'Aries', cusp: 12.33, planets: ['Sun'] },
    { number: 2, sign: 'Taurus', cusp: 42.15, planets: [] }
  ],
  aspects: [{ planet1: 'Sun', planet2: 'Mercury', type: 'Conjunction', orb: 2.5, applying: true }],
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('ChartDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chart component without errors', () => {
    const mockChart: any = {
      planets: { sun: { name: 'Sun', sign: 'Leo' } },
      houses: [],
      aspects: [],
      asteroids: [],
      angles: { ascendant: 0 }
    };

    render(
      <QueryClientProvider client={queryClient}>
        <ChartDisplay chart={mockChart} />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Chart Analysis/)).toBeDefined();
  });

  it('renders chart data correctly when provided as prop', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ChartDisplay chart={mockChartData} chartType="natal" />
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Chart Analysis/)).toBeDefined();
    expect(screen.getAllByText('Sun').length).toBeGreaterThan(0);
    expect(screen.getByText('Ceres')).toBeDefined();
    expect(screen.getByText('Ascendant')).toBeDefined();
  });

  it('filters data on search', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ChartDisplay chart={mockChartData} chartType="natal" />
      </QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText('🔍 Search planets, signs, aspects...');
    fireEvent.change(searchInput, { target: { value: 'Sun' } });

    expect(await screen.findAllByText('Sun')).toHaveLength(2); // In planet table and aspect table
    expect(screen.queryByText('Ceres')).toBeNull();
  });

  it('displays sample data when no chart data is provided', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ChartDisplay chartType="natal" />
      </QueryClientProvider>
    );

    // Component shows sample data instead of "No chart data available"
    expect(screen.getByText(/Chart Analysis/)).toBeDefined();
  });

  it('displays content when no chart is provided', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ChartDisplay chart={null} />
      </QueryClientProvider>
    );

    // Component shows sample data, so we should find chart analysis text
    expect(screen.getByText(/Chart Analysis/)).toBeDefined();
  });

  it('renders different chart types correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ChartDisplay chart={mockChartData} chartType="transit" />
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Chart Analysis/)).toBeDefined();
  });
});