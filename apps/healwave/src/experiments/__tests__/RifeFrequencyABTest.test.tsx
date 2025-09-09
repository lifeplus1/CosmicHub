import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RifeFrequencyABTest } from '../RifeFrequencyABTest';
import { useAuth } from '@cosmichub/auth';

// Mock the auth hook
vi.mock('@cosmichub/auth', () => ({
  useAuth: vi.fn()
}));

// Mock the frequency control components
vi.mock('../../components/FrequencyControls', () => ({
  default: () => <div data-testid="frequency-controls-current">Current Controls</div>
}));

vi.mock('../../components/FrequencyControls.enhanced', () => ({
  default: ({ onFrequencyChange, onVolumeChange, onDurationChange }: {
    onFrequencyChange?: (_freq: number) => void;
    onVolumeChange?: (_vol: number) => void;
    onDurationChange?: (_dur: number) => void;
  }) => (
    <div data-testid="frequency-controls-enhanced">
      Enhanced Controls
      <button onClick={() => onFrequencyChange?.(727)} data-testid="rife-frequency-btn">
        727 Hz Rife
      </button>
      <button onClick={() => onVolumeChange?.(0.8)} data-testid="volume-btn">
        Volume
      </button>
      <button onClick={() => onDurationChange?.(600)} data-testid="duration-btn">
        Duration
      </button>
    </div>
  )
}));

const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: 'test-refresh',
  tenantId: null,
  delete: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn(),
  displayName: null,
  phoneNumber: null,
  photoURL: null,
  providerId: 'firebase'
} as const;

const _mockUseAuth = vi.mocked(useAuth);

describe('RifeFrequencyABTest', () => {
  const mockOnFrequencyChange = vi.fn();
  const mockOnVolumeChange = vi.fn();
  const mockOnDurationChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    _mockUseAuth.mockReturnValue({ user: mockUser } as ReturnType<typeof useAuth>);
  });

  describe('User Assignment', () => {
    it('should assign users consistently to control variant', async () => {
      // Mock user with hash that should map to control (hash % 100 >= 50)
      const controlUser = { uid: 'control-user-zzz', email: 'control@test.com' };
      _mockUseAuth.mockReturnValue({ user: controlUser } as ReturnType<typeof useAuth>);

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
          onVolumeChange={mockOnVolumeChange}
          onDurationChange={mockOnDurationChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('ab-test-control')).toBeInTheDocument();
      });

      expect(screen.getByTestId('frequency-controls-current')).toBeInTheDocument();
      expect(screen.getByText('🎵 Current frequency interface')).toBeInTheDocument();
    });

    it('should assign users consistently to variant', async () => {
      // Mock user with hash that should map to variant (hash % 100 < 50)
      const variantUser = { uid: 'a', email: 'variant@test.com' };
      _mockUseAuth.mockReturnValue({ user: variantUser } as ReturnType<typeof useAuth>);

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
          onVolumeChange={mockOnVolumeChange}
          onDurationChange={mockOnDurationChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('ab-test-variant')).toBeInTheDocument();
      });

      expect(screen.getByTestId('frequency-controls-enhanced')).toBeInTheDocument();
      expect(screen.getByText('🧪 You\'re seeing our enhanced frequency interface with Rife healing frequencies')).toBeInTheDocument();
    });

    it('should show loading state when no user', () => {
      _mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>);

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
          onVolumeChange={mockOnVolumeChange}
          onDurationChange={mockOnDurationChange}
        />
      );

      expect(screen.getByRole('generic')).toHaveClass('animate-spin');
    });
  });

  describe('Event Tracking - Enhanced Variant', () => {
    beforeEach(() => {
      // Force variant assignment
      const variantUser = { uid: 'a', email: 'variant@test.com' };
      _mockUseAuth.mockReturnValue({ user: variantUser });
    });

    it('should track frequency changes', async () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
          onVolumeChange={mockOnVolumeChange}
          onDurationChange={mockOnDurationChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('rife-frequency-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('rife-frequency-btn'));

      expect(mockOnFrequencyChange).toHaveBeenCalledWith(727);
      
      // Check if tracking was called (via console.info from devConsole)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🧪 AB Test Event:'),
        expect.objectContaining({
          experiment: 'rife-frequency-ui-test',
          variant: 'variant',
          event: 'frequency_selected',
          properties: expect.objectContaining({
            frequency: 727
          })
        })
      );

      consoleSpy.mockRestore();
    });

    it('should track volume changes', async () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
          onVolumeChange={mockOnVolumeChange}
          onDurationChange={mockOnDurationChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('volume-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('volume-btn'));

      expect(mockOnVolumeChange).toHaveBeenCalledWith(0.8);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🧪 AB Test Event:'),
        expect.objectContaining({
          event: 'volume_adjusted',
          properties: expect.objectContaining({
            volume: 0.8
          })
        })
      );

      consoleSpy.mockRestore();
    });

    it('should track experiment impression on mount', async () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
          onVolumeChange={mockOnVolumeChange}
          onDurationChange={mockOnDurationChange}
        />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('🧪 AB Test Event:'),
          expect.objectContaining({
            event: 'experiment_impression',
            variant: 'variant'
          })
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Variant Data Attributes', () => {
    it('should set correct data attributes for variant', async () => {
      const variantUser = { uid: 'a', email: 'variant@test.com' };
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: variantUser });

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
          onVolumeChange={mockOnVolumeChange}
          onDurationChange={mockOnDurationChange}
        />
      );

      await waitFor(() => {
        const variantDiv = screen.getByTestId('ab-test-variant');
        expect(variantDiv).toHaveAttribute('data-variant', 'enhanced');
      });
    });

    it('should set correct data attributes for control', async () => {
      const controlUser = { uid: 'control-user-zzz', email: 'control@test.com' };
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: controlUser });

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
          onVolumeChange={mockOnVolumeChange}
          onDurationChange={mockOnDurationChange}
        />
      );

      await waitFor(() => {
        const controlDiv = screen.getByTestId('ab-test-control');
        expect(controlDiv).toHaveAttribute('data-variant', 'current');
      });
    });
  });
});
