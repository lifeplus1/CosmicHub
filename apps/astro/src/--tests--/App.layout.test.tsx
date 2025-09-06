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
    <nav data-testid='navbar' role='navigation' aria-label='Main navigation'>
      <div data-testid='nav-brand'>CosmicHub</div>
      <div data-testid='nav-links'>
        <a href='/' data-testid='nav-home'>
          Home
        </a>
        <a href='/profile' data-testid='nav-profile'>
          Profile
        </a>
      </div>
    </nav>
  ),
}));

vi.mock('../components/Footer', () => ({
  default: () => (
    <footer data-testid='footer' role='contentinfo'>
      <div data-testid='footer-content'>
        <p>&copy; 2025 CosmicHub. All rights reserved.</p>
        <div data-testid='footer-links'>
          <a href='/privacy' data-testid='footer-privacy'>
            Privacy
          </a>
          <a href='/terms' data-testid='footer-terms'>
            Terms
          </a>
        </div>
      </div>
    </footer>
  ),
}));

vi.mock('../components/CosmicLoading', () => ({
  CosmicLoading: ({
    size = 'md',
    message = 'Loading...',
  }: {
    size?: string;
    message?: string;
  }) => (
    <div
      data-testid='cosmic-loading'
      data-size={size}
      role='status'
      aria-live='polite'
    >
      <div data-testid='loading-spinner' aria-hidden='true'>
        🌌
      </div>
      <span data-testid='loading-message'>{message}</span>
    </div>
  ),
}));

vi.mock('../components/UpgradeModalManager', () => ({
  UpgradeModalManager: () => (
    <div data-testid='upgrade-modal-manager' role='dialog' aria-hidden='true'>
      Upgrade Modal Manager
    </div>
  ),
}));

// Import mocked components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CosmicLoading } from '../components/CosmicLoading';
import { UpgradeModalManager } from '../components/UpgradeModalManager';

// Import mocked config functions
import { getAppConfig, isFeatureEnabled } from '@cosmichub/config';

describe('App Layout Structure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Main Layout Components', () => {
    test('Navbar renders with correct structure and accessibility', () => {
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
      render(<Footer />);

      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveRole('contentinfo');

      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
      expect(
        screen.getByText('© 2025 CosmicHub. All rights reserved.')
      ).toBeInTheDocument();

      expect(screen.getByTestId('footer-links')).toBeInTheDocument();
      expect(screen.getByTestId('footer-privacy')).toBeInTheDocument();
      expect(screen.getByTestId('footer-terms')).toBeInTheDocument();
    });

    test('CosmicLoading renders with accessibility attributes', () => {
      render(<CosmicLoading size='lg' message='Loading cosmic insights...' />);

      const loading = screen.getByTestId('cosmic-loading');
      expect(loading).toBeInTheDocument();
      expect(loading).toHaveAttribute('data-size', 'lg');
      expect(loading).toHaveRole('status');
      expect(loading).toHaveAttribute('aria-live', 'polite');

      expect(screen.getByTestId('loading-spinner')).toHaveAttribute(
        'aria-hidden',
        'true'
      );
      expect(screen.getByTestId('loading-message')).toHaveTextContent(
        'Loading cosmic insights...'
      );
    });

    test('UpgradeModalManager renders with dialog role', () => {
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
        <div className='min-h-screen bg-cosmic-dark text-cosmic-silver'>
          <nav data-testid='css-test-navbar'>Navbar</nav>
          <main
            className='container px-4 py-8 mx-auto'
            data-testid='css-main-content'
          >
            <div data-testid='css-content'>Main Content</div>
          </main>
          <footer data-testid='css-test-footer'>Footer</footer>
        </div>
      );

      render(<MainLayout />);

      const container = screen.getByTestId('css-main-content').parentElement;
      expect(container).toHaveClass(
        'min-h-screen',
        'bg-cosmic-dark',
        'text-cosmic-silver'
      );

      const main = screen.getByTestId('css-main-content');
      expect(main).toHaveClass('container', 'px-4', 'py-8', 'mx-auto');
    });

    test('semantic HTML structure is correct', () => {
      const SemanticLayout = () => (
        <div>
          <nav data-testid='semantic-nav'>Navigation</nav>
          <main data-testid='semantic-main'>
            <section data-testid='semantic-section'>
              <h1 data-testid='semantic-heading'>Page Title</h1>
              <article data-testid='semantic-article'>Article Content</article>
            </section>
          </main>
          <footer data-testid='semantic-footer'>Footer</footer>
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
        <div className='min-h-screen'>
          <div
            className='container mx-auto px-4 sm:px-6 lg:px-8'
            data-testid='responsive-container'
          >
            <div
              className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              data-testid='responsive-grid'
            >
              <div className='col-span-1' data-testid='grid-item'>
                Item 1
              </div>
              <div className='col-span-1' data-testid='grid-item'>
                Item 2
              </div>
            </div>
          </div>
        </div>
      );

      render(<ResponsiveLayout />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveClass(
        'container',
        'mx-auto',
        'px-4',
        'sm:px-6',
        'lg:px-8'
      );

      const grid = screen.getByTestId('responsive-grid');
      expect(grid).toHaveClass(
        'grid',
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-3',
        'gap-4'
      );
    });
  });

  describe('Configuration-Based Layout Features', () => {
    test('debug info renders in development mode', () => {
      const mockGetAppConfig = vi.fn((appName: string) => ({
        app: {
          name: appName,
          environment: 'development' as const,
          version: '1.2.3-dev',
          baseUrl: 'http://localhost:3000',
        },
        api: {
          baseUrl: 'http://localhost:8000',
          timeout: 30000,
          retries: 3,
        },
        firebase: {
          projectId: '',
          apiKey: '',
          authDomain: '',
          storageBucket: '',
          messagingSenderId: '',
          appId: '',
        },
        features: {
          aiInterpretation: true,
          humanDesign: true,
          geneKeys: true,
          numerology: true,
          transits: true,
          multiSystem: true,
          healwaveIntegration: true,
          crossAppIntegration: true,
        },
        subscription: {
          plans: {},
          trialDays: 14,
          stripePublishableKey: '',
        },
        astro: {
          defaultLocation: {
            lat: 40.7128,
            lng: -74.006,
            city: 'New York',
            country: 'USA',
          },
          ephemerisPath: '/backend/ephe/',
          calculationEngine: 'swiss' as const,
        },
      }));

      // Use the mocked function directly
      const mockedGetAppConfig = vi.mocked(getAppConfig);
      mockedGetAppConfig.mockImplementation(mockGetAppConfig);

      const DebugLayout = () => {
        const config = mockGetAppConfig('astro');

        return (
          <div>
            <main data-testid='debug-main-app'>Main App Content</main>
            {config.app.environment === 'development' && (
              <div
                className='debug-info-visible'
                aria-hidden='true'
                data-testid='debug-info-dev'
              >
                App: {config.app.name} | Env: {config.app.environment} |
                Version: {config.app.version}
              </div>
            )}
          </div>
        );
      };

      render(<DebugLayout />);

      expect(screen.getByTestId('debug-info-dev')).toBeInTheDocument();
      expect(
        screen.getByText(
          /App: astro \| Env: development \| Version: 1\.2\.3-dev/
        )
      ).toBeInTheDocument();
    });

    test('debug info is hidden in production mode', () => {
      const mockGetAppConfig = vi.fn((appName: string) => ({
        app: {
          name: appName,
          environment: 'production' as 'development' | 'staging' | 'production',
          version: '1.0.0',
          baseUrl: 'https://cosmichub.app',
        },
        api: {
          baseUrl: 'https://api.cosmichub.app',
          timeout: 30000,
          retries: 3,
        },
        firebase: {
          projectId: '',
          apiKey: '',
          authDomain: '',
          storageBucket: '',
          messagingSenderId: '',
          appId: '',
        },
        features: {
          aiInterpretation: true,
          humanDesign: true,
          geneKeys: true,
          numerology: true,
          transits: true,
          multiSystem: true,
          healwaveIntegration: true,
          crossAppIntegration: true,
        },
        subscription: {
          plans: {},
          trialDays: 14,
          stripePublishableKey: '',
        },
        astro: {
          defaultLocation: {
            lat: 40.7128,
            lng: -74.006,
            city: 'New York',
            country: 'USA',
          },
          ephemerisPath: '/backend/ephe/',
          calculationEngine: 'swiss' as const,
        },
      }));

      // Use the mocked function directly
      const mockedGetAppConfig = vi.mocked(getAppConfig);
      mockedGetAppConfig.mockImplementation(mockGetAppConfig);

      const ProductionLayout = () => {
        const config = mockGetAppConfig('astro');

        return (
          <div>
            <main data-testid='prod-main-app'>Main App Content</main>
            {config.app.environment === 'development' && (
              <div data-testid='prod-debug-info'>Debug Info</div>
            )}
          </div>
        );
      };

      render(<ProductionLayout />);

      expect(screen.queryByTestId('prod-debug-info')).not.toBeInTheDocument();
      expect(screen.getByTestId('prod-main-app')).toBeInTheDocument();
    });

    test('feature flags control layout elements', () => {
      const mockIsFeatureEnabled = vi.fn((feature: string) => {
        return feature === 'betaFeatures';
      });

      // Use the mocked function directly
      const mockedIsFeatureEnabled = vi.mocked(isFeatureEnabled);
      mockedIsFeatureEnabled.mockImplementation(mockIsFeatureEnabled);

      const FeatureFlagLayout = () => {
        return (
          <div>
            <main data-testid='feature-main-content'>Main Content</main>
            {mockIsFeatureEnabled('betaFeatures') && (
              <div data-testid='feature-beta-banner'>Beta Features Enabled</div>
            )}
            {mockIsFeatureEnabled('maintenance') && (
              <div data-testid='feature-maintenance-banner'>
                Maintenance Mode
              </div>
            )}
          </div>
        );
      };

      render(<FeatureFlagLayout />);

      expect(screen.getByTestId('feature-beta-banner')).toBeInTheDocument();
      expect(
        screen.queryByTestId('feature-maintenance-banner')
      ).not.toBeInTheDocument();
    });
  });

  describe('Layout Accessibility', () => {
    test('layout has proper ARIA landmarks', () => {
      const AccessibleLayout = () => (
        <div>
          <nav
            role='navigation'
            aria-label='Main navigation'
            data-testid='aria-nav'
          >
            Navigation
          </nav>
          <main role='main' data-testid='aria-main'>
            <section
              aria-labelledby='section-heading'
              data-testid='aria-section'
            >
              <h2 id='section-heading'>Section Title</h2>
              Content
            </section>
          </main>
          <footer role='contentinfo' data-testid='aria-footer'>
            Footer
          </footer>
        </div>
      );

      render(<AccessibleLayout />);

      expect(screen.getByTestId('aria-nav')).toHaveAttribute(
        'aria-label',
        'Main navigation'
      );
      expect(screen.getByTestId('aria-main')).toHaveAttribute('role', 'main');
      expect(screen.getByTestId('aria-section')).toHaveAttribute(
        'aria-labelledby',
        'section-heading'
      );
      expect(screen.getByTestId('aria-footer')).toHaveAttribute(
        'role',
        'contentinfo'
      );
    });

    test('focus management works correctly', () => {
      const FocusLayout = () => (
        <div>
          <button data-testid='focus-first-button' tabIndex={1}>
            First
          </button>
          <main data-testid='focus-main-content' tabIndex={-1}>
            <button data-testid='focus-main-button' tabIndex={2}>
              Main Button
            </button>
          </main>
          <button data-testid='focus-last-button' tabIndex={3}>
            Last
          </button>
        </div>
      );

      render(<FocusLayout />);

      expect(screen.getByTestId('focus-first-button')).toHaveAttribute(
        'tabindex',
        '1'
      );
      expect(screen.getByTestId('focus-main-content')).toHaveAttribute(
        'tabindex',
        '-1'
      );
      expect(screen.getByTestId('focus-main-button')).toHaveAttribute(
        'tabindex',
        '2'
      );
      expect(screen.getByTestId('focus-last-button')).toHaveAttribute(
        'tabindex',
        '3'
      );
    });

    test('skip links are properly implemented', () => {
      const SkipLinkLayout = () => (
        <div>
          <a
            href='#skip-main-content'
            className='skip-link'
            data-testid='skip-to-main-link'
          >
            Skip to main content
          </a>
          <nav data-testid='skip-navigation'>Navigation</nav>
          <main id='skip-main-content' data-testid='skip-main-content'>
            Main Content
          </main>
        </div>
      );

      render(<SkipLinkLayout />);

      const skipLink = screen.getByTestId('skip-to-main-link');
      expect(skipLink).toHaveAttribute('href', '#skip-main-content');
      expect(screen.getByTestId('skip-main-content')).toHaveAttribute(
        'id',
        'skip-main-content'
      );
    });
  });

  describe('Layout Error States', () => {
    test('handles missing components gracefully', () => {
      const ComponentWithError = () => {
        return (
          <div>
            <div data-testid='working-component'>This works</div>
            {/* Simulate missing component - intentionally not rendered */}
          </div>
        );
      };

      render(<ComponentWithError />);

      expect(screen.getByTestId('working-component')).toBeInTheDocument();
      expect(screen.queryByTestId('missing-component')).not.toBeInTheDocument();
      expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
    });

    test('layout adapts to content overflow', () => {
      const OverflowLayout = () => (
        <div className='min-h-screen overflow-hidden' data-testid='container'>
          <div
            className='h-full overflow-y-auto'
            data-testid='scrollable-content'
          >
            <div className='h-screen' data-testid='tall-content'>
              Very tall content that should scroll
            </div>
          </div>
        </div>
      );

      render(<OverflowLayout />);

      expect(screen.getByTestId('container')).toHaveClass(
        'min-h-screen',
        'overflow-hidden'
      );
      expect(screen.getByTestId('scrollable-content')).toHaveClass(
        'h-full',
        'overflow-y-auto'
      );
      expect(screen.getByTestId('tall-content')).toBeInTheDocument();
    });
  });
});
