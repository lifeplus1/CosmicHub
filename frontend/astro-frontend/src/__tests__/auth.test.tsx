import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from '../contexts/AuthContext';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>
    <MemoryRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </MemoryRouter>
  </ChakraProvider>
);

describe('Auth functionality', () => {
  it('provides auth context to children', () => {
    const TestComponent = () => <div>Test Component</div>;
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
});
