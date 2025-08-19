import React from 'react';
import { devConsole } from '../config/environment';
import { Card } from '@cosmichub/ui';
import { useBirthData } from '../contexts/BirthDataContext';
import { SimpleBirthForm } from '../components/SimpleBirthForm';
import GeneKeysChart from '../components/GeneKeysChart/GeneKeysChart';
import type { ChartBirthData } from '@cosmichub/types';

const GeneKeys: React.FC = () => {
  const { birthData, isDataValid, setBirthData } = useBirthData();

  const handleBirthDataSubmit = (data: ChartBirthData): void => {
    // Birth data is already set in context by SimpleBirthForm
    // No navigation needed - stay on this page and show the gene keys profile
  devConsole.log?.('🧬 Gene Keys birth data submitted', data);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Gene Keys Profile
        </h1>
        <p className="text-xl text-cosmic-silver/80">
          Discover your unique genetic blueprint through the Gene Keys system - a contemplative path of consciousness evolution
        </p>
      </div>

      {/* Birth Data Input - Only show if no data */}
      {!birthData && (
        <SimpleBirthForm
          title="Enter Birth Data for Gene Keys"
          submitButtonText="Generate Gene Keys Profile"
          showSampleButton={true}
          onSubmit={handleBirthDataSubmit}
        />
      )}

      {/* Gene Keys Chart Display */}
      {birthData && isDataValid && (
        <div className="space-y-6">
          {/* Control Panel */}
          <Card title="Chart Controls">
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-cosmic-silver">
                  <span className="text-cosmic-gold font-semibold">Your Profile Type:</span> Gene Keys
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

          {/* Gene Keys Chart Component */}
          <GeneKeysChart 
            birthData={birthData}
            onCalculate={(data) => setBirthData(data)}
          />

          {/* Birth Information */}
          <Card title="Birth Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            </div>
          </Card>

          {/* Educational Information */}
          <Card title="About Gene Keys">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-cosmic-gold">The Three Sequences</h3>
                <div className="space-y-2 text-sm text-cosmic-silver">
                  <div className="flex justify-between">
                    <span>• Activation Sequence (IQ)</span>
                    <span className="text-cosmic-gold">Mental Intelligence</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Venus Sequence (EQ)</span>
                    <span className="text-cosmic-gold">Emotional Intelligence</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Pearl Sequence (SQ)</span>
                    <span className="text-cosmic-gold">Spiritual Intelligence</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-cosmic-gold">Core Components</h3>
                <div className="space-y-2 text-sm text-cosmic-silver">
                  <div><span className="text-cosmic-gold">Life's Work:</span> Your primary life purpose</div>
                  <div><span className="text-cosmic-gold">Evolution:</span> Your greatest challenge and growth</div>
                  <div><span className="text-cosmic-gold">Radiance:</span> How you attract abundance</div>
                  <div><span className="text-cosmic-gold">Purpose:</span> Your highest service to humanity</div>
                  <div><span className="text-cosmic-gold">Shadow → Gift → Siddhi:</span> The transformation spectrum</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-cosmic-purple/20 border border-cosmic-purple/30 rounded-lg">
              <h4 className="text-lg font-semibold text-cosmic-gold mb-2">Contemplation Practice</h4>
              <p className="text-cosmic-silver/90">
                Gene Keys are designed for deep contemplation over time. Allow weeks or months with each Gene Key, 
                observing how its patterns show up in your life and naturally transform from shadow frequencies 
                into gifts and eventually into the transcendent state of the Siddhi.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GeneKeys;
