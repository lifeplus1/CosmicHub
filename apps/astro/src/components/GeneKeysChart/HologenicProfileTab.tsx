import React from 'react';
import type { GeneKeysData } from './types';

interface HologenicProfileTabProps {
  geneKeysData: GeneKeysData;
}

const HologenicProfileTab: React.FC<HologenicProfileTabProps> = React.memo(({ 
  geneKeysData 
}) => {
  // Strict null/undefined check for hologenetic_profile
  if (geneKeysData.hologenetic_profile === null || geneKeysData.hologenetic_profile === undefined || typeof geneKeysData.hologenetic_profile !== 'object') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-cosmic-silver/60">No Hologenetic Profile data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border cosmic-card bg-gradient-to-br from-violet-900/30 to-indigo-900/30 border-violet-500/30">
        <div className="p-6 text-center">
          <h3 className="flex items-center justify-center mb-2 text-3xl font-bold text-violet-400">
            <span className="mr-3 text-4xl">🌌</span>
            Hologenetic Profile
          </h3>
          <p className="leading-relaxed text-cosmic-silver/80">
            Your unique pattern of consciousness evolution and integration path through the Gene Keys system
          </p>
        </div>
      </div>

      {/* Profile Description */}
      <div className="border cosmic-card bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
        <div className="p-6">
          <h4 className="flex items-center mb-4 text-2xl font-bold text-indigo-400">
            <span className="mr-2 text-2xl">🧬</span>
            Your Consciousness Blueprint
          </h4>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-cosmic-silver/90">
              {geneKeysData.hologenetic_profile.description}
            </p>
          </div>
        </div>
      </div>

      {/* Integration Path */}
      <div className="border cosmic-card bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <div className="p-6">
          <h4 className="flex items-center mb-6 text-2xl font-bold text-purple-400">
            <span className="mr-2 text-2xl">🛤️</span>
            Integration Path
          </h4>
          
          <div className="space-y-4">
            {geneKeysData.hologenetic_profile.integration_path.map((step, index) => (
              <div
                key={index}
                className="flex items-start p-4 space-x-4 border rounded-lg bg-purple-900/20 border-purple-500/20"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 border rounded-full bg-purple-500/30 border-purple-400/50">
                    <span className="text-sm font-bold text-purple-400">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-grow">
                  <p className="leading-relaxed text-cosmic-silver/90">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contemplation Sequence */}
  {geneKeysData.contemplation_sequence !== null && geneKeysData.contemplation_sequence !== undefined && Array.isArray(geneKeysData.contemplation_sequence) && geneKeysData.contemplation_sequence.length > 0 && (
        <div className="border cosmic-card bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30">
          <div className="p-6">
            <h4 className="flex items-center mb-6 text-2xl font-bold text-amber-400">
              <span className="mr-2 text-2xl">🧘‍♀️</span>
              Contemplation Sequence
            </h4>
            
            <p className="mb-6 text-cosmic-silver/80">
              A personalized sequence of Gene Keys for deep contemplation practice, designed to 
              support your unique path of consciousness evolution.
            </p>
            
            <div className="grid grid-cols-4 gap-3 md:grid-cols-8 lg:grid-cols-12">
              {geneKeysData.contemplation_sequence.map((keyNumber, index) => (
                <div
                  key={`contemplation-${keyNumber}-${index}`}
                  className="p-3 text-center transition-colors border rounded-lg cursor-pointer bg-amber-900/30 border-amber-500/30 hover:bg-amber-800/40"
                  title={`Gene Key ${keyNumber} - Position ${index + 1} in contemplation sequence`}
                >
                  <div className="text-lg font-bold text-amber-400">
                    {keyNumber}
                  </div>
                  <div className="mt-1 text-xs text-cosmic-silver/60">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 mt-6 border rounded-lg bg-amber-900/20 border-amber-500/20">
              <h5 className="mb-2 font-bold text-amber-400">Contemplation Practice:</h5>
              <ul className="space-y-2 text-sm text-cosmic-silver/90">
                <li className="flex items-start">
                  <span className="mr-2 text-amber-400">•</span>
                  <span>Work with one Gene Key per week or month, depending on your pace</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-amber-400">•</span>
                  <span>Follow the sequence order for optimal integration</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-amber-400">•</span>
                  <span>Journal insights and observe how patterns shift in your life</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-amber-400">•</span>
                  <span>Return to the beginning when you complete the full sequence</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Integration Wisdom */}
      <div className="border cosmic-card bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/30">
        <div className="p-6">
          <h4 className="flex items-center mb-4 text-2xl font-bold text-emerald-400">
            <span className="mr-2 text-2xl">💎</span>
            Living Your Hologenetic Profile
          </h4>
          
          <div className="space-y-4 text-cosmic-silver/90">
            <p>
              Your Hologenetic Profile represents the unique way consciousness expresses itself 
              through you. It&apos;s not a fixed destiny, but a living, evolving pattern that unfolds 
              through your conscious participation.
            </p>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg bg-emerald-900/30 border-emerald-500/20">
                <h5 className="mb-2 font-bold text-emerald-400">Key Principles:</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2 text-emerald-400">•</span>
                    <span>Trust your unique timing and rhythm</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-emerald-400">•</span>
                    <span>Embrace both shadow and light aspects</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-emerald-400">•</span>
                    <span>Allow natural transformation without force</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg bg-teal-900/30 border-teal-500/20">
                <h5 className="mb-2 font-bold text-teal-400">Daily Practice:</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2 text-teal-400">•</span>
                    <span>Observe patterns without judgment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-teal-400">•</span>
                    <span>Cultivate patience with your process</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-teal-400">•</span>
                    <span>Trust your inner wisdom and intuition</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

HologenicProfileTab.displayName = 'HologenicProfileTab';

export default HologenicProfileTab;
