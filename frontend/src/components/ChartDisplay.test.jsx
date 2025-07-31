import { render, screen } from '@testing-library/react';
import ChartDisplay from './ChartDisplay';
import { ChakraProvider } from '@chakra-ui/react';

describe('ChartDisplay', () => {
    it('renders chart data', () => {
    const chart = {
        planets: [{ name: 'Sun', sign: 'Aries', degrees: 10, house: 1 }],
        houses: [{ number: 1, sign: 'Aries', cusp: 0 }],
        aspects: [{ planet1: 'Sun', planet2: 'Moon', type: 'Conjunction', orb: 2 }]
    };
    render(
        <ChakraProvider>
           <ChartDisplay chart={chart} />
        </ChakraProvider>
       );
    expect(screen.getByText(/Sun: Aries at 10.00°/)).toBeInTheDocument();
    expect(screen.getByText(/House 1: Aries at 0.00°/)).toBeInTheDocument();
    expect(screen.getByText(/Sun Conjunction Moon: 2.00°/)).toBeInTheDocument();
    });
});