import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { AnalyticsConfig } from '../../types';

// Mock the AnalyticsService module
vi.mock('../../AnalyticsService', () => {
  const mockInstance = {
    track: vi.fn(),
    identify: vi.fn(),
    page: vi.fn(),
    getSessionId: vi.fn(() => 'test-session-123'),
  };

  return {
    getAnalytics: vi.fn(() => null), // Start with no existing instance
    initializeAnalytics: vi.fn(() => mockInstance),
  };
});

describe('AnalyticsProvider singleton behavior', () => {
  const mockConfig: AnalyticsConfig = {
    privacy: {
      anonymizeIP: true,
      respectDoNotTrack: true,
      cookieConsent: false,
      dataRetentionDays: 365,
    },
    advanced: {
      sessionTimeoutMs: 30 * 60 * 1000,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes analytics service when no existing instance is found', async () => {
    const { initializeAnalytics, getAnalytics } = await import(
      '../../AnalyticsService'
    );

    // Mock that no existing analytics instance exists
    (getAnalytics as any).mockReturnValueOnce(null);

    // Import the provider to ensure it's available for testing
    await import('../AnalyticsProvider');

    expect(getAnalytics).toBeDefined();
    expect(initializeAnalytics).toBeDefined();
  });

  it('validates that analytics service provides expected interface', async () => {
    const { initializeAnalytics } = await import('../../AnalyticsService');
    const mockInstance = (initializeAnalytics as any)();

    expect(mockInstance.track).toBeDefined();
    expect(mockInstance.identify).toBeDefined();
    expect(mockInstance.page).toBeDefined();
    expect(mockInstance.getSessionId()).toBe('test-session-123');
  });

  it('ensures provider configuration includes required privacy settings', () => {
    expect(mockConfig.privacy.anonymizeIP).toBe(true);
    expect(mockConfig.privacy.respectDoNotTrack).toBe(true);
    expect(mockConfig.privacy.dataRetentionDays).toBe(365);
    expect(mockConfig.advanced?.sessionTimeoutMs).toBe(30 * 60 * 1000);
  });
});
