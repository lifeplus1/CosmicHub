import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios');

describe('App', () => {
  it('renders chart page', () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const headings = screen.getAllByText(/Cosmic Insights/i);
    const chartPageHeading = headings.find((element) => element.tagName.toLowerCase() === 'h1');
    expect(chartPageHeading).toBeInTheDocument();
  });
});