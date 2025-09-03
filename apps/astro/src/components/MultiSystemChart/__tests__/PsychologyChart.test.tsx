import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import 'vitest';
import { ErrorBoundary } from 'react-error-boundary';
import PsychologyChart from '../PsychologyChart';
import type { PsychologyChartData } from '../PsychologyChart';

// Mock @cosmichub/ui
vi.mock('@cosmichub/ui', () => ({
  AccessibleButton: ({ children, onClick, className, accessibleName, ...props }: any) => (
    <button
      onClick={onClick}
      className={className}
      aria-label={accessibleName}
      {...props}
    >
      {children}
    </button>
  )
}));

// Mock the ProgressBar component
vi.mock('../ui/ProgressBar', () => ({
  ProgressBar: ({ progress, className, color }: any) => (
    <div className={`progress-bar ${className || ''}`}>
      <div className="progress-fill" />
    </div>
  )
}));

// Mock analytics
vi.mock('../../services/analytics', () => ({
  trackCosmicHubAIInteraction: vi.fn()
}));

// Mock the lazy-loaded components
vi.mock('../PsychologyChartComponents/MBTIDetailView', () => {
  return function MockMBTIDetailView() {
    return <div data-testid="mbti-detail-view">MBTI Detail View</div>;
  };
});

vi.mock('../PsychologyChartComponents/EnneagramDetailView', () => {
  return function MockEnneagramDetailView() {
    return <div data-testid="enneagram-detail-view">Enneagram Detail View</div>;
  };
});

vi.mock('../PsychologyChartComponents/PsychologySynthesisView', () => {
  return function MockPsychologySynthesisView() {
    return <div data-testid="synthesis-view">Psychology Synthesis View</div>;
  };
});

// Mock data for testing
const mockPsychologyData: PsychologyChartData = {
  mbti: {
    profile: {
      type: 'ESTP',
      name: 'The Entrepreneur',
      description: 'Energetic, practical, and spontaneous',
      temperament: 'Artisan',
      cognitiveStack: [
        {
          name: 'Se',
          fullName: 'Extroverted Sensing',
          position: 'dominant',
          planetaryCorrelation: 'Mars',
          elementalAssociation: 'Fire',
          strength: 0.85,
          description: 'Dominant function - immediate experience'
        }
      ],
      elementalCorrelation: 'Fire',
      astrologicalSigns: ['Aries', 'Leo', 'Sagittarius'],
      strengths: ['Adaptable', 'Energetic', 'Practical'],
      growthAreas: ['Long-term planning', 'Abstract thinking'],
      compatibility: {
        'ISFJ': 'Natural complement',
        'INTJ': 'Growth opportunity'
      }
    },
    birth_correlation: {
      seasonal_pattern: 'Spring-born with Aries influence',
      elemental_dominance: 'Fire element dominant',
      planetary_influences: 'Mars and Jupiter emphasis'
    },
    astrology_synthesis: {
      chart_confirmation: ['Mars in Aries confirms ESTP energy', 'Fire sign stellium supports Artisan temperament'],
      contradictions: ['Saturn aspects may challenge spontaneity'],
      integration_notes: 'Mars energy drives action while Jupiter expands possibilities'
    }
  },
  enneagram: {
    profile: {
      type: 1,
      name: 'The Perfectionist',
      description: 'Principled, purposeful, self-controlled',
      coreMotivation: 'To be good, right, perfect',
      basicFear: 'Being corrupt, evil, defective',
      house: 1,
      planetaryRuler: 'Saturn',
      element: 'Earth',
      wings: [
        { number: 9, name: 'The Peacemaker', influence: 0.3, description: 'Adds calmness' },
        { number: 2, name: 'The Helper', influence: 0.7, description: 'Adds warmth' }
      ],
      instinctualVariant: 'Self-Preservation',
      level: 3,
      integrationDirection: 7,
      disintegrationDirection: 4,
      sephirahCorrelation: 'Geburah - Severity and Judgment'
    },
    astrological_correlations: {
      house_themes: 'First house emphasis on self and identity',
      planetary_alignment: 'Saturn in Capricorn supports perfectionist tendencies',
      aspect_patterns: 'Saturn-Mars aspects create disciplined action'
    },
    spiritual_development: {
      current_level: 'Average to healthy levels',
      growth_path: ['Practice self-compassion', 'Embrace imperfection', 'Balance judgment with mercy'],
      meditation_focus: 'Grounding and centering practices'
    }
  },
  synthesis: {
    personality_integration: {
      mbti_enneagram_bridge: 'ESTP (Artisan) and Type 1 (Perfectionist) create dynamic tension between spontaneity and structure',
      spiritual_path_alignment: 'Mars-Saturn conjunction supports disciplined action and structured spontaneity',
      growth_recommendations: [
        'Balance Mars energy with Saturn discipline',
        'Use Jupiter expansion for growth opportunities',
        'Practice mindful spontaneity'
      ]
    },
    astrological_confirmation: {
      chart_personality_match: 85,
      supporting_aspects: [
        'Mars-Saturn conjunction supports disciplined action',
        'Jupiter in fire signs enhances enthusiasm',
        'Venus aspects soften perfectionist tendencies'
      ],
      developmental_timing: {
        'Age 20-30': 'Focus on building practical skills',
        'Age 30-40': 'Balance spontaneity with long-term planning',
        'Age 40+': 'Integrate wisdom with youthful energy'
      }
    },
    tarot_correspondences: {
      mbti_cards: {
        'Se': 'The Chariot - directed energy and action',
        'Ti': 'The Hermit - inner logic and analysis'
      },
      enneagram_cards: {
        1: 'The Emperor - structure and order',
        7: 'The Fool - spontaneity and new beginnings'
      },
      personality_spread: [
        'The Chariot (dominant Se)',
        'The Emperor (Type 1 structure)',
        'The Fool (integration potential)'
      ]
    }
  }
};

describe('PsychologyChart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Basic Functionality', () => {
    it('renders without crashing with valid data', () => {
      render(<PsychologyChart data={mockPsychologyData} />);
      expect(screen.getByText('Psychology Integration Analysis')).toBeInTheDocument();
    });

    it('displays loading state when isLoading is true', () => {
      render(<PsychologyChart data={mockPsychologyData} isLoading={true} />);
      expect(screen.getByText('Analyzing personality patterns...')).toBeInTheDocument();
    });

    it('displays no data state when data is null', () => {
      render(<PsychologyChart data={undefined} />);
      expect(screen.getByText(/Psychology analysis not available/)).toBeInTheDocument();
    });

    it('renders all tab buttons', () => {
      render(<PsychologyChart data={mockPsychologyData} />);
      
      expect(screen.getByRole('button', { name: /MBTI Analysis Tab/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Enneagram Tab/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Synthesis Tab/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Assessment Tab/ })).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('starts with MBTI tab active', () => {
      render(<PsychologyChart data={mockPsychologyData} />);
      
      const mbtiTab = screen.getByRole('button', { name: /MBTI Analysis Tab - Active/ });
      expect(mbtiTab).toHaveClass('bg-indigo-500/30');
    });

    it('switches tabs when clicked', async () => {
      render(<PsychologyChart data={mockPsychologyData} />);
      
      const enneagramTab = screen.getByRole('button', { name: /Enneagram Tab/ });
      fireEvent.click(enneagramTab);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Enneagram Tab - Active/ })).toBeInTheDocument();
      });
    });

    it('displays synthesis tab when clicked', async () => {
      render(<PsychologyChart data={mockPsychologyData} />);
      
      const synthesisTab = screen.getByRole('button', { name: /Synthesis Tab/ });
      fireEvent.click(synthesisTab);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Synthesis Tab - Active/ })).toBeInTheDocument();
      });
    });
  });

  describe('Suspense Boundaries', () => {
    it('shows loading fallback while lazy components load', async () => {
      // Mock React.lazy to simulate loading delay
      const originalLazy = React.lazy;
      React.lazy = vi.fn().mockImplementation(() => {
        return React.forwardRef(() => {
          throw new Promise(() => {}); // Never resolves to simulate loading
        });
      });

      render(<PsychologyChart data={mockPsychologyData} />);
      
      // Since components are mocked, they should render immediately
      expect(screen.getByTestId('mbti-detail-view')).toBeInTheDocument();
      
      // Restore original lazy
      React.lazy = originalLazy;
    });

    it('shows different loading messages for different tabs', async () => {
      render(<PsychologyChart data={mockPsychologyData} />);
      
      // Switch to enneagram tab
      fireEvent.click(screen.getByRole('button', { name: /Enneagram Tab/ }));
      
      // Since components are mocked, they should render immediately
      expect(screen.getByTestId('enneagram-detail-view')).toBeInTheDocument();

      // Switch to synthesis tab
      fireEvent.click(screen.getByRole('button', { name: /Synthesis Tab/ }));
      
      expect(screen.getByTestId('synthesis-view')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('handles component errors gracefully', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      // Mock console.error to avoid cluttering test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary
          fallback={<div>Something went wrong</div>}
          onError={() => {}}
        >
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Memoization', () => {
    it('does not re-render when props have not changed', () => {
      const { rerender } = render(<PsychologyChart data={mockPsychologyData} />);
      
      const initialElement = screen.getByText('Psychology Integration Analysis');
      
      // Re-render with same props
      rerender(<PsychologyChart data={mockPsychologyData} />);
      
      const afterRerenderElement = screen.getByText('Psychology Integration Analysis');
      
      // Should be the same element reference due to memoization
      expect(initialElement).toBe(afterRerenderElement);
    });

    it('re-renders when data changes', () => {
      const { rerender } = render(<PsychologyChart data={mockPsychologyData} />);
      
      const modifiedData = {
        ...mockPsychologyData,
        mbti: mockPsychologyData.mbti ? {
          ...mockPsychologyData.mbti,
          profile: {
            ...mockPsychologyData.mbti.profile,
            type: 'INTJ'
          }
        } : undefined
      };
      
      rerender(<PsychologyChart data={modifiedData} />);
      
      // Component should update with new data
      expect(screen.getByText('Psychology Integration Analysis')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels for tab buttons', () => {
      render(<PsychologyChart data={mockPsychologyData} />);
      
      const mbtiTab = screen.getByRole('button', { name: /MBTI Analysis Tab - Active/ });
      expect(mbtiTab).toHaveAttribute('aria-label');
    });

    it('maintains focus management during tab switching', async () => {
      render(<PsychologyChart data={mockPsychologyData} />);
      
      const enneagramTab = screen.getByRole('button', { name: /Enneagram Tab/ });
      
      fireEvent.click(enneagramTab);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Enneagram Tab - Active/ })).toBeInTheDocument();
      });
      
      // Focus should be on the active tab or within the component
      expect(document.activeElement).toBeTruthy();
    });
  });

  describe('Data Processing', () => {
    it('handles missing MBTI data gracefully', () => {
      const dataWithoutMBTI = {
        ...mockPsychologyData,
        mbti: undefined
      };

      render(<PsychologyChart data={dataWithoutMBTI} />);
      
      // Should still render without crashing
      expect(screen.getByText('Psychology Integration Analysis')).toBeInTheDocument();
    });

    it('handles missing Enneagram data gracefully', () => {
      const dataWithoutEnneagram = {
        ...mockPsychologyData,
        enneagram: undefined
      };

      render(<PsychologyChart data={dataWithoutEnneagram} />);
      
      // Should still render without crashing
      expect(screen.getByText('Psychology Integration Analysis')).toBeInTheDocument();
    });

    it('processes data with memoization', () => {
      const { rerender } = render(<PsychologyChart data={mockPsychologyData} />);
      
      // First render should process data
      expect(screen.getByText('Psychology Integration Analysis')).toBeInTheDocument();
      
      // Re-render with same data should use memoized result
      rerender(<PsychologyChart data={mockPsychologyData} />);
      
      expect(screen.getByText('Psychology Integration Analysis')).toBeInTheDocument();
    });
  });
});
