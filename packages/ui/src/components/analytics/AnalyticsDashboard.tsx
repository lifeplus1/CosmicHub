import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAnalyticsWebSocket } from './AnalyticsWebSocket';

// Types for analytics data
interface RealTimeMetrics {
  realTimeUsers: number;
  chartCalculationsPerMinute: number;
  aiInteractionsPerHour: number;
  mobileAppSessions: number;
  subscriptionConversions: number;
  errorRate: number;
  averageResponseTime: number;
  averageSessionDurationMs: number;
}

interface AstrologyAnalytics {
  chartCalculations: {
    natal: number;
    transit: number;
    synastry: number;
    composite: number;
    solar_return: number;
  };
  aiFeatureUsage: {
    predictiveTransits: number;
    aiQuestions: number;
    multiSystemSynthesis: number;
    growthCoaching: number;
    patternRecognition: number;
  };
  userPreferences: {
    favoriteChartTypes: string[];
    preferredAstrologySystem: string;
    aiInteractionFrequency: number;
    averageSessionDuration: number;
  };
}

interface ConversionFunnelData {
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

interface UserSegment {
  id: string;
  name: string;
  criteria: Record<string, string>;
  users: number;
  conversionRate: number;
  averageLifetimeValue: number;
}

interface AnalyticsDashboardProps {
  apiEndpoint?: string;
  refreshInterval?: number;
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  apiEndpoint = '/api/analytics',
  refreshInterval = 30000, // 30 seconds
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<
    'realtime' | 'astrology' | 'conversion' | 'segments'
  >('realtime');
  const [realtimeMetrics, setRealtimeMetrics] =
    useState<RealTimeMetrics | null>(null);
  const [astrologyData, setAstrologyData] = useState<AstrologyAnalytics | null>(
    null
  );
  const [conversionData, setConversionData] =
    useState<ConversionFunnelData | null>(null);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket for real-time updates
  const { AnalyticsWebSocket: WebSocketComponent } = useAnalyticsWebSocket(
    message => {
      if (message.type === 'realtime_update') {
        // Validate and convert data to RealTimeMetrics
        const data = message.data;
        const validatedMetrics: RealTimeMetrics = {
          realTimeUsers:
            typeof data.realTimeUsers === 'number' ? data.realTimeUsers : 0,
          chartCalculationsPerMinute:
            typeof data.chartCalculationsPerMinute === 'number'
              ? data.chartCalculationsPerMinute
              : 0,
          aiInteractionsPerHour:
            typeof data.aiInteractionsPerHour === 'number'
              ? data.aiInteractionsPerHour
              : 0,
          mobileAppSessions:
            typeof data.mobileAppSessions === 'number'
              ? data.mobileAppSessions
              : 0,
          subscriptionConversions:
            typeof data.subscriptionConversions === 'number'
              ? data.subscriptionConversions
              : 0,
          errorRate: typeof data.errorRate === 'number' ? data.errorRate : 0,
          averageResponseTime:
            typeof data.averageResponseTime === 'number'
              ? data.averageResponseTime
              : 0,
          averageSessionDurationMs:
            typeof data.averageSessionDurationMs === 'number'
              ? data.averageSessionDurationMs
              : 0,
        };
        setRealtimeMetrics(validatedMetrics);
      }
    }
  );

  // Fetch real-time metrics
  const fetchRealtimeMetrics = async () => {
    try {
      const response = await fetch(`${apiEndpoint}/realtime`);
      if (!response.ok) throw new Error('Failed to fetch real-time metrics');
      const data: RealTimeMetrics = (await response.json()) as RealTimeMetrics;
      setRealtimeMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Fetch astrology analytics
  const fetchAstrologyAnalytics = async (
    timeframe: 'week' | 'month' = 'week'
  ) => {
    try {
      const response = await fetch(
        `${apiEndpoint}/astrology?timeframe=${timeframe}`
      );
      if (!response.ok) throw new Error('Failed to fetch astrology analytics');
      const data: AstrologyAnalytics =
        (await response.json()) as AstrologyAnalytics;
      setAstrologyData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Fetch conversion funnel data
  const fetchConversionData = async () => {
    try {
      const response = await fetch(`${apiEndpoint}/conversion-funnel`);
      if (!response.ok) throw new Error('Failed to fetch conversion data');
      const data: ConversionFunnelData =
        (await response.json()) as ConversionFunnelData;
      setConversionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Fetch user segments
  const fetchUserSegments = async () => {
    try {
      const response = await fetch(`${apiEndpoint}/segments`);
      if (!response.ok) throw new Error('Failed to fetch user segments');
      const data: UserSegment[] = (await response.json()) as UserSegment[];
      setUserSegments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchRealtimeMetrics(),
        fetchAstrologyAnalytics(),
        fetchConversionData(),
        fetchUserSegments(),
      ]);
      setLoading(false);
    };

    void loadInitialData();
  }, [apiEndpoint]);

  // Auto-refresh real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      void fetchRealtimeMetrics();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, apiEndpoint]);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format duration in milliseconds to human readable
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Format percentage
  const formatPercent = (num: number): string => `${(num * 100).toFixed(1)}%`;

  if (loading) {
    return (
      <div className={`p-6 bg-cosmic-dark min-h-screen ${className}`}>
        <Card className='max-w-md mx-auto'>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin w-8 h-8 border-2 border-cosmic-purple border-t-transparent rounded-full mr-3' />
            <p className='text-cosmic-silver'>Loading analytics...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-cosmic-dark min-h-screen ${className}`}>
        <Card className='max-w-md mx-auto'>
          <div className='text-center py-6'>
            <h3 className='text-xl font-semibold text-cosmic-gold mb-4'>
              Error Loading Analytics
            </h3>
            <p className='text-cosmic-silver mb-4'>{error}</p>
            <Button variant='cosmic' onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`bg-cosmic-dark min-h-screen p-6 ${className}`}>
      {/* Dashboard Header */}
      <div className='mb-8'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-3xl font-cinzel text-cosmic-gold'>
            CosmicHub Analytics
          </h2>
          <div className='flex items-center space-x-4'>
            <WebSocketComponent />
            <Button
              variant='outline'
              size='sm'
              onClick={() => void fetchRealtimeMetrics()}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>
        <div className='flex flex-wrap gap-2 bg-cosmic-dark/50 p-1 rounded-lg border border-cosmic-purple/30'>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'realtime'
                ? 'bg-cosmic-purple text-cosmic-gold shadow-lg shadow-cosmic-purple/20'
                : 'text-cosmic-silver hover:bg-cosmic-purple/20 hover:text-cosmic-gold'
            }`}
            onClick={() => setActiveTab('realtime')}
          >
            Real-Time
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'astrology'
                ? 'bg-cosmic-purple text-cosmic-gold shadow-lg shadow-cosmic-purple/20'
                : 'text-cosmic-silver hover:bg-cosmic-purple/20 hover:text-cosmic-gold'
            }`}
            onClick={() => setActiveTab('astrology')}
          >
            Astrology
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'conversion'
                ? 'bg-cosmic-purple text-cosmic-gold shadow-lg shadow-cosmic-purple/20'
                : 'text-cosmic-silver hover:bg-cosmic-purple/20 hover:text-cosmic-gold'
            }`}
            onClick={() => setActiveTab('conversion')}
          >
            Conversion
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'segments'
                ? 'bg-cosmic-purple text-cosmic-gold shadow-lg shadow-cosmic-purple/20'
                : 'text-cosmic-silver hover:bg-cosmic-purple/20 hover:text-cosmic-gold'
            }`}
            onClick={() => setActiveTab('segments')}
          >
            Segments
          </button>
        </div>
      </div>

      {/* Real-Time Metrics Tab */}
      {activeTab === 'realtime' && realtimeMetrics && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            <Card className='text-center'>
              <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                Active Users
              </h3>
              <div className='text-3xl font-bold text-cosmic-silver mb-1'>
                {formatNumber(realtimeMetrics.realTimeUsers)}
              </div>
              <div className='text-sm text-cosmic-silver/70'>
                Currently online
              </div>
            </Card>

            <Card className='text-center'>
              <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                Chart Calculations
              </h3>
              <div className='text-3xl font-bold text-cosmic-silver mb-1'>
                {realtimeMetrics.chartCalculationsPerMinute}
              </div>
              <div className='text-sm text-cosmic-silver/70'>
                Per minute (last 10 min)
              </div>
            </Card>

            <Card className='text-center'>
              <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                AI Interactions
              </h3>
              <div className='text-3xl font-bold text-cosmic-silver mb-1'>
                {realtimeMetrics.aiInteractionsPerHour}
              </div>
              <div className='text-sm text-cosmic-silver/70'>Per hour</div>
            </Card>

            <Card className='text-center'>
              <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                Mobile Sessions
              </h3>
              <div className='text-3xl font-bold text-cosmic-silver mb-1'>
                {realtimeMetrics.mobileAppSessions}
              </div>
              <div className='text-sm text-cosmic-silver/70'>Today</div>
            </Card>

            <Card className='text-center'>
              <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                Error Rate
              </h3>
              <div
                className={`text-3xl font-bold mb-1 ${
                  realtimeMetrics.errorRate > 0.05
                    ? 'text-cosmic-red'
                    : 'text-green-400'
                }`}
              >
                {formatPercent(realtimeMetrics.errorRate)}
              </div>
              <div className='text-sm text-cosmic-silver/70'>Last hour</div>
            </Card>

            <Card className='text-center'>
              <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                Avg Response Time
              </h3>
              <div
                className={`text-3xl font-bold mb-1 ${
                  realtimeMetrics.averageResponseTime > 500
                    ? 'text-yellow-400'
                    : 'text-green-400'
                }`}
              >
                {realtimeMetrics.averageResponseTime}ms
              </div>
              <div className='text-sm text-cosmic-silver/70'>API responses</div>
            </Card>

            <Card className='text-center'>
              <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                Session Duration
              </h3>
              <div className='text-3xl font-bold text-cosmic-silver mb-1'>
                {formatDuration(realtimeMetrics.averageSessionDurationMs)}
              </div>
              <div className='text-sm text-cosmic-silver/70'>Average</div>
            </Card>

            <Card className='text-center'>
              <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                Conversions
              </h3>
              <div className='text-3xl font-bold text-green-400 mb-1'>
                {realtimeMetrics.subscriptionConversions}
              </div>
              <div className='text-sm text-cosmic-silver/70'>Today</div>
            </Card>
          </div>
        </div>
      )}

      {/* Astrology Analytics Tab */}
      {activeTab === 'astrology' && astrologyData && (
        <div className='space-y-8'>
          <div>
            <h3 className='text-2xl font-cinzel text-cosmic-gold mb-4'>
              Chart Calculations (This Week)
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
              {Object.entries(astrologyData.chartCalculations).map(
                ([type, count]) => (
                  <Card key={type} className='text-center'>
                    <h4 className='text-sm font-medium text-cosmic-gold uppercase mb-2'>
                      {type.replace('_', ' ')}
                    </h4>
                    <div className='text-2xl font-bold text-cosmic-silver'>
                      {formatNumber(count)}
                    </div>
                  </Card>
                )
              )}
            </div>
          </div>

          <div>
            <h3 className='text-2xl font-cinzel text-cosmic-gold mb-4'>
              AI Feature Usage (This Week)
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
              {Object.entries(astrologyData.aiFeatureUsage).map(
                ([feature, count]) => (
                  <Card key={feature} className='text-center'>
                    <h4 className='text-sm font-medium text-cosmic-gold mb-2'>
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className='text-2xl font-bold text-cosmic-silver'>
                      {formatNumber(count)}
                    </div>
                  </Card>
                )
              )}
            </div>
          </div>

          <div>
            <h3 className='text-2xl font-cinzel text-cosmic-gold mb-4'>
              User Preferences
            </h3>
            <Card className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='font-semibold text-cosmic-gold'>
                  Preferred System:
                </span>
                <span className='text-cosmic-silver'>
                  {astrologyData.userPreferences.preferredAstrologySystem}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='font-semibold text-cosmic-gold'>
                  AI Interaction Frequency:
                </span>
                <span className='text-cosmic-silver'>
                  {astrologyData.userPreferences.aiInteractionFrequency}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='font-semibold text-cosmic-gold'>
                  Average Session:
                </span>
                <span className='text-cosmic-silver'>
                  {formatDuration(
                    astrologyData.userPreferences.averageSessionDuration
                  )}
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Conversion Funnel Tab */}
      {activeTab === 'conversion' && conversionData && (
        <div className='space-y-8'>
          <div>
            <h3 className='text-2xl font-cinzel text-cosmic-gold mb-6'>
              Conversion Funnel
            </h3>
            <div className='flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-6'>
              <Card className='text-center min-w-[150px]'>
                <div className='text-sm font-medium text-cosmic-gold mb-1'>
                  Visitors
                </div>
                <div className='text-2xl font-bold text-cosmic-silver'>
                  {formatNumber(conversionData.totalVisitors)}
                </div>
              </Card>

              <div className='flex items-center'>
                <div className='text-cosmic-purple text-2xl'>→</div>
              </div>

              <Card className='text-center min-w-[150px]'>
                <div className='text-sm font-medium text-cosmic-gold mb-1'>
                  Signups
                </div>
                <div className='text-2xl font-bold text-cosmic-silver'>
                  {formatNumber(conversionData.signups)}
                </div>
                <div className='text-sm text-green-400 mt-1'>
                  {formatPercent(
                    conversionData.conversionRates.visitorToSignup
                  )}
                </div>
              </Card>

              <div className='flex items-center'>
                <div className='text-cosmic-purple text-2xl'>→</div>
              </div>

              <Card className='text-center min-w-[150px]'>
                <div className='text-sm font-medium text-cosmic-gold mb-1'>
                  Trial Starts
                </div>
                <div className='text-2xl font-bold text-cosmic-silver'>
                  {formatNumber(conversionData.trialStarts)}
                </div>
                <div className='text-sm text-green-400 mt-1'>
                  {formatPercent(conversionData.conversionRates.signupToTrial)}
                </div>
              </Card>

              <div className='flex items-center'>
                <div className='text-cosmic-purple text-2xl'>→</div>
              </div>

              <Card className='text-center min-w-[150px]'>
                <div className='text-sm font-medium text-cosmic-gold mb-1'>
                  Subscriptions
                </div>
                <div className='text-2xl font-bold text-cosmic-silver'>
                  {formatNumber(conversionData.subscriptions)}
                </div>
                <div className='text-sm text-green-400 mt-1'>
                  {formatPercent(
                    conversionData.conversionRates.trialToSubscription
                  )}
                </div>
              </Card>
            </div>

            <Card className='mt-8 text-center bg-cosmic-purple/10 border-cosmic-purple/30'>
              <div className='text-lg font-semibold text-cosmic-gold mb-2'>
                Overall Conversion Rate
              </div>
              <div className='text-3xl font-bold text-green-400'>
                {formatPercent(
                  conversionData.conversionRates.visitorToSubscription
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* User Segments Tab */}
      {activeTab === 'segments' && userSegments && (
        <div className='space-y-6'>
          <h3 className='text-2xl font-cinzel text-cosmic-gold'>
            User Segments
          </h3>
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
            {userSegments.map(segment => (
              <Card key={segment.id} className='space-y-4'>
                <h4 className='text-lg font-semibold text-cosmic-gold border-b border-cosmic-purple/30 pb-2'>
                  {segment.name}
                </h4>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='text-cosmic-silver'>Users:</span>
                    <span className='font-semibold text-cosmic-gold'>
                      {formatNumber(segment.users)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-cosmic-silver'>Conversion Rate:</span>
                    <span className='font-semibold text-green-400'>
                      {formatPercent(segment.conversionRate)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-cosmic-silver'>Avg LTV:</span>
                    <span className='font-semibold text-cosmic-gold'>
                      ${segment.averageLifetimeValue}
                    </span>
                  </div>
                </div>
                <div className='pt-3 border-t border-cosmic-purple/30'>
                  <div className='text-sm text-cosmic-silver/70 mb-2'>
                    Criteria:
                  </div>
                  <div className='space-y-1'>
                    {Object.entries(segment.criteria).map(([key, value]) => (
                      <div key={key} className='text-sm'>
                        <span className='text-cosmic-gold'>
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className='text-cosmic-silver ml-2'>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
