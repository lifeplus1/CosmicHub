import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChartDisplay from '../ChartDisplay';
import type { ChartLike } from '../normalizeChart';

// Mock the astrologyService module
vi.mock('@/services/astrologyService', () => ({
  fetchSavedChart: vi.fn(),
}));

// Mock the hooks
vi.mock('../hooks/useChartData', () => ({
  useChartData: vi.fn(() => ({
    chartData: {
      planets: [
        {
          name: 'Sun',
          sign: 'Leo',
          degree: 15.5,
          position: 135.5,
          house: '11',
          retrograde: false,
        },
        {
          name: 'Moon',
          sign: 'Cancer',
          degree: 22.3,
          position: 112.3,
          house: '10',
          retrograde: false,
        },
      ],
      houses: [
        { house: 1, sign: 'Aries', cusp: 0, degree: 0 },
        { house: 2, sign: 'Taurus', cusp: 30, degree: 0 },
      ],
      aspects: [
        {
          planet1: 'Sun',
          planet2: 'Moon',
          type: 'Trine',
          orb: 2.5,
          applying: 'applying',
        },
      ],
      asteroids: [],
      angles: [],
    },
    isLoading: false,
    error: null,
  })),
}));

vi.mock('../hooks/useProcessedSections', () => ({
  useProcessedSections: vi.fn(() => ({
    planets: [
      {
        name: 'Sun',
        sign: 'Leo',
        degree: 15.5,
        position: 135.5,
        house: '11',
        retrograde: false,
      },
      {
        name: 'Moon',
        sign: 'Cancer',
        degree: 22.3,
        position: 112.3,
        house: '10',
        retrograde: false,
      },
    ],
    houses: [
      { house: 1, sign: 'Aries', cusp: 0, degree: 0 },
      { house: 2, sign: 'Taurus', cusp: 30, degree: 0 },
    ],
    aspects: [
      {
        planet1: 'Sun',
        planet2: 'Moon',
        type: 'Trine',
        orb: 2.5,
        applying: 'applying',
      },
    ],
    asteroids: [],
    angles: [],
    points: [],
  })),
}));

vi.mock('../hooks/useCategorizedPoints', () => ({
  useCategorizedPoints: vi.fn(() => ({
    lunar_nodes: [],
    lilith_points: [],
    special_points: [],
    hypothetical: [],
  })),
}));

vi.mock('../hooks/useEnhancedAspects', () => ({
  useEnhancedAspects: vi.fn(() => [
    {
      planet1: 'Sun',
      planet2: 'Moon',
      type: 'Trine',
      orb: 2.5,
      applying: 'applying',
    },
  ]),
}));

// Mock the UI components
vi.mock('@cosmichub/ui', () => ({
  ErrorBoundary: ({
    children,
    fallback,
  }: {
    children: React.ReactNode;
    fallback?: React.ComponentType<any>;
  }) => {
    try {
      return <div data-testid='error-boundary'>{children}</div>;
    } catch {
      const FallbackComponent = fallback;
      return FallbackComponent ? (
        <FallbackComponent />
      ) : (
        <div data-testid='error-fallback'>Error occurred</div>
      );
    }
  },
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='tooltip-provider'>{children}</div>
  ),
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid='card' className={className}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid='card-content' className={className}>
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid='card-header' className={className}>
      {children}
    </div>
  ),
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h3 data-testid='card-title' className={className}>
      {children}
    </h3>
  ),
  Input: ({ className, ...props }: any) => (
    <input data-testid='input' className={className} {...props} />
  ),
  Button: ({ children, className, ...props }: any) => (
    <button data-testid='button' className={className} {...props}>
      {children}
    </button>
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='tooltip'>{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='tooltip-content'>{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='tooltip-trigger'>{children}</div>
  ),
  Tabs: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid='tabs' className={className}>
      {children}
    </div>
  ),
  TabsContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid='tabs-content' className={className}>
      {children}
    </div>
  ),
  TabsList: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid='tabs-list' className={className}>
      {children}
    </div>
  ),
  TabsTrigger: ({
    children,
    value,
    className,
  }: {
    children: React.ReactNode;
    value?: string;
    className?: string;
  }) => (
    <button data-testid='tabs-trigger' data-value={value} className={className}>
      {children}
    </button>
  ),
  Accordion: ({
    children,
    type,
    className,
  }: {
    children: React.ReactNode;
    type?: string;
    className?: string;
  }) => (
    <div data-testid='accordion' data-type={type} className={className}>
      {children}
    </div>
  ),
  AccordionContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid='accordion-content' className={className}>
      {children}
    </div>
  ),
  AccordionItem: ({
    children,
    value,
    className,
  }: {
    children: React.ReactNode;
    value?: string;
    className?: string;
  }) => (
    <div data-testid='accordion-item' data-value={value} className={className}>
      {children}
    </div>
  ),
  AccordionTrigger: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <button data-testid='accordion-trigger' className={className}>
      {children}
    </button>
  ),
  Table: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <table data-testid='table' className={className}>
      {children}
    </table>
  ),
  TableHeader: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <thead data-testid='table-header' className={className}>
      {children}
    </thead>
  ),
  TableBody: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <tbody data-testid='table-body' className={className}>
      {children}
    </tbody>
  ),
  TableRow: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <tr data-testid='table-row' className={className}>
      {children}
    </tr>
  ),
  TableHead: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <th data-testid='table-head' className={className}>
      {children}
    </th>
  ),
  TableCell: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <td data-testid='table-cell' className={className}>
      {children}
    </td>
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
    const mockChart: ChartLike = {
      planets: { 
        sun: { 
          name: 'sun', 
          position: 120,
          retrograde: false,
          speed: 1,
          sign: 'leo',
          house: 5
        },
        moon: { 
          name: 'moon', 
          position: 180,
          retrograde: false,
          speed: 13,
          sign: 'sagittarius',
          house: 9
        },
        mercury: { 
          name: 'mercury', 
          position: 100,
          retrograde: false,
          speed: 1.2,
          sign: 'cancer',
          house: 4
        },
        venus: { 
          name: 'venus', 
          position: 140,
          retrograde: false,
          speed: 1.1,
          sign: 'virgo',
          house: 6
        },
        mars: { 
          name: 'mars', 
          position: 200,
          retrograde: false,
          speed: 0.5,
          sign: 'capricorn',
          house: 10
        },
        jupiter: { 
          name: 'jupiter', 
          position: 60,
          retrograde: false,
          speed: 0.08,
          sign: 'gemini',
          house: 3
        },
        saturn: { 
          name: 'saturn', 
          position: 300,
          retrograde: true,
          speed: 0.03,
          sign: 'aquarius',
          house: 11
        },
        uranus: { 
          name: 'uranus', 
          position: 45,
          retrograde: false,
          speed: 0.01,
          sign: 'taurus',
          house: 2
        },
        neptune: { 
          name: 'neptune', 
          position: 330,
          retrograde: false,
          speed: 0.006,
          sign: 'pisces',
          house: 12
        },
        pluto: { 
          name: 'pluto', 
          position: 270,
          retrograde: false,
          speed: 0.004,
          sign: 'capricorn',
          house: 10
        },
        chiron: { 
          name: 'chiron', 
          position: 90,
          retrograde: false,
          speed: 0.02,
          sign: 'cancer',
          house: 4
        },
        north_node: { 
          name: 'north_node', 
          position: 210,
          retrograde: true,
          speed: -0.05,
          sign: 'capricorn',
          house: 10
        },
        south_node: { 
          name: 'south_node', 
          position: 30,
          retrograde: true,
          speed: -0.05,
          sign: 'cancer',
          house: 4
        }
      },
      houses: [],
      aspects: [],
      asteroids: {},
      angles: { 
        ascendant: 0,
        midheaven: 90,
        descendant: 180,
        imumcoeli: 270
      },
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      julian_day: 2459000,
      house_system: 'placidus'
    };

    render(
      <QueryClientProvider client={queryClient}>
        <ChartDisplay chart={mockChart} />
      </QueryClientProvider>
    );

    expect(
      screen.getAllByText(/Complete Chart Analysis/).length
    ).toBeGreaterThan(0);
  });

  it('displays content when no chart is provided', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ChartDisplay chart={null} />
      </QueryClientProvider>
    );

    // Component shows sample data, ensure at least one chart analysis header rendered
    expect(
      screen.getAllByText(/Complete Chart Analysis/).length
    ).toBeGreaterThanOrEqual(1);
  });
});
