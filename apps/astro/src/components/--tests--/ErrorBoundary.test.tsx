import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@cosmichub/ui';

const Boom: React.FC = () => {
  throw new Error('Boom');
};

describe('ErrorBoundary', () => {
  it('catches errors and shows fallback UI', () => {
    render(
      <ErrorBoundary name='TestBoundary'>
        <Boom />
      </ErrorBoundary>
    );
    // The mock ErrorBoundary renders "Component Error"
    expect(screen.getByText(/Component Error/i)).toBeInTheDocument();
    expect(screen.getByTestId('integration-error-boundary')).toBeInTheDocument();
  });
});
