import React, { useState } from 'react';
import type { TabProps } from './types';

const GatesChannelsTab: React.FC<TabProps> = ({ humanDesignData }) => {
  const [gatesView, setGatesView] = useState<'all' | 'personality' | 'design'>('all');

  // Filter gates based on selected view
  const filteredGates = humanDesignData.gates.filter(gate => {
    if (gatesView === 'all') return true;
    return gate.type === gatesView;
  });

  // Count gates by type for display
  const personalityGates = humanDesignData.gates.filter(gate => gate.type === 'personality');
  const designGates = humanDesignData.gates.filter(gate => gate.type === 'design');

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="cosmic-card">
        <div className="p-4">
          <h3 className="font-bold text-md">Active Gates</h3>
          <p className="text-sm text-gray-700">Your activated genetic traits</p>
          
          {/* Gates View Toggle */}
          <div className="mt-4 flex space-x-1 bg-cosmic-dark/30 rounded-lg p-1">
            <button
              onClick={() => setGatesView('all')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                gatesView === 'all' 
                  ? 'bg-cosmic-gold text-cosmic-dark' 
                  : 'text-cosmic-silver hover:text-cosmic-gold'
              }`}
            >
              All ({humanDesignData.gates.length})
            </button>
            <button
              onClick={() => setGatesView('personality')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                gatesView === 'personality' 
                  ? 'bg-yellow-500 text-cosmic-dark' 
                  : 'text-cosmic-silver hover:text-yellow-400'
              }`}
            >
              Personality ({personalityGates.length})
            </button>
            <button
              onClick={() => setGatesView('design')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                gatesView === 'design' 
                  ? 'bg-blue-500 text-cosmic-dark' 
                  : 'text-cosmic-silver hover:text-blue-400'
              }`}
            >
              Design ({designGates.length})
            </button>
          </div>
        </div>
        <div className="p-4">
          {/* Gates Description based on selected view */}
          {gatesView === 'personality' && (
            <div className="mb-4 p-3 bg-yellow-500/10 border-l-4 border-yellow-500 rounded">
              <p className="text-sm text-yellow-200">
                <strong>Personality Gates:</strong> Conscious activations representing your aware mind and how you think about yourself. These are calculated from your birth time.
              </p>
            </div>
          )}
          {gatesView === 'design' && (
            <div className="mb-4 p-3 bg-blue-500/10 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-blue-200">
                <strong>Design Gates:</strong> Unconscious activations representing your body consciousness and how others see you. These are calculated from 88 days before birth.
              </p>
            </div>
          )}
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredGates.map((gate, index) => (
              <div key={index} className={`p-3 rounded-md border-l-4 ${gate.type === 'personality' ? 'border-yellow-500 bg-yellow-50/10' : 'border-blue-500 bg-blue-50/10'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{gate.planet_symbol}</span>
                    <span className="font-bold">Gate {gate.number}.{gate.line}</span>
                    <span className="text-sm text-cosmic-silver">({gate.center})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${gate.type === 'personality' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-blue-500/20 text-blue-300'}`}>
                      {gate.type}
                    </span>
                    <span className="text-xs text-cosmic-silver">{gate.planet}</span>
                  </div>
                </div>
                <div className="mt-1">
                  <span className="text-sm font-medium">{gate.name}</span>
                </div>
              </div>
            ))}
          </div>
          
          {filteredGates.length === 0 && (
            <p className="text-cosmic-silver text-center py-4">
              No {gatesView} gates found
            </p>
          )}
        </div>
      </div>

      <div className="cosmic-card">
        <div className="p-4">
          <h3 className="font-bold text-md">Channels</h3>
          <p className="text-sm text-gray-700">Your defined energy pathways</p>
        </div>
        <div className="p-4">
          {humanDesignData.channels && humanDesignData.channels.length > 0 ? (
            <div className="flex flex-col space-y-3">
              {humanDesignData.channels.map((channel, index) => (
                <div key={index} className="p-3 rounded-md bg-purple-50/10 border border-purple-500/20">
                  <p className="font-bold text-cosmic-gold">
                    Channel {typeof channel === 'string' ? channel : `${channel.gate1}-${channel.gate2}`}
                  </p>
                  {typeof channel !== 'string' && channel.name && (
                    <p className="text-sm text-cosmic-silver">
                      {channel.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-cosmic-silver">No defined channels detected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GatesChannelsTab;
