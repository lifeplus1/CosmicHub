// frontend/src/components/ChartDisplay.test.jsx
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ChartDisplay from './ChartDisplay';

const chart = {
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: "America/New_York",
  julian_day: 2451545.0,
  planets: {
    sun: { position: 12.34, retrograde: false },
    moon: { position: 56.78, retrograde: true },
  },
  houses: [{ house: 1, cusp: 10.0 }, { house: 2, cusp: 40.0 }],
  angles: {
    ascendant: 15.0,
    descendant: 195.0,
    mc: 100.0,
    ic: 280.0,
    vertex: 120.0,
    antivertex: 300.0,
  },
  aspects: [
    { point1: "sun", point2: "moon", aspect: "conjunction", orb: 1.2 },
  ],
};

describe('ChartDisplay', () => {
  it('renders chart data', () => {
    render(
      <ChakraProvider>
        <ChartDisplay chart={chart} />
      </ChakraProvider>
    );
    expect(screen.getByText(/Latitude: 40.71/i)).toBeInTheDocument();
    expect(screen.getByText(/Sun: 12.34° Aries/i)).toBeInTheDocument();
    expect(screen.getByText(/Moon: 26.78° Taurus ℞/i)).toBeInTheDocument();
  });
});