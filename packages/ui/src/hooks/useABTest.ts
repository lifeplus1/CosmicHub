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

export interface ABTestResult {
  variant: string
  isControl: boolean
  trackEvent: (eventName: string, properties?: Record<string, any>) => void
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
    let selectedVariant: string
    
    if (weights.length === variants.length) {
      // Use weighted distribution
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
      const random = Math.random() * totalWeight
      let cumulativeWeight = 0
      
      selectedVariant = variants[0] // fallback
      for (let i = 0; i < variants.length; i++) {
        cumulativeWeight += weights[i]
        if (random <= cumulativeWeight) {
          selectedVariant = variants[i]
          break
        }
      }
    } else {
      // Equal distribution
      const randomIndex = Math.floor(Math.random() * variants.length)
      selectedVariant = variants[randomIndex]
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
  return (eventName: string, properties: Record<string, any> = {}) => {
    // Store event in local analytics
    const events = JSON.parse(localStorage.getItem('ab_test_events') || '[]')
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
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, {
          custom_parameter_ab_test: `${testName}_${variant}`,
          test_name: testName,
          variant: variant,
          ...properties
        });
      }

      // Mixpanel
      if (typeof window !== 'undefined' && (window as any).mixpanel) {
        (window as any).mixpanel.track(eventName, {
          ab_test: testName,
          variant: variant,
          ...properties
        });
      }

      // PostHog
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture(eventName, {
          $set: { ab_test_group: variant },
          ab_test_name: testName,
          ...properties
        });
      }

      // Firebase Analytics (lazy loaded for production)
      if (typeof window !== 'undefined' && import.meta.env.PROD) {
        import('firebase/analytics').then(({ getAnalytics, logEvent }) => {
          import('@cosmichub/config/firebase').then(({ app }) => {
            const analytics = getAnalytics(app);
            logEvent(analytics, eventName, {
              ab_test_name: testName,
              ab_test_variant: variant,
              ...properties
            });
          }).catch(() => {
            // Firebase not available, skip silently
          });
        }).catch(() => {
          // Firebase Analytics not available, skip silently
        });
      }

    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('Failed to send A/B test analytics:', error);
      }
    }

    // Development logging
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
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
  return children(result) as JSX.Element
}

export default useABTest
