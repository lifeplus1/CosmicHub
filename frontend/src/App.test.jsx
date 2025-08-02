// frontend/src/App.test.jsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios');

describe('App', () => {
  it('renders chart page', () => {
    render(
      <ChakraProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChakraProvider>
    );
    expect(screen.getByText(/Cosmic Insights/i)).toBeInTheDocument();
  });
});