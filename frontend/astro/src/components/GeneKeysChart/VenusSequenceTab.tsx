import React, { useCallback } from 'react';
import type { GeneKeysData, GeneKey } from './types';

interface VenusSequenceTabProps {
  geneKeysData: GeneKeysData;
  onKeySelect: (key: GeneKey) => void;
}

const VenusSequenceTab: React.FC<VenusSequenceTabProps> = React.memo(({ 
  geneKeysData, 
  onKeySelect 
}) => {
  const handleKeyClick = useCallback((key: GeneKey) => {
    onKeySelect(key);
  }, [onKeySelect]);

  if (!geneKeysData.eq) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-cosmic-silver/60">No Venus Sequence data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sequence Header */}
      <div className="cosmic-card bg-gradient-to-br from-pink-900/30 to-rose-900/30 border border-pink-500/30">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">💖</span>
            <div>
              <h3 className="text-2xl font-bold text-pink-400">
                {geneKeysData.eq.name}
              </h3>
              <p className="text-cosmic-silver/80">Emotional Quotient (EQ) Sequence</p>
            </div>
          </div>
          
          <p className="text-cosmic-silver leading-relaxed">
            {geneKeysData.eq.description}
          </p>
        </div>
      </div>

      {/* Gene Keys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {geneKeysData.eq.keys.map((geneKey, index) => (
          <div
            key={`${geneKey.number}-${index}`}
            className="cosmic-card bg-gradient-to-br from-pink-800/20 to-rose-800/20 border border-pink-500/20 hover:border-pink-400/40 transition-all duration-300 cursor-pointer group"
            onClick={() => handleKeyClick(geneKey)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-pink-400">
                  {geneKey.number}
                </span>
                <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-1 rounded">
                  EQ
                </span>
              </div>
              
              <h4 className="text-lg font-semibold text-cosmic-silver mb-2 group-hover:text-pink-400 transition-colors">
                {geneKey.name}
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="text-red-400 mr-2">🌑</span>
                  <span className="text-cosmic-silver/80">{geneKey.shadow}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">🎁</span>
                  <span className="text-cosmic-silver/80">{geneKey.gift}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2">✨</span>
                  <span className="text-cosmic-silver/80">{geneKey.siddhi}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-cosmic-silver/10">
                <span className="text-xs text-cosmic-silver/60 font-mono">
                  Codon: {geneKey.codon}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contemplation Guide */}
      <div className="cosmic-card bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30">
        <div className="p-6">
          <h4 className="text-xl font-bold text-pink-400 mb-4 flex items-center">
            <span className="text-2xl mr-2">💝</span>
            EQ Contemplation Practice
          </h4>
          
          <div className="space-y-4 text-cosmic-silver/90">
            <p>
              The Venus Sequence focuses on developing your emotional intelligence and 
              capacity for love. This sequence helps you transform emotional reactivity 
              into the gift of compassion and ultimately unconditional love.
            </p>
            
            <div className="bg-pink-900/30 border border-pink-500/20 rounded-lg p-4">
              <h5 className="font-bold text-pink-400 mb-2">Practice Guidelines:</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  <span>Observe emotional patterns without judgment or resistance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  <span>Practice feeling emotions fully while staying present</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  <span>Notice how emotional shadows transform into gifts of understanding</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  <span>Cultivate self-compassion as the foundation for loving others</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  <span>Trust that emotional mastery develops through patient acceptance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

VenusSequenceTab.displayName = 'VenusSequenceTab';

export default VenusSequenceTab;
