import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChartDisplay from '../ChartDisplay';

// Mock the astrologyService module
vi.mock('@/services/astrologyService', () => ({
  fetchSavedChart: vi.fn(),
}));

// Mock the UI components
vi.mock('@cosmichub/ui', () => ({
  ErrorBoundary: ({ children, name, level }: any) => (
    <div data-testid={`error-boundary-${name}`}>{children}</div>
  ),
  TooltipProvider: ({ children }: any) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
  Tooltip: ({ children, content }: any) => (
    <div title={content}>{children}</div>
  ),
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  Input: ({ placeholder, value, onChange }: any) => (
    <input placeholder={placeholder} value={value} onChange={onChange} />
  ),
  Button: ({ children, variant, size, onClick }: any) => (
    <button data-variant={variant} data-size={size} onClick={onClick}>
      {children}
    </button>
  ),
  Tabs: ({ children, defaultValue }: any) => (
    <div data-default-value={defaultValue}>{children}</div>
  ),
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-value={value}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-value={value}>{children}</div>
  ),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('ChartDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chart component without errors', () => {
    const mockChart: any = {
      planets: { sun: { name: 'Sun', sign: 'Leo' } },
      houses: [],
      aspects: [],
      asteroids: [],
      angles: { ascendant: 0 },
    };

    render(
      <QueryClientProvider client={queryClient}>
        <ChartDisplay chart={mockChart} />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Chart Analysis/)).toBeDefined();
  });

  it('displays content when no chart is provided', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ChartDisplay chart={null} />
      </QueryClientProvider>
    );

    // Component shows sample data, ensure at least one chart analysis header rendered
    expect(screen.getAllByText(/Chart Analysis/).length).toBeGreaterThanOrEqual(
      1
    );
  });
});
