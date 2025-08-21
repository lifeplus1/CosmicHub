/**
 * Enhanced Testing Framework for CosmicHub
 * Comprehensive testing utilities for components, hooks, and performance
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
// import { performanceMonitor } from './performance';
// import { ComponentPerformanceAnalyzer } from './component-architecture';

// Mock userEvent for testing framework independence
const mockUserEvent = {
  setup: () => ({
    click: async (element: Element) => {
      fireEvent.click(element);
    },
    type: async (element: Element, text: string) => {
      fireEvent.change(element, { target: { value: text } });
    },
    hover: async (element: Element) => {
      fireEvent.mouseEnter(element);
    },
    unhover: async (element: Element) => {
      fireEvent.mouseLeave(element);
    },
    keyboard: async (keys: string) => {
      // Mock keyboard interactions
      document.dispatchEvent(new KeyboardEvent('keydown', { key: keys }));
    },
    tab: async () => {
      // Mock tab navigation
      const focusableElements = document.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      const currentFocus = document.activeElement;
      const currentIndex = Array.from(focusableElements).indexOf(currentFocus as Element);
      const nextIndex = (currentIndex + 1) % focusableElements.length;
      if (focusableElements[nextIndex]) {
        (focusableElements[nextIndex] as HTMLElement).focus();
      }
    }
  })
};

const userEvent = mockUserEvent;

// Mock ComponentPerformanceAnalyzer for testing
class MockComponentPerformanceAnalyzer {
  private static instance: MockComponentPerformanceAnalyzer;
  private performanceData = new Map<string, Array<{
    metric: string;
    value: number;
    timestamp: number;
  }>>();

  static getInstance(): MockComponentPerformanceAnalyzer {
    if (!MockComponentPerformanceAnalyzer.instance) {
      MockComponentPerformanceAnalyzer.instance = new MockComponentPerformanceAnalyzer();
    }
    return MockComponentPerformanceAnalyzer.instance;
  }

  recordComponentMetric(componentName: string, metric: string, value: number) {
    if (!this.performanceData.has(componentName)) {
      this.performanceData.set(componentName, []);
    }
    this.performanceData.get(componentName)!.push({
      metric,
      value,
      timestamp: Date.now()
    });
  }

  getComponentAnalysis(componentName: string) {
    return this.performanceData.get(componentName) || [];
  }

  generateRecommendations(componentName: string): string[] {
    const data = this.performanceData.get(componentName) || [];
    const recommendations: string[] = [];
    
    data.forEach(entry => {
      if (entry.metric === 'TestRenderTime' && entry.value > 16) {
        recommendations.push(`Consider optimizing ${componentName} render time (${entry.value.toFixed(2)}ms)`);
      }
    });
    
    return recommendations;
  }
}

// Enhanced test utilities
export interface TestConfig {
  performance: boolean;
  accessibility: boolean;
  responsiveness: boolean;
  interactions: boolean;
  errorBoundaries: boolean;
  animations: boolean;
}

const defaultTestConfig: TestConfig = {
  performance: true,
  accessibility: true,
  responsiveness: false,
  interactions: true,
  errorBoundaries: true,
  animations: false
};

// Test wrapper with providers
export interface TestWrapperProps {
  children: React.ReactNode;
  config?: Partial<TestConfig>;
  mockProviders?: React.ComponentType<{ children: React.ReactNode }>[];
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ 
  children, 
  config = {},
  mockProviders = []
}) => {
  const testConfig = { ...defaultTestConfig, ...config };

  // Wrap with mock providers
  let wrappedChildren = children;
  mockProviders.forEach(Provider => {
    wrappedChildren = <Provider>{wrappedChildren}</Provider>;
  });

  // Add test attributes
  const testElement = (
    <div 
      data-testid="test-wrapper"
      data-test-config={JSON.stringify(testConfig)}
    >
      {wrappedChildren}
    </div>
  );

  return testElement;
};

// Enhanced render function
export interface EnhancedRenderOptions {
  config?: Partial<TestConfig>;
  mockProviders?: React.ComponentType<{ children: React.ReactNode }>[];
  initialProps?: any;
  rerender?: boolean;
}

export function renderWithEnhancements(
  component: React.ReactElement,
  options: EnhancedRenderOptions = {}
): ReturnType<typeof render> & {
  measureRenderTime: () => Promise<number>;
  checkAccessibility: () => Promise<{ passed: boolean; issues: string[] }>;
  testInteractions: () => Promise<Array<{ action: string; success: boolean; error?: string }>>;
  testPropsUpdate: (newProps: Record<string, unknown>) => Promise<void>;
  simulateError: () => Promise<unknown>;
  testAnimationPerformance: () => Promise<{ averageFrameTime: number; frames: number; passed: boolean }>;
  getPerformanceMetrics: () => Array<{ metric: string; value: number }>;
  getAccessibilityIssues: () => Promise<string[]>;
  runFullAnalysis: () => Promise<{ performance: { renderTime: number; metrics: { metric: string; value: number }[]; recommendations: string[] }; accessibility: { passed: boolean; issues: string[] }; interactions: { action: string; success: boolean; error?: string }[]; animations: { averageFrameTime: number; passed: boolean } }>;
  testResponsiveness: () => Promise<Array<{ breakpoint: string; width: number; visible: boolean }>>;
} {
  const { config, mockProviders, initialProps, rerender } = options;

  const renderResult = render(
    <TestWrapper config={config} mockProviders={mockProviders}>
      {component}
    </TestWrapper>
  );

  // Enhanced render result with additional utilities
  return {
    ...renderResult,
    
    // Performance testing
    measureRenderTime: async () => {
      const startTime = performance.now();
      renderResult.rerender(
        <TestWrapper config={config} mockProviders={mockProviders}>
          {component}
        </TestWrapper>
      );
      const endTime = performance.now();
      return endTime - startTime;
    },

    // Accessibility testing
    checkAccessibility: async () => {
      const issues: string[] = [];
      
      // Check for required ARIA attributes
      const interactiveElements = renderResult.container.querySelectorAll(
        'button, input, select, textarea, [role="button"], [role="link"], [role="tab"]'
      );
      
      interactiveElements.forEach(element => {
        if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
          issues.push(`Interactive element missing aria-label: ${element.tagName}`);
        }
      });

      // Check for keyboard navigation
      const focusableElements = renderResult.container.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) {
        issues.push('No focusable elements found');
      }

      return { passed: issues.length === 0, issues };
    },

    // Interaction testing
    testInteractions: async () => {
      const user = userEvent.setup();
      const results: { action: string; success: boolean; error?: string }[] = [];

      // Test button clicks
      const buttons = screen.queryAllByRole('button');
      for (const button of buttons) {
        try {
          await user.click(button);
          results.push({ action: `click ${button.textContent}`, success: true });
        } catch (error) {
          results.push({ 
            action: `click ${button.textContent}`, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Test input interactions
      const inputs = screen.queryAllByRole('textbox');
      for (const input of inputs) {
        try {
          await user.type(input, 'test input');
          results.push({ action: `type in ${input.getAttribute('name') || 'input'}`, success: true });
        } catch (error) {
          results.push({ 
            action: `type in ${input.getAttribute('name') || 'input'}`, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;
    },

    // Responsive testing
    testResponsiveness: async () => {
      const breakpoints = [
        { name: 'mobile', width: 375 },
        { name: 'tablet', width: 768 },
        { name: 'desktop', width: 1024 },
        { name: 'large', width: 1440 }
      ];

      const results: { breakpoint: string; width: number; visible: boolean }[] = [];

      for (const { name, width } of breakpoints) {
        // Mock viewport resize
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        window.dispatchEvent(new Event('resize'));

        // Wait for any responsive changes
        await waitFor(() => {}, { timeout: 100 });

        const isVisible = renderResult.container.offsetWidth > 0;
        results.push({ breakpoint: name, width, visible: isVisible });
      }

      return results;
    }
  };
}

// Component test suite generator
export interface ComponentTestSuite<T extends Record<string, any> = Record<string, any>> {
  component: React.ComponentType<T>;
  name: string;
  defaultProps: T;
  variants?: Array<{ name: string; props: Partial<T> }>;
  interactions?: Array<{ name: string; test: (rendered: any) => Promise<void> }>;
  customTests?: Array<{ name: string; test: () => Promise<void> }>;
}

export function createComponentTestSuite<T extends Record<string, any> = Record<string, any>>(suite: ComponentTestSuite<T>) {
  describe(suite.name, () => {
    let performanceAnalyzer: MockComponentPerformanceAnalyzer;

    beforeEach(() => {
      performanceAnalyzer = MockComponentPerformanceAnalyzer.getInstance();
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    // Basic rendering test
    it('renders without crashing', async () => {
      const props = suite.defaultProps;
      const rendered = renderWithEnhancements(React.createElement(suite.component, props));
      
      expect(rendered.container.firstChild).toBeTruthy();
    });

    // Performance test
    it('renders within performance budget', async () => {
      const props = suite.defaultProps;
      const rendered = renderWithEnhancements(React.createElement(suite.component, props), {
        config: { performance: true }
      });

      const renderTime = await rendered.measureRenderTime();
      expect(renderTime).toBeLessThan(16); // 60fps budget

      // Record performance metric
      performanceAnalyzer.recordComponentMetric(suite.name, 'TestRenderTime', renderTime);
    });

    // Accessibility test
    it('meets accessibility standards', async () => {
      const props = suite.defaultProps;
      const rendered = renderWithEnhancements(React.createElement(suite.component, props), {
        config: { accessibility: true }
      });

      const accessibilityResult = await rendered.checkAccessibility();
      
      if (!accessibilityResult.passed) {
        console.warn(`Accessibility issues found in ${suite.name}:`, accessibilityResult.issues);
      }

      expect(accessibilityResult.passed).toBe(true);
    });

    // Variant tests
    if (suite.variants) {
      suite.variants.forEach(variant => {
        it(`renders ${variant.name} variant correctly`, async () => {
          const props = { ...suite.defaultProps, ...variant.props } as T;
          const rendered = renderWithEnhancements(React.createElement(suite.component, props));
          
          expect(rendered.container.firstChild).toBeTruthy();
          
          // Take snapshot for visual regression testing
          expect(rendered.container.firstChild).toMatchSnapshot(`${suite.name}-${variant.name}`);
        });
      });
    }

    // Interaction tests
    if (suite.interactions) {
      suite.interactions.forEach(interaction => {
        it(`handles ${interaction.name} interaction`, async () => {
          const props = suite.defaultProps;
          const rendered = renderWithEnhancements(React.createElement(suite.component, props), {
            config: { interactions: true }
          });

          await interaction.test(rendered);
        });
      });
    }

    // Custom tests
    if (suite.customTests) {
      suite.customTests.forEach(customTest => {
        it(customTest.name, customTest.test);
      });
    }

    // Error boundary test
    it('handles errors gracefully', async () => {
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(
          <TestWrapper config={{ errorBoundaries: true }}>
            <ErrorThrowingComponent />
          </TestWrapper>
        );
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    // Performance analysis summary
    it('provides performance analysis', async () => {
      const analysis = performanceAnalyzer.getComponentAnalysis(suite.name);
      const recommendations = performanceAnalyzer.generateRecommendations(suite.name);

      console.log(`Performance analysis for ${suite.name}:`, analysis);
      
      if (recommendations.length > 0) {
        console.log(`Recommendations for ${suite.name}:`, recommendations);
      }

      // Component should have some performance data
      expect(Object.keys(analysis).length).toBeGreaterThan(0);
    });
  });
}

// Hook testing utilities
export function renderHook<T, P = {}>(
  hook: (props: P) => T,
  options: {
    initialProps?: P;
    mockProviders?: React.ComponentType<{ children: React.ReactNode }>[];
  } = {}
) {
  const { initialProps, mockProviders = [] } = options;
  let result: { current: T } = { current: undefined as any };
  let rerender: (newProps?: P) => void;

  function TestComponent(props: P) {
    result.current = hook(props);
    return null;
  }

  const renderResult = renderWithEnhancements(
    <TestComponent {...(initialProps || {} as any)} />,
    { mockProviders }
  );

  rerender = (newProps?: P) => {
    renderResult.rerender(
      <TestWrapper mockProviders={mockProviders}>
        <TestComponent {...(newProps || initialProps || {} as any)} />
      </TestWrapper>
    );
  };

  return {
    result,
    rerender,
    unmount: renderResult.unmount
  };
}

export interface PerformanceReport {
  [metricName: string]: {
    count: number;
    average: number;
    min: number;
    max: number;
    median: number;
  };
}

// Performance testing utilities
export class PerformanceTestRunner {
  private metrics: Array<{ name: string; value: number; timestamp: number }> = [];

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    this.metrics.push({
      name,
      value: endTime - startTime,
      timestamp: startTime
    });

    return result;
  }

  async measureAsyncTime<T>(name: string, fn: () => Promise<T>): Promise<number> {
    const startTime = performance.now();
    await fn();
    const endTime = performance.now();
    
    const timeElapsed = endTime - startTime;
    this.metrics.push({
      name,
      value: timeElapsed,
      timestamp: startTime
    });

    return timeElapsed;
  }

  measure<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    this.metrics.push({
      name,
      value: endTime - startTime,
      timestamp: startTime
    });

    return result;
  }

  getMetrics() {
    return [...this.metrics];
  }

  getAverageTime(name: string): number {
    const nameMetrics = this.metrics.filter(m => m.name === name);
    if (nameMetrics.length === 0) return 0;
    
    const total = nameMetrics.reduce((sum, m) => sum + m.value, 0);
    return total / nameMetrics.length;
  }

  clear() {
    this.metrics = [];
  }

  generateReport(): PerformanceReport {
    const metricsByName: Record<string, number[]> = {};
    
    this.metrics.forEach(metric => {
      if (!metricsByName[metric.name]) {
        metricsByName[metric.name] = [];
      }
      metricsByName[metric.name].push(metric.value);
    });

    const report: PerformanceReport = {};

    Object.entries(metricsByName).forEach(([name, values]) => {
      report[name] = {
        count: values.length,
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
      };
    });

    return report;
  }
}

// Visual regression testing
export function createVisualTest(
  component: React.ReactElement,
  testName: string,
  options: {
    variants?: Array<{ name: string; element: React.ReactElement }>;
    viewports?: Array<{ name: string; width: number; height: number }>;
  } = {}
) {
  describe(`Visual regression: ${testName}`, () => {
    it('matches visual snapshot', () => {
      const rendered = renderWithEnhancements(component);
      expect(rendered.container.firstChild).toMatchSnapshot(`${testName}-default`);
    });

    if (options.variants) {
      options.variants.forEach(variant => {
        it(`matches visual snapshot for ${variant.name}`, () => {
          const rendered = renderWithEnhancements(variant.element);
          expect(rendered.container.firstChild).toMatchSnapshot(`${testName}-${variant.name}`);
        });
      });
    }

    if (options.viewports) {
      options.viewports.forEach(viewport => {
        it(`matches visual snapshot at ${viewport.name} viewport`, () => {
          // Mock viewport dimensions
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewport.width,
          });
          Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: viewport.height,
          });

          const rendered = renderWithEnhancements(component);
          expect(rendered.container.firstChild).toMatchSnapshot(`${testName}-${viewport.name}`);
        });
      });
    }
  });
}

// Integration testing utilities
export class IntegrationTestRunner {
  private testScenarios: Array<{
    name: string;
    steps: Array<{ action: string; target?: string; value?: any; assertion?: () => void }>;
  }> = [];

  addScenario(
    name: string,
    steps: Array<{ action: string; target?: string; value?: any; assertion?: () => void }>
  ) {
    this.testScenarios.push({ name, steps });
  }

  async runScenarios(component: React.ReactElement) {
    for (const scenario of this.testScenarios) {
      await this.runScenario(scenario, component);
    }
  }

  private async runScenario(
    scenario: { name: string; steps: Array<{ action: string; target?: string; value?: any; assertion?: () => void }> },
    component: React.ReactElement
  ) {
    const rendered = renderWithEnhancements(component, {
      config: { interactions: true, accessibility: true }
    });

    const user = userEvent.setup();

    for (const step of scenario.steps) {
      switch (step.action) {
        case 'click':
          if (step.target) {
            const element = screen.getByTestId(step.target);
            await user.click(element);
          }
          break;

        case 'type':
          if (step.target && step.value) {
            const element = screen.getByTestId(step.target);
            await user.type(element, step.value);
          }
          break;

        case 'wait':
          await waitFor(() => {}, { timeout: step.value || 1000 });
          break;

        case 'assert':
          if (step.assertion) {
            step.assertion();
          }
          break;

        default:
          console.warn(`Unknown action: ${step.action}`);
      }

      // Small delay between steps
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });
    }
  }
}

// Export testing utilities
export {
  screen,
  fireEvent,
  waitFor,
  act,
  userEvent,
  vi,
  expect,
  describe,
  it,
  beforeEach,
  afterEach
};
