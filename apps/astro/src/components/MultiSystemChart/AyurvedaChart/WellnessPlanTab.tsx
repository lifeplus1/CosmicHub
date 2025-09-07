import React from 'react';
import type { AyurvedaChartData } from './types';

interface WellnessPlanTabProps {
  data?: AyurvedaChartData['wellness_plan'];
}

const WellnessPlanTab: React.FC<WellnessPlanTabProps> = React.memo(({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No wellness plan available</div>;
  }

  return (
    <div className='space-y-6'>
      {/* Personalized Diet */}
      {data.personalized_diet && (
        <div className='bg-green-900/10 border border-green-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-green-300 mb-4 flex items-center'>
            <span className='mr-2'>🥗</span>
            Personalized Diet Recommendations
          </h3>
          
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-green-400 font-medium mb-3'>Foods to Favor</h4>
              <div className='space-y-2'>
                {data.personalized_diet.foods_to_favor.map((food, index) => (
                  <div key={index} className='flex items-center text-sm'>
                    <span className='text-green-400 mr-2'>✓</span>
                    <span className='text-cosmic-silver'>{food}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className='text-red-400 font-medium mb-3'>Foods to Minimize</h4>
              <div className='space-y-2'>
                {data.personalized_diet.foods_to_avoid.map((food, index) => (
                  <div key={index} className='flex items-center text-sm'>
                    <span className='text-red-400 mr-2'>⚠️</span>
                    <span className='text-cosmic-silver'>{food}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Seasonal Diet Adjustments */}
          {data.personalized_diet.seasonal_adjustments && Object.keys(data.personalized_diet.seasonal_adjustments).length > 0 && (
            <div className='mt-6'>
              <h4 className='text-yellow-400 font-medium mb-3'>Seasonal Adjustments</h4>
              <div className='grid md:grid-cols-2 gap-4'>
                {Object.entries(data.personalized_diet.seasonal_adjustments).map(([season, foods], index) => (
                  <div key={index} className='p-4 bg-cosmic-black/20 rounded-lg'>
                    <h5 className='text-yellow-300 font-medium mb-2'>{season}</h5>
                    <ul className='space-y-1'>
                      {foods.map((food, foodIndex) => (
                        <li key={foodIndex} className='text-sm text-cosmic-silver'>
                          • {food}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lifestyle Recommendations */}
      {data.lifestyle_recommendations && (
        <div className='bg-blue-900/10 border border-blue-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-blue-300 mb-4 flex items-center'>
            <span className='mr-2'>🏃‍♂️</span>
            Lifestyle Recommendations
          </h3>
          
          <div className='grid md:grid-cols-3 gap-6'>
            <div>
              <h4 className='text-blue-400 font-medium mb-3'>Daily Routine</h4>
              <ul className='space-y-2'>
                {data.lifestyle_recommendations.daily_routine.map((routine, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-blue-400 mr-2'>🔄</span>
                    <span className='text-cosmic-silver'>{routine}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className='text-green-400 font-medium mb-3'>Exercise Guidelines</h4>
              <ul className='space-y-2'>
                {data.lifestyle_recommendations.exercise_guidelines.map((guideline, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-green-400 mr-2'>💪</span>
                    <span className='text-cosmic-silver'>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className='text-purple-400 font-medium mb-3'>Sleep Optimization</h4>
              <ul className='space-y-2'>
                {data.lifestyle_recommendations.sleep_optimization.map((tip, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-purple-400 mr-2'>🌙</span>
                    <span className='text-cosmic-silver'>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Herbal Support */}
      {data.herbal_support && (
        <div className='bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-yellow-300 mb-4 flex items-center'>
            <span className='mr-2'>🌿</span>
            Herbal Support Recommendations
          </h3>
          
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-green-400 font-medium mb-3'>Constitutional Herbs</h4>
              <div className='flex flex-wrap gap-2'>
                {data.herbal_support.constitutional_herbs.map((herb, index) => (
                  <span
                    key={index}
                    className='text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded'
                  >
                    {herb}
                  </span>
                ))}
              </div>
              
              {/* Seasonal Herbs */}
              {data.herbal_support.seasonal_herbs && Object.keys(data.herbal_support.seasonal_herbs).length > 0 && (
                <div className='mt-4'>
                  <h4 className='text-yellow-400 font-medium mb-3'>Seasonal Herbs</h4>
                  <div className='space-y-2'>
                    {Object.entries(data.herbal_support.seasonal_herbs).map(([season, herbs], index) => (
                      <div key={index} className='p-3 bg-cosmic-black/20 rounded'>
                        <span className='text-yellow-300 font-medium text-sm'>{season}: </span>
                        <span className='text-cosmic-silver text-sm'>{herbs.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h4 className='text-red-400 font-medium mb-3'>Important Contraindications</h4>
              <div className='space-y-2'>
                {data.herbal_support.contraindications.map((contraindication, index) => (
                  <div key={index} className='flex items-start p-3 bg-red-900/20 border border-red-500/30 rounded'>
                    <span className='text-red-400 mr-2'>⚠️</span>
                    <p className='text-cosmic-silver text-sm'>{contraindication}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

WellnessPlanTab.displayName = 'WellnessPlanTab';

export default WellnessPlanTab;
