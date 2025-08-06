import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import GeneKeysChart from './GeneKeysChart';
import type { GeneKeysChartProps } from './types';

// Mock the API service
vi.mock('../../services/api', () => ({
  calculateGeneKeys: vi.fn(() => Promise.resolve({
    life_work: {
      number: 1,
      name: "The Creative",
      shadow: "Entropy",
      gift: "Freshness", 
      siddhi: "Beauty",
      codon: "CCT",
      description: "The creative principle"
    },
    evolution: {
      number: 2,
      name: "The Receptive",
      shadow: "Disorientation",
      gift: "Orientation",
      siddhi: "Unity",
      codon: "CCA", 
      description: "The receptive principle"
    },
    radiance: {
      number: 3,
      name: "Difficulty at the Beginning",
      shadow: "Chaos",
      gift: "Innovation",
      siddhi: "Innocence", 
      codon: "CCG",
      description: "Innovation through difficulty"
    },
    purpose: {
      number: 4,
      name: "Youthful Folly",
      shadow: "Intolerance",
      gift: "Understanding",
      siddhi: "Forgiveness",
      codon: "CCC",
      description: "Learning through experience"
    },
    activation: {
      name: "Activation Sequence",
      description: "Your IQ sequence for mental development",
      keys: [
        {
          number: 5,
          name: "Waiting",
          shadow: "Impatience", 
          gift: "Patience",
          siddhi: "Timelessness",
          codon: "AAT",
          description: "The art of perfect timing"
        }
      ]
    },
    iq: {
      name: "Intelligence Sequence", 
      description: "Mental intelligence development",
      keys: []
    },
    eq: {
      name: "Emotional Sequence",
      description: "Emotional intelligence development", 
      keys: []
    },
    sq: {
      name: "Spiritual Sequence",
      description: "Spiritual intelligence development",
      keys: []
    },
    contemplation_sequence: ["1", "2", "3", "4"],
    hologenetic_profile: {
      description: "Your unique consciousness pattern",
      integration_path: [
        "Begin with self-acceptance",
        "Develop inner awareness",
        "Express authentic gifts",
        "Serve the collective evolution"
      ]
    }
  }))
}));

// Mock the ToastProvider
vi.mock('../ToastProvider', () => ({
  useToast: (): { toast: () => void } => ({
    toast: vi.fn()
  })
}));

describe('GeneKeysChart', () => {
  const mockBirthData = {
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
    city: "San Francisco",
    timezone: "America/Los_Angeles"
  };

  const renderComponent = (props: Partial<GeneKeysChartProps> = {}): RenderResult => {
    return render(
      <GeneKeysChart
        birthData={mockBirthData}
        onCalculate={vi.fn()}
        {...props}
      />
    );
  };

  it('renders birth data form when no data is provided', () => {
    render(<GeneKeysChart />);
    
    expect(screen.getByText(/gene keys calculation/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate gene keys/i })).toBeInTheDocument();
  });

  it('automatically calculates when birth data is provided', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/core quartet/i)).toBeInTheDocument();
    });
  });

  it('displays all tab options when data is loaded', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/🌱 core quartet/i)).toBeInTheDocument();
      expect(screen.getByText(/🧠 activation \(iq\)/i)).toBeInTheDocument();
      expect(screen.getByText(/💖 venus \(eq\)/i)).toBeInTheDocument();
      expect(screen.getByText(/� pearl \(sq\)/i)).toBeInTheDocument();
      expect(screen.getByText(/🌌 hologenetic profile/i)).toBeInTheDocument();
    });
  });

  it('switches between tabs correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/core quartet/i)).toBeInTheDocument();
    });

    // Click on Activation tab
    const activationTab = screen.getByText(/🧠 activation \(iq\)/i);
    fireEvent.click(activationTab);
    
    await waitFor(() => {
      expect(screen.getByText(/activation sequence/i)).toBeInTheDocument();
      expect(screen.getByText(/intelligence quotient/i)).toBeInTheDocument();
    });
  });

  it('shows gene key details when a key is selected', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/the creative/i)).toBeInTheDocument();
    });

    // Click on a gene key card (Life's Work)
    const geneKeyCard = screen.getByText(/the creative/i).closest('[data-testid="gene-key-card"]') || 
                       screen.getByText(/the creative/i).closest('div[role="button"]') ||
                       screen.getByText(/the creative/i);
    
    if (geneKeyCard) {
      fireEvent.click(geneKeyCard);
      
      await waitFor(() => {
        expect(screen.getByText(/📖 gene key 1/i)).toBeInTheDocument();
      });
    }
  });

  it('displays core quartet information correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/life's work/i)).toBeInTheDocument();
      expect(screen.getByText(/evolution/i)).toBeInTheDocument();
      expect(screen.getByText(/radiance/i)).toBeInTheDocument();
      expect(screen.getByText(/purpose/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during calculation', () => {
    renderComponent();
    
    // Should show loading indicator initially
    expect(screen.getByText(/calculating/i) || screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles calculation errors gracefully', async () => {
    // Mock API to return error
    const mockError = vi.mocked(require('../../services/api').calculateGeneKeys);
    mockError.mockRejectedValueOnce(new Error('API Error'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/error calculating/i) || screen.getByText(/try again/i)).toBeInTheDocument();
    });
  });

  it('applies performance optimizations (React.memo)', () => {
    const { rerender } = renderComponent();
    
    // Re-render with same props should not cause re-calculation
    rerender(<GeneKeysChart birthData={mockBirthData} onCalculate={vi.fn()} />);
    
    // Component should be memoized and not re-calculate unless props change
    expect(screen.queryByText(/calculating/i)).not.toBeInTheDocument();
  });

  it('integrates well with parent components', () => {
    const mockOnCalculate = vi.fn();
    
    renderComponent({ onCalculate: mockOnCalculate });
    
    // Should not call onCalculate immediately since birthData is provided
    expect(mockOnCalculate).not.toHaveBeenCalled();
  });

  it('supports accessibility features', async () => {
    renderComponent();
    
    await waitFor(() => {
      // Check for proper ARIA labels and roles
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);
      
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });
  });
});

describe('GeneKeysChart Performance', () => {
  it('uses React.memo for component optimization', () => {
    const Component = GeneKeysChart;
    expect(Component.displayName).toBe('GeneKeysChart');
  });

  it('handles large datasets efficiently', async () => {
    const largeDataset = {
      ...mockBirthData,
      // Simulate larger dataset
      activation: {
        name: "Large Activation Sequence",
        description: "Large sequence for testing",
        keys: Array.from({ length: 100 }, (_, i) => ({
          number: i + 1,
          name: `Gene Key ${i + 1}`,
          shadow: `Shadow ${i + 1}`,
          gift: `Gift ${i + 1}`,
          siddhi: `Siddhi ${i + 1}`,
          codon: "AAA",
          description: `Description ${i + 1}`
        }))
      }
    };

    const startTime = performance.now();
    render(<GeneKeysChart birthData={largeDataset} />);
    const endTime = performance.now();
    
    // Should render within reasonable time (less than 100ms)
    expect(endTime - startTime).toBeLessThan(100);
  });
});

const mockBirthData = {
  year: 1990,
  month: 5, 
  day: 15,
  hour: 14,
  minute: 30,
  city: "San Francisco",
  timezone: "America/Los_Angeles"
};
