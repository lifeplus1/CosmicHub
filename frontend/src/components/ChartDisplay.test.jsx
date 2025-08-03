// frontend/src/components/ChartDisplay.test.jsx
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ChartDisplay from './ChartDisplay';

const mockChart = {
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  julian_day: 2460500.5,
  planets: {
    sun: { position: 120, retrograde: false },
    moon: { position: 240, retrograde: true },
  },
  houses: [
    { house: 1, cusp: 0 },
    { house: 2, cusp: 30 },
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
      <ChakraProvider>
        <ChartDisplay chart={mockChart} />
      </ChakraProvider>
    );
    expect(screen.getByText(/Latitude: 40.71°/)).toBeInTheDocument();
    expect(screen.getByText('0.00° Leo')).toBeInTheDocument();
    expect(screen.getByText('0.00° Sagittarius')).toBeInTheDocument();
    expect(screen.getByText('℞')).toBeInTheDocument(); // For Moon retrograde
  });
});