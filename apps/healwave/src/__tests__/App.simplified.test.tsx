import React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from '../App';

// Import jest-dom for assertions
import '@testing-library/jest-dom';

// Mock dependencies
vi.mock('@cosmichub/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  SubscriptionProvider: ({ children, appType }: { children: React.ReactNode; appType: string }) => (
    <div data-testid="subscription-provider" data-app-type={appType}>{children}</div>
  ),
}));

vi.mock('@cosmichub/ui', () => ({
  ErrorBoundary: ({ children, level, name }: { children: React.ReactNode; level: string; name: string }) => (
    <div data-testid="error-boundary" data-level={level} data-name={name}>{children}</div>
  ),
}));

vi.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
}));

vi.mock('../components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('../components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('../pages/FrequencyGenerator', () => ({
  default: () => <div data-testid="frequency-generator">Frequency Generator</div>,
}));

vi.mock('../pages/Presets', () => ({
  default: () => <div data-testid="presets">Presets</div>,
}));

vi.mock('../pages/Profile', () => ({
  default: () => <div data-testid="profile">Profile</div>,
}));

vi.mock('../components/TailwindRadixTest', () => ({
  default: () => <div data-testid="tailwind-radix-test">Test</div>,
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
      version: '1.0.0',
    },
  })),
  isFeatureEnabled: vi.fn(() => true),
}));

// Mock window.matchMedia for theme testing
const mockMatchMedia = vi.fn((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe('App Component - Simplified', () => {
  beforeEach(() => {
    // Setup window.matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    // Setup theme-color meta tag
    const metaTag = document.createElement('meta');
    metaTag.name = 'theme-color';
    metaTag.content = '#8b5cf6';
    document.head.appendChild(metaTag);

    vi.clearAllMocks();
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('renders without crashing', async () => {
    let renderResult: ReturnType<typeof render> | null = null;
    
    await act(async () => {
      renderResult = render(<App />);
    });
    
    expect(renderResult?.getByTestId('tooltip-provider')).toBeInTheDocument();
    expect(renderResult?.getByTestId('auth-provider')).toBeInTheDocument();
    expect(renderResult?.getByTestId('subscription-provider')).toBeInTheDocument();
    expect(renderResult?.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('renders with correct provider hierarchy', async () => {
    let renderResult: ReturnType<typeof render> | null = null;
    
    await act(async () => {
      renderResult = render(<App />);
    });
    
    const subscriptionProvider = renderResult?.getByTestId('subscription-provider');
    expect(subscriptionProvider).toHaveAttribute('data-app-type', 'healwave');
    
    const errorBoundary = renderResult?.getByTestId('error-boundary');
    expect(errorBoundary).toHaveAttribute('data-level', 'page');
    expect(errorBoundary).toHaveAttribute('data-name', 'HealWaveApp');
  });

  it('renders main layout components', async () => {
    let renderResult: ReturnType<typeof render> | null = null;
    
    await act(async () => {
      renderResult = render(<App />);
    });
    
    expect(renderResult?.getByTestId('navbar')).toBeInTheDocument();
    expect(renderResult?.getByTestId('footer')).toBeInTheDocument();
    expect(renderResult?.getByRole('main')).toBeInTheDocument();
  });

  it('sets up theme color management on mount', async () => {
    await act(async () => {
      render(<App />);
    });
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  it('handles missing theme color meta tag gracefully', async () => {
    // Remove the meta tag
    document.head.innerHTML = '';
    
    let renderResult: ReturnType<typeof render> | null = null;
    
    await act(async () => {
      renderResult = render(<App />);
    });
    
    // Should not throw error and app should still render
    expect(renderResult?.getByTestId('tooltip-provider')).toBeInTheDocument();
  });
});
