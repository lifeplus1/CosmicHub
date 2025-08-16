import React, { memo, useCallback } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { FaLeaf, FaGem, FaSun, FaChevronDown } from 'react-icons/fa';
import type { 
  GeneKey, 
  GeneKeyDisplayProps, 
  SequenceDisplayProps, 
  GeneKeyDetailsProps,
  VenusSequenceProps,
  HologenicProfileProps,
  GeneKeysData
} from './types';

// Memoized Gene Key display component
export const GeneKeyDisplay = memo<GeneKeyDisplayProps>(({ geneKey, title, description, onKeySelect }) => {
  const handleClick = useCallback(() => {
    onKeySelect(geneKey);
  }, [geneKey, onKeySelect]);

  return (
    <div 
      className="transition-all duration-200 cursor-pointer cosmic-card hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="p-4">
        <h3 className="font-bold text-purple-600 text-md">{title}</h3>
        <p className="text-sm text-gray-700">{description}</p>
      </div>
      <div className="p-4 pt-0">
        <div className="text-center">
          <span className="px-3 py-1 text-white bg-purple-500 rounded-full font-size-lg">
            Gene Key {geneKey.number}
          </span>
          <h4 className="mt-2 text-sm">{geneKey.name}</h4>
        </div>
      </div>
    </div>
  );
});

GeneKeyDisplay.displayName = 'GeneKeyDisplay';

// Memoized Sequence display component
export const SequenceDisplay = memo<SequenceDisplayProps>(({ sequence, onKeySelect }) => {
  return (
    <div className="cosmic-card">
      <div className="p-4">
        <h3 className="mb-2 font-bold text-md">{sequence.name}</h3>
        <p className="mb-4 text-sm text-gray-700">{sequence.description}</p>
        <div className="grid grid-cols-2 gap-4">
          {sequence.keys.map((key, index) => (
            <GeneKeyItem
              key={index}
              geneKey={key}
              onKeySelect={onKeySelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

SequenceDisplay.displayName = 'SequenceDisplay';

// Memoized individual Gene Key item component
const GeneKeyItem = memo<{ geneKey: GeneKey; onKeySelect: (key: GeneKey) => void }>(({ geneKey, onKeySelect }) => {
  const handleClick = useCallback(() => {
    onKeySelect(geneKey);
  }, [geneKey, onKeySelect]);

  return (
    <div 
      className="p-3 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold">Gene Key {geneKey.number}</p>
        {geneKey.line && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            Line {geneKey.line}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-700 mb-1">{geneKey.name}</p>
      {geneKey.line_theme && geneKey.sphere_context && (
        <div className="mt-2 p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded border-l-2 border-purple-300">
          <p className="text-xs font-medium text-purple-700">
            {geneKey.sphere_context} Line Theme: {geneKey.line_theme}
          </p>
        </div>
      )}
    </div>
  );
});

GeneKeyItem.displayName = 'GeneKeyItem';

// Memoized Gene Key details component
export const GeneKeyDetails = memo<GeneKeyDetailsProps>(({ selectedKey }) => {
  if (!selectedKey) {
    return (
      <div className="flex p-4 space-x-4 border border-blue-500 rounded-md bg-blue-900/50">
        <span className="text-xl text-blue-500">ℹ️</span>
        <p className="text-white/80">
          Click on any Gene Key above to see detailed information about its Shadow, Gift, and Siddhi.
        </p>
      </div>
    );
  }

  return (
    <div className="cosmic-card">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">
            Gene Key {selectedKey.number}: {selectedKey.name}
          </h2>
          {selectedKey.line && (
            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              Line {selectedKey.line}
            </span>
          )}
        </div>
        <p className="text-gray-700 mb-2">Codon: {selectedKey.codon}</p>
        {selectedKey.line_theme && selectedKey.sphere_context && (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-l-4 border-purple-400">
            <p className="text-sm font-semibold text-purple-800">
              {selectedKey.sphere_context} Sphere - Line {selectedKey.line}: {selectedKey.line_theme}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              This is your contemplative theme for the {selectedKey.sphere_context.toLowerCase()} sphere of the Golden Path.
            </p>
          </div>
        )}
      </div>
      <div className="p-4 pt-0">
        <p className="mb-6 text-lg">{selectedKey.description}</p>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 border border-red-500 rounded-md bg-red-50">
            <div className="flex items-center mb-2 space-x-2">
              <FaLeaf className="text-red-500" />
              <h3 className="font-bold text-red-600 text-md">Shadow</h3>
            </div>
            <p className="mb-2 font-bold">{selectedKey.shadow}</p>
            <p className="text-sm text-gray-700">
              The unconscious, reactive pattern that creates suffering and limitation.
            </p>
          </div>
          
          <div className="p-4 border border-green-500 rounded-md bg-green-50">
            <div className="flex items-center mb-2 space-x-2">
              <FaGem className="text-green-500" />
              <h3 className="font-bold text-green-600 text-md">Gift</h3>
            </div>
            <p className="mb-2 font-bold">{selectedKey.gift}</p>
            <p className="text-sm text-gray-700">
              The conscious, stable frequency that serves yourself and others.
            </p>
          </div>
          
          <div className="p-4 border border-yellow-500 rounded-md bg-yellow-50">
            <div className="flex items-center mb-2 space-x-2">
              <FaSun className="text-yellow-500" />
              <h3 className="font-bold text-yellow-600 text-md">Siddhi</h3>
            </div>
            <p className="mb-2 font-bold">{selectedKey.siddhi}</p>
            <p className="text-sm text-gray-700">
              The superconsious, transcendent state of pure being and service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

GeneKeyDetails.displayName = 'GeneKeyDetails';

// Memoized Venus Sequence component
export const VenusSequence = memo<VenusSequenceProps>(({ geneKeysData, onKeySelect }) => {
  return (
    <div className="cosmic-card">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-bold">Venus Sequence</h2>
        <p className="mb-6 text-sm text-gray-700">
          The Venus Sequence reveals the pathway to opening your heart through relationships.
        </p>
        
        <Accordion.Root type="single" collapsible>
          <Accordion.Item value="0">
            <Accordion.Trigger className="flex justify-between w-full">
              <span className="font-bold">IQ Sphere</span>
              <FaChevronDown className="text-cosmic-silver" />
            </Accordion.Trigger>
            <Accordion.Content className="pb-4">
              <p className="mb-4 text-sm text-gray-700">{geneKeysData.iq.description}</p>
              <div className="grid grid-cols-1 gap-4">
                <GeneKeyItem
                  geneKey={geneKeysData.iq}
                  onKeySelect={onKeySelect}
                />
              </div>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="1">
            <Accordion.Trigger className="flex justify-between w-full">
              <span className="font-bold">EQ Sphere</span>
              <FaChevronDown className="text-cosmic-silver" />
            </Accordion.Trigger>
            <Accordion.Content className="pb-4">
              <p className="mb-4 text-sm text-gray-700">{geneKeysData.eq.description}</p>
              <div className="grid grid-cols-1 gap-4">
                <GeneKeyItem
                  geneKey={geneKeysData.eq}
                  onKeySelect={onKeySelect}
                />
              </div>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="2">
            <Accordion.Trigger className="flex justify-between w-full">
              <span className="font-bold">SQ Sphere</span>
              <FaChevronDown className="text-cosmic-silver" />
            </Accordion.Trigger>
            <Accordion.Content className="pb-4">
              <p className="mb-4 text-sm text-gray-700">{geneKeysData.sq.description}</p>
              <div className="grid grid-cols-1 gap-4">
                <GeneKeyItem
                  geneKey={geneKeysData.sq}
                  onKeySelect={onKeySelect}
                />
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    </div>
  );
});

VenusSequence.displayName = 'VenusSequence';

// Memoized Hologenic Profile component
export const HologenicProfile = memo<HologenicProfileProps>(({ geneKeysData, onKeySelect }) => {
  return (
    <div className="mb-6 cosmic-card">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-bold">Your Hologenetic Profile</h2>
        <p className="mb-6 text-sm text-gray-700">
          {geneKeysData.hologenetic_profile.description}
        </p>
        
        <h3 className="mb-4 font-bold text-md">Core Spheres</h3>
        <div className="grid grid-cols-2 gap-4">
          <GeneKeyDisplay
            geneKey={geneKeysData.life_work}
            title="Life's Work"
            description="What you're here to do"
            onKeySelect={onKeySelect}
          />
          <GeneKeyDisplay
            geneKey={geneKeysData.evolution}
            title="Evolution"
            description="What you're here to learn"
            onKeySelect={onKeySelect}
          />
          <GeneKeyDisplay
            geneKey={geneKeysData.radiance}
            title="Radiance"
            description="What keeps you healthy"
            onKeySelect={onKeySelect}
          />
          <GeneKeyDisplay
            geneKey={geneKeysData.purpose}
            title="Purpose"
            description="What fulfills you"
            onKeySelect={onKeySelect}
          />
        </div>
      </div>
    </div>
  );
});

HologenicProfile.displayName = 'HologenicProfile';

// Memoized Activation Sequence component
export const ActivationSequence = memo<{ geneKeysData: GeneKeysData; onKeySelect: (key: GeneKey) => void }>(({ geneKeysData, onKeySelect }) => {
  return (
    <div className="cosmic-card">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-bold">Activation Sequence</h2>
        <p className="mb-6 text-sm text-gray-700">
          The Activation Sequence focuses on grounding your core purpose through four primary Gene Keys.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {geneKeysData.activation.keys.map((key, index) => (
            <GeneKeyItem
              key={index}
              geneKey={key}
              onKeySelect={onKeySelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

ActivationSequence.displayName = 'ActivationSequence';

// Memoized Pearl Sequence component
export const PearlSequence = memo<{ geneKeysData: GeneKeysData }>(({ geneKeysData }) => {
  return (
    <div className="cosmic-card">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-bold">Pearl Sequence</h2>
        <p className="mb-6 text-sm text-gray-700">
          The Pearl Sequence awakens your prosperity consciousness and true service.
        </p>
        
        <h3 className="mb-4 font-bold text-md">Contemplation Sequence</h3>
        <div className="flex flex-col space-y-3">
          {geneKeysData.contemplation_sequence.map((step, index) => (
            <div key={index} className="p-3 rounded-md bg-gray-50">
              <p className="text-sm font-bold">{step}</p>
            </div>
          ))}
        </div>
        
        <h3 className="mt-6 mb-4 font-bold text-md">Integration Path</h3>
        <div className="flex flex-col space-y-3">
          {geneKeysData.hologenetic_profile.integration_path.map((path, index) => (
            <div key={index} className="p-3 rounded-md bg-purple-50">
              <p className="text-sm">{path}</p>
            </div>
          ))}
        </div>
        
        <div className="flex p-4 mt-6 space-x-4 border border-green-500 rounded-md bg-green-900/50">
          <span className="text-xl text-green-500">✅</span>
          <p className="text-white/80">
            Remember: The Gene Keys are not about becoming something new, but about remembering 
            and embodying what you already are at the deepest level.
          </p>
        </div>
      </div>
    </div>
  );
});

PearlSequence.displayName = 'PearlSequence';
