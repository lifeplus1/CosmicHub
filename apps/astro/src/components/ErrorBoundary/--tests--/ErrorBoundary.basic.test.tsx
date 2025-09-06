import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@cosmichub/ui';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock error component to trigger error boundary
function ThrowError(): JSX.Element {
  throw new Error('Test error');
}

// Normal component for testing successful render
function NormalComponent() {
  return <div>Normal component</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console errors in tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Normal component')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    // Should render the error boundary content instead of the failing component
    expect(screen.queryByText('Normal component')).not.toBeInTheDocument();
    // Look for error UI content - the mocked ErrorBoundary provides a test ID
    expect(screen.getByTestId('integration-error-boundary')).toBeInTheDocument();
  });

  it('displays fallback when specified', () => {
    const fallback = <div data-testid="custom-fallback">Custom error fallback</div>;
    
    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
  });
});
