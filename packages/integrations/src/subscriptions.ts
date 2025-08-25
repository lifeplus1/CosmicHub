import React from 'react';
/**
 * Unified subscription management for CosmicHub monorepo
 * Handles Stripe integration and feature access across all apps
 */

// Simple EventEmitter implementation for browser compatibility
type EventCallback = (...args: unknown[]) => void;

class SimpleEventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback): void {
    this.events[event] ??= [];
    this.events[event].push(callback);
  }

  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, data?: unknown): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  apps: ('astro' | 'healwave')[];
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  apps: ('astro' | 'healwave')[];
}

export interface FeatureAccess {
  canAccess: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  requiredPlan?: string;
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Cosmic Explorer',
    price: 0,
    interval: 'month',
    features: [
      'Basic birth chart',
      '3 AI interpretations per month',
      'Daily horoscope',
      'Basic frequencies (healwave)'
    ],
    stripePriceId: '',
    apps: ['astro', 'healwave']
  },
  {
    id: 'astro-pro',
    name: 'Astro Professional',
    price: 19.99,
    interval: 'month',
    features: [
      'Unlimited AI interpretations',
      'Advanced chart aspects',
      'Synastry compatibility',
      'Transit predictions',
      'Chart PDF export',
      'Priority support'
    ],
    stripePriceId: 'price_astro_pro_monthly',
    apps: ['astro']
  },
  {
    id: 'healwave-pro',
    name: 'HealWave Professional',
    price: 14.99,
    interval: 'month',
    features: [
      'Unlimited frequency sessions',
      'Custom frequency creation',
      'Astrological frequency mapping',
      'Session recordings',
      'Advanced binaural beats',
      'Priority support'
    ],
    stripePriceId: 'price_healwave_pro_monthly',
    apps: ['healwave']
  },
  {
    id: 'cosmic-ultimate',
    name: 'Cosmic Ultimate',
    price: 29.99,
    interval: 'month',
    features: [
      'All Astro Professional features',
      'All HealWave Professional features',
      'Cross-app integration',
      'Exclusive cosmic insights',
      'Early access to new features',
      'VIP support'
    ],
    stripePriceId: 'price_cosmic_ultimate_monthly',
    apps: ['astro', 'healwave']
  }
];

class SubscriptionManager extends SimpleEventEmitter {
  private currentSubscription: UserSubscription | null = null;
  private plans: SubscriptionPlan[] = SUBSCRIPTION_PLANS;

  constructor() {
    super();
  }

  // Initialize with user subscription data
  initialize(subscription: UserSubscription | null): void {
    this.currentSubscription = subscription;
    this.emit('subscription:loaded', subscription);
  }

  // Get current subscription
  getCurrentSubscription(): UserSubscription | null {
    return this.currentSubscription;
  }

  // Get current plan details
  getCurrentPlan(): SubscriptionPlan | null {
    if (!this.currentSubscription) {
      return this.plans.find(p => p.id === 'free') ?? null;
    }
    return this.plans.find(p => p.id === this.currentSubscription!.planId) ?? null;
  }

  // Check feature access
  checkFeatureAccess(feature: string, app?: 'astro' | 'healwave'): FeatureAccess {
    const plan = this.getCurrentPlan();
    
    if (!plan) {
      return {
        canAccess: false,
        reason: 'No active plan found',
        upgradeRequired: true,
        requiredPlan: 'astro-pro'
      };
    }

    // Check if subscription is active
    if (this.currentSubscription && this.currentSubscription.status !== 'active') {
      return {
        canAccess: false,
        reason: 'Subscription is not active',
        upgradeRequired: true,
        requiredPlan: plan.id
      };
    }

    // Check if app is included in plan
    if (app && !plan.apps.includes(app)) {
      const requiredPlan = this.plans.find(p => 
        p.apps.includes(app) && p.features.includes(feature)
      );
      
      return {
        canAccess: false,
        reason: `${app} not included in current plan`,
        upgradeRequired: true,
        requiredPlan: requiredPlan?.id ?? 'cosmic-ultimate'
      };
    }

    // Check if feature is included
    const hasFeature = plan.features.includes(feature);
    
    if (!hasFeature) {
      const requiredPlan = this.plans.find(p => 
        p.features.includes(feature) && (!app || p.apps.includes(app))
      );
      
      return {
        canAccess: false,
        reason: 'Feature not included in current plan',
        upgradeRequired: true,
        requiredPlan: requiredPlan?.id ?? 'cosmic-ultimate'
      };
    }

    return { canAccess: true };
  }

  // Get available plans for upgrade
  getAvailablePlans(currentApp?: 'astro' | 'healwave'): SubscriptionPlan[] {
    if (!currentApp) {
      return this.plans;
    }
    
    return this.plans.filter(plan => plan.apps.includes(currentApp));
  }

  // Create Stripe checkout session
  async createCheckoutSession(planId: string, successUrl: string, cancelUrl: string): Promise<{ url: string }> {
    const plan = this.plans.find(p => p.id === planId);
    
    if (!plan?.stripePriceId) {
      throw new Error('Invalid plan or missing Stripe price ID');
    }

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          successUrl,
          cancelUrl,
          planId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      return await response.json() as { url: string };
    } catch (error) {
      this.emit('subscription:error', error);
      throw error;
    }
  }

  // Create customer portal session
  async createPortalSession(returnUrl: string): Promise<{ url: string }> {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ returnUrl })
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      return await response.json() as { url: string };
    } catch (error) {
      this.emit('subscription:error', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(): Promise<void> {
    if (!this.currentSubscription?.stripeSubscriptionId) {
      throw new Error('No active subscription to cancel');
    }

    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: this.currentSubscription.stripeSubscriptionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Update local subscription
      if (this.currentSubscription) {
        this.currentSubscription.cancelAtPeriodEnd = true;
        this.emit('subscription:cancelled', this.currentSubscription);
      }
    } catch (error) {
      this.emit('subscription:error', error);
      throw error;
    }
  }

  // Reactivate subscription
  async reactivateSubscription(): Promise<void> {
    if (!this.currentSubscription?.stripeSubscriptionId) {
      throw new Error('No subscription to reactivate');
    }

    try {
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: this.currentSubscription.stripeSubscriptionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      // Update local subscription
      if (this.currentSubscription) {
        this.currentSubscription.cancelAtPeriodEnd = false;
        this.emit('subscription:reactivated', this.currentSubscription);
      }
    } catch (error) {
      this.emit('subscription:error', error);
      throw error;
    }
  }

  // Update subscription from webhook
  updateSubscription(subscription: UserSubscription): void {
    this.currentSubscription = subscription;
    this.emit('subscription:updated', subscription);
  }

  // Subscribe to events
  subscribe(event: string, callback: (data: unknown) => void): () => void {
    this.on(event, callback);
    return () => this.off(event, callback);
  }

  // Get usage limits for current plan
  getUsageLimits(): Record<string, number> {
    const plan = this.getCurrentPlan();
    
    const limits: Record<string, number> = {
      'ai-interpretations': plan?.id === 'free' ? 3 : -1, // -1 = unlimited
      'chart-exports': plan?.id === 'free' ? 0 : -1,
      'frequency-sessions': plan?.features.includes('Unlimited frequency sessions') ? -1 : 10,
      'custom-frequencies': plan?.features.includes('Custom frequency creation') ? -1 : 0
    };

    return limits;
  }

  // Check if subscription expires soon
  expiresWithin(days: number): boolean {
    if (!this.currentSubscription || this.currentSubscription.status !== 'active') {
      return false;
    }

    const daysUntilExpiry = Math.ceil(
      (this.currentSubscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return daysUntilExpiry <= days;
  }
}

// Create singleton instance
export const subscriptionManager = new SubscriptionManager();

// React hook for subscription management
export const useSubscription = () => {
  const [subscription, setSubscription] = React.useState<UserSubscription | null>(
    subscriptionManager.getCurrentSubscription()
  );
  const [plan, setPlan] = React.useState<SubscriptionPlan | null>(
    subscriptionManager.getCurrentPlan()
  );

  React.useEffect(() => {
    const unsubscribeUpdated = subscriptionManager.subscribe('subscription:updated', (sub) => {
      setSubscription(sub as UserSubscription | null);
      setPlan(subscriptionManager.getCurrentPlan());
    });

    const unsubscribeLoaded = subscriptionManager.subscribe('subscription:loaded', (sub) => {
      setSubscription(sub as UserSubscription | null);
      setPlan(subscriptionManager.getCurrentPlan());
    });

    return () => {
      unsubscribeUpdated();
      unsubscribeLoaded();
    };
  }, []);

  return {
    subscription,
    plan,
    checkFeatureAccess: subscriptionManager.checkFeatureAccess.bind(subscriptionManager),
    getAvailablePlans: subscriptionManager.getAvailablePlans.bind(subscriptionManager),
    createCheckoutSession: subscriptionManager.createCheckoutSession.bind(subscriptionManager),
    createPortalSession: subscriptionManager.createPortalSession.bind(subscriptionManager),
    cancelSubscription: subscriptionManager.cancelSubscription.bind(subscriptionManager),
    reactivateSubscription: subscriptionManager.reactivateSubscription.bind(subscriptionManager),
    getUsageLimits: subscriptionManager.getUsageLimits.bind(subscriptionManager),
    expiresWithin: subscriptionManager.expiresWithin.bind(subscriptionManager),
    subscribe: subscriptionManager.subscribe.bind(subscriptionManager)
  };
};

export default subscriptionManager;
