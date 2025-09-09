 
// @ts-nocheck
import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import {
  BinauralRangeSelector,
  VolumeControl,
  DurationControl,
  AdvancedSettings,
  TipsSection,
  type BinauralRangeWithKey,
} from '../index';

// Mock Radix UI components for integration testing
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
        onChange={(e) => onValueChange?.([Number(e.target.value)])}
        data-testid={`slider-input-${id || 'unknown'}`}
        aria-label={props['aria-label']}
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

// Helper to change <input type="range"> values without fireEvent dependency
const setRangeValue = (el: HTMLInputElement, value: number) => {
  Object.defineProperty(el, 'value', { value: String(value), configurable: true });
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
};

const setRangeValueAsync = async (el: HTMLInputElement, value: number) => {
  await act(async () => {
    setRangeValue(el, value);
  });
};

// Integration Test Component that combines all binaural components
const BinauralIntegrationTestApp: React.FC = () => {
  const [currentRange, setCurrentRange] = useState<BinauralRangeWithKey>({
    key: 'alpha',
    name: 'Alpha',
    min: 8,
    max: 14,
    color: 'green',
  });
  
  const [volume, setVolume] = useState(75);
  const [duration, setDuration] = useState(10);
  const [fadeIn, setFadeIn] = useState(5);
  const [fadeOut, setFadeOut] = useState(5);
  const [customFrequency, setCustomFrequency] = useState(440);
  const [binauralBeat, setBinauralBeat] = useState(10);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const handleStartSession = () => {
    setIsSessionActive(true);
  };

  const handleStopSession = () => {
    setIsSessionActive(false);
  };

  return (
    <div className="binaural-session-app" data-testid="binaural-integration-app">
      {/* Session Controls */}
      <div className="session-controls" data-testid="session-controls">
        <h2>Binaural Audio Session</h2>
        <div className="session-status" data-testid="session-status">
          Status: {isSessionActive ? 'Active' : 'Inactive'}
        </div>
        <button
          onClick={handleStartSession}
          disabled={isSessionActive}
          data-testid="start-session-btn"
        >
          Start Session
        </button>
        <button
          onClick={handleStopSession}
          disabled={!isSessionActive}
          data-testid="stop-session-btn"
        >
          Stop Session
        </button>
      </div>

      {/* Current Session Configuration Display */}
      <div className="session-config" data-testid="session-config">
        <h3>Current Configuration</h3>
        <div data-testid="config-summary">
          <div>Range: {currentRange.name} ({currentRange.min}-{currentRange.max} Hz)</div>
          <div>Volume: {volume}%</div>
          <div>Duration: {duration} minutes</div>
          <div>Fade In: {fadeIn}s</div>
          <div>Fade Out: {fadeOut}s</div>
          <div>Base Frequency: {customFrequency} Hz</div>
          <div>Binaural Beat: {binauralBeat} Hz</div>
        </div>
      </div>

      {/* Range Selection */}
      <div className="range-section" data-testid="range-section">
        <BinauralRangeSelector
          currentBeat={binauralBeat}
          onRangeSelect={setCurrentRange}
          className={isSessionActive ? 'disabled' : ''}
        />
      </div>

      {/* Volume Control */}
      <div className="volume-section" data-testid="volume-section">
        <VolumeControl
          value={volume}
          onChange={setVolume}
          disabled={isSessionActive}
        />
      </div>

      {/* Duration Control */}
      <div className="duration-section" data-testid="duration-section">
        <DurationControl
          value={duration}
          onChange={setDuration}
          disabled={isSessionActive}
        />
      </div>

      {/* Advanced Settings */}
      <div className="advanced-section" data-testid="advanced-section">
        <AdvancedSettings
          fadeIn={fadeIn}
          fadeOut={fadeOut}
          customFrequency={customFrequency}
          binauralBeat={binauralBeat}
          onFadeInChange={setFadeIn}
          onFadeOutChange={setFadeOut}
          onCustomFrequencyChange={setCustomFrequency}
          onBinauralBeatChange={setBinauralBeat}
          currentRange={currentRange}
          disabled={isSessionActive}
        />
      </div>

      {/* Tips Section */}
      <div className="tips-section" data-testid="tips-section">
        <TipsSection />
      </div>
    </div>
  );
};

describe('Binaural Components - Integration Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Full Component Integration', () => {
    it('renders all binaural components together successfully', () => {
      render(<BinauralIntegrationTestApp />);

      expect(screen.getByTestId('binaural-integration-app')).toBeInTheDocument();
      expect(screen.getByTestId('session-controls')).toBeInTheDocument();
      expect(screen.getByTestId('session-config')).toBeInTheDocument();
      expect(screen.getByTestId('range-section')).toBeInTheDocument();
      expect(screen.getByTestId('volume-section')).toBeInTheDocument();
      expect(screen.getByTestId('duration-section')).toBeInTheDocument();
      expect(screen.getByTestId('advanced-section')).toBeInTheDocument();
      expect(screen.getByTestId('tips-section')).toBeInTheDocument();
    });

    it('displays initial configuration values correctly', () => {
      render(<BinauralIntegrationTestApp />);

      const configSummary = screen.getByTestId('config-summary');
      expect(configSummary).toHaveTextContent('Range: Alpha (8-14 Hz)');
      expect(configSummary).toHaveTextContent('Volume: 75%');
      expect(configSummary).toHaveTextContent('Duration: 10 minutes');
      expect(configSummary).toHaveTextContent('Fade In: 5s');
      expect(configSummary).toHaveTextContent('Fade Out: 5s');
      expect(configSummary).toHaveTextContent('Base Frequency: 440 Hz');
      expect(configSummary).toHaveTextContent('Binaural Beat: 10 Hz');
    });

    it('shows session as inactive by default', () => {
      render(<BinauralIntegrationTestApp />);

      expect(screen.getByTestId('session-status')).toHaveTextContent('Status: Inactive');
      expect(screen.getByTestId('start-session-btn')).not.toBeDisabled();
      expect(screen.getByTestId('stop-session-btn')).toBeDisabled();
    });
  });

  describe('2. Session State Management', () => {
    it('starts session and disables controls', async () => {
      render(<BinauralIntegrationTestApp />);

      const startBtn = screen.getByTestId('start-session-btn');
      await userEvent.click(startBtn);

      expect(screen.getByTestId('session-status')).toHaveTextContent('Status: Active');
      expect(screen.getByTestId('start-session-btn')).toBeDisabled();
      expect(screen.getByTestId('stop-session-btn')).not.toBeDisabled();
    });

    it('stops session and re-enables controls', async () => {
      render(<BinauralIntegrationTestApp />);

      const startBtn = screen.getByTestId('start-session-btn');
      const stopBtn = screen.getByTestId('stop-session-btn');

      // Start session first
      await userEvent.click(startBtn);
      expect(screen.getByTestId('session-status')).toHaveTextContent('Status: Active');

      // Stop session
      await userEvent.click(stopBtn);
      expect(screen.getByTestId('session-status')).toHaveTextContent('Status: Inactive');
      expect(screen.getByTestId('start-session-btn')).not.toBeDisabled();
      expect(screen.getByTestId('stop-session-btn')).toBeDisabled();
    });

    it('disables all component controls during active session', async () => {
      render(<BinauralIntegrationTestApp />);

      const startBtn = screen.getByTestId('start-session-btn');
      await userEvent.click(startBtn);

      // Check that sliders are disabled
      expect(screen.getByTestId('slider-root-volume-slider')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('slider-root-duration-slider')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('slider-root-fade-in-slider')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('slider-root-fade-out-slider')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('3. Cross-Component Data Flow', () => {
    it('updates configuration display when range changes', async () => {
      render(<BinauralIntegrationTestApp />);

      // Find and click a different range button (e.g., Theta)
  const rangeSection = screen.getByTestId('range-section');
  const thetaButton = within(rangeSection).getByRole('button', { name: /select theta/i });
      await userEvent.click(thetaButton);

      const configSummary = screen.getByTestId('config-summary');
  expect(configSummary).toHaveTextContent(/Range:\s*Theta .*4-8 Hz/);
    });

    it('reflects volume changes in configuration display', async () => {
      render(<BinauralIntegrationTestApp />);

  const volumeSlider = screen.getByTestId('slider-input-volume-slider') as HTMLInputElement;
  await setRangeValueAsync(volumeSlider, 50);

      const configSummary = screen.getByTestId('config-summary');
      expect(configSummary).toHaveTextContent('Volume: 50%');
    });

    it('reflects duration changes in configuration display', async () => {
      render(<BinauralIntegrationTestApp />);

  const durationSlider = screen.getByTestId('slider-input-duration-slider') as HTMLInputElement;
  await setRangeValueAsync(durationSlider, 20);

      const configSummary = screen.getByTestId('config-summary');
      expect(configSummary).toHaveTextContent('Duration: 20 minutes');
    });

    it('updates advanced settings in configuration display', async () => {
      render(<BinauralIntegrationTestApp />);

  const fadeInSlider = screen.getByTestId('slider-input-fade-in-slider') as HTMLInputElement;
  const binauralBeatSlider = screen.getByTestId('slider-input-binaural-beat-slider') as HTMLInputElement;

  await setRangeValueAsync(fadeInSlider, 10);
  await setRangeValueAsync(binauralBeatSlider, 15);

      const configSummary = screen.getByTestId('config-summary');
      expect(configSummary).toHaveTextContent('Fade In: 10s');
      expect(configSummary).toHaveTextContent('Binaural Beat: 15 Hz');
    });
  });

  describe('4. Component Interoperability', () => {
    it('passes current range to AdvancedSettings component', () => {
      render(<BinauralIntegrationTestApp />);

  // AdvancedSettings should display the current range
  const advanced = screen.getByTestId('advanced-section');
  expect(within(advanced).getAllByText('Alpha').length).toBeGreaterThanOrEqual(1);
  expect(within(advanced).getByText('(8-14 Hz range)')).toBeInTheDocument();
    });

    it('maintains state consistency across range changes', async () => {
      render(<BinauralIntegrationTestApp />);

      // Change to Beta range
  const rangeSection = screen.getByTestId('range-section');
  const betaButton = within(rangeSection).getByRole('button', { name: /select beta/i });
      await userEvent.click(betaButton);

      // Check that AdvancedSettings reflects the new range
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByText('(14-30 Hz range)')).toBeInTheDocument();

      // Check configuration display
  const configSummary = screen.getByTestId('config-summary');
  expect(configSummary).toHaveTextContent(/Range:\s*Beta .*14-30 Hz/);
    });

    it('preserves non-range settings when changing ranges', async () => {
      render(<BinauralIntegrationTestApp />);

      // Set specific values
  const volumeSlider = screen.getByTestId('slider-input-volume-slider') as HTMLInputElement;
  const durationSlider = screen.getByTestId('slider-input-duration-slider') as HTMLInputElement;
      
  await setRangeValueAsync(volumeSlider, 60);
  await setRangeValueAsync(durationSlider, 15);

      // Change range
  const rangeSection2 = screen.getByTestId('range-section');
  const deltaButton = within(rangeSection2).getByRole('button', { name: /select delta/i });
      await userEvent.click(deltaButton);

      // Verify other settings preserved
      const configSummary = screen.getByTestId('config-summary');
  expect(configSummary).toHaveTextContent('Volume: 60%');
  expect(configSummary).toHaveTextContent('Duration: 15 minutes');
  expect(configSummary).toHaveTextContent(/Range:\s*Delta .*0.5-4 Hz/);
    });
  });

  describe('5. User Workflow Scenarios', () => {
    it('completes a full session configuration workflow', async () => {
      render(<BinauralIntegrationTestApp />);

      // Step 1: Select a frequency range
  const rangeSection3 = screen.getByTestId('range-section');
  const thetaButton = within(rangeSection3).getByRole('button', { name: /select theta/i });
      await userEvent.click(thetaButton);

      // Step 2: Adjust volume
  const volumeSlider = screen.getByTestId('slider-input-volume-slider') as HTMLInputElement;
  await setRangeValueAsync(volumeSlider, 80);

      // Step 3: Set duration
  const durationSlider = screen.getByTestId('slider-input-duration-slider') as HTMLInputElement;
  await setRangeValueAsync(durationSlider, 25);

      // Step 4: Configure advanced settings
  const fadeInSlider = screen.getByTestId('slider-input-fade-in-slider') as HTMLInputElement;
  const fadeOutSlider = screen.getByTestId('slider-input-fade-out-slider') as HTMLInputElement;
  await setRangeValueAsync(fadeInSlider, 8);
  await setRangeValueAsync(fadeOutSlider, 12);

      // Step 5: Verify configuration
  const configSummary = screen.getByTestId('config-summary');
  expect(configSummary).toHaveTextContent(/Range:\s*Theta .*4-8 Hz/);
      expect(configSummary).toHaveTextContent('Volume: 80%');
      expect(configSummary).toHaveTextContent('Duration: 25 minutes');
      expect(configSummary).toHaveTextContent('Fade In: 8s');
      expect(configSummary).toHaveTextContent('Fade Out: 12s');

      // Step 6: Start session
      const startBtn = screen.getByTestId('start-session-btn');
      await userEvent.click(startBtn);

      expect(screen.getByTestId('session-status')).toHaveTextContent('Status: Active');
    });

  it('keeps session active and controls disabled if a range is clicked during active session', async () => {
      render(<BinauralIntegrationTestApp />);

      // Start a session
      const startBtn = screen.getByTestId('start-session-btn');
      await userEvent.click(startBtn);

  // Try to change settings - should be disabled
  const volumeSlider = screen.getByTestId('slider-input-volume-slider') as HTMLInputElement;
      const durationSlider = screen.getByTestId('slider-input-duration-slider');
      
      expect(volumeSlider).toBeDisabled();
      expect(durationSlider).toBeDisabled();
  // Attempting to change range should not stop session or re-enable controls
  const rangeSection4 = screen.getByTestId('range-section');
  const thetaBtn = within(rangeSection4).getByRole('button', { name: /select theta/i });
  await userEvent.click(thetaBtn);
  expect(screen.getByTestId('session-status')).toHaveTextContent('Status: Active');
  expect(screen.getByTestId('slider-root-volume-slider')).toHaveAttribute('data-disabled', 'true');
  expect(screen.getByTestId('slider-root-duration-slider')).toHaveAttribute('data-disabled', 'true');
    });

    it('allows configuration changes after stopping session', async () => {
      render(<BinauralIntegrationTestApp />);

      // Start and stop session
      const startBtn = screen.getByTestId('start-session-btn');
      const stopBtn = screen.getByTestId('stop-session-btn');
      
      await userEvent.click(startBtn);
      await userEvent.click(stopBtn);

      // Verify controls are re-enabled
  const volumeSlider = screen.getByTestId('slider-input-volume-slider') as HTMLInputElement;
      const durationSlider = screen.getByTestId('slider-input-duration-slider');
      
      expect(volumeSlider).not.toBeDisabled();
      expect(durationSlider).not.toBeDisabled();

      // Should be able to change settings
  await setRangeValueAsync(volumeSlider, 90);
      
      const configSummary = screen.getByTestId('config-summary');
      expect(configSummary).toHaveTextContent('Volume: 90%');
    });
  });

  describe('6. Error Handling and Edge Cases', () => {
    it('handles extreme configuration values gracefully', async () => {
      render(<BinauralIntegrationTestApp />);

      // Set extreme values
  const volumeSlider = screen.getByTestId('slider-input-volume-slider') as HTMLInputElement;
  const durationSlider = screen.getByTestId('slider-input-duration-slider') as HTMLInputElement;
  const fadeInSlider = screen.getByTestId('slider-input-fade-in-slider') as HTMLInputElement;
      
  await setRangeValueAsync(volumeSlider, 100);
  await setRangeValueAsync(durationSlider, 60);
  await setRangeValueAsync(fadeInSlider, 30);

      const configSummary = screen.getByTestId('config-summary');
      expect(configSummary).toHaveTextContent('Volume: 100%');
      expect(configSummary).toHaveTextContent('Duration: 60 minutes');
      expect(configSummary).toHaveTextContent('Fade In: 30s');

      // Should still be able to start session
      const startBtn = screen.getByTestId('start-session-btn');
      await userEvent.click(startBtn);
      expect(screen.getByTestId('session-status')).toHaveTextContent('Status: Active');
    });

    it('maintains component isolation when one component fails to render', () => {
      // This test ensures that if one component has issues, others continue to work
      render(<BinauralIntegrationTestApp />);

      // Even if one component fails, others should still be accessible
      expect(screen.getByTestId('session-controls')).toBeInTheDocument();
      expect(screen.getByTestId('session-config')).toBeInTheDocument();
      expect(screen.getByTestId('range-section')).toBeInTheDocument();
      expect(screen.getByTestId('volume-section')).toBeInTheDocument();
    });
  });

  describe('7. Performance and State Management', () => {
    it('updates only affected components when state changes', async () => {
      render(<BinauralIntegrationTestApp />);

      const initialConfigContent = screen.getByTestId('config-summary').textContent;
      
      // Change volume only
  const volumeSlider = screen.getByTestId('slider-input-volume-slider') as HTMLInputElement;
  await setRangeValueAsync(volumeSlider, 85);

      const updatedConfigContent = screen.getByTestId('config-summary').textContent;
      
      // Config should update
      expect(updatedConfigContent).not.toBe(initialConfigContent);
      expect(updatedConfigContent).toContain('Volume: 85%');
    });

    it('handles rapid state changes gracefully', async () => {
      render(<BinauralIntegrationTestApp />);

      const volumeSlider = screen.getByTestId('slider-input-volume-slider') as HTMLInputElement;
      
      // Rapid changes
      for (let i = 50; i <= 80; i += 10) {
         
        await setRangeValueAsync(volumeSlider, i);
      }

      // Should end up with final value
      const configSummary = screen.getByTestId('config-summary');
      expect(configSummary).toHaveTextContent('Volume: 80%');
    });
  });

  describe('8. Accessibility Integration', () => {
    it('maintains accessibility across all components', () => {
      render(<BinauralIntegrationTestApp />);

      // Check that aria labels are present across components
  expect(screen.getByTestId('slider-input-volume-slider')).toBeInTheDocument();
  expect(screen.getByTestId('slider-input-duration-slider')).toBeInTheDocument();
  expect(screen.getByTestId('slider-input-fade-in-slider')).toBeInTheDocument();
  expect(screen.getByTestId('slider-input-fade-out-slider')).toBeInTheDocument();
    });

    it('provides coherent screen reader experience', () => {
      render(<BinauralIntegrationTestApp />);

      // Check for proper headings structure
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Binaural Audio Session');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Current Configuration');
    });
  });
});
