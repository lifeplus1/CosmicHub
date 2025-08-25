import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FrequencyPreset, AudioSettings } from '@cosmichub/frequency';
import PresetSelector from '../PresetSelector';

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
import * as apiModule from '../../services/api';
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
        category: 'brainwave',
        baseFrequency: 40,
        binauralBeat: 4,
        description: 'A saved preset',
      } as any)
    );
    mockDeletePreset.mockResolvedValue(ok(null));
  });

  it('renders preset selector with basic functionality', async () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );
    // Await for effect-driven updates to settle
    expect(
      await screen.findByRole('button', { name: /save current settings/i })
    ).toBeDefined();
    expect(await screen.findByText('Built-in Presets')).toBeDefined();
    expect(await screen.findByText('Your Presets')).toBeDefined();
  });

  it('shows built-in presets correctly', async () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );
    // Check that built-in presets are displayed after initial renders
    expect(await screen.findByText('Deep Relaxation')).toBeDefined();
    expect(await screen.findByText('Enhanced Focus')).toBeDefined();
    expect(await screen.findByText('Meditation')).toBeDefined();
    expect(await screen.findByText('Sleep Induction')).toBeDefined();
    expect(await screen.findByText('Creative Flow')).toBeDefined();
  });

  it('calls onSelectPreset when built-in preset is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    // Find and click the Deep Relaxation preset
    const deepRelaxationPreset = await screen.findByLabelText(
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
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );

    // Should show loading initially - use getAllByText for multiple matches
    const loadingEls = await screen.findAllByText('Loading presets...');
    expect(loadingEls.length).toBeGreaterThan(0);
  });

  it('has proper accessibility attributes', async () => {
    render(
      <PresetSelector
        onSelectPreset={mockOnSelectPreset}
        currentSettings={mockCurrentSettings}
        currentPreset={mockCurrentPreset}
      />
    );
    // Check accessibility attributes after async updates
    expect(await screen.findByLabelText('Frequency Presets')).toBeDefined();
    expect(
      await screen.findByRole('button', { name: /save current settings/i })
    ).toBeDefined();
    expect(await screen.findByText('Built-in Presets')).toBeDefined();
    expect(await screen.findByText('Your Presets')).toBeDefined();
  });
});
