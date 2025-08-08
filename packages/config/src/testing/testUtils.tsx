/**
 * Enhanced Testing Utilities for CosmicHub
 * Provides comprehensive test utilities, mocks, and quality assurance tools
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@cosmichub/auth';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import { UpgradeModalProvider } from '../contexts/UpgradeModalContext';
import { vi, expect } from 'vitest';

// Enhanced Test Wrapper with all required providers
interface TestWrapperProps {
  children: ReactNode;
  initialEntries?: string[];
  initialIndex?: number;
  mockUser?: {
    uid: string;
    email: string;
    tier?: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  };
}

export const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  initialEntries = ['/'],
  initialIndex = 0,
  mockUser
}) => {
  // Mock auth context if user provided
  if (mockUser) {
    vi.mock('@cosmichub/auth', () => ({
      useAuth: () => ({
        user: mockUser,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn()
      }),
      AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>
    }));
  }

  return (
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <AuthProvider appName="test">
        <SubscriptionProvider>
          <UpgradeModalProvider>
            {children}
          </UpgradeModalProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

// Enhanced render function with default providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  initialIndex?: number;
  mockUser?: {
    uid: string;
    email: string;
    tier?: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  };
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const { initialEntries, initialIndex, mockUser, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TestWrapper
      initialEntries={initialEntries}
      initialIndex={initialIndex}
      mockUser={mockUser}
    >
      {children}
    </TestWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock Data Factory
export const createMockBirthData = (overrides = {}) => ({
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  city: 'New York',
  country: 'USA',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  datetime: '1990-05-15T14:30:00-05:00',
  ...overrides
});

export const createMockChartData = (overrides = {}) => ({
  planets: {
    sun: { position: 0, house: 1, sign: 'Aries' },
    moon: { position: 90, house: 4, sign: 'Cancer' },
    mercury: { position: 15, house: 1, sign: 'Aries' },
    venus: { position: 45, house: 2, sign: 'Taurus' },
    mars: { position: 120, house: 5, sign: 'Leo' }
  },
  houses: [
    { house: 1, cusp: 0, sign: 'Aries' },
    { house: 2, cusp: 30, sign: 'Taurus' },
    { house: 3, cusp: 60, sign: 'Gemini' },
    { house: 4, cusp: 90, sign: 'Cancer' }
  ],
  aspects: [
    { planet1: 'sun', planet2: 'moon', aspect: 'square', angle: 90, orb: 2 },
    { planet1: 'venus', planet2: 'mars', aspect: 'trine', angle: 120, orb: 3 }
  ],
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  julian_day: 2451545.0,
  angles: {
    ascendant: 0,
    midheaven: 90,
    descendant: 180,
    imum_coeli: 270
  },
  ...overrides
});

export const createMockSynastryData = (overrides = {}) => ({
  compatibility: 85,
  aspects: [
    {
      person1_planet: 'sun',
      person2_planet: 'moon',
      aspect: 'trine',
      angle: 120,
      orb: 2,
      strength: 'strong'
    }
  ],
  interpretation: 'Strong emotional connection with harmonious energy flow.',
  scores: {
    emotional: 90,
    mental: 80,
    physical: 75,
    spiritual: 85
  },
  ...overrides
});

export const createMockGeneKeysData = (overrides = {}) => ({
  lifeWork: 42,
  evolution: 17,
  radiance: 21,
  purpose: 51,
  activationSequence: [42, 17, 21, 51, 25, 46],
  venusSequence: [12, 34, 56, 78],
  pearlSequence: [9, 18, 27, 36],
  hologenicProfile: {
    type: 'Generator',
    strategy: 'To Respond',
    authority: 'Sacral',
    profile: '3/5'
  },
  ...overrides
});

// API Mock Helpers
export const createMockApiResponse = <T,>(data: T, delay = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data, status: 200, statusText: 'OK' });
    }, delay);
  });
};

export const createMockApiError = (message = 'API Error', status = 500, delay = 100) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject({
        response: {
          data: { message },
          status,
          statusText: status === 500 ? 'Internal Server Error' : 'Error'
        }
      });
    }, delay);
  });
};

// Performance Testing Utilities
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  
  // Wait for next tick to ensure render completion
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return performance.now() - start;
};

export const expectFastRender = async (renderFn: () => void, maxTime = 16) => {
  const renderTime = await measureRenderTime(renderFn);
  expect(renderTime).toBeLessThan(maxTime);
  return renderTime;
};

// Accessibility Testing Helpers
export const expectAccessibleButton = (button: HTMLElement) => {
  expect(button).toHaveAttribute('type');
  expect(button).not.toHaveAttribute('aria-disabled', 'true');
  
  // Should have accessible name
  const accessibleName = button.getAttribute('aria-label') || 
                         button.getAttribute('aria-labelledby') || 
                         button.textContent;
  expect(accessibleName).toBeTruthy();
};

export const expectAccessibleModal = (modal: HTMLElement) => {
  expect(modal).toHaveAttribute('role', 'dialog');
  expect(modal).toHaveAttribute('aria-modal', 'true');
  expect(modal).toHaveAttribute('aria-labelledby');
};

export const expectAccessibleForm = (form: HTMLElement) => {
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const hasLabel = input.getAttribute('aria-label') || 
                    input.getAttribute('aria-labelledby') ||
                    form.querySelector(`label[for="${input.id}"]`);
    expect(hasLabel).toBeTruthy();
  });
};

// Component State Testing
export const createMockSubscriptionContext = (tier: 'Free' | 'Basic' | 'Pro' | 'Enterprise' = 'Free') => ({
  subscription: {
    tier: tier.toLowerCase(),
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  userTier: tier,
  isLoading: false,
  hasFeature: vi.fn((requiredTier: string) => {
    const tierHierarchy = { Free: 0, Basic: 1, Pro: 2, Enterprise: 3 };
    const currentLevel = tierHierarchy[tier] || 0;
    const requiredLevel = tierHierarchy[requiredTier as keyof typeof tierHierarchy] || 0;
    return currentLevel >= requiredLevel;
  }),
  upgradeRequired: vi.fn(),
  refreshSubscription: vi.fn(),
  checkUsageLimit: vi.fn(() => ({ allowed: true, current: 0, limit: 100 }))
});

// Error Boundary Testing
export const ErrorThrowingComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }
  return <div>No error thrown</div>;
};

// Local Storage Testing Utilities
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    }
  };
};

// Network Testing Utilities
export const mockFetch = (responses: Array<{ url: string; response: any; delay?: number }>) => {
  const fetchMock = vi.fn(async (url: string) => {
    const config = responses.find(r => url.includes(r.url));
    if (!config) {
      throw new Error(`No mock response configured for ${url}`);
    }
    
    if (config.delay) {
      await new Promise(resolve => setTimeout(resolve, config.delay));
    }
    
    return {
      ok: true,
      status: 200,
      json: async () => config.response,
      text: async () => JSON.stringify(config.response)
    };
  });
  
  global.fetch = fetchMock;
  return fetchMock;
};

// Custom Matchers for Vitest
export const customMatchers = {
  toBeWithinRange: (received: number, min: number, max: number) => {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () => pass 
        ? `Expected ${received} not to be within range ${min}-${max}`
        : `Expected ${received} to be within range ${min}-${max}`
    };
  },
  
  toHavePerformanceScore: (received: number, minScore: number) => {
    const pass = received >= minScore;
    return {
      pass,
      message: () => pass
        ? `Expected performance score ${received} not to be at least ${minScore}`
        : `Expected performance score ${received} to be at least ${minScore}`
    };
  }
};

// Test Suite Metadata
export interface TestSuiteMetadata {
  component: string;
  coverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  performance: {
    averageRenderTime: number;
    maxRenderTime: number;
  };
  accessibility: {
    violations: number;
    warnings: number;
  };
}

export const createTestSuiteReport = (metadata: TestSuiteMetadata) => {
  return {
    ...metadata,
    score: calculateTestScore(metadata),
    timestamp: new Date().toISOString(),
    recommendations: generateTestRecommendations(metadata)
  };
};

const calculateTestScore = (metadata: TestSuiteMetadata): number => {
  const coverageScore = (
    metadata.coverage.statements +
    metadata.coverage.branches +
    metadata.coverage.functions +
    metadata.coverage.lines
  ) / 4;
  
  const performanceScore = metadata.performance.averageRenderTime < 16 ? 100 : 
                          metadata.performance.averageRenderTime < 32 ? 80 : 60;
  
  const accessibilityScore = metadata.accessibility.violations === 0 ? 100 : 
                            metadata.accessibility.violations < 3 ? 80 : 60;
  
  return Math.round((coverageScore + performanceScore + accessibilityScore) / 3);
};

const generateTestRecommendations = (metadata: TestSuiteMetadata): string[] => {
  const recommendations: string[] = [];
  
  if (metadata.coverage.statements < 80) {
    recommendations.push('Increase statement coverage to at least 80%');
  }
  
  if (metadata.performance.averageRenderTime > 16) {
    recommendations.push('Optimize component render time for 60fps performance');
  }
  
  if (metadata.accessibility.violations > 0) {
    recommendations.push('Fix accessibility violations for WCAG compliance');
  }
  
  return recommendations;
};

// Export all utilities
export * from '@testing-library/react';
export * from '@testing-library/jest-dom';
export { vi, expect } from 'vitest';
