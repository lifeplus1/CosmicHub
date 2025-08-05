import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import HumanDesignChart from '../components/HumanDesignChart';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </MemoryRouter>
);

describe('HumanDesignChart', () => {
  it('renders human design chart', () => {
    const mockBirthData = {
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      city: 'New York'
    };

    render(
      <TestWrapper>
        <HumanDesignChart birthData={mockBirthData} />
      </TestWrapper>
    );
    
    // Check that it renders the loading state initially
    expect(screen.getByText(/calculating your human design chart/i)).toBeInTheDocument();
  });
});
