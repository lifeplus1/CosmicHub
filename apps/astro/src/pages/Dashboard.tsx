import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@cosmichub/auth';
import { isFeatureEnabled } from '@cosmichub/config';
import EnvironmentStatus from '../components/EnvironmentStatus';
import { PageLoading } from '../components/CosmicLoading';
import ChartWheelUnified from '../features/ChartWheelUnified';

/**
 * Dashboard Props interface following TypeScript best practices
 */
interface DashboardProps {
  /** Optional class name for custom styling */
  className?: string;
  /** Test ID for component testing */
  'data-testid'?: string;
}

/**
 * Sample birth data interface with proper validation
 */
interface SampleBirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  birth_date: string;
  birth_time: string;
  city: string;
  timezone: string;
}

/**
 * Main Dashboard component with proper TypeScript typing and performance optimization
 * 
 * @component
 * @example
 * ```tsx
 * <Dashboard className="custom-dashboard" data-testid="main-dashboard" />
 * ```
 */
const Dashboard: React.FC<DashboardProps> = ({ className, 'data-testid': testId }) => {
  const { user, loading } = useAuth();
  
  // Memoized state with proper typing
  const [showQuickChart, setShowQuickChart] = useState<boolean>(false);
  
  // Sample birth data with type validation - memoized for performance
  const sampleBirthData = useMemo<SampleBirthData>(() => ({
    year: 1990,
    month: 6,
    day: 21,
    hour: 12,
    minute: 0,
    latitude: 40.7128,
    longitude: -74.006,
    birth_date: '06/21/1990',
    birth_time: '12:00',
    city: 'New York',
    timezone: 'America/New_York',
  }), []);

  // Optimized navigation handlers with useCallback
  const navigateToCalculator = useCallback(() => {
    window.location.href = '/calculator';
  }, []);

  const navigateToHealwave = useCallback(() => {
    window.location.href = '/healwave';
  }, []);

  const navigateToProfile = useCallback(() => {
    window.location.href = '/profile';
  }, []);

  const navigateToSignup = useCallback(() => {
    window.location.href = '/signup';
  }, []);

  const navigateToAbout = useCallback(() => {
    window.location.href = '/about';
  }, []);

  // Toggle handlers with useCallback for performance
  const toggleQuickChart = useCallback(() => {
    setShowQuickChart(prev => !prev);
  }, []);

  const hideQuickChart = useCallback(() => {
    setShowQuickChart(false);
  }, []);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div 
      className={`space-y-8 ${className ?? ''}`}
      data-testid={testId}
      role="main"
      aria-label="Dashboard"
    >
      {/* Hero Section */}
      <section 
        className='text-center py-12 bg-gradient-to-r from-cosmic-purple/20 to-cosmic-blue/20 rounded-2xl border border-cosmic-silver/10'
        aria-labelledby="hero-heading"
      >
        <h1 
          id="hero-heading"
          className='text-5xl font-bold text-cosmic-gold mb-4 font-cinzel'
        >
          Welcome to CosmicHub
        </h1>
        <p className='text-xl text-cosmic-silver/80 font-playfair'>
          {user !== null
            ? `Hello, ${user.email}!`
            : 'Your cosmic journey begins here'}
        </p>
        <div className='mt-6 flex justify-center' aria-hidden="true">
          <div className='w-24 h-1 bg-gradient-to-r from-cosmic-gold to-cosmic-purple rounded-full'></div>
        </div>
      </section>

      {/* Feature Cards */}
      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">Dashboard Features</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div className='group bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-6 hover:border-cosmic-purple/50 hover:bg-cosmic-purple/10 transition-all duration-300 hover:shadow-lg hover:shadow-cosmic-purple/25'>
            <div className='flex items-center mb-4'>
              <div 
                className='w-12 h-12 bg-cosmic-purple/20 rounded-lg flex items-center justify-center mr-4'
                aria-hidden="true"
              >
                <span className='text-2xl' role="img" aria-label="Star">🌟</span>
              </div>
              <h3 className='text-xl font-semibold text-cosmic-gold font-playfair'>
                Birth Chart
              </h3>
            </div>
            <p className='text-cosmic-silver/80 mb-6 leading-relaxed'>
              Generate your personalized astrological birth chart with detailed
              planetary positions and aspects
            </p>
            <div className='flex gap-2'>
              <button
                onClick={navigateToCalculator}
                className='flex-1 px-4 py-3 bg-gradient-to-r from-cosmic-purple to-cosmic-blue hover:from-cosmic-purple/80 hover:to-cosmic-blue/80 text-white rounded-lg transition-all duration-300 font-semibold focus:ring-2 focus:ring-cosmic-purple focus:ring-offset-2 focus:ring-offset-cosmic-dark'
                aria-describedby="create-chart-desc"
              >
                Create Chart
              </button>
              <span id="create-chart-desc" className="sr-only">
                Navigate to birth chart calculator
              </span>
              <button
                onClick={toggleQuickChart}
                className='px-4 py-3 bg-cosmic-silver/20 hover:bg-cosmic-silver/30 text-cosmic-silver rounded-lg transition-all duration-300 font-semibold focus:ring-2 focus:ring-cosmic-silver focus:ring-offset-2 focus:ring-offset-cosmic-dark'
                aria-controls="quick-chart-preview"
              >
                {showQuickChart ? 'Hide' : 'Preview'}
              </button>
            </div>
          </div>

        {isFeatureEnabled('healwaveIntegration') && (
          <div className='group bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-6 hover:border-cosmic-gold/50 hover:bg-cosmic-gold/5 transition-all duration-300 hover:shadow-lg hover:shadow-cosmic-gold/25'>
            <div className='flex items-center mb-4'>
              <div 
                className='w-12 h-12 bg-cosmic-gold/20 rounded-lg flex items-center justify-center mr-4'
                aria-hidden="true"
              >
                <span className='text-2xl' role="img" aria-label="Music note">🎵</span>
              </div>
              <h3 className='text-xl font-semibold text-cosmic-gold font-playfair'>
                Healwave Integration
              </h3>
            </div>
            <p className='text-cosmic-silver/80 mb-6 leading-relaxed'>
              Access personalized healing frequencies based on your astrological
              chart
            </p>
            <button
              onClick={navigateToHealwave}
              className='w-full px-6 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-purple hover:from-cosmic-gold/80 hover:to-cosmic-purple/80 text-white rounded-lg transition-all duration-300 font-semibold group-hover:shadow-lg focus:ring-2 focus:ring-cosmic-gold focus:ring-offset-2 focus:ring-offset-cosmic-dark'
            >
              Explore Healwave
            </button>
          </div>
        )}

        <div className='group bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-6 hover:border-cosmic-silver/50 hover:bg-cosmic-silver/5 transition-all duration-300 hover:shadow-lg hover:shadow-cosmic-silver/25'>
          <div className='flex items-center mb-4'>
            <div 
              className='w-12 h-12 bg-cosmic-silver/20 rounded-lg flex items-center justify-center mr-4'
              aria-hidden="true"
            >
              <span className='text-2xl' role="img" aria-label="User profile">👤</span>
            </div>
            <h3 className='text-xl font-semibold text-cosmic-gold font-playfair'>
              Your Profile
            </h3>
          </div>
          <p className='text-cosmic-silver/80 mb-6 leading-relaxed'>
            Manage your account settings, preferences, and cosmic profile
          </p>
          <button
            onClick={navigateToProfile}
            className='w-full px-6 py-3 bg-gradient-to-r from-cosmic-silver/20 to-cosmic-blue hover:from-cosmic-silver/30 hover:to-cosmic-blue/80 text-white rounded-lg transition-all duration-300 font-semibold group-hover:shadow-lg focus:ring-2 focus:ring-cosmic-blue focus:ring-offset-2 focus:ring-offset-cosmic-dark'
          >
            View Profile
          </button>
        </div>
        </div>
      </section>

      {/* Chart Wheel Preview Section */}
      {showQuickChart && (
        <section 
          id="quick-chart-preview"
          className='bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8'
          aria-labelledby="chart-preview-heading"
        >
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center'>
              <div 
                className='w-10 h-10 bg-cosmic-purple/20 rounded-lg flex items-center justify-center mr-4'
                aria-hidden="true"
              >
                <span className='text-xl' role="img" aria-label="Galaxy">🌌</span>
              </div>
              <h3 
                id="chart-preview-heading"
                className='text-2xl font-semibold text-cosmic-gold font-playfair'
              >
                Sample Chart Wheel
              </h3>
            </div>
            <button
              onClick={hideQuickChart}
              className='text-cosmic-silver/60 hover:text-cosmic-silver transition-colors focus:ring-2 focus:ring-cosmic-silver focus:ring-offset-2 focus:ring-offset-cosmic-dark'
              aria-label="Close chart preview"
            >
              ✕
            </button>
          </div>
          <div className='bg-cosmic-dark/50 rounded-lg p-4 border border-cosmic-silver/10'>
            <ChartWheelUnified
              birthData={sampleBirthData}
              showAspects={true}
              showAnimation={true}
              interactive={false}
              size="md"
              showControls={false}
            />
            <div className='mt-4 text-center'>
              <p className='text-cosmic-silver/70 text-sm mb-3'>
                This is a sample chart for demonstration. Create your own
                personalized chart above.
              </p>
              <button
                onClick={navigateToCalculator}
                className='px-6 py-2 bg-cosmic-gold hover:bg-cosmic-gold/80 text-cosmic-dark font-semibold rounded-lg transition-colors duration-300 focus:ring-2 focus:ring-cosmic-gold focus:ring-offset-2 focus:ring-offset-cosmic-dark'
              >
                Create Your Chart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Environment Status Section */}
      <section className='flex justify-center' aria-labelledby="environment-status-heading">
        <h2 id="environment-status-heading" className="sr-only">Environment Status</h2>
        <div className='w-full max-w-lg'>
          <EnvironmentStatus className='bg-cosmic-blue/20 backdrop-blur-lg border-cosmic-silver/20 hover:border-cosmic-purple/30 transition-colors duration-300' />
        </div>
      </section>

      {/* Recent Activity Section */}
      {user !== null && (
        <section 
          className='bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8'
          aria-labelledby="recent-activity-heading"
        >
          <div className='flex items-center mb-6'>
            <div 
              className='w-10 h-10 bg-cosmic-gold/20 rounded-lg flex items-center justify-center mr-4'
              aria-hidden="true"
            >
              <span className='text-xl' role="img" aria-label="Chart">📈</span>
            </div>
            <h3 
              id="recent-activity-heading"
              className='text-2xl font-semibold text-cosmic-gold font-playfair'
            >
              Recent Activity
            </h3>
          </div>
          <div className='bg-cosmic-dark/30 rounded-lg p-6 border border-cosmic-silver/10'>
            <p className='text-cosmic-silver/70 text-center italic'>
              Your recent charts and cosmic sessions will appear here as you
              explore the cosmos.
            </p>
          </div>
        </section>
      )}

      {/* Welcome Message for Non-Authenticated Users */}
      {user === null && (
        <section 
          className='bg-gradient-to-r from-cosmic-purple/20 to-cosmic-gold/20 backdrop-blur-lg border border-cosmic-gold/30 rounded-xl p-8 text-center'
          aria-labelledby="welcome-heading"
        >
          <h3 
            id="welcome-heading"
            className='text-2xl font-bold text-cosmic-gold mb-4 font-playfair'
          >
            Begin Your Cosmic Journey
          </h3>
          <p className='text-cosmic-silver/80 mb-6 leading-relaxed max-w-2xl mx-auto'>
            Discover the mysteries of the universe through personalized
            astrology charts, healing frequencies, and cosmic insights tailored
            just for you.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              onClick={navigateToSignup}
              className='px-8 py-3 bg-cosmic-gold hover:bg-cosmic-gold/80 text-cosmic-dark font-semibold rounded-lg transition-colors duration-300 focus:ring-2 focus:ring-cosmic-gold focus:ring-offset-2 focus:ring-offset-cosmic-dark'
            >
              Sign Up
            </button>
            <button
              onClick={navigateToAbout}
              className='px-8 py-3 border border-cosmic-silver/30 hover:border-cosmic-silver/50 text-cosmic-silver hover:bg-cosmic-silver/10 font-semibold rounded-lg transition-all duration-300 focus:ring-2 focus:ring-cosmic-silver focus:ring-offset-2 focus:ring-offset-cosmic-dark'
            >
              Learn More
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

// Apply React.memo for performance optimization
const MemoizedDashboard = React.memo(Dashboard);
MemoizedDashboard.displayName = 'Dashboard';

export default MemoizedDashboard;
