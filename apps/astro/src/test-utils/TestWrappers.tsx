import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Create a test-specific QueryClient with faster settings
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface TestWrappersProps {
  children: ReactNode;
}

/**
 * Test wrapper that provides all the necessary providers for component testing
 * Includes QueryClient, Router, and other essential context providers
 */
export const TestWrappers: React.FC<TestWrappersProps> = ({ children }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Utility function for rendering components with providers in tests
 * Usage: renderWithProviders(<InterpretationForm />)
 */
export const renderWithProviders = (ui: React.ReactElement) => {
  return {
    queryClient: createTestQueryClient(),
    ...require('@testing-library/react').render(ui, { wrapper: TestWrappers }),
  };
};

export default TestWrappers;
