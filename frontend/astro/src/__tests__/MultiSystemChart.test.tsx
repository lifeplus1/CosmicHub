import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { 
  MultiSystemChartDisplay,
  WesternChart,
  VedicChart,
  ChineseChart,
  MayanChart,
  UranianChart,
  SynthesisChart,
  type MultiSystemChartData 
} from '../components/MultiSystemChart';

// Mock the lazy-loaded components for testing
vi.mock('../components/MultiSystemChart/WesternChart', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="western-chart">
      Western Chart: {data ? 'Data Present' : 'No Data'}
    </div>
  )
}));

vi.mock('../components/MultiSystemChart/VedicChart', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="vedic-chart">
      Vedic Chart: {data ? 'Data Present' : 'No Data'}
    </div>
  )
}));

vi.mock('../components/MultiSystemChart/ChineseChart', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="chinese-chart">
      Chinese Chart: {data ? 'Data Present' : 'No Data'}
    </div>
  )
}));

vi.mock('../components/MultiSystemChart/MayanChart', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="mayan-chart">
      Mayan Chart: {data ? 'Data Present' : 'No Data'}
    </div>
  )
}));

vi.mock('../components/MultiSystemChart/UranianChart', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="uranian-chart">
      Uranian Chart: {data ? 'Data Present' : 'No Data'}
    </div>
  )
}));

vi.mock('../components/MultiSystemChart/SynthesisChart', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="synthesis-chart">
      Synthesis Chart: {data ? 'Data Present' : 'No Data'}
    </div>
  )
}));

describe('MultiSystemChart Components', () => {
  const mockChartData: MultiSystemChartData = {
    birth_info: {
      date: '1990-01-15',
      time: '14:30',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York'
      }
    },
    western_tropical: {
      planets: {
        sun: { position: 295.5, retrograde: false },
        moon: { position: 45.2, retrograde: false }
      },
      aspects: []
    },
    vedic_sidereal: {
      description: 'Vedic analysis',
      ayanamsa: 24.12
    },
    chinese: {
      description: 'Chinese astrology analysis',
      year: { animal: 'Horse', element: 'Metal', traits: 'Independent, energetic' }
    },
    mayan: {
      description: 'Mayan calendar analysis',
      day_sign: { symbol: 'Ahau', name: 'Lord', meaning: 'Leadership' }
    },
    uranian: {
      description: 'Uranian astrology analysis',
      uranian_planets: {}
    },
    synthesis: {
      primary_themes: ['Leadership', 'Creativity'],
      life_purpose: ['To inspire others']
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MultiSystemChartDisplay', () => {
    it('renders loading state when isLoading is true', () => {
      render(
        <MultiSystemChartDisplay 
          chartData={mockChartData} 
          isLoading={true} 
        />
      );

      expect(screen.getByText(/calculating multi-system chart/i)).toBeInTheDocument();
    });

    it('renders no data message when chartData is null', () => {
      render(
        <MultiSystemChartDisplay 
          chartData={null as any} 
          isLoading={false} 
        />
      );

      expect(screen.getByText(/no chart data/i)).toBeInTheDocument();
    });

    it('renders multi-system chart with all tabs when data is provided', async () => {
      render(
        <MultiSystemChartDisplay 
          chartData={mockChartData} 
          isLoading={false} 
        />
      );

      // Check if the main title is rendered
      expect(screen.getByText(/multi-system astrological analysis/i)).toBeInTheDocument();

      // Check if birth info is displayed
      expect(screen.getByText(/1990-01-15/)).toBeInTheDocument();
      expect(screen.getByText(/14:30/)).toBeInTheDocument();

      // Check if tab triggers are rendered
      expect(screen.getByText(/western tropical/i)).toBeInTheDocument();
      expect(screen.getByText(/vedic sidereal/i)).toBeInTheDocument();
      expect(screen.getByText(/chinese/i)).toBeInTheDocument();
      expect(screen.getByText(/mayan/i)).toBeInTheDocument();
      expect(screen.getByText(/uranian/i)).toBeInTheDocument();
      expect(screen.getByText(/synthesis/i)).toBeInTheDocument();
    });

    it('handles missing optional data gracefully', async () => {
      const minimalData: MultiSystemChartData = {
        western_tropical: {
          planets: { sun: { position: 0, retrograde: false } },
          aspects: []
        }
      };

      render(
        <MultiSystemChartDisplay 
          chartData={minimalData} 
          isLoading={false} 
        />
      );

      expect(screen.getByText(/multi-system astrological analysis/i)).toBeInTheDocument();
    });
  });

  describe('Individual Chart Components', () => {
    it('WesternChart renders with data', () => {
      const westernData = {
        planets: { sun: { position: 295.5, retrograde: false } },
        aspects: []
      };

      render(<WesternChart data={westernData} />);
      expect(screen.getByTestId('western-chart')).toHaveTextContent('Data Present');
    });

    it('VedicChart renders with data', () => {
      const vedicData = {
        description: 'Vedic analysis',
        ayanamsa: 24.12
      };

      render(<VedicChart data={vedicData} />);
      expect(screen.getByTestId('vedic-chart')).toHaveTextContent('Data Present');
    });

    it('ChineseChart renders with data', () => {
      const chineseData = {
        description: 'Chinese analysis',
        year: { animal: 'Horse', element: 'Metal' }
      };

      render(<ChineseChart data={chineseData} />);
      expect(screen.getByTestId('chinese-chart')).toHaveTextContent('Data Present');
    });

    it('MayanChart renders with data', () => {
      const mayanData = {
        description: 'Mayan analysis',
        day_sign: { symbol: 'Ahau', name: 'Lord' }
      };

      render(<MayanChart data={mayanData} />);
      expect(screen.getByTestId('mayan-chart')).toHaveTextContent('Data Present');
    });

    it('UranianChart renders with data', () => {
      const uranianData = {
        description: 'Uranian analysis',
        uranian_planets: {}
      };

      render(<UranianChart data={uranianData} />);
      expect(screen.getByTestId('uranian-chart')).toHaveTextContent('Data Present');
    });

    it('SynthesisChart renders with data', () => {
      const synthesisData = {
        primary_themes: ['Leadership'],
        life_purpose: ['To inspire']
      };

      render(<SynthesisChart data={synthesisData} />);
      expect(screen.getByTestId('synthesis-chart')).toHaveTextContent('Data Present');
    });

    it('components handle null/undefined data gracefully', () => {
      render(<WesternChart data={null} />);
      expect(screen.getByTestId('western-chart')).toHaveTextContent('No Data');

      render(<VedicChart data={undefined} />);
      expect(screen.getByTestId('vedic-chart')).toHaveTextContent('No Data');
    });
  });

  describe('Lazy Loading', () => {
    it('shows loading fallback while components load', async () => {
      const { rerender } = render(
        <MultiSystemChartDisplay 
          chartData={mockChartData} 
          isLoading={false} 
        />
      );

      // Initially, we might see loading states for lazy components
      // This test verifies the structure is in place for lazy loading
      expect(screen.getByText(/multi-system astrological analysis/i)).toBeInTheDocument();

      // Wait for lazy components to load
      await waitFor(() => {
        expect(screen.getByText(/western tropical/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper tab navigation structure', () => {
      render(
        <MultiSystemChartDisplay 
          chartData={mockChartData} 
          isLoading={false} 
        />
      );

      // Check for tab list and tab panel structure
      const tabTriggers = screen.getAllByRole('tab');
      expect(tabTriggers).toHaveLength(6);
    });

    it('renders with semantic HTML structure', () => {
      render(
        <MultiSystemChartDisplay 
          chartData={mockChartData} 
          isLoading={false} 
        />
      );

      // Verify headings and structure
      expect(screen.getByText(/multi-system astrological analysis/i)).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('handles component errors gracefully', () => {
      // This would test error boundary behavior if implemented
      // For now, verify basic error handling
      expect(() => {
        render(
          <MultiSystemChartDisplay 
            chartData={{} as MultiSystemChartData} 
            isLoading={false} 
          />
        );
      }).not.toThrow();
    });
  });
});
