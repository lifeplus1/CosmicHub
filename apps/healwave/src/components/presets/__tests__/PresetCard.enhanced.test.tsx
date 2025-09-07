import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PresetCard } from '../PresetCard';

// Type definitions for test data
interface TestFrequencyPreset {
  id: string;
  name: string;
  description?: string;
  baseFrequency: number;
  binauralBeat?: number;
  category: 'brainwave' | 'solfeggio' | 'rife' | 'planetary' | 'chakra' | 'custom';
  benefits?: string[];
  metadata?: Record<string, unknown>;
}

// Mock the integrations
vi.mock('@cosmichub/integrations', () => ({
  FrequencyPreset: {},
}));

describe('PresetCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test Data
  const mockBuiltInPreset: TestFrequencyPreset = {
    id: 'preset-1',
    name: 'Alpha Focus',
    description: 'Enhance focus and concentration',
    baseFrequency: 440,
    binauralBeat: 10,
    category: 'brainwave',
    benefits: ['Focus', 'Concentration', 'Mental clarity'],
  };

  const mockUserPreset: TestFrequencyPreset = {
    id: 'user-preset-1',
    name: 'My Custom Preset',
    description: 'Personal meditation preset',
    baseFrequency: 528,
    binauralBeat: 7.5,
    category: 'custom',
    benefits: ['Relaxation', 'Healing'],
    metadata: {
      volume: 0.8,
      duration: 1800,
      fadeIn: 10,
      fadeOut: 10,
    },
  };

  const mockCallbacks = {
    onSelect: vi.fn(),
    onDelete: vi.fn(),
  };

  describe('Basic Rendering', () => {
    it('renders preset card with basic information', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.getByText('Alpha Focus')).toBeInTheDocument();
      expect(screen.getByText('Enhance focus and concentration')).toBeInTheDocument();
      expect(screen.getByText('440Hz')).toBeInTheDocument();
      expect(screen.getByText('10Hz')).toBeInTheDocument();
    });

    it('displays correct icon for brainwave category', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.getByText('🧠')).toBeInTheDocument();
    });

    it('displays correct icon for custom category', () => {
      render(
        <PresetCard
          preset={mockUserPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.getByText('👤')).toBeInTheDocument();
    });

    it('shows custom preset label for user presets', () => {
      render(
        <PresetCard
          preset={mockUserPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.getByText('Custom Preset')).toBeInTheDocument();
    });
  });

  describe('Binaural Beat Information', () => {
    it('displays delta range for low frequencies', () => {
      const deltaPreset = { ...mockBuiltInPreset, binauralBeat: 2 };
      render(
        <PresetCard
          preset={deltaPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.getByText('Delta')).toBeInTheDocument();
      expect(screen.getByText('2Hz')).toBeInTheDocument();
    });

    it('displays theta range for meditation frequencies', () => {
      const thetaPreset = { ...mockBuiltInPreset, binauralBeat: 6 };
      render(
        <PresetCard
          preset={thetaPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.getByText('Theta')).toBeInTheDocument();
    });

    it('displays alpha range for relaxation frequencies', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    it('displays beta range for focus frequencies', () => {
      const betaPreset = { ...mockBuiltInPreset, binauralBeat: 20 };
      render(
        <PresetCard
          preset={betaPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    it('displays gamma range for high focus frequencies', () => {
      const gammaPreset = { ...mockBuiltInPreset, binauralBeat: 40 };
      render(
        <PresetCard
          preset={gammaPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.getByText('Gamma')).toBeInTheDocument();
    });

    it('handles preset without binaural beat', () => {
      const noBeatsPreset = { ...mockBuiltInPreset, binauralBeat: undefined };
      render(
        <PresetCard
          preset={noBeatsPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.queryByText('Binaural Beat:')).not.toBeInTheDocument();
    });
  });

  describe('Benefits Display', () => {
    it('displays all benefits when 3 or fewer', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.getByText('Focus')).toBeInTheDocument();
      expect(screen.getByText('Concentration')).toBeInTheDocument();
      expect(screen.getByText('Mental clarity')).toBeInTheDocument();
    });

    it('truncates benefits list when more than 3', () => {
      const manyBenefitsPreset = {
        ...mockBuiltInPreset,
        benefits: ['Benefit 1', 'Benefit 2', 'Benefit 3', 'Benefit 4', 'Benefit 5'],
      };

      render(
        <PresetCard
          preset={manyBenefitsPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.getByText('Benefit 1')).toBeInTheDocument();
      expect(screen.getByText('Benefit 2')).toBeInTheDocument();
      expect(screen.getByText('Benefit 3')).toBeInTheDocument();
      expect(screen.getByText('+2 more')).toBeInTheDocument();
      expect(screen.queryByText('Benefit 4')).not.toBeInTheDocument();
    });

    it('handles preset without benefits', () => {
      const noBenefitsPreset = { ...mockBuiltInPreset, benefits: undefined };
      render(
        <PresetCard
          preset={noBenefitsPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.queryByText('Benefits:')).not.toBeInTheDocument();
    });
  });

  describe('User Preset Metadata', () => {
    it('displays custom settings for user presets', () => {
      render(
        <PresetCard
          preset={mockUserPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.getByText('Custom Settings:')).toBeInTheDocument();
      expect(screen.getByText('Volume:')).toBeInTheDocument();
      expect(screen.getByText('0.8')).toBeInTheDocument();
      expect(screen.getByText('Duration:')).toBeInTheDocument();
      expect(screen.getByText('1800')).toBeInTheDocument();
    });

    it('does not display metadata for built-in presets', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      expect(screen.queryByText('Custom Settings:')).not.toBeInTheDocument();
    });
  });

  describe('Selection State', () => {
    it('applies selected styling when isSelected is true', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          isSelected={true}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveClass('bg-cyan-900/50', 'border-cyan-400');
    });

    it('applies unselected styling when isSelected is false', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          isSelected={false}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveClass('bg-slate-800/50', 'border-slate-600');
    });

    it('shows selection indicator when selected', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          isSelected={true}
        />
      );

      const indicator = document.querySelector('.bg-cyan-400.rounded-full');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('shows delete button when showDeleteButton is true', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          onDelete={mockCallbacks.onDelete}
          showDeleteButton={true}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete.*preset/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('hides delete button when showDeleteButton is false', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          onDelete={mockCallbacks.onDelete}
          showDeleteButton={false}
        />
      );

      const deleteButton = screen.queryByRole('button', { name: /delete.*preset/i });
      expect(deleteButton).not.toBeInTheDocument();
    });

    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          onDelete={mockCallbacks.onDelete}
          showDeleteButton={true}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete.*preset/i });
      await user.click(deleteButton);

      expect(mockCallbacks.onDelete).toHaveBeenCalledWith('preset-1');
      expect(mockCallbacks.onSelect).not.toHaveBeenCalled();
    });

    it('prevents event bubbling when delete button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          onDelete={mockCallbacks.onDelete}
          showDeleteButton={true}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete.*preset/i });
      await user.click(deleteButton);

      expect(mockCallbacks.onDelete).toHaveBeenCalled();
      expect(mockCallbacks.onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('applies disabled styling when disabled', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          disabled={true}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveClass('opacity-50', 'cursor-not-allowed');
      expect(card).toHaveAttribute('tabIndex', '-1');
    });

    it('does not call onSelect when disabled and clicked', async () => {
      const user = userEvent.setup();

      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          disabled={true}
        />
      );

      const card = screen.getByRole('button');
      await user.click(card);

      expect(mockCallbacks.onSelect).not.toHaveBeenCalled();
    });

    it('disables delete button when card is disabled', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          onDelete={mockCallbacks.onDelete}
          showDeleteButton={true}
          disabled={true}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete.*preset/i });
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('Keyboard Interactions', () => {
    it('calls onSelect when Enter key is pressed', async () => {
      const user = userEvent.setup();

      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');

      expect(mockCallbacks.onSelect).toHaveBeenCalledWith(mockBuiltInPreset);
    });

    it('calls onSelect when Space key is pressed', async () => {
      const user = userEvent.setup();

      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');

      expect(mockCallbacks.onSelect).toHaveBeenCalledWith(mockBuiltInPreset);
    });

    it('does not call onSelect for other keys', async () => {
      const user = userEvent.setup();

      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Escape}');

      expect(mockCallbacks.onSelect).not.toHaveBeenCalled();
    });

    it('does not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();

      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          disabled={true}
        />
      );

      const card = screen.getByRole('button');
      await user.keyboard('{Enter}');

      expect(mockCallbacks.onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Mouse Interactions', () => {
    it('calls onSelect when card is clicked', async () => {
      const user = userEvent.setup();

      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      const card = screen.getByRole('button');
      await user.click(card);

      expect(mockCallbacks.onSelect).toHaveBeenCalledWith(mockBuiltInPreset);
    });

    it('does not call onSelect when disabled and clicked', async () => {
      const user = userEvent.setup();

      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          disabled={true}
        />
      );

      const card = screen.getByRole('button');
      await user.click(card);

      expect(mockCallbacks.onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          isSelected={true}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-pressed', 'true');
      expect(card).toHaveAttribute('aria-label', 'Select Alpha Focus preset');
    });

    it('is focusable when not disabled', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('is not focusable when disabled', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          disabled={true}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '-1');
    });

    it('provides proper labels for delete button', () => {
      render(
        <PresetCard
          preset={mockBuiltInPreset}
          onSelect={mockCallbacks.onSelect}
          onDelete={mockCallbacks.onDelete}
          showDeleteButton={true}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete.*preset/i });
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete Alpha Focus preset');
    });
  });

  describe('Category Icons', () => {
    const categoryTests = [
      { category: 'brainwave', expectedIcon: '🧠' },
      { category: 'solfeggio', expectedIcon: '🎵' },
      { category: 'rife', expectedIcon: '⚡' },
      { category: 'planetary', expectedIcon: '🪐' },
      { category: 'chakra', expectedIcon: '🕉️' },
      { category: 'custom', expectedIcon: '👤' },
      { category: 'unknown', expectedIcon: '🎵' },
    ];

    categoryTests.forEach(({ category, expectedIcon }) => {
      it(`displays ${expectedIcon} icon for ${category} category`, () => {
        const preset = { ...mockBuiltInPreset, category } as TestFrequencyPreset;
        render(
          <PresetCard
            preset={preset as any}
            onSelect={mockCallbacks.onSelect}
          />
        );

        expect(screen.getByText(expectedIcon)).toBeInTheDocument();
      });
    });
  });
});
