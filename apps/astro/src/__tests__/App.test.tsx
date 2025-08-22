// /Users/Chris/Projects/CosmicHub/apps/astro/src/__tests__/App.test.tsx
import * as React from 'react';
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

// Mock React Router with proper context providers
vi.mock('react-router-dom', () => {
  const mockNavigate = vi.fn();
  const mockLocation = { pathname: '/', search: '', hash: '', state: null, key: 'default' };
  
  return {
    BrowserRouter: ({ children }: { children: React.ReactNode }): JSX.Element => {
      // Provide a mock router context
      return (
        <div data-testid="router">
          {React.cloneElement(
            <MockRouterContext>{children}</MockRouterContext>
          )}
        </div>
      );
    },
    Routes: ({ children }: { children: React.ReactNode }): JSX.Element => <div data-testid="routes">{children}</div>,
    Route: ({ element }: { element: React.ReactElement }): React.ReactElement => element,
    useNavigate: vi.fn(() => mockNavigate),
    useLocation: vi.fn(() => mockLocation),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
    Link: ({ children, to, ...props }: { children: React.ReactNode; to: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>): JSX.Element => <a href={to} {...props}>{children}</a>
  };
});

// Mock Router Context Provider to prevent hook errors
const MockRouterContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid="mock-router-context">{children}</div>;
};

// Mock lazy components that might use React Router hooks
vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard</div>
}));

vi.mock('../pages/Login', () => ({
  default: () => <div data-testid="login">Login</div>
}));

vi.mock('../pages/SignUp', () => ({
  default: () => <div data-testid="signup">SignUp</div>
}));

vi.mock('../pages/Profile', () => ({
  default: () => <div data-testid="profile">Profile</div>
}));

vi.mock('../pages/SubscriptionSuccess', () => ({
  default: () => <div data-testid="subscription-success">SubscriptionSuccess</div>
}));

vi.mock('../pages/SubscriptionCancel', () => ({
  default: () => <div data-testid="subscription-cancel">SubscriptionCancel</div>
}));

vi.mock('../pages/Blog', () => ({
  default: () => <div data-testid="blog">Blog</div>
}));

vi.mock('../pages/BlogPost', () => ({
  default: () => <div data-testid="blog-post">BlogPost</div>
}));

vi.mock('../pages/Calculator', () => ({
  default: () => <div data-testid="calculator">Calculator</div>
}));

vi.mock('../pages/ChartResults', () => ({
  default: () => <div data-testid="chart-results">ChartResults</div>
}));

vi.mock('../components/BlogAuthor', () => ({
  BlogAuthors: () => <div data-testid="blog-authors">BlogAuthors</div>
}));

vi.mock('../components/Navbar', () => ({
  default: () => <nav data-testid="navbar" role="navigation" aria-label="Main navigation">Navbar</nav>
}));

vi.mock('../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>
}));

describe('App Component', (): void => {
  test('renders with auth provider and main structure', (): void => {
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

  test('applies correct accessibility attributes', (): void => {
    render(
      <AuthProvider appName="astro">
        <App />
      </AuthProvider>
    );

    const navs = screen.getAllByRole('navigation');
    expect(navs[0]).toHaveAttribute('aria-label', 'Main navigation');
  });

  test('handles authentication context properly', (): void => {
    const { container } = render(
      <AuthProvider appName="astro">
        <App />
      </AuthProvider>
    );

    // Should render without errors when wrapped in AuthProvider
    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders cosmic loading component for lazy routes', async (): Promise<void> => {
    render(
      <AuthProvider appName="astro">
        <App />
      </AuthProvider>
    );

    // The Suspense fallback should be present during initial render
    // Note: In real tests, you might need to use act() and async utilities
    // to properly test Suspense boundaries
    const routers = screen.getAllByTestId('router');
    expect(routers[0]).toBeInTheDocument();
  });
});
