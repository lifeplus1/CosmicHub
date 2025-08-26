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
  ErrorBoundary: ({ children, fallback }: { children: React.ReactNode; fallback?: React.ComponentType<any> }) => {
    try {
      return <div data-testid="error-boundary">{children}</div>;
    } catch (error) {
      const FallbackComponent = fallback;
      return FallbackComponent ? <FallbackComponent /> : <div data-testid="error-fallback">Error occurred</div>;
    }
  },
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-provider">{children}</div>,
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="card-content" className={className}>{children}</div>,
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="card-header" className={className}>{children}</div>,
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => <h3 data-testid="card-title" className={className}>{children}</h3>,
  Input: ({ className, ...props }: any) => <input data-testid="input" className={className} {...props} />,
  Button: ({ children, className, variant, ...props }: any) => <button data-testid="button" className={className} {...props}>{children}</button>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-trigger">{children}</div>,
  Tabs: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="tabs" className={className}>{children}</div>,
  TabsContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="tabs-content" className={className}>{children}</div>,
  TabsList: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="tabs-list" className={className}>{children}</div>,
  TabsTrigger: ({ children, value, className }: { children: React.ReactNode; value?: string; className?: string }) => <button data-testid="tabs-trigger" data-value={value} className={className}>{children}</button>,
  Accordion: ({ children, type, className }: { children: React.ReactNode; type?: string; className?: string }) => <div data-testid="accordion" data-type={type} className={className}>{children}</div>,
  AccordionContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="accordion-content" className={className}>{children}</div>,
  AccordionItem: ({ children, value, className }: { children: React.ReactNode; value?: string; className?: string }) => <div data-testid="accordion-item" data-value={value} className={className}>{children}</div>,
  AccordionTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => <button data-testid="accordion-trigger" className={className}>{children}</button>
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
