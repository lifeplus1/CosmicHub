import React from 'react';
import type { AyurvedaChartData } from './types';

interface SynthesisTabProps {
  data?: AyurvedaChartData['synthesis'];
}

const SynthesisTab: React.FC<SynthesisTabProps> = React.memo(({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No synthesis data available</div>;
  }

  return (
    <div className='space-y-6'>
      {/* Ayurveda-Astrology Integration */}
      <div className='bg-purple-900/10 border border-purple-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-purple-300 mb-4 flex items-center'>
          <span className='mr-2'>🔮</span>
          Ayurveda-Astrology Integration
        </h3>
        <p className='text-cosmic-silver'>{data.ayurveda_astrology_integration}</p>
      </div>

      {/* Dharmic Alignment */}
      <div className='bg-orange-900/10 border border-orange-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-orange-300 mb-4 flex items-center'>
          <span className='mr-2'>🙏</span>
          Dharmic Alignment
        </h3>
        <p className='text-cosmic-silver'>{data.dharmic_alignment}</p>
      </div>

      {/* Spiritual Development Path */}
      {data.spiritual_development_path && data.spiritual_development_path.length > 0 && (
        <div className='bg-teal-900/10 border border-teal-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-teal-300 mb-4 flex items-center'>
            <span className='mr-2'>🌱</span>
            Spiritual Development Path
          </h3>
          <div className='space-y-3'>
            {data.spiritual_development_path.map((step, index) => (
              <div key={index} className='flex items-start space-x-3'>
                <span className='text-teal-400 mt-0.5 text-sm font-bold'>{index + 1}.</span>
                <p className='text-cosmic-silver text-sm'>{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Karmic Health Patterns */}
      <div className='bg-indigo-900/10 border border-indigo-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-indigo-300 mb-4 flex items-center'>
          <span className='mr-2'>♻️</span>
          Karmic Health Patterns
        </h3>
        <p className='text-cosmic-silver'>{data.karmic_health_patterns}</p>
      </div>
    </div>
  );
});

SynthesisTab.displayName = 'SynthesisTab';

export default SynthesisTab;
