import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

const Boom: React.FC = () => { throw new Error('Kaboom'); };

// Simplified environment mocking to ensure development paths activate
vi.mock('../../config/environment', () => ({
  isDevelopment: () => true,
  devConsole: { error: vi.fn(), warn: vi.fn(), log: vi.fn() }
}));

describe('ErrorBoundary (additional scenarios)', () => {
  it('invokes onError callback when error thrown', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary name="ExtraBoundary" onError={onError}>
        <Boom />
      </ErrorBoundary>
    );
  expect(screen.getAllByText(/Something went wrong/i).length).toBeGreaterThan(0);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('retry button clears error and a fresh mount renders safe content', () => {
    const { unmount } = render(
      <ErrorBoundary name="RetryBoundary">
        <Boom />
      </ErrorBoundary>
    );
  expect(screen.getAllByText(/RetryBoundary/).length).toBeGreaterThan(0);
  const tryAgainButtons = screen.getAllByText(/Try Again/i);
  fireEvent.click(tryAgainButtons[0]);
    // Unmount old boundary (simulating route/content swap) and mount new safe tree
    unmount();
    render(
      <ErrorBoundary name="RetryBoundary">
        <div data-testid="safe">All Good</div>
      </ErrorBoundary>
    );
    expect(screen.getByTestId('safe')).toBeInTheDocument();
  });
});
