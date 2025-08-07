import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
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
          <Accordion.Root type="multiple">
            {humanDesignData.gates.slice(0, 10).map((gate, index) => (
              <Accordion.Item key={index} value={index.toString()}>
                <Accordion.Trigger className="flex justify-between w-full py-2 transition-colors hover:bg-cosmic-purple/10">
                  <span>Gate {gate.number}: {gate.name}</span>
                  <span className="text-cosmic-silver">▼</span>
                </Accordion.Trigger>
                <Accordion.Content className="pb-4">
                  <p>{gate.description || 'Gate description'}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>

      <div className="cosmic-card">
        <div className="p-4">
          <h3 className="font-bold text-md">Channels</h3>
          <p className="text-sm text-gray-700">Your defined energy pathways</p>
        </div>
        <div className="p-4">
          {humanDesignData.channels.length > 0 ? (
            <div className="flex flex-col space-y-3">
              {humanDesignData.channels.map((channel, index) => (
                <div key={index} className="p-3 rounded-md bg-purple-50">
                  <p className="font-bold">
                    Channel {channel.gate1}-{channel.gate2}
                  </p>
                  <p className="text-sm text-gray-700">
                    {channel.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700">No defined channels</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GatesChannelsTab;
