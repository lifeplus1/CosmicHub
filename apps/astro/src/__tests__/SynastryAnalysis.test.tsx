import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SynastryAnalysis } from '../components/SynastryAnalysis';
import { AuthProvider, SubscriptionProvider } from '@cosmichub/auth';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>
      <SubscriptionProvider appType="astro">
        {children}
      </SubscriptionProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe('SynastryAnalysis Component', () => {
  const mockPerson1 = {
    date: '1990-01-01',
    time: '12:00',
    city: 'New York',
    country: 'USA',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    datetime: '1990-01-01T12:00:00-05:00'
  };

  const mockPerson2 = {
    date: '1992-05-15',
    time: '14:30',
    city: 'Los Angeles',
    country: 'USA',
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: 'America/Los_Angeles',
    datetime: '1992-05-15T14:30:00-08:00'
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