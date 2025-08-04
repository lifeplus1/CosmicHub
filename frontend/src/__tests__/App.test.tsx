import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App'; // Removed .tsx extension
import { AuthProvider } from '../contexts/AuthContext';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock useAuth for controlled user state
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      getAuthToken: vi.fn().mockResolvedValue(null),
    }),
  };
});

describe('App', () => {
  it('renders App component', () => {
    render(
      <AuthProvider>
        <ChakraProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ChakraProvider>
      </AuthProvider>,
    );
    const elements = screen.getAllByText(/Cosmic Hub/);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('renders signup button for unauthenticated users', () => {
    render(
      <AuthProvider>
        <ChakraProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ChakraProvider>
      </AuthProvider>,
    );
    expect(screen.getByText('Signup')).toBeInTheDocument();
  });
});