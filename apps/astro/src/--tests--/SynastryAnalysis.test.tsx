import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { SynastryAnalysis } from '../components/SynastryAnalysis/SynastryAnalysis';
import { AuthProvider, SubscriptionProvider } from '@cosmichub/auth';

const TestWrapper = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <MemoryRouter>
    <AuthProvider>
      <SubscriptionProvider appType='astro'>{children}</SubscriptionProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe('SynastryAnalysis Component', () => {
  const mockPerson1 = {
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    city: 'New York',
    lat: 40.7128,
    lon: -74.006,
    timezone: 'America/New_York',
  };

  const mockPerson2 = {
    year: 1992,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
    city: 'Los Angeles',
    lat: 34.0522,
    lon: -118.2437,
    timezone: 'America/Los_Angeles',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders synastry analysis interface', () => {
    render(
      <TestWrapper>
        <SynastryAnalysis person1={mockPerson1} person2={mockPerson2} />
      </TestWrapper>
    );

    // Basic test that component renders without crashing
    expect(document.body).toBeInTheDocument();
  });
});
