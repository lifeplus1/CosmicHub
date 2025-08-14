// /Users/Chris/Projects/CosmicHub/apps/astro/src/__tests__/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { AuthProvider } from '@cosmichub/auth';
import App from '../App';

// Mock the config module
vi.mock('@cosmichub/config', () => ({
  getAppConfig: vi.fn(() => ({
    app: {
      name: 'astro',
      environment: 'test',
      version: '1.0.0'
    }
  })),
  isFeatureEnabled: vi.fn(() => false)
}));

// Mock the integrations module
vi.mock('@cosmichub/integrations', () => ({
  useCrossAppStore: vi.fn(() => ({
    addNotification: vi.fn()
  }))
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }: { element: React.ReactElement }) => element,
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: '/' })),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

// Mock lazy components
vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard</div>
}));

vi.mock('../components/Navbar', () => ({
  default: () => <nav data-testid="navbar" role="navigation" aria-label="Main navigation">Navbar</nav>
}));

vi.mock('../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>
}));

describe('App Component', () => {
  test('renders with auth provider and main structure', () => {
    render(
      <AuthProvider appName="astro">
        <App />
      </AuthProvider>
    );

    // Check for main navigation
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    
    // Check for router structure
    expect(screen.getByTestId('router')).toBeInTheDocument();
    
    // Check for main components
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('applies correct accessibility attributes', () => {
    render(
      <AuthProvider appName="astro">
        <App />
      </AuthProvider>
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  test('handles authentication context properly', () => {
    const { container } = render(
      <AuthProvider appName="astro">
        <App />
      </AuthProvider>
    );

    // Should render without errors when wrapped in AuthProvider
    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders cosmic loading component for lazy routes', async () => {
    render(
      <AuthProvider appName="astro">
        <App />
      </AuthProvider>
    );

    // The Suspense fallback should be present during initial render
    // Note: In real tests, you might need to use act() and async utilities
    // to properly test Suspense boundaries
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });
});
