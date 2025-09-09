import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import VolumeControl from '../VolumeControl';

import '@testing-library/jest-dom';

// Mock Radix UI Slider
vi.mock('@radix-ui/react-slider', () => ({
  Root: ({ children, onValueChange, value: _value, disabled, ...props }: {
    children: React.ReactNode;
    onValueChange: (_value: number[]) => void;
    value: number[];
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <div data-testid="volume-slider-root" {...props}>
      <input
        type="range"
        value={_value[0]}
        onChange={(e) => onValueChange([parseInt((e.target as HTMLInputElement).value)])}
        onInput={(e) => onValueChange([parseInt((e.target as HTMLInputElement).value)])}
        onKeyDown={(e) => {
          const current = Number(_value[0]);
          const step = 1;
          let next = current;
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = current + step;
          if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = current - step;
          if (next !== current) {
            next = Math.max(0, Math.min(100, next));
            onValueChange([next]);
          }
        }}
        disabled={disabled}
        min={0}
        max={100}
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

  // Helper for reliably changing range input
  const setRangeValue = (el: HTMLInputElement, value: number | string) => {
    el.value = String(value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

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
  });

  describe('Slider Functionality', () => {
    it('renders slider with correct initial value', () => {
      const { getByTestId } = render(<VolumeControl value={60} onChange={mockOnChange} />);
      const slider = getByTestId('volume-slider-input');
      expect(slider).toHaveValue('60');
    });

    it('calls onChange when slider value changes', async () => {
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      const slider = getByTestId('volume-slider-input') as HTMLInputElement;
      setRangeValue(slider, 75);
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('respects min and max values', () => {
      const { getByTestId } = render(<VolumeControl value={50} onChange={mockOnChange} />);
      const slider = getByTestId('volume-slider-input');
      
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '100');
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
  });
});
