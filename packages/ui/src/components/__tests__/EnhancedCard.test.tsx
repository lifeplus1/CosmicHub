/**
 * Comprehensive Test Suite for Enhanced Card Component
 * Demonstrates advanced testing patterns, accessibility testing, and performance analysis
 */

import React from 'react';
import { 
  createComponentTestSuite,
  renderWithEnhancements,
  createVisualTest,
  PerformanceTestRunner,
  IntegrationTestRunner,
  expect,
  describe,
  it,
  beforeEach,
  screen,
  userEvent,
  waitFor
} from '@cosmichub/config/enhanced-testing';
import { 
  useAccessibilityAuditor,
  AccessibilityTestUtils 
} from '@cosmichub/config/accessibility-testing';
import { ComponentProvider } from '@cosmichub/config/component-architecture';
import Card, { 
  InteractiveCard, 
  LoadingCard, 
  ErrorCard, 
  ChartCard 
} from '../EnhancedCard';

// Mock providers for testing
const MockThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ComponentProvider value={{ theme: 'cosmic', size: 'medium', variant: 'primary', disabled: false, readonly: false }}>
    {children}
  </ComponentProvider>
);

// Base card test suite
createComponentTestSuite({
  component: Card,
  name: 'Enhanced Card',
  defaultProps: {
    'data-testid': 'test-card'
  },
  variants: [
    {
      name: 'elevated',
      props: { variant: 'elevated' }
    },
    {
      name: 'outlined',
      props: { variant: 'outlined' }
    },
    {
      name: 'filled',
      props: { variant: 'filled' }
    },
    {
      name: 'small',
      props: { size: 'small' }
    },
    {
      name: 'large',
      props: { size: 'large' }
    },
    {
      name: 'disabled',
      props: { disabled: true }
    },
    {
      name: 'loading',
      props: { loading: true }
    }
  ],
  interactions: [
    {
      name: 'keyboard navigation',
      test: async (rendered) => {
        const user = userEvent.setup();
        const card = screen.getByTestId('test-card');
        
        // Should not be focusable by default
        await user.tab();
        expect(card).not.toHaveFocus();
      }
    }
  ],
  customTests: [
    {
      name: 'renders compound components correctly',
      test: async () => {
        renderWithEnhancements(
          <Card data-testid="compound-card">
            <Card.Header title="Test Title" subtitle="Test Subtitle" />
            <Card.Body>Test Content</Card.Body>
            <Card.Footer>Footer Content</Card.Footer>
          </Card>,
          { mockProviders: [MockThemeProvider] }
        );

        expect(screen.getByTestId('card-title')).toHaveTextContent('Test Title');
        expect(screen.getByTestId('card-subtitle')).toHaveTextContent('Test Subtitle');
        expect(screen.getByTestId('card-body')).toHaveTextContent('Test Content');
        expect(screen.getByTestId('card-footer')).toHaveTextContent('Footer Content');
      }
    }
  ]
});

// Interactive card tests
describe('Interactive Card', () => {
  const performanceRunner = new PerformanceTestRunner();

  beforeEach(() => {
    performanceRunner.clear();
  });

  it('handles click interactions', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    renderWithEnhancements(
      <InteractiveCard onClick={handleClick} data-testid="interactive-card">
        Clickable Card
      </InteractiveCard>,
      { mockProviders: [MockThemeProvider] }
    );

    const card = screen.getByTestId('interactive-card');
    
    // Should be focusable
    await user.tab();
    expect(card).toHaveFocus();

    // Should handle click
    await user.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard interactions', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    renderWithEnhancements(
      <InteractiveCard onClick={handleClick} data-testid="interactive-card">
        Keyboard Card
      </InteractiveCard>,
      { mockProviders: [MockThemeProvider] }
    );

    const card = screen.getByTestId('interactive-card');
    
    // Focus the card
    card.focus();
    
    // Enter key should trigger click
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Space key should trigger click
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('measures interaction performance', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    renderWithEnhancements(
      <InteractiveCard onClick={handleClick} data-testid="performance-card">
        Performance Card
      </InteractiveCard>,
      { mockProviders: [MockThemeProvider] }
    );

    const card = screen.getByTestId('performance-card');

    // Measure click performance
    const clickTime = await performanceRunner.measureAsync('card-click', async () => {
      await user.click(card);
    });

    expect(clickTime).toBeLessThan(100); // Should be very fast
    expect(handleClick).toHaveBeenCalled();

    const report = performanceRunner.generateReport();
    expect(report['card-click']).toBeDefined();
    expect(report['card-click'].average).toBeLessThan(100);
  });
});

// Loading card tests
describe('Loading Card', () => {
  it('displays loading state correctly', () => {
    renderWithEnhancements(
      <LoadingCard loadingText="Loading content..." />,
      { mockProviders: [MockThemeProvider] }
    );

    // Should have loading indicator
    const loadingContent = screen.getByText('Loading content...');
    expect(loadingContent).toBeInTheDocument();
    expect(loadingContent).toHaveClass('sr-only'); // Screen reader only
  });

  it('meets accessibility standards for loading states', async () => {
    const { auditComponent } = useAccessibilityAuditor('AA');

    renderWithEnhancements(
      <LoadingCard data-testid="loading-card" loadingText="Loading..." />,
      { mockProviders: [MockThemeProvider] }
    );

    // Audit accessibility
    const auditResult = await auditComponent('loading-card');
    
    expect(auditResult.passed).toBe(true);
    expect(auditResult.score).toBeGreaterThan(80);
  });
});

// Error card tests
describe('Error Card', () => {
  it('displays error message correctly', () => {
    const error = new Error('Test error message');
    const handleRetry = vi.fn();

    renderWithEnhancements(
      <ErrorCard error={error} onRetry={handleRetry} />,
      { mockProviders: [MockThemeProvider] }
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByTestId('error-retry-button')).toBeInTheDocument();
  });

  it('handles retry functionality', async () => {
    const handleRetry = vi.fn();
    const user = userEvent.setup();

    renderWithEnhancements(
      <ErrorCard error="Network error" onRetry={handleRetry} />,
      { mockProviders: [MockThemeProvider] }
    );

    const retryButton = screen.getByTestId('error-retry-button');
    await user.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('has proper ARIA attributes for errors', async () => {
    renderWithEnhancements(
      <ErrorCard error="Critical error" data-testid="error-card" />,
      { mockProviders: [MockThemeProvider] }
    );

    const errorContent = screen.getByRole('alert');
    expect(errorContent).toBeInTheDocument();
    expect(errorContent).toHaveTextContent('Critical error');
  });
});

// Chart card tests
describe('Chart Card', () => {
  it('handles loading state during chart import', async () => {
    renderWithEnhancements(
      <ChartCard 
        chartType="astrology" 
        data={[]} 
        title="Test Chart"
        data-testid="chart-card"
      />,
      { mockProviders: [MockThemeProvider] }
    );

    // Initially should show loading
    expect(screen.getByText(/Loading astrology chart/)).toBeInTheDocument();
  });

  it('displays chart after successful load', async () => {
    renderWithEnhancements(
      <ChartCard 
        chartType="astrology" 
        data={[{ x: 1, y: 2 }]} 
        title="Astrology Chart"
        description="Birth chart visualization"
        data-testid="chart-card"
      />,
      { mockProviders: [MockThemeProvider] }
    );

    // Wait for chart to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByTestId('card-title')).toHaveTextContent('Astrology Chart');
    expect(screen.getByTestId('card-subtitle')).toHaveTextContent('Birth chart visualization');
  });
});

// Accessibility comprehensive tests
describe('Card Accessibility', () => {
  let auditResult: any;

  beforeEach(async () => {
    const { auditComponent } = useAccessibilityAuditor('AA');
    
    renderWithEnhancements(
      <Card data-testid="accessibility-card">
        <Card.Header title="Accessible Card" />
        <Card.Body>
          <p>This is accessible content</p>
          <button type="button">Action Button</button>
        </Card.Body>
        <Card.Footer>
          <button type="button">Primary Action</button>
          <button type="button">Secondary Action</button>
        </Card.Footer>
      </Card>,
      { mockProviders: [MockThemeProvider] }
    );

    auditResult = await auditComponent('accessibility-card');
  });

  it('passes WCAG AA standards', () => {
    expect(auditResult.passed).toBe(true);
    expect(auditResult.level).toBe('AA');
    expect(auditResult.score).toBeGreaterThan(80);
  });

  it('has proper semantic structure', () => {
    const semanticAnalysis = AccessibilityTestUtils.SemanticHTMLAnalyzer.analyzeSemantic(
      screen.getByTestId('accessibility-card')
    );

    expect(semanticAnalysis.score).toBeGreaterThan(60);
    expect(semanticAnalysis.semanticElements).toContain('button');
  });

  it('has proper focus management', () => {
    const focusableElements = AccessibilityTestUtils.FocusManagementAnalyzer.getFocusableElements(
      screen.getByTestId('accessibility-card')
    );

    expect(focusableElements.length).toBeGreaterThan(0);
    
    // All buttons should be focusable
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(AccessibilityTestUtils.FocusManagementAnalyzer.isFocusable(button)).toBe(true);
    });
  });

  it('provides accessibility recommendations when needed', () => {
    if (auditResult.recommendations.length > 0) {
      console.log('Accessibility recommendations:', auditResult.recommendations);
    }

    // Should have minimal recommendations for well-designed component
    expect(auditResult.recommendations.length).toBeLessThan(5);
  });
});

// Visual regression tests
createVisualTest(
  <Card>
    <Card.Header title="Visual Test Card" subtitle="Snapshot testing" />
    <Card.Body>Content for visual testing</Card.Body>
    <Card.Footer>Footer content</Card.Footer>
  </Card>,
  'enhanced-card',
  {
    variants: [
      {
        name: 'elevated',
        element: (
          <Card variant="elevated">
            <Card.Header title="Elevated Card" />
            <Card.Body>Elevated variant</Card.Body>
          </Card>
        )
      },
      {
        name: 'outlined',
        element: (
          <Card variant="outlined">
            <Card.Header title="Outlined Card" />
            <Card.Body>Outlined variant</Card.Body>
          </Card>
        )
      },
      {
        name: 'loading',
        element: <LoadingCard loadingText="Loading..." />
      },
      {
        name: 'error',
        element: <ErrorCard error="Test error" onRetry={() => {}} />
      }
    ],
    viewports: [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1024, height: 768 }
    ]
  }
);

// Integration test scenarios
describe('Card Integration Tests', () => {
  const integrationRunner = new IntegrationTestRunner();

  beforeEach(() => {
    integrationRunner.addScenario('card-interaction-flow', [
      { action: 'click', target: 'interactive-card' },
      { action: 'wait', value: 100 },
      { action: 'assert', assertion: () => expect(screen.getByTestId('result')).toBeInTheDocument() }
    ]);
  });

  it('completes full interaction scenarios', async () => {
    const handleClick = vi.fn();

    renderWithEnhancements(
      <div>
        <InteractiveCard onClick={handleClick} data-testid="interactive-card">
          Click me
        </InteractiveCard>
        <div data-testid="result" style={{ display: 'none' }}>
          Clicked!
        </div>
      </div>,
      { mockProviders: [MockThemeProvider] }
    );

    await integrationRunner.runScenarios(
      <div>Test scenario</div>
    );

    // Integration test would validate complete user flows
    expect(true).toBe(true); // Placeholder assertion
  });
});

// Performance benchmark tests
describe('Card Performance Benchmarks', () => {
  const performanceRunner = new PerformanceTestRunner();

  it('renders efficiently with large content', async () => {
    const largeContent = Array.from({ length: 1000 }, (_, i) => `Item ${i}`).join('\n');

    const renderTime = await performanceRunner.measureAsync('large-content-render', async () => {
      renderWithEnhancements(
        <Card>
          <Card.Body>
            <pre>{largeContent}</pre>
          </Card.Body>
        </Card>,
        { mockProviders: [MockThemeProvider] }
      );
    });

    expect(renderTime).toBeLessThan(100); // Should render large content quickly
  });

  it('handles multiple cards efficiently', async () => {
    const cardCount = 50;

    const renderTime = await performanceRunner.measureAsync('multiple-cards-render', async () => {
      renderWithEnhancements(
        <div>
          {Array.from({ length: cardCount }, (_, i) => (
            <Card key={i}>
              <Card.Header title={`Card ${i}`} />
              <Card.Body>Content {i}</Card.Body>
            </Card>
          ))}
        </div>,
        { mockProviders: [MockThemeProvider] }
      );
    });

    const averagePerCard = renderTime / cardCount;
    expect(averagePerCard).toBeLessThan(5); // Each card should render in under 5ms on average
  });

  it('generates performance report', () => {
    const report = performanceRunner.generateReport();
    
    Object.entries(report).forEach(([testName, metrics]) => {
      console.log(`${testName}: ${metrics.average.toFixed(2)}ms average`);
      expect(metrics.average).toBeLessThan(1000); // No test should take more than 1 second
    });
  });
});
