import React from 'react';
import type { MayanChartData } from './types';

interface Props {
  data: MayanChartData;
}

const MayanChart: React.FC<Props> = ({ data }) => {
  if (data === undefined || data === null) {
    return (
      <p className='text-cosmic-silver'>No Mayan astrology data available</p>
    );
  }

  return (
    <div className='flex flex-col space-y-4'>
      <div className='cosmic-card bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30'>
        <div className='p-4'>
          <h3 className='mb-4 font-bold text-green-400 text-md'>
            Mayan Astrology
          </h3>
          <p className='mb-4 text-sm font-medium text-cosmic-silver'>
            {data.description}
          </p>

          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div>
              <p className='mb-2 font-bold text-cosmic-silver'>Tzolk&apos;in Signature</p>
              <p className='mb-2 text-2xl text-green-400'>
                {data.sacred_number?.number} {data.day_sign?.name}
              </p>
              <p className='mb-2 text-sm text-cosmic-silver/80'>
                <strong>Symbol:</strong> {data.day_sign?.symbol}
              </p>
              <p className='mb-2 text-sm text-cosmic-silver/80'>
                <strong>Color:</strong> {data.day_sign?.color}
              </p>
              <p className='mb-2 text-sm text-cosmic-silver/80'>
                <strong>Meaning:</strong> {data.day_sign?.meaning}
              </p>
            </div>
            <div>
              <p className='mb-2 font-bold text-cosmic-silver'>Wavespell</p>
              <p className='mb-2 text-sm text-cosmic-silver/80'>
                <strong>Tone:</strong> {data.wavespell?.tone?.name} (
                {data.wavespell?.position})
              </p>
              <p className='mb-4 text-sm text-cosmic-silver/80'>{data.wavespell?.description}</p>
              <p className='mb-2 font-bold text-cosmic-silver'>Long Count</p>
              <p className='font-mono text-sm text-cosmic-silver/80'>{data.long_count?.date}</p>
            </div>
          </div>

          <p className='mb-2 font-bold text-cosmic-silver'>Galactic Signature</p>
          <p className='mb-4 text-sm text-cosmic-silver/80'>{data.galactic_signature}</p>

          <p className='mb-2 font-bold text-cosmic-silver'>Life Purpose</p>
          <p className='mb-4 text-sm text-cosmic-silver/80'>{data.life_purpose}</p>

          <p className='mb-2 font-bold text-cosmic-silver'>Spiritual Guidance</p>
          <p className='text-sm text-cosmic-silver/80'>{data.spiritual_guidance}</p>
        </div>
      </div>
    </div>
  );
};

export default MayanChart;
