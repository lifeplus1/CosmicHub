import React, { useState } from 'react';
import { devConsole } from '../config/environment';
import { Card } from '@cosmichub/ui';
import { useBirthData } from '../contexts/BirthDataContext';
import { SimpleBirthForm } from '../components/SimpleBirthForm';
import HumanDesignChart from '../components/HumanDesignChart/HumanDesignChart';
import type { HumanDesignData } from '../components/HumanDesignChart/types';
import type { ChartBirthData } from '@cosmichub/types';

const HumanDesign: React.FC = () => {
  const { birthData, isDataValid, setBirthData } = useBirthData();
  const [humanDesignData, setHumanDesignData] = useState<HumanDesignData | null>(null);

  const handleBirthDataSubmit = (data: ChartBirthData): void => {
    // Birth data is already set in context by SimpleBirthForm
    // No navigation needed - stay on this page and show the human design chart
  if (devConsole.log) devConsole.log('🧬 Human Design birth data submitted', data);
  };

  // Helper function to format birth info from calculation result
  const formatBirthInfo = (birthInfo: HumanDesignData['birth_info']): { date: string; time: string; coordinates: string; timezone: string; } | null => {
    if (!birthInfo) return null;

    // Parse the ISO string more carefully to preserve the original date
    const consciousTime = birthInfo.conscious_time;
    const [datePart, timePart] = consciousTime.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    
    // Use the original input values to avoid timezone conversion issues
    return {
      date: `${month}/${day}/${year}`,
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      coordinates: `${birthInfo.location.latitude.toFixed(2)}°, ${birthInfo.location.longitude.toFixed(2)}°`,
      timezone: birthInfo.location.timezone
    };
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Human Design Chart
        </h1>
        <p className="text-xl text-cosmic-silver/80">
          Discover your unique energy type, strategy, and life purpose through the Human Design system
        </p>
      </div>

      {/* Birth Data Input - Only show if no data */}
      {!birthData && (
        <SimpleBirthForm
          title="Enter Birth Data for Human Design"
          submitButtonText="Generate Human Design Chart"
          showSampleButton={true}
          onSubmit={handleBirthDataSubmit}
        />
      )}

      {/* Human Design Chart Display */}
      {birthData && isDataValid && (
        <div className="space-y-6">
          {/* Control Panel */}
          <Card title="Chart Controls">
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-cosmic-silver">
                  <span className="text-cosmic-gold font-semibold">Your Chart Type:</span> Human Design
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setBirthData(null)}
                  className="px-4 py-2 bg-cosmic-purple/20 border border-cosmic-purple/30 rounded-lg hover:bg-cosmic-purple/30 transition-colors text-cosmic-silver"
                >
                  📝 Edit Birth Data
                </button>
              </div>
            </div>
          </Card>

          {/* Human Design Chart Component */}
          <HumanDesignChart 
            birthData={birthData}
            onCalculate={(data: ChartBirthData) => setBirthData(data)}
            onHumanDesignCalculated={(hdData: HumanDesignData) => setHumanDesignData(hdData)}
          />

          {/* Birth Information */}
          <Card title="Birth Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {humanDesignData?.birth_info ? (
                // Show birth info from Human Design calculation result
                (() => {
                  const birthInfo = formatBirthInfo(humanDesignData.birth_info);
                  return (
                    <>
                      <div className="text-center">
                        <div className="text-cosmic-gold font-semibold">Date</div>
                        <div className="text-cosmic-silver">{birthInfo?.date}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-cosmic-gold font-semibold">Time</div>
                        <div className="text-cosmic-silver">{birthInfo?.time}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-cosmic-gold font-semibold">Location</div>
                        <div className="text-cosmic-silver">{humanDesignData.birth_info.location.timezone}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-cosmic-gold font-semibold">Coordinates</div>
                        <div className="text-cosmic-silver text-sm">{birthInfo?.coordinates}</div>
                      </div>
                    </>
                  );
                })()
              ) : (
                // Fallback to context birth data (shown before calculation)
                <>
                  <div className="text-center">
                    <div className="text-cosmic-gold font-semibold">Date</div>
                    <div className="text-cosmic-silver">{birthData.month}/{birthData.day}/{birthData.year}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cosmic-gold font-semibold">Time</div>
                    <div className="text-cosmic-silver">{birthData.hour.toString().padStart(2, '0')}:{birthData.minute.toString().padStart(2, '0')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cosmic-gold font-semibold">Location</div>
                    <div className="text-cosmic-silver">{birthData.city}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cosmic-gold font-semibold">Coordinates</div>
                    <div className="text-cosmic-silver text-sm">
                      {birthData.lat != null ? `${birthData.lat.toFixed(2)}°, ${birthData.lon?.toFixed(2)}°` : 'Auto-detected'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Educational Information */}
          <Card title="About Human Design">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-cosmic-gold">The 5 Energy Types</h3>
                <div className="space-y-2 text-sm text-cosmic-silver">
                  <div className="flex justify-between">
                    <span>• Manifestor (9%)</span>
                    <span className="text-cosmic-gold">Initiators</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Generator (37%)</span>
                    <span className="text-cosmic-gold">Builders</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Manifesting Generator (33%)</span>
                    <span className="text-cosmic-gold">Multi-passionate</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Projector (20%)</span>
                    <span className="text-cosmic-gold">Guides</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Reflector (1%)</span>
                    <span className="text-cosmic-gold">Evaluators</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-cosmic-gold">Key Components</h3>
                <div className="space-y-2 text-sm text-cosmic-silver">
                  <div><span className="text-cosmic-gold">Strategy:</span> Your decision-making approach</div>
                  <div><span className="text-cosmic-gold">Authority:</span> Your inner guidance system</div>
                  <div><span className="text-cosmic-gold">Profile:</span> Your personality theme</div>
                  <div><span className="text-cosmic-gold">Centers:</span> Energy hubs in your body</div>
                  <div><span className="text-cosmic-gold">Gates:</span> Specific traits and gifts</div>
                  <div><span className="text-cosmic-gold">Channels:</span> Consistent life forces</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HumanDesign;
