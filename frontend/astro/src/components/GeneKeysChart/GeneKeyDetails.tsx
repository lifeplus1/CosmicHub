import React from 'react';
import type { GeneKey } from './types';

interface GeneKeyDetailsProps {
  selectedKey: GeneKey | null;
  onClose?: () => void;
}

const GeneKeyDetails: React.FC<GeneKeyDetailsProps> = React.memo(({ selectedKey, onClose }) => {
  if (!selectedKey) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-cosmic-silver/60">Select a Gene Key to view details</p>
      </div>
    );
  }

  return (
    <div className="cosmic-card bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-cosmic-gold/30">
      <div className="p-6">
        {onClose && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="text-cosmic-silver/60 hover:text-cosmic-silver transition-colors"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-cosmic-gold mb-2">
            Gene Key {selectedKey.number}
          </h3>
          <h4 className="text-xl text-cosmic-silver font-semibold mb-4">
            {selectedKey.name}
          </h4>
          <p className="text-cosmic-silver/80 leading-relaxed">
            {selectedKey.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shadow */}
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🌑</span>
              <h5 className="text-lg font-bold text-red-400">Shadow</h5>
            </div>
            <p className="text-sm text-cosmic-silver/90 leading-relaxed">
              {selectedKey.shadow}
            </p>
          </div>

          {/* Gift */}
          <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🎁</span>
              <h5 className="text-lg font-bold text-green-400">Gift</h5>
            </div>
            <p className="text-sm text-cosmic-silver/90 leading-relaxed">
              {selectedKey.gift}
            </p>
          </div>

          {/* Siddhi */}
          <div className="bg-golden-900/30 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">✨</span>
              <h5 className="text-lg font-bold text-yellow-400">Siddhi</h5>
            </div>
            <p className="text-sm text-cosmic-silver/90 leading-relaxed">
              {selectedKey.siddhi}
            </p>
          </div>
        </div>

        {/* Codon Information */}
        <div className="mt-6 pt-6 border-t border-cosmic-silver/20">
          <div className="text-center">
            <h5 className="text-lg font-bold text-cosmic-silver mb-2">Genetic Codon</h5>
            <p className="text-cosmic-gold font-mono text-xl tracking-wider">
              {selectedKey.codon}
            </p>
            <p className="text-sm text-cosmic-silver/60 mt-2">
              I Ching Hexagram {selectedKey.number}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

GeneKeyDetails.displayName = 'GeneKeyDetails';

export default GeneKeyDetails;
