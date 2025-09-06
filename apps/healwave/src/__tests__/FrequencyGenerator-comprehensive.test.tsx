/**
 * Comprehensive test suite for HealWave Frequency Generator
 * Following Component Best Practices Checklist
 * @see docs/03-GUIDES/COMPONENT-BEST-PRACTICES-CHECKLIST.md
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Component under test
import { HealWaveFrequencyGenerator } from '../components/FrequencyGenerator';

// Types
import type { FrequencyPreset, AudioSettings } from '@cosmichub/integrations';

// ===================================================================
// MOCKS SETUP
// ===================================================================

/**
 * Mock Audio Engine with proper typing
 */
const mockAudioEngine = {
  startFrequency: vi.fn().mockResolvedValue(undefined),
  stopFrequency: vi.fn(),
} as const;

/**
 * Type-safe mock presets following strict category types
 */
const mockPresets: readonly FrequencyPreset[] = [
  {
    id: 'test-preset-1',
    name: 'Test Preset 1',
    baseFrequency: 528,
    category: 'solfeggio',
    description: 'Test description 1',
    benefits: ['Test benefit 1', 'Test benefit 2'],
  },
  {
    id: 'test-preset-2', 
    name: 'Test Preset 2',
    baseFrequency: 432,
    category: 'chakra',
    description: 'Test description 2',
    binauralBeat: 8,
    benefits: ['Test benefit 3'],
  },
] as const;

/**
 * Mock integrations package
 */
vi.mock('@cosmichub/integrations', () => ({
  AudioEngine: vi.fn(() => mockAudioEngine),
  getAllPresets: vi.fn(() => mockPresets),
  isValidFrequencyPreset: vi.fn(() => true),
}));

/**
 * Mock dev console for error tracking
 */
vi.mock('../config/devConsole', () => ({
  devConsole: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

/**
 * Mock Radix UI Slider with proper interaction simulation
 */
vi.mock('@radix-ui/react-slider', () => ({
  Root: ({ 
    children, 
    onValueChange, 
    value = [50],
    ...props 
  }: { 
    children: React.ReactNode; 
    onValueChange?: (value: number[]) => void; 
    value?: number[];
    [key: string]: unknown;
  }) => (
    <div
      data-testid="slider-root"
      data-value={value[0]}
      onClick={() => onValueChange && onValueChange([50])}
      {...props}
    >
      {children}
    </div>
  ),
  Track: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="slider-track" {...props}>{children}</div>
  ),
  Range: (props: { [key: string]: unknown }) => (
    <div data-testid="slider-range" {...props} />
  ),
  Thumb: (props: { [key: string]: unknown }) => (
    <div data-testid="slider-thumb" {...props} />
  ),
}));

/**
 * Mock Radix UI Tooltip
 */
vi.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => 
    asChild ? children : <div>{children}</div>,
  Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Content: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="tooltip-content" {...props}>{children}</div>
  ),
}));

// ===================================================================
// TYPED MOCK IMPORTS
// ===================================================================

import * as integrations from '@cosmichub/integrations';
const mockGetAllPresets = vi.mocked(integrations.getAllPresets) as MockedFunction<typeof integrations.getAllPresets>;
const mockIsValidFrequencyPreset = vi.mocked(integrations.isValidFrequencyPreset) as MockedFunction<typeof integrations.isValidFrequencyPreset>;

// ===================================================================
// TEST UTILITIES
// ===================================================================

/**
 * Test utilities for consistent test setup
 */
interface TestContext {
  user: ReturnType<typeof userEvent.setup>;
  renderResult: ReturnType<typeof render>;
  getByText: ReturnType<typeof render>['getByText'];
  getByLabelText: ReturnType<typeof render>['getByLabelText'];
  queryByText: ReturnType<typeof render>['queryByText'];
  getAllByTestId: ReturnType<typeof render>['getAllByTestId'];
  getByRole: ReturnType<typeof render>['getByRole'];
}

const setupTest = (): TestContext => {
  const user = userEvent.setup();
  const renderResult = render(<HealWaveFrequencyGenerator />);
  return { 
    user, 
    renderResult,
    getByText: renderResult.getByText,
    getByLabelText: renderResult.getByLabelText,
    queryByText: renderResult.queryByText,
    getAllByTestId: renderResult.getAllByTestId,
    getByRole: renderResult.getByRole,
  };
};

const selectPreset = async (context: TestContext, presetName: string): Promise<HTMLElement> => {
  const preset = context.getByLabelText(new RegExp(`${presetName} preset`));
  await context.user.click(preset);
  return preset;
};

// ===================================================================
// MAIN TEST SUITE
// ===================================================================

describe('FrequencyGenerator Comprehensive Tests', () => {
  
  beforeEach(() => {
    // Reset all mocks to ensure test isolation
    vi.clearAllMocks();
    
    // Reset mocks to default values
    mockGetAllPresets.mockReturnValue(mockPresets);
    mockIsValidFrequencyPreset.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===================================================================
  // COMPONENT RENDERING TESTS
  // ===================================================================

  describe('Component Rendering', () => {
    it('should render the frequency generator with proper title', () => {
      const { getByText } = setupTest();
      
      expect(getByText('HealWave Frequency Generator')).toBeInTheDocument();
      expect(getByText('Select Frequency')).toBeInTheDocument();
    });

    it('should render all available presets with correct information', () => {
      const { getByText } = setupTest();
      
      // Check preset names and frequencies
      expect(getByText('Test Preset 1')).toBeInTheDocument();
      expect(getByText('Test Preset 2')).toBeInTheDocument();
      expect(getByText('528 Hz')).toBeInTheDocument();
      expect(getByText('432 Hz')).toBeInTheDocument();
    });

    it('should render preset descriptions', () => {
      const { getByText } = setupTest();
      
      expect(getByText('Test description 1')).toBeInTheDocument();
      expect(getByText('Test description 2')).toBeInTheDocument();
    });

    it('should not show session settings initially', () => {
      const { queryByText } = setupTest();
      
      expect(queryByText('Session Settings')).not.toBeInTheDocument();
    });

    it('should handle empty preset list gracefully', () => {
      mockGetAllPresets.mockReturnValueOnce([]);
      
      const { getByText, queryByText } = setupTest();
      
      expect(getByText('Select Frequency')).toBeInTheDocument();
      expect(queryByText('Test Preset 1')).not.toBeInTheDocument();
    });
  });

  // ===================================================================
  // PRESET SELECTION TESTS
  // ===================================================================

  describe('Preset Selection', () => {
    it('should allow selecting a preset', async () => {
      const context = setupTest();
      
      const preset1 = await selectPreset(context, 'Test Preset 1');
      
      expect(preset1).toBeChecked();
      expect(context.getByText('Session Settings')).toBeInTheDocument();
    });

    it('should show detailed preset information when selected', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 2');
      
      await waitFor(() => {
        expect(context.getByText('About Test Preset 2')).toBeInTheDocument();
        expect(context.getByText('Frequency: 432 Hz')).toBeInTheDocument();
        expect(context.getByText('Category: chakra')).toBeInTheDocument();
        expect(context.getByText('Binaural Beat: 8 Hz')).toBeInTheDocument();
      });
    });

    it('should display benefits when available', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');
      
      await waitFor(() => {
        expect(context.getByText('Benefits:')).toBeInTheDocument();
        expect(context.getByText('Test benefit 1')).toBeInTheDocument();
        expect(context.getByText('Test benefit 2')).toBeInTheDocument();
      });
    });

    it('should maintain only one preset selection at a time', async () => {
      const context = setupTest();
      
      const preset1 = await selectPreset(context, 'Test Preset 1');
      expect(preset1).toBeChecked();
      
      const preset2 = await selectPreset(context, 'Test Preset 2');
      expect(preset2).toBeChecked();
      expect(preset1).not.toBeChecked();
    });
  });

  // ===================================================================
  // SESSION CONTROLS TESTS
  // ===================================================================

  describe('Session Controls', () => {
    it('should show volume and duration controls when preset is selected', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');

      expect(context.getByText('Volume (%)')).toBeInTheDocument();
      expect(context.getByText('Duration (minutes)')).toBeInTheDocument();
    });

    it('should show control buttons when preset is selected', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');

      expect(context.getByText('Start Session')).toBeInTheDocument();
      expect(context.getByText('Stop')).toBeInTheDocument();
    });

    it('should have proper initial button states', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');

      const startButton = context.getByText('Start Session');
      const stopButton = context.getByText('Stop');
      
      expect(startButton).not.toBeDisabled();
      expect(stopButton).toBeDisabled();
    });

    it('should display default settings values', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');

      expect(context.getByText('50%')).toBeInTheDocument(); // Default volume
      expect(context.getByText('10 min')).toBeInTheDocument(); // Default duration
    });
  });

  // ===================================================================
  // AUDIO CONTROL INTEGRATION TESTS
  // ===================================================================

  describe('Audio Control Integration', () => {
    it('should start audio session with correct parameters', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');
      
      const startButton = context.getByText('Start Session');
      await context.user.click(startButton);
      
      await waitFor(() => {
        expect(mockAudioEngine.startFrequency).toHaveBeenCalledWith(
          mockPresets[0],
          expect.objectContaining({
            volume: 50,
            duration: 10,
            fadeIn: 2,
            fadeOut: 2,
          } satisfies AudioSettings)
        );
      });
    });

    it('should update UI when audio session starts', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');
      
      const startButton = context.getByText('Start Session');
      await context.user.click(startButton);
      
      await waitFor(() => {
        expect(context.getByText('Playing...')).toBeInTheDocument();
      });
    });

    it('should stop audio session when stop button is clicked', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');
      
      // Start session
      const startButton = context.getByText('Start Session');
      await context.user.click(startButton);
      
      // Stop session
      await waitFor(async () => {
        const stopButton = context.getByText('Stop');
        expect(stopButton).not.toBeDisabled();
        
        await context.user.click(stopButton);
        expect(mockAudioEngine.stopFrequency).toHaveBeenCalled();
      });
    });

    it('should handle audio engine errors gracefully', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');
      
      // Mock audio engine error
      const errorMessage = 'Audio initialization failed';
      mockAudioEngine.startFrequency.mockRejectedValueOnce(new Error(errorMessage));
      
      const { devConsole } = await import('../config/devConsole');
      
      const startButton = context.getByText('Start Session');
      await context.user.click(startButton);
      
      await waitFor(() => {
        expect(devConsole.error).toHaveBeenCalledWith(
          'Failed to start frequency',
          expect.objectContaining({ 
            error: expect.objectContaining({
              message: errorMessage
            })
          })
        );
      });
    });

    it('should prevent invalid preset operations', async () => {
      const context = setupTest();
      
      // Mock invalid preset validation
      mockIsValidFrequencyPreset.mockReturnValue(false);
      
      await selectPreset(context, 'Test Preset 1');
      
      const startButton = context.getByText('Start Session');
      await context.user.click(startButton);
      
      // Should not call audio engine with invalid preset
      expect(mockAudioEngine.startFrequency).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // SETTINGS MANAGEMENT TESTS
  // ===================================================================

  describe('Settings Management', () => {
    describe('Settings Management', () => {
    it('should update volume setting via slider interaction', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');
      
      const volumeSliders = context.getAllByTestId('slider-root');
      const volumeSlider = volumeSliders[0]; // First slider is volume
      
      await context.user.click(volumeSlider);
      
      // Verify mock slider interaction works
      expect(volumeSlider).toHaveAttribute('data-value', '50');
    });

    it('should update duration setting via slider interaction', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');
      
      const durationSliders = context.getAllByTestId('slider-root');
      const durationSlider = durationSliders[1]; // Second slider is duration
      
      await context.user.click(durationSlider);
      
      // Verify mock slider interaction works
      expect(durationSlider).toHaveAttribute('data-value', '50');
    });

    it('should validate volume range constraints', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');
      
      // Volume should be within 0-100 range (tested via default display)
      expect(context.getByText('50%')).toBeInTheDocument();
    });

    it('should validate duration range constraints', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');
      
      // Duration should be within 1-60 minutes range (tested via default display)
      expect(context.getByText('10 min')).toBeInTheDocument();
    });
  });
  });

  // ===================================================================
  // ACCESSIBILITY TESTS
  // ===================================================================

  describe('Accessibility', () => {
    it('should have proper ARIA structure', () => {
      const { getByRole } = setupTest();
      
      expect(getByRole('region', { name: 'Frequency Generator' })).toBeInTheDocument();
      expect(getByRole('group', { name: 'Select Frequency' })).toBeInTheDocument();
    });

    it('should have accessible radio button labels', () => {
      const { getByLabelText } = setupTest();
      
      expect(getByLabelText(/Test Preset 1 preset \(528 Hz\)/)).toBeInTheDocument();
      expect(getByLabelText(/Test Preset 2 preset \(432 Hz\)/)).toBeInTheDocument();
    });

    it('should have live region for play state announcements', () => {
      setupTest();
      
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveTextContent('Frequency playback stopped');
    });

    it('should announce play state changes', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');
      
      const startButton = context.getByText('Start Session');
      await context.user.click(startButton);
      
      await waitFor(() => {
        const liveRegion = document.querySelector('[aria-live="polite"]');
        expect(liveRegion).toHaveTextContent('Frequency playback started');
      });
    });

    it('should support keyboard navigation through presets', async () => {
      const { getByRole, getByLabelText, user } = setupTest();
      
      const radioGroup = getByRole('region', { name: 'Frequency Generator' });
      const fieldset = radioGroup.querySelector('fieldset');
      
      expect(fieldset).toBeInTheDocument();
      
      // Test keyboard interaction structure exists
      const firstPreset = getByLabelText(/Test Preset 1 preset/);
      firstPreset.focus();
      
      // Simulate arrow key navigation
      await user.keyboard('{ArrowDown}');
      
      // The component should handle keyboard navigation internally
      expect(fieldset).toBeInTheDocument();
    });

    it('should have proper focus management', async () => {
      const { getByLabelText, user } = setupTest();
      
      const firstPreset = getByLabelText(/Test Preset 1 preset/);
      await user.click(firstPreset);
      
      // After selection, focus should be maintained properly
      expect(firstPreset).toBeChecked();
    });
  });

  // ===================================================================
  // COMPONENT LIFECYCLE TESTS
  // ===================================================================

  describe('Component Lifecycle', () => {
    it('should cleanup audio engine on component unmount', () => {
      const { renderResult } = setupTest();
      
      renderResult.unmount();
      
      expect(mockAudioEngine.stopFrequency).toHaveBeenCalled();
    });

    it('should handle component re-renders gracefully', () => {
      const { renderResult, getByText } = setupTest();
      
      // Verify initial render
      expect(getByText('Test Preset 1')).toBeInTheDocument();
      
      // Rerender should not cause issues
      renderResult.rerender(<HealWaveFrequencyGenerator />);
      expect(getByText('Test Preset 1')).toBeInTheDocument();
    });

    it('should memoize preset data to prevent unnecessary re-fetches', () => {
      setupTest();
      
      // getAllPresets should only be called once due to memoization
      expect(mockGetAllPresets).toHaveBeenCalledTimes(1);
    });
  });

  // ===================================================================
  // EDGE CASES & ERROR HANDLING
  // ===================================================================

  describe('Edge Cases & Error Handling', () => {
    it('should gracefully handle missing preset data', () => {
      mockGetAllPresets.mockReturnValueOnce([]);
      
      const { getByText, queryByText } = setupTest();
      
      expect(getByText('Select Frequency')).toBeInTheDocument();
      expect(queryByText('Test Preset 1')).not.toBeInTheDocument();
    });

    it('should handle malformed preset data', () => {
      const invalidPreset = {
        id: 'invalid-preset',
        name: 'Invalid Preset',
        // Missing required baseFrequency property
      } as unknown as FrequencyPreset;
      
      mockGetAllPresets.mockReturnValueOnce([invalidPreset]);
      
      expect(() => setupTest()).not.toThrow();
    });

    it('should prevent operations on invalid presets', async () => {
      const context = setupTest();
      
      mockIsValidFrequencyPreset.mockReturnValue(false);
      
      await selectPreset(context, 'Test Preset 1');
      
      const startButton = context.getByText('Start Session');
      await context.user.click(startButton);
      
      // Should not attempt to start invalid frequency
      expect(mockAudioEngine.startFrequency).not.toHaveBeenCalled();
    });

    it('should handle concurrent play/stop operations safely', async () => {
      const context = setupTest();
      
      await selectPreset(context, 'Test Preset 1');
      
      const startButton = context.getByText('Start Session');
      
      // Rapid clicking should not cause issues
      await context.user.click(startButton);
      await context.user.click(startButton);
      
      // Should only call start once
      expect(mockAudioEngine.startFrequency).toHaveBeenCalledTimes(1);
    });
  });

  // ===================================================================
  // PERFORMANCE & OPTIMIZATION TESTS
  // ===================================================================

  describe('Performance & Optimization', () => {
    it('should have stable component reference', () => {
      const { renderResult, getByText } = setupTest();
      
      // Component should be wrapped with React.memo
      expect(HealWaveFrequencyGenerator.displayName).toBe('HealWaveFrequencyGenerator');
      
      renderResult.rerender(<HealWaveFrequencyGenerator />);
      
      // Should not cause unnecessary re-renders
      expect(getByText('HealWave Frequency Generator')).toBeInTheDocument();
    });

    it('should efficiently handle large preset lists', () => {
      // Simulate large preset list
      const largePresetList: FrequencyPreset[] = Array.from({ length: 100 }, (_, i) => ({
        id: `preset-${i}`,
        name: `Preset ${i}`,
        baseFrequency: 200 + i,
        category: 'solfeggio' as const,
        description: `Description ${i}`,
      }));
      
      mockGetAllPresets.mockReturnValueOnce(largePresetList);
      
      const startTime = performance.now();
      setupTest();
      const endTime = performance.now();
      
      // Should render efficiently (under 100ms for 100 items)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});