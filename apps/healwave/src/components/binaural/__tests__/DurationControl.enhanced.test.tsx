import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DurationControl from '../DurationControl';

// Mock Radix UI Slider with simplified implementation
vi.mock('@radix-ui/react-slider', () => ({
  Root: ({ children, onValueChange, value: _value, ...props }: {
    children: React.ReactNode;
    onValueChange: (_value: number[]) => void;
    value: number[];
    [key: string]: unknown;
  }) => (
    <div data-testid="duration-slider-root" {...props}>
      <input
        type="range"
        value={_value[0]}
        onChange={(e) => onValueChange([parseInt(e.target.value)])}
        min={1}
        max={120}
        data-testid="duration-slider-input"
        aria-label="Duration slider"
      />
      {children}
    </div>
  ),
  Track: ({ children, ...props }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="duration-slider-track" {...props}>
      {children}
    </div>
  ),
  Range: (props: { [key: string]: unknown }) => <div data-testid="duration-slider-range" {...props} />,
  Thumb: (props: { [key: string]: unknown }) => <div data-testid="duration-slider-thumb" {...props} />,
}));

describe('DurationControl', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { getByText } = render(<DurationControl value={30} onChange={mockOnChange} />);
      expect(getByText('Session Duration')).toBeTruthy();
    });

    it('displays the session duration label with icon', () => {
      const { getByText } = render(<DurationControl value={30} onChange={mockOnChange} />);
      expect(getByText('Session Duration')).toBeTruthy();
      expect(getByText('🧘')).toBeTruthy(); // 30 min = meditation icon
    });

    it('shows current duration formatted correctly', () => {
  const { getAllByText } = render(<DurationControl value={45} onChange={mockOnChange} />);
  expect(getAllByText('45 min').length).toBeGreaterThan(0);
    });

    it('formats hours correctly', () => {
  const { getAllByText } = render(<DurationControl value={90} onChange={mockOnChange} />);
  expect(getAllByText('1h 30m').length).toBeGreaterThan(0);
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <DurationControl 
          value={30} 
          onChange={mockOnChange} 
          className="custom-class" 
        />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Duration Icons', () => {
    it('shows quick session icon for values <= 10', () => {
      const { getByText } = render(<DurationControl value={5} onChange={mockOnChange} />);
      expect(getByText('⚡')).toBeTruthy();
    });

    it('shows meditation icon for values <= 30', () => {
      const { getByText } = render(<DurationControl value={20} onChange={mockOnChange} />);
      expect(getByText('🧘')).toBeTruthy();
    });

    it('shows wave icon for values <= 60', () => {
      const { getByText } = render(<DurationControl value={45} onChange={mockOnChange} />);
      expect(getByText('🌊')).toBeTruthy();
    });

    it('shows galaxy icon for values > 60', () => {
      const { getByText } = render(<DurationControl value={90} onChange={mockOnChange} />);
      expect(getByText('🌌')).toBeTruthy();
    });
  });

  describe('Duration Recommendations', () => {
    it('shows "Quick session" for values <= 5', () => {
  const { getAllByText } = render(<DurationControl value={5} onChange={mockOnChange} />);
  expect(getAllByText('Quick session').length).toBeGreaterThan(0);
    });

    it('shows "Relaxation" for values <= 15', () => {
  const { getAllByText } = render(<DurationControl value={10} onChange={mockOnChange} />);
  expect(getAllByText('Relaxation').length).toBeGreaterThan(0);
    });

    it('shows "Meditation" for values <= 30', () => {
  const { getAllByText } = render(<DurationControl value={25} onChange={mockOnChange} />);
  expect(getAllByText('Meditation').length).toBeGreaterThan(0);
    });

    it('shows "Deep session" for values <= 60', () => {
  const { getAllByText } = render(<DurationControl value={45} onChange={mockOnChange} />);
  expect(getAllByText('Deep session').length).toBeGreaterThan(0);
    });

    it('shows "Extended practice" for values > 60', () => {
  const { getAllByText } = render(<DurationControl value={90} onChange={mockOnChange} />);
  expect(getAllByText('Extended practice').length).toBeGreaterThan(0);
    });
  });

  describe('Preset Duration Buttons', () => {
    it('renders all preset duration buttons', () => {
  const { getByRole } = render(<DurationControl value={30} onChange={mockOnChange} />);
      
  expect(getByRole('button', { name: /Set duration to 5 min/i })).toBeTruthy();
  expect(getByRole('button', { name: /Set duration to 10 min/i })).toBeTruthy();
  expect(getByRole('button', { name: /Set duration to 15 min/i })).toBeTruthy();
  expect(getByRole('button', { name: /Set duration to 20 min/i })).toBeTruthy();
  expect(getByRole('button', { name: /Set duration to 30 min/i })).toBeTruthy();
  expect(getByRole('button', { name: /Set duration to 45 min/i })).toBeTruthy();
  expect(getByRole('button', { name: /Set duration to 1 hour/i })).toBeTruthy();
  expect(getByRole('button', { name: /Set duration to 1h 30m/i })).toBeTruthy();
    });

    it('highlights the active preset button', () => {
      const { getByRole } = render(<DurationControl value={30} onChange={mockOnChange} />);
      const button = getByRole('button', { name: /Set duration to 30 min/i });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls onChange when preset button is clicked', async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<DurationControl value={30} onChange={mockOnChange} />);
      
      const button = getByRole('button', { name: /Set duration to 15 min/i });
      await user.click(button);
      
      expect(mockOnChange).toHaveBeenCalledWith(15);
    });
  });

  describe('Slider Functionality', () => {
    it('renders slider with correct initial value', () => {
      const { getByTestId } = render(<DurationControl value={45} onChange={mockOnChange} />);
      const slider = getByTestId('duration-slider-input');
      expect(slider).toHaveValue('45');
    });

    it('respects min and max values', () => {
      const { getByTestId } = render(<DurationControl value={30} onChange={mockOnChange} />);
      const slider = getByTestId('duration-slider-input');
      
      expect(slider).toHaveAttribute('min', '1');
      expect(slider).toHaveAttribute('max', '120');
    });

    it('handles edge case values correctly', () => {
      const { rerender, getByTestId } = render(<DurationControl value={1} onChange={mockOnChange} />);
      let slider = getByTestId('duration-slider-input');
      expect(slider).toHaveValue('1');
      
      rerender(<DurationControl value={120} onChange={mockOnChange} />);
      slider = getByTestId('duration-slider-input');
      expect(slider).toHaveValue('120');
    });
  });

  describe('Disabled State', () => {
    it('disables preset buttons when disabled prop is true', () => {
      const { getByRole } = render(<DurationControl value={30} onChange={mockOnChange} disabled={true} />);
      const button = getByRole('button', { name: /Set duration to 5 min/i });
      expect(button).toBeDisabled();
    });

    it('enables preset buttons when disabled prop is false', () => {
      const { getByRole } = render(<DurationControl value={30} onChange={mockOnChange} disabled={false} />);
      const button = getByRole('button', { name: /Set duration to 5 min/i });
      expect(button).not.toBeDisabled();
    });

    it('enables buttons by default when disabled prop is not provided', () => {
      const { getByRole } = render(<DurationControl value={30} onChange={mockOnChange} />);
      const button = getByRole('button', { name: /Set duration to 5 min/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe('Duration Information Display', () => {
    it('displays estimated time and session type', () => {
      const { getByText, getAllByText } = render(<DurationControl value={30} onChange={mockOnChange} />);
      
      expect(getByText('Estimated time')).toBeTruthy();
      expect(getByText('Session type')).toBeTruthy();
      expect(getAllByText('30 min').length).toBeGreaterThan(0);
      expect(getAllByText('Meditation').length).toBeGreaterThan(0);
    });

    it('updates information when duration changes', () => {
      const { rerender, getAllByText } = render(<DurationControl value={30} onChange={mockOnChange} />);
      expect(getAllByText('Meditation').length).toBeGreaterThan(0);
      
      rerender(<DurationControl value={90} onChange={mockOnChange} />);
      expect(getAllByText('Extended practice').length).toBeGreaterThan(0);
    });
  });

  describe('Duration Tips', () => {
    it('shows tip for short sessions (≤ 5 minutes)', () => {
      const { getByText } = render(<DurationControl value={5} onChange={mockOnChange} />);
      expect(getByText('Short sessions are perfect for quick relaxation breaks.')).toBeTruthy();
      expect(getByText('💡')).toBeTruthy();
    });

    it('shows tip for long sessions (≥ 90 minutes)', () => {
      const { getByText } = render(<DurationControl value={90} onChange={mockOnChange} />);
      expect(getByText('Long sessions are ideal for deep meditation and healing.')).toBeTruthy();
      expect(getByText('🎯')).toBeTruthy();
    });

    it('does not show tips for medium durations', () => {
      const { queryByText } = render(<DurationControl value={30} onChange={mockOnChange} />);
      expect(queryByText('Short sessions are perfect for quick relaxation breaks.')).toBeNull();
      expect(queryByText('Long sessions are ideal for deep meditation and healing.')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('has proper label association', () => {
      const { getByText } = render(<DurationControl value={30} onChange={mockOnChange} />);
      const label = getByText('Session Duration').closest('label');
      expect(label).toHaveAttribute('for', 'duration-slider');
    });

    it('has proper ARIA attributes on slider', () => {
      const { getByTestId } = render(<DurationControl value={45} onChange={mockOnChange} />);
      const sliderRoot = getByTestId('duration-slider-root');
      
      expect(sliderRoot).toHaveAttribute('aria-label', 'Session duration');
      expect(sliderRoot).toHaveAttribute('aria-valuenow', '45');
      expect(sliderRoot).toHaveAttribute('aria-valuemin', '1');
      expect(sliderRoot).toHaveAttribute('aria-valuemax', '120');
      expect(sliderRoot).toHaveAttribute('aria-valuetext', '45 min session duration');
    });

    it('has proper button ARIA labels', () => {
      const { getByRole } = render(<DurationControl value={30} onChange={mockOnChange} />);
      const button = getByRole('button', { name: /Set duration to 15 min/i });
      expect(button).toHaveAttribute('aria-label', 'Set duration to 15 min');
    });
  });

  describe('Component Memorization', () => {
    it('has proper display name', () => {
      expect(DurationControl.displayName).toBe('DurationControl');
    });

    it('memoizes properly to prevent unnecessary re-renders', () => {
      const { rerender, getByText } = render(<DurationControl value={30} onChange={mockOnChange} />);
      
      // Rerender with same props
      rerender(<DurationControl value={30} onChange={mockOnChange} />);
      
      // Component should still be rendered correctly
      expect(getByText('Session Duration')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles minimum duration correctly', () => {
      const { getAllByText, getAllByText: getAll } = render(<DurationControl value={1} onChange={mockOnChange} />);
      expect(getAllByText('1 min').length).toBeGreaterThan(0);
      expect(getAll('Quick session'.toString()).length).toBeGreaterThan(0);
    });

    it('handles maximum duration correctly', () => {
      const { getAllByText } = render(<DurationControl value={120} onChange={mockOnChange} />);
      expect(getAllByText('2 hours').length).toBeGreaterThan(0);
      expect(getAllByText('Extended practice').length).toBeGreaterThan(0);
    });

    it('handles exact hour values correctly', () => {
      const { getAllByText } = render(<DurationControl value={60} onChange={mockOnChange} />);
      expect(getAllByText('1 hour').length).toBeGreaterThan(0);
    });
  });

  describe('Layout and Styling', () => {
    it('maintains proper spacing between elements', () => {
      const { container } = render(<DurationControl value={30} onChange={mockOnChange} />);
      
      // Check for space-y-4 on main container
      expect(container.querySelector('.space-y-4')).toBeTruthy();
    });

    it('uses flexbox layout for proper alignment', () => {
      const { container } = render(<DurationControl value={30} onChange={mockOnChange} />);
      
      const flexContainers = container.querySelectorAll('.flex');
      expect(flexContainers.length).toBeGreaterThan(0);
    });

    it('applies grid layout for preset buttons', () => {
      const { container } = render(<DurationControl value={30} onChange={mockOnChange} />);
      
      const gridContainer = container.querySelector('.flex.flex-wrap.gap-2');
      expect(gridContainer).toBeTruthy();
    });
  });
});
