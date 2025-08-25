import React, { useState, useCallback } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import FeatureGuard from '../FeatureGuard';
import { apiClient } from '../../services/api';
import {
  CompatibilityScore,
  KeyAspects,
  HouseOverlays,
  CompositeChart,
  RelationshipSummary,
} from './SynastryComponents';
import type { SynastryAnalysisProps, SynastryResult } from './types';
import { synastryRequestSchema } from '../../utils/validation';

export const SynastryAnalysis = React.memo<SynastryAnalysisProps>(
  ({
    person1,
    person2,
    person1Name = 'Person 1',
    person2Name = 'Person 2',
  }) => {
    const [synastryResult, setSynastryResult] = useState<SynastryResult | null>(
      null
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cardBg = 'cosmic-blue';
    const borderColor = 'cosmic-silver/30';

    const calculateSynastry = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const parsed = synastryRequestSchema.parse({ person1, person2 });
        // Unified endpoint: backend router mounted at /api/synastry, path /calculate-synastry
        const result = await apiClient.post<SynastryResult>(
          '/synastry/calculate-synastry',
          parsed
        );
        setSynastryResult(result);
      } catch (err) {
        const message: string =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(message);
      } finally {
        setLoading(false);
      }
    }, [person1, person2]);

    const getAspectColor = useCallback((aspect: string) => {
      switch (aspect) {
        case 'conjunction':
        case 'trine':
        case 'sextile':
          return 'green-500';
        case 'square':
        case 'opposition':
          return 'orange-500';
        default:
          return 'gray-500';
      }
    }, []);

    const formatPlanetName = useCallback((planet: string) => {
      return planet.charAt(0).toUpperCase() + planet.slice(1);
    }, []);

    return (
      <FeatureGuard requiredTier='premium' feature='synastry_analysis'>
        <div className='py-8 mx-auto max-w-7xl'>
          <div className='flex flex-col space-y-6'>
            <div className='text-center'>
              <h2 className='mb-4 text-xl font-bold text-purple-600'>
                💕 Relationship Compatibility Analysis
              </h2>
              <p className='text-lg text-white/80'>
                Synastry Comparison: {person1Name} & {person2Name}
              </p>
            </div>

            <div
              className={`cosmic-card bg-${cardBg} border border-${borderColor}`}
            >
              <div className='p-4'>
                <p className='mb-4 text-cosmic-silver'>
                  Synastry compares two birth charts to reveal relationship
                  dynamics, compatibility patterns, and growth opportunities
                  between partners.
                </p>

                {synastryResult === null && (
                  <button
                    className='cosmic-button'
                    onClick={() => {
                      void calculateSynastry();
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Calculating...' : 'Calculate Compatibility'}
                    <FaInfoCircle className='mr-2' />
                    <span className='sr-only'>
                      Start synastry compatibility calculation
                    </span>
                  </button>
                )}
              </div>
            </div>

            {error !== null && (
              <div className='p-4 border border-red-500 rounded-md bg-red-900/50'>
                <div className='flex space-x-4'>
                  <span className='text-xl text-red-500'>⚠️</span>
                  {error}
                </div>
              </div>
            )}

            {loading === true && synastryResult === null && (
              <div
                className='grid grid-cols-1 gap-6 lg:grid-cols-2 animate-pulse'
                aria-hidden
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className='h-40 border rounded cosmic-card border-cosmic-silver/30 bg-gray-800/40'
                  />
                ))}
              </div>
            )}

            {synastryResult !== null && loading === false && (
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Overall Compatibility Score */}
                <CompatibilityScore synastryResult={synastryResult} />

                {/* Key Relationship Aspects */}
                <KeyAspects
                  synastryResult={synastryResult}
                  getAspectColor={getAspectColor}
                  formatPlanetName={formatPlanetName}
                />

                {/* House Overlays & Composite */}
                <div className='flex flex-col space-y-4'>
                  <HouseOverlays
                    synastryResult={synastryResult}
                    formatPlanetName={formatPlanetName}
                  />

                  <CompositeChart synastryResult={synastryResult} />
                </div>

                {/* Relationship Summary */}
                <RelationshipSummary synastryResult={synastryResult} />

                {/* Action Buttons */}
                <div className='col-span-1 lg:col-span-2'>
                  <div className='flex justify-center space-x-4'>
                    <button
                      className='px-4 py-2 text-blue-500 transition-colors border border-blue-500 rounded bg-blue-500/20 hover:bg-blue-500/30'
                      onClick={() => (window.location.href = '/transits')}
                    >
                      View Relationship Transits
                    </button>
                    <button
                      className='px-4 py-2 text-purple-500 transition-colors border border-purple-500 rounded bg-purple-500/20 hover:bg-purple-500/30'
                      onClick={() => {
                        void calculateSynastry();
                      }}
                      disabled={loading}
                    >
                      Recalculate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </FeatureGuard>
    );
  }
);

SynastryAnalysis.displayName = 'SynastryAnalysis';

export default SynastryAnalysis;
