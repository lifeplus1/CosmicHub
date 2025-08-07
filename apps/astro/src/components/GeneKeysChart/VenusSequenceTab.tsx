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
      <div className="border cosmic-card bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-pink-500/30">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <span className="mr-3 text-3xl">💖</span>
            <div>
              <h3 className="text-2xl font-bold text-pink-400">
                {geneKeysData.eq.name}
              </h3>
              <p className="text-cosmic-silver/80">Emotional Quotient (EQ) Sequence</p>
            </div>
          </div>
          
          <p className="leading-relaxed text-cosmic-silver">
            {geneKeysData.eq.description}
          </p>
        </div>
      </div>

      {/* Gene Keys Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {geneKeysData.eq.keys.map((geneKey, index) => (
          <div
            key={`${geneKey.number}-${index}`}
            className="transition-all duration-300 border cursor-pointer cosmic-card bg-gradient-to-br from-pink-800/20 to-rose-800/20 border-pink-500/20 hover:border-pink-400/40 group"
            onClick={() => handleKeyClick(geneKey)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-pink-400">
                  {geneKey.number}
                </span>
                <span className="px-2 py-1 text-xs text-pink-400 rounded bg-pink-500/20">
                  EQ
                </span>
              </div>
              
              <h4 className="mb-2 text-lg font-semibold transition-colors text-cosmic-silver group-hover:text-pink-400">
                {geneKey.name}
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="mr-2 text-red-400">🌑</span>
                  <span className="text-cosmic-silver/80">{geneKey.shadow}</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-green-400">🎁</span>
                  <span className="text-cosmic-silver/80">{geneKey.gift}</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-yellow-400">✨</span>
                  <span className="text-cosmic-silver/80">{geneKey.siddhi}</span>
                </div>
              </div>
              
              <div className="pt-3 mt-3 border-t border-cosmic-silver/10">
                <span className="font-mono text-xs text-cosmic-silver/60">
                  Codon: {geneKey.codon}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contemplation Guide */}
      <div className="border cosmic-card bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <div className="p-6">
          <h4 className="flex items-center mb-4 text-xl font-bold text-pink-400">
            <span className="mr-2 text-2xl">💝</span>
            EQ Contemplation Practice
          </h4>
          
          <div className="space-y-4 text-cosmic-silver/90">
            <p>
              The Venus Sequence focuses on developing your emotional intelligence and 
              capacity for love. This sequence helps you transform emotional reactivity 
              into the gift of compassion and ultimately unconditional love.
            </p>
            
            <div className="p-4 border rounded-lg bg-pink-900/30 border-pink-500/20">
              <h5 className="mb-2 font-bold text-pink-400">Practice Guidelines:</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2 text-pink-400">•</span>
                  <span>Observe emotional patterns without judgment or resistance</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-pink-400">•</span>
                  <span>Practice feeling emotions fully while staying present</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-pink-400">•</span>
                  <span>Notice how emotional shadows transform into gifts of understanding</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-pink-400">•</span>
                  <span>Cultivate self-compassion as the foundation for loving others</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-pink-400">•</span>
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
