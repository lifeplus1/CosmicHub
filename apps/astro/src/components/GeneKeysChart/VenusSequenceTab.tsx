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

  // Check if we have the individual Venus sequence components
  if (!geneKeysData.attraction && !geneKeysData.iq && !geneKeysData.eq && !geneKeysData.sq) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-cosmic-silver/60">No Venus Sequence data available</p>
      </div>
    );
  }

  const venusKeys = [
    {
      key: geneKeysData.attraction,
      title: "Attraction",
      description: "How you attract opportunities and relationships",
      icon: "🌙",
      color: "blue"
    },
    {
      key: geneKeysData.iq,
      title: "IQ",
      description: "Your intellectual gifts and mental clarity", 
      icon: "🧠",
      color: "purple"
    },
    {
      key: geneKeysData.eq,
      title: "EQ", 
      description: "Your emotional intelligence and heart wisdom",
      icon: "💖",
      color: "pink"
    },
    {
      key: geneKeysData.sq,
      title: "SQ",
      description: "Your spiritual intelligence and higher consciousness",
      icon: "✨", 
      color: "violet"
    }
  ].filter(item => item.key); // Only include items that have data

  // Add Core Wound if it exists
  if (geneKeysData.core_wound) {
    venusKeys.push({
      key: geneKeysData.core_wound,
      title: "Core Wound",
      description: "Your deepest challenge that becomes your greatest gift",
      icon: "🌹",
      color: "red"
    });
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
                Venus Sequence
              </h3>
              <p className="text-cosmic-silver/80">The Art of Relationship</p>
            </div>
          </div>
          
          <p className="leading-relaxed text-cosmic-silver">
            Your relationships and how you attract and give love
          </p>
        </div>
      </div>

      {/* Gene Keys Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {venusKeys.map((item, index) => {
          if (!item.key) return null;
          
          return (
            <div
              key={`${item.key.number}-${index}`}
              className={`cosmic-card bg-gradient-to-br from-${item.color}-900/20 to-${item.color}-800/20 border border-${item.color}-500/30 hover:border-${item.color}-400/50 transition-all duration-300 cursor-pointer group`}
              onClick={() => handleKeyClick(item.key)}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="mr-4 text-4xl">{item.icon}</span>
                  <div>
                    <h4 className={`text-2xl font-bold text-${item.color}-400 group-hover:text-${item.color}-300 transition-colors`}>
                      {item.title}
                    </h4>
                    <p className="text-sm text-cosmic-silver/60">
                      Gene Key {item.key.number}
                    </p>
                  </div>
                </div>
                
                <h5 className="mb-3 text-xl font-semibold transition-colors text-cosmic-silver group-hover:text-white">
                  {item.key.name}
                </h5>
                
                <p className="mb-4 text-sm leading-relaxed text-cosmic-silver/80">
                  {item.description}
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg bg-red-900/20 border-red-500/20">
                    <div className="flex items-start">
                      <span className="mr-2 text-sm text-red-400">🌑</span>
                      <div>
                        <span className="text-sm font-semibold text-red-400">Shadow:</span>
                        <span className="ml-2 text-sm text-cosmic-silver/90">{item.key.shadow}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg bg-green-900/20 border-green-500/20">
                    <div className="flex items-start">
                      <span className="mr-2 text-sm text-green-400">🎁</span>
                      <div>
                        <span className="text-sm font-semibold text-green-400">Gift:</span>
                        <span className="ml-2 text-sm text-cosmic-silver/90">{item.key.gift}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg bg-yellow-900/20 border-yellow-500/20">
                    <div className="flex items-start">
                      <span className="mr-2 text-sm text-yellow-400">✨</span>
                      <div>
                        <span className="text-sm font-semibold text-yellow-400">Siddhi:</span>
                        <span className="ml-2 text-sm text-cosmic-silver/90">{item.key.siddhi}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t border-cosmic-silver/10">
                  <span className="font-mono text-xs text-cosmic-silver/60">
                    Codon: {item.key.codon}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contemplation Guide */}
      <div className="border cosmic-card bg-gradient-to-br from-rose-900/20 to-pink-900/20 border-rose-500/30">
        <div className="p-6">
          <h4 className="flex items-center mb-4 text-xl font-bold text-rose-400">
            <span className="mr-2 text-2xl">🌹</span>
            Working with Your Venus Sequence
          </h4>
          
          <div className="space-y-4 text-cosmic-silver/90">
            <p>
              The Venus Sequence governs your capacity for love, relationships, and emotional 
              intelligence. These Gene Keys work together to show how you attract, give, 
              and receive love in all its forms.
            </p>
            
            <div className="p-4 border rounded-lg bg-pink-900/30 border-pink-500/20">
              <h5 className="mb-2 font-bold text-pink-400">Integration Practice:</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2 text-pink-400">•</span>
                  <span>Contemplate one Venus Gene Key per month</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-pink-400">•</span>
                  <span>Notice how these patterns show up in your relationships</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-pink-400">•</span>
                  <span>Practice moving from shadow to gift through acceptance</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-pink-400">•</span>
                  <span>Allow your heart's wisdom to guide your connections</span>
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