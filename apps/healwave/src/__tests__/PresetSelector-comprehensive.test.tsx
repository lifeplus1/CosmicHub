import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FrequencyPreset, AudioSettings } from '@cosmichub/integrations';
import { PresetSelectorRefactored as PresetSelector } from '../components/presets';

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
vi.mock('../services/api', () => ({
  savePreset: vi.fn(),
  getUserPresets: vi.fn(),
  deletePreset: vi.fn(),
}));

// Import mocked functions after mock setup
import * as apiModule from '../services/api';
import { ok } from '@cosmichub/config';

const mockSavePreset = vi.mocked(apiModule.savePreset);
const mockGetUserPresets = vi.mocked(apiModule.getUserPresets);
const mockDeletePreset = vi.mocked(apiModule.deletePreset);

describe('PresetSelector', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure getUserPresets resolves immediately with an empty array
    mockGetUserPresets.mockResolvedValue(ok([]));
    mockSavePreset.mockResolvedValue(
      ok({
        id: 'saved',
        name: 'Saved',
        category: 'brainwave' as const,
        baseFrequency: 40,
        binauralBeat: 4,
        description: 'A saved preset',
      } satisfies FrequencyPreset)
    );
    mockDeletePreset.mockResolvedValue(ok(null));
  });

  it('renders preset selector with basic functionality', async () => {
    const { findByRole, findByText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );
    // Await for effect-driven updates to settle
    expect(
      await findByRole('button', { name: /save current settings/i })
    ).toBeDefined();
    expect(await findByText('Built-in Presets')).toBeDefined();
    expect(await findByText('Your Presets')).toBeDefined();
  });

  it('shows built-in presets correctly', async () => {
    const { findByText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );
    // Check that built-in presets are displayed after initial renders
    expect(await findByText('Deep Relaxation')).toBeDefined();
    expect(await findByText('Enhanced Focus')).toBeDefined();
    expect(await findByText('Meditation')).toBeDefined();
    expect(await findByText('Sleep Induction')).toBeDefined();
    expect(await findByText('Creative Flow')).toBeDefined();
  });

  it('calls onSelectPreset when built-in preset is clicked', async () => {
    const user = userEvent.setup();
    const { findByLabelText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    // Find and click the Deep Relaxation preset
    const deepRelaxationPreset = await findByLabelText(
      /select deep relaxation preset/i
    );
    await user.click(deepRelaxationPreset);

    expect(mockOnSelectPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Deep Relaxation',
        baseFrequency: 40,
        binauralBeat: 4,
      })
    );
  });

  it('displays loading state for user presets initially', async () => {
    const { findByText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );
    // ProgressiveLoading message currently: 'Loading your custom frequency presets...'
    expect(
      await findByText('Loading your custom frequency presets...')
    ).toBeDefined();
  });

  it('has proper accessibility attributes', async () => {
    const { findByLabelText, findByRole, findByText } = render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );
    // Check accessibility attributes after async updates
    expect(await findByLabelText('Frequency Presets')).toBeDefined();
    expect(
      await findByRole('button', { name: /save current settings/i })
    ).toBeDefined();
    expect(await findByText('Built-in Presets')).toBeDefined();
    expect(await findByText('Your Presets')).toBeDefined();
  });
});
