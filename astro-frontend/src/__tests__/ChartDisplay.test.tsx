// frontend/src/components/ChartDisplay.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import ChartDisplay from '../components/ChartDisplay';
import { AuthProvider } from '../contexts/AuthContext';
import type { ChartData } from '../types';

// Type aliases for test use
type PlanetData = NonNullable<ChartData['planets']>[string];
type HouseData = ChartData['houses'][number];
type AspectData = ChartData['aspects'][number];

interface ExtendedChartData extends ChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  angles: Record<string, number>;
}

const mockChart: ExtendedChartData = {
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  julian_day: 2460500.5,
  planets: {
    sun: { position: 120, retrograde: false, house: 1 },
    moon: { position: 240, retrograde: true, house: 8 },
  },
  houses: [
    { house: 1, cusp: 0, sign: 'Aries' },
    { house: 2, cusp: 30, sign: 'Taurus' },
  ],
  angles: {
    ascendant: 0,
    descendant: 180,
    mc: 90,
    ic: 270,
    vertex: 45,
    antivertex: 225,
  },
  aspects: [],
};

describe('ChartDisplay', () => {
  it('renders chart data correctly', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <ChakraProvider>
            <ChartDisplay chart={mockChart} />
          </ChakraProvider>
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/Latitude: 40.71°/)).toBeInTheDocument();
    expect(screen.getByText('0.00° Leo')).toBeInTheDocument();
    expect(screen.getByText('0.00° Sagittarius')).toBeInTheDocument();
    expect(screen.getByText('℞')).toBeInTheDocument();
  });
});

