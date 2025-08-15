import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FrequencyPreset, AudioSettings } from '@cosmichub/frequency';
import PresetSelector from '../PresetSelector';

// Mock the auth hook first
vi.mock('@cosmichub/auth', () => ({
  useAuth: () => ({ 
    user: {
      uid: 'test-user-id',
      email: 'test@example.com'
    }
  })
}));

// Mock API functions second
vi.mock('../../services/api', () => ({
  savePreset: vi.fn(),
  getUserPresets: vi.fn(),
  deletePreset: vi.fn()
}));

// Import mocked functions after mock setup
import * as apiModule from '../../services/api';

const mockSavePreset = vi.mocked(apiModule.savePreset);
const mockGetUserPresets = vi.mocked(apiModule.getUserPresets);
const mockDeletePreset = vi.mocked(apiModule.deletePreset);

describe('PresetSelector', () => {
  const mockOnSelectPreset = vi.fn();
  const mockCurrentSettings: AudioSettings = {
    volume: 75,
    duration: 30,
    fadeIn: 2,
    fadeOut: 2
  };
  const mockCurrentPreset: FrequencyPreset = {
    id: 'test-preset',
    name: 'Test Preset',
    category: 'brainwave',
    baseFrequency: 40,
    binauralBeat: 10,
    description: 'A test preset'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure getUserPresets resolves immediately with an empty array
    mockGetUserPresets.mockResolvedValue([]);
    mockSavePreset.mockResolvedValue(undefined);
    mockDeletePreset.mockResolvedValue(undefined);
  });

  it('renders preset selector with basic functionality', () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    expect(screen.getByRole('button', { name: /save current settings/i })).toBeDefined();
    expect(screen.getByText('Built-in Presets')).toBeDefined();
    expect(screen.getByText('Your Presets')).toBeDefined();
  });

  it('shows built-in presets correctly', () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    // Check that built-in presets are displayed
    expect(screen.getByText('Deep Relaxation')).toBeDefined();
    expect(screen.getByText('Enhanced Focus')).toBeDefined();
    expect(screen.getByText('Meditation')).toBeDefined();
    expect(screen.getByText('Sleep Induction')).toBeDefined();
    expect(screen.getByText('Creative Flow')).toBeDefined();
  });

  it('calls onSelectPreset when built-in preset is clicked', () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    // Find and click the Deep Relaxation preset
    const deepRelaxationPreset = screen.getByLabelText(/select deep relaxation preset/i);
    fireEvent.click(deepRelaxationPreset);

    expect(mockOnSelectPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Deep Relaxation',
        baseFrequency: 40,
        binauralBeat: 4
      })
    );
  });

  it('displays loading state for user presets initially', () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    // Should show loading initially - use getAllByText for multiple matches
    expect(screen.getAllByText('Loading presets...').length).toBeGreaterThan(0);
  });

  it('has proper accessibility attributes', () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    // Check accessibility attributes
    expect(screen.getByLabelText('Frequency Presets')).toBeDefined();
    expect(screen.getByRole('button', { name: /save current settings/i })).toBeDefined();
    expect(screen.getByText('Built-in Presets')).toBeDefined();
    expect(screen.getByText('Your Presets')).toBeDefined();
  });
});
