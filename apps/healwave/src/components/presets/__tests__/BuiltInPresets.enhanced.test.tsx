import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuiltInPresets } from '../BuiltInPresets';
import { FrequencyPreset } from '@cosmichub/integrations';

// Mock PresetCard
vi.mock('../PresetCard', () => ({
  __esModule: true,
  default: vi.fn(({ preset, onSelect, isSelected, disabled, showDeleteButton }) => (
    <div data-testid="preset-card">
      <span>{preset.name}</span>
      <span data-testid="preset-category">{preset.category}</span>
      <button 
        onClick={() => onSelect(preset)}
        disabled={disabled}
        data-testid={`select-${preset.id}`}
      >
        Select
      </button>
      {isSelected && <span data-testid="selected">Selected</span>}
      {showDeleteButton && <button data-testid="delete-button">Delete</button>}
    </div>
  )),
}));

describe('BuiltInPresets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test Data
  const mockPresets: FrequencyPreset[] = [
    {
      id: 'solfeggio-396',
      name: '396 Hz - Liberation',
      category: 'solfeggio',
      baseFrequency: 396,
      description: 'Liberating guilt and fear',
    },
    {
      id: 'solfeggio-528',
      name: '528 Hz - Love',
      category: 'solfeggio',
      baseFrequency: 528,
      description: 'Transformation and DNA repair',
    },
    {
      id: 'brainwave-alpha',
      name: 'Alpha Waves',
      category: 'brainwave',
      baseFrequency: 432,
      binauralBeat: 10,
      description: 'Relaxed awareness',
    },
    {
      id: 'rife-cancer',
      name: 'Rife Cancer Support',
      category: 'rife',
      baseFrequency: 2128,
      description: 'Traditional Rife frequency',
    },
  ];

  const mockCallbacks = {
    onSelectPreset: vi.fn(),
  };

  describe('Basic Rendering', () => {
    it('renders the component with presets', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      expect(screen.getByText('Built-in Presets')).toBeInTheDocument();
      expect(screen.getByText('(4 available)')).toBeInTheDocument();
    });

    it('displays correct preset count in header', () => {
      const singlePreset = [mockPresets[0]];
      
      render(
        <BuiltInPresets
          presets={singlePreset}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      expect(screen.getByText('(1 available)')).toBeInTheDocument();
    });

    it('renders all preset cards', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      const presetCards = screen.getAllByTestId('preset-card');
      expect(presetCards).toHaveLength(4);

      // Check that all preset names are rendered
      expect(screen.getByText('396 Hz - Liberation')).toBeInTheDocument();
      expect(screen.getByText('528 Hz - Love')).toBeInTheDocument();
      expect(screen.getByText('Alpha Waves')).toBeInTheDocument();
      expect(screen.getByText('Rife Cancer Support')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no presets are provided', () => {
      render(
        <BuiltInPresets
          presets={[]}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      expect(screen.getByText('Built-in Presets')).toBeInTheDocument();
      expect(screen.getByText('No built-in presets available.')).toBeInTheDocument();
      expect(screen.queryByTestId('preset-card')).not.toBeInTheDocument();
    });

    it('does not show preset count in empty state', () => {
      render(
        <BuiltInPresets
          presets={[]}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      expect(screen.queryByText('available')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when loading is true', () => {
      render(
        <BuiltInPresets
          presets={[]}
          onSelectPreset={mockCallbacks.onSelectPreset}
          loading={true}
        />
      );

      expect(screen.getByText('Built-in Presets')).toBeInTheDocument();
      
      // Check for loading skeletons
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(6); // 6 skeleton cards
    });

    it('does not render preset cards when loading', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          loading={true}
        />
      );

      expect(screen.queryByTestId('preset-card')).not.toBeInTheDocument();
    });

    it('does not show preset count when loading', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          loading={true}
        />
      );

      expect(screen.queryByText('available')).not.toBeInTheDocument();
    });
  });

  describe('Preset Selection', () => {
    it('calls onSelectPreset when a preset is selected', async () => {
      const user = userEvent.setup();

      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      const selectButton = screen.getByTestId('select-solfeggio-396');
      await user.click(selectButton);

      expect(mockCallbacks.onSelectPreset).toHaveBeenCalledWith(mockPresets[0]);
    });

    it('shows selected state for the selected preset', () => {
      const selectedPreset = mockPresets[1]; // 528 Hz preset

      render(
        <BuiltInPresets
          presets={mockPresets}
          selectedPreset={selectedPreset}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      // Only one preset should be marked as selected
      expect(screen.getByTestId('selected')).toBeInTheDocument();
    });

    it('shows no selection when selectedPreset is null', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          selectedPreset={null}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      expect(screen.queryByTestId('selected')).not.toBeInTheDocument();
    });

    it('shows no selection when selectedPreset is undefined', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          selectedPreset={undefined}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      expect(screen.queryByTestId('selected')).not.toBeInTheDocument();
    });

    it('handles selection of different preset categories', async () => {
      const user = userEvent.setup();

      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      // Test selecting different categories
      await user.click(screen.getByTestId('select-brainwave-alpha'));
      expect(mockCallbacks.onSelectPreset).toHaveBeenCalledWith(mockPresets[2]);

      await user.click(screen.getByTestId('select-rife-cancer'));
      expect(mockCallbacks.onSelectPreset).toHaveBeenCalledWith(mockPresets[3]);
    });
  });

  describe('PresetCard Integration', () => {
    it('passes correct props to PresetCard components', () => {
      const selectedPreset = mockPresets[0];

      render(
        <BuiltInPresets
          presets={mockPresets}
          selectedPreset={selectedPreset}
          onSelectPreset={mockCallbacks.onSelectPreset}
          loading={false}
        />
      );

      // Verify that PresetCard components receive showDeleteButton as false
      expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
    });

    it('disables preset cards when loading', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          loading={true}
        />
      );

      // When loading, preset cards shouldn't be rendered
      expect(screen.queryByTestId('preset-card')).not.toBeInTheDocument();
    });

    it('renders preset cards with unique keys', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      // Each preset should have a unique select button
      mockPresets.forEach(preset => {
        expect(screen.getByTestId(`select-${preset.id}`)).toBeInTheDocument();
      });
    });
  });

  describe('Grid Layout', () => {
    it('renders presets in a responsive grid layout', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      const gridContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });

    it('maintains grid structure with different preset counts', () => {
      const singlePreset = [mockPresets[0]];

      render(
        <BuiltInPresets
          presets={singlePreset}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(screen.getByTestId('preset-card')).toBeInTheDocument();
    });

    it('loading state also uses grid layout', () => {
      render(
        <BuiltInPresets
          presets={[]}
          onSelectPreset={mockCallbacks.onSelectPreset}
          loading={true}
        />
      );

      const gridContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Preset Categories', () => {
    it('handles different preset categories correctly', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      // Check that all categories are represented
      const categoryElements = screen.getAllByTestId('preset-category');
      const categories = categoryElements.map((el: HTMLElement) => el.textContent);
      
      expect(categories).toContain('solfeggio');
      expect(categories).toContain('brainwave');
      expect(categories).toContain('rife');
      expect(categoryElements).toHaveLength(4); // Should have 4 category elements
    });

    it('handles presets with and without binaural beats', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      // All presets should be rendered regardless of binaural beat presence
      expect(screen.getAllByTestId('preset-card')).toHaveLength(4);
    });
  });

  describe('Default Props', () => {
    it('works with minimal required props', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      expect(screen.getByText('Built-in Presets')).toBeInTheDocument();
      expect(screen.getAllByTestId('preset-card')).toHaveLength(4);
    });

    it('handles undefined optional props gracefully', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          selectedPreset={undefined}
          loading={undefined}
        />
      );

      expect(screen.getByText('Built-in Presets')).toBeInTheDocument();
      // Should not crash and should render normally
    });

    it('defaults loading to false when not specified', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      // Should show preset cards, not loading skeletons
      expect(screen.getAllByTestId('preset-card')).toHaveLength(4);
      expect(document.querySelectorAll('.animate-pulse')).toHaveLength(0);
    });
  });

  describe('Component Structure', () => {
    it('has proper heading structure', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      const heading = screen.getByText('Built-in Presets');
      expect(heading).toHaveClass('text-lg', 'font-semibold', 'text-white');
    });

    it('maintains consistent spacing', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      const container = document.querySelector('.space-y-4');
      expect(container).toBeInTheDocument();
    });

    it('empty state has proper styling', () => {
      render(
        <BuiltInPresets
          presets={[]}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      const emptyMessage = screen.getByText('No built-in presets available.');
      expect(emptyMessage.closest('div')).toHaveClass('text-center', 'py-8', 'text-slate-400');
    });
  });

  describe('Edge Cases', () => {
    it('handles very large preset lists', () => {
      const manyPresets = Array.from({ length: 50 }, (_, i) => ({
        id: `preset-${i}`,
        name: `Preset ${i}`,
        category: 'solfeggio' as const,
        baseFrequency: 396 + i,
        description: `Description ${i}`,
      }));

      render(
        <BuiltInPresets
          presets={manyPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      expect(screen.getByText('(50 available)')).toBeInTheDocument();
      expect(screen.getAllByTestId('preset-card')).toHaveLength(50);
    });

    it('handles preset with missing optional properties', () => {
      const minimalPreset: FrequencyPreset = {
        id: 'minimal',
        name: 'Minimal Preset',
        category: 'solfeggio',
        baseFrequency: 432,
      };

      render(
        <BuiltInPresets
          presets={[minimalPreset]}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      expect(screen.getByText('Minimal Preset')).toBeInTheDocument();
      expect(screen.getByTestId('preset-card')).toBeInTheDocument();
    });

    it('handles selection with preset ID comparison correctly', () => {
      const preset1: FrequencyPreset = { 
        ...mockPresets[0], 
        id: 'same-id',
        name: 'First Preset',
        category: 'solfeggio',
        baseFrequency: 396,
      };
      const preset2: FrequencyPreset = { 
        ...mockPresets[1], 
        id: 'same-id',
        name: 'Second Preset', 
        category: 'solfeggio',
        baseFrequency: 528,
      };

      render(
        <BuiltInPresets
          presets={[preset1, preset2]}
          selectedPreset={preset1}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      // Should handle ID-based selection correctly
      expect(screen.getAllByTestId('selected')).toHaveLength(2); // Both would match same ID
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(
        <BuiltInPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Built-in Presets');
    });

    it('loading state maintains proper structure', () => {
      render(
        <BuiltInPresets
          presets={[]}
          onSelectPreset={mockCallbacks.onSelectPreset}
          loading={true}
        />
      );

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('empty state is properly announced', () => {
      render(
        <BuiltInPresets
          presets={[]}
          onSelectPreset={mockCallbacks.onSelectPreset}
        />
      );

      expect(screen.getByText('No built-in presets available.')).toBeInTheDocument();
    });
  });
});
