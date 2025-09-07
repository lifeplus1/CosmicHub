import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { act } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach, type Mock } from 'vitest';
import App from '../App';

// Import jest-dom for matchers
import '@testing-library/jest-dom';
vi.mock('@cosmichub/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
  SubscriptionProvider: ({ children, appType }: { children: React.ReactNode; appType: string }) => (
    <div data-testid="subscription-provider" data-app-type={appType}>{children}</div>
  ),
}));

vi.mock('@cosmichub/integrations', () => ({
  useCrossAppStore: () => ({
    addNotification: vi.fn(),
  }),
}));

vi.mock('@cosmichub/config', () => ({
  getAppConfig: vi.fn(() => ({
    app: {
      name: 'healwave',
      environment: 'test',
      version: '1.0.0-test',
    },
  })),
  isFeatureEnabled: vi.fn(() => true),
}));

vi.mock('@cosmichub/ui', () => ({
  ErrorBoundary: ({ children, level, name }: { children: React.ReactNode; level: string; name: string }) => (
    <div data-testid="error-boundary" data-level={level} data-name={name}>{children}</div>
  ),
}));

// Mock lazy-loaded components
vi.mock('../pages/FrequencyGenerator', () => ({
  default: () => <div data-testid="frequency-generator">Frequency Generator Page</div>,
}));

vi.mock('../pages/Presets', () => ({
  default: () => <div data-testid="presets">Presets Page</div>,
}));

vi.mock('../pages/Profile', () => ({
  default: () => <div data-testid="profile">Profile Page</div>,
}));

vi.mock('../components/TailwindRadixTest', () => ({
  default: () => <div data-testid="tailwind-radix-test">Tailwind Radix Test</div>,
}));

vi.mock('../components/Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock('../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

// Mock Radix UI Tooltip
vi.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-provider">{children}</div>,
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

// Mock window.matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  value: mockMatchMedia,
  writable: true,
});

// Mock document.querySelector and documentElement
const mockSetAttribute = vi.fn();
const mockSetProperty = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(document, 'querySelector', {
  value: vi.fn(() => ({
    setAttribute: mockSetAttribute,
  })),
  writable: true,
});

Object.defineProperty(document.documentElement, 'style', {
  value: {
    setProperty: mockSetProperty,
  },
  writable: true,
});

describe('App Component', () => {
  const mockMediaQuery = {
    matches: false,
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    // Reset DOM
    document.head.innerHTML = '';
    const metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    document.head.appendChild(metaThemeColor);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(<App />);
    });
    
    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('subscription-provider')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('renders with correct provider hierarchy', () => {
    render(<App />);
    
    const subscriptionProvider = screen.getByTestId('subscription-provider');
    expect(subscriptionProvider).toHaveAttribute('data-app-type', 'healwave');
    
    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toHaveAttribute('data-level', 'page');
    expect(errorBoundary).toHaveAttribute('data-name', 'HealWaveApp');
  });

  it('renders main layout components', () => {
    render(<App />);
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('displays correct heading and description', () => {
    render(<App />);
    
    expect(screen.getByText('Healwave Frequency Generator')).toBeInTheDocument();
    expect(screen.getByText('Therapeutic sound frequencies for healing and wellness')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<App />);
    
    expect(screen.getByLabelText('Open Astrology App in a new tab')).toBeInTheDocument();
    expect(screen.getByText('Test Tailwind & Radix UI')).toBeInTheDocument();
  });

  it('opens astrology app when button is clicked', () => {
    render(<App />);
    
    const openAstroButton = screen.getByLabelText('Open Astrology App in a new tab');
    fireEvent.click(openAstroButton);
    
    expect(mockWindowOpen).toHaveBeenCalledWith('/astro', '_blank', 'noopener,noreferrer');
  });

  it('sets up theme color management on mount', () => {
    render(<App />);
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('handles light theme color setup', async () => {
    const lightMediaQuery = {
      ...mockMediaQuery,
      matches: false,
    };
    mockMatchMedia.mockReturnValue(lightMediaQuery);
    
    render(<App />);
    
    await waitFor(() => {
      expect(mockSetAttribute).toHaveBeenCalledWith('content', '#8b5cf6');
      expect(mockSetProperty).toHaveBeenCalledWith('--theme-primary', '#8b5cf6');
    });
  });

  it('handles dark theme color setup', async () => {
    const darkMediaQuery = {
      ...mockMediaQuery,
      matches: true,
    };
    mockMatchMedia.mockReturnValue(darkMediaQuery);
    
    render(<App />);
    
    await waitFor(() => {
      expect(mockSetAttribute).toHaveBeenCalledWith('content', '#7c3aed');
      expect(mockSetProperty).toHaveBeenCalledWith('--theme-primary', '#7c3aed');
    });
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(<App />);
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('handles theme change events', () => {
    render(<App />);
    
    const changeHandler = mockAddEventListener.mock.calls[0][1];
    const mockEvent = { matches: true } as MediaQueryListEvent;
    
    act(() => {
      changeHandler(mockEvent);
    });
    
    expect(mockSetAttribute).toHaveBeenCalledWith('content', '#7c3aed');
    expect(mockSetProperty).toHaveBeenCalledWith('--theme-primary', '#7c3aed');
  });

  it('displays development info when in development environment', () => {
    const { getAppConfig } = require('@cosmichub/config');
    (getAppConfig as Mock).mockReturnValue({
      app: {
        name: 'healwave',
        environment: 'development',
        version: '1.0.0-dev',
      },
    });
    
    render(<App />);
    
    expect(screen.getByText('healwave')).toBeInTheDocument();
    expect(screen.getByText('development')).toBeInTheDocument();
    expect(screen.getByText('1.0.0-dev')).toBeInTheDocument();
  });

  it('hides development info in production environment', () => {
    const { getAppConfig } = require('@cosmichub/config');
    (getAppConfig as Mock).mockReturnValue({
      app: {
        name: 'healwave',
        environment: 'production',
        version: '1.0.0',
      },
    });
    
    render(<App />);
    
    expect(screen.queryByText('App:')).not.toBeInTheDocument();
    expect(screen.queryByText('Env:')).not.toBeInTheDocument();
    expect(screen.queryByText('Version:')).not.toBeInTheDocument();
  });

  it('handles missing theme color meta tag gracefully', () => {
    // Remove the meta tag
    document.head.innerHTML = '';
    
    render(<App />);
    
    // Should not throw error and app should still render
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('sends cross-app integration notification when feature is enabled', () => {
    const mockAddNotification = vi.fn();
    const { useCrossAppStore } = require('@cosmichub/integrations');
    const { isFeatureEnabled } = require('@cosmichub/config');
    
    useCrossAppStore.mockReturnValue({
      addNotification: mockAddNotification,
    });
    isFeatureEnabled.mockReturnValue(true);
    
    render(<App />);
    
    expect(mockAddNotification).toHaveBeenCalledWith({
      id: expect.stringMatching(/^healwave-init-\d+$/),
      message: 'Healwave app initialized with cross-app integration',
      type: 'info',
      timestamp: expect.any(Number),
    });
  });

  it('does not send notification when cross-app integration is disabled', () => {
    const mockAddNotification = vi.fn();
    const { useCrossAppStore } = require('@cosmichub/integrations');
    const { isFeatureEnabled } = require('@cosmichub/config');
    
    useCrossAppStore.mockReturnValue({
      addNotification: mockAddNotification,
    });
    isFeatureEnabled.mockReturnValue(false);
    
    render(<App />);
    
    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(<App />);
    
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', 'Main content');
    
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveAttribute('id', 'app-title');
    
    const section = title.closest('section');
    expect(section).toHaveAttribute('aria-labelledby', 'app-title');
  });

  it('contains Suspense component with loading fallback', () => {
    render(<App />);
    
    // Check that the main element exists (which contains the Suspense)
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });
});
