import React from 'react';
import type { TabProps } from './types';

const GatesChannelsTab: React.FC<TabProps> = ({ humanDesignData }) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="cosmic-card">
        <div className="p-4">
          <h3 className="font-bold text-md">Active Gates</h3>
          <p className="text-sm text-gray-700">Your activated genetic traits</p>
        </div>
        <div className="p-4">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {humanDesignData.gates.map((gate, index) => (
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
