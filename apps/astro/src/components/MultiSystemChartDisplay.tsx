import React, { useState, Suspense, lazy } from 'react';
import { Card, Button } from '@cosmichub/ui';
import type { ChartBirthData } from '../services/api';

// Lazy load ChartWheel for performance
const ChartWheel = lazy(() => import('../features/ChartWheel'));

export interface MultiSystemChartData {
  western: any;
  vedic: any;
  uranian: any;
  synthesis: any;
}

interface MultiSystemChartDisplayProps {
  birthData?: ChartBirthData;
  className?: string;
  showComparison?: boolean;
}

// Chart wheel skeleton for loading states
const ChartSkeleton = () => (
  <div className="flex items-center justify-center h-[400px] bg-cosmic-dark rounded-lg border border-cosmic-purple animate-pulse">
    <div className="flex flex-col items-center space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-gold"></div>
      <div className="text-cosmic-silver text-sm">Loading chart...</div>
    </div>
  </div>
);

export const MultiSystemChartDisplay: React.FC<MultiSystemChartDisplayProps> = ({ 
  birthData,
  className = '',
  showComparison = true
}) => {
  const [activeSystem, setActiveSystem] = useState<string>('western');
  const [showAspects, setShowAspects] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(showComparison);

  const chartSystems = [
    { 
      id: 'western', 
      name: 'Western Astrology', 
      description: 'Tropical zodiac with standard house systems',
      color: 'cosmic-gold'
    },
    { 
      id: 'vedic', 
      name: 'Vedic Astrology', 
      description: 'Sidereal zodiac with traditional Hindu methods',
      color: 'cosmic-purple'
    },
    { 
      id: 'uranian', 
      name: 'Uranian Astrology', 
      description: 'Hamburg School with trans-Neptunian points',
      color: 'cosmic-blue'
    },
    { 
      id: 'synthesis', 
      name: 'Synthesis View', 
      description: 'Combined insights from all systems',
      color: 'cosmic-silver'
    }
  ];

  if (!birthData) {
    return (
      <div className={`multi-system-chart ${className}`}>
        <Card title="Multi-System Chart Analysis">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🌌</div>
            <h3 className="text-xl font-semibold text-cosmic-gold mb-2">
              Ready for Multi-System Analysis
            </h3>
            <p className="text-cosmic-silver">
              Enter birth data to see your chart analyzed across multiple astrological systems
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`multi-system-chart ${className} space-y-6`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-cosmic-gold mb-2">
          Multi-System Astrological Analysis
        </h2>
        <p className="text-cosmic-silver">
          Your birth chart analyzed through different astrological traditions
        </p>
      </div>

      {/* System Selection Tabs */}
      <Card title="Chart Systems">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {chartSystems.map((system) => (
            <button
              key={system.id}
              onClick={() => setActiveSystem(system.id)}
              className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                activeSystem === system.id
                  ? `border-${system.color} bg-${system.color}/10`
                  : 'border-cosmic-purple/30 hover:border-cosmic-purple/50'
              }`}
            >
              <h4 className={`font-semibold ${
                activeSystem === system.id ? `text-${system.color}` : 'text-cosmic-silver'
              }`}>
                {system.name}
              </h4>
              <p className="text-sm text-cosmic-silver/70 mt-1">
                {system.description}
              </p>
            </button>
          ))}
        </div>

        {/* Display Options */}
        <div className="flex flex-wrap gap-4 items-center justify-between border-t border-cosmic-purple/20 pt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="multiShowAspects" 
                checked={showAspects}
                onChange={(e) => setShowAspects(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="multiShowAspects" className="text-cosmic-silver">
                Show Aspects
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="multiShowAnimation" 
                checked={showAnimation}
                onChange={(e) => setShowAnimation(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="multiShowAnimation" className="text-cosmic-silver">
                Animations
              </label>
            </div>
          </div>

          <Button
            onClick={() => setComparisonMode(!comparisonMode)}
            variant={comparisonMode ? "primary" : "secondary"}
            className="text-sm"
          >
            {comparisonMode ? 'Single View' : 'Compare All'}
          </Button>
        </div>
      </Card>

      {/* Chart Display */}
      {comparisonMode ? (
        // Comparison view - all systems side by side
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {chartSystems.map((system) => (
            <Card 
              key={system.id} 
              title={system.name}
              className={`border-${system.color}/30`}
            >
              {system.id === 'western' ? (
                <Suspense fallback={<ChartSkeleton />}>
                  <ChartWheel
                    birthData={birthData}
                    showAspects={showAspects}
                    showAnimation={showAnimation}
                  />
                </Suspense>
              ) : (
                <div className="flex items-center justify-center h-[400px] bg-cosmic-dark rounded-lg border border-cosmic-purple">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🔮</div>
                    <h4 className={`text-lg font-semibold text-${system.color} mb-2`}>
                      {system.name}
                    </h4>
                    <p className="text-cosmic-silver/70 mb-4">
                      {system.description}
                    </p>
                    <div className="text-sm text-cosmic-silver/50">
                      Chart calculation coming soon
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        // Single system view
        <Card 
          title={chartSystems.find(s => s.id === activeSystem)?.name || 'Chart System'}
          className="mb-6"
        >
          {activeSystem === 'western' ? (
            <Suspense fallback={<ChartSkeleton />}>
              <ChartWheel
                birthData={birthData}
                showAspects={showAspects}
                showAnimation={showAnimation}
              />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-[600px] bg-cosmic-dark rounded-lg border border-cosmic-purple">
              <div className="text-center">
                <div className="text-6xl mb-4">🔮</div>
                <h4 className="text-xl font-semibold text-cosmic-gold mb-2">
                  {chartSystems.find(s => s.id === activeSystem)?.name}
                </h4>
                <p className="text-cosmic-silver mb-4">
                  {chartSystems.find(s => s.id === activeSystem)?.description}
                </p>
                <div className="text-cosmic-silver/70 mb-6">
                  Advanced multi-system calculations are in development.<br />
                  Currently showing Western astrology with plans to add:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="p-3 bg-cosmic-purple/20 rounded-lg">
                    <div className="text-cosmic-purple font-semibold">Vedic</div>
                    <div className="text-sm text-cosmic-silver/70">Sidereal calculations</div>
                  </div>
                  <div className="p-3 bg-cosmic-blue/20 rounded-lg">
                    <div className="text-cosmic-blue font-semibold">Uranian</div>
                    <div className="text-sm text-cosmic-silver/70">Trans-Neptunian points</div>
                  </div>
                  <div className="p-3 bg-cosmic-gold/20 rounded-lg">
                    <div className="text-cosmic-gold font-semibold">Synthesis</div>
                    <div className="text-sm text-cosmic-silver/70">Combined insights</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* System Comparison Table */}
      {comparisonMode && birthData && (
        <Card title="System Comparison" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cosmic-purple/20">
                  <th className="text-left py-2 text-cosmic-silver">Feature</th>
                  <th className="text-left py-2 text-cosmic-gold">Western</th>
                  <th className="text-left py-2 text-cosmic-purple">Vedic</th>
                  <th className="text-left py-2 text-cosmic-blue">Uranian</th>
                </tr>
              </thead>
              <tbody className="text-cosmic-silver/80">
                <tr className="border-b border-cosmic-purple/10">
                  <td className="py-2 font-medium">Zodiac System</td>
                  <td className="py-2">Tropical</td>
                  <td className="py-2">Sidereal</td>
                  <td className="py-2">Tropical + TNPs</td>
                </tr>
                <tr className="border-b border-cosmic-purple/10">
                  <td className="py-2 font-medium">House System</td>
                  <td className="py-2">Placidus/Koch</td>
                  <td className="py-2">Whole Sign</td>
                  <td className="py-2">Equal House</td>
                </tr>
                <tr className="border-b border-cosmic-purple/10">
                  <td className="py-2 font-medium">Primary Focus</td>
                  <td className="py-2">Seasonal cycles</td>
                  <td className="py-2">Fixed stars</td>
                  <td className="py-2">Precision aspects</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Status</td>
                  <td className="py-2 text-cosmic-gold">✅ Active</td>
                  <td className="py-2 text-cosmic-silver/50">🔄 Development</td>
                  <td className="py-2 text-cosmic-silver/50">🔄 Development</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MultiSystemChartDisplay;
