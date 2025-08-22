import React, { useMemo } from 'react'

/**
 * Simple A/B Testing Hook
 * 
 * This is a basic implementation for A/B testing. For production use,
 * consider integrating with Split.io (@splitsoftware/splitio-react) for
 * more advanced features like:
 * - Server-side feature flags
 * - Real-time configuration updates  
 * - Advanced targeting and segmentation
 * - Detailed analytics and reporting
 * 
 * To upgrade to Split.io:
 * 1. npm install @splitsoftware/splitio-react
 * 2. Replace this hook with useSplitClient and useTreatments
 * 3. Configure Split.io dashboard for feature flags
 */

export interface ABTestConfig {
  testName: string
  variants: string[]
  weights?: number[] // Optional weights for each variant (defaults to equal distribution)
  enabled?: boolean // Feature flag to enable/disable test
}

export interface ABTestEventProperties {
  // Flexible but typed as unknown to encourage validation upstream
  [key: string]: string | number | boolean | null | undefined;
}

export interface ABTestResult {
  variant: string;
  isControl: boolean;
  trackEvent: (eventName: string, properties?: ABTestEventProperties) => void;
}

/**
 * Hook for simple A/B testing with localStorage persistence
 */
export function useABTest(config: ABTestConfig): ABTestResult {
  const { testName, variants, weights = [], enabled = true } = config

  const result = useMemo(() => {
    if (!enabled || variants.length === 0) {
      return {
        variant: variants[0] || 'control',
        isControl: true,
        trackEvent: () => {}
      }
    }

    // Check if user already has a variant assigned
    const storageKey = `ab_test_${testName}`
    const existingVariant = localStorage.getItem(storageKey)
    
    if (existingVariant && variants.includes(existingVariant)) {
      return {
        variant: existingVariant,
        isControl: existingVariant === variants[0],
        trackEvent: createEventTracker(testName, existingVariant)
      }
    }

    // Assign new variant based on weights or equal distribution
  let selectedVariant = ''

  if (weights && weights.length === variants.length && weights.length > 0) {
      // Use weighted distribution
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
      const random = Math.random() * totalWeight
      let cumulativeWeight = 0
      
      selectedVariant = variants[0] || 'control' // fallback
      for (let i = 0; i < variants.length; i++) {
        const w = weights[i] ?? 0
        cumulativeWeight += w
        if (random <= cumulativeWeight) {
          selectedVariant = variants[i] || selectedVariant
          break
        }
      }
    } else {
      // Equal distribution
      const randomIndex = Math.floor(Math.random() * variants.length)
      selectedVariant = variants[randomIndex] || variants[0] || 'control'
    }

    // Store the assignment
    localStorage.setItem(storageKey, selectedVariant)
    
    return {
  variant: selectedVariant,
  isControl: selectedVariant === variants[0],
  trackEvent: createEventTracker(testName, selectedVariant)
    }
  }, [testName, variants, weights, enabled])

  return result
}

/**
 * Create an event tracker for A/B test analytics
 */
function createEventTracker(testName: string, variant: string) {
  return (eventName: string, properties: ABTestEventProperties = {}) => {
    // Store event in local analytics
    const raw = localStorage.getItem('ab_test_events') ?? '[]';
  let events: Array<Record<string, unknown>>;
    try {
      const parsed: unknown = JSON.parse(raw);
      events = Array.isArray(parsed)
        ? (parsed.filter((v) => typeof v === 'object' && v !== null) as Array<Record<string, unknown>>)
        : [];
    } catch { events = []; }
    events.push({
      testName,
      variant,
      event: eventName,
      timestamp: new Date().toISOString(),
      ...properties
    })
    localStorage.setItem('ab_test_events', JSON.stringify(events.slice(-100))) // Keep last 100 events

    // Send to analytics services
    try {
      // Google Analytics (gtag)
      interface GTagFn { (command: string, eventName: string, params: Record<string, unknown>): void }
      const gtag: GTagFn | undefined = typeof window !== 'undefined'
        ? (window as unknown as { gtag?: GTagFn }).gtag
        : undefined;
      if (gtag) {
        gtag('event', eventName, {
          custom_parameter_ab_test: `${testName}_${variant}`,
          test_name: testName,
          variant: variant,
          ...properties
        });
      }

      // Mixpanel
  interface Mixpanel { track: (name: string, props: Record<string, unknown>) => void }
      const mixpanel: Mixpanel | undefined = typeof window !== 'undefined'
        ? (window as unknown as { mixpanel?: Mixpanel }).mixpanel
        : undefined;
      if (mixpanel) {
        mixpanel.track(eventName, {
          ab_test: testName,
          variant: variant,
          ...properties
        });
      }

      // PostHog
  interface PostHog { capture: (name: string, props: Record<string, unknown>) => void }
      const posthog: PostHog | undefined = typeof window !== 'undefined'
        ? (window as unknown as { posthog?: PostHog }).posthog
        : undefined;
      if (posthog) {
        posthog.capture(eventName, {
          $set: { ab_test_group: variant },
          ab_test_name: testName,
          ...properties
        });
      }

      // Firebase Analytics (lazy loaded for production)
      if (typeof window !== 'undefined' && import.meta.env.PROD) {
          Promise.all([
            import('firebase/analytics'),
            import('@cosmichub/config/firebase')
          ]).then(([analyticsMod, firebaseConfig]) => {
            const modAny = analyticsMod as Record<string, unknown>;
            const container = (modAny['default'] && typeof modAny['default'] === 'object') ? modAny['default'] as Record<string, unknown> : modAny;
            const getAnalytics = container['getAnalytics'] as ((app: unknown)=>unknown) | undefined;
            const logEvent = container['logEvent'] as ((inst: unknown, name: string, params?: Record<string, unknown>)=>void) | undefined;
            if (!getAnalytics || !logEvent) return;
            const { app } = firebaseConfig as { app?: unknown };
            if (!app) return;
            try {
              const analyticsInstance = getAnalytics(app);
              logEvent(analyticsInstance, eventName, {
                ab_test_name: testName,
                ab_test_variant: variant,
                ...properties
              });
            } catch {
              // swallow analytics failures
            }
          }).catch(() => { /* silent */ });
      }

    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to send A/B test analytics:', error);
      }
    }

    // Development logging
  if (import.meta.env.DEV) {
      console.log('[A/B Test Event]', {
        test: testName,
        variant,
        event: eventName,
        timestamp: new Date().toISOString(),
        ...properties
      });
    }
  }
}

/**
 * React component wrapper for A/B testing
 */
export interface ABTestProps {
  config: ABTestConfig
  children: (result: ABTestResult) => React.ReactNode
}

export function ABTest({ config, children }: ABTestProps) {
  const result = useABTest(config)
  return children(result) as React.ReactElement
}

export default useABTest
