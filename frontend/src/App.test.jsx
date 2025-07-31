import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react';
import axios from 'axios';

jest.mock('axios');

describe('App', () => {
  it('renders form and calculates chart', async () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    expect(screen.getByText('Astrology App')).toBeInTheDocument();

    axios.post.mockResolvedValueOnce({
      data: {
        planets: [{ name: 'Sun', sign: 'Aries', degrees: 10, house: 1 }],
        houses: [{ number: 1, sign: 'Aries', cusp: 0 }],
        aspects: []
      }
    });

    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '1990' } });
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Hour (24h)'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Minute'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'New York' } });
    fireEvent.click(screen.getByText('Calculate Chart'));

    expect(axios.post).toHaveBeenCalledWith(
      'https://astrology-app-0emh.onrender.com/calculate?house_system=P',
      expect.any(Object),
      expect.any(Object)
    );
    expect(await screen.findByText(/Sun: Aries/)).toBeInTheDocument();
  });
});