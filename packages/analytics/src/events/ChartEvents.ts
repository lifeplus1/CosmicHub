/**
 * Chart Events Tracking
 * Specialized analytics for astrological chart calculations
 */

import { getAnalytics } from '../AnalyticsService';
import type { ChartCalculationEvent } from '../types/index';

export const trackChartCalculation = (data: ChartCalculationEvent): void => {
  const analytics = getAnalytics();
  if (!analytics) {
    console.debug('Analytics not initialized - chart calculation not tracked');
    return;
  }

  analytics.track({
    event: 'chart_calculated',
    properties: {
      chart_type: data.chart_type,
      calculation_time_ms: data.calculation_time_ms,
      success: data.success,
      error_type: data.error_type ?? null,
      astrology_system: data.astrology_system,
      house_system: data.house_system ?? null,
      timestamp: Date.now(),
    },
  });
};

export const trackChartView = (data: {
  chart_type: string;
  user_id?: string;
  chart_id?: string;
  duration_ms?: number;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'chart_viewed',
    user_id: data.user_id,
    properties: {
      chart_type: data.chart_type,
      chart_id: data.chart_id ?? null,
      duration_ms: data.duration_ms ?? null,
    },
  });
};

export const trackChartShare = (data: {
  chart_type: string;
  share_method: 'link' | 'image' | 'pdf';
  user_id?: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'chart_shared',
    user_id: data.user_id,
    properties: {
      chart_type: data.chart_type,
      share_method: data.share_method,
    },
  });
};

export const trackChartError = (data: {
  chart_type: string;
  error_type: string;
  error_message?: string;
  user_input?: Record<string, string | number | boolean>;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'chart_error',
    properties: {
      chart_type: data.chart_type,
      error_type: data.error_type,
      error_message: data.error_message ?? null,
      user_input: JSON.stringify(data.user_input ?? {}),
    },
  });
};

export const trackChartCustomization = (data: {
  chart_type: string;
  customization_type:
    | 'house_system'
    | 'orb_settings'
    | 'chart_style'
    | 'aspect_filter';
  old_value: string | number;
  new_value: string | number;
  user_id?: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'chart_customized',
    user_id: data.user_id,
    properties: {
      chart_type: data.chart_type,
      customization_type: data.customization_type,
      old_value: data.old_value,
      new_value: data.new_value,
    },
  });
};
