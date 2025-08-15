import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../pages/Profile';

// Mock dependencies
vi.mock('@cosmichub/auth', () => ({
  useAuth: vi.fn(() => ({
    user: {
      email: 'test@example.com',
      uid: 'test-uid-123',
      emailVerified: true,
      metadata: {
        creationTime: '2024-01-01T00:00:00Z'
      }
    },
    signOut: vi.fn(),
  })),
}));

vi.mock('../components/ToastProvider', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

vi.mock('../components/ProgressBar', () => {
  return {
    default: ({ percentage, color }: { percentage: number; color: string }) => (
      <div data-testid="progress-bar" data-percentage={percentage} data-color={color} />
    ),
  };
});

vi.mock('../types/subscription', () => ({
  COSMICHUB_TIERS: {
    free: {
      name: 'Free Explorer',
      description: 'Basic features',
      price: { monthly: 0, yearly: 0 },
      features: [],
      limits: {},
      educationalInfo: { bestFor: [], keyBenefits: [], examples: [], upgradeReasons: [] }
    }
  }
}));

// Lazy loaded component mock
vi.mock('../components/ChartPreferences', () => ({
  default: () => <div data-testid="chart-preferences">Chart Preferences</div>,
}));

const ProfileWrapper = () => (
  <BrowserRouter>
    <Profile />
  </BrowserRouter>
);

describe('Enhanced Profile Component', () => {
  it('renders profile overview with user information', () => {
    render(<ProfileWrapper />);
    
    expect(screen.getByText('test@example.com')).toBeDefined();
    expect(screen.getByText('Free Tier')).toBeDefined();
    expect(screen.getByText('Overview')).toBeDefined();
  });

  it('displays account overview section', () => {
    render(<ProfileWrapper />);
    
    expect(screen.getByText('Account Overview')).toBeDefined();
    expect(screen.getByText('Email')).toBeDefined();
    expect(screen.getByText('Account ID')).toBeDefined();
    expect(screen.getByText('Joined')).toBeDefined();
  });

  it('shows activity summary with user stats', () => {
    render(<ProfileWrapper />);
    
    expect(screen.getByText('Activity Summary')).toBeDefined();
    expect(screen.getByText('Total Charts')).toBeDefined();
    expect(screen.getByText('Charts This Month')).toBeDefined();
    expect(screen.getByText('Saved Charts')).toBeDefined();
  });

  it('includes tabs for navigation', () => {
    render(<ProfileWrapper />);
    
    expect(screen.getByText('Overview')).toBeDefined();
    expect(screen.getByText('Preferences')).toBeDefined();
    expect(screen.getByText('Account')).toBeDefined();
  });

  it('displays upgrade to premium button', () => {
    render(<ProfileWrapper />);
    
    expect(screen.getByText('Upgrade to Premium')).toBeDefined();
  });

  it('shows sign out button', () => {
    render(<ProfileWrapper />);
    
    expect(screen.getByText('Sign Out')).toBeDefined();
  });
});
