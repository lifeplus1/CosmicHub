 
import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AdvancedSettings } from '../AdvancedSettings';
import { type BinauralRangeWithKey } from '../BinauralRangeSelector';

// Mock Radix UI components with proper slider functionality
vi.mock('@radix-ui/react-slider', () => ({
  Root: vi.fn(({ children, onValueChange, value, min, max, step, disabled, id, ...props }) => (
    <div data-testid={`slider-root-${id || 'unknown'}`} data-disabled={disabled} {...props}>
      <input
        type="range"
        value={value?.[0] || 0}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onValueChange?.([Number((e.target as HTMLInputElement).value)])}
        onInput={(e) => onValueChange?.([Number((e.target as HTMLInputElement).value)])}
        data-testid={`slider-input-${id || 'unknown'}`}
        aria-label={props['aria-label']}
        aria-valuenow={Number(props['aria-valuenow'])}
        aria-valuemin={Number(props['aria-valuemin'])}
        aria-valuemax={Number(props['aria-valuemax'])}
        aria-valuetext={props['aria-valuetext']}
      />
      {children}
    </div>
  )),
  Track: vi.fn(({ children, ...props }) => (
    <div data-testid="slider-track" {...props}>
      {children}
    </div>
  )),
  Range: vi.fn((props) => <div data-testid="slider-range" {...props} />),
  Thumb: vi.fn((props) => (
    <div data-testid="slider-thumb" aria-label={props['aria-label']} {...props} />
  )),
}));

vi.mock('@radix-ui/react-tooltip', () => ({
  Provider: vi.fn(({ children }) => <div data-testid="tooltip-provider">{children}</div>),
  Root: vi.fn(({ children }) => <div data-testid="tooltip-root">{children}</div>),
  Trigger: vi.fn(({ children, asChild: _asChild, ...props }) => (
    <div data-testid="tooltip-trigger" {...props}>
      {children}
    </div>
  )),
  Portal: vi.fn(({ children }) => <div data-testid="tooltip-portal">{children}</div>),
  Content: vi.fn(({ children, ...props }) => (
    <div data-testid="tooltip-content" {...props}>
      {children}
    </div>
  )),
}));

// Mock @cosmichub/ui
vi.mock('@cosmichub/ui', () => ({
  default: {},
}));

describe('AdvancedSettings Component - Enhanced Testing', () => {
  // Helper to set range input value and dispatch input/change like a real slider
  const setRangeValue = (input: HTMLInputElement, value: string) => {
    act(() => {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };

  const mockRanges: BinauralRangeWithKey[] = [
    { key: 'delta', name: 'Delta', min: 0.5, max: 4, color: 'purple' },
    { key: 'theta', name: 'Theta', min: 4, max: 8, color: 'blue' },
    { key: 'alpha', name: 'Alpha', min: 8, max: 14, color: 'green' },
    { key: 'beta', name: 'Beta', min: 14, max: 30, color: 'yellow' },
    { key: 'gamma', name: 'Gamma', min: 30, max: 100, color: 'red' },
    { key: 'custom', name: 'Custom', min: 0, max: 0, color: 'gray' },
  ];

  const defaultProps = {
    fadeIn: 5,
    fadeOut: 10,
    customFrequency: 440,
    binauralBeat: 10.5,
    onFadeInChange: vi.fn(),
    onFadeOutChange: vi.fn(),
    onCustomFrequencyChange: vi.fn(),
    onBinauralBeatChange: vi.fn(),
    currentRange: mockRanges[2] as BinauralRangeWithKey, // Alpha range - ensure type safety
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Basic Rendering and Structure', () => {
    it('renders advanced settings with all sections', () => {
      render(<AdvancedSettings {...defaultProps} />);

      expect(screen.getByText('Advanced Controls')).toBeInTheDocument();
      expect(screen.getByText('🔧')).toBeInTheDocument();
      expect(screen.getByText('Custom Frequency Tuning')).toBeInTheDocument();
      expect(screen.getByText('🎵')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <AdvancedSettings {...defaultProps} className="custom-settings" />
      );
      expect(container.firstChild).toHaveClass('custom-settings');
    });

    it('applies space-y-6 layout class', () => {
      const { container } = render(<AdvancedSettings {...defaultProps} />);
      expect(container.firstChild).toHaveClass('space-y-6');
    });
  });

  describe('2. Fade Controls Configuration', () => {
    it('renders fade in controls with correct values', () => {
      render(<AdvancedSettings {...defaultProps} fadeIn={15} />);

  expect(screen.getByText('Fade In')).toBeInTheDocument();
  expect(screen.getAllByText('15s').length).toBeGreaterThan(0);
      expect(screen.getByTestId('slider-input-fade-in-slider')).toHaveValue('15');
    });

    it('renders fade out controls with correct values', () => {
      render(<AdvancedSettings {...defaultProps} fadeOut={20} />);

      expect(screen.getByText('Fade Out')).toBeInTheDocument();
      expect(screen.getByText('20s')).toBeInTheDocument();
      expect(screen.getByTestId('slider-input-fade-out-slider')).toHaveValue('20');
    });

    it('configures fade sliders with correct ranges', () => {
      render(<AdvancedSettings {...defaultProps} />);

      const fadeInSlider = screen.getByTestId('slider-input-fade-in-slider');
      const fadeOutSlider = screen.getByTestId('slider-input-fade-out-slider');

      expect(fadeInSlider).toHaveAttribute('min', '0');
      expect(fadeInSlider).toHaveAttribute('max', '30');
      expect(fadeOutSlider).toHaveAttribute('min', '0');
      expect(fadeOutSlider).toHaveAttribute('max', '30');
    });

    it('displays fade scale markers', () => {
      render(<AdvancedSettings {...defaultProps} />);

      // Each fade section should have scale markers
      const zeroMarkers = screen.getAllByText('0s');
      const fifteenMarkers = screen.getAllByText('15s');
      const thirtyMarkers = screen.getAllByText('30s');

      expect(zeroMarkers).toHaveLength(2); // Fade in + fade out
      expect(fifteenMarkers).toHaveLength(2);
      expect(thirtyMarkers).toHaveLength(2);
    });
  });

  describe('3. Custom Frequency Controls Configuration', () => {
    it('renders base frequency controls with correct values', () => {
      render(<AdvancedSettings {...defaultProps} customFrequency={880} />);

      expect(screen.getByText('Base Frequency')).toBeInTheDocument();
      expect(screen.getByText('880 Hz')).toBeInTheDocument();
      expect(screen.getByTestId('slider-input-custom-frequency-slider')).toHaveValue('880');
    });

    it('renders binaural beat controls with decimal precision', () => {
      render(<AdvancedSettings {...defaultProps} binauralBeat={15.5} />);

  expect(screen.getByText('Binaural Beat')).toBeInTheDocument();
  expect(screen.getAllByText('15.5 Hz').length).toBeGreaterThan(0);
      expect(screen.getByTestId('slider-input-binaural-beat-slider')).toHaveValue('15.5');
    });

    it('configures frequency sliders with correct ranges', () => {
      render(<AdvancedSettings {...defaultProps} />);

      const frequencySlider = screen.getByTestId('slider-input-custom-frequency-slider');
      const beatSlider = screen.getByTestId('slider-input-binaural-beat-slider');

      expect(frequencySlider).toHaveAttribute('min', '20');
      expect(frequencySlider).toHaveAttribute('max', '2000');
      expect(frequencySlider).toHaveAttribute('step', '1');

      expect(beatSlider).toHaveAttribute('min', '0.5');
      expect(beatSlider).toHaveAttribute('max', '100');
      expect(beatSlider).toHaveAttribute('step', '0.5');
    });

    it('displays frequency scale markers', () => {
      render(<AdvancedSettings {...defaultProps} />);

      expect(screen.getByText('20 Hz')).toBeInTheDocument();
      expect(screen.getByText('500 Hz')).toBeInTheDocument();
      expect(screen.getByText('2000 Hz')).toBeInTheDocument();
      expect(screen.getByText('0.5 Hz')).toBeInTheDocument();
      expect(screen.getByText('50 Hz')).toBeInTheDocument();
      expect(screen.getByText('100 Hz')).toBeInTheDocument();
    });
  });

  describe('4. User Interaction Handling', () => {
    it('handles fade in changes within valid range', async () => {
      const onFadeInChange = vi.fn();
      render(<AdvancedSettings {...defaultProps} onFadeInChange={onFadeInChange} />);

      const slider = screen.getByTestId('slider-input-fade-in-slider');
  setRangeValue(slider as HTMLInputElement, '25');

      expect(onFadeInChange).toHaveBeenCalledWith(25);
    });

    it('handles fade out changes within valid range', async () => {
      const onFadeOutChange = vi.fn();
      render(<AdvancedSettings {...defaultProps} onFadeOutChange={onFadeOutChange} />);

      const slider = screen.getByTestId('slider-input-fade-out-slider');
  setRangeValue(slider as HTMLInputElement, '15');

      expect(onFadeOutChange).toHaveBeenCalledWith(15);
    });

    it('handles custom frequency changes within valid range', async () => {
      const onCustomFrequencyChange = vi.fn();
      render(<AdvancedSettings {...defaultProps} onCustomFrequencyChange={onCustomFrequencyChange} />);

      const slider = screen.getByTestId('slider-input-custom-frequency-slider');
  setRangeValue(slider as HTMLInputElement, '1000');

      expect(onCustomFrequencyChange).toHaveBeenCalledWith(1000);
    });

    it('handles binaural beat changes within valid range', async () => {
      const onBinauralBeatChange = vi.fn();
      render(<AdvancedSettings {...defaultProps} onBinauralBeatChange={onBinauralBeatChange} />);

      const slider = screen.getByTestId('slider-input-binaural-beat-slider');
  setRangeValue(slider as HTMLInputElement, '30.5');

      expect(onBinauralBeatChange).toHaveBeenCalledWith(30.5);
    });
  });

  describe('5. Current Range Indicator', () => {
    it('displays current range with color indicator', () => {
      render(<AdvancedSettings {...defaultProps} currentRange={mockRanges[1] as BinauralRangeWithKey} />);

  expect(screen.getAllByText('Theta').length).toBeGreaterThan(0);
      expect(screen.getByText('(4-8 Hz range)')).toBeInTheDocument();
      expect(screen.getByLabelText('Theta')).toBeInTheDocument();
    });

    it('displays custom range without frequency range text', () => {
      render(<AdvancedSettings {...defaultProps} currentRange={mockRanges[5] as BinauralRangeWithKey} />);

      expect(screen.getAllByText('Custom').length).toBeGreaterThan(0);
      expect(screen.queryByText('(0-0 Hz range)')).not.toBeInTheDocument();
    });

    it('displays current beat frequency in range indicator', () => {
      render(<AdvancedSettings {...defaultProps} binauralBeat={25.7} />);

      expect(screen.getByText('Current beat')).toBeInTheDocument();
      expect(screen.getAllByText('25.7 Hz').length).toBeGreaterThan(0);
    });

    it('applies correct color class for range', () => {
      render(<AdvancedSettings {...defaultProps} currentRange={mockRanges[0] as BinauralRangeWithKey} />);

      const colorIndicator = screen.getByLabelText('Delta');
      expect(colorIndicator).toHaveClass('bg-purple-500');
    });
  });

  describe('6. Tooltip Functionality', () => {
    it('renders tooltip trigger with proper accessibility', () => {
      render(<AdvancedSettings {...defaultProps} />);

  // Our mock wraps the trigger, the accessible props live on the child element
  const triggerButton = screen.getByRole('button');
  expect(triggerButton).toHaveAttribute('tabindex', '0');
  expect(triggerButton).toHaveAttribute('role', 'button');
    });

    it('provides tooltip content for different range types', () => {
      render(<AdvancedSettings {...defaultProps} currentRange={mockRanges[0] as BinauralRangeWithKey} />);

      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });

    it('handles tooltip provider wrapping', () => {
      render(<AdvancedSettings {...defaultProps} />);

      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-root')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-portal')).toBeInTheDocument();
    });
  });

  describe('7. Disabled State Behavior', () => {
    it('disables all sliders when disabled prop is true', () => {
      render(<AdvancedSettings {...defaultProps} disabled={true} />);

      expect(screen.getByTestId('slider-input-fade-in-slider')).toBeDisabled();
      expect(screen.getByTestId('slider-input-fade-out-slider')).toBeDisabled();
      expect(screen.getByTestId('slider-input-custom-frequency-slider')).toBeDisabled();
      expect(screen.getByTestId('slider-input-binaural-beat-slider')).toBeDisabled();
    });

    it('enables all sliders when disabled prop is false', () => {
      render(<AdvancedSettings {...defaultProps} disabled={false} />);

      expect(screen.getByTestId('slider-input-fade-in-slider')).not.toBeDisabled();
      expect(screen.getByTestId('slider-input-fade-out-slider')).not.toBeDisabled();
      expect(screen.getByTestId('slider-input-custom-frequency-slider')).not.toBeDisabled();
      expect(screen.getByTestId('slider-input-binaural-beat-slider')).not.toBeDisabled();
    });

    it('applies disabled data attribute to slider roots', () => {
      render(<AdvancedSettings {...defaultProps} disabled={true} />);

      expect(screen.getByTestId('slider-root-fade-in-slider')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('slider-root-fade-out-slider')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('slider-root-custom-frequency-slider')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('slider-root-binaural-beat-slider')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('8. Accessibility Features', () => {
    it('provides proper ARIA labels for all sliders', () => {
      render(<AdvancedSettings {...defaultProps} />);

  expect(screen.getAllByLabelText('Fade in duration').length).toBeGreaterThan(0);
  expect(screen.getAllByLabelText('Fade out duration').length).toBeGreaterThan(0);
  expect(screen.getAllByLabelText('Custom base frequency').length).toBeGreaterThan(0);
  expect(screen.getAllByLabelText('Binaural beat frequency').length).toBeGreaterThan(0);
    });

    it('includes aria-valuenow attributes with current values', () => {
      render(<AdvancedSettings {...defaultProps} fadeIn={12} customFrequency={600} />);

      const fadeInSlider = screen.getByTestId('slider-root-fade-in-slider');
      const frequencySlider = screen.getByTestId('slider-root-custom-frequency-slider');

      expect(fadeInSlider).toHaveAttribute('aria-valuenow', '12');
      expect(frequencySlider).toHaveAttribute('aria-valuenow', '600');
    });

    it('provides descriptive aria-valuetext for sliders', () => {
      render(<AdvancedSettings {...defaultProps} fadeOut={8} binauralBeat={12.5} />);

      const fadeOutSlider = screen.getByTestId('slider-root-fade-out-slider');
      const beatSlider = screen.getByTestId('slider-root-binaural-beat-slider');

      expect(fadeOutSlider).toHaveAttribute('aria-valuetext', '8 seconds fade out');
      expect(beatSlider).toHaveAttribute('aria-valuetext', '12.5 Hz binaural beat');
    });

    it('includes proper label associations', () => {
      render(<AdvancedSettings {...defaultProps} />);

      expect(screen.getByText('Fade In')).toHaveAttribute('for', 'fade-in-slider');
      expect(screen.getByText('Fade Out')).toHaveAttribute('for', 'fade-out-slider');
      expect(screen.getByText('Base Frequency')).toHaveAttribute('for', 'custom-frequency-slider');
      expect(screen.getByText('Binaural Beat')).toHaveAttribute('for', 'binaural-beat-slider');
    });
  });

  describe('9. Edge Cases and Validation', () => {
    it('validates fade in range boundaries', async () => {
      const onFadeInChange = vi.fn();
      render(<AdvancedSettings {...defaultProps} onFadeInChange={onFadeInChange} />);

      const slider = screen.getByTestId('slider-input-fade-in-slider');
      
      // Test minimum boundary
  setRangeValue(slider as HTMLInputElement, '0');
      expect(onFadeInChange).toHaveBeenCalledWith(0);

      // Test maximum boundary
  setRangeValue(slider as HTMLInputElement, '30');
      expect(onFadeInChange).toHaveBeenCalledWith(30);
    });

    it('validates custom frequency range boundaries', async () => {
      const onCustomFrequencyChange = vi.fn();
      render(<AdvancedSettings {...defaultProps} onCustomFrequencyChange={onCustomFrequencyChange} />);

      const slider = screen.getByTestId('slider-input-custom-frequency-slider');
      
      // Test minimum boundary
  setRangeValue(slider as HTMLInputElement, '20');
      expect(onCustomFrequencyChange).toHaveBeenCalledWith(20);

      // Test maximum boundary
  setRangeValue(slider as HTMLInputElement, '2000');
      expect(onCustomFrequencyChange).toHaveBeenCalledWith(2000);
    });

    it('validates binaural beat range boundaries', async () => {
      const onBinauralBeatChange = vi.fn();
      render(<AdvancedSettings {...defaultProps} onBinauralBeatChange={onBinauralBeatChange} />);

      const slider = screen.getByTestId('slider-input-binaural-beat-slider');
      
      // Test minimum boundary
  setRangeValue(slider as HTMLInputElement, '0.5');
      expect(onBinauralBeatChange).toHaveBeenCalledWith(0.5);

      // Test maximum boundary
  setRangeValue(slider as HTMLInputElement, '100');
      expect(onBinauralBeatChange).toHaveBeenCalledWith(100);
    });

    it('handles extreme values gracefully', () => {
      render(
        <AdvancedSettings
          {...defaultProps}
          fadeIn={0}
          fadeOut={30}
          customFrequency={20}
          binauralBeat={100}
        />
      );

  expect(screen.getAllByText('0s').length).toBeGreaterThan(0);
  expect(screen.getAllByText('30s').length).toBeGreaterThan(0);
  expect(screen.getAllByText('20 Hz').length).toBeGreaterThan(0);
  expect(screen.getAllByText('100.0 Hz').length).toBeGreaterThan(0);
    });
  });

  describe('10. Pro Tip Information Display', () => {
    it('renders pro tip section with proper styling', () => {
      render(<AdvancedSettings {...defaultProps} />);

      expect(screen.getByText('💡')).toBeInTheDocument();
      expect(screen.getByText('Pro Tip:')).toBeInTheDocument();
      expect(screen.getByText(/Gradual fade-in and fade-out/)).toBeInTheDocument();
      expect(screen.getByText(/Lower frequencies.*delta\/theta.*relaxation/)).toBeInTheDocument();
    });

    it('provides educational content about frequency ranges', () => {
      render(<AdvancedSettings {...defaultProps} />);

      const proTipText = screen.getByText(/higher frequencies.*alpha\/beta.*enhance focus/);
      expect(proTipText).toBeInTheDocument();
    });

    it('applies cyan color theming to pro tip', () => {
      const { container } = render(<AdvancedSettings {...defaultProps} />);

      const proTipContainer = container.querySelector('.bg-cyan-500\\/10');
      expect(proTipContainer).toBeInTheDocument();
    });
  });

  describe('11. Component Memoization', () => {
    it('memoizes component with React.memo', () => {
      const Component = AdvancedSettings;
      expect(Component.displayName).toBe('AdvancedSettings');
    });

    it('handles callback memoization with useCallback', async () => {
      const onFadeInChange = vi.fn();
      const { rerender } = render(
        <AdvancedSettings {...defaultProps} onFadeInChange={onFadeInChange} />
      );

      const slider = screen.getByTestId('slider-input-fade-in-slider');
  setRangeValue(slider as HTMLInputElement, '10');

      // Re-render with same props
      rerender(<AdvancedSettings {...defaultProps} onFadeInChange={onFadeInChange} />);

      expect(onFadeInChange).toHaveBeenCalledWith(10);
    });
  });

  describe('12. Layout and Styling', () => {
    it('applies responsive grid layout for fade controls', () => {
      const { container } = render(<AdvancedSettings {...defaultProps} />);

      const fadeGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
      expect(fadeGrid).toBeInTheDocument();
    });

    it('applies responsive grid layout for frequency controls', () => {
      const { container } = render(<AdvancedSettings {...defaultProps} />);

      const frequencyGrids = container.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2');
      expect(frequencyGrids.length).toBeGreaterThanOrEqual(2);
    });

    it('applies proper spacing classes throughout component', () => {
      const { container } = render(<AdvancedSettings {...defaultProps} />);

      expect(container.querySelector('.space-y-6')).toBeInTheDocument();
      expect(container.querySelector('.space-y-3')).toBeInTheDocument();
      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
    });

    it('applies border and background styling to sections', () => {
      const { container } = render(<AdvancedSettings {...defaultProps} />);

      expect(container.querySelector('.bg-white\\/5')).toBeInTheDocument();
      expect(container.querySelector('.border-white\\/10')).toBeInTheDocument();
      expect(container.querySelector('.bg-cyan-500\\/10')).toBeInTheDocument();
    });
  });
});
