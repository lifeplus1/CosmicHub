import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { UranianChartData } from './types';

interface Props {
  data: UranianChartData;
}

const UranianChart: React.FC<Props> = ({ data }) => {
  if (!data) return <p className="text-cosmic-silver">No Uranian astrology data available</p>;

  return (
    <div className="flex flex-col space-y-4">
      <div className="cosmic-card bg-indigo-50/95">
        <div className="p-4 text-gray-800">
          <h3 className="mb-4 font-bold text-indigo-700 text-md">Uranian Astrology</h3>
          <p className="mb-4 text-sm font-medium text-gray-700">
            {data.description}
          </p>

          <Accordion.Root type="single" collapsible>
            <Accordion.Item value="0">
              <Accordion.Trigger className="flex justify-between w-full">
                <span className="font-bold">Transneptunian Points</span>
                <Accordion.Icon />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr>
                      <th className="py-2 text-left">Planet</th>
                      <th className="py-2 text-left">Position</th>
                      <th className="py-2 text-left">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.uranian_planets || {}).map(([planet, info]: [string, { symbol?: string; position?: number; meaning?: string }]) => (
                      <tr key={planet}>
                        <td className="py-2">
                          <div className="flex">
                            <span>{info.symbol}</span>
                            <span className="ml-2 font-medium">{planet.charAt(0).toUpperCase() + planet.slice(1)}</span>
                          </div>
                        </td>
                        <td className="py-2 font-mono">{info.position?.toFixed(2)}°</td>
                        <td className="py-2 text-xs">{info.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="1">
              <Accordion.Trigger className="flex justify-between w-full">
                <span className="font-bold">90° Dial Aspects</span>
                <Accordion.Icon />
              </Accordion.Trigger>
              <Accordion.Content className="pb-4">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr>
                      <th className="py-2 text-left">Bodies</th>
                      <th className="py-2 text-left">Aspect</th>
                      <th className="py-2 text-left">Orb</th>
                      <th className="py-2 text-left">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.dial_aspects || []).slice(0, 8).map((aspect, idx) => (
                      <tr key={idx}>
                        <td className="py-2 text-sm">{aspect.body1} - {aspect.body2}</td>
                        <td className="py-2">{aspect.angle}°</td>
                        <td className="py-2">{aspect.orb?.toFixed(2)}°</td>
                        <td className="py-2 text-xs">{aspect.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </div>
      </div>
    </div>
  );
};

export default UranianChart;