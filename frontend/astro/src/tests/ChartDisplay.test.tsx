import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../components/ToastProvider';
import ChartDisplay from '../components/ChartDisplay';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <ToastProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ToastProvider>
  </MemoryRouter>
);

describe('ChartDisplay', () => {
  it('renders chart display component', () => {
    const mockChartData = {
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
        <ChartDisplay chart={mockChartData} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('chart-display')).toBeInTheDocument();
  });
});
