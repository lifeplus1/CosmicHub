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
      <div className="cosmic-card bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">🧠</span>
            <div>
              <h3 className="text-2xl font-bold text-cyan-400">
                {geneKeysData.activation.name}
              </h3>
              <p className="text-cosmic-silver/80">Intelligence Quotient (IQ) Sequence</p>
            </div>
          </div>
          
          <p className="text-cosmic-silver leading-relaxed">
            {geneKeysData.activation.description}
          </p>
        </div>
      </div>

      {/* Gene Keys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {geneKeysData.activation.keys.map((geneKey, index) => (
          <div
            key={`${geneKey.number}-${index}`}
            className="cosmic-card bg-gradient-to-br from-blue-800/20 to-cyan-800/20 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 cursor-pointer group"
            onClick={() => handleKeyClick(geneKey)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-cyan-400">
                  {geneKey.number}
                </span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  IQ
                </span>
              </div>
              
              <h4 className="text-lg font-semibold text-cosmic-silver mb-2 group-hover:text-cyan-400 transition-colors">
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
      <div className="cosmic-card bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30">
        <div className="p-6">
          <h4 className="text-xl font-bold text-purple-400 mb-4 flex items-center">
            <span className="text-2xl mr-2">🧘‍♀️</span>
            IQ Contemplation Practice
          </h4>
          
          <div className="space-y-4 text-cosmic-silver/90">
            <p>
              The Activation Sequence focuses on developing your mental intelligence and 
              cognitive abilities. This sequence helps you transform limiting mental patterns 
              into gifts of clarity and wisdom.
            </p>
            
            <div className="bg-blue-900/30 border border-blue-500/20 rounded-lg p-4">
              <h5 className="font-bold text-blue-400 mb-2">Practice Guidelines:</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Begin each day by contemplating one Gene Key from your sequence</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Notice mental patterns and how they shift from shadow to gift</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Journal insights about how these patterns show up in your thinking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
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
