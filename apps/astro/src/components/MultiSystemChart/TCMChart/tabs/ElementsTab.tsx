import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cosmichub/ui';
import type { TCMTabProps } from '../utils/types';

// Import utility functions (prefix with underscore to indicate future use)
import { 
  getElementColor as _getElementColor, 
  getElementEmoji as _getElementEmoji, 
  formatPercentage as _formatPercentage, 
  sortElementsByStrength as _sortElementsByStrength 
} from '../utils/tcmHelpers';

/**
 * Elements Tab Component
 * Displays Five Elements (Wu Xing) analysis with balance visualization
 */
export const ElementsTab: React.FC<TCMTabProps> = React.memo(({ chartData }) => {
  const _handleElementClick = useCallback(() => {
    // Handle element interaction - implementation pending
  }, []);

  const _handleExportReport = useCallback(() => {
    // Handle export functionality - implementation pending
  }, []);

  const _handleShareInsights = useCallback(() => {
    // Handle sharing functionality - implementation pending
  }, []);

  const memoizedElementData = useMemo(() => {
    return chartData?.elements;
  }, [chartData?.elements]);

  const sortedElements = useMemo(() => {
    const elementsData = memoizedElementData ?? {};
    return Object.entries(elementsData)
      .sort(([, a], [, b]) => (b as number) - (a as number));
  }, [memoizedElementData]);

  const elementsData = memoizedElementData;

  // Element details for display
  const elementDetails = {
    wood: { season: 'Spring', organs: 'Liver, Gallbladder', emotion: 'Anger/Patience' },
    fire: { season: 'Summer', organs: 'Heart, Small Intestine', emotion: 'Joy/Excitement' },
    earth: { season: 'Late Summer', organs: 'Spleen, Stomach', emotion: 'Worry/Empathy' },
    metal: { season: 'Autumn', organs: 'Lung, Large Intestine', emotion: 'Grief/Clarity' },
    water: { season: 'Winter', organs: 'Kidney, Bladder', emotion: 'Fear/Wisdom' }
  };

  if (!elementsData) {
    return (
      <div className="text-cosmic-silver text-center py-8">
        <p>No Five Elements analysis available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Element Strength Overview */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">🔥</span>
            Five Elements Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {sortedElements.map(([element, score], index) => {
              const details = elementDetails[element.toLowerCase() as keyof typeof elementDetails];
              const isStrongest = index === 0;
              
              return (
                <div
                  key={element}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    isStrongest
                      ? 'bg-cosmic-gold/10 border-cosmic-gold/30'
                      : 'bg-cosmic-silver/5 border-cosmic-silver/20'
                  }`}
                >
                  <h3 className={`font-semibold mb-2 ${
                    isStrongest ? 'text-cosmic-gold' : 'text-cosmic-silver'
                  }`}>
                    {element}
                  </h3>
                  <div className={`text-2xl font-bold mb-2 ${
                    isStrongest ? 'text-cosmic-gold' : 'text-cosmic-blue'
                  }`}>
                    {score as number}%
                  </div>
                  <div className="space-y-1 text-xs text-cosmic-silver">
                    <div><strong>Season:</strong> {details?.season}</div>
                    <div><strong>Organs:</strong> {details?.organs}</div>
                    <div><strong>Emotion:</strong> {details?.emotion}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Element Interactions */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">🔄</span>
            Element Cycles & Interactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-cosmic-green font-semibold mb-4">🤝 Supportive Cycle (Sheng)</h3>
              <div className="space-y-2">
                <div className="p-3 bg-cosmic-green/10 rounded-lg border border-cosmic-green/20">
                  <p className="text-cosmic-silver text-sm">
                    <span className="text-cosmic-green">Wood</span> feeds <span className="text-cosmic-red">Fire</span> →{' '}
                    <span className="text-cosmic-red">Fire</span> creates <span className="text-cosmic-yellow">Earth</span> →{' '}
                    <span className="text-cosmic-yellow">Earth</span> bears <span className="text-cosmic-gray">Metal</span> →{' '}
                    <span className="text-cosmic-gray">Metal</span> collects <span className="text-cosmic-blue">Water</span> →{' '}
                    <span className="text-cosmic-blue">Water</span> nourishes <span className="text-cosmic-green">Wood</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-cosmic-purple font-semibold mb-4">⚖️ Controlling Cycle (Ke)</h3>
              <div className="space-y-2">
                <div className="p-3 bg-cosmic-purple/10 rounded-lg border border-cosmic-purple/20">
                  <p className="text-cosmic-silver text-sm">
                    <span className="text-cosmic-green">Wood</span> depletes <span className="text-cosmic-yellow">Earth</span> →{' '}
                    <span className="text-cosmic-yellow">Earth</span> absorbs <span className="text-cosmic-blue">Water</span> →{' '}
                    <span className="text-cosmic-blue">Water</span> extinguishes <span className="text-cosmic-red">Fire</span> →{' '}
                    <span className="text-cosmic-red">Fire</span> melts <span className="text-cosmic-gray">Metal</span> →{' '}
                    <span className="text-cosmic-gray">Metal</span> cuts <span className="text-cosmic-green">Wood</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Educational Content */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title">Understanding Five Elements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-cosmic-gold font-medium mb-2">🌿 What Are the Five Elements?</h4>
              <p className="text-cosmic-silver text-sm">
                The Five Elements (Wu Xing) represent different qualities of qi (life energy) and their relationships.
                Each element governs specific organs, emotions, seasons, and life aspects in Traditional Chinese Medicine.
              </p>
            </div>
            
            <div>
              <h4 className="text-cosmic-blue font-medium mb-2">⚖️ Balance vs. Imbalance</h4>
              <p className="text-cosmic-silver text-sm">
                Health occurs when all five elements are in dynamic balance. Imbalances can manifest as
                physical symptoms, emotional patterns, or life challenges related to specific elements.
              </p>
            </div>
            
            <div className="mt-6 p-4 bg-cosmic-gold/10 rounded-lg border border-cosmic-gold/20">
              <p className="text-cosmic-silver text-sm">
                💫 <strong>Personal Practice:</strong> Focus on strengthening your weaker elements through
                diet, lifestyle, and seasonal practices. Your strongest element provides natural resilience,
                while supporting weaker elements creates overall harmony.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ElementsTab.displayName = 'ElementsTab';