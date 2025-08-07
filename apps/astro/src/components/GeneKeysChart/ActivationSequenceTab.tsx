import React, { useCallback } from 'react';
import type { GeneKeysData, GeneKey } from './types';

interface ActivationSequenceTabProps {
  geneKeysData: GeneKeysData;
  onKeySelect: (key: GeneKey) => void;
}

const ActivationSequenceTab: React.FC<ActivationSequenceTabProps> = React.memo(({ 
  geneKeysData, 
  onKeySelect 
}) => {
  const handleKeyClick = useCallback((key: GeneKey) => {
    onKeySelect(key);
  }, [onKeySelect]);

  if (!geneKeysData.activation) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-cosmic-silver/60">No Activation Sequence data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sequence Header */}
      <div className="border cosmic-card bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <span className="mr-3 text-3xl">🧠</span>
            <div>
              <h3 className="text-2xl font-bold text-cyan-400">
                {geneKeysData.activation.name}
              </h3>
              <p className="text-cosmic-silver/80">Intelligence Quotient (IQ) Sequence</p>
            </div>
          </div>
          
          <p className="leading-relaxed text-cosmic-silver">
            {geneKeysData.activation.description}
          </p>
        </div>
      </div>

      {/* Gene Keys Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {geneKeysData.activation.keys.map((geneKey, index) => (
          <div
            key={`${geneKey.number}-${index}`}
            className="transition-all duration-300 border cursor-pointer cosmic-card bg-gradient-to-br from-blue-800/20 to-cyan-800/20 border-blue-500/20 hover:border-blue-400/40 group"
            onClick={() => handleKeyClick(geneKey)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-cyan-400">
                  {geneKey.number}
                </span>
                <span className="px-2 py-1 text-xs text-blue-400 rounded bg-blue-500/20">
                  IQ
                </span>
              </div>
              
              <h4 className="mb-2 text-lg font-semibold transition-colors text-cosmic-silver group-hover:text-cyan-400">
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
      <div className="border cosmic-card bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <div className="p-6">
          <h4 className="flex items-center mb-4 text-xl font-bold text-purple-400">
            <span className="mr-2 text-2xl">🧘‍♀️</span>
            IQ Contemplation Practice
          </h4>
          
          <div className="space-y-4 text-cosmic-silver/90">
            <p>
              The Activation Sequence focuses on developing your mental intelligence and 
              cognitive abilities. This sequence helps you transform limiting mental patterns 
              into gifts of clarity and wisdom.
            </p>
            
            <div className="p-4 border rounded-lg bg-blue-900/30 border-blue-500/20">
              <h5 className="mb-2 font-bold text-blue-400">Practice Guidelines:</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2 text-blue-400">•</span>
                  <span>Begin each day by contemplating one Gene Key from your sequence</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-400">•</span>
                  <span>Notice mental patterns and how they shift from shadow to gift</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-400">•</span>
                  <span>Journal insights about how these patterns show up in your thinking</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-400">•</span>
                  <span>Practice patience as transformation happens naturally over time</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ActivationSequenceTab.displayName = 'ActivationSequenceTab';

export default ActivationSequenceTab;
