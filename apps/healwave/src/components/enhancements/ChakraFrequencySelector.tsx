import React, { useState, useCallback, useMemo } from 'react';
import { FrequencyPreset } from '@cosmichub/integrations';
import * as Tooltip from '@radix-ui/react-tooltip';
import { CHAKRA_FREQUENCIES, ChakraKey } from './chakraConstants';

interface ChakraFrequencySelectorProps {
  onChakraSelect: (preset: FrequencyPreset) => void;
  selectedChakra?: ChakraKey | null;
  className?: string;
}

/**
 * Chakra Frequency Selector Component
 * Provides intuitive chakra-based frequency selection with spiritual guidance
 */
export const ChakraFrequencySelector: React.FC<ChakraFrequencySelectorProps> = React.memo(({
  onChakraSelect,
  selectedChakra,
  className = ''
}) => {
  const [hoveredChakra, setHoveredChakra] = useState<ChakraKey | null>(null);

  const chakraKeys = useMemo(() => 
    Object.keys(CHAKRA_FREQUENCIES) as ChakraKey[], []
  );

  const createChakraPreset = useCallback((chakraKey: ChakraKey): FrequencyPreset => {
    const chakra = CHAKRA_FREQUENCIES[chakraKey];
    return {
      id: `chakra-${chakraKey}`,
      name: chakra.name,
      category: 'chakra',
      baseFrequency: chakra.frequency,
      binauralBeat: chakra.binauralBeat,
      description: `${chakra.name} healing frequency for ${chakra.benefits.join(', ')}`,
      benefits: chakra.benefits,
      metadata: {
        chakra: chakraKey,
        element: chakra.element,
        location: chakra.location,
        mantra: chakra.mantra,
        color: chakra.color,
        gemstones: chakra.gemstones,
        essential_oils: chakra.essential_oils,
      }
    };
  }, []);

  const handleChakraSelect = useCallback((chakraKey: ChakraKey) => {
    const preset = createChakraPreset(chakraKey);
    onChakraSelect(preset);
  }, [onChakraSelect, createChakraPreset]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, chakraKey: ChakraKey) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleChakraSelect(chakraKey);
    }
  }, [handleChakraSelect]);

  return (
    <div className={`chakra-frequency-selector ${className}`} role="region" aria-label="Chakra Frequency Selection">
      <h3 className="mb-4 text-lg font-semibold text-white">🌈 Chakra Healing Frequencies</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {chakraKeys.map((chakraKey) => {
          const chakra = CHAKRA_FREQUENCIES[chakraKey];
          const isSelected = selectedChakra === chakraKey;
          const isHovered = hoveredChakra === chakraKey;
          
          return (
            <Tooltip.Provider key={chakraKey}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => handleChakraSelect(chakraKey)}
                    onKeyDown={(event) => handleKeyDown(event, chakraKey)}
                    onMouseEnter={() => setHoveredChakra(chakraKey)}
                    onMouseLeave={() => setHoveredChakra(null)}
                    className={`
                      relative p-4 rounded-lg border transition-all duration-300 
                      text-left focus:outline-none focus:ring-2 focus:ring-white/50
                      hover:scale-105 hover:shadow-lg chakra-button
                      ${isSelected 
                        ? 'border-white bg-white/20 shadow-lg chakra-button-selected' 
                        : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
                      }
                      ${isHovered ? 'chakra-button-hovered' : ''}
                    `}
                    data-chakra-color={chakra.color}
                    aria-label={`Select ${chakra.name} frequency (${chakra.frequency} Hz)`}
                    aria-pressed={isSelected ? 'true' : 'false'}
                  >
                    {/* Chakra Symbol/Color Indicator */}
                    <div 
                      className="w-4 h-4 rounded-full mb-2 border border-white/30 chakra-color-indicator"
                      data-chakra-color={chakra.color}
                      aria-hidden="true"
                    />
                    
                    <div className="font-medium text-white text-sm">
                      {chakra.name}
                    </div>
                    
                    <div className="text-xs chakra-frequency-text" data-chakra-color={chakra.color}>
                      {chakra.frequency} Hz • {chakra.element}
                    </div>
                    
                    <div className="text-xs text-white/60 mt-1">
                      {chakra.location}
                    </div>
                    
                    {/* Activation indicator */}
                    {isSelected && (
                      <div 
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse chakra-activation-indicator"
                        data-chakra-color={chakra.color}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </Tooltip.Trigger>
                
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="max-w-sm p-4 bg-black/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl text-white text-sm z-50"
                    side="top"
                    align="center"
                  >
                    <div className="space-y-2">
                      <div className="font-semibold chakra-name-text" data-chakra-color={chakra.color}>
                        {chakra.name} - {chakra.frequency} Hz
                      </div>
                      
                      <div className="text-white/90">
                        <strong>Element:</strong> {chakra.element}
                      </div>
                      
                      <div className="text-white/90">
                        <strong>Mantra:</strong> {chakra.mantra}
                      </div>
                      
                      <div className="text-white/90">
                        <strong>Benefits:</strong> {chakra.benefits.slice(0, 2).join(', ')}
                      </div>
                      
                      <div className="text-white/70 text-xs">
                        Click to activate this chakra frequency
                      </div>
                    </div>
                    <Tooltip.Arrow className="fill-black/95" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          );
        })}
      </div>
      
      {/* Chakra Information Panel */}
      {selectedChakra && (
        <div className="mt-6 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
          <ChakraInfoPanel chakraKey={selectedChakra} />
        </div>
      )}
    </div>
  );
});

ChakraFrequencySelector.displayName = 'ChakraFrequencySelector';

/**
 * Detailed chakra information panel
 */
interface ChakraInfoPanelProps {
  chakraKey: ChakraKey;
}

const ChakraInfoPanel: React.FC<ChakraInfoPanelProps> = ({ chakraKey }) => {
  const chakra = CHAKRA_FREQUENCIES[chakraKey];
  
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div 
          className="w-6 h-6 rounded-full border border-white/30 chakra-info-indicator"
          data-chakra-color={chakra.color}
        />
        <h4 className="text-lg font-semibold text-white">{chakra.name}</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-white/70 font-medium mb-1">Healing Properties</div>
          <ul className="space-y-1 text-white/90">
            {chakra.benefits.map((benefit, index) => (
              <li key={index}>• {benefit}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <div className="text-white/70 font-medium mb-1">Sacred Tools</div>
          <div className="space-y-2 text-white/90">
            <div><strong>Mantra:</strong> {chakra.mantra}</div>
            <div><strong>Element:</strong> {chakra.element}</div>
            <div><strong>Gemstones:</strong> {chakra.gemstones.join(', ')}</div>
            <div><strong>Essential Oils:</strong> {chakra.essential_oils.join(', ')}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 rounded bg-white/5 border border-white/10">
        <div className="text-white/70 text-xs mb-1">Frequency Information</div>
        <div className="text-white/90 text-sm">
          <strong>Base Frequency:</strong> {chakra.frequency} Hz<br/>
          <strong>Binaural Beat:</strong> {chakra.binauralBeat} Hz<br/>
          <strong>Optimal for:</strong> {chakra.benefits.slice(0, 2).join(' and ')}
        </div>
      </div>
    </div>
  );
};

export default ChakraFrequencySelector;