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
  default: ({ onFrequencyChange }: { onFrequencyChange?: (_freq: number) => void }) => (
    <div data-testid="frequency-controls-current">
      Current Controls
      <button onClick={() => onFrequencyChange?.(528)} data-testid="basic-frequency-btn">
        528 Hz Basic
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

  beforeEach(() => {
    vi.clearAllMocks();
    _mockUseAuth.mockReturnValue({ user: mockUser } as ReturnType<typeof useAuth>);
  });

  describe('User Assignment', () => {
    it('should assign users consistently to control variant', async () => {
      // Mock user with hash that should map to control (hash % 100 < 50)
      const controlUser = { uid: '1', email: 'control@test.com' };
      _mockUseAuth.mockReturnValue({ user: controlUser } as ReturnType<typeof useAuth>);

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('ab-test-control')).toBeInTheDocument();
      });

      expect(screen.getByTestId('frequency-controls-current')).toBeInTheDocument();
      expect(screen.getByText('🎵 Current frequency interface')).toBeInTheDocument();
    });

    it('should assign users consistently to variant', async () => {
      // Mock user with hash that should map to variant (hash % 100 >= 50)
      const variantUser = { uid: '2', email: 'variant@test.com' };
      _mockUseAuth.mockReturnValue({ user: variantUser } as ReturnType<typeof useAuth>);

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('ab-test-variant')).toBeInTheDocument();
      });

      expect(screen.getByTestId('frequency-controls-current')).toBeInTheDocument();
      expect(screen.getByText('🧪 You\'re seeing our enhanced frequency interface with Rife healing frequencies')).toBeInTheDocument();
    });

    it('should show loading state when no user', () => {
      _mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>);

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
        />
      );

      expect(screen.getByRole('status')).toHaveClass('animate-spin');
    });
  });

  describe('Event Tracking - Basic Variant', () => {
    beforeEach(() => {
      // Force variant assignment
      const variantUser = { uid: '2', email: 'variant@test.com' };
      _mockUseAuth.mockReturnValue({ user: variantUser });
    });

    it('should track frequency changes', async () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('basic-frequency-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('basic-frequency-btn'));

      expect(mockOnFrequencyChange).toHaveBeenCalledWith(528);
      
      // Check if tracking was called (via console.info from devConsole)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🧪 AB Test Event:'),
        expect.objectContaining({
          experiment: 'rife-frequency-ui-test',
          variant: 'variant',
          event: 'frequency_selected',
          properties: expect.objectContaining({
            frequency: 528
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
      const variantUser = { uid: '2', email: 'variant@test.com' };
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: variantUser });

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
        />
      );

      await waitFor(() => {
        const variantDiv = screen.getByTestId('ab-test-variant');
        expect(variantDiv).toHaveAttribute('data-variant', 'enhanced');
      });
    });

    it('should set correct data attributes for control', async () => {
      const controlUser = { uid: '1', email: 'control@test.com' };
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: controlUser });

      render(
        <RifeFrequencyABTest
          onFrequencyChange={mockOnFrequencyChange}
        />
      );

      await waitFor(() => {
        const controlDiv = screen.getByTestId('ab-test-control');
        expect(controlDiv).toHaveAttribute('data-variant', 'current');
      });
    });
  });
});
