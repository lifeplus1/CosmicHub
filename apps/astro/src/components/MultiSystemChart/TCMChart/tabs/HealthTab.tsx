import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cosmichub/ui';
import type { TCMTabProps } from '../utils/types';

/**
 * Health Tab Component
 * Displays TCM health recommendations including diet, lifestyle, and seasonal guidance
 */
export const HealthTab: React.FC<TCMTabProps> = React.memo(({ chartData }) => {
  // Hooks must be called before any conditional returns
  const healthPrinciples = useMemo(() => [
    {
      category: 'Prevention',
      principle: 'Maintain balance before illness occurs',
      description: 'TCM emphasizes preventing disease through lifestyle harmony rather than treating after symptoms appear.'
    },
    {
      category: 'Seasonal Living',
      principle: 'Align with natural cycles',
      description: 'Adjust diet, activities, and rest patterns according to seasonal energy changes throughout the year.'
    },
    {
      category: 'Emotional Balance',
      principle: 'Harmonize mind and body',
      description: 'Emotional states directly affect physical health. Cultivate emotional equilibrium for optimal wellness.'
    },
    {
      category: 'Energy Cultivation',
      principle: 'Nurture and preserve vital energy (qi)',
      description: 'Practice qigong, meditation, and mindful breathing to maintain and strengthen life force energy.'
    }
  ], []);

  const healthData = chartData?.health;
  if (!healthData) {
    return (
      <div className="text-cosmic-silver text-center py-8">
        <p>No health recommendations available</p>
      </div>
    );
  }

  const { dietary = [], lifestyle = [], seasonal = [], exercise = [] } = healthData;

  return (
    <div className="space-y-6">
      {/* Health Recommendations Overview */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">💚</span>
            Personalized Health Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dietary Recommendations */}
            <div>
              <h4 className="text-green-400 font-medium mb-3 flex items-center">
                <span className="mr-2">🥗</span>
                Dietary Guidance
              </h4>
              {dietary && dietary.length > 0 ? (
                <div className="space-y-2">
                  {dietary.map((recommendation: string, index: number) => (
                    <div key={`dietary-${index}`} className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      <span className="text-cosmic-silver text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">•</span>
                    <span className="text-cosmic-silver text-sm">Eat warming foods during cold seasons</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">•</span>
                    <span className="text-cosmic-silver text-sm">Include all five flavors in your diet</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">•</span>
                    <span className="text-cosmic-silver text-sm">Eat according to your constitution</span>
                  </div>
                </div>
              )}
            </div>

            {/* Exercise Recommendations */}
            <div>
              <h4 className="text-blue-400 font-medium mb-3 flex items-center">
                <span className="mr-2">🧘</span>
                Exercise & Movement
              </h4>
              {exercise && exercise.length > 0 ? (
                <div className="space-y-2">
                  {exercise.map((recommendation: string, index: number) => (
                    <div key={`exercise-${index}`} className="flex items-start">
                      <span className="text-blue-400 mr-2 mt-1">•</span>
                      <span className="text-cosmic-silver text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-2 mt-1">•</span>
                    <span className="text-cosmic-silver text-sm">Practice gentle qigong or tai chi</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-2 mt-1">•</span>
                    <span className="text-cosmic-silver text-sm">Include both yang (active) and yin (restorative) exercises</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-2 mt-1">•</span>
                    <span className="text-cosmic-silver text-sm">Exercise during optimal times for your constitution</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle Recommendations */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">🏡</span>
            Lifestyle Harmony
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lifestyle && lifestyle.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {lifestyle.map((recommendation: string, index: number) => (
                <div key={`lifestyle-${index}`} className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-1">✓</span>
                  <span className="text-cosmic-silver text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-1">✓</span>
                  <span className="text-cosmic-silver text-sm">Maintain regular sleep-wake cycles</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-1">✓</span>
                  <span className="text-cosmic-silver text-sm">Practice stress reduction techniques</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-1">✓</span>
                  <span className="text-cosmic-silver text-sm">Create peaceful living environments</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-1">✓</span>
                  <span className="text-cosmic-silver text-sm">Balance work and rest periods</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-1">✓</span>
                  <span className="text-cosmic-silver text-sm">Cultivate positive relationships</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-1">✓</span>
                  <span className="text-cosmic-silver text-sm">Spend time in nature regularly</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seasonal Recommendations */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">🌱</span>
            Seasonal Wellness Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seasonal && seasonal.length > 0 ? (
            <div className="space-y-3">
              {seasonal.map((recommendation: string, index: number) => (
                <div key={`seasonal-${index}`} className="flex items-start">
                  <span className="text-yellow-400 mr-2 mt-1">🍃</span>
                  <span className="text-cosmic-silver text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-green-400 font-medium mb-3">Spring (Wood Element)</h4>
                <div className="space-y-2 text-sm text-cosmic-silver">
                  <div>• Focus on liver detoxification</div>
                  <div>• Eat fresh greens and sprouts</div>
                  <div>• Begin new projects and goals</div>
                  <div>• Practice flexibility exercises</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-red-400 font-medium mb-3">Summer (Fire Element)</h4>
                <div className="space-y-2 text-sm text-cosmic-silver">
                  <div>• Support heart and circulation</div>
                  <div>• Eat cooling foods and fruits</div>
                  <div>• Engage in social activities</div>
                  <div>• Balance activity with rest</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-yellow-400 font-medium mb-3">Late Summer (Earth Element)</h4>
                <div className="space-y-2 text-sm text-cosmic-silver">
                  <div>• Strengthen digestive system</div>
                  <div>• Eat grounding, nourishing foods</div>
                  <div>• Focus on stability and routine</div>
                  <div>• Practice centering activities</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-gray-300 font-medium mb-3">Autumn (Metal Element)</h4>
                <div className="space-y-2 text-sm text-cosmic-silver">
                  <div>• Support lung and immune function</div>
                  <div>• Eat warming, cooked foods</div>
                  <div>• Practice letting go and release</div>
                  <div>• Focus on breathing exercises</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TCM Health Principles */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title">TCM Health Principles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {healthPrinciples.map((principle, index) => (
              <div key={`principle-${index}`} className="space-y-2">
                <h4 className="text-cosmic-gold font-medium">{principle.category}</h4>
                <p className="text-cosmic-silver font-medium text-sm">{principle.principle}</p>
                <p className="text-cosmic-silver/80 text-sm">{principle.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-cosmic-green/10 rounded-lg border border-cosmic-green/20">
            <p className="text-cosmic-silver text-sm">
              💡 <strong>Holistic Approach:</strong> TCM views health as a dynamic balance between 
              internal constitution, external environment, lifestyle choices, and emotional well-being. 
              Small, consistent changes aligned with your constitution can create profound long-term benefits.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

HealthTab.displayName = 'HealthTab';
