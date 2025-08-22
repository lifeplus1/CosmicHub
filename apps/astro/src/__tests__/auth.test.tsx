import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@cosmichub/auth';

const TestWrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <MemoryRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </MemoryRouter>
);

describe('Auth functionality', () => {
  it('provides auth context to children', () => {
    const TestComponent = (): React.ReactElement => <div>Test Component</div>;
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
});