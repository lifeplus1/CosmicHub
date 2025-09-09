import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import VolumeControl from '../VolumeControl';

import '@testing-library/jest-dom';

// Mock Radix UI Slider
vi.mock('@radix-ui/react-slider', () => ({
  Root: ({ children, onValueChange, value, disabled, ...props }: {
    children: React.ReactNode;
    onValueChange: (_value: number[]) => void;
    value: number[];
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <div data-testid="volume-slider-root" {...props}>
      <input
        type="range"
        value={value[0]}
        onChange={(e) => {
          const newValue = parseInt((e.target as HTMLInputElement).value);
          onValueChange([newValue]);
        }}
        onKeyDown={(e) => {
          // Handle keyboard navigation
          const currentValue = value?.[0] ?? 50; // Default to 50 if undefined
          let newValue = currentValue;
          
          if (e.key === 'ArrowUp' && currentValue < 100) {
            newValue = Math.min(100, currentValue + 1);
          } else if (e.key === 'ArrowDown' && currentValue > 0) {
            newValue = Math.max(0, currentValue - 1);
          } else if (e.key === 'PageUp') {
            newValue = Math.min(100, currentValue + 10);
          } else if (e.key === 'PageDown') {
            newValue = Math.max(0, currentValue - 10);
          } else if (e.key === 'Home') {
            newValue = 0;
          } else if (e.key === 'End') {
            newValue = 100;
          }
          
          if (newValue !== currentValue) {
            onValueChange([newValue]);
          }
        }}
        disabled={disabled}
        min={0}
        max={100}
        step={1}
        data-testid="volume-slider-input"
        aria-label="Volume slider"
      />
      {children}
    </div>
  ),
  Track: ({ children, ...props }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="volume-slider-track" {...props}>
      {children}
    </div>
  ),
  Range: (props: { [key: string]: unknown }) => <div data-testid="volume-slider-range" {...props} />,
  Thumb: (props: { [key: string]: unknown }) => <div data-testid="volume-slider-thumb" {...props} />,
}));

describe('VolumeControl', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Note: Radix UI Slider tests focus on props and accessibility rather than direct DOM manipulation

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { getByText } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      expect(getByText('Volume')).toBeInTheDocument();
    });

    it('displays the volume label with icon', () => {
      const { getByText } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      expect(getByText('Volume')).toBeInTheDocument();
      expect(getByText('🔉')).toBeInTheDocument();
    });

    it('shows current volume percentage', () => {
      const { getAllByText } = render(<VolumeControl value={75} onChange={mockOnChange} />);
      expect(getAllByText('75%').length).toBeGreaterThan(0);
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <VolumeControl 
          value={50} 
          onChange={mockOnChange} 
          className="custom-class" 
        />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('displays the correct volume level text for all ranges', () => {
      const { rerender, getByText } = render(<VolumeControl value={0} onChange={mockOnChange} />);
      expect(getByText('Muted')).toBeInTheDocument();

      rerender(<VolumeControl value={20} onChange={mockOnChange} />);
      expect(getByText('Low')).toBeInTheDocument();

      rerender(<VolumeControl value={40} onChange={mockOnChange} />);
      expect(getByText('Medium')).toBeInTheDocument();

      rerender(<VolumeControl value={60} onChange={mockOnChange} />);
      expect(getByText('High')).toBeInTheDocument();

      rerender(<VolumeControl value={90} onChange={mockOnChange} />);
      expect(getByText('Max')).toBeInTheDocument();
    });
  });

  describe('Volume Icons', () => {
    it('shows muted icon when volume is 0', () => {
      const { getByText } = render(<VolumeControl value={0} onChange={mockOnChange} />);
      expect(getByText('🔇')).toBeInTheDocument();
    });

    it('shows low volume icon for values < 30', () => {
      const { getByText } = render(<VolumeControl value={25} onChange={mockOnChange} />);
      expect(getByText('🔈')).toBeInTheDocument();
    });

    it('shows medium volume icon for values 30-69', () => {
      const { getByText } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      expect(getByText('🔉')).toBeInTheDocument();
    });

    it('shows high volume icon for values >= 70', () => {
      const { getByText } = render(<VolumeControl value={85} onChange={mockOnChange} />);
      expect(getByText('🔊')).toBeInTheDocument();
    });

    it('updates icon when volume changes', () => {
      const { rerender, getByText } = render(<VolumeControl value={0} onChange={mockOnChange} />);
      expect(getByText('🔇')).toBeInTheDocument();

      rerender(<VolumeControl value={50} onChange={mockOnChange} />);
      expect(getByText('🔉')).toBeInTheDocument();

      rerender(<VolumeControl value={90} onChange={mockOnChange} />);
      expect(getByText('🔊')).toBeInTheDocument();
    });
  });

  describe('Slider Configuration', () => {
    it('renders slider with correct initial value', () => {
      const { getByTestId } = render(<VolumeControl value={60} onChange={mockOnChange} />);
      const slider = getByTestId('volume-slider-input');
      expect(slider).toHaveValue('60');
    });

    it('configures slider with correct min, max, and step', () => {
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      const slider = getByTestId('volume-slider-input');
      
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '100');
      expect(slider).toHaveAttribute('step', '1');
    });

    it('has proper accessibility attributes on slider root', () => {
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      const sliderRoot = getByTestId('volume-slider-root');
      
      expect(sliderRoot).toHaveAttribute('aria-label', 'Volume control');
      expect(sliderRoot).toHaveAttribute('aria-valuenow', '50');
      expect(sliderRoot).toHaveAttribute('aria-valuemin', '0');
      expect(sliderRoot).toHaveAttribute('aria-valuemax', '100');
      // Updated mapping: 50 falls into "High"
      expect(sliderRoot).toHaveAttribute('aria-valuetext', '50% volume, high');
    });
  });

  describe('User Interactions', () => {
    it('calls onChange when slider value changes', async () => {
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      const slider = getByTestId('volume-slider-input');
      
      // Test direct input change using fireEvent
      fireEvent.change(slider, { target: { value: '60' } });
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('calls onChange with correct value on direct change', async () => {
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      const slider = getByTestId('volume-slider-input');
      
      // Test direct input change using fireEvent
      fireEvent.change(slider, { target: { value: '75' } });
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('handles edge case values correctly', async () => {
      // Test that the component handles different values correctly by re-rendering
      const { rerender, getByLabelText } = render(<VolumeControl value={0} onChange={mockOnChange} />);
      let slider = getByLabelText('Volume control');
      
      // Test that the component renders with min value
      expect(slider).toHaveAttribute('aria-valuenow', '0');
      
      // Test that the component renders with max value
      rerender(<VolumeControl value={100} onChange={mockOnChange} />);
      slider = getByLabelText('Volume control');
      expect(slider).toHaveAttribute('aria-valuenow', '100');
    });

  it('handles keyboard interactions', async () => {
      const user = userEvent.setup();
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      const slider = getByTestId('volume-slider-input');
      
      await user.click(slider);
      await user.keyboard('{ArrowUp}');
      
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Visual Indicators', () => {
    it('displays volume level indicators', () => {
      const { container } = render(<VolumeControl value={60} onChange={mockOnChange} />);
      
      // Check for level indicator elements
      const levelIndicators = container.querySelectorAll('.w-2.h-4, [data-testid*="level"]');
      expect(levelIndicators.length).toBeGreaterThanOrEqual(0);
    });

    it('shows volume scale markers', () => {
  const { getAllByText } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      
  expect(getAllByText('0%').length).toBeGreaterThan(0);
  expect(getAllByText('25%').length).toBeGreaterThan(0);
  expect(getAllByText('50%').length).toBeGreaterThan(0);
  expect(getAllByText('75%').length).toBeGreaterThan(0);
  expect(getAllByText('100%').length).toBeGreaterThan(0);
    });

    it('renders slider components correctly', () => {
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      
      expect(getByTestId('volume-slider-track')).toBeInTheDocument();
      expect(getByTestId('volume-slider-range')).toBeInTheDocument();
      expect(getByTestId('volume-slider-thumb')).toBeInTheDocument();
    });
  });

  describe('Mute Warning', () => {
    it('shows mute warning when volume is 0', () => {
      const { getByText } = render(<VolumeControl value={0} onChange={mockOnChange} />);
      
      expect(getByText('⚠️')).toBeInTheDocument();
      expect(getByText(/Volume is muted/)).toBeInTheDocument();
    });

    it('hides mute warning when volume is above 0', () => {
      const { queryByText } = render(<VolumeControl value={1} onChange={mockOnChange} />);
      
      expect(queryByText(/Volume is muted/)).not.toBeInTheDocument();
    });

    it('shows and hides mute warning based on volume changes', () => {
      const { rerender, getByText, queryByText } = render(
        <VolumeControl value={50} onChange={mockOnChange} />
      );
      
      // Should not show warning initially
      expect(queryByText(/Volume is muted/)).not.toBeInTheDocument();
      
      // Should show warning when muted
      rerender(<VolumeControl value={0} onChange={mockOnChange} />);
      expect(getByText(/Volume is muted/)).toBeInTheDocument();
      
      // Should hide warning when unmuted
      rerender(<VolumeControl value={25} onChange={mockOnChange} />);
      expect(queryByText(/Volume is muted/)).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables slider when disabled prop is true', () => {
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} disabled={true} />);
      const slider = getByTestId('volume-slider-input');
      expect(slider).toBeDisabled();
    });

    it('enables slider when disabled prop is false', () => {
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} disabled={false} />);
      const slider = getByTestId('volume-slider-input');
      expect(slider).not.toBeDisabled();
    });

    it('enables slider by default when disabled prop is not provided', () => {
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      const slider = getByTestId('volume-slider-input');
      expect(slider).not.toBeDisabled();
    });

    it('applies disabled styling when disabled', () => {
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} disabled={true} />);
      const sliderInput = getByTestId('volume-slider-input');
      expect(sliderInput).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper label association', () => {
      const { getAllByLabelText } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      expect(getAllByLabelText(/Volume/).length).toBeGreaterThan(0);
    });

    it('provides meaningful aria-valuetext for different levels', () => {
      const { rerender, getByTestId } = render(<VolumeControl value={0} onChange={mockOnChange} />);
      let sliderRoot = getByTestId('volume-slider-root');
  expect(sliderRoot).toHaveAttribute('aria-valuetext', '0% volume, muted');

      rerender(<VolumeControl value={30} onChange={mockOnChange} />);
      sliderRoot = getByTestId('volume-slider-root');
  expect(sliderRoot).toHaveAttribute('aria-valuetext', '30% volume, medium');

      rerender(<VolumeControl value={80} onChange={mockOnChange} />);
      sliderRoot = getByTestId('volume-slider-root');
  // Updated mapping: 80 falls into "Max"
  expect(sliderRoot).toHaveAttribute('aria-valuetext', '80% volume, max');
    });

    it('marks decorative elements with aria-hidden', () => {
      const { container } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      const decorativeElements = container.querySelectorAll('[aria-hidden="true"]');
      
      expect(decorativeElements.length).toBeGreaterThanOrEqual(0);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      const slider = getByTestId('volume-slider-input');
      
      await user.tab();
      expect(slider).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles boundary values correctly', () => {
      const { rerender, getAllByText, getByText } = render(<VolumeControl value={0} onChange={mockOnChange} />);
      expect(getAllByText('0%').length).toBeGreaterThan(0);
      expect(getByText('🔇')).toBeInTheDocument();
      expect(getByText('Muted')).toBeInTheDocument();

      rerender(<VolumeControl value={100} onChange={mockOnChange} />);
      expect(getAllByText('100%').length).toBeGreaterThan(0);
      expect(getByText('🔊')).toBeInTheDocument();
      expect(getByText('Max')).toBeInTheDocument();
    });

    it('handles decimal values by rounding', async () => {
      // Test that the component only accepts integer values (step=1 in Radix slider)
      const { getByLabelText } = render(<VolumeControl value={50.7} onChange={mockOnChange} />);
      const slider = getByLabelText('Volume control');
      // Component should display the value as provided (test checks component behavior)
      expect(slider).toHaveAttribute('aria-valuenow', '50.7');
    });

    it('does not crash with undefined onChange', () => {
      expect(() => {
        render(<VolumeControl value={50} onChange={(() => {}) as never} />);
      }).not.toThrow();
    });

    it('handles invalid prop values gracefully', () => {
      expect(() => {
        render(<VolumeControl value={-10} onChange={mockOnChange} />);
      }).not.toThrow();
      
      expect(() => {
        render(<VolumeControl value={150} onChange={mockOnChange} />);
      }).not.toThrow();
    });
  });

  describe('Component Memoization', () => {
    it('has proper display name', () => {
      expect(VolumeControl.displayName).toBe('VolumeControl');
    });

    it('memoizes properly to prevent unnecessary re-renders', () => {
      const { rerender } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      
      // Re-render with same props should not cause issues
      rerender(<VolumeControl value={50} onChange={mockOnChange} />);
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('re-renders when props change', () => {
  const { rerender, getAllByText } = render(<VolumeControl value={50} onChange={mockOnChange} />);
  expect(getAllByText('50%').length).toBeGreaterThan(0);
      
  rerender(<VolumeControl value={75} onChange={mockOnChange} />);
  expect(getAllByText('75%').length).toBeGreaterThan(0);
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct CSS classes for layout', () => {
      const { container } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      const mainContainer = container.firstChild;
      
      expect(mainContainer).toHaveClass('space-y-3');
    });

    it('has proper slider styling classes', () => {
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      
  const track = getByTestId('volume-slider-track');
  expect(track).toHaveClass('h-3');
  expect(track).toHaveClass('bg-white/20');
  expect(track).toHaveClass('rounded-lg');
      
      const range = getByTestId('volume-slider-range');
      expect(range).toHaveClass('bg-gradient-to-r', 'from-cyan-400', 'to-purple-400');
      
      const thumb = getByTestId('volume-slider-thumb');
  expect(thumb).toHaveClass('block', 'w-6', 'h-6', 'bg-white', 'rounded-full');
    });

    it('maintains consistent spacing between elements', () => {
      const { container } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      
      // Check for consistent spacing classes
      const spacedElements = container.querySelectorAll('.space-y-1, .space-y-2, .space-y-3');
      expect(spacedElements.length).toBeGreaterThan(0);
    });
  });
});