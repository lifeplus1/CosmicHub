/**
 * Business Events Tracking
 * Analytics for business metrics, subscriptions, and conversions
 */

import { getAnalytics } from '../AnalyticsService.js';
import type { BusinessEvent } from '../types/index.js';

export const trackBusinessEvent = (data: BusinessEvent): void => {
  const analytics = getAnalytics();
  if (!analytics) {
    console.debug('Analytics not initialized - business event not tracked');
    return;
  }

  analytics.track({
    event: 'business_event',
    properties: {
      event_type: data.event_type,
      subscription_tier: data.subscription_tier ?? null,
      feature_name: data.feature_name ?? null,
      conversion_value: data.conversion_value ?? null,
      trial_duration: data.trial_duration ?? null,
    },
  });
};

export const trackSignUp = (data: {
  signup_method: 'email' | 'google' | 'facebook' | 'guest';
  referral_source?: string;
  landing_page: string;
  time_to_signup_ms: number;
  user_id: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'user_signup',
    user_id: data.user_id,
    properties: {
      signup_method: data.signup_method,
      referral_source: data.referral_source ?? null,
      landing_page: data.landing_page,
      time_to_signup_ms: data.time_to_signup_ms,
    },
  });
};

export const trackSubscriptionStart = (data: {
  tier: 'premium' | 'pro';
  billing_cycle: 'monthly' | 'yearly';
  price: number;
  trial_used: boolean;
  user_id: string;
  payment_method?: 'stripe' | 'paypal' | 'apple' | 'google';
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'subscription_started',
    user_id: data.user_id,
    properties: {
      subscription_tier: data.tier,
      billing_cycle: data.billing_cycle,
      price: data.price,
      trial_used: data.trial_used,
      payment_method: data.payment_method ?? null,
    },
  });
};

export const trackSubscriptionCancel = (data: {
  tier: 'premium' | 'pro';
  days_subscribed: number;
  cancel_reason?: 'too_expensive' | 'not_using' | 'missing_features' | 'other';
  user_id: string;
  retention_offer_shown?: boolean;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'subscription_cancelled',
    user_id: data.user_id,
    properties: {
      subscription_tier: data.tier,
      days_subscribed: data.days_subscribed,
      cancel_reason: data.cancel_reason ?? null,
      retention_offer_shown: data.retention_offer_shown ?? false,
    },
  });
};

export const trackFeatureUsage = (data: {
  feature_name: string;
  usage_type: 'first_use' | 'regular_use' | 'power_use';
  user_tier: 'free' | 'premium' | 'pro';
  session_count: number;
  user_id?: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'feature_usage',
    user_id: data.user_id,
    properties: {
      feature_name: data.feature_name,
      usage_type: data.usage_type,
      user_tier: data.user_tier,
      session_count: data.session_count,
    },
  });
};

export const trackConversion = (data: {
  conversion_type: 'free_to_trial' | 'trial_to_paid' | 'free_to_paid' | 'upgrade';
  from_tier: 'free' | 'premium' | 'pro';
  to_tier: 'premium' | 'pro';
  conversion_value: number;
  days_to_convert: number;
  user_id: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'conversion',
    user_id: data.user_id,
    properties: {
      conversion_type: data.conversion_type,
      from_tier: data.from_tier,
      to_tier: data.to_tier,
      conversion_value: data.conversion_value,
      days_to_convert: data.days_to_convert,
    },
  });
};

export const trackTrialStart = (data: {
  trial_type: 'premium' | 'pro';
  trial_length_days: number;
  trigger_source: 'paywall' | 'feature_limit' | 'onboarding' | 'promotion';
  user_id: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'trial_started',
    user_id: data.user_id,
    properties: {
      trial_type: data.trial_type,
      trial_length_days: data.trial_length_days,
      trigger_source: data.trigger_source,
    },
  });
};

export const trackPaywall = (data: {
  feature_blocked: string;
  paywall_type: 'soft' | 'hard';
  user_action: 'upgrade' | 'dismiss' | 'trial';
  current_tier: 'free' | 'premium';
  user_id?: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'paywall_interaction',
    user_id: data.user_id,
    properties: {
      feature_blocked: data.feature_blocked,
      paywall_type: data.paywall_type,
      user_action: data.user_action,
      current_tier: data.current_tier,
    },
  });
};
