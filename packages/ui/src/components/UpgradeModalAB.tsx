import React from 'react'
import { UpgradeModal, UpgradeModalProps } from './UpgradeModal'
import useABTest from '../hooks/useABTest'

/**
 * Enhanced UpgradeModal with A/B Testing
 * 
 * This component wraps the standard UpgradeModal to test different
 * messaging strategies, pricing presentations, and call-to-action buttons.
 * 
 * Current Tests:
 * - Headline messaging (urgency vs. benefit-focused)
 * - Button copy ("Upgrade Now" vs. "Start Free Trial")
 * - Pricing display (monthly vs. annual emphasis)
 * 
 * Future Split.io Integration:
 * Replace useABTest with useTreatments from @splitsoftware/splitio-react
 * for advanced targeting and real-time configuration updates.
 */

export interface UpgradeModalABProps extends UpgradeModalProps {
  /** Enable A/B testing (default: true) */
  enableABTesting?: boolean
}

export function UpgradeModalAB({ enableABTesting = true, ...props }: UpgradeModalABProps) {
  // A/B Test: Headline messaging
  const headlineTest = useABTest({
    testName: 'upgrade_modal_headline',
    variants: ['urgency', 'benefit'],
    weights: [50, 50], // Equal split
    enabled: enableABTesting
  })

  // A/B Test: Button copy
  const buttonTest = useABTest({
    testName: 'upgrade_modal_button',
    variants: ['upgrade_now', 'start_trial'],
    weights: [40, 60], // Favor trial messaging
    enabled: enableABTesting
  })

  // A/B Test: Pricing emphasis
  const pricingTest = useABTest({
    testName: 'upgrade_modal_pricing',
    variants: ['monthly', 'annual_discount'],
    weights: [30, 70], // Favor annual pricing
    enabled: enableABTesting
  })

  // Track modal open event
  React.useEffect(() => {
    if (props.isOpen) {
      headlineTest.trackEvent('modal_opened', {
        feature: props.feature,
        currentTier: props.currentTier,
        headline_variant: headlineTest.variant,
        button_variant: buttonTest.variant,
        pricing_variant: pricingTest.variant
      })
    }
  }, [props.isOpen, props.feature, props.currentTier, headlineTest, buttonTest, pricingTest])

  // Enhanced onUpgrade handler with A/B test tracking
  const handleUpgrade = (tier: 'Basic' | 'Pro' | 'Enterprise') => {
    // Track conversion with A/B test context
    headlineTest.trackEvent('upgrade_clicked', {
      selectedTier: tier,
      feature: props.feature,
      headline_variant: headlineTest.variant,
      button_variant: buttonTest.variant,
      pricing_variant: pricingTest.variant,
      conversion: true
    })

    buttonTest.trackEvent('conversion', { selectedTier: tier })
    pricingTest.trackEvent('conversion', { selectedTier: tier })

    // Call original upgrade handler
    props.onUpgrade(tier)
  }

  // Enhanced onClose handler with A/B test tracking
  const handleClose = () => {
    headlineTest.trackEvent('modal_closed', {
      feature: props.feature,
      headline_variant: headlineTest.variant,
      button_variant: buttonTest.variant,
      pricing_variant: pricingTest.variant,
      conversion: false
    })

    props.onClose()
  }

  // Get variant-specific content
  const getHeadlineContent = () => {
    switch (headlineTest.variant) {
      case 'urgency':
        return {
          title: 'Unlock Premium Features Now!',
          subtitle: 'Limited time offer - don\'t miss out on advanced insights'
        }
      case 'benefit':
        return {
          title: 'Discover Your Full Cosmic Potential',
          subtitle: 'Get deeper insights with premium astrology and healing features'
        }
      default:
        return {
          title: 'Upgrade Your Experience',
          subtitle: 'Unlock advanced features and insights'
        }
    }
  }

  // Removed unused getButtonText / getPricingDisplay helpers (A/B variant logic currently not consuming them)

  const headlineContent = getHeadlineContent()

  // Pass enhanced props to the base UpgradeModal
  const enhancedProps = {
    ...props,
    onUpgrade: handleUpgrade,
    onClose: handleClose,
    // Add A/B test variants as data attributes for styling
    'data-headline-variant': headlineTest.variant,
    'data-button-variant': buttonTest.variant,
    'data-pricing-variant': pricingTest.variant
  }

  // For now, return the standard UpgradeModal
  // In a real implementation, you'd create variants of the modal based on the test results
  return (
    <div className="ab-test-wrapper" data-testid="upgrade-modal-ab">
      {/* Add custom headline based on A/B test */}
      {props.isOpen && (
        <div className="ab-test-context hidden">
          <span data-testid="headline-variant">{headlineTest.variant}</span>
          <span data-testid="button-variant">{buttonTest.variant}</span>
          <span data-testid="pricing-variant">{pricingTest.variant}</span>
        </div>
      )}
      
      <UpgradeModal {...enhancedProps} />
      
      {/* Variant-specific modal content based on test results */}
      {props.isOpen && (
        <div 
          className="ab-test-enhancements absolute top-0 left-0 w-full h-full pointer-events-none z-50"
          data-testid="ab-test-enhancements"
        >
          {/* Custom headline overlay based on A/B test */}
          <div className="custom-headline-overlay pointer-events-auto" data-testid="custom-headline">
            <div className="headline-content bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-b-lg text-center">
              <h2 className="text-lg font-bold">{headlineContent.title}</h2>
              <p className="text-sm opacity-90">{headlineContent.subtitle}</p>
            </div>
          </div>

          {/* Social proof for urgency variant */}
          {headlineTest.variant === 'urgency' && (
            <div className="social-proof-banner absolute top-16 left-4 right-4 pointer-events-auto" data-testid="social-proof">
              <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-center text-sm">
                🔥 <strong>500+ users upgraded this week!</strong> Limited time offer
              </div>
            </div>
          )}
          
          {/* Extra benefits highlight for benefit variant */}
          {headlineTest.variant === 'benefit' && (
            <div className="benefit-highlights absolute bottom-20 left-4 right-4 pointer-events-auto" data-testid="benefit-highlights">
              <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-4 rounded-lg">
                <h3 className="font-bold mb-2">✨ What you&#39;ll unlock:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="benefit-item">📊 Advanced Charts</div>
                  <div className="benefit-item">🌙 Moon Phases</div>
                  <div className="benefit-item">🎵 Healing Audio</div>
                  <div className="benefit-item">� Transit Reports</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Trust badges for standard variant */}
          {headlineTest.variant === 'standard' && (
            <div className="trust-badges absolute bottom-4 left-4 right-4 pointer-events-none" data-testid="trust-badges">
              <div className="flex justify-center space-x-4 text-xs text-gray-600">
                <span className="trust-badge">🔒 Secure Checkout</span>
                <span className="trust-badge">💳 30-Day Refund</span>
                <span className="trust-badge">⭐ 4.9/5 Rating</span>
              </div>
            </div>
          )}

          {/* Trial countdown for start_trial button variant */}
          {buttonTest.variant === 'start_trial' && (
            <div className="trial-info absolute top-24 left-4 right-4 pointer-events-auto" data-testid="trial-info">
              <div className="bg-green-100 border-l-4 border-green-500 p-3 rounded">
                <p className="trial-text text-green-800 text-sm">
                  🎁 Start your <strong>7-day free trial</strong> - no commitment required!
                </p>
                <p className="trial-subtext text-green-600 text-xs mt-1">Cancel anytime during trial</p>
              </div>
            </div>
          )}

          {/* Annual savings highlight for annual_discount pricing variant */}
          {pricingTest.variant === 'annual_discount' && (
            <div className="savings-highlight absolute bottom-12 left-4 right-4 pointer-events-auto" data-testid="savings-highlight">
              <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3">
                <div className="savings-badge text-yellow-800 font-bold text-center mb-1">
                  💰 Save over $50/year with annual billing
                </div>
                <p className="savings-detail text-yellow-700 text-xs text-center">
                  That&#39;s like getting 2+ months free!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UpgradeModalAB
