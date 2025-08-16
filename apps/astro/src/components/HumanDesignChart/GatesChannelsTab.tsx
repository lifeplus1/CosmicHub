import React, { useState } from 'react';
import type { TabProps } from './types';
import InlineTooltip from './InlineTooltip';
import HumanDesignModal, { type GateModalData, type ChannelModalData } from './HumanDesignModal';

// Channel data for tooltips and modals
const CHANNELS: Record<string, { name: string; circuit: string; theme: string; }> = {
  "1-8": { name: "The Channel of Inspiration", circuit: "Individual", theme: "Creative Role Model" },
  "2-14": { name: "The Channel of the Beat", circuit: "Individual", theme: "Keeper of the Keys" },
  "3-60": { name: "The Channel of Mutation", circuit: "Individual", theme: "Energy for Change" },
  "4-63": { name: "The Channel of Logic", circuit: "Collective", theme: "Mental Ease" },
  "5-15": { name: "The Channel of Rhythm", circuit: "Collective", theme: "Being in the Flow" },
  "6-59": { name: "The Channel of Mating", circuit: "Tribal", theme: "Focused on Reproduction" },
  "7-31": { name: "The Channel of the Alpha", circuit: "Collective", theme: "Leadership for the Future" },
  "9-52": { name: "The Channel of Concentration", circuit: "Collective", theme: "Focused Determination" },
  "10-20": { name: "The Channel of Awakening", circuit: "Individual", theme: "Commitment to Higher Principles" },
  "10-34": { name: "The Channel of Exploration", circuit: "Individual", theme: "Following One's Convictions" },
  "10-57": { name: "The Channel of Perfected Form", circuit: "Individual", theme: "Survival" },
  "11-56": { name: "The Channel of Curiosity", circuit: "Collective", theme: "The Seeker" },
  "12-22": { name: "The Channel of Openness", circuit: "Individual", theme: "A Social Being" },
  "13-33": { name: "The Channel of the Prodigal", circuit: "Collective", theme: "A Witness" },
  "16-48": { name: "The Channel of the Wavelength", circuit: "Collective", theme: "Talent" },
  "17-62": { name: "The Channel of Acceptance", circuit: "Collective", theme: "An Organized Being" },
  "18-58": { name: "The Channel of Judgment", circuit: "Collective", theme: "Insatiable Critic" },
  "19-49": { name: "The Channel of Synthesis", circuit: "Tribal", theme: "Sensitivity" },
  "20-57": { name: "The Channel of the Brainwave", circuit: "Individual", theme: "Penetrating Awareness" },
  "21-45": { name: "The Channel of Money", circuit: "Tribal", theme: "A Material Way of Life" },
  "23-43": { name: "The Channel of Structuring", circuit: "Individual", theme: "Genius to Freak" },
  "24-61": { name: "The Channel of Awareness", circuit: "Individual", theme: "Thinker" },
  "25-51": { name: "The Channel of Initiation", circuit: "Individual", theme: "Needing to be First" },
  "26-44": { name: "The Channel of Surrender", circuit: "Tribal", theme: "A Transmitter" },
  "27-50": { name: "The Channel of Preservation", circuit: "Tribal", theme: "Custodianship" },
  "28-38": { name: "The Channel of Struggle", circuit: "Individual", theme: "Stubbornness" },
  "29-46": { name: "The Channel of Discovery", circuit: "Collective", theme: "Succeeding Where Others Fail" },
  "30-41": { name: "The Channel of Recognition", circuit: "Individual", theme: "A Focused Way of Life" },
  "32-54": { name: "The Channel of Transformation", circuit: "Tribal", theme: "Being Driven" },
  "34-57": { name: "The Channel of Power", circuit: "Individual", theme: "An Archetype" },
  "35-36": { name: "The Channel of Transitoriness", circuit: "Collective", theme: "A Being of Experience" },
  "37-40": { name: "The Channel of Community", circuit: "Tribal", theme: "A Part Seeking Wholeness" },
  "39-55": { name: "The Channel of Emoting", circuit: "Individual", theme: "Moodiness" },
  "42-53": { name: "The Channel of Maturation", circuit: "Collective", theme: "Balanced Development" },
  "47-64": { name: "The Channel of Abstraction", circuit: "Collective", theme: "Mental Activity & Clarity" }
};

const GatesChannelsTab: React.FC<TabProps> = ({ humanDesignData }) => {
  // Safe data extraction with fallbacks
  const gates = humanDesignData?.gates || [];
  const channels = humanDesignData?.channels || [];
  
  // Modal state
  const [modalData, setModalData] = useState<GateModalData | ChannelModalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Define planetary order for sorting
  const planetaryOrder = [
    'sun', 'earth', 'moon', 'north_node', 'south_node',
    'mercury', 'venus', 'mars', 'jupiter', 'saturn',
    'uranus', 'neptune', 'pluto'
  ];
  
  // Function to sort gates by planetary order
  const sortGatesByPlanetaryOrder = (gates: any[]) => {
    return gates.sort((a, b) => {
      const planetA = a?.planet?.toLowerCase() || '';
      const planetB = b?.planet?.toLowerCase() || '';
      
      const indexA = planetaryOrder.indexOf(planetA);
      const indexB = planetaryOrder.indexOf(planetB);
      
      // If planet not found in order, put it at the end
      const orderA = indexA === -1 ? 999 : indexA;
      const orderB = indexB === -1 ? 999 : indexB;
      
      return orderA - orderB;
    });
  };
  
  // Separate gates by type with proper data validation
  const personalityGates = sortGatesByPlanetaryOrder(
    gates.filter(gate => 
      gate && typeof gate === 'object' && gate.type === 'personality'
    )
  );
  const designGates = sortGatesByPlanetaryOrder(
    gates.filter(gate => 
      gate && typeof gate === 'object' && gate.type === 'design'
    )
  );

  // Click handlers for opening modals
  const handleGateClick = (gate: any) => {
    const gateData: GateModalData = {
      type: 'gate',
      number: gate.number,
      line: gate.line,
      name: gate.name,
      center: gate.center,
      planet: gate.planet,
      planet_symbol: gate.planet_symbol,
      gateType: gate.type,
      position: gate.position
    };
    setModalData(gateData);
    setIsModalOpen(true);
  };

  const handleChannelClick = (channel: string) => {
    const channelInfo = CHANNELS[channel];
    if (channelInfo) {
      const channelData: ChannelModalData = {
        type: 'channel',
        id: channel,
        name: channelInfo.name,
        circuit: channelInfo.circuit,
        theme: channelInfo.theme,
        gates: channel.split('-').map(g => parseInt(g))
      };
      setModalData(channelData);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  return (
    <div className="grid grid-cols-3 gap-4 max-w-6xl mx-auto">
        {/* Personality Column */}
        <div className="cosmic-card">
          <div className="p-3">
            <h4 className="text-sm font-medium text-yellow-400 mb-2 text-center">
              Personality ({personalityGates.length})
            </h4>
          <div className="space-y-1">
            {personalityGates.map((gate, index) => (
              <InlineTooltip 
                key={`personality-${index}`} 
                content={`Gate ${gate?.number}.${gate?.line} • ${gate?.name || 'Unknown Gate'}`}
                position="right"
              >
                <div 
                  className="px-2 py-1 rounded border-l-4 border-yellow-500 bg-yellow-50/10 flex items-center space-x-2 cursor-pointer hover:bg-yellow-50/20 transition-colors"
                  onClick={() => handleGateClick(gate)}
                >
                  <span className="text-xl">{gate?.planet_symbol || '○'}</span>
                  <span className="font-bold text-sm">
                    {gate?.number || '?'}.{gate?.line || '?'}
                  </span>
                  <span className="text-sm text-yellow-300">{gate?.center || 'Unknown'}</span>
                </div>
              </InlineTooltip>
            ))}
            {personalityGates.length === 0 && (
              <div className="text-center text-cosmic-silver py-2">
                <p className="text-sm">No personality gates</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Design Column */}
      <div className="cosmic-card">
        <div className="p-3">
          <h4 className="text-sm font-medium text-blue-400 mb-2 text-center">
            Design ({designGates.length})
          </h4>
          <div className="space-y-1">
            {designGates.map((gate, index) => (
              <InlineTooltip 
                key={`design-${index}`} 
                content={`Gate ${gate?.number}.${gate?.line} • ${gate?.name || 'Unknown Gate'}`}
                position="left"
              >
                <div 
                  className="px-2 py-1 rounded border-l-4 border-blue-500 bg-blue-50/10 flex items-center space-x-2 cursor-pointer hover:bg-blue-50/20 transition-colors"
                  onClick={() => handleGateClick(gate)}
                >
                  <span className="text-xl">{gate?.planet_symbol || '○'}</span>
                  <span className="font-bold text-sm">
                    {gate?.number || '?'}.{gate?.line || '?'}
                  </span>
                  <span className="text-sm text-blue-300">{gate?.center || 'Unknown'}</span>
                </div>
              </InlineTooltip>
            ))}
            {designGates.length === 0 && (
              <div className="text-center text-cosmic-silver py-2">
                <p className="text-sm">No design gates</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channels Column */}
      <div className="cosmic-card">
        <div className="p-3">
          <h4 className="text-sm font-medium text-purple-400 mb-2 text-center">
            Channels ({channels.length})
          </h4>
          <div className="space-y-1">
            {channels && channels.length > 0 ? (
              channels.map((channel, index) => {
                const channelId = typeof channel === 'string' 
                  ? channel 
                  : channel && typeof channel === 'object' && channel.gate1 && channel.gate2
                    ? `${channel.gate1}-${channel.gate2}`
                    : typeof channel === 'object' && channel.name 
                      ? channel.name
                      : JSON.stringify(channel);
                
                const channelInfo = CHANNELS[channelId];
                const tooltipContent = channelInfo 
                  ? `${channelId} • ${channelInfo.name}`
                  : `Channel ${channelId}`;
                
                return (
                  <InlineTooltip 
                    key={`channel-${index}`}
                    content={tooltipContent}
                    position="left"
                  >
                    <div 
                      className="px-2 py-1 rounded bg-purple-50/10 border border-purple-500/20 cursor-pointer hover:bg-purple-50/20 transition-colors"
                      onClick={() => handleChannelClick(channelId)}
                    >
                      <span className="font-bold text-sm text-cosmic-gold">
                        {channelId}
                      </span>
                      {channelInfo && (
                        <p className="text-xs text-purple-300 mt-1">
                          {channelInfo.theme}
                        </p>
                      )}
                    </div>
                  </InlineTooltip>
                );
              })
            ) : (
              <div className="text-center text-cosmic-silver py-2">
                <p className="text-sm">No channels formed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for detailed information */}
      <HumanDesignModal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={modalData}
      />
    </div>
  );
};

export default GatesChannelsTab;
