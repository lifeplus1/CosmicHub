import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../components/ToastProvider';
import { AuthProvider, SubscriptionProvider } from '@cosmichub/auth';
import MultiSystemChartDisplay from '../components/MultiSystemChart';
import type { ChartBirthData } from '../services/api';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>
    <MemoryRouter>
      <AuthProvider>
        <SubscriptionProvider appType="astro">{children}</SubscriptionProvider>
      </AuthProvider>
    </MemoryRouter>
  </ToastProvider>
);

describe('MultiSystemChart Component', () => {
  const mockBirthData: ChartBirthData = {
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    city: 'New York',
    lat: 40.7128,
    lon: -74.0060,
    timezone: 'America/New_York'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders multi-system chart interface with birth data', () => {
    render(
      <TestWrapper>
        <MultiSystemChartDisplay birthData={mockBirthData} />
      </TestWrapper>
    );

    // Check for tab buttons specifically
    expect(screen.getByRole('tab', { name: /Western Tropical/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Vedic Sidereal/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Chinese/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Mayan/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Uranian/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Synthesis/i })).toBeInTheDocument();
    expect(screen.getByText(/Multi-System Astrological Analysis/i)).toBeInTheDocument();
  });

  it('displays birth information when provided', () => {
    render(
      <TestWrapper>
        <MultiSystemChartDisplay birthData={mockBirthData} />
      </TestWrapper>
    );

    // Check for birth information display by using more specific queries
    expect(screen.getAllByText(/Date:/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Time:/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Coordinates:/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Timezone:/)[0]).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <TestWrapper>
        <MultiSystemChartDisplay birthData={mockBirthData} isLoading={true} />
      </TestWrapper>
    );

    expect(screen.getByText(/Calculating multi-system chart.../i)).toBeInTheDocument();
  });

  it('shows error state when no data is provided', () => {
    render(
      <TestWrapper>
        <MultiSystemChartDisplay />
      </TestWrapper>
    );

    expect(screen.getByText(/No Chart Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Please calculate a chart to see the multi-system analysis/i)).toBeInTheDocument();
  });
});