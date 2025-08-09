import { ChevronDownIcon } from '@radix-ui/react-icons';
import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { WesternChartData } from './types';
import { planetSymbols, aspectSymbols, getZodiacSign } from './utils';

interface Props {
  data?: WesternChartData;
}

const WesternChart: React.FC<Props> = ({ data }) => {
  if (!data || !data.planets) return <p className="text-cosmic-silver">No Western chart data available</p>;

  return (
    <div className="flex flex-col space-y-6">
      <div className="cosmic-card">
        <div className="p-6">
          <h3 className="mb-4 font-bold text-purple-300 text-md">
            Western Tropical Chart
          </h3>
          <p className="mb-6 text-sm text-cosmic-silver/90">
            Based on tropical zodiac, solar-focused approach emphasizing personality and life expression
          </p>
          
          <Accordion.Root type="single" collapsible>
            <Accordion.Item value="planets" className="rounded-lg cosmic-card border-purple-300/30">
              <Accordion.Trigger className="flex justify-between w-full p-4 transition-colors duration-300 bg-purple-500/20 hover:bg-purple-500/30 lg:p-6">
                <div className="flex space-x-2">
                  <span className="mb-0 font-bold">Planets & Positions</span>
                  <span className="px-2 py-1 text-sm text-white rounded bg-cosmic-purple">{Object.keys(data.planets).length}</span>
                </div>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left min-w-32">Planet</th>
                        <th className="px-4 py-2 text-left min-w-48">Position</th>
                        <th className="px-4 py-2 text-left min-w-24">Retrograde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(data.planets).map(([planet, info]: [string, { position: number; retrograde?: boolean }]) => (
                        <tr key={planet}>
                          <td className="px-4 py-2 border-b border-cosmic-gold/20">
                            <div className="flex space-x-2">
                              <span className="text-lg">{planetSymbols[planet as keyof typeof planetSymbols] || '●'}</span>
                              <span className="font-semibold text-white capitalize">{planet.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 font-mono border-b border-cosmic-gold/20 text-white/90">{getZodiacSign(info.position)}</td>
                          <td className="px-4 py-2 text-center border-b border-cosmic-gold/20">
                            {info.retrograde ? (
                              <span className="px-2 py-1 text-sm text-yellow-500 rounded bg-yellow-500/20">℞</span>
                            ) : (
                              <span className="text-white/60">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="aspects" className="mt-4 rounded-lg cosmic-card border-purple-300/30">
              <Accordion.Trigger className="flex justify-between w-full p-4 transition-colors duration-300 bg-purple-500/20 hover:bg-purple-500/30 lg:p-6">
                <div className="flex space-x-2">
                  <span className="mb-0 font-bold">Aspects</span>
                  <span className="px-2 py-1 text-sm rounded bg-cosmic-purple/20 text-cosmic-purple">{data.aspects?.length || 0}</span>
                </div>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left min-w-32">Aspect Type</th>
                        <th className="px-4 py-2 text-left min-w-40">Planets</th>
                        <th className="px-4 py-2 text-left min-w-24">Orb</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.aspects || []).map((aspect, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 border-b border-cosmic-gold/20">
                            <div className="flex space-x-2">
                              <span className="text-lg">{aspectSymbols[aspect.aspect as keyof typeof aspectSymbols] || '—'}</span>
                              <span className="font-semibold text-white">{aspect.aspect}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b border-cosmic-gold/20">
                            <span className="text-white">{aspect.point1} - {aspect.point2}</span>
                            <p className="text-sm text-white/80">
                              {aspect.point1_sign} (H{aspect.point1_house}) - {aspect.point2_sign} (H{aspect.point2_house})
                            </p>
                          </td>
                          <td className="px-4 py-2 border-b border-cosmic-gold/20">
                            <span className={`${aspect.exact ? 'bg-green-500 text-white' : 'bg-cosmic-purple/20 text-cosmic-purple'} px-2 py-1 rounded text-sm`}>
                              {aspect.orb.toFixed(2)}°
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </div>
      </div>
    </div>
  );
};

export default WesternChart;