/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Profile from '../pages/Profile';

// Mock auth hook
vi.mock('@cosmichub/auth', () => ({
  useAuth: () => ({
    user: {
      email: 'test@example.com',
      uid: 'test-uid-123',
      emailVerified: true,
      metadata: {
        creationTime: '2024-01-01T00:00:00Z'
      }
    },
    signOut: vi.fn(),
  }),
}));

// Mock UI components
vi.mock('@cosmichub/ui', () => ({
  Card: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div data-testid="card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  ),
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock toast
vi.mock('../components/ToastProvider', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock progress bar
vi.mock('../components/ProgressBar', () => ({
  __esModule: true,
  default: () => <div>Progress Bar</div>,
}));

// Mock lazy component
vi.mock('../components/ChartPreferences', () => ({
  __esModule: true,
  default: () => <div>Chart Preferences</div>,
}));

// Mock subscription types
vi.mock('../types/subscription', () => ({
  COSMICHUB_TIERS: {
    free: { name: 'Free Explorer' }
  }
}));

// Mock Radix UI Tabs
vi.mock('@radix-ui/react-tabs', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  List: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock React Icons
vi.mock('react-icons/fa', () => ({
  FaUser: () => <span>User</span>,
  FaCog: () => <span>Settings</span>,
  FaChartLine: () => <span>Chart</span>,
  FaSave: () => <span>Save</span>,
  FaCreditCard: () => <span>Card</span>,
  FaArrowUp: () => <span>Up</span>,
  FaHistory: () => <span>History</span>,
  FaCalendarAlt: () => <span>Calendar</span>,
}));

describe('Profile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Profile />);
    expect(container).toBeTruthy();
  });

  it('displays user email', () => {
    render(<Profile />);
    expect(screen.getAllByText('test@example.com').length).toBeGreaterThanOrEqual(1);
  });

  it('shows account overview', () => {
    render(<Profile />);
    expect(screen.getAllByText('Account Overview').length).toBeGreaterThanOrEqual(1);
  });
});
