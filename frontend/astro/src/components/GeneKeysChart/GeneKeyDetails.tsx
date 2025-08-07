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
    <div className="border cosmic-card bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-cosmic-gold/30">
      <div className="p-6">
        {onClose && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="transition-colors text-cosmic-silver/60 hover:text-cosmic-silver"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="mb-6 text-center">
          <h3 className="mb-2 text-2xl font-bold text-cosmic-gold">
            Gene Key {selectedKey.number}
          </h3>
          <h4 className="mb-4 text-xl font-semibold text-cosmic-silver">
            {selectedKey.name}
          </h4>
          <p className="leading-relaxed text-cosmic-silver/80">
            {selectedKey.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Shadow */}
          <div className="p-4 border rounded-lg bg-red-900/30 border-red-500/30">
            <div className="flex items-center mb-3">
              <span className="mr-2 text-2xl">🌑</span>
              <h5 className="text-lg font-bold text-red-400">Shadow</h5>
            </div>
            <p className="text-sm leading-relaxed text-cosmic-silver/90">
              {selectedKey.shadow}
            </p>
          </div>

          {/* Gift */}
          <div className="p-4 border rounded-lg bg-green-900/30 border-green-500/30">
            <div className="flex items-center mb-3">
              <span className="mr-2 text-2xl">🎁</span>
              <h5 className="text-lg font-bold text-green-400">Gift</h5>
            </div>
            <p className="text-sm leading-relaxed text-cosmic-silver/90">
              {selectedKey.gift}
            </p>
          </div>

          {/* Siddhi */}
          <div className="p-4 border rounded-lg bg-golden-900/30 border-yellow-500/30">
            <div className="flex items-center mb-3">
              <span className="mr-2 text-2xl">✨</span>
              <h5 className="text-lg font-bold text-yellow-400">Siddhi</h5>
            </div>
            <p className="text-sm leading-relaxed text-cosmic-silver/90">
              {selectedKey.siddhi}
            </p>
          </div>
        </div>

        {/* Codon Information */}
        <div className="pt-6 mt-6 border-t border-cosmic-silver/20">
          <div className="text-center">
            <h5 className="mb-2 text-lg font-bold text-cosmic-silver">Genetic Codon</h5>
            <p className="font-mono text-xl tracking-wider text-cosmic-gold">
              {selectedKey.codon}
            </p>
            <p className="mt-2 text-sm text-cosmic-silver/60">
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