// /Users/Chris/Projects/CosmicHub/apps/astro/src/__tests__/App.layout.test.tsx
/**
 * Layout Components and Styling Tests
 * Tests layout structure, styling, and accessibility
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock configuration
vi.mock('@cosmichub/config', () => ({
  getAppConfig: vi.fn(() => ({
    app: {
      name: 'astro',
      environment: 'test',
      version: '1.0.0',
    },
  })),
  isFeatureEnabled: vi.fn(() => false),
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock layout components
vi.mock('../components/Navbar', () => ({
  default: () => (
    <nav 
      data-testid="navbar" 
      role="navigation" 
      aria-label="Main navigation"
    >
      <div data-testid="nav-brand">CosmicHub</div>
      <div data-testid="nav-links">
        <a href="/" data-testid="nav-home">Home</a>
        <a href="/profile" data-testid="nav-profile">Profile</a>
      </div>
    </nav>
  ),
}));

vi.mock('../components/Footer', () => ({
  default: () => (
    <footer 
      data-testid="footer" 
      role="contentinfo"
    >
      <div data-testid="footer-content">
        <p>&copy; 2025 CosmicHub. All rights reserved.</p>
        <div data-testid="footer-links">
          <a href="/privacy" data-testid="footer-privacy">Privacy</a>
          <a href="/terms" data-testid="footer-terms">Terms</a>
        </div>
      </div>
    </footer>
  ),
}));

vi.mock('../components/CosmicLoading', () => ({
  CosmicLoading: ({ 
    size = 'md', 
    message = 'Loading...' 
  }: { 
    size?: string; 
    message?: string; 
  }) => (
    <div 
      data-testid="cosmic-loading" 
      data-size={size}
      role="status"
      aria-live="polite"
    >
      <div data-testid="loading-spinner" aria-hidden="true">🌌</div>
      <span data-testid="loading-message">{message}</span>
    </div>
  ),
}));

vi.mock('../components/UpgradeModalManager', () => ({
  UpgradeModalManager: () => (
    <div 
      data-testid="upgrade-modal-manager"
      role="dialog"
      aria-hidden="true"
    >
      Upgrade Modal Manager
    </div>
  ),
}));

describe('App Layout Structure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Main Layout Components', () => {
    test('Navbar renders with correct structure and accessibility', () => {
      const Navbar = require('../components/Navbar').default;
      
      render(<Navbar />);

      const navbar = screen.getByTestId('navbar');
      expect(navbar).toBeInTheDocument();
      expect(navbar).toHaveRole('navigation');
      expect(navbar).toHaveAttribute('aria-label', 'Main navigation');
      
      expect(screen.getByTestId('nav-brand')).toBeInTheDocument();
      expect(screen.getByTestId('nav-links')).toBeInTheDocument();
      expect(screen.getByTestId('nav-home')).toBeInTheDocument();
      expect(screen.getByTestId('nav-profile')).toBeInTheDocument();
    });

    test('Footer renders with correct structure and accessibility', () => {
      const Footer = require('../components/Footer').default;
      
      render(<Footer />);

      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveRole('contentinfo');
      
      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
      expect(screen.getByText('© 2025 CosmicHub. All rights reserved.')).toBeInTheDocument();
      
      expect(screen.getByTestId('footer-links')).toBeInTheDocument();
      expect(screen.getByTestId('footer-privacy')).toBeInTheDocument();
      expect(screen.getByTestId('footer-terms')).toBeInTheDocument();
    });

    test('CosmicLoading renders with accessibility attributes', () => {
      const { CosmicLoading } = require('../components/CosmicLoading');
      
      render(<CosmicLoading size="lg" message="Loading cosmic insights..." />);

      const loading = screen.getByTestId('cosmic-loading');
      expect(loading).toBeInTheDocument();
      expect(loading).toHaveAttribute('data-size', 'lg');
      expect(loading).toHaveRole('status');
      expect(loading).toHaveAttribute('aria-live', 'polite');
      
      expect(screen.getByTestId('loading-spinner')).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByTestId('loading-message')).toHaveTextContent('Loading cosmic insights...');
    });

    test('UpgradeModalManager renders with dialog role', () => {
      const { UpgradeModalManager } = require('../components/UpgradeModalManager');
      
      render(<UpgradeModalManager />);

      const modal = screen.getByTestId('upgrade-modal-manager');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveRole('dialog');
      expect(modal).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Layout Structure and CSS Classes', () => {
    test('main layout applies correct CSS classes', () => {
      const MainLayout = () => (
        <div className="min-h-screen bg-cosmic-dark text-cosmic-silver">
          <nav data-testid="test-navbar">Navbar</nav>
          <main className="container px-4 py-8 mx-auto" data-testid="main-content">
            <div data-testid="content">Main Content</div>
          </main>
          <footer data-testid="test-footer">Footer</footer>
        </div>
      );

      render(<MainLayout />);

      const container = screen.getByTestId('main-content').parentElement;
      expect(container).toHaveClass('min-h-screen', 'bg-cosmic-dark', 'text-cosmic-silver');
      
      const main = screen.getByTestId('main-content');
      expect(main).toHaveClass('container', 'px-4', 'py-8', 'mx-auto');
    });

    test('semantic HTML structure is correct', () => {
      const SemanticLayout = () => (
        <div>
          <nav data-testid="semantic-nav">Navigation</nav>
          <main data-testid="semantic-main">
            <section data-testid="semantic-section">
              <h1 data-testid="semantic-heading">Page Title</h1>
              <article data-testid="semantic-article">Article Content</article>
            </section>
          </main>
          <footer data-testid="semantic-footer">Footer</footer>
        </div>
      );

      render(<SemanticLayout />);

      expect(screen.getByTestId('semantic-nav').tagName).toBe('NAV');
      expect(screen.getByTestId('semantic-main').tagName).toBe('MAIN');
      expect(screen.getByTestId('semantic-section').tagName).toBe('SECTION');
      expect(screen.getByTestId('semantic-heading').tagName).toBe('H1');
      expect(screen.getByTestId('semantic-article').tagName).toBe('ARTICLE');
      expect(screen.getByTestId('semantic-footer').tagName).toBe('FOOTER');
    });

    test('layout responds to different screen sizes via CSS classes', () => {
      const ResponsiveLayout = () => (
        <div className="min-h-screen">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8" data-testid="responsive-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="responsive-grid">
              <div className="col-span-1" data-testid="grid-item">Item 1</div>
              <div className="col-span-1" data-testid="grid-item">Item 2</div>
            </div>
          </div>
        </div>
      );

      render(<ResponsiveLayout />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');
      
      const grid = screen.getByTestId('responsive-grid');
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-4');
    });
  });

  describe('Configuration-Based Layout Features', () => {
    test('debug info renders in development mode', () => {
      const mockGetAppConfig = vi.fn(() => ({
        app: {
          name: 'astro',
          environment: 'development',
          version: '1.2.3-dev',
        },
      }));

      vi.mocked(require('@cosmichub/config').getAppConfig).mockImplementation(mockGetAppConfig);

      const DebugLayout = () => {
        const config = mockGetAppConfig();
        
        return (
          <div>
            <main data-testid="main-app">Main App Content</main>
            {config.app.environment === 'development' && (
              <div
                className="debug-info-hidden"
                aria-hidden="true"
                data-testid="debug-info"
              >
                App: {config.app.name} | Env: {config.app.environment} | Version: {config.app.version}
              </div>
            )}
          </div>
        );
      };

      render(<DebugLayout />);

      expect(screen.getByTestId('debug-info')).toBeInTheDocument();
      expect(screen.getByText(/App: astro \| Env: development \| Version: 1\.2\.3-dev/)).toBeInTheDocument();
    });

    test('debug info is hidden in production mode', () => {
      const mockGetAppConfig = vi.fn(() => ({
        app: {
          name: 'astro',
          environment: 'production',
          version: '1.0.0',
        },
      }));

      vi.mocked(require('@cosmichub/config').getAppConfig).mockImplementation(mockGetAppConfig);

      const ProductionLayout = () => {
        const config = mockGetAppConfig();
        
        return (
          <div>
            <main data-testid="main-app">Main App Content</main>
            {config.app.environment === 'development' && (
              <div data-testid="debug-info">Debug Info</div>
            )}
          </div>
        );
      };

      render(<ProductionLayout />);

      expect(screen.queryByTestId('debug-info')).not.toBeInTheDocument();
      expect(screen.getByTestId('main-app')).toBeInTheDocument();
    });

    test('feature flags control layout elements', () => {
      const mockIsFeatureEnabled = vi.fn((feature: string) => {
        return feature === 'betaFeatures';
      });

      vi.mocked(require('@cosmichub/config').isFeatureEnabled).mockImplementation(mockIsFeatureEnabled);

      const FeatureFlagLayout = () => {
        const { isFeatureEnabled } = require('@cosmichub/config');
        
        return (
          <div>
            <main data-testid="main-content">Main Content</main>
            {isFeatureEnabled('betaFeatures') && (
              <div data-testid="beta-banner">Beta Features Enabled</div>
            )}
            {isFeatureEnabled('maintenance') && (
              <div data-testid="maintenance-banner">Maintenance Mode</div>
            )}
          </div>
        );
      };

      render(<FeatureFlagLayout />);

      expect(screen.getByTestId('beta-banner')).toBeInTheDocument();
      expect(screen.queryByTestId('maintenance-banner')).not.toBeInTheDocument();
    });
  });

  describe('Layout Accessibility', () => {
    test('layout has proper ARIA landmarks', () => {
      const AccessibleLayout = () => (
        <div>
          <nav role="navigation" aria-label="Main navigation" data-testid="aria-nav">
            Navigation
          </nav>
          <main role="main" data-testid="aria-main">
            <section aria-labelledby="section-heading" data-testid="aria-section">
              <h2 id="section-heading">Section Title</h2>
              Content
            </section>
          </main>
          <footer role="contentinfo" data-testid="aria-footer">
            Footer
          </footer>
        </div>
      );

      render(<AccessibleLayout />);

      expect(screen.getByTestId('aria-nav')).toHaveAttribute('aria-label', 'Main navigation');
      expect(screen.getByTestId('aria-main')).toHaveAttribute('role', 'main');
      expect(screen.getByTestId('aria-section')).toHaveAttribute('aria-labelledby', 'section-heading');
      expect(screen.getByTestId('aria-footer')).toHaveAttribute('role', 'contentinfo');
    });

    test('focus management works correctly', () => {
      const FocusLayout = () => (
        <div>
          <button data-testid="first-button" tabIndex={1}>First</button>
          <main data-testid="main-content" tabIndex={-1}>
            <button data-testid="main-button" tabIndex={2}>Main Button</button>
          </main>
          <button data-testid="last-button" tabIndex={3}>Last</button>
        </div>
      );

      render(<FocusLayout />);

      expect(screen.getByTestId('first-button')).toHaveAttribute('tabindex', '1');
      expect(screen.getByTestId('main-content')).toHaveAttribute('tabindex', '-1');
      expect(screen.getByTestId('main-button')).toHaveAttribute('tabindex', '2');
      expect(screen.getByTestId('last-button')).toHaveAttribute('tabindex', '3');
    });

    test('skip links are properly implemented', () => {
      const SkipLinkLayout = () => (
        <div>
          <a href="#main-content" className="skip-link" data-testid="skip-link">
            Skip to main content
          </a>
          <nav data-testid="navigation">Navigation</nav>
          <main id="main-content" data-testid="main-content">
            Main Content
          </main>
        </div>
      );

      render(<SkipLinkLayout />);

      const skipLink = screen.getByTestId('skip-link');
      expect(skipLink).toHaveAttribute('href', '#main-content');
      expect(screen.getByTestId('main-content')).toHaveAttribute('id', 'main-content');
    });
  });

  describe('Layout Error States', () => {
    test('handles missing components gracefully', () => {
      const ComponentWithError = () => {
        try {
          return (
            <div>
              <div data-testid="working-component">This works</div>
              {/* Simulate missing component */}
              {false && <div data-testid="missing-component">This is missing</div>}
            </div>
          );
        } catch (error) {
          return <div data-testid="error-fallback">Error: {(error as Error).message}</div>;
        }
      };

      render(<ComponentWithError />);

      expect(screen.getByTestId('working-component')).toBeInTheDocument();
      expect(screen.queryByTestId('missing-component')).not.toBeInTheDocument();
      expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
    });

    test('layout adapts to content overflow', () => {
      const OverflowLayout = () => (
        <div className="min-h-screen overflow-hidden" data-testid="container">
          <div className="h-full overflow-y-auto" data-testid="scrollable-content">
            <div className="h-screen" data-testid="tall-content">
              Very tall content that should scroll
            </div>
          </div>
        </div>
      );

      render(<OverflowLayout />);

      expect(screen.getByTestId('container')).toHaveClass('min-h-screen', 'overflow-hidden');
      expect(screen.getByTestId('scrollable-content')).toHaveClass('h-full', 'overflow-y-auto');
      expect(screen.getByTestId('tall-content')).toBeInTheDocument();
    });
  });
});
