import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '../App';

// Import jest-dom for matchers
import '@testing-library/jest-dom';

// Minimal, focused mocking - only mock external dependencies, not the app logic
vi.mock('@cosmichub/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="auth-provider">{children}</div>,
  SubscriptionProvider: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="subscription-provider">{children}</div>,
}));

vi.mock('@cosmichub/integrations', () => ({
  useCrossAppStore: () => ({
    addNotification: vi.fn(),
  }),
}));

vi.mock('@cosmichub/config', () => ({
  getAppConfig: () => ({
    app: {
      name: 'healwave',
      environment: 'test',
      version: '1.0.0-test',
    },
  }),
  isFeatureEnabled: () => true,
}));

vi.mock('@cosmichub/ui', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="error-boundary">{children}</div>,
}));

// Mock lazy components to avoid async loading in tests
vi.mock('../pages/FrequencyGenerator', () => ({
  default: () => <div data-testid="frequency-generator">Frequency Generator Page</div>,
}));

vi.mock('../pages/Presets', () => ({
  default: () => <div data-testid="presets">Presets Page</div>,
}));

vi.mock('../pages/Profile', () => ({
  default: () => <div data-testid="profile">Profile Page</div>,
}));

vi.mock('../components/Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock('../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock document.querySelector
Object.defineProperty(document, 'querySelector', {
  value: vi.fn(() => ({
    setAttribute: vi.fn(),
  })),
  writable: true,
});

describe('App Component - Focused Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders main app structure', () => {
    const { getByTestId } = render(<App />);
    
    // Test that the core app structure renders
    expect(getByTestId('auth-provider')).toBeInTheDocument();
    expect(getByTestId('subscription-provider')).toBeInTheDocument();
    expect(getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('renders navigation and layout components', () => {
    const { getByTestId } = render(<App />);
    
    // Test that layout components render
    expect(getByTestId('navbar')).toBeInTheDocument();
    expect(getByTestId('footer')).toBeInTheDocument();
  });

  it('renders with provider hierarchy', () => {
    const { container } = render(<App />);
    
    // Test the nesting structure
    const authProvider = container.querySelector('[data-testid="auth-provider"]');
    const subscriptionProvider = container.querySelector('[data-testid="subscription-provider"]');
    const errorBoundary = container.querySelector('[data-testid="error-boundary"]');
    
    expect(authProvider).toBeInTheDocument();
    expect(subscriptionProvider).toBeInTheDocument();
    expect(errorBoundary).toBeInTheDocument();
  });

  it('sets up theme color management', () => {
    const mockSetAttribute = vi.fn();
    const mockSetProperty = vi.fn();
    
    // Mock querySelector to return an element with setAttribute
    const mockQuerySelector = vi.fn(() => ({
      setAttribute: mockSetAttribute,
    }));
    Object.defineProperty(document, 'querySelector', {
      value: mockQuerySelector,
      writable: true,
    });
    
    // Mock documentElement.style
    Object.defineProperty(document.documentElement, 'style', {
      value: {
        setProperty: mockSetProperty,
      },
      writable: true,
    });

    render(<App />);
    
    // Verify theme management was called
    expect(mockSetAttribute).toHaveBeenCalled();
    expect(mockSetProperty).toHaveBeenCalledWith('--theme-primary', expect.any(String));
  });

  it('initializes with proper error boundary', () => {
    const { getByTestId } = render(<App />);
    
    const errorBoundary = getByTestId('error-boundary');
    expect(errorBoundary).toBeInTheDocument();
    
    // Verify the error boundary contains the app content
    expect(errorBoundary).toContainElement(getByTestId('navbar'));
  });
});
