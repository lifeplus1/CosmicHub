/**
 * Interactive Chart Integration Example
 * Demonstrates how to use the enhanced chart system
 */

import React, { useState, Suspense, lazy } from 'react';
import { createStubChartData } from '../test-utils/createStubChartData';
import { devConsole } from '../config/environment';
import { getChartSyncService } from '../services/chartSyncService';
import {
  getChartAnalyticsService,
  type PersonalityInsight,
  type ChartAnalysis,
} from '../services/chartAnalyticsService';
import { getNotificationManager } from '../services/notificationManager';
import { Button } from '@cosmichub/ui';
import type { UnifiedBirthData } from '@cosmichub/types';

// Lazy load the heavy chart component
const ChartWheelUnified = lazy(
  () => import('../features/ChartWheelUnified')
);
// Use Aspect type from services instead
import type { Aspect } from '../services/api.types';

const sampleUnifiedBirthData: UnifiedBirthData = {
  year: 1990,
  month: 6,
  day: 15,
  hour: 14,
  minute: 30,
  city: 'New York',
  lat: 40.7128,
  lon: -74.006,
};

// Convert to ExtendedBirthData format for chart operations
const sampleExtendedBirthData = {
  birth_date: '06/15/1990',
  birth_time: '14:30',
  latitude: 40.7128,
  longitude: -74.006,
  city: 'New York',
  year: 1990,
  month: 6,
  day: 15,
  hour: 14,
  minute: 30,
  timezone: 'America/New_York',
};

const _sampleBirthData = sampleUnifiedBirthData;

export const InteractiveChartExample: React.FC = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  type AnalysisState = PersonalityInsight[] | ChartAnalysis | null;
  const [analysisResult, setAnalysisResult] = useState<AnalysisState>(null);
  const [chartRegistered, setChartRegistered] = useState(false);

  const handlePlanetSelect = (planet: string) => {
    setSelectedPlanet(planet);

    // Get analytics for selected planet
    const analyticsService = getChartAnalyticsService();
    const stubChart = createStubChartData();
    const insights = analyticsService.getPersonalityInsights(stubChart);

    setAnalysisResult(insights);

    // Send notification about planet selection
    const _notificationManager = getNotificationManager();
    // TODO: Fix missing sendTest method
    // if (typeof notificationManager.sendTest === 'function') {
    //   const result = notificationManager.sendTest.call(notificationManager);
    //   if (
    //     result !== null &&
    //     typeof result === 'object' &&
    //     'then' in result &&
    //     typeof (result as Promise<unknown>).then === 'function'
    //   ) {
    //     await (result as Promise<unknown>);
    //   }
    // }
  };

  const handleRegisterChart = async () => {
    const syncService = getChartSyncService();

    try {
      await syncService.registerChart(
        'example-chart',
        sampleExtendedBirthData,
        {
          enableTransitUpdates: true,
          enableProgressions: false,
          aspectAlerts: true,
          updateInterval: 1, // 1 minute for demo
        }
      );

      setChartRegistered(true);

      // Listen for chart events
      syncService.on('aspect-event', event => {
        devConsole.log?.('Aspect event detected:', event);
      });

      syncService.on('transit-update', event => {
        devConsole.log?.('Transit update received:', event);
      });
    } catch (error) {
      devConsole.error('❌ Failed to register chart:', error);
    }
  };

  const handleAnalyzeChart = () => {
    const analyticsService = getChartAnalyticsService();

    try {
      const analysis = analyticsService.analyzeChart(
        'example-chart',
        createStubChartData()
      );

      // Minimal stub ChartData builder (kept internal to example)

      setAnalysisResult(analysis);
    } catch (error) {
      devConsole.error('❌ Failed to analyze chart:', error);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='bg-cosmic-dark/50 rounded-lg p-6 border border-cosmic-gold/30'>
        <h2 className='text-2xl font-bold text-cosmic-gold mb-4'>
          🌟 Interactive Chart Integration Demo
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <Button
            onClick={() => {
              void handleRegisterChart();
            }}
            disabled={chartRegistered}
            variant={chartRegistered ? 'secondary' : 'default'}
            className='w-full'
          >
            {chartRegistered ? '✅ Chart Registered' : '🔄 Register Chart'}
          </Button>

          <Button
            onClick={() => {
              void handleAnalyzeChart();
            }}
            variant='secondary'
            className='w-full'
          >
            📊 Analyze Chart
          </Button>

          <Button
            onClick={() => {
              setAnalysisResult(null);
            }}
            variant='secondary'
            className='w-full'
          >
            🗑️ Clear Results
          </Button>
        </div>

        {selectedPlanet !== null && selectedPlanet !== undefined && (
          <div className='bg-cosmic-purple/20 rounded p-4 mb-4 border border-cosmic-gold/20'>
            <h3 className='text-cosmic-gold font-semibold mb-2'>
              Selected Planet: {selectedPlanet}
            </h3>
            <p className='text-cosmic-silver text-sm'>
              Click on planets in the chart below to explore their energies and
              meanings.
            </p>
          </div>
        )}

        {analysisResult !== null && analysisResult !== undefined && (
          <div className='bg-green-900/20 rounded p-4 mb-4 border border-green-500/30'>
            <h3 className='text-green-400 font-semibold mb-2'>
              Analysis Results
            </h3>
            <pre className='text-green-300 text-xs overflow-auto max-h-32'>
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Interactive Chart */}
      <Suspense
        fallback={
          <div className='flex items-center justify-center h-[600px] bg-cosmic-dark rounded-lg border border-cosmic-purple animate-pulse'>
            <div className='flex flex-col items-center space-y-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-gold'></div>
              <span className='text-cosmic-silver'>
                Loading Interactive Chart...
              </span>
            </div>
          </div>
        }
      >
        <ChartWheelUnified
          birthData={sampleExtendedBirthData}
          showAspects={true}
          showAnimation={true}
          interactive={true}
          showTransits={chartRegistered}
          realTimeUpdates={chartRegistered}
          size="lg"
          showControls={true}
          onPlanetSelect={(planet: string) => {
            void handlePlanetSelect(planet);
          }}
          onAspectSelect={(aspect: Aspect) => {
            devConsole.log?.('Aspect selected:', {
              planets: `${aspect.planet1}-${aspect.planet2}`,
              type: aspect.aspect_type,
              orb: aspect.orb,
              strength: aspect.power,
            });
          }}
        />
      </Suspense>

      {/* Feature Showcase */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <div className='bg-blue-900/20 rounded p-4 border border-blue-500/30'>
          <h3 className='text-blue-400 font-semibold mb-2'>
            🔄 Real-time Transits
          </h3>
          <p className='text-blue-300 text-sm'>
            Live planetary positions updated every minute with automatic aspect
            detection.
          </p>
        </div>

        <div className='bg-purple-900/20 rounded p-4 border border-purple-500/30'>
          <h3 className='text-purple-400 font-semibold mb-2'>
            📊 Smart Analytics
          </h3>
          <p className='text-purple-300 text-sm'>
            AI-powered pattern recognition and personality insights from chart
            data.
          </p>
        </div>

        <div className='bg-orange-900/20 rounded p-4 border border-orange-500/30'>
          <h3 className='text-orange-400 font-semibold mb-2'>
            🎯 Interactive D3
          </h3>
          <p className='text-orange-300 text-sm'>
            Smooth animations, hover tooltips, and clickable chart elements.
          </p>
        </div>

        <div className='bg-green-900/20 rounded p-4 border border-green-500/30'>
          <h3 className='text-green-400 font-semibold mb-2'>
            🔔 Smart Notifications
          </h3>
          <p className='text-green-300 text-sm'>
            Personalized alerts for important transits and astrological events.
          </p>
        </div>

        <div className='bg-pink-900/20 rounded p-4 border border-pink-500/30'>
          <h3 className='text-pink-400 font-semibold mb-2'>
            📱 Responsive Design
          </h3>
          <p className='text-pink-300 text-sm'>
            Perfect viewing experience across all devices with touch support.
          </p>
        </div>

        <div className='bg-yellow-900/20 rounded p-4 border border-yellow-500/30'>
          <h3 className='text-yellow-400 font-semibold mb-2'>⚡ Performance</h3>
          <p className='text-yellow-300 text-sm'>
            Optimized rendering with smart caching and efficient data updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveChartExample;
