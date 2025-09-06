import React from 'react';
import type { FrequencyPreset } from '../../types/frequency';

interface AstrologyEnhancement {
  planet?: string;
  sign?: string;
  element?: string;
  planetaryAlignment?: string;
  transitInfluence?: string;
  recommendedDuration?: number;
  chartHarmonic?: number;
}

interface AstroFrequencyPreset extends FrequencyPreset {
  astrologyData?: AstrologyEnhancement;
}

interface AstroInfoProps {
  preset: AstroFrequencyPreset;
}

/**
 * Displays detailed astrology information for the selected frequency preset
 */
const AstroInfo: React.FC<AstroInfoProps> = ({ preset }) => {
  return (
    <div
      className='p-4 border border-purple-200 rounded-lg bg-purple-50'
      role='region'
      aria-label='Astrology Information'
    >
      <h3 className='mb-3 text-lg font-semibold text-purple-800'>
        🌟 Astrology Enhancement Details
      </h3>

      <div className='grid gap-4 md:grid-cols-2'>
        <div>
          <h4 className='font-medium text-purple-700'>Frequency Information</h4>
          <div className='mt-2 space-y-1 text-sm text-purple-600'>
            <p>
              <strong>Name:</strong> {preset.name}
            </p>
            <p>
              <strong>Base Frequency:</strong> {preset.frequency} Hz
            </p>
            <p>
              <strong>Category:</strong> {preset.category}
            </p>
            {preset.description !== null &&
              preset.description !== undefined &&
              preset.description !== '' && (
                <p>
                  <strong>Description:</strong> {preset.description}
                </p>
              )}
          </div>
        </div>

        {preset.astrologyData !== null &&
          preset.astrologyData !== undefined && (
            <div>
              <h4 className='font-medium text-purple-700'>
                Astrological Context
              </h4>
              <ul className='mt-2 space-y-1 text-sm text-purple-600'>
                <li>
                  <strong>Planetary Alignment:</strong>{' '}
                  {preset.astrologyData.planetaryAlignment}
                </li>
                <li>
                  <strong>Transit Influence:</strong>{' '}
                  {preset.astrologyData.transitInfluence}
                </li>
                <li>
                  <strong>Recommended Duration:</strong>{' '}
                  {preset.astrologyData.recommendedDuration} minutes
                </li>
                <li>
                  <strong>Chart Harmonic:</strong>{' '}
                  {preset.astrologyData.chartHarmonic}
                </li>
              </ul>
            </div>
          )}
      </div>

      <div className='p-3 mt-4 bg-white rounded border-l-4 border-purple-400'>
        <h4 className='font-medium text-purple-800'>Benefits & Usage</h4>
        <p className='mt-1 text-sm text-purple-700'>
          This frequency is enhanced by current astrological conditions to
          provide optimal therapeutic benefits. The personalized adjustments are
          based on your natal chart&apos;s dominant elements and current
          planetary transits.
        </p>

        {preset.astrologyData?.planetaryAlignment && (
            <div className='mt-2 text-xs text-purple-600'>
              <strong>Optimal Times:</strong> Sessions are most effective during{' '}
              {preset.astrologyData.planetaryAlignment.toLowerCase()} periods.
            </div>
          )}
      </div>
    </div>
  );
};

export default AstroInfo;
