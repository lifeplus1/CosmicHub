import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@cosmichub/ui';
import type { UnifiedBirthData as _UnifiedBirthData } from '@cosmichub/types';

// Import tab components
import { TarotTab } from './tabs/TarotTab';
import { KabbalahTab } from './tabs/KabbalahTab';
import { SynthesisTab } from './tabs/SynthesisTab';

// Import utilities
import type { SpiritualChartProps, SpiritualTabType } from './utils/types';

/**
 * Main Spiritual Chart Component
 * Refactored for better performance and maintainability
 * Following Type Bridge System and component best practices
 */
const SpiritualChart: React.FC<SpiritualChartProps> = React.memo(function SpiritualChart({
  chartData,
  birthData: _birthData, // Prefixed with _ to indicate intentionally unused
  isLoading = false,
}) {
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<SpiritualTabType>('tarot');

  // Memoized tab change handlers
  const handleTarotTab = useCallback(() => setActiveTab('tarot'), []);
  const handleKabbalahTab = useCallback(() => setActiveTab('kabbalah'), []);
  const handleTreeTab = useCallback(() => setActiveTab('tree'), []);
  const handleSynthesisTab = useCallback(() => setActiveTab('synthesis'), []);

  // Memoized tab button class generator
  const getTabButtonClass = useCallback((tabName: SpiritualTabType) => {
    return `flex-1 min-w-0 ${
      activeTab === tabName
        ? 'bg-cosmic-purple/20 text-cosmic-gold border border-cosmic-purple/30'
        : 'text-cosmic-silver hover:text-cosmic-gold hover:bg-cosmic-purple/10'
    }`;
  }, [activeTab]);

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="cosmic-glass border-cosmic-purple/30 bg-cosmic-dark/50">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cosmic-purple border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className='text-cosmic-silver'>
            Calculating spiritual guidance...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Handle no data state
  if (!chartData) {
    return (
      <Card className="cosmic-glass border-cosmic-purple/30 bg-cosmic-dark/50">
        <CardContent className="p-8 text-center">
          <CardTitle className="text-2xl font-bold text-cosmic-gold mb-4 font-cinzel">
            🔮 SPIRITUAL-001 System Ready
          </CardTitle>
          <p className='text-cosmic-silver/70 text-lg mb-6'>
            Enter your birth details to receive comprehensive spiritual guidance
            from Tarot, Kabbalah Tree of Life, and Hermetic correspondences
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card className="border-cosmic-purple/20 bg-cosmic-purple/10">
              <CardContent className="p-4">
                <h4 className='text-cosmic-gold font-semibold mb-2'>🃏 Tarot</h4>
                <p className='text-cosmic-silver/60 text-sm'>
                  78-card system with Tree of Life paths
                </p>
              </CardContent>
            </Card>
            <Card className="border-cosmic-gold/20 bg-cosmic-gold/10">
              <CardContent className="p-4">
                <h4 className='text-cosmic-gold font-semibold mb-2'>🌟 Kabbalah</h4>
                <p className='text-cosmic-silver/60 text-sm'>
                  10 Sephirot + 22 paths visualization
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cosmic-glass border-cosmic-gold/20 shadow-2xl shadow-cosmic-purple/20">
      <CardHeader className="border-b border-cosmic-gold/10">
        <CardTitle className="text-3xl font-bold text-cosmic-gold font-cinzel flex items-center gap-3">
          <span>🔮</span>
          Spiritual Systems Analysis
          <span className='text-xs bg-cosmic-purple/20 text-cosmic-gold px-3 py-1 rounded-full border border-cosmic-purple/30'>
            SPIRITUAL-001
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-8">
        {/* Enhanced Tab Navigation */}
        <div className='flex flex-wrap gap-2 mb-8 p-2 bg-cosmic-dark/30 rounded-xl border border-cosmic-silver/10'>
          <Button
            onClick={handleTarotTab}
            variant={activeTab === 'tarot' ? 'cosmic' : 'outline'}
            size="sm"
            className={getTabButtonClass('tarot')}
            aria-label="View Tarot analysis"
          >
            🃏 Tarot
          </Button>
          <Button
            onClick={handleKabbalahTab}
            variant={activeTab === 'kabbalah' ? 'cosmic' : 'outline'}
            size="sm"
            className={getTabButtonClass('kabbalah')}
            aria-label="View Kabbalah Tree of Life analysis"
          >
            🌟 Kabbalah
          </Button>
          <Button
            onClick={handleTreeTab}
            variant={activeTab === 'tree' ? 'cosmic' : 'outline'}
            size="sm"
            className={getTabButtonClass('tree')}
            aria-label="View Tree of Life visualization"
          >
            🌳 Tree
          </Button>
          <Button
            onClick={handleSynthesisTab}
            variant={activeTab === 'synthesis' ? 'cosmic' : 'outline'}
            size="sm"
            className={getTabButtonClass('synthesis')}
            aria-label="View spiritual synthesis"
          >
            ⚡ Synthesis
          </Button>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'tarot' && (
            <TarotTab 
              chartData={chartData} 
              isLoading={isLoading}
            />
          )}
          {activeTab === 'kabbalah' && (
            <KabbalahTab 
              chartData={chartData} 
              isLoading={isLoading}
            />
          )}
          {activeTab === 'tree' && (
            <div className="text-cosmic-silver text-center py-8">
              <p>Tree visualization coming soon...</p>
              <p className="text-sm mt-2">This will show an interactive Tree of Life diagram</p>
            </div>
          )}
          {activeTab === 'synthesis' && (
            <SynthesisTab 
              chartData={chartData} 
              isLoading={isLoading}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
});

SpiritualChart.displayName = 'SpiritualChart';

export default SpiritualChart;
export { SpiritualChart };
export type { SpiritualChartProps } from './utils/types';

// Re-export all tab components and utilities for external use
export { TarotTab } from './tabs/TarotTab';
export { KabbalahTab } from './tabs/KabbalahTab'; 
export { SynthesisTab } from './tabs/SynthesisTab';
export type {
  SpiritualTabType,
  SpiritualTabProps,
  DailyFocusCorrespondence,
  LifePurposeCorrespondence,
  SpiritualCenterCorrespondence,
  LocalCorrespondences,
  TarotCardData,
  SephirahInfo,
  KabbalahPathInfo,
  SpiritualSynthesis
} from './utils/types';
