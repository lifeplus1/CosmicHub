import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import PresetSelector from '../PresetSelectorRefactored';

// Mock dependencies before imports
vi.mock('@cosmichub/auth', () => ({
  useAuth: () => ({ user: null, loading: false, signOut: vi.fn() }),
}));

vi.mock('../../services/api', () => ({
  savePreset: vi.fn(() => Promise.resolve({ success: true })),
  getUserPresets: vi.fn(() => Promise.resolve({ success: true, data: [] })),
  deletePreset: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock('../ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('./BuiltInPresets', () => ({
  default: () => <div data-testid="built-in-presets">Built-in Presets</div>,
}));

vi.mock('./UserPresets', () => ({
  default: () => <div data-testid="user-presets">User Presets</div>,
}));

vi.mock('./SavePresetDialog', () => ({
  default: () => <div data-testid="save-dialog">Save Dialog</div>,
}));

describe('PresetSelectorRefactored', () => {
  const defaultProps = {
    onSelectPreset: vi.fn(),
    currentSettings: {
      volume: 0.7,
      duration: 300,
      fadeIn: 5,
      fadeOut: 5,
    },
    currentPreset: {
      id: 'test',
      name: 'Test',
      category: 'brainwave' as const,
      baseFrequency: 40,
      binauralBeat: 10,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<PresetSelector {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders main heading', () => {
    const { getByText } = render(<PresetSelector {...defaultProps} />);
    expect(getByText('Frequency Presets')).toBeTruthy();
  });

  it('renders child components sections', () => {
    const { getByText } = render(<PresetSelector {...defaultProps} />);
    // Check for the presence of the sections rather than mocked components
    expect(getByText('Built-in Presets')).toBeTruthy();
    // The component should render some preset cards
    expect(getByText('Deep Relaxation')).toBeTruthy();
    expect(getByText('Enhanced Focus')).toBeTruthy();
  });

  it('handles null currentPreset', () => {
    const { container } = render(<PresetSelector {...defaultProps} currentPreset={null} />);
    expect(container).toBeTruthy();
  });

  it('handles undefined currentPreset', () => {
    const { container } = render(<PresetSelector {...defaultProps} currentPreset={undefined} />);
    expect(container).toBeTruthy();
  });

  it('maintains display name', () => {
    expect(PresetSelector.displayName).toBe('PresetSelector');
  });
});
