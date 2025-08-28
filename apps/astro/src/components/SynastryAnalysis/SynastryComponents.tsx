import React from 'react';
import './SynastryComponents.css';
import { FaStar, FaChevronDown } from 'react-icons/fa';
import * as Accordion from '@radix-ui/react-accordion';
import type { SynastryResult } from './types';

const SCORE_COLOR_MAP: Record<
  'excellent' | 'good' | 'moderate' | 'low',
  string
> = {
  excellent: 'text-green-500',
  good: 'text-blue-500',
  moderate: 'text-yellow-500',
  low: 'text-red-500',
};

const FILL_COLOR_MAP: Record<
  'excellent' | 'good' | 'moderate' | 'low',
  string
> = {
  excellent: 'bg-green-500',
  good: 'bg-blue-500',
  moderate: 'bg-yellow-500',
  low: 'bg-red-500',
};

// Safe aspect color classes (avoid dynamic Tailwind construction & ensure purge safety)
const ASPECT_COLOR_CLASS: Record<string, string> = {
  'green-500': 'bg-green-500',
  'orange-500': 'bg-orange-500',
  'gray-500': 'bg-gray-500',
};

interface ProgressBarProps {
  score: number;
  tier: 'excellent' | 'good' | 'moderate' | 'low';
}

export const ProgressBar: React.FC<ProgressBarProps> = React.memo(
  ({ score, tier }) => {
    const clamped = Math.min(Math.max(score, 0), 100);
    const step = Math.round(clamped / 5) * 5;
    const stepClass = `w-step-${step}`;
    return (
      <div className='progress-bar'>
        <div className={`progress-fill ${stepClass} ${FILL_COLOR_MAP[tier]}`} />
      </div>
    );
  }
);
ProgressBar.displayName = 'ProgressBar';

interface StarRatingProps {
  score: number;
}

export const StarRating: React.FC<StarRatingProps> = React.memo(({ score }) => {
  const stars = Math.round(score / 20);
  return (
    <div className='flex'>
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar
          key={i}
          className={`${i < stars ? 'text-yellow-400' : 'text-gray-300'} text-xl`}
        />
      ))}
    </div>
  );
});
StarRating.displayName = 'StarRating';

interface CompatibilityScoreProps {
  synastryResult: SynastryResult;
}

export const CompatibilityScore: React.FC<CompatibilityScoreProps> = React.memo(
  ({ synastryResult }) => {
    const tierFor = (
      score: number
    ): 'excellent' | 'good' | 'moderate' | 'low' => {
      if (score >= 80) return 'excellent';
      if (score >= 60) return 'good';
      if (score >= 40) return 'moderate';
      return 'low';
    };
    const tier = tierFor(synastryResult.compatibility_analysis.overall_score);
    const colorClass = SCORE_COLOR_MAP[tier];
    return (
      <div className='col-span-1 border lg:col-span-2 cosmic-card border-cosmic-silver/30'>
        <div className='p-4'>
          <h3 className='mb-4 font-bold text-md text-cosmic-silver'>
            Overall Compatibility Score
          </h3>

          <div className='flex items-center mb-4 space-x-4'>
            <StarRating
              score={synastryResult.compatibility_analysis.overall_score}
            />
            <span className={`text-3xl font-bold ${colorClass}`}>
              {synastryResult.compatibility_analysis.overall_score}/100
            </span>
          </div>

          <p className='mb-6 text-cosmic-silver'>
            {synastryResult.compatibility_analysis.interpretation}
          </p>

          {/* Compatibility Breakdown */}
          {synastryResult.compatibility_analysis.breakdown !== null &&
            synastryResult.compatibility_analysis.breakdown !== undefined && (
              <div>
                <h4 className='mb-4 text-sm font-bold text-cosmic-silver'>
                  Compatibility Areas
                </h4>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {Object.entries(
                    synastryResult.compatibility_analysis.breakdown
                  ).map(([area, score]) => {
                    const t = tierFor(score);
                    return (
                      <div
                        key={area}
                        className='p-4 border rounded-md border-cosmic-silver/30'
                      >
                        <p className='mb-2 text-sm font-semibold capitalize text-cosmic-silver'>
                          {area.charAt(0).toUpperCase() + area.slice(1)}
                        </p>
                        <ProgressBar score={score} tier={t} />
                        <p className='text-sm text-white/80'>
                          {score.toFixed(1)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
                {synastryResult.compatibility_analysis.meta !== null &&
                  synastryResult.compatibility_analysis.meta !== undefined && (
                    <div className='mt-6 text-xs text-white/60 space-y-1'>
                      <p className='font-semibold text-cosmic-silver'>
                        Scoring Meta
                      </p>
                      <p>
                        Overlay Bonus Applied:{' '}
                        {
                          synastryResult.compatibility_analysis.meta
                            .overlay_bonus_applied
                        }
                      </p>
                      <p>
                        Aspect Counts:{' '}
                        {Object.entries(
                          synastryResult.compatibility_analysis.meta
                            .aspect_type_counts
                        )
                          .map(([k, v]) => `${k}:${v}`)
                          .join(', ')}
                      </p>
                    </div>
                  )}
              </div>
            )}
        </div>
      </div>
    );
  }
);
CompatibilityScore.displayName = 'CompatibilityScore';

interface KeyAspectsProps {
  synastryResult: SynastryResult;
  getAspectColor: (aspect: string) => string;
  formatPlanetName: (planet: string) => string;
}

export const KeyAspects: React.FC<KeyAspectsProps> = React.memo(
  ({ synastryResult, getAspectColor, formatPlanetName }) => (
    <div className='border cosmic-card border-cosmic-silver/30 h-fit'>
      <div className='p-4'>
        <Accordion.Root type='single' collapsible defaultValue='0'>
          <Accordion.Item value='0'>
            <Accordion.Trigger className='flex justify-between w-full'>
              <span className='text-sm font-bold'>
                Key Relationship Aspects
              </span>
              <FaChevronDown className='text-cosmic-silver' />
            </Accordion.Trigger>
            <Accordion.Content className='pb-4'>
              <div className='flex flex-col space-y-3'>
                {synastryResult.interaspects
                  .slice(0, 8)
                  .map((aspect, index) => (
                    <div
                      key={index}
                      className='p-3 border rounded-md border-cosmic-silver/30'
                    >
                      <div className='flex justify-between mb-2'>
                        <span className='text-sm font-semibold text-cosmic-silver'>
                          {formatPlanetName(aspect.person1_planet)}{' '}
                          {aspect.aspect}{' '}
                          {formatPlanetName(aspect.person2_planet)}
                        </span>
                        <span
                          className={`${ASPECT_COLOR_CLASS[getAspectColor(aspect.aspect)] ?? 'bg-gray-500'} text-white px-2 py-1 rounded text-sm`}
                        >
                          {aspect.aspect}
                        </span>
                      </div>
                      <p className='mb-1 text-xs text-white/80'>
                        Orb: {aspect.orb.toFixed(2)}° | Strength:{' '}
                        {aspect.strength}
                      </p>
                      <p className='text-sm text-cosmic-silver'>
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
  )
);
KeyAspects.displayName = 'KeyAspects';

interface HouseOverlaysProps {
  synastryResult: SynastryResult;
  formatPlanetName: (planet: string) => string;
}

export const HouseOverlays: React.FC<HouseOverlaysProps> = React.memo(
  ({ synastryResult, formatPlanetName }) => (
    <div className='border cosmic-card border-cosmic-silver/30'>
      <div className='p-4'>
        <Accordion.Root type='single' collapsible>
          <Accordion.Item value='0'>
            <Accordion.Trigger className='flex justify-between w-full'>
              <span className='text-sm font-bold'>House Overlays</span>
              <FaChevronDown className='text-cosmic-silver' />
            </Accordion.Trigger>
            <Accordion.Content className='pb-4'>
              <div className='flex flex-col space-y-3'>
                {synastryResult.house_overlays
                  .slice(0, 6)
                  .map((overlay, index) => (
                    <div key={index} className='p-3 rounded-md bg-gray-50'>
                      <p className='mb-1 text-sm font-semibold text-cosmic-silver'>
                        {formatPlanetName(overlay.person1_planet)} in{' '}
                        {overlay.person2_house}th House
                      </p>
                      <p className='text-sm text-white/80'>
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
  )
);
HouseOverlays.displayName = 'HouseOverlays';

interface CompositeChartProps {
  synastryResult: SynastryResult;
}

export const CompositeChart: React.FC<CompositeChartProps> = React.memo(
  ({ synastryResult }) => (
    <div className='border cosmic-card border-cosmic-silver/30'>
      <div className='p-4'>
        <Accordion.Root type='single' collapsible>
          <Accordion.Item value='0'>
            <Accordion.Trigger className='flex justify-between w-full'>
              <span className='text-sm font-bold'>Composite Chart</span>
              <FaChevronDown className='text-cosmic-silver' />
            </Accordion.Trigger>
            <Accordion.Content className='pb-4'>
              <p className='mb-2 font-semibold text-cosmic-silver'>
                Relationship Purpose:
              </p>
              <p className='mb-4 text-cosmic-silver'>
                {synastryResult.composite_chart.relationship_purpose}
              </p>

              <p className='text-sm text-white/80'>
                Composite Sun:{' '}
                {synastryResult.composite_chart.midpoint_sun.toFixed(2)}°
                <br />
                Composite Moon:{' '}
                {synastryResult.composite_chart.midpoint_moon.toFixed(2)}°
              </p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    </div>
  )
);
CompositeChart.displayName = 'CompositeChart';

interface RelationshipSummaryProps {
  synastryResult: SynastryResult;
}

export const RelationshipSummary: React.FC<RelationshipSummaryProps> =
  React.memo(({ synastryResult }) => (
    <div className='col-span-1 border lg:col-span-2 cosmic-card border-cosmic-silver/30'>
      <div className='p-4'>
        <h3 className='mb-4 font-bold text-md text-cosmic-silver'>
          Relationship Summary
        </h3>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='flex flex-col space-y-4'>
            <div>
              <p className='mb-2 font-semibold text-green-600'>🌟 Key Themes</p>
              <div className='flex flex-wrap space-x-2'>
                {synastryResult.summary.key_themes.map((theme, index) => (
                  <span
                    key={index}
                    className='px-2 py-1 text-sm text-green-500 rounded bg-green-500/20'
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className='mb-2 font-semibold text-blue-600'>💪 Strengths</p>
              <div className='flex flex-col space-y-1'>
                {synastryResult.summary.strengths.map((strength, index) => (
                  <p key={index} className='text-sm text-cosmic-silver'>
                    • {strength}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className='flex flex-col space-y-4'>
            <div>
              <p className='mb-2 font-semibold text-orange-600'>
                🔄 Growth Areas
              </p>
              <div className='flex flex-col space-y-1'>
                {synastryResult.summary.challenges.map((challenge, index) => (
                  <p key={index} className='text-sm text-cosmic-silver'>
                    • {challenge}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <p className='mb-2 font-semibold text-purple-600'>
                💡 Relationship Advice
              </p>
              <div className='flex flex-col space-y-1'>
                {synastryResult.summary.advice.map((advice, index) => (
                  <p key={index} className='text-sm text-cosmic-silver'>
                    • {advice}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));
RelationshipSummary.displayName = 'RelationshipSummary';
