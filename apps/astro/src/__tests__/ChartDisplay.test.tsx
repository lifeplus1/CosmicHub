import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChartDisplay from '../components/ChartDisplay';

// Mock the astrologyService module
vi.mock('@/services/astrologyService', () => ({
  fetchChartData: vi.fn(),
}));

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

  it('displays content when no chart is provided', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ChartDisplay chart={null} />
      </QueryClientProvider>
    );

    // Component shows sample data, so we should find chart analysis text
    expect(screen.getAllByText(/Chart Analysis/)).toHaveLength(2);
  });
});