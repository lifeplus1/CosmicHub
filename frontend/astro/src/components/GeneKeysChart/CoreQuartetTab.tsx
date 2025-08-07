import React, { useCallback } from 'react';
import type { GeneKeysData, GeneKey } from './types';

interface CoreQuartetTabProps {
  geneKeysData: GeneKeysData;
  onKeySelect: (key: GeneKey) => void;
}

const CoreQuartetTab: React.FC<CoreQuartetTabProps> = React.memo(({ 
  geneKeysData, 
  onKeySelect 
}) => {
  const handleKeyClick = useCallback((key: GeneKey) => {
    onKeySelect(key);
  }, [onKeySelect]);

  const coreKeys = [
    {
      key: geneKeysData.life_work,
      title: "Life's Work",
      description: "Your primary life purpose and creative expression",
      icon: "🌱",
      color: "emerald"
    },
    {
      key: geneKeysData.evolution,
      title: "Evolution",
      description: "The area of your greatest challenge and growth",
      icon: "🦋",
      color: "blue"
    },
    {
      key: geneKeysData.radiance,
      title: "Radiance",
      description: "How you attract abundance and magnetism",
      icon: "✨",
      color: "yellow"
    },
    {
      key: geneKeysData.purpose,
      title: "Purpose",
      description: "Your highest service to humanity",
      icon: "🎯",
      color: "purple"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border cosmic-card bg-gradient-to-br from-golden-900/30 to-amber-900/30 border-golden-500/30">
        <div className="p-6 text-center">
          <h3 className="mb-2 text-3xl font-bold text-golden-400">
            Core Quartet
          </h3>
          <p className="leading-relaxed text-cosmic-silver/80">
            The four foundational Gene Keys that form the blueprint of your unique path in life. 
            These keys work together to reveal your deepest purpose and highest potential.
          </p>
        </div>
      </div>

      {/* Core Keys Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {coreKeys.map((item, index) => {
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

      {/* Integration Guide */}
      <div className="border cosmic-card bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
        <div className="p-6">
          <h4 className="flex items-center mb-4 text-xl font-bold text-indigo-400">
            <span className="mr-2 text-2xl">🔗</span>
            Working with Your Core Quartet
          </h4>
          
          <div className="space-y-4 text-cosmic-silver/90">
            <p>
              Your Core Quartet represents the foundational architecture of your consciousness. 
              These four Gene Keys work together as an integrated system to guide your life's 
              unfoldment and spiritual evolution.
            </p>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg bg-emerald-900/30 border-emerald-500/20">
                <h5 className="mb-2 font-bold text-emerald-400">Life's Work & Evolution</h5>
                <p className="text-sm">
                  These work as a pair - your Life's Work shows your natural gifts, while Evolution 
                  reveals where you'll face resistance and ultimately breakthrough to mastery.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg bg-purple-900/30 border-purple-500/20">
                <h5 className="mb-2 font-bold text-purple-400">Radiance & Purpose</h5>
                <p className="text-sm">
                  Your Radiance attracts the resources you need to fulfill your Purpose. As you 
                  embody your gifts, you naturally magnetize opportunities for service.
                </p>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-golden-900/30 border-golden-500/20">
              <h5 className="mb-2 font-bold text-golden-400">Integration Practice:</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2 text-golden-400">•</span>
                  <span>Contemplate one Gene Key per season (3-month cycles)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-golden-400">•</span>
                  <span>Notice how the shadows of each key show up in your daily life</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-golden-400">•</span>
                  <span>Allow the gifts to emerge naturally through acceptance, not force</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-golden-400">•</span>
                  <span>Trust that your unique combination creates something new in the world</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CoreQuartetTab.displayName = 'CoreQuartetTab';

export default CoreQuartetTab;
