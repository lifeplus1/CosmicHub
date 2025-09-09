import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from 'firebase/auth';
import { UserPresets } from '../UserPresets';

// Mock dependencies
vi.mock('../PresetCard', () => ({
  __esModule: true,
  default: vi.fn(({ preset, onSelect, onDelete, isSelected, showDeleteButton }) => (
    <div data-testid="preset-card">
      <span>{preset.name}</span>
      <button onClick={() => onSelect(preset)}>Select</button>
      {showDeleteButton && (
        <button onClick={() => onDelete?.(preset.id)}>Delete</button>
      )}
      {isSelected && <span data-testid="selected">Selected</span>}
    </div>
  )),
}));

vi.mock('@cosmichub/auth', () => ({
  User: {},
}));

describe('UserPresets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test Data
  const mockPresets = [
    {
      id: 'user-preset-1',
      name: 'My Meditation Preset',
      category: 'custom' as const,
      baseFrequency: 432,
      binauralBeat: 8,
    },
    {
      id: 'user-preset-2',
      name: 'Focus Session',
      category: 'custom' as const,
      baseFrequency: 528,
      binauralBeat: 15,
    },
  ];

  const mockUser = {
    uid: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    isAnonymous: false,
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
    metadata: {},
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
  } as User;

  const mockCallbacks = {
    onSelectPreset: vi.fn(),
    onDeletePreset: vi.fn(),
  };

  describe('Authentication States', () => {
    it('shows login prompt when user is not authenticated', () => {
      render(
        <UserPresets
          presets={[]}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={null}
        />
      );

      expect(screen.getByText('Sign in to save custom presets')).toBeInTheDocument();
      expect(screen.getByText('Create and save your own frequency presets for quick access.')).toBeInTheDocument();
      // Check for SVG element
      const lockIcon = document.querySelector('svg');
      expect(lockIcon).toBeInTheDocument();
    });

    it('shows content when user is authenticated', () => {
      render(
        <UserPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
        />
      );

      expect(screen.getByText('Your Presets')).toBeInTheDocument();
      expect(screen.queryByText('Sign in to save custom presets')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading skeleton when loading is true', () => {
      render(
        <UserPresets
          presets={[]}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
          loading={true}
        />
      );

      expect(screen.getByText('Your Presets')).toBeInTheDocument();
      // Check for loading skeleton elements
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });

    it('does not show loading skeleton when loading is false', () => {
      render(
        <UserPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
          loading={false}
        />
      );

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(0);
    });
  });

  describe('Error States', () => {
    it('shows error message when error is present', () => {
      const errorMessage = 'Failed to load presets from server';
      
      render(
        <UserPresets
          presets={[]}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
          error={errorMessage}
        />
      );

      expect(screen.getByText('Failed to load your presets')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      // Check for SVG element
      const warningIcon = document.querySelector('svg');
      expect(warningIcon).toBeInTheDocument();
    });

    it('does not show error when error is null', () => {
      render(
        <UserPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
          error={null}
        />
      );

      expect(screen.queryByText('Failed to load your presets')).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows empty state when user has no presets', () => {
      render(
        <UserPresets
          presets={[]}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
        />
      );

      expect(screen.getByText('No custom presets yet')).toBeInTheDocument();
      expect(screen.getByText('Save your current settings as a preset to get started.')).toBeInTheDocument();
      // Check for SVG element
      const archiveIcon = document.querySelector('svg');
      expect(archiveIcon).toBeInTheDocument();
    });

    it('does not show empty state when user has presets', () => {
      render(
        <UserPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
        />
      );

      expect(screen.queryByText('No custom presets yet')).not.toBeInTheDocument();
    });
  });

  describe('Preset Display', () => {
    it('displays presets when user has saved presets', () => {
      render(
        <UserPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
        />
      );

      expect(screen.getByText('Your Presets')).toBeInTheDocument();
      expect(screen.getByText('(2 saved)')).toBeInTheDocument();
      expect(screen.getByText('My Meditation Preset')).toBeInTheDocument();
      expect(screen.getByText('Focus Session')).toBeInTheDocument();
    });

    it('shows correct preset count in header', () => {
      const firstPreset = mockPresets[0];
      if (!firstPreset) throw new Error('Test setup error: mockPresets[0] is undefined');
      
      render(
        <UserPresets
          presets={[firstPreset]}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
        />
      );

      expect(screen.getByText('(1 saved)')).toBeInTheDocument();
    });

    it('renders preset cards with correct props', () => {
      const selectedPreset = mockPresets[0];
      
      render(
        <UserPresets
          presets={mockPresets}
          selectedPreset={selectedPreset}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
        />
      );

      // Check that all preset cards are rendered
      const presetCards = screen.getAllByTestId('preset-card');
      expect(presetCards).toHaveLength(2);

      // Check that selected state is shown for the first preset
      expect(screen.getByTestId('selected')).toBeInTheDocument();
    });
  });

  describe('Preset Interactions', () => {
    it('calls onSelectPreset when preset is selected', async () => {
      const user = userEvent.setup();

      render(
        <UserPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
        />
      );

      const selectButtons = screen.getAllByText('Select');
      await user.click(selectButtons[0]);

      expect(mockCallbacks.onSelectPreset).toHaveBeenCalledWith(mockPresets[0]);
    });

    it('calls onDeletePreset when preset is deleted', async () => {
      const user = userEvent.setup();

      render(
        <UserPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
        />
      );

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      expect(mockCallbacks.onDeletePreset).toHaveBeenCalledWith('user-preset-1');
    });

    it('disables preset cards when loading', () => {
      render(
        <UserPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
          loading={true}
        />
      );

      // During loading state, the component shows skeleton loaders instead of preset cards
      expect(screen.queryByTestId('preset-card')).not.toBeInTheDocument();
    });
  });

  describe('Selection State Management', () => {
    it('shows selected state for the currently selected preset', () => {
      const selectedPreset = mockPresets[1];

      render(
        <UserPresets
          presets={mockPresets}
          selectedPreset={selectedPreset}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
        />
      );

      // Only one preset should be marked as selected
      expect(screen.getByTestId('selected')).toBeInTheDocument();
    });

    it('shows no selection when selectedPreset is null', () => {
      render(
        <UserPresets
          presets={mockPresets}
          selectedPreset={null}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
        />
      );

      expect(screen.queryByTestId('selected')).not.toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('works with minimal required props', () => {
      render(
        <UserPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
        />
      );

      expect(screen.getByText('Your Presets')).toBeInTheDocument();
      expect(screen.getByText('My Meditation Preset')).toBeInTheDocument();
    });

    it('handles undefined optional props gracefully', () => {
      render(
        <UserPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
          selectedPreset={undefined}
          loading={undefined}
          error={undefined}
        />
      );

      expect(screen.getByText('Your Presets')).toBeInTheDocument();
      // Should not crash and should render normally
    });
  });

  describe('Component Integration', () => {
    it('passes correct props to PresetCard components', () => {
      const selectedPreset = mockPresets[0];

      render(
        <UserPresets
          presets={mockPresets}
          selectedPreset={selectedPreset}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
          loading={false}
        />
      );

      // Verify that PresetCard components receive the showDeleteButton prop
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons).toHaveLength(2); // One for each preset
    });

    it('does not render PresetCard when in loading state', () => {
      render(
        <UserPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
          loading={true}
        />
      );

      // When loading, should show skeletons instead of preset cards
      expect(screen.queryByTestId('preset-card')).not.toBeInTheDocument();
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Grid Layout', () => {
    it('renders presets in a responsive grid layout', () => {
      render(
        <UserPresets
          presets={mockPresets}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
        />
      );

      const gridContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });

    it('maintains grid structure with different preset counts', () => {
      const firstPreset = mockPresets[0];
      if (!firstPreset) throw new Error('Test setup error: mockPresets[0] is undefined');
      const singlePreset = [firstPreset];

      render(
        <UserPresets
          presets={singlePreset}
          onSelectPreset={mockCallbacks.onSelectPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          user={mockUser}
        />
      );

      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(screen.getByTestId('preset-card')).toBeInTheDocument();
    });
  });
});
