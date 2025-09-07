import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { VirtualizedList } from '../virtualization/VirtualizedList';

// Custom Tabs components with proper ARIA structure
const TabsRoot: React.FC<{
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}> = ({ children, value, className }) => (
  <div className={className} data-current-tab={value}>
    {children}
  </div>
);

const TabsContent: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => (
  <div
    className={className}
    role='tabpanel'
    aria-labelledby={`tab-${value}`}
    id={`tab-panel-${value}`}
  >
    {children}
  </div>
);

// Layer 1: Validated Types (following unified strategy)
interface ValidatedRealTimeMetrics {
  realTimeUsers: number;
  chartCalculationsPerMinute: number;
  aiInteractionsPerHour: number;
  mobileAppSessions: number;
  subscriptionConversions: number;
  errorRate: number;
  averageResponseTime: number;
  averageSessionDurationMs: number;
}

interface ValidatedAstrologyAnalytics {
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
    preferredAstrologySystem: 'western' | 'vedic' | 'chinese';
    aiInteractionFrequency: number;
    averageSessionDuration: number;
  };
}

interface ValidatedConversionFunnelData {
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

interface ValidatedUserSegment {
  id: string;
  name: string;
  criteria: Record<string, string | number | boolean>;
  users: number;
  conversionRate: number;
  averageLifetimeValue: number;
}

interface AnalyticsDashboardProps {
  apiEndpoint?: string;
  refreshInterval?: number;
  className?: string;
}

// Layer 2: Runtime Validation Functions
const validateRealTimeMetrics = (data: unknown): ValidatedRealTimeMetrics => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Real-time metrics must be an object');
  }

  const obj = data as Record<string, unknown>;

  const requiredFields = [
    'realTimeUsers',
    'chartCalculationsPerMinute',
    'aiInteractionsPerHour',
    'mobileAppSessions',
    'subscriptionConversions',
    'errorRate',
    'averageResponseTime',
    'averageSessionDurationMs',
  ];

  for (const field of requiredFields) {
    if (typeof obj[field] !== 'number') {
      throw new Error(`${field} must be a number`);
    }
  }

  return obj as unknown as ValidatedRealTimeMetrics;
};

const validateAstrologyAnalytics = (
  data: unknown
): ValidatedAstrologyAnalytics => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Astrology analytics must be an object');
  }

  // Basic validation - in production, use proper Zod schemas
  return data as ValidatedAstrologyAnalytics;
};

const validateConversionFunnelData = (
  data: unknown
): ValidatedConversionFunnelData => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Conversion funnel data must be an object');
  }

  return data as ValidatedConversionFunnelData;
};

const validateUserSegment = (data: unknown): ValidatedUserSegment => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('User segment must be an object');
  }

  return data as ValidatedUserSegment;
};

// Layer 3: Enhanced Error Boundary
class AnalyticsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): {
    hasError: boolean;
    error: Error;
  } {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Analytics Dashboard Error:', error, errorInfo);
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Card className='max-w-md mx-auto p-6 text-center'>
          <h3 className='text-xl font-semibold text-cosmic-gold mb-4'>
            Analytics Error
          </h3>
          <p className='text-cosmic-silver mb-4'>{this.state.error?.message}</p>
          <Button variant='cosmic' onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Layer 4: Main Component with Best Practices
const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  apiEndpoint = '/api/analytics',
  refreshInterval = 30000,
  className = '',
}) => {
  // State management with validated types
  const [activeTab, setActiveTab] = useState<
    'realtime' | 'astrology' | 'conversion' | 'segments'
  >('realtime');
  const [realtimeMetrics, setRealtimeMetrics] =
    useState<ValidatedRealTimeMetrics | null>(null);
  const [astrologyData, setAstrologyData] =
    useState<ValidatedAstrologyAnalytics | null>(null);
  const [conversionData, setConversionData] =
    useState<ValidatedConversionFunnelData | null>(null);
  const [userSegments, setUserSegments] = useState<ValidatedUserSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Layer 5: Validated Data Fetching
  const fetchValidatedData = useCallback(
    async function <T>(
      endpoint: string,
      validator: (data: unknown) => T
    ): Promise<T> {
      const response = await fetch(`${apiEndpoint}${endpoint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
      }

      const rawData: unknown = await response.json();

      try {
        return validator(rawData);
      } catch (validationError) {
        console.error(`Validation failed for ${endpoint}:`, validationError);
        throw new Error(`Invalid data format received from ${endpoint}`);
      }
    },
    [apiEndpoint]
  );

  // Layer 6: Memoized Event Handlers (Best Practices)
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as 'realtime' | 'astrology' | 'conversion' | 'segments');
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setLoading(true);
      const metrics = await fetchValidatedData(
        '/realtime',
        validateRealTimeMetrics
      );
      setRealtimeMetrics(metrics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetchValidatedData]);

  // Layer 7: Data Loading with Error Handling
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metrics, astrology, conversion, segments] =
          await Promise.allSettled([
            fetchValidatedData('/realtime', validateRealTimeMetrics),
            fetchValidatedData('/astrology', validateAstrologyAnalytics),
            fetchValidatedData(
              '/conversion-funnel',
              validateConversionFunnelData
            ),
            fetchValidatedData('/segments', (data: unknown) => {
              if (!Array.isArray(data)) {
                throw new Error('User segments must be an array');
              }
              return data.map(item => validateUserSegment(item));
            }),
          ]);

        if (metrics.status === 'fulfilled') setRealtimeMetrics(metrics.value);
        if (astrology.status === 'fulfilled') setAstrologyData(astrology.value);
        if (conversion.status === 'fulfilled')
          setConversionData(conversion.value);
        if (segments.status === 'fulfilled') setUserSegments(segments.value);

        // Check for any failures
        const failures = [metrics, astrology, conversion, segments].filter(
          result => result.status === 'rejected'
        );

        if (failures.length > 0) {
          const errorMessages = failures
            .map(f =>
              f.status === 'rejected'
                ? f.reason instanceof Error
                  ? f.reason.message
                  : String(f.reason)
                : 'Unknown error'
            )
            .join(', ');
          setError(`Some data failed to load: ${errorMessages}`);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load analytics data'
        );
      } finally {
        setLoading(false);
      }
    };

    void loadInitialData();
  }, [fetchValidatedData]);

  // Auto-refresh real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      void (async () => {
        try {
          const metrics = await fetchValidatedData(
            '/realtime',
            validateRealTimeMetrics
          );
          setRealtimeMetrics(metrics);
        } catch (err) {
          console.error('Auto-refresh failed:', err);
        }
      })();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchValidatedData, refreshInterval]);

  // Layer 8: Memoized Utility Functions (Performance)
  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  const formatDuration = useCallback((ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }, []);

  const formatPercent = useCallback(
    (num: number): string => `${(num * 100).toFixed(1)}%`,
    []
  );

  // Layer 9: Memoized Computed Values
  const chartCalculationsEntries = useMemo(
    () =>
      astrologyData ? Object.entries(astrologyData.chartCalculations) : [],
    [astrologyData]
  );

  const aiFeatureUsageEntries = useMemo(
    () => (astrologyData ? Object.entries(astrologyData.aiFeatureUsage) : []),
    [astrologyData]
  );

  const errorRateColor = useMemo(
    () =>
      realtimeMetrics && realtimeMetrics.errorRate > 0.05
        ? 'text-cosmic-red'
        : 'text-green-400',
    [realtimeMetrics]
  );

  const responseTimeColor = useMemo(
    () =>
      realtimeMetrics && realtimeMetrics.averageResponseTime > 500
        ? 'text-yellow-400'
        : 'text-green-400',
    [realtimeMetrics]
  );

  // Layer 10: Virtualized List Configuration for Large Data
  const renderUserSegment = useCallback(
    (segment: ValidatedUserSegment) => (
      <Card key={segment.id} className='space-y-4 mb-4'>
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
          <div className='text-sm text-cosmic-silver/70 mb-2'>Criteria:</div>
          <div className='space-y-1'>
            {Object.entries(segment.criteria).map(([key, value]) => (
              <div key={key} className='text-sm'>
                <span className='text-cosmic-gold'>
                  {key.replace(/_/g, ' ')}:
                </span>
                <span className='text-cosmic-silver ml-2'>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    ),
    [formatNumber, formatPercent]
  );

  // Loading state
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

  // Error state
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

  // ARIA-compliant static values to satisfy jsx-a11y strict validation rules
  const realtimeAriaSelected = activeTab === 'realtime' ? 'true' : 'false';
  const astrologyAriaSelected = activeTab === 'astrology' ? 'true' : 'false';
  const conversionAriaSelected = activeTab === 'conversion' ? 'true' : 'false';
  const segmentsAriaSelected = activeTab === 'segments' ? 'true' : 'false';

  return (
    <AnalyticsErrorBoundary>
      <div className={`bg-cosmic-dark min-h-screen p-6 ${className}`}>
        {/* Dashboard Header */}
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-3xl font-cinzel text-cosmic-gold'>
              CosmicHub Analytics
            </h2>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2 text-sm'>
                <div className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
                <span className='font-medium text-green-400'>Live</span>
                <span className='text-cosmic-silver/60 text-xs'>
                  Auto-refresh every {refreshInterval / 1000}s
                </span>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => void handleRefresh()}
                disabled={loading}
                aria-label='Refresh real-time analytics data'
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Custom Tabs Implementation */}
          <TabsRoot
            value={activeTab}
            onValueChange={handleTabChange}
            className='w-full'
          >
            <div
              className='flex flex-wrap gap-2 bg-cosmic-dark/50 p-1 rounded-lg border border-cosmic-purple/30'
              role='tablist'
              aria-label='Analytics dashboard tabs'
              aria-orientation='horizontal'
            >
              <button
                onClick={() => handleTabChange('realtime')}
                role='tab'
                aria-selected={realtimeAriaSelected}
                aria-controls='tab-panel-realtime'
                id='tab-realtime'
                data-state={activeTab === 'realtime' ? 'active' : 'inactive'}
                tabIndex={activeTab === 'realtime' ? 0 : -1}
                type='button'
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'realtime'
                    ? 'bg-cosmic-purple text-cosmic-gold shadow-lg shadow-cosmic-purple/20'
                    : 'text-cosmic-silver hover:bg-cosmic-purple/20 hover:text-cosmic-gold'
                }`}
              >
                Real-Time
              </button>
              <button
                onClick={() => handleTabChange('astrology')}
                role='tab'
                aria-selected={astrologyAriaSelected}
                aria-controls='tab-panel-astrology'
                id='tab-astrology'
                data-state={activeTab === 'astrology' ? 'active' : 'inactive'}
                tabIndex={activeTab === 'astrology' ? 0 : -1}
                type='button'
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'astrology'
                    ? 'bg-cosmic-purple text-cosmic-gold shadow-lg shadow-cosmic-purple/20'
                    : 'text-cosmic-silver hover:bg-cosmic-purple/20 hover:text-cosmic-gold'
                }`}
              >
                Astrology
              </button>
              <button
                onClick={() => handleTabChange('conversion')}
                role='tab'
                aria-selected={conversionAriaSelected}
                aria-controls='tab-panel-conversion'
                id='tab-conversion'
                data-state={activeTab === 'conversion' ? 'active' : 'inactive'}
                tabIndex={activeTab === 'conversion' ? 0 : -1}
                type='button'
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'conversion'
                    ? 'bg-cosmic-purple text-cosmic-gold shadow-lg shadow-cosmic-purple/20'
                    : 'text-cosmic-silver hover:bg-cosmic-purple/20 hover:text-cosmic-gold'
                }`}
              >
                Conversion
              </button>
              <button
                onClick={() => handleTabChange('segments')}
                role='tab'
                aria-selected={segmentsAriaSelected}
                aria-controls='tab-panel-segments'
                id='tab-segments'
                data-state={activeTab === 'segments' ? 'active' : 'inactive'}
                tabIndex={activeTab === 'segments' ? 0 : -1}
                type='button'
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'segments'
                    ? 'bg-cosmic-purple text-cosmic-gold shadow-lg shadow-cosmic-purple/20'
                    : 'text-cosmic-silver hover:bg-cosmic-purple/20 hover:text-cosmic-gold'
                }`}
              >
                Segments
              </button>
            </div>

            {/* Real-Time Metrics Tab */}
            {activeTab === 'realtime' && (
              <TabsContent value='realtime' className='mt-6'>
                {realtimeMetrics && (
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
                        <div className='text-sm text-cosmic-silver/70'>
                          Per hour
                        </div>
                      </Card>

                      <Card className='text-center'>
                        <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                          Mobile Sessions
                        </h3>
                        <div className='text-3xl font-bold text-cosmic-silver mb-1'>
                          {realtimeMetrics.mobileAppSessions}
                        </div>
                        <div className='text-sm text-cosmic-silver/70'>
                          Today
                        </div>
                      </Card>

                      <Card className='text-center'>
                        <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                          Error Rate
                        </h3>
                        <div
                          className={`text-3xl font-bold mb-1 ${errorRateColor}`}
                        >
                          {formatPercent(realtimeMetrics.errorRate)}
                        </div>
                        <div className='text-sm text-cosmic-silver/70'>
                          Last hour
                        </div>
                      </Card>

                      <Card className='text-center'>
                        <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                          Avg Response Time
                        </h3>
                        <div
                          className={`text-3xl font-bold mb-1 ${responseTimeColor}`}
                        >
                          {realtimeMetrics.averageResponseTime}ms
                        </div>
                        <div className='text-sm text-cosmic-silver/70'>
                          API responses
                        </div>
                      </Card>

                      <Card className='text-center'>
                        <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                          Session Duration
                        </h3>
                        <div className='text-3xl font-bold text-cosmic-silver mb-1'>
                          {formatDuration(
                            realtimeMetrics.averageSessionDurationMs
                          )}
                        </div>
                        <div className='text-sm text-cosmic-silver/70'>
                          Average
                        </div>
                      </Card>

                      <Card className='text-center'>
                        <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                          Conversions
                        </h3>
                        <div className='text-3xl font-bold text-green-400 mb-1'>
                          {realtimeMetrics.subscriptionConversions}
                        </div>
                        <div className='text-sm text-cosmic-silver/70'>
                          Today
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>
            )}

            {/* Astrology Analytics Tab */}
            {activeTab === 'astrology' && (
              <TabsContent value='astrology' className='mt-6'>
                {astrologyData && (
                  <div className='space-y-8'>
                    <div>
                      <h3 className='text-2xl font-cinzel text-cosmic-gold mb-4'>
                        Chart Calculations (This Week)
                      </h3>
                      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
                        {chartCalculationsEntries.map(([type, count]) => (
                          <Card key={type} className='text-center'>
                            <h4 className='text-sm font-medium text-cosmic-gold uppercase mb-2'>
                              {type.replace('_', ' ')}
                            </h4>
                            <div className='text-2xl font-bold text-cosmic-silver'>
                              {formatNumber(count)}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className='text-2xl font-cinzel text-cosmic-gold mb-4'>
                        AI Feature Usage (This Week)
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
                        {aiFeatureUsageEntries.map(([feature, count]) => (
                          <Card key={feature} className='text-center'>
                            <h4 className='text-sm font-medium text-cosmic-gold mb-2'>
                              {feature.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <div className='text-2xl font-bold text-cosmic-silver'>
                              {formatNumber(count)}
                            </div>
                          </Card>
                        ))}
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
                            {
                              astrologyData.userPreferences
                                .preferredAstrologySystem
                            }
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='font-semibold text-cosmic-gold'>
                            AI Interaction Frequency:
                          </span>
                          <span className='text-cosmic-silver'>
                            {
                              astrologyData.userPreferences
                                .aiInteractionFrequency
                            }
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='font-semibold text-cosmic-gold'>
                            Average Session:
                          </span>
                          <span className='text-cosmic-silver'>
                            {formatDuration(
                              astrologyData.userPreferences
                                .averageSessionDuration
                            )}
                          </span>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>
            )}

            {/* Conversion Funnel Tab */}
            {activeTab === 'conversion' && (
              <TabsContent value='conversion' className='mt-6'>
                {conversionData && (
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
                            {formatPercent(
                              conversionData.conversionRates.signupToTrial
                            )}
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
              </TabsContent>
            )}

            {/* User Segments Tab with Virtualization */}
            {activeTab === 'segments' && (
              <TabsContent value='segments' className='mt-6'>
                <div className='space-y-6'>
                  <h3 className='text-2xl font-cinzel text-cosmic-gold'>
                    User Segments ({userSegments.length} total)
                  </h3>

                  {userSegments.length > 100 ? (
                    // Use virtualization for large lists (Best Practice)
                    <Suspense
                      fallback={
                        <Card className='text-center p-8'>
                          <div className='animate-spin w-8 h-8 border-2 border-cosmic-purple border-t-transparent rounded-full mx-auto mb-4' />
                          <p className='text-cosmic-silver'>
                            Loading segments...
                          </p>
                        </Card>
                      }
                    >
                      <VirtualizedList
                        items={userSegments}
                        height={600}
                        width='100%'
                        itemHeight={280}
                        render={renderUserSegment}
                      />
                    </Suspense>
                  ) : (
                    // Regular grid for smaller lists
                    <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
                      {userSegments.map(renderUserSegment)}
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </TabsRoot>
        </div>
      </div>
    </AnalyticsErrorBoundary>
  );
};

// Layer 11: Memoized Export with Display Name (Best Practices)
const MemoizedAnalyticsDashboard = React.memo(AnalyticsDashboard);
MemoizedAnalyticsDashboard.displayName = 'AnalyticsDashboard';

export { MemoizedAnalyticsDashboard as AnalyticsDashboard };
export default MemoizedAnalyticsDashboard;
