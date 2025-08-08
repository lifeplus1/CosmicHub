/**
 * Vitest Test Setup for CosmicHub
 * Global test configuration and environment setup
 */

import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Global test cleanup
afterEach(() => {
  cleanup();
});

// Performance measurement setup
beforeAll(() => {
  // Mock performance API if not available
  if (typeof global.performance === 'undefined') {
    global.performance = {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      getEntriesByType: vi.fn(() => []),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn()
    } as any;
  }
  
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));
  
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));
  
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
  
  // Mock window.scrollTo
  window.scrollTo = vi.fn();
  
  // Mock console methods for cleaner test output
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  
  console.log('🧪 Test environment initialized');
});

afterAll(() => {
  // Restore console methods
  vi.restoreAllMocks();
  console.log('🏁 Test environment cleanup completed');
});

// Custom matchers for performance testing
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      };
    }
  },
  
  toRenderFast(received: number, threshold: number = 16) {
    const pass = received <= threshold;
    if (pass) {
      return {
        message: () => `expected ${received}ms not to be under ${threshold}ms render threshold`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received}ms to be under ${threshold}ms render threshold (slow render detected)`,
        pass: false
      };
    }
  },
  
  toBeAccessibleButton(received: HTMLElement) {
    const hasRole = received.getAttribute('role') === 'button' || received.tagName.toLowerCase() === 'button';
    const hasLabel = received.getAttribute('aria-label') || received.getAttribute('aria-labelledby') || received.textContent?.trim();
    const hasAriaDisabled = received.hasAttribute('aria-disabled');
    
    const pass = hasRole && hasLabel && hasAriaDisabled;
    
    if (pass) {
      return {
        message: () => `expected element not to be an accessible button`,
        pass: true
      };
    } else {
      const missing = [];
      if (!hasRole) missing.push('proper role');
      if (!hasLabel) missing.push('aria-label or text content');
      if (!hasAriaDisabled) missing.push('aria-disabled attribute');
      
      return {
        message: () => `expected element to be accessible button, missing: ${missing.join(', ')}`,
        pass: false
      };
    }
  },
  
  toBeAccessibleModal(received: HTMLElement) {
    const hasRole = received.getAttribute('role') === 'dialog';
    const hasAriaModal = received.getAttribute('aria-modal') === 'true';
    const hasLabelledBy = received.hasAttribute('aria-labelledby');
    const hasDescribedBy = received.hasAttribute('aria-describedby');
    
    const pass = hasRole && hasAriaModal && hasLabelledBy;
    
    if (pass) {
      return {
        message: () => `expected element not to be an accessible modal`,
        pass: true
      };
    } else {
      const missing = [];
      if (!hasRole) missing.push('role="dialog"');
      if (!hasAriaModal) missing.push('aria-modal="true"');
      if (!hasLabelledBy) missing.push('aria-labelledby');
      
      return {
        message: () => `expected element to be accessible modal, missing: ${missing.join(', ')}`,
        pass: false
      };
    }
  }
});

// Declare custom matchers for TypeScript
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeWithinRange(floor: number, ceiling: number): T;
    toRenderFast(threshold?: number): T;
    toBeAccessibleButton(): T;
    toBeAccessibleModal(): T;
  }
}

// Global test constants
export const TEST_TIMEOUTS = {
  FAST_RENDER: 16,
  SLOW_RENDER: 100,
  NETWORK_REQUEST: 5000,
  USER_INTERACTION: 1000
} as const;

export const TEST_THRESHOLDS = {
  COVERAGE_MINIMUM: 80,
  PERFORMANCE_BUDGET: 16,
  ACCESSIBILITY_SCORE: 90
} as const;
