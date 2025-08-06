import React from 'react';
import type { GeneKeysData } from './types';

interface HologenicProfileTabProps {
  geneKeysData: GeneKeysData;
}

const HologenicProfileTab: React.FC<HologenicProfileTabProps> = React.memo(({ 
  geneKeysData 
}) => {
  if (!geneKeysData.hologenetic_profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-cosmic-silver/60">No Hologenetic Profile data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cosmic-card bg-gradient-to-br from-violet-900/30 to-indigo-900/30 border border-violet-500/30">
        <div className="p-6 text-center">
          <h3 className="text-3xl font-bold text-violet-400 mb-2 flex items-center justify-center">
            <span className="text-4xl mr-3">🌌</span>
            Hologenetic Profile
          </h3>
          <p className="text-cosmic-silver/80 leading-relaxed">
            Your unique pattern of consciousness evolution and integration path through the Gene Keys system
          </p>
        </div>
      </div>

      {/* Profile Description */}
      <div className="cosmic-card bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30">
        <div className="p-6">
          <h4 className="text-2xl font-bold text-indigo-400 mb-4 flex items-center">
            <span className="text-2xl mr-2">🧬</span>
            Your Consciousness Blueprint
          </h4>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-cosmic-silver/90 leading-relaxed text-lg">
              {geneKeysData.hologenetic_profile.description}
            </p>
          </div>
        </div>
      </div>

      {/* Integration Path */}
      <div className="cosmic-card bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30">
        <div className="p-6">
          <h4 className="text-2xl font-bold text-purple-400 mb-6 flex items-center">
            <span className="text-2xl mr-2">🛤️</span>
            Integration Path
          </h4>
          
          <div className="space-y-4">
            {geneKeysData.hologenetic_profile.integration_path.map((step, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500/30 border border-purple-400/50 rounded-full flex items-center justify-center">
                    <span className="text-purple-400 font-bold text-sm">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-grow">
                  <p className="text-cosmic-silver/90 leading-relaxed">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contemplation Sequence */}
      {geneKeysData.contemplation_sequence && geneKeysData.contemplation_sequence.length > 0 && (
        <div className="cosmic-card bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30">
          <div className="p-6">
            <h4 className="text-2xl font-bold text-amber-400 mb-6 flex items-center">
              <span className="text-2xl mr-2">🧘‍♀️</span>
              Contemplation Sequence
            </h4>
            
            <p className="text-cosmic-silver/80 mb-6">
              A personalized sequence of Gene Keys for deep contemplation practice, designed to 
              support your unique path of consciousness evolution.
            </p>
            
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3">
              {geneKeysData.contemplation_sequence.map((keyNumber, index) => (
                <div
                  key={`contemplation-${keyNumber}-${index}`}
                  className="bg-amber-900/30 border border-amber-500/30 rounded-lg p-3 text-center hover:bg-amber-800/40 transition-colors cursor-pointer"
                  title={`Gene Key ${keyNumber} - Position ${index + 1} in contemplation sequence`}
                >
                  <div className="text-amber-400 font-bold text-lg">
                    {keyNumber}
                  </div>
                  <div className="text-xs text-cosmic-silver/60 mt-1">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-amber-900/20 border border-amber-500/20 rounded-lg">
              <h5 className="font-bold text-amber-400 mb-2">Contemplation Practice:</h5>
              <ul className="space-y-2 text-sm text-cosmic-silver/90">
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  <span>Work with one Gene Key per week or month, depending on your pace</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  <span>Follow the sequence order for optimal integration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  <span>Journal insights and observe how patterns shift in your life</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  <span>Return to the beginning when you complete the full sequence</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Integration Wisdom */}
      <div className="cosmic-card bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30">
        <div className="p-6">
          <h4 className="text-2xl font-bold text-emerald-400 mb-4 flex items-center">
            <span className="text-2xl mr-2">💎</span>
            Living Your Hologenetic Profile
          </h4>
          
          <div className="space-y-4 text-cosmic-silver/90">
            <p>
              Your Hologenetic Profile represents the unique way consciousness expresses itself 
              through you. It's not a fixed destiny, but a living, evolving pattern that unfolds 
              through your conscious participation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-lg p-4">
                <h5 className="font-bold text-emerald-400 mb-2">Key Principles:</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">•</span>
                    <span>Trust your unique timing and rhythm</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">•</span>
                    <span>Embrace both shadow and light aspects</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">•</span>
                    <span>Allow natural transformation without force</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-teal-900/30 border border-teal-500/20 rounded-lg p-4">
                <h5 className="font-bold text-teal-400 mb-2">Daily Practice:</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-teal-400 mr-2">•</span>
                    <span>Observe patterns without judgment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-400 mr-2">•</span>
                    <span>Cultivate patience with your process</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-400 mr-2">•</span>
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
