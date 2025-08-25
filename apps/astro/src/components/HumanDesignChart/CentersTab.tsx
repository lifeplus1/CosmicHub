import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { TabProps } from './types';
import { getCenterDescription } from './utils';

const CentersTab: React.FC<TabProps> = ({ humanDesignData }) => {
  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <div className='cosmic-card'>
        <div className='p-4'>
          <h3 className='flex items-center mb-4 text-lg font-bold text-green-400'>
            ✨ Defined Centers
            <span className='ml-2 text-sm text-cosmic-silver'>
              (Consistent energy)
            </span>
          </h3>
          <p className='mb-4 text-sm text-cosmic-silver'>
            These centers are reliably accessible to you and represent
            consistent themes in your life.
          </p>
          <div className='space-y-2'>
            {humanDesignData.defined_centers.map((center, index) => (
              <Tooltip.Provider key={index}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className='p-3 transition-colors border rounded-lg bg-green-400/20 border-green-400/30 cursor-help hover:bg-green-400/30'>
                      <div className='flex items-center space-x-2'>
                        <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                        <span className='font-medium text-green-300'>
                          {center}
                        </span>
                      </div>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className='z-50 max-w-xs p-3 text-sm border rounded-lg shadow-lg cosmic-card text-cosmic-silver border-cosmic-gold/30'
                      sideOffset={5}
                    >
                      <div className='space-y-2'>
                        <div className='font-bold text-green-400'>
                          {center} (Defined)
                        </div>
                        <div>{getCenterDescription(center)}</div>
                        <div className='text-xs opacity-75 text-cosmic-silver'>
                          This center operates consistently in your design.
                        </div>
                      </div>
                      <Tooltip.Arrow className='fill-cosmic-dark' />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            ))}
          </div>
        </div>
      </div>

      <div className='cosmic-card'>
        <div className='p-4'>
          <h3 className='flex items-center mb-4 text-lg font-bold text-blue-400'>
            🌊 Undefined Centers
            <span className='ml-2 text-sm text-cosmic-silver'>
              (Wisdom potential)
            </span>
          </h3>
          <p className='mb-4 text-sm text-cosmic-silver'>
            These centers are where you take in and amplify energy from others,
            becoming wise about these themes.
          </p>
          <div className='space-y-2'>
            {humanDesignData.undefined_centers.map((center, index) => (
              <Tooltip.Provider key={index}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className='p-3 transition-colors border rounded-lg bg-blue-400/20 border-blue-400/30 cursor-help hover:bg-blue-400/30'>
                      <div className='flex items-center space-x-2'>
                        <div className='w-3 h-3 border-2 border-blue-400 rounded-full'></div>
                        <span className='font-medium text-blue-300'>
                          {center}
                        </span>
                      </div>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className='z-50 max-w-xs p-3 text-sm border rounded-lg shadow-lg cosmic-card text-cosmic-silver border-cosmic-gold/30'
                      sideOffset={5}
                    >
                      <div className='space-y-2'>
                        <div className='font-bold text-blue-400'>
                          {center} (Undefined)
                        </div>
                        <div>{getCenterDescription(center)}</div>
                        <div className='text-xs opacity-75 text-cosmic-silver'>
                          This center is where you take in and amplify energy,
                          developing wisdom.
                        </div>
                      </div>
                      <Tooltip.Arrow className='fill-cosmic-dark' />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentersTab;
