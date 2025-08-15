import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../components/ToastProvider';
import { AuthProvider, SubscriptionProvider } from '@cosmichub/auth';
import MultiSystemChartDisplay, { MultiSystemChartData } from '../components/MultiSystemChart';

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
  const mockChartData: MultiSystemChartData = {
    birth_info: {
      date: '1990-01-01',
      time: '12:00',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      },
    },
    western_tropical: {
      planets: { 
        sun: { position: 0, retrograde: false },
        moon: { position: 90, retrograde: false }
      },
      aspects: [
        {
          point1: 'sun',
          point2: 'moon',
          aspect: 'square',
          orb: 2.5,
          exact: false,
          point1_sign: 'Aries',
          point2_sign: 'Cancer',
          point1_house: 1,
          point2_house: 4,
        }
      ],
    },
    vedic_sidereal: {
      description: 'Vedic chart analysis',
      ayanamsa: 24.1,
      analysis: { moon_sign: 'Cancer', analysis: 'Test analysis' },
      planets: {
        sun: { vedic_sign: 'Mesha', nakshatra: { name: 'Ashwini', pada: '1' } }
      }
    },
    uranian: {
      description: 'Uranian astrology system',
      uranian_planets: {
        cupido: { symbol: 'Cu', position: 45, meaning: 'Art and beauty' }
      },
      dial_aspects: [
        { body1: 'sun', body2: 'cupido', angle: 45, orb: 1.0, meaning: 'Creative expression' }
      ]
    },
    synthesis: {
      primary_themes: ['Leadership', 'Creativity'],
      life_purpose: ['Self-expression', 'Helping others'],
      personality_integration: {
        'Western': ['Confident', 'Assertive'],
        'Vedic': ['Intuitive', 'Emotional']
      },
      spiritual_path: ['Service to others', 'Creative manifestation']
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders multi-system chart interface', () => {
    render(
      <MemoryRouter>
        <MultiSystemChartDisplay chartData={mockChartData} />
      </MemoryRouter>
    );

    // Check for tab buttons specifically
    expect(screen.getByRole('tab', { name: /Western Tropical/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Vedic Sidereal/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Uranian/i })).toBeInTheDocument();
    expect(screen.getByText(/Multi-System Astrological Analysis/i)).toBeInTheDocument();
  });

  it('displays chart placeholders for each system', () => {
    render(
      <MemoryRouter>
        <MultiSystemChartDisplay chartData={mockChartData} />
      </MemoryRouter>
    );

    // Check that required tab buttons are present
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThanOrEqual(6);
    
    // Verify the tabs contain the expected text (allow multiple matches)
    expect(screen.getAllByText('Western Tropical').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Vedic Sidereal').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Chinese').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mayan').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Uranian').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Synthesis').length).toBeGreaterThan(0);
  });

  it('handles loading state correctly', () => {
    render(
      <MemoryRouter>
        <MultiSystemChartDisplay chartData={mockChartData} isLoading={true} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Calculating multi-system chart/i)).toBeInTheDocument();
  });
});