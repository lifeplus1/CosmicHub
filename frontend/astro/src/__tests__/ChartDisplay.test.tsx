// frontend/src/components/ChartDisplay.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ChartDisplay from '../components/ChartDisplay';
import { AuthProvider } from '../contexts/AuthContext';

// Mock Firebase
vi.mock('../firebase');

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </MemoryRouter>
);

describe('ChartDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when loading prop is true', () => {
    render(
      <TestWrapper>
        <ChartDisplay chart={null} loading={true} />
      </TestWrapper>
    );

    expect(screen.getByText(/calculating your natal chart/i)).toBeInTheDocument();
  });

  it('renders error message when no chart data is provided', () => {
    render(
      <TestWrapper>
        <ChartDisplay chart={null} />
      </TestWrapper>
    );

    expect(screen.getByText(/no chart data available/i)).toBeInTheDocument();
  });

  it('renders chart display component with test id', () => {
    const mockChart = {
      planets: { sun: { position: 0, house: 1 } },
      houses: [{ house: 1, cusp: 0, sign: 'Aries' }],
      aspects: [],
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      julian_day: 2451545.0,
      angles: {
        ascendant: 0,
        midheaven: 90,
        descendant: 180,
        imum_coeli: 270
      }
    };

    render(
      <TestWrapper>
        <ChartDisplay chart={mockChart} />
      </TestWrapper>
    );

    expect(screen.getByTestId('chart-display')).toBeInTheDocument();
  });
});
