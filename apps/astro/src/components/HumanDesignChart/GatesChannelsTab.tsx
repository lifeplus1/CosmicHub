import React, { useState, useMemo, useCallback } from 'react';
import type { TabProps, Gate } from './types';
import InlineTooltip from './InlineTooltip';
import HumanDesignModal, {
  type GateModalData,
  type ChannelModalData,
} from './HumanDesignModal';

// Channel data for tooltips and modals (canonical metadata)
interface ChannelMeta {
  name: string;
  circuit: string;
  theme: string;
}
const CHANNELS: Record<string, ChannelMeta> = {
  '1-8': {
    name: 'The Channel of Inspiration',
    circuit: 'Individual',
    theme: 'Creative Role Model',
  },
  '2-14': {
    name: 'The Channel of the Beat',
    circuit: 'Individual',
    theme: 'Keeper of the Keys',
  },
  '3-60': {
    name: 'The Channel of Mutation',
    circuit: 'Individual',
    theme: 'Energy for Change',
  },
  '4-63': {
    name: 'The Channel of Logic',
    circuit: 'Collective',
    theme: 'Mental Ease',
  },
  '5-15': {
    name: 'The Channel of Rhythm',
    circuit: 'Collective',
    theme: 'Being in the Flow',
  },
  '6-59': {
    name: 'The Channel of Mating',
    circuit: 'Tribal',
    theme: 'Focused on Reproduction',
  },
  '7-31': {
    name: 'The Channel of the Alpha',
    circuit: 'Collective',
    theme: 'Leadership for the Future',
  },
  '9-52': {
    name: 'The Channel of Concentration',
    circuit: 'Collective',
    theme: 'Focused Determination',
  },
  '10-20': {
    name: 'The Channel of Awakening',
    circuit: 'Individual',
    theme: 'Commitment to Higher Principles',
  },
  '10-34': {
    name: 'The Channel of Exploration',
    circuit: 'Individual',
    theme: "Following One's Convictions",
  },
  '10-57': {
    name: 'The Channel of Perfected Form',
    circuit: 'Individual',
    theme: 'Survival',
  },
  '11-56': {
    name: 'The Channel of Curiosity',
    circuit: 'Collective',
    theme: 'The Seeker',
  },
  '12-22': {
    name: 'The Channel of Openness',
    circuit: 'Individual',
    theme: 'A Social Being',
  },
  '13-33': {
    name: 'The Channel of the Prodigal',
    circuit: 'Collective',
    theme: 'A Witness',
  },
  '16-48': {
    name: 'The Channel of the Wavelength',
    circuit: 'Collective',
    theme: 'Talent',
  },
  '17-62': {
    name: 'The Channel of Acceptance',
    circuit: 'Collective',
    theme: 'An Organized Being',
  },
  '18-58': {
    name: 'The Channel of Judgment',
    circuit: 'Collective',
    theme: 'Insatiable Critic',
  },
  '19-49': {
    name: 'The Channel of Synthesis',
    circuit: 'Tribal',
    theme: 'Sensitivity',
  },
  '20-57': {
    name: 'The Channel of the Brainwave',
    circuit: 'Individual',
    theme: 'Penetrating Awareness',
  },
  '21-45': {
    name: 'The Channel of Money',
    circuit: 'Tribal',
    theme: 'A Material Way of Life',
  },
  '23-43': {
    name: 'The Channel of Structuring',
    circuit: 'Individual',
    theme: 'Genius to Freak',
  },
  '24-61': {
    name: 'The Channel of Awareness',
    circuit: 'Individual',
    theme: 'Thinker',
  },
  '25-51': {
    name: 'The Channel of Initiation',
    circuit: 'Individual',
    theme: 'Needing to be First',
  },
  '26-44': {
    name: 'The Channel of Surrender',
    circuit: 'Tribal',
    theme: 'A Transmitter',
  },
  '27-50': {
    name: 'The Channel of Preservation',
    circuit: 'Tribal',
    theme: 'Custodianship',
  },
  '28-38': {
    name: 'The Channel of Struggle',
    circuit: 'Individual',
    theme: 'Stubbornness',
  },
  '29-46': {
    name: 'The Channel of Discovery',
    circuit: 'Collective',
    theme: 'Succeeding Where Others Fail',
  },
  '30-41': {
    name: 'The Channel of Recognition',
    circuit: 'Individual',
    theme: 'A Focused Way of Life',
  },
  '32-54': {
    name: 'The Channel of Transformation',
    circuit: 'Tribal',
    theme: 'Being Driven',
  },
  '34-57': {
    name: 'The Channel of Power',
    circuit: 'Individual',
    theme: 'An Archetype',
  },
  '35-36': {
    name: 'The Channel of Transitoriness',
    circuit: 'Collective',
    theme: 'A Being of Experience',
  },
  '37-40': {
    name: 'The Channel of Community',
    circuit: 'Tribal',
    theme: 'A Part Seeking Wholeness',
  },
  '39-55': {
    name: 'The Channel of Emoting',
    circuit: 'Individual',
    theme: 'Moodiness',
  },
  '42-53': {
    name: 'The Channel of Maturation',
    circuit: 'Collective',
    theme: 'Balanced Development',
  },
  '47-64': {
    name: 'The Channel of Abstraction',
    circuit: 'Collective',
    theme: 'Mental Activity & Clarity',
  },
};

const GatesChannelsTabComponent: React.FC<TabProps> = ({ humanDesignData }) => {
  // Safe data extraction (types guarantee arrays but fallbacks defensively)
  const gates: Gate[] = useMemo(
    () => humanDesignData?.gates ?? [],
    [humanDesignData?.gates]
  );
  // Memoize channels array reference to avoid dependency churn warnings
  const channelObjs = useMemo(
    () => humanDesignData?.channels ?? [],
    [humanDesignData?.channels]
  );

  // Modal state
  const [modalData, setModalData] = useState<
    GateModalData | ChannelModalData | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Define planetary order for sorting
  const planetaryOrder = useMemo(
    () => [
      'sun',
      'earth',
      'moon',
      'north_node',
      'south_node',
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto',
    ],
    []
  );

  // Function to sort gates by planetary order
  const sortGatesByPlanetaryOrder = useCallback(
    (list: Gate[]): Gate[] => {
      // Avoid mutating original array (safer if parent reuses reference)
      return [...list].sort((a, b) => {
        const planetA = a.planet?.toLowerCase() ?? '';
        const planetB = b.planet?.toLowerCase() ?? '';
        const indexA = planetaryOrder.indexOf(planetA);
        const indexB = planetaryOrder.indexOf(planetB);
        const orderA = indexA >= 0 ? indexA : 999;
        const orderB = indexB >= 0 ? indexB : 999;
        return orderA - orderB;
      });
    },
    [planetaryOrder]
  );

  // Separate gates by type with proper data validation
  const personalityGates = useMemo<Gate[]>(
    () =>
      sortGatesByPlanetaryOrder(
        // Gate entries are typed; remove always-truthy object guard
        gates.filter(g => g.type === 'personality')
      ),
    [gates, sortGatesByPlanetaryOrder]
  );

  const designGates = useMemo<Gate[]>(
    () => sortGatesByPlanetaryOrder(gates.filter(g => g.type === 'design')),
    [gates, sortGatesByPlanetaryOrder]
  );

  // Normalize channel identifiers from channel object list
  const channelIds = useMemo<string[]>(
    () => channelObjs.map(ch => `${ch.gate1}-${ch.gate2}`),
    [channelObjs]
  );

  // Click handlers for opening modals
  const handleGateClick = useCallback((gate: Gate): void => {
    const gateData: GateModalData = {
      type: 'gate',
      number: gate.number,
      line: gate.line ?? 1,
      name: gate.name,
      center: gate.center ?? 'Unknown',
      planet: gate.planet ?? 'Unknown',
      planet_symbol: gate.planet_symbol ?? '○',
      gateType: gate.type ?? 'personality',
      position: 0, // Default value since position is not in Gate interface
    };
    setModalData(gateData);
    setIsModalOpen(true);
  }, []);

  const handleChannelClick = useCallback((channelId: string): void => {
    const channelInfo = CHANNELS[channelId];
    if (channelInfo === undefined) return; // Guarded early exit
    const gatesParsed = channelId
      .split('-')
      .map(g => Number.parseInt(g, 10))
      .filter(n => Number.isFinite(n));
    const channelData: ChannelModalData = {
      type: 'channel',
      id: channelId,
      name: channelInfo.name,
      circuit: channelInfo.circuit,
      theme: channelInfo.theme,
      gates: gatesParsed,
    };
    setModalData(channelData);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsModalOpen(false);
    setModalData(null);
  }, []);

  // Precompute enriched channel details once per channel list change
  const channelDetails = useMemo(
    () =>
      channelIds.map(id => {
        const meta = CHANNELS[id];
        const name = typeof meta?.name === 'string' ? meta.name : undefined;
        const theme =
          typeof meta?.theme === 'string' && meta.theme.trim().length > 0
            ? meta.theme
            : undefined;
        const tooltip =
          name !== undefined && name !== ''
            ? `${id} • ${name}`
            : `Channel ${id}`;
        return {
          id,
          name,
          theme,
          hasTheme: theme !== undefined,
          tooltip,
        };
      }),
    [channelIds]
  );

  return (
    <div
      className='grid grid-cols-3 gap-4 max-w-6xl mx-auto'
      role='region'
      aria-label='Human Design Gates and Channels'
    >
      {/* Personality Column */}
      <div
        className='cosmic-card'
        role='group'
        aria-labelledby='personality-heading'
      >
        <div className='p-3'>
          <h4
            id='personality-heading'
            className='text-sm font-medium text-yellow-400 mb-2 text-center'
          >
            Personality ({personalityGates.length})
          </h4>
          <div className='space-y-1' role='list'>
            {personalityGates.map(gate => (
              <InlineTooltip
                key={`personality-${gate.number}-${gate.line}-${gate.type}`}
                content={`Gate ${gate?.number ?? '?'}.${gate?.line ?? '?'} • ${gate?.name ?? 'Unknown Gate'}`}
                position='right'
              >
                <button
                  type='button'
                  className='w-full text-left px-2 py-1 rounded border-l-4 border-yellow-500 bg-yellow-50/10 flex items-center space-x-2 cursor-pointer hover:bg-yellow-50/20 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/50'
                  onClick={() => handleGateClick(gate)}
                  aria-label={`Gate ${gate?.number ?? '?'}.${gate?.line ?? '?'} - ${gate?.name ?? 'Unknown Gate'}`}
                  role='listitem'
                >
                  <span className='text-xl'>{gate?.planet_symbol ?? '○'}</span>
                  <span className='font-bold text-sm'>
                    {gate?.number ?? '?'}.{gate?.line ?? '?'}
                  </span>
                  <span className='text-sm text-yellow-300'>
                    {gate?.center ?? 'Unknown'}
                  </span>
                </button>
              </InlineTooltip>
            ))}
            {personalityGates.length === 0 && (
              <div
                className='text-center text-cosmic-silver py-2'
                role='listitem'
                aria-label='No personality gates'
              >
                <p className='text-sm'>No personality gates</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Design Column */}
      <div
        className='cosmic-card'
        role='group'
        aria-labelledby='design-heading'
      >
        <div className='p-3'>
          <h4
            id='design-heading'
            className='text-sm font-medium text-blue-400 mb-2 text-center'
          >
            Design ({designGates.length})
          </h4>
          <div className='space-y-1' role='list'>
            {designGates.map(gate => (
              <InlineTooltip
                key={`design-${gate.number}-${gate.line}-${gate.type}`}
                content={`Gate ${gate?.number ?? '?'}.${gate?.line ?? '?'} • ${gate?.name ?? 'Unknown Gate'}`}
                position='left'
              >
                <button
                  type='button'
                  className='w-full text-left px-2 py-1 rounded border-l-4 border-blue-500 bg-blue-50/10 flex items-center space-x-2 cursor-pointer hover:bg-blue-50/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/50'
                  onClick={() => handleGateClick(gate)}
                  aria-label={`Gate ${gate?.number ?? '?'}.${gate?.line ?? '?'} - ${gate?.name ?? 'Unknown Gate'}`}
                  role='listitem'
                >
                  <span className='text-xl'>{gate?.planet_symbol ?? '○'}</span>
                  <span className='font-bold text-sm'>
                    {gate?.number ?? '?'}.{gate?.line ?? '?'}
                  </span>
                  <span className='text-sm text-blue-300'>
                    {gate?.center ?? 'Unknown'}
                  </span>
                </button>
              </InlineTooltip>
            ))}
            {designGates.length === 0 && (
              <div
                className='text-center text-cosmic-silver py-2'
                role='listitem'
                aria-label='No design gates'
              >
                <p className='text-sm'>No design gates</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channels Column */}
      <div
        className='cosmic-card'
        role='group'
        aria-labelledby='channels-heading'
      >
        <div className='p-3'>
          <h4
            id='channels-heading'
            className='text-sm font-medium text-purple-400 mb-2 text-center'
          >
            Channels ({channelDetails.length})
          </h4>
          <div className='space-y-1' role='list'>
            {channelDetails.length > 0 ? (
              channelDetails.map(ch => (
                <InlineTooltip
                  key={`channel-${ch.id}`}
                  content={ch.tooltip}
                  position='left'
                >
                  <button
                    type='button'
                    className='w-full text-left px-2 py-1 rounded bg-purple-50/10 border border-purple-500/20 cursor-pointer hover:bg-purple-50/20 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400/50'
                    onClick={() => handleChannelClick(ch.id)}
                    aria-label={`Channel ${ch.id} ${ch.name ?? ''}`}
                    role='listitem'
                  >
                    <span className='font-bold text-sm text-cosmic-gold'>
                      {ch.id}
                    </span>
                    {ch.hasTheme && (
                      <p className='text-xs text-purple-300 mt-1'>{ch.theme}</p>
                    )}
                  </button>
                </InlineTooltip>
              ))
            ) : (
              <div
                className='text-center text-cosmic-silver py-2'
                role='listitem'
                aria-label='No channels formed'
              >
                <p className='text-sm'>No channels formed</p>
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

// Memoize to prevent unnecessary re-renders when parent passes stable props
export const GatesChannelsTab = React.memo(GatesChannelsTabComponent);
export default GatesChannelsTab;
