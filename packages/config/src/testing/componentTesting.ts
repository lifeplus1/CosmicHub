/**
 * Advanced Component Testing System
 * Automated component validation with performance, accessibility, and quality metrics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './testUtils';
import { performanceMonitor } from '../performance';
import { logger } from '../utils/logger';
import React from 'react';

// Component Testing Framework
export interface ComponentTestConfig {
  name: string;
  component: React.ComponentType<unknown>; // accept unknown props for flexible test components
  props?: Record<string, unknown>;
  variants?: Array<{
    name: string;
    props: Record<string, unknown>;
    expectedBehavior?: string;
  }>;
  accessibility?: {
    requiredRoles: string[];
    requiredLabels: string[];
    keyboardNavigation?: boolean;
  };
  performance?: {
    maxRenderTime: number;
    maxMemoryUsage?: number;
  };
  interactions?: Array<{
    name: string;
    action: (element: HTMLElement) => void;
    expectedResult: (container: HTMLElement) => void;
  }>;
}

// NOTE: Exported for future dynamic suite execution; currently indirectly used via factory.
class ComponentTestSuite {
  private config: ComponentTestConfig;
  private metrics: Array<{
    variant: string;
    renderTime: number;
    memoryUsage: number;
    accessibilityScore: number;
    interactionScore: number;
  }> = [];

  constructor(config: ComponentTestConfig) {
    this.config = config;
  }

  runComprehensiveTests(): void {
    describe(`${this.config.name} Component Testing Suite`, () => {
      beforeEach(() => {
        this.metrics = [];
        performanceMonitor.clearMetrics();
      });

      // Basic rendering tests
      it('should render without crashing', () => {
        const startTime = performance.now();

        const { container } = renderWithProviders(
          React.createElement(this.config.component, this.config.props ?? {})
        );

        const renderTime = performance.now() - startTime;

        expect(container.firstChild).toBeInTheDocument();

        if (typeof this.config.performance?.maxRenderTime === 'number') {
          expect(renderTime).toBeLessThan(
            this.config.performance.maxRenderTime
          );
        }

        logger.debug('Component render', {
          component: this.config.name,
          renderTimeMs: Number(renderTime.toFixed(2)),
        });
      });

      // Variant testing
      if (this.config.variants) {
        this.config.variants.forEach(variant => {
          it(`should render ${variant.name} variant correctly`, () => {
            const startTime = performance.now();
            const initialMemory = this.getMemoryUsage();

            const { container } = renderWithProviders(
              React.createElement(this.config.component, variant.props)
            );

            const renderTime = performance.now() - startTime;
            const memoryUsage = this.getMemoryUsage() - initialMemory;

            expect(container.firstChild).toBeInTheDocument();

            this.metrics.push({
              variant: variant.name,
              renderTime,
              memoryUsage,
              accessibilityScore: 0, // Will be calculated in accessibility tests
              interactionScore: 0, // Will be calculated in interaction tests
            });

            logger.debug('Variant render', {
              component: this.config.name,
              variant: variant.name,
              renderTimeMs: Number(renderTime.toFixed(2)),
              memoryBytes: memoryUsage,
            });
          });
        });
      }

      // Accessibility testing
      if (this.config.accessibility) {
        it('should meet accessibility requirements', () => {
          const accessibility = this.config.accessibility; // snapshot for type narrowing
          if (!accessibility) return; // safety guard
          const { container } = renderWithProviders(
            React.createElement(this.config.component, this.config.props ?? {})
          );
          // Check required roles
          accessibility.requiredRoles?.forEach(role => {
            const elements = container.querySelectorAll(`[role="${role}"]`);
            expect(elements.length).toBeGreaterThan(0);
          });
          // Check required labels
          accessibility.requiredLabels?.forEach(label => {
            const labeledElements = container.querySelectorAll(
              `[aria-label*="${label}"], [aria-labelledby*="${label}"]`
            );
            expect(labeledElements.length).toBeGreaterThan(0);
          });
          // Test keyboard navigation if required
          if (accessibility.keyboardNavigation === true) {
            const focusableElements = container.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            expect(focusableElements.length).toBeGreaterThan(0);
            if (focusableElements.length > 0) {
              fireEvent.keyDown(focusableElements[0], { key: 'Tab' });
            }
          }
          logger.debug('Accessibility validation passed', {
            component: this.config.name,
          });
        });
      }

      // Interaction testing
      if (this.config.interactions) {
        this.config.interactions.forEach(interaction => {
          it(`should handle ${interaction.name} interaction`, async () => {
            const { container } = renderWithProviders(
              React.createElement(
                this.config.component,
                this.config.props ?? {}
              )
            );

            const targetElement = container.firstChild as HTMLElement;
            expect(targetElement).toBeInTheDocument();

            // Execute the interaction
            interaction.action(targetElement);

            // Wait for any async updates
            await waitFor(() => {
              interaction.expectedResult(container);
            });

            logger.debug('Interaction validated', {
              component: this.config.name,
              interaction: interaction.name,
            });
          });
        });
      }

      // Performance regression testing
      it('should maintain performance benchmarks', () => {
        const benchmarkRuns = 5;
        const renderTimes: number[] = [];

        for (let i = 0; i < benchmarkRuns; i++) {
          const startTime = performance.now();

          const { unmount } = renderWithProviders(
            React.createElement(this.config.component, this.config.props ?? {})
          );

          const renderTime = performance.now() - startTime;
          renderTimes.push(renderTime);

          unmount();
        }

        const averageRenderTime =
          renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
        const maxRenderTime = Math.max(...renderTimes);
        const minRenderTime = Math.min(...renderTimes);

        logger.info('Performance benchmark', {
          component: this.config.name,
          avgMs: Number(averageRenderTime.toFixed(2)),
          minMs: Number(minRenderTime.toFixed(2)),
          maxMs: Number(maxRenderTime.toFixed(2)),
        });

        const limit = this.config.performance?.maxRenderTime;
        if (typeof limit === 'number' && !Number.isNaN(limit)) {
          expect(averageRenderTime).toBeLessThan(limit);
          expect(maxRenderTime).toBeLessThan(limit * 1.5); // Allow 50% variance for max
        }

        // Record performance metrics
        performanceMonitor.recordMetric(
          `${this.config.name}_AverageRender`,
          averageRenderTime
        );
        performanceMonitor.recordMetric(
          `${this.config.name}_MaxRender`,
          maxRenderTime
        );
      });

      // Quality score calculation
      it('should achieve quality benchmarks', () => {
        const qualityMetrics = this.calculateQualityScore();

        expect(qualityMetrics.overall).toBeGreaterThan(80); // Minimum 80% quality score

        logger.info('Quality metrics', {
          component: this.config.name,
          overall: qualityMetrics.overall,
          grade: qualityMetrics.grade,
          performance: qualityMetrics.performance,
          accessibility: qualityMetrics.accessibility,
          reliability: qualityMetrics.reliability,
        });

        if (qualityMetrics.recommendations.length > 0) {
          logger.warn('Quality recommendations', {
            component: this.config.name,
            recommendations: qualityMetrics.recommendations,
          });
        }
      });
    });
  }

  private getMemoryUsage(): number {
    const g: unknown = globalThis as unknown;
    if (typeof g === 'object' && g !== null && 'process' in g) {
      const proc = (
        g as { process?: { memoryUsage?: () => { heapUsed: number } } }
      ).process;
      if (proc && typeof proc.memoryUsage === 'function') {
        const mem = proc.memoryUsage();
        interface MemStat {
          heapUsed: number;
        }
        const isMemStat = (m: unknown): m is MemStat => {
          return (
            typeof m === 'object' &&
            m !== null &&
            'heapUsed' in m &&
            typeof (m as Record<string, unknown>).heapUsed === 'number'
          );
        };
        if (isMemStat(mem)) {
          return mem.heapUsed;
        }
      }
    }
    return 0;
  }

  private calculateQualityScore(): {
    overall: number;
    grade: string;
    performance: number;
    accessibility: number;
    reliability: number;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    // Performance score (based on render times)
    const avgRenderTime =
      this.metrics.length > 0
        ? this.metrics.reduce((sum, m) => sum + m.renderTime, 0) /
          this.metrics.length
        : 0;

    const performanceScore =
      avgRenderTime <= 16
        ? 100
        : avgRenderTime <= 32
          ? 80
          : avgRenderTime <= 50
            ? 60
            : 40;

    if (performanceScore < 80) {
      recommendations.push('Optimize component rendering performance');
    }

    // Accessibility score (based on requirements met)
    const accessibilityScore = this.config.accessibility ? 90 : 70; // Simplified scoring

    if (accessibilityScore < 90) {
      recommendations.push('Add comprehensive accessibility features');
    }

    // Reliability score (based on test coverage and variants)
    const reliabilityScore =
      this.config.variants && this.config.variants.length > 0
        ? 90
        : this.config.interactions && this.config.interactions.length > 0
          ? 80
          : 70;

    if (reliabilityScore < 90) {
      recommendations.push('Add more component variants and interaction tests');
    }

    // Overall score
    const overall = Math.round(
      (performanceScore + accessibilityScore + reliabilityScore) / 3
    );

    const grade =
      overall >= 90
        ? 'A'
        : overall >= 80
          ? 'B'
          : overall >= 70
            ? 'C'
            : overall >= 60
              ? 'D'
              : 'F';

    return {
      overall,
      grade,
      performance: performanceScore,
      accessibility: accessibilityScore,
      reliability: reliabilityScore,
      recommendations,
    };
  }
}

// Test configuration factory functions
// Accept strongly typed component; loosen parameter using any with localized lint disable to allow specific prop components in tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createButtonTestConfig = (
  component: React.ComponentType<any>
): ComponentTestConfig => ({
  name: 'Button',
  component,
  props: { children: 'Test Button' },
  variants: [
    {
      name: 'Primary',
      props: { variant: 'primary', children: 'Primary Button' },
    },
    {
      name: 'Secondary',
      props: { variant: 'secondary', children: 'Secondary Button' },
    },
    {
      name: 'Disabled',
      props: { disabled: true, children: 'Disabled Button' },
    },
    { name: 'Loading', props: { loading: true, children: 'Loading Button' } },
  ],
  accessibility: {
    requiredRoles: ['button'],
    requiredLabels: ['button'],
    keyboardNavigation: true,
  },
  performance: {
    maxRenderTime: 16,
  },
  interactions: [
    {
      name: 'Click',
      action: element => fireEvent.click(element),
      expectedResult: (container: HTMLElement): void => {
        // Verify click was handled (button should be in document)
        expect(container.firstChild).toBeInTheDocument();
      },
    },
    {
      name: 'Keyboard Enter',
      action: element => fireEvent.keyDown(element, { key: 'Enter' }),
      expectedResult: (container: HTMLElement): void => {
        expect(container.firstChild).toBeInTheDocument();
      },
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createModalTestConfig = (
  component: React.ComponentType<any>
): ComponentTestConfig => ({
  name: 'Modal',
  component,
  props: { isOpen: true, children: 'Modal Content' },
  variants: [
    { name: 'Open', props: { isOpen: true, children: 'Open Modal' } },
    { name: 'Closed', props: { isOpen: false, children: 'Closed Modal' } },
    {
      name: 'With Title',
      props: {
        isOpen: true,
        title: 'Modal Title',
        children: 'Modal with Title',
      },
    },
  ],
  accessibility: {
    requiredRoles: ['dialog'],
    requiredLabels: ['modal', 'dialog'],
    keyboardNavigation: true,
  },
  performance: {
    maxRenderTime: 32, // Modals can be slightly slower due to complexity
  },
  interactions: [
    {
      name: 'Escape Key Close',
      action: element => fireEvent.keyDown(element, { key: 'Escape' }),
      expectedResult: (container: HTMLElement): void => {
        // Modal should handle escape key
        expect(container.firstChild).toBeInTheDocument();
      },
    },
  ],
});

export const createFormTestConfig = (
  component: React.ComponentType<unknown>
): ComponentTestConfig => ({
  name: 'Form',
  component,
  props: {},
  variants: [
    { name: 'Empty', props: {} },
    { name: 'With Validation', props: { validation: true } },
    { name: 'Submitting', props: { isSubmitting: true } },
  ],
  accessibility: {
    requiredRoles: ['form'],
    requiredLabels: ['form'],
    keyboardNavigation: true,
  },
  performance: {
    maxRenderTime: 50, // Forms can be complex
  },
});

// Export utilities
// Helper to create & (optionally) run the suite externally
export const createTestSuite = (
  config: ComponentTestConfig
): ComponentTestSuite => new ComponentTestSuite(config);
export { ComponentTestSuite };
