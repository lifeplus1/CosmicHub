import React, { useCallback } from 'react';
import type { GeneKeysData, GeneKey } from './types';

interface SacredSequenceTabProps {
  geneKeysData: GeneKeysData;
  onKeySelect: (key: GeneKey) => void;
}

const SacredSequenceTab: React.FC<SacredSequenceTabProps> = React.memo(({ 
  geneKeysData, 
  onKeySelect 
}) => {
  const handleKeyClick = useCallback((key: GeneKey) => {
    onKeySelect(key);
  }, [onKeySelect]);

  if (!geneKeysData.sq) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-cosmic-silver/60">No Sacred Sequence data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sequence Header */}
      <div className="cosmic-card bg-gradient-to-br from-purple-900/30 to-violet-900/30 border border-purple-500/30">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">🕉️</span>
            <div>
              <h3 className="text-2xl font-bold text-purple-400">
                {geneKeysData.sq.name}
              </h3>
              <p className="text-cosmic-silver/80">Spiritual Quotient (SQ) Sequence</p>
            </div>
          </div>
          
          <p className="text-cosmic-silver leading-relaxed">
            {geneKeysData.sq.description}
          </p>
        </div>
      </div>

      {/* Gene Keys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {geneKeysData.sq.keys.map((geneKey, index) => (
          <div
            key={`${geneKey.number}-${index}`}
            className="cosmic-card bg-gradient-to-br from-purple-800/20 to-violet-800/20 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 cursor-pointer group"
            onClick={() => handleKeyClick(geneKey)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-purple-400">
                  {geneKey.number}
                </span>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                  SQ
                </span>
              </div>
              
              <h4 className="text-lg font-semibold text-cosmic-silver mb-2 group-hover:text-purple-400 transition-colors">
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
      <div className="cosmic-card bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30">
        <div className="p-6">
          <h4 className="text-xl font-bold text-purple-400 mb-4 flex items-center">
            <span className="text-2xl mr-2">🌟</span>
            SQ Contemplation Practice
          </h4>
          
          <div className="space-y-4 text-cosmic-silver/90">
            <p>
              The Sacred Sequence represents the highest spiritual intelligence, focusing on 
              your connection to universal consciousness. This sequence helps you transcend 
              personal limitations and embody divine qualities.
            </p>
            
            <div className="bg-purple-900/30 border border-purple-500/20 rounded-lg p-4">
              <h5 className="font-bold text-purple-400 mb-2">Practice Guidelines:</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Approach these Gene Keys with deep reverence and patience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Practice meditation and stillness to receive their wisdom</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Allow years for each Gene Key to reveal its deepest mysteries</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Notice how spiritual insights naturally arise from daily practice</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Trust the intelligence of your own awakening process</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
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

SacredSequenceTab.displayName = 'SacredSequenceTab';

export default SacredSequenceTab;
