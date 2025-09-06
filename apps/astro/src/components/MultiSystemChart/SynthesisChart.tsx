import { ChevronDownIcon } from '@radix-ui/react-icons';
import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import type { SynthesisChartData, IntegrationData, PathData } from './types';

interface Props {
  data: SynthesisChartData;
}

const SynthesisChart: React.FC<Props> = ({ data }) => {
  if (data === null || data === undefined) {
    return <p className='text-cosmic-silver'>No synthesis data available</p>;
  }

  return (
    <div className='flex flex-col space-y-4'>
      <div className='cosmic-card bg-gradient-to-br from-teal-900/20 to-cyan-900/20 border border-teal-500/30'>
        <div className='p-4'>
          <h3 className='mb-4 font-bold text-teal-400 text-md'>
            Integrated Analysis
          </h3>
          <p className='mb-4 text-sm text-cosmic-silver'>
            Synthesis of insights from all astrological traditions
          </p>

          <Accordion.Root type='single' collapsible>
            <Accordion.Item value='themes'>
              <Accordion.Trigger className='flex justify-between w-full'>
                <span className='font-bold'>Primary Themes</span>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className='pb-4'>
                <div className='flex flex-col space-y-2'>
                  {(data.primary_themes ?? []).map((theme, idx) => (
                    <span
                      key={idx}
                      className='p-2 border rounded-md border-teal-400/30 bg-teal-900/20 text-cosmic-silver'
                    >
                      {theme.theme}
                    </span>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value='purpose'>
              <Accordion.Trigger className='flex justify-between w-full'>
                <span className='font-bold'>Life Purpose Integration</span>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className='pb-4'>
                <div className='flex flex-col space-y-3'>
                  {(data.life_purpose ?? []).map((purpose, idx) => (
                    <div
                      key={idx}
                      className='flex p-4 space-x-4 border border-blue-500/50 rounded-md bg-blue-900/30'
                    >
                      <span className='text-xl text-blue-400'>ℹ️</span>
                      <p className='text-cosmic-silver'>{purpose}</p>
                    </div>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value='personality'>
              <Accordion.Trigger className='flex justify-between w-full'>
                <span className='font-bold'>Personality Integration</span>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className='pb-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {Object.entries(data.personality_integration ?? {}).map(
                    ([aspect, integrationData]: [string, IntegrationData]) => (
                      <div key={aspect}>
                        <p className='mb-2 font-bold capitalize text-cosmic-silver'>
                          {aspect.replace('_', ' ')}:
                        </p>
                        <div className='flex flex-col space-y-1'>
                          <div className='mb-2'>
                            <p className='text-xs font-semibold text-cosmic-silver/60'>Areas:</p>
                            {(integrationData.areas ?? []).map((area, idx) => (
                              <p
                                key={idx}
                                className='text-sm text-cosmic-silver/80'
                              >
                                • {area}
                              </p>
                            ))}
                          </div>
                          {integrationData.challenges && integrationData.challenges.length > 0 && (
                            <div className='mb-2'>
                              <p className='text-xs font-semibold text-cosmic-silver/60'>Challenges:</p>
                              {integrationData.challenges.map((challenge, idx) => (
                                <p
                                  key={idx}
                                  className='text-sm text-orange-300/80'
                                >
                                  • {challenge}
                                </p>
                              ))}
                            </div>
                          )}
                          {integrationData.recommendations && integrationData.recommendations.length > 0 && (
                            <div>
                              <p className='text-xs font-semibold text-cosmic-silver/60'>Recommendations:</p>
                              {integrationData.recommendations.map((recommendation, idx) => (
                                <p
                                  key={idx}
                                  className='text-sm text-green-300/80'
                                >
                                  • {recommendation}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value='path'>
              <Accordion.Trigger className='flex justify-between w-full'>
                <span className='font-bold'>Spiritual Path</span>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className='pb-4'>
                <div className='flex flex-col space-y-3'>
                  {(data.spiritual_path ?? []).map((pathData: PathData, idx: number) => (
                    <div
                      key={idx}
                      className='flex p-4 space-x-4 border border-green-500/50 rounded-md bg-green-900/30'
                    >
                      <span className='text-xl text-green-400'>✅</span>
                      <div className='flex flex-col space-y-2'>
                        <p className='font-semibold text-cosmic-silver'>{pathData.path}</p>
                        <p className='text-sm text-cosmic-silver/80'>Stage: {pathData.stage}</p>
                        {pathData.indicators && pathData.indicators.length > 0 && (
                          <div>
                            <p className='text-xs font-semibold text-cosmic-silver/60'>Indicators:</p>
                            {pathData.indicators.map((indicator: string, indicatorIdx: number) => (
                              <p key={indicatorIdx} className='text-sm text-cosmic-silver/70'>• {indicator}</p>
                            ))}
                          </div>
                        )}
                        {pathData.practices && pathData.practices.length > 0 && (
                          <div>
                            <p className='text-xs font-semibold text-cosmic-silver/60'>Practices:</p>
                            {pathData.practices.map((practice: string, practiceIdx: number) => (
                              <p key={practiceIdx} className='text-sm text-green-300/80'>• {practice}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </div>
      </div>
    </div>
  );
};

export default SynthesisChart;
