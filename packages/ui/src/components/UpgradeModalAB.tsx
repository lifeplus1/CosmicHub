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

  const getButtonText = (tier: string) => {
    const baseText = buttonTest.variant === 'start_trial' ? 'Start Free Trial' : 'Upgrade Now'
    return `${baseText} - ${tier}`
  }

  const getPricingDisplay = (price: string, period: string) => {
    if (pricingTest.variant === 'annual_discount') {
      const monthlyPrice = parseFloat(price.replace('$', ''))
      const annualPrice = (monthlyPrice * 12 * 0.8).toFixed(2) // 20% discount
      const monthlySavings = (monthlyPrice * 0.2).toFixed(2)
      return {
        primary: `$${annualPrice}/year`,
        secondary: `Save $${monthlySavings}/month with annual billing`,
        badge: '20% OFF'
      }
    }
    return {
      primary: `${price}${period}`,
      secondary: 'Cancel anytime',
      badge: null
    }
  }

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
      
      {/* TODO: Create variant-specific modal content based on test results */}
      {/* This would require either:
          1. Modifying the base UpgradeModal to accept variant props
          2. Creating separate modal components for each variant
          3. Using a render prop pattern to customize content */}
    </div>
  )
}

export default UpgradeModalAB
