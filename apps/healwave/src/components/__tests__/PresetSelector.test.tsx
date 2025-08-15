import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FrequencyPreset, AudioSettings } from '@cosmichub/frequency';
import PresetSelector from '../PresetSelector';

// Mock the auth hook
const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com'
};

vi.mock('@cosmichub/auth', () => ({
  useAuth: () => ({ user: mockUser })
}));

// Mock API functions
const mockSavePreset = vi.fn();
const mockGetUserPresets = vi.fn();
const mockDeletePreset = vi.fn();

vi.mock('../services/api', () => ({
  savePreset: mockSavePreset,
  getUserPresets: mockGetUserPresets,
  deletePreset: mockDeletePreset
}));

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
    mockGetUserPresets.mockResolvedValue([]);
  });

  it('renders preset selector with accessibility attributes', () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    expect(screen.getByRole('region')).toBeDefined();
    expect(screen.getByRole('button', { name: /save current settings/i })).toBeDefined();
  });

  it('displays built-in presets', () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    expect(screen.getByText('Built-in Presets')).toBeDefined();
    expect(screen.getByText('Deep Relaxation')).toBeDefined();
    expect(screen.getByText('Enhanced Focus')).toBeDefined();
    expect(screen.getByText('Meditation')).toBeDefined();
    expect(screen.getByText('Sleep Induction')).toBeDefined();
    expect(screen.getByText('Creative Flow')).toBeDefined();
  });

  it('calls onSelectPreset when a built-in preset is clicked', () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    const relaxationPreset = screen.getByText('Deep Relaxation').closest('[tabindex="0"]');
    fireEvent.click(relaxationPreset!);

    expect(mockOnSelectPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'relaxation',
        name: 'Deep Relaxation',
        baseFrequency: 40,
        binauralBeat: 4
      })
    );
  });

  it('supports keyboard navigation for preset selection', () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    const relaxationPreset = screen.getByText('Deep Relaxation').closest('[tabindex="0"]');
    
    fireEvent.keyDown(relaxationPreset!, { key: 'Enter' });
    expect(mockOnSelectPreset).toHaveBeenCalled();

    // Test space key as well
    vi.clearAllMocks();
    fireEvent.keyDown(relaxationPreset!, { key: ' ' });
    expect(mockOnSelectPreset).toHaveBeenCalled();
  });

  it('displays loading state for user presets', async () => {
    mockGetUserPresets.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeDefined();
      expect(screen.getByText(/loading presets/i)).toBeDefined();
    });
  });

  it('displays user presets when loaded', async () => {
    const userPresets = [
      {
        id: 'user-1',
        name: 'My Custom Preset',
        category: 'custom',
        baseFrequency: 50,
        binauralBeat: 5,
        description: 'My personal preset'
      }
    ];
    mockGetUserPresets.mockResolvedValue(userPresets);

    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Your Presets')).toBeDefined();
      expect(screen.getByText('My Custom Preset')).toBeDefined();
    });
  });

  it('opens save preset dialog', () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save current settings/i });
    fireEvent.click(saveButton);

    // Check dialog is present
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByLabelText(/preset name/i)).toBeDefined();
    expect(screen.getByLabelText(/description/i)).toBeDefined();
  });

  it('validates preset name in save dialog', () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save current settings/i });
    fireEvent.click(saveButton);

    const savePresetButton = screen.getByRole('button', { name: /save preset/i });
    expect(savePresetButton.hasAttribute('disabled')).toBe(true);

    const nameInput = screen.getByLabelText(/preset name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Preset' } });

    expect(savePresetButton.hasAttribute('disabled')).toBe(false);
  });

  it('saves preset with correct data', async () => {
    mockSavePreset.mockResolvedValue({ id: 'saved-preset', name: 'Test Preset' });

    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save current settings/i });
    fireEvent.click(saveButton);

    const nameInput = screen.getByLabelText(/preset name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test Preset' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

    const savePresetButton = screen.getByRole('button', { name: /save preset/i });
    fireEvent.click(savePresetButton);

    await waitFor(() => {
      expect(mockSavePreset).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Preset',
          description: 'Test description',
          category: 'custom',
          baseFrequency: 40,
          binauralBeat: 10,
          metadata: {
            volume: 75,
            duration: 30,
            fadeIn: 2,
            fadeOut: 2
          }
        })
      );
    });
  });

  it('handles save preset errors gracefully', async () => {
    mockSavePreset.mockRejectedValue(new Error('Save failed'));

    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save current settings/i });
    fireEvent.click(saveButton);

    const nameInput = screen.getByLabelText(/preset name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Preset' } });

    const savePresetButton = screen.getByRole('button', { name: /save preset/i });
    fireEvent.click(savePresetButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText(/failed to save preset/i)).toBeDefined();
    });
  });

  it('displays current settings correctly in save dialog', () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save current settings/i });
    fireEvent.click(saveButton);

    expect(screen.getByText('Preset: Test Preset')).toBeDefined();
    expect(screen.getByText('Base Frequency: 40Hz')).toBeDefined();
    expect(screen.getByText('Binaural Beat: 10Hz')).toBeDefined();
    expect(screen.getByText('Volume: 75%')).toBeDefined();
    expect(screen.getByText('Duration: 30m')).toBeDefined();
  });
});
