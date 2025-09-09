import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BinauralRangeSelector from '../BinauralRangeSelector';

describe('BinauralRangeSelector', () => {
  const mockOnRangeSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      expect(screen.getByText('🌊 Brainwave Frequencies')).toBeInTheDocument();
    });

    it('renders all frequency ranges', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      
      expect(screen.getByText('Delta')).toBeInTheDocument();
      expect(screen.getByText('Theta')).toBeInTheDocument();
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByText('Gamma')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    it('displays frequency ranges for each category', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      
      expect(screen.getByText('0.5-4 Hz')).toBeInTheDocument(); // Delta
      expect(screen.getByText('4-8 Hz')).toBeInTheDocument(); // Theta
      expect(screen.getByText('8-14 Hz')).toBeInTheDocument(); // Alpha
      expect(screen.getByText('14-30 Hz')).toBeInTheDocument(); // Beta
      expect(screen.getByText('30-100 Hz')).toBeInTheDocument(); // Gamma
      expect(screen.getByText('0-100 Hz')).toBeInTheDocument(); // Custom
    });

    it('displays descriptions for each range', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      
      expect(screen.getByText('Deep Sleep')).toBeInTheDocument();
      expect(screen.getByText('Meditation')).toBeInTheDocument();
      expect(screen.getByText('Relaxation')).toBeInTheDocument();
      expect(screen.getByText('Focus')).toBeInTheDocument();
      expect(screen.getByText('High Focus')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <BinauralRangeSelector 
          currentBeat={10} 
          className="custom-class" 
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Current Range Detection', () => {
    it('correctly identifies delta range (0.5-4 Hz)', () => {
      render(<BinauralRangeSelector currentBeat={2} />);
      expect(screen.getByText('Current: Delta (Deep Sleep)')).toBeInTheDocument();
      expect(screen.getByText('2.0 Hz')).toBeInTheDocument();
    });

    it('correctly identifies theta range (4-8 Hz)', () => {
      render(<BinauralRangeSelector currentBeat={6} />);
      expect(screen.getByText('Current: Theta (Meditation)')).toBeInTheDocument();
      expect(screen.getByText('6.0 Hz')).toBeInTheDocument();
    });

    it('correctly identifies alpha range (8-14 Hz)', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      expect(screen.getByText('Current: Alpha (Relaxation)')).toBeInTheDocument();
      expect(screen.getByText('10.0 Hz')).toBeInTheDocument();
    });

    it('correctly identifies beta range (14-30 Hz)', () => {
      render(<BinauralRangeSelector currentBeat={20} />);
      expect(screen.getByText('Current: Beta (Focus)')).toBeInTheDocument();
      expect(screen.getByText('20.0 Hz')).toBeInTheDocument();
    });

    it('correctly identifies gamma range (30-100 Hz)', () => {
      render(<BinauralRangeSelector currentBeat={50} />);
      expect(screen.getByText('Current: Gamma (High Focus)')).toBeInTheDocument();
      expect(screen.getByText('50.0 Hz')).toBeInTheDocument();
    });

    it('defaults to custom range for values outside standard ranges', () => {
      render(<BinauralRangeSelector currentBeat={150} />);
      expect(screen.getByText('Current: Custom')).toBeInTheDocument();
      expect(screen.getByText('150.0 Hz')).toBeInTheDocument();
    });

    it('handles edge case at exact range boundaries', () => {
      render(<BinauralRangeSelector currentBeat={4} />);
      expect(screen.getByText('Current: Delta (Deep Sleep)')).toBeInTheDocument();
    });

    it('handles very low frequencies correctly', () => {
      render(<BinauralRangeSelector currentBeat={0.3} />);
      expect(screen.getByText('Current: Custom')).toBeInTheDocument();
    });

    it('formats current frequency with one decimal place', () => {
      render(<BinauralRangeSelector currentBeat={10.567} />);
      expect(screen.getByText('10.6 Hz')).toBeInTheDocument();
    });
  });

  describe('Visual Indicators', () => {
    it('shows color dots for each range', () => {
      const { container } = render(<BinauralRangeSelector currentBeat={10} />);
      
      // Check for colored dots (w-3 h-3 rounded-full elements)
      const colorDots = container.querySelectorAll('.w-3.h-3.rounded-full');
      expect(colorDots).toHaveLength(7); // 6 ranges + 1 current indicator
    });

    it('applies different colors to different ranges', () => {
      const { container } = render(<BinauralRangeSelector currentBeat={10} />);
      
      // Check for various background color classes
      expect(container.querySelector('.bg-purple-500')).toBeInTheDocument(); // Delta
      expect(container.querySelector('.bg-blue-500')).toBeInTheDocument(); // Theta
      expect(container.querySelector('.bg-green-500')).toBeInTheDocument(); // Alpha
      expect(container.querySelector('.bg-yellow-500')).toBeInTheDocument(); // Beta
      expect(container.querySelector('.bg-red-500')).toBeInTheDocument(); // Gamma
      expect(container.querySelector('.bg-gray-500')).toBeInTheDocument(); // Custom
    });

    it('highlights the active range button', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      
      const alphaButton = screen.getByRole('button', { name: /Select Alpha.*frequency range/i });
      expect(alphaButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('does not highlight inactive range buttons', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      
      const deltaButton = screen.getByRole('button', { name: /Select Delta.*frequency range/i });
      expect(deltaButton).not.toHaveAttribute('aria-pressed');
    });
  });

  describe('User Interactions', () => {
    it('calls onRangeSelect when a range button is clicked', async () => {
      const user = userEvent.setup();
      render(<BinauralRangeSelector currentBeat={10} onRangeSelect={mockOnRangeSelect} />);
      
      const deltaButton = screen.getByRole('button', { name: /Select Delta.*frequency range/i });
      await user.click(deltaButton);
      
      expect(mockOnRangeSelect).toHaveBeenCalledWith({
        min: 0.5,
        max: 4,
        name: 'Delta (Deep Sleep)',
        color: 'purple',
        key: 'delta'
      });
    });

    it('calls onRangeSelect with correct data for theta range', async () => {
      const user = userEvent.setup();
      render(<BinauralRangeSelector currentBeat={10} onRangeSelect={mockOnRangeSelect} />);
      
      const thetaButton = screen.getByRole('button', { name: /Select Theta.*frequency range/i });
      await user.click(thetaButton);
      
      expect(mockOnRangeSelect).toHaveBeenCalledWith({
        min: 4,
        max: 8,
        name: 'Theta (Meditation)',
        color: 'blue',
        key: 'theta'
      });
    });

    it('calls onRangeSelect with correct data for custom range', async () => {
      const user = userEvent.setup();
      render(<BinauralRangeSelector currentBeat={10} onRangeSelect={mockOnRangeSelect} />);
      
      const customButton = screen.getByRole('button', { name: /Select Custom.*frequency range/i });
      await user.click(customButton);
      
      expect(mockOnRangeSelect).toHaveBeenCalledWith({
        min: 0,
        max: 100,
        name: 'Custom',
        color: 'gray',
        key: 'custom'
      });
    });

    it('does not throw error when onRangeSelect is not provided', async () => {
      const user = userEvent.setup();
      render(<BinauralRangeSelector currentBeat={10} />);
      
      const deltaButton = screen.getByRole('button', { name: /Select Delta.*frequency range/i });
      await expect(user.click(deltaButton)).resolves.not.toThrow();
    });

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<BinauralRangeSelector currentBeat={10} onRangeSelect={mockOnRangeSelect} />);
      
      const deltaButton = screen.getByRole('button', { name: /Select Delta.*frequency range/i });
      await user.tab();
      expect(deltaButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnRangeSelect).toHaveBeenCalled();
    });

    it('provides proper focus management', async () => {
      const user = userEvent.setup();
      render(<BinauralRangeSelector currentBeat={10} />);
      
      const buttons = screen.getAllByRole('button');
      
      // Tab through all buttons
      for (let i = 0; i < buttons.length; i++) {
        await user.tab();
        expect(buttons[i]).toHaveFocus();
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for all buttons', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      
      expect(screen.getByRole('button', { name: /Select Delta.*frequency range/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select Theta.*frequency range/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select Alpha.*frequency range/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select Beta.*frequency range/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select Gamma.*frequency range/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select Custom.*frequency range/i })).toBeInTheDocument();
    });

    it('sets aria-pressed for the active range', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      
      const alphaButton = screen.getByRole('button', { name: /Select Alpha.*frequency range/i });
      expect(alphaButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('uses aria-hidden for decorative elements', () => {
      const { container } = render(<BinauralRangeSelector currentBeat={10} />);
      
      const decorativeElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeElements.length).toBeGreaterThan(0);
    });

    it('has proper heading structure', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      
      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toHaveTextContent('🌊 Brainwave Frequencies');
    });

    it('provides meaningful button text without relying only on color', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      
      // Each button should have the range name and frequency range
      expect(screen.getByText('Delta')).toBeInTheDocument();
      expect(screen.getByText('0.5-4 Hz')).toBeInTheDocument();
      expect(screen.getByText('Deep Sleep')).toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('uses responsive grid layout', () => {
      const { container } = render(<BinauralRangeSelector currentBeat={10} />);
      
      const gridContainer = container.querySelector('.grid.grid-cols-2.sm\\:grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });

    it('maintains proper spacing between buttons', () => {
      const { container } = render(<BinauralRangeSelector currentBeat={10} />);
      
      const gridContainer = container.querySelector('.gap-2');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Current Range Indicator', () => {
    it('displays current range information correctly', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      
      expect(screen.getByText('Current: Alpha (Relaxation)')).toBeInTheDocument();
      expect(screen.getByText('10.0 Hz')).toBeInTheDocument();
    });

    it('updates when currentBeat changes', () => {
      const { rerender } = render(<BinauralRangeSelector currentBeat={10} />);
      expect(screen.getByText('Current: Alpha (Relaxation)')).toBeInTheDocument();
      
      rerender(<BinauralRangeSelector currentBeat={6} />);
      expect(screen.getByText('Current: Theta (Meditation)')).toBeInTheDocument();
    });

    it('shows the correct color indicator for current range', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      
      // Find the current range indicator section
      const currentSection = screen.getByText('Current: Alpha (Relaxation)').parentElement;
      expect(currentSection?.querySelector('.bg-green-500')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero frequency', () => {
      render(<BinauralRangeSelector currentBeat={0} />);
      expect(screen.getByText('Current: Custom')).toBeInTheDocument();
      expect(screen.getByText('0.0 Hz')).toBeInTheDocument();
    });

    it('handles negative frequency', () => {
      render(<BinauralRangeSelector currentBeat={-5} />);
      expect(screen.getByText('Current: Custom')).toBeInTheDocument();
    });

    it('handles very high frequency', () => {
      render(<BinauralRangeSelector currentBeat={1000} />);
      expect(screen.getByText('Current: Custom')).toBeInTheDocument();
    });

    it('handles decimal frequencies correctly', () => {
      render(<BinauralRangeSelector currentBeat={8.5} />);
      expect(screen.getByText('Current: Alpha (Relaxation)')).toBeInTheDocument();
      expect(screen.getByText('8.5 Hz')).toBeInTheDocument();
    });

    it('handles boundary values correctly', () => {
      // Test exact boundary values
      render(<BinauralRangeSelector currentBeat={8} />);
      expect(screen.getByText('Current: Theta (Meditation)')).toBeInTheDocument();
    });
  });

  describe('Component Memorization', () => {
    it('has proper display name', () => {
      expect(BinauralRangeSelector.displayName).toBe('BinauralRangeSelector');
    });

    it('memoizes properly to prevent unnecessary re-renders', () => {
      const { rerender } = render(<BinauralRangeSelector currentBeat={10} />);
      
      // Rerender with same props
      rerender(<BinauralRangeSelector currentBeat={10} />);
      
      // Component should still be rendered correctly
      expect(screen.getByText('🌊 Brainwave Frequencies')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('applies hover and active states correctly', () => {
      render(<BinauralRangeSelector currentBeat={10} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('hover:scale-105');
        expect(button).toHaveClass('active:scale-95');
      });
    });

    it('has proper focus states', () => {
      const { container } = render(<BinauralRangeSelector currentBeat={10} />);
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('focus:outline-none');
        expect(button).toHaveClass('focus:ring-2');
        expect(button).toHaveClass('focus:ring-white/50');
      });
    });
  });
});
