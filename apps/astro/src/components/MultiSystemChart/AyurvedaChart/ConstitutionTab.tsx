import React from 'react';
import type { ConstitutionalAnalysis } from './types';
import { getDoshaIcon, getDoshaColor } from './utils';

interface ConstitutionTabProps {
  data?: ConstitutionalAnalysis;
}

const ConstitutionTab: React.FC<ConstitutionTabProps> = React.memo(({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No constitutional analysis available</div>;
  }

  const { prakruti, vikruti } = data;

  return (
    <div className='space-y-6'>
      {/* Prakruti (Birth Constitution) */}
      <div className='bg-orange-900/10 border border-orange-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-orange-300 mb-4 flex items-center'>
          <span className='mr-2'>🌟</span>
          Prakruti (Birth Constitution)
        </h3>
        
        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <div className='mb-4'>
              <h4 className='text-orange-400 font-medium mb-2'>Primary Dosha</h4>
              <div className='p-4 bg-cosmic-black/20 rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-lg font-semibold text-orange-300'>
                    {getDoshaIcon(prakruti.primary_dosha.name)} {prakruti.primary_dosha.name}
                  </span>
                  <span className='text-orange-400 text-lg font-bold'>
                    {prakruti.primary_dosha.percentage}%
                  </span>
                </div>
                
                <div className='mb-3'>
                  <div className='w-full bg-gray-700 rounded-full h-3 relative overflow-hidden'>
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${getDoshaColor(prakruti.primary_dosha.name)}`}
                      data-width={prakruti.primary_dosha.percentage}
                    ></div>
                  </div>
                </div>
                
                <div className='text-sm text-cosmic-silver space-y-1'>
                  <p><span className='text-orange-400 font-medium'>Planetary Ruler:</span> {prakruti.primary_dosha.planetaryRuler}</p>
                  <p><span className='text-orange-400 font-medium'>Element:</span> {prakruti.primary_dosha.elementCorrelation}</p>
                  <p><span className='text-orange-400 font-medium'>Peak Season:</span> {prakruti.primary_dosha.seasonalPeak}</p>
                  <p><span className='text-orange-400 font-medium'>Peak Time:</span> {prakruti.primary_dosha.timeOfDay}</p>
                </div>
              </div>
            </div>
            
            <div className='mb-4'>
              <h4 className='text-orange-400 font-medium mb-3'>Constitutional Qualities</h4>
              <div className='flex flex-wrap gap-2'>
                {prakruti.primary_dosha.qualities.map((quality, index) => (
                  <span
                    key={index}
                    className='text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded'
                  >
                    {quality}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className='mb-4'>
              <h4 className='text-green-400 font-medium mb-3'>Inherent Characteristics</h4>
              <ul className='text-sm text-cosmic-silver space-y-1'>
                {prakruti.primary_dosha.characteristics.slice(0, 5).map((characteristic, index) => (
                  <li key={index} className='flex items-start'>
                    <span className='text-green-400 mr-2'>✓</span>
                    {characteristic}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className='text-blue-400 font-medium mb-3'>Constitutional Type</h4>
              <p className='text-cosmic-silver text-sm mb-3'>{prakruti.constitution_type}</p>
              
              <div className='p-3 bg-cosmic-black/20 rounded-lg'>
                <p className='text-cosmic-silver text-sm'>{prakruti.birth_constitution_summary}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Dosha */}
        {prakruti.secondary_dosha && (
          <div className='mt-6 p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-lg'>
            <h4 className='text-yellow-300 font-medium mb-2 flex items-center'>
              <span className='mr-2'>⭐</span>
              Secondary Dosha: {prakruti.secondary_dosha.name} ({prakruti.secondary_dosha.percentage}%)
            </h4>
            <p className='text-cosmic-silver text-sm'>
              Provides balancing influence through {prakruti.secondary_dosha.elementCorrelation} qualities
            </p>
          </div>
        )}
      </div>

      {/* Vikruti (Current State) */}
      <div className='bg-red-900/10 border border-red-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-red-300 mb-4 flex items-center'>
          <span className='mr-2'>🌡️</span>
          Vikruti (Current State)
        </h3>
        
        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <div className='mb-4'>
              <h4 className='text-red-400 font-medium mb-3'>Current Imbalances</h4>
              {vikruti.imbalances.length > 0 ? (
                <ul className='space-y-2'>
                  {vikruti.imbalances.map((imbalance, index) => (
                    <li key={index} className='flex items-start text-sm'>
                      <span className='text-red-400 mr-2'>⚠️</span>
                      <span className='text-cosmic-silver'>{imbalance}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-green-400 text-sm'>✓ Constitution appears balanced</p>
              )}
            </div>
            
            <div>
              <h4 className='text-yellow-400 font-medium mb-3'>Seasonal Factors</h4>
              <ul className='space-y-1'>
                {vikruti.seasonal_factors.map((factor, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-yellow-400 mr-2'>🌸</span>
                    <span className='text-cosmic-silver'>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <div className='mb-4'>
              <h4 className='text-blue-400 font-medium mb-3'>Lifestyle Factors</h4>
              <ul className='space-y-1'>
                {vikruti.lifestyle_factors.map((factor, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-blue-400 mr-2'>🔄</span>
                    <span className='text-cosmic-silver'>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className='p-4 bg-cosmic-black/20 rounded-lg'>
              <h4 className='text-red-400 font-medium mb-2'>Current State Summary</h4>
              <p className='text-cosmic-silver text-sm'>{vikruti.current_state}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ConstitutionTab.displayName = 'ConstitutionTab';

export default ConstitutionTab;
