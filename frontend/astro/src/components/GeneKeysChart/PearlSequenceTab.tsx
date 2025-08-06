import React, { useCallback } from 'react';
import type { GeneKeysData, GeneKey } from './types';

interface PearlSequenceTabProps {
  geneKeysData: GeneKeysData;
  onKeySelect: (key: GeneKey) => void;
}

const PearlSequenceTab: React.FC<PearlSequenceTabProps> = React.memo(({ 
  geneKeysData, 
  onKeySelect 
}) => {
  const handleKeyClick = useCallback((key: GeneKey) => {
    onKeySelect(key);
  }, [onKeySelect]);

  if (!geneKeysData.sq) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-cosmic-silver/60">No Pearl Sequence data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sequence Header */}
      <div className="border cosmic-card bg-gradient-to-br from-purple-900/30 to-violet-900/30 border-purple-500/30">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <span className="mr-3 text-3xl">�</span>
            <div>
              <h3 className="text-2xl font-bold text-purple-400">
                {geneKeysData.sq.name}
              </h3>
              <p className="text-cosmic-silver/80">Pearl Sequence (SQ) - Spiritual Quotient</p>
            </div>
          </div>
          
          <p className="leading-relaxed text-cosmic-silver">
            {geneKeysData.sq.description}
          </p>
        </div>
      </div>

      {/* Gene Keys Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {geneKeysData.sq.keys.map((geneKey, index) => (
          <div
            key={`${geneKey.number}-${index}`}
            className="transition-all duration-300 border cursor-pointer cosmic-card bg-gradient-to-br from-purple-800/20 to-violet-800/20 border-purple-500/20 hover:border-purple-400/40 group"
            onClick={() => handleKeyClick(geneKey)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-purple-400">
                  {geneKey.number}
                </span>
                <span className="px-2 py-1 text-xs text-purple-400 rounded bg-purple-500/20">
                  SQ
                </span>
              </div>
              
              <h4 className="mb-2 text-lg font-semibold transition-colors text-cosmic-silver group-hover:text-purple-400">
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
      <div className="border cosmic-card bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
        <div className="p-6">
          <h4 className="flex items-center mb-4 text-xl font-bold text-purple-400">
            <span className="mr-2 text-2xl">🌟</span>
            SQ Contemplation Practice
          </h4>
          
          <div className="space-y-4 text-cosmic-silver/90">
            <p>
              The Pearl Sequence represents the highest spiritual intelligence, focusing on 
              your connection to universal consciousness. This sequence helps you transcend 
              personal limitations and embody divine qualities.
            </p>
            
            <div className="p-4 border rounded-lg bg-purple-900/30 border-purple-500/20">
              <h5 className="mb-2 font-bold text-purple-400">Practice Guidelines:</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  <span>Approach these Gene Keys with deep reverence and patience</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  <span>Practice meditation and stillness to receive their wisdom</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  <span>Allow years for each Gene Key to reveal its deepest mysteries</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  <span>Notice how spiritual insights naturally arise from daily practice</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  <span>Trust the intelligence of your own awakening process</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  <span>Embody the Siddhis as lived experience, not concepts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PearlSequenceTab.displayName = 'PearlSequenceTab';

export default PearlSequenceTab;
