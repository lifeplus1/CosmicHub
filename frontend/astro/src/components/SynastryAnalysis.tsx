import React, { useState, useCallback, useMemo } from 'react';
import { FaStar, FaInfoCircle, FaChevronDown } from 'react-icons/fa';
import * as Accordion from '@radix-ui/react-accordion';
import type { BirthData } from '../types';
import FeatureGuard from './FeatureGuard';

interface SynastryAnalysisProps {
  person1: BirthData;
  person2: BirthData;
  person1Name?: string;
  person2Name?: string;
}

interface SynastryResult {
  compatibility_analysis: {
    overall_score: number;
    interpretation: string;
    breakdown: Record<string, number>;
  };
  interaspects: Array<{
    person1_planet: string;
    person2_planet: string;
    aspect: string;
    orb: number;
    strength: string;
    interpretation: string;
  }>;
  house_overlays: Array<{
    person1_planet: string;
    person2_house: number;
    interpretation: string;
  }>;
  composite_chart: {
    midpoint_sun: number;
    midpoint_moon: number;
    relationship_purpose: string;
  };
  summary: {
    key_themes: string[];
    strengths: string[];
    challenges: string[];
    advice: string[];
  };
}

export const SynastryAnalysis = React.memo<SynastryAnalysisProps>(({
  person1,
  person2,
  person1Name = "Person 1",
  person2Name = "Person 2"
}) => {
  const [synastryResult, setSynastryResult] = useState<SynastryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardBg = 'cosmic-blue';
  const borderColor = 'cosmic-silver/30';

  const calculateSynastry = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/calculate-synastry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          person1,
          person2
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate synastry');
      }

      const data = await response.json();
      setSynastryResult(data.synastry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [person1, person2]);

  const getCompatibilityColor = useCallback((score: number) => {
    if (score >= 80) return 'green-500';
    if (score >= 60) return 'blue-500';
    if (score >= 40) return 'yellow-500';
    return 'red-500';
  }, []);

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

  const renderStars = useMemo(() => (score: number): JSX.Element[] => {
    const stars = Math.round(score / 20);
    return Array.from({ length: 5 }).map((_, i) => (
      <FaStar 
        key={i} 
        className={`${i < stars ? 'text-yellow-400' : 'text-gray-300'} text-xl`}
      />
    ));
  }, []);

  // Component for progress bars without inline styles
  const ProgressBar = useCallback(({ score, colorClass }: { score: number; colorClass: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
      <div 
        className={`bg-${colorClass} h-2.5 rounded-full transition-all duration-300`}
        style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
      />
    </div>
  ), []);

  return (
    <FeatureGuard requiredTier="premium" feature="synastry">
      <div className="py-8 mx-auto max-w-7xl">
        <div className="flex flex-col space-y-6">
          <div className="text-center">
            <h2 className="mb-4 text-xl font-bold text-purple-600">
              💕 Relationship Compatibility Analysis
            </h2>
            <p className="text-lg text-white/80">
              Synastry Comparison: {person1Name} & {person2Name}
            </p>
          </div>

          <div className={`cosmic-card bg-${cardBg} border border-${borderColor}`}>
            <div className="p-4">
              <p className="mb-4 text-cosmic-silver">
                Synastry compares two birth charts to reveal relationship dynamics, compatibility patterns, 
                and growth opportunities between partners.
              </p>

              {!synastryResult && (
                <button
                  className="cosmic-button"
                  onClick={calculateSynastry}
                  disabled={loading}
                >
                  {loading ? 'Calculating...' : ''}
                  <FaInfoCircle className="mr-2" />
                  Calculate Compatibility
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 border border-red-500 rounded-md bg-red-900/50">
              <div className="flex space-x-4">
                <span className="text-xl text-red-500">⚠️</span>
                {error}
              </div>
            </div>
          )}

          {synastryResult && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Overall Compatibility Score */}
              <div className="col-span-1 lg:col-span-2 cosmic-card border border-${borderColor}">
                <div className="p-4">
                  <h3 className="mb-4 font-bold text-md text-cosmic-silver">Overall Compatibility Score</h3>
                  
                  <div className="flex items-center mb-4 space-x-4">
                    <div className="flex">
                      {renderStars(synastryResult.compatibility_analysis.overall_score)}
                    </div>
                    <span className={`text-3xl font-bold text-${getCompatibilityColor(synastryResult.compatibility_analysis.overall_score)}`}>
                      {synastryResult.compatibility_analysis.overall_score}/100
                    </span>
                  </div>
                  
                  <p className="mb-6 text-cosmic-silver">
                    {synastryResult.compatibility_analysis.interpretation}
                  </p>

                  {/* Compatibility Breakdown */}
                  {synastryResult.compatibility_analysis.breakdown && (
                    <div>
                      <h4 className="mb-4 text-sm font-bold text-cosmic-silver">Compatibility Areas</h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(synastryResult.compatibility_analysis.breakdown).map(([area, score]) => (
                          <div key={area} className="p-4 border rounded-md border-cosmic-silver/30">
                            <p className="mb-2 text-sm font-semibold capitalize text-cosmic-silver">
                              {area.charAt(0).toUpperCase() + area.slice(1)}
                            </p>
                            <ProgressBar score={score} colorClass={getCompatibilityColor(score)} />
                            <p className="text-sm text-white/80">
                              {score.toFixed(1)}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Relationship Aspects */}
              <div>
                <div className="cosmic-card border border-${borderColor} h-fit">
                  <div className="p-4">
                    <Accordion.Root type="single" collapsible defaultValue="0">
                      <Accordion.Item value="0">
                        <Accordion.Trigger className="flex justify-between w-full">
                          <span className="text-sm font-bold">Key Relationship Aspects</span>
                          <FaChevronDown className="text-cosmic-silver" />
                        </Accordion.Trigger>
                        <Accordion.Content className="pb-4">
                          <div className="flex flex-col space-y-3">
                            {synastryResult.interaspects.slice(0, 8).map((aspect, index) => (
                              <div key={index} className="p-3 border rounded-md border-cosmic-silver/30">
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm font-semibold text-cosmic-silver">
                                    {formatPlanetName(aspect.person1_planet)} {aspect.aspect} {formatPlanetName(aspect.person2_planet)}
                                  </span>
                                  <span className={`bg-${getAspectColor(aspect.aspect)} text-white px-2 py-1 rounded text-sm`}>
                                    {aspect.aspect}
                                  </span>
                                </div>
                                <p className="mb-1 text-xs text-white/80">
                                  Orb: {aspect.orb.toFixed(2)}° | Strength: {aspect.strength}
                                </p>
                                <p className="text-sm text-cosmic-silver">
                                  {aspect.interpretation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </Accordion.Content>
                      </Accordion.Item>
                    </Accordion.Root>
                  </div>
                </div>
              </div>

              {/* House Overlays & Composite */}
              <div>
                <div className="flex flex-col space-y-4">
                  <div className="cosmic-card border border-${borderColor}">
                    <div className="p-4">
                      <Accordion.Root type="single" collapsible>
                        <Accordion.Item value="0">
                          <Accordion.Trigger className="flex justify-between w-full">
                            <span className="text-sm font-bold">House Overlays</span>
                            <FaChevronDown className="text-cosmic-silver" />
                          </Accordion.Trigger>
                          <Accordion.Content className="pb-4">
                            <div className="flex flex-col space-y-3">
                              {synastryResult.house_overlays.slice(0, 6).map((overlay, index) => (
                                <div key={index} className="p-3 rounded-md bg-gray-50">
                                  <p className="mb-1 text-sm font-semibold text-cosmic-silver">
                                    {formatPlanetName(overlay.person1_planet)} in {overlay.person2_house}th House
                                  </p>
                                  <p className="text-sm text-white/80">
                                    {overlay.interpretation}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </Accordion.Content>
                        </Accordion.Item>
                      </Accordion.Root>
                    </div>
                  </div>

                  <div className="cosmic-card border border-${borderColor}">
                    <div className="p-4">
                      <Accordion.Root type="single" collapsible>
                        <Accordion.Item value="0">
                          <Accordion.Trigger className="flex justify-between w-full">
                            <span className="text-sm font-bold">Composite Chart</span>
                            <FaChevronDown className="text-cosmic-silver" />
                          </Accordion.Trigger>
                          <Accordion.Content className="pb-4">
                            <p className="mb-2 font-semibold text-cosmic-silver">Relationship Purpose:</p>
                            <p className="mb-4 text-cosmic-silver">
                              {synastryResult.composite_chart.relationship_purpose}
                            </p>
                            
                            <p className="text-sm text-white/80">
                              Composite Sun: {synastryResult.composite_chart.midpoint_sun.toFixed(2)}°
                              <br />
                              Composite Moon: {synastryResult.composite_chart.midpoint_moon.toFixed(2)}°
                            </p>
                          </Accordion.Content>
                        </Accordion.Item>
                      </Accordion.Root>
                    </div>
                  </div>
                </div>
              </div>

              {/* Relationship Summary */}
              <div className="col-span-1 lg:col-span-2 cosmic-card border border-${borderColor}">
                <div className="p-4">
                  <h3 className="mb-4 font-bold text-md text-cosmic-silver">Relationship Summary</h3>
                  
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex flex-col space-y-4">
                      <div>
                        <p className="mb-2 font-semibold text-green-600">
                          🌟 Key Themes
                        </p>
                        <div className="flex flex-wrap space-x-2">
                          {synastryResult.summary.key_themes.map((theme, index) => (
                            <span key={index} className="px-2 py-1 text-sm text-green-500 rounded bg-green-500/20">
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-blue-600">
                          💪 Strengths
                        </p>
                        <div className="flex flex-col space-y-1">
                          {synastryResult.summary.strengths.map((strength, index) => (
                            <p key={index} className="text-sm text-cosmic-silver">
                              • {strength}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                      <div>
                        <p className="mb-2 font-semibold text-orange-600">
                          🔄 Growth Areas
                        </p>
                        <div className="flex flex-col space-y-1">
                          {synastryResult.summary.challenges.map((challenge, index) => (
                            <p key={index} className="text-sm text-cosmic-silver">
                              • {challenge}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-purple-600">
                          💡 Relationship Advice
                        </p>
                        <div className="flex flex-col space-y-1">
                          {synastryResult.summary.advice.map((advice, index) => (
                            <p key={index} className="text-sm text-cosmic-silver">
                              • {advice}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="col-span-1 lg:col-span-2">
                <div className="flex justify-center space-x-4">
                  <button
                    className="px-4 py-2 text-blue-500 transition-colors border border-blue-500 rounded bg-blue-500/20 hover:bg-blue-500/30"
                    onClick={() => window.location.href = '/transits'}
                  >
                    View Relationship Transits
                  </button>
                  <button
                    className="px-4 py-2 text-purple-500 transition-colors border border-purple-500 rounded bg-purple-500/20 hover:bg-purple-500/30"
                    onClick={calculateSynastry}
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
});