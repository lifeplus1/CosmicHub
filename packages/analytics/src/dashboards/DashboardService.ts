/**
 * Analytics Dashboard Service
 * Real-time analytics data aggregation and insights
 */

import type {
  DashboardMetrics,
  UserSegment,
  AstrologyAnalytics,
} from '../types/index';

export interface AnalyticsDashboard {
  getRealTimeMetrics(): Promise<DashboardMetrics>;
  getAstrologyAnalytics(
    timeframe: 'day' | 'week' | 'month' | 'year'
  ): Promise<AstrologyAnalytics>;
  getUserSegments(): Promise<UserSegment[]>;
  getConversionFunnel(): Promise<ConversionFunnelData>;
  getPerformanceMetrics(): Promise<PerformanceMetrics>;
}

export interface ConversionFunnelData {
  totalVisitors: number;
  signups: number;
  trialStarts: number;
  subscriptions: number;
  conversionRates: {
    visitorToSignup: number;
    signupToTrial: number;
    trialToSubscription: number;
    visitorToSubscription: number;
  };
}

export interface PerformanceMetrics {
  averagePageLoadTime: number;
  chartCalculationTimes: {
    natal: number;
    transit: number;
    synastry: number;
  };
  aiResponseTimes: {
    average: number;
    p95: number;
    p99: number;
  };
  errorRates: {
    chartCalculations: number;
    aiInteractions: number;
    general: number;
  };
}

export class DashboardService implements AnalyticsDashboard {
  private apiEndpoint: string;

  constructor(apiEndpoint = '/api/analytics') {
    this.apiEndpoint = apiEndpoint;
  }

  async getRealTimeMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await fetch(`${this.apiEndpoint}/realtime`);
      if (!response.ok) {
        throw new Error('Failed to fetch real-time metrics');
      }
      return (await response.json()) as DashboardMetrics;
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      // Return default metrics if API fails
      return {
        realTimeUsers: 0,
        chartCalculationsPerMinute: 0,
        aiInteractionsPerHour: 0,
        mobileAppSessions: 0,
        subscriptionConversions: 0,
        errorRate: 0,
        averageResponseTime: 0,
      };
    }
  }

  async getAstrologyAnalytics(
    timeframe: 'day' | 'week' | 'month' | 'year'
  ): Promise<AstrologyAnalytics> {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/astrology?timeframe=${timeframe}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch astrology analytics');
      }
      return (await response.json()) as AstrologyAnalytics;
    } catch (error) {
      console.error('Error fetching astrology analytics:', error);
      return {
        chartCalculations: {
          natal: 0,
          transit: 0,
          synastry: 0,
          composite: 0,
          solar_return: 0,
        },
        aiFeatureUsage: {
          predictiveTransits: 0,
          aiQuestions: 0,
          multiSystemSynthesis: 0,
          growthCoaching: 0,
          patternRecognition: 0,
        },
        userPreferences: {
          favoriteChartTypes: [],
          preferredAstrologySystem: 'western',
          aiInteractionFrequency: 0,
          averageSessionDuration: 0,
        },
      };
    }
  }

  async getUserSegments(): Promise<UserSegment[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/segments`);
      if (!response.ok) {
        throw new Error('Failed to fetch user segments');
      }
      return (await response.json()) as UserSegment[];
    } catch (error) {
      console.error('Error fetching user segments:', error);
      return [];
    }
  }

  async getConversionFunnel(): Promise<ConversionFunnelData> {
    try {
      const response = await fetch(`${this.apiEndpoint}/conversion-funnel`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversion funnel');
      }
      return (await response.json()) as ConversionFunnelData;
    } catch (error) {
      console.error('Error fetching conversion funnel:', error);
      return {
        totalVisitors: 0,
        signups: 0,
        trialStarts: 0,
        subscriptions: 0,
        conversionRates: {
          visitorToSignup: 0,
          signupToTrial: 0,
          trialToSubscription: 0,
          visitorToSubscription: 0,
        },
      };
    }
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const response = await fetch(`${this.apiEndpoint}/performance`);
      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }
      return (await response.json()) as PerformanceMetrics;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return {
        averagePageLoadTime: 0,
        chartCalculationTimes: {
          natal: 0,
          transit: 0,
          synastry: 0,
        },
        aiResponseTimes: {
          average: 0,
          p95: 0,
          p99: 0,
        },
        errorRates: {
          chartCalculations: 0,
          aiInteractions: 0,
          general: 0,
        },
      };
    }
  }

  // Helper method to format metrics for display
  formatMetricsForDisplay(metrics: DashboardMetrics): Record<string, string> {
    return {
      'Active Users': metrics.realTimeUsers.toString(),
      'Charts/min': metrics.chartCalculationsPerMinute.toString(),
      'AI Queries/hr': metrics.aiInteractionsPerHour.toString(),
      'Mobile Sessions': metrics.mobileAppSessions.toString(),
      Conversions: metrics.subscriptionConversions.toString(),
      'Error Rate': `${(metrics.errorRate * 100).toFixed(2)}%`,
      'Avg Response': `${metrics.averageResponseTime}ms`,
    };
  }

  // Helper method to calculate key business metrics
  calculateBusinessMetrics(
    funnel: ConversionFunnelData
  ): Record<string, string> {
    return {
      'Total Visitors': funnel.totalVisitors.toLocaleString(),
      'Signup Rate': `${(funnel.conversionRates.visitorToSignup * 100).toFixed(2)}%`,
      'Trial Rate': `${(funnel.conversionRates.signupToTrial * 100).toFixed(2)}%`,
      'Subscription Rate': `${(funnel.conversionRates.trialToSubscription * 100).toFixed(2)}%`,
      'Overall Conversion': `${(funnel.conversionRates.visitorToSubscription * 100).toFixed(2)}%`,
    };
  }
}

// Singleton instance
let dashboardInstance: DashboardService | null = null;

export const getDashboardService = (apiEndpoint?: string): DashboardService => {
  dashboardInstance ??= new DashboardService(apiEndpoint);
  return dashboardInstance;
};
