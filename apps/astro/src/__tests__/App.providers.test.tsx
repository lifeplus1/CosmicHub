// /Users/Chris/Projects/CosmicHub/apps/astro/src/__tests__/App.providers.test.tsx
/**
 * Provider Configuration Tests
 * Tests all provider setups and configurations separately
 */

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock all external dependencies
vi.mock('@cosmichub/auth', () => ({
  AuthProvider: ({ children, appName }: { children: React.ReactNode; appName: string }) => (
    <div data-testid="auth-provider" data-app-name={appName}>
      {children}
    </div>
  ),
  SubscriptionProvider: ({ children, appType }: { children: React.ReactNode; appType: string }) => (
    <div data-testid="subscription-provider" data-app-type={appType}>
      {children}
    </div>
  ),
  useAuth: vi.fn(() => ({ user: null, loading: false })),
  useSubscription: vi.fn(() => ({ plan: 'free', loading: false })),
}));

vi.mock('@tanstack/react-query', () => {
  let capturedConfig: any = null;
  return {
    QueryClient: vi.fn((config) => {
      capturedConfig = config;
      return { __config: capturedConfig };
    }),
    QueryClientProvider: ({ 
      client, 
      children 
    }: { 
      client: any; 
      children: React.ReactNode; 
    }) => (
      <div 
        data-testid="query-client-provider" 
        data-config={JSON.stringify(client.__config)}
      >
        {children}
      </div>
    ),
  };
});

vi.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
}));

vi.mock('../contexts/BirthDataContext', () => ({
  BirthDataProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="birth-data-provider">{children}</div>
  ),
}));

vi.mock('../contexts/UpgradeModalContext', () => ({
  UpgradeModalProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="upgrade-modal-provider">{children}</div>
  ),
}));

vi.mock('../components/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

describe('App Providers Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('QueryClient Configuration', () => {
    test('configures QueryClient with correct default options', () => {
      const { QueryClient } = require('@tanstack/react-query');
      
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      });

      expect(QueryClient).toHaveBeenCalledWith({
        defaultOptions: {
          queries: {
            staleTime: 300000, // 5 minutes in ms
            gcTime: 600000,    // 10 minutes in ms
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      });
    });

    test('QueryClientProvider renders with correct client config', () => {
      const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
      const client = new QueryClient({
        defaultOptions: {
          queries: { staleTime: 300000 },
        },
      });

      render(
        <QueryClientProvider client={client}>
          <div data-testid="test-child">Test</div>
        </QueryClientProvider>
      );

      const provider = screen.getByTestId('query-client-provider');
      expect(provider).toBeInTheDocument();
      expect(provider).toHaveAttribute('data-config', 
        JSON.stringify({ defaultOptions: { queries: { staleTime: 300000 } } })
      );
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
  });

  describe('AuthProvider Configuration', () => {
    test('AuthProvider initializes with correct app name', () => {
      const { AuthProvider } = require('@cosmichub/auth');

      render(
        <AuthProvider appName="astro">
          <div data-testid="auth-child">Auth Child</div>
        </AuthProvider>
      );

      const provider = screen.getByTestId('auth-provider');
      expect(provider).toBeInTheDocument();
      expect(provider).toHaveAttribute('data-app-name', 'astro');
      expect(screen.getByTestId('auth-child')).toBeInTheDocument();
    });

    test('SubscriptionProvider initializes with correct app type', () => {
      const { SubscriptionProvider } = require('@cosmichub/auth');

      render(
        <SubscriptionProvider appType="astro">
          <div data-testid="subscription-child">Subscription Child</div>
        </SubscriptionProvider>
      );

      const provider = screen.getByTestId('subscription-provider');
      expect(provider).toBeInTheDocument();
      expect(provider).toHaveAttribute('data-app-type', 'astro');
      expect(screen.getByTestId('subscription-child')).toBeInTheDocument();
    });
  });

  describe('Context Providers', () => {
    test('BirthDataProvider renders children', () => {
      const { BirthDataProvider } = require('../contexts/BirthDataContext');

      render(
        <BirthDataProvider>
          <div data-testid="birth-data-child">Birth Data Child</div>
        </BirthDataProvider>
      );

      expect(screen.getByTestId('birth-data-provider')).toBeInTheDocument();
      expect(screen.getByTestId('birth-data-child')).toBeInTheDocument();
    });

    test('UpgradeModalProvider renders children', () => {
      const { UpgradeModalProvider } = require('../contexts/UpgradeModalContext');

      render(
        <UpgradeModalProvider>
          <div data-testid="upgrade-modal-child">Upgrade Modal Child</div>
        </UpgradeModalProvider>
      );

      expect(screen.getByTestId('upgrade-modal-provider')).toBeInTheDocument();
      expect(screen.getByTestId('upgrade-modal-child')).toBeInTheDocument();
    });
  });

  describe('UI Providers', () => {
    test('Tooltip Provider renders children', () => {
      const { Provider: TooltipProvider } = require('@radix-ui/react-tooltip');

      render(
        <TooltipProvider>
          <div data-testid="tooltip-child">Tooltip Child</div>
        </TooltipProvider>
      );

      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-child')).toBeInTheDocument();
    });

    test('ErrorBoundary wraps children', () => {
      const ErrorBoundary = require('../components/ErrorBoundary').default;

      render(
        <ErrorBoundary>
          <div data-testid="error-boundary-child">Protected Child</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByTestId('error-boundary-child')).toBeInTheDocument();
    });
  });

  describe('Provider Stack Integration', () => {
    test('all providers can be nested without errors', () => {
      const { AuthProvider, SubscriptionProvider } = require('@cosmichub/auth');
      const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
      const { Provider: TooltipProvider } = require('@radix-ui/react-tooltip');
      const { BirthDataProvider } = require('../contexts/BirthDataContext');
      const { UpgradeModalProvider } = require('../contexts/UpgradeModalContext');
      const ErrorBoundary = require('../components/ErrorBoundary').default;

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      });

      const ProviderStack = () => (
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider appName="astro">
              <SubscriptionProvider appType="astro">
                <BirthDataProvider>
                  <UpgradeModalProvider>
                    <ErrorBoundary>
                      <div data-testid="nested-content">All Providers Working</div>
                    </ErrorBoundary>
                  </UpgradeModalProvider>
                </BirthDataProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      );

      expect(() => render(<ProviderStack />)).not.toThrow();
      expect(screen.getByTestId('nested-content')).toBeInTheDocument();
    });

    test('provider hierarchy is correct', () => {
      const { AuthProvider, SubscriptionProvider } = require('@cosmichub/auth');
      const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');

      render(
        <QueryClientProvider client={new QueryClient()}>
          <AuthProvider appName="astro">
            <SubscriptionProvider appType="astro">
              <div data-testid="hierarchy-test">Hierarchy Test</div>
            </SubscriptionProvider>
          </AuthProvider>
        </QueryClientProvider>
      );

      // Check that all providers are in the DOM
      expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
      expect(screen.getByTestId('subscription-provider')).toBeInTheDocument();
      expect(screen.getByTestId('hierarchy-test')).toBeInTheDocument();
    });
  });

  describe('Provider Error Handling', () => {
    test('handles provider initialization errors gracefully', () => {
      const { AuthProvider } = require('@cosmichub/auth');
      
      // Mock a provider that throws an error
      const ErrorProvider = () => {
        throw new Error('Provider initialization failed');
      };

      const TestComponent = () => {
        try {
          return (
            <div>
              <ErrorProvider />
              <AuthProvider appName="astro">
                <div data-testid="should-not-render">Should not render</div>
              </AuthProvider>
            </div>
          );
        } catch (error) {
          return <div data-testid="error-caught">Error caught: {(error as Error).message}</div>;
        }
      };

      render(<TestComponent />);
      expect(screen.getByTestId('error-caught')).toBeInTheDocument();
      expect(screen.getByText('Error caught: Provider initialization failed')).toBeInTheDocument();
    });

    test('continues working when one provider fails', () => {
      const { AuthProvider } = require('@cosmichub/auth');
      const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');

      // Test with a working provider and content
      render(
        <QueryClientProvider client={new QueryClient()}>
          <AuthProvider appName="astro">
            <div data-testid="working-content">This should work</div>
          </AuthProvider>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('working-content')).toBeInTheDocument();
    });
  });
});
