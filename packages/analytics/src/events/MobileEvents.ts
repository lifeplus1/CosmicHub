/**
 * Mobile and PWA Events Tracking
 * Specialized analytics for mobile app and PWA interactions
 */

import { getAnalytics } from '../AnalyticsService.js';
import type { MobileEvent } from '../types/index.js';

export const trackMobileEvent = (data: MobileEvent): void => {
  const analytics = getAnalytics();
  if (!analytics) {
    console.debug('Analytics not initialized - mobile event not tracked');
    return;
  }

  analytics.track({
    event: 'mobile_event',
    properties: {
      event_type: data.event_type,
      install_source: data.install_source ?? null,
      notification_type: data.notification_type ?? null,
      offline_duration_ms: data.offline_duration_ms ?? null,
    },
  });
};

export const trackPWAInstallPrompt = (data: {
  prompt_trigger: 'automatic' | 'manual_button' | 'navigation_hint';
  user_action: 'accepted' | 'dismissed' | 'ignored';
  time_on_site_ms: number;
  page_path: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'pwa_install_prompt',
    properties: {
      prompt_trigger: data.prompt_trigger,
      user_action: data.user_action,
      time_on_site_ms: data.time_on_site_ms,
      page_path: data.page_path,
    },
  });
};

export const trackPWAInstallSuccess = (data: {
  install_method: 'browser_prompt' | 'manual_instructions';
  browser: string;
  platform: string;
  time_to_install_ms?: number;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'pwa_install_success',
    properties: {
      install_method: data.install_method,
      browser: data.browser,
      platform: data.platform,
      time_to_install_ms: data.time_to_install_ms ?? null,
    },
  });
};

export const trackOfflineUsage = (data: {
  feature_used: string;
  offline_duration_ms: number;
  data_sync_required: boolean;
  sync_success?: boolean;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'offline_usage',
    properties: {
      feature_used: data.feature_used,
      offline_duration_ms: data.offline_duration_ms,
      data_sync_required: data.data_sync_required,
      sync_success: data.sync_success ?? null,
    },
  });
};

export const trackPushNotification = (data: {
  notification_type: 'daily_insight' | 'transit_alert' | 'feature_update' | 'engagement';
  action: 'received' | 'clicked' | 'dismissed';
  time_to_action_ms?: number;
  user_id?: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'push_notification',
    user_id: data.user_id,
    properties: {
      notification_type: data.notification_type,
      action: data.action,
      time_to_action_ms: data.time_to_action_ms ?? null,
    },
  });
};

export const trackMobilePerformance = (data: {
  metric_type: 'app_startup_time' | 'chart_render_time' | 'sync_time' | 'memory_usage';
  value: number;
  device_info?: {
    model: string;
    os_version: string;
    app_version: string;
  };
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'mobile_performance',
    properties: {
      metric_type: data.metric_type,
      value: data.value,
      device_model: data.device_info?.model ?? null,
      os_version: data.device_info?.os_version ?? null,
      app_version: data.device_info?.app_version ?? null,
    },
  });
};
