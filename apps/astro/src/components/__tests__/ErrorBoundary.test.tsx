import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

const Boom: React.FC = () => { throw new Error('Boom'); };

describe('ErrorBoundary', () => {
  it('catches errors and shows fallback UI', () => {
    render(
      <ErrorBoundary name="TestBoundary">
        <Boom />
      </ErrorBoundary>
    );
  expect(screen.getAllByText(/Something went wrong/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/TestBoundary/i)).toBeInTheDocument();
  });
});
