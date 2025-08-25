/**
 * Enhanced Testing Utilities for CosmicHub
 * Provides comprehensive test utilities, mocks, and quality assurance tools
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { vi, expect } from 'vitest';

// Mock Auth Provider and Context for testing
// (Removed unused MockAuthUser interface)

const MockAuthProvider: React.FC<{ children: ReactNode; appName?: string }> = ({ children }) => {
  return <>{children}</>;
};

// Mock Subscription Context
// (Removed unused MockSubscriptionState interface)

const MockSubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Mock Upgrade Modal Context
const MockUpgradeModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

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
      useAuth: (): { user: typeof mockUser; loading: boolean; signIn: () => void; signUp: () => void; signOut: () => void } => ({
        user: mockUser,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn()
      }),
  AuthProvider: ({ children }: { children: ReactNode }): React.ReactElement => <>{children}</>
    }));
  }

  // Minimal router stub (previously MemoryRouter) to avoid dependency during isolated type checks
  const RouterStub: React.FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;
  void initialEntries; // retain parameters for API compatibility
  void initialIndex;
  return (
    <RouterStub>
      <MockAuthProvider appName="test">
        <MockSubscriptionProvider>
          <MockUpgradeModalProvider>
            {children}
          </MockUpgradeModalProvider>
        </MockSubscriptionProvider>
      </MockAuthProvider>
    </RouterStub>
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

  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
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
interface MockLocation { latitude: number; longitude: number; city: string; country?: string }
interface MockBirthData {
  dateTime: string;
  location: MockLocation;
  timezone: string;
  year: number; month: number; day: number; hour: number; minute: number;
  [k: string]: unknown;
}
export const createMockBirthData = (overrides: Partial<MockBirthData> = {}): MockBirthData => ({
  dateTime: '1990-05-15T14:30:00Z',
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    country: 'USA'
  },
  timezone: 'America/New_York',
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  ...overrides
});

interface Planet { name: string; longitude: number; sign: string; house: number }
interface House { number: number; cusp: number; sign: string }
interface Aspect { planet1: string; planet2: string; type: string; orb: number; applying: boolean }
interface ChartDataStruct {
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  latitude: number; longitude: number; timezone: string; julian_day: number; angles: Record<string, number>;
  [k: string]: unknown;
}
export const createMockChartData = (overrides: Partial<ChartDataStruct> = {}): ChartDataStruct => ({
  planets: [
    { name: 'Sun', longitude: 24.5, sign: 'Aries', house: 1 },
    { name: 'Moon', longitude: 120.3, sign: 'Cancer', house: 4 },
    { name: 'Mercury', longitude: 15.7, sign: 'Aries', house: 1 },
    { name: 'Venus', longitude: 45.2, sign: 'Taurus', house: 2 },
    { name: 'Mars', longitude: 180.9, sign: 'Libra', house: 7 },
    { name: 'Jupiter', longitude: 210.4, sign: 'Scorpio', house: 8 },
    { name: 'Saturn', longitude: 300.1, sign: 'Aquarius', house: 11 },
    { name: 'Uranus', longitude: 270.8, sign: 'Capricorn', house: 10 },
    { name: 'Neptune', longitude: 330.6, sign: 'Pisces', house: 12 },
    { name: 'Pluto', longitude: 240.3, sign: 'Sagittarius', house: 9 }
  ],
  houses: [
    { number: 1, cusp: 0, sign: 'Aries' },
    { number: 2, cusp: 30, sign: 'Taurus' },
    { number: 3, cusp: 60, sign: 'Gemini' },
    { number: 4, cusp: 90, sign: 'Cancer' },
    { number: 5, cusp: 120, sign: 'Leo' },
    { number: 6, cusp: 150, sign: 'Virgo' },
    { number: 7, cusp: 180, sign: 'Libra' },
    { number: 8, cusp: 210, sign: 'Scorpio' },
    { number: 9, cusp: 240, sign: 'Sagittarius' },
    { number: 10, cusp: 270, sign: 'Capricorn' },
    { number: 11, cusp: 300, sign: 'Aquarius' },
    { number: 12, cusp: 330, sign: 'Pisces' }
  ],
  aspects: [
    { planet1: 'Sun', planet2: 'Moon', type: 'square', orb: 2.1, applying: true },
    { planet1: 'Venus', planet2: 'Mars', type: 'trine', orb: 1.8, applying: false },
    { planet1: 'Mercury', planet2: 'Jupiter', type: 'sextile', orb: 3.2, applying: true }
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

interface SynastryAspect { person1_planet: string; person2_planet: string; aspect: string; angle: number; orb: number; strength: string }
interface SynastryData { compatibility: number; aspects: SynastryAspect[]; interpretation: string; scores: Record<string, number>; [k: string]: unknown }
export const createMockSynastryData = (overrides: Partial<SynastryData> = {}): SynastryData => ({
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

interface GeneKeysData { lifeWork: number; evolution: number; radiance: number; purpose: number; activationSequence: number[]; venusSequence: number[]; pearlSequence: number[]; hologenicProfile: Record<string,string>; [k: string]: unknown }
export const createMockGeneKeysData = (overrides: Partial<GeneKeysData> = {}): GeneKeysData => ({
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
export const createMockApiResponse = <T,>(data: T, delay = 100): Promise<{ data: T; status: number; statusText: string }> => new Promise(resolve => {
  setTimeout(() => {
    resolve({ data, status: 200, statusText: 'OK' });
  }, delay);
});

export const createMockApiError = (message = 'API Error', delay = 100): Promise<never> => new Promise((_, reject) => {
  setTimeout(() => {
    reject(new Error(message));
  }, delay);
});

// Performance Testing Utilities
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  
  // Wait for next tick to ensure render completion
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return performance.now() - start;
};

export const expectFastRender = (renderTime: number, maxTime = 16): void => {
  expect(renderTime).toBeLessThan(maxTime);
};

// Range Testing Utilities
export const expectWithinRange = (value: number, min: number, max: number): void => {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
};

// Accessibility Testing Helpers
export const expectAccessibleButton = (button: HTMLElement): void => {
  // Button should have type="button" or be a button element
  const hasTypeAttribute = button.hasAttribute('type');
  const isButtonElement = button.tagName.toLowerCase() === 'button';
  expect(hasTypeAttribute || isButtonElement).toBe(true);
  
  expect(button.getAttribute('aria-disabled')).not.toBe('true');
  
  // Should have accessible name
  const ariaLabel = button.getAttribute('aria-label');
  const ariaLabelledBy = button.getAttribute('aria-labelledby');
  const text = button.textContent?.trim();
  const accessibleName = ariaLabel ?? ariaLabelledBy ?? (text && text.length > 0 ? text : null);
  expect(accessibleName).toBeTruthy();
};

export const expectAccessibleModal = (modal: HTMLElement): void => {
  expect(modal.getAttribute('role')).toBe('dialog');
  expect(modal.getAttribute('aria-modal')).toBe('true');
  expect(modal.hasAttribute('aria-labelledby')).toBe(true);
};

export const expectAccessibleForm = (form: HTMLElement): void => {
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
  const ariaLabel = input.getAttribute('aria-label');
  const ariaLabelledBy = input.getAttribute('aria-labelledby');
  const explicitLabel = form.querySelector(`label[for="${input.id}"]`);
  const hasLabel = ariaLabel ?? ariaLabelledBy ?? explicitLabel ?? null;
  expect(hasLabel !== null).toBe(true);
  });
};

// Component State Testing
export const createMockSubscriptionContext = (tier: 'Free' | 'Basic' | 'Pro' | 'Enterprise' = 'Free'): {
  subscription: { tier: string; status: string; currentPeriodEnd: Date };
  userTier: string;
  isLoading: boolean;
  hasFeature: (requiredTier: string) => boolean;
  upgradeRequired: () => void;
  refreshSubscription: () => void;
  checkUsageLimit: () => { allowed: boolean; current: number; limit: number };
} => ({
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
export const ErrorThrowingComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }): React.ReactElement => {
  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }
  return <div>No error thrown</div>;
};

// Local Storage Testing Utilities
export const mockLocalStorage = (): {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
  clear: () => void;
  key: (index: number) => string | null;
  readonly length: number;
} => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  get length(): number { return Object.keys(store).length; }
  };
};

// Network Testing Utilities
export const mockFetch = (responses: Array<{ url: string; response: unknown; delay?: number }>): ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
  let url: string;
  if (typeof input === 'string') url = input;
  else if (input instanceof URL) url = input.href;
  else if (typeof (input as unknown as { url?: unknown }).url === 'string') {
    url = String((input as unknown as { url?: unknown }).url);
  }
  else url = Object.prototype.toString.call(input);
    const config = responses.find(r => url.includes(r.url));
    if (!config) {
      throw new Error(`No mock response configured for ${url}`);
    }
    
    if (typeof config.delay === 'number' && config.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, config.delay));
    }
    
    return new Response(JSON.stringify(config.response), {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });
  
  // Assign with cast avoiding any
  (globalThis as { fetch?: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
  return fetchMock as unknown as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

// Custom Matchers for Vitest
export const customMatchers = {
  toBeWithinRange: (received: number, min: number, max: number): { pass: boolean; message: () => string } => {
    const pass = received >= min && received <= max;
    return {
      pass,
    message: (): string => pass 
        ? `Expected ${received} not to be within range ${min}-${max}`
        : `Expected ${received} to be within range ${min}-${max}`
    };
  },
  
  toHavePerformanceScore: (received: number, minScore: number): { pass: boolean; message: () => string } => {
    const pass = received >= minScore;
    return {
      pass,
  message: (): string => pass
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

export const createTestSuiteReport = (metadata: TestSuiteMetadata): {
  component: string; coverage: TestSuiteMetadata['coverage']; performance: TestSuiteMetadata['performance']; accessibility: TestSuiteMetadata['accessibility']; score: number; timestamp: string; recommendations: string[];
} => {
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
export { vi, expect } from 'vitest';
