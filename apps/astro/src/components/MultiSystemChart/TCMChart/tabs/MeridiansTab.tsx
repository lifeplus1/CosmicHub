import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cosmichub/ui';
import type { TCMTabProps } from '../utils/types';

/**
 * Meridians Tab Component
 * Displays TCM meridian system analysis with energy flow patterns
 */
export const MeridiansTab: React.FC<TCMTabProps> = React.memo(({ chartData }) => {
  // Hooks must be called before any conditional returns
  const meridianSystems = useMemo(() => [
    {
      name: 'Lung Meridian',
      element: 'Metal',
      organ: 'Lungs',
      emotion: 'Grief/Courage',
      time: '3-5 AM',
      function: 'Respiration, immune system',
      points: 11
    },
    {
      name: 'Large Intestine Meridian', 
      element: 'Metal',
      organ: 'Large Intestine',
      emotion: 'Letting Go',
      time: '5-7 AM',
      function: 'Elimination, detoxification',
      points: 20
    },
    {
      name: 'Stomach Meridian',
      element: 'Earth', 
      organ: 'Stomach',
      emotion: 'Worry/Acceptance',
      time: '7-9 AM',
      function: 'Digestion, nourishment',
      points: 45
    },
    {
      name: 'Spleen Meridian',
      element: 'Earth',
      organ: 'Spleen',
      emotion: 'Pensiveness/Clarity',
      time: '9-11 AM', 
      function: 'Transport, transformation',
      points: 21
    },
    {
      name: 'Heart Meridian',
      element: 'Fire',
      organ: 'Heart',
      emotion: 'Joy/Love',
      time: '11 AM-1 PM',
      function: 'Circulation, consciousness',
      points: 9
    },
    {
      name: 'Small Intestine Meridian',
      element: 'Fire',
      organ: 'Small Intestine', 
      emotion: 'Joy/Discernment',
      time: '1-3 PM',
      function: 'Absorption, separation',
      points: 19
    }
  ], []);

  const meridiansData = chartData?.meridians;
  if (!meridiansData) {
    return (
      <div className="text-cosmic-silver text-center py-8">
        <p>No meridian system analysis available</p>
      </div>
    );
  }

  const { primary = [], secondary = [], blocked = [], recommendations = [] } = meridiansData;

  return (
    <div className="space-y-6">
      {/* Meridian Status Overview */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">🌊</span>
            Meridian System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Primary Meridians */}
            <div>
              <h4 className="text-green-400 font-medium mb-3">Strong Meridians</h4>
              {primary && primary.length > 0 ? (
                <div className="space-y-2">
                  {primary.map((meridian: string, index: number) => (
                    <div key={`primary-${index}`} className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      <span className="text-cosmic-silver text-sm">{meridian}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-cosmic-silver/70 text-sm">No strong meridians identified</p>
              )}
            </div>

            {/* Secondary Meridians */}
            <div>
              <h4 className="text-yellow-400 font-medium mb-3">Moderate Meridians</h4>
              {secondary && secondary.length > 0 ? (
                <div className="space-y-2">
                  {secondary.map((meridian: string, index: number) => (
                    <div key={`secondary-${index}`} className="flex items-center">
                      <span className="text-yellow-400 mr-2">◐</span>
                      <span className="text-cosmic-silver text-sm">{meridian}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-cosmic-silver/70 text-sm">No moderate meridians identified</p>
              )}
            </div>

            {/* Blocked Meridians */}
            <div>
              <h4 className="text-red-400 font-medium mb-3">Attention Needed</h4>
              {blocked && blocked.length > 0 ? (
                <div className="space-y-2">
                  {blocked.map((meridian: string, index: number) => (
                    <div key={`blocked-${index}`} className="flex items-center">
                      <span className="text-red-400 mr-2">⚠️</span>
                      <span className="text-cosmic-silver text-sm">{meridian}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-cosmic-silver/70 text-sm">No blocked meridians identified</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meridian System Details */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title">12 Primary Meridians</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {meridianSystems.map((meridian, index) => (
              <div 
                key={`meridian-${index}`}
                className="p-4 rounded-lg border border-cosmic-purple/20 bg-cosmic-dark/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-cosmic-gold font-medium">{meridian.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    meridian.element === 'Metal' ? 'bg-gray-500/20 text-gray-300' :
                    meridian.element === 'Earth' ? 'bg-yellow-500/20 text-yellow-300' :
                    meridian.element === 'Fire' ? 'bg-red-500/20 text-red-300' :
                    meridian.element === 'Wood' ? 'bg-green-500/20 text-green-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {meridian.element}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-cosmic-silver">
                  <div><strong>Peak Time:</strong> {meridian.time}</div>
                  <div><strong>Function:</strong> {meridian.function}</div>
                  <div><strong>Emotion:</strong> {meridian.emotion}</div>
                  <div><strong>Points:</strong> {meridian.points}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card className="cosmic-card">
          <CardHeader>
            <CardTitle className="cosmic-title">Meridian Balancing Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {recommendations.map((rec: string, index: number) => (
                <div key={`rec-${index}`} className="flex items-start">
                  <span className="text-blue-400 mr-2">🎯</span>
                  <span className="text-cosmic-silver text-sm">{rec}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-cosmic-purple/10 rounded-lg border border-cosmic-purple/20">
              <p className="text-cosmic-silver text-sm">
                💡 <strong>Meridian Balancing:</strong> Meridians can be balanced through acupuncture, 
                acupressure, qigong, tai chi, meditation, and lifestyle adjustments. Each meridian 
                has optimal times for treatment based on the natural energy flow cycle.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Energy Flow Information */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title">Daily Energy Flow Cycle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-cosmic-silver text-sm space-y-3">
            <p>
              Traditional Chinese Medicine recognizes that energy (qi) flows through the meridian 
              system in a 24-hour cycle, with each meridian having a 2-hour peak period.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <h4 className="text-blue-400 font-medium">Morning (Yang Rising)</h4>
                <div className="text-xs space-y-1">
                  <div>3-5 AM: Lung (Metal)</div>
                  <div>5-7 AM: Large Intestine (Metal)</div>
                  <div>7-9 AM: Stomach (Earth)</div>
                  <div>9-11 AM: Spleen (Earth)</div>
                  <div>11 AM-1 PM: Heart (Fire)</div>
                  <div>1-3 PM: Small Intestine (Fire)</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-purple-400 font-medium">Evening (Yin Rising)</h4>
                <div className="text-xs space-y-1">
                  <div>3-5 PM: Bladder (Water)</div>
                  <div>5-7 PM: Kidney (Water)</div>
                  <div>7-9 PM: Pericardium (Fire)</div>
                  <div>9-11 PM: Triple Heater (Fire)</div>
                  <div>11 PM-1 AM: Gallbladder (Wood)</div>
                  <div>1-3 AM: Liver (Wood)</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

MeridiansTab.displayName = 'MeridiansTab';
