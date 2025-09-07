import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FrequencyPreset, AudioSettings } from '@cosmichub/integrations';

// Import jest-dom for matchers
import '@testing-library/jest-dom';

// Mock the auth hook first
vi.mock('@cosmichub/auth', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
    },
  }),
}));

// Mock API functions second
vi.mock('../../services/api', () => ({
  savePreset: vi.fn(),
  getUserPresets: vi.fn(),
  deletePreset: vi.fn(),
}));

// Import mocked functions after mock setup
import { PresetSelectorRefactored as PresetSelector } from '../../components/presets';
import * as apiModule from '../../services/api';
import { ok } from '@cosmichub/config';

const mockSavePreset = vi.mocked(apiModule.savePreset);
const mockGetUserPresets = vi.mocked(apiModule.getUserPresets);
const mockDeletePreset = vi.mocked(apiModule.deletePreset);

describe('PresetSelector Enhanced Tests', () => {
  const mockOnSelectPreset = vi.fn();
  
  const mockCurrentSettings: AudioSettings = {
    volume: 75,
    duration: 30,
    fadeIn: 2,
    fadeOut: 2,
  };
  
  const mockCurrentPreset: FrequencyPreset = {
    id: 'test-preset',
    name: 'Test Preset',
    category: 'brainwave',
    baseFrequency: 40,
    binauralBeat: 10,
    description: 'A test preset',
  };

  const mockUserPresets: FrequencyPreset[] = [
    {
      id: 'user-preset-1',
      name: 'My Custom Preset',
      category: 'custom',
      baseFrequency: 528,
      binauralBeat: 6,
      description: 'User created preset',
    },
    {
      id: 'user-preset-2', 
      name: 'Another Custom',
      category: 'custom',
      baseFrequency: 432,
      binauralBeat: 8,
      description: 'Another user preset',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default API responses
    mockGetUserPresets.mockResolvedValue(ok([]));
    mockSavePreset.mockResolvedValue(ok({
      id: 'saved-preset',
      name: 'Saved Preset',
      category: 'custom',
      baseFrequency: 40,
      binauralBeat: 4,
      description: 'A saved preset',
    }));
    mockDeletePreset.mockResolvedValue(ok(null));
  });

  it('renders without crashing', () => {
    const { getByText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    expect(getByText('Built-in Presets')).toBeInTheDocument();
  });

  it('displays built-in presets correctly', async () => {
    const { getByText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    // Check for built-in presets
    expect(getByText('Deep Relaxation')).toBeInTheDocument();
    expect(getByText('Enhanced Focus')).toBeInTheDocument();
    expect(getByText('Meditation')).toBeInTheDocument();
    expect(getByText('Sleep Induction')).toBeInTheDocument();
    expect(getByText('Creative Flow')).toBeInTheDocument();
  });

  it('handles preset selection correctly', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    const deepRelaxationPreset = getByLabelText(/select deep relaxation preset/i);
    await user.click(deepRelaxationPreset);

    expect(mockOnSelectPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Deep Relaxation',
        baseFrequency: 40,
        binauralBeat: 4,
      })
    );
  });

  it('loads and displays user presets', async () => {
    mockGetUserPresets.mockResolvedValue(ok(mockUserPresets));

    const { getByText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    await waitFor(() => {
      expect(getByText('My Custom Preset')).toBeInTheDocument();
      expect(getByText('Another Custom')).toBeInTheDocument();
    });
  });

  it('handles user preset selection', async () => {
    const user = userEvent.setup();
    mockGetUserPresets.mockResolvedValue(ok(mockUserPresets));

    const { getByText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    await waitFor(() => {
      expect(getByText('My Custom Preset')).toBeInTheDocument();
    });

    await user.click(getByText('My Custom Preset'));

    expect(mockOnSelectPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My Custom Preset',
        baseFrequency: 528,
        binauralBeat: 6,
      })
    );
  });

  it('shows save preset dialog when save button is clicked', async () => {
    const user = userEvent.setup();
    
    const { getByRole, getByText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    const saveButton = getByRole('button', { name: /save current settings/i });
    await user.click(saveButton);

    expect(getByText(/preset name/i) || getByText(/save preset/i)).toBeInTheDocument();
  });

  it('handles preset saving workflow', async () => {
    const user = userEvent.setup();
    
    const { getByRole, getByLabelText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    // Open save dialog
    const saveButton = getByRole('button', { name: /save current settings/i });
    await user.click(saveButton);

    // Fill in preset name
    const nameInput = getByLabelText(/preset name/i);
    await user.type(nameInput, 'My New Preset');

    // Submit save
    const submitButton = getByRole('button', { name: /save preset/i });
    await user.click(submitButton);

    expect(mockSavePreset).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My New Preset',
      })
    );
  });

  it('handles preset deletion', async () => {
    const user = userEvent.setup();
    mockGetUserPresets.mockResolvedValue(ok(mockUserPresets));

    const { getByLabelText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    await waitFor(() => {
      const deleteButton = getByLabelText(/delete my custom preset/i);
      expect(deleteButton).toBeInTheDocument();
    });

    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(true);

    const deleteButton = getByLabelText(/delete my custom preset/i);
    await user.click(deleteButton);

    expect(mockDeletePreset).toHaveBeenCalledWith('user-preset-1');

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('handles API errors gracefully', async () => {
    // Mock a failed response
    mockGetUserPresets.mockRejectedValue(new Error('Failed to load presets'));

    const { getByText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    // Component should still render built-in presets
    expect(getByText('Built-in Presets')).toBeInTheDocument();
  });

  it('shows appropriate messaging for user presets section', () => {
    const { getByText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    // Should show user presets section
    expect(getByText('Your Presets') || getByText('User Presets')).toBeInTheDocument();
  });

  it('shows loading state during user preset fetch', () => {
    // Don't resolve the promise immediately
    mockGetUserPresets.mockReturnValue(new Promise(() => {}));

    const { getByText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    expect(getByText(/loading/i)).toBeInTheDocument();
  });

  it('validates preset save form correctly', async () => {
    const user = userEvent.setup();
    
    const { getByRole } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    // Open save dialog
    const saveButton = getByRole('button', { name: /save current settings/i });
    await user.click(saveButton);

    // Try to submit without name
    const submitButton = getByRole('button', { name: /save preset/i });
    expect(submitButton).toBeDisabled();
  });

  it('handles save errors gracefully', async () => {
    const user = userEvent.setup();
    mockSavePreset.mockRejectedValue(new Error('Failed to save preset'));
    
    const { getByRole, getByLabelText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    // Open save dialog and fill form
    const saveButton = getByRole('button', { name: /save current settings/i });
    await user.click(saveButton);

    const nameInput = getByLabelText(/preset name/i);
    await user.type(nameInput, 'Test Preset');

    const submitButton = getByRole('button', { name: /save preset/i });
    await user.click(submitButton);

    // Verify save was attempted
    expect(mockSavePreset).toHaveBeenCalled();
  });

  it('displays current settings information', () => {
    const { getByText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    expect(getByText(/75%/)).toBeInTheDocument(); // Volume
    expect(getByText(/30/)).toBeInTheDocument(); // Duration
  });

  it('has proper accessibility structure', () => {
    const { getByLabelText, getByRole } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    expect(getByLabelText('Frequency Presets')).toBeInTheDocument();
    expect(getByRole('button', { name: /save current settings/i })).toBeInTheDocument();
  });
});
