import { ChevronDownIcon } from '@radix-ui/react-icons';
import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import {
  FaChartLine,
  FaKey,
  FaDna,
  FaHeart,
  FaBrain,
  FaCompass,
} from 'react-icons/fa';

const EducationalContent: React.FC = React.memo(() => {
  return (
    <div className='max-w-6xl py-8 mx-auto'>
      <div className='flex flex-col space-y-8'>
        <div className='space-y-4 text-center'>
          <h2 className='text-3xl font-bold text-purple-600'>
            Understanding Human Design & Gene Keys
          </h2>
          <p className='max-w-2xl mx-auto text-lg text-cosmic-silver'>
            Comprehensive guides to help you understand and apply these powerful
            systems for personal transformation and authentic living.
          </p>
        </div>

        <div className='cosmic-card'>
          <div className='p-6'>
            <div className='flex items-center mb-4 space-x-3'>
              <FaChartLine className='text-2xl text-blue-500' />
              <h3 className='text-xl font-bold'>Human Design System</h3>
            </div>
            <Accordion.Root type='multiple'>
              <Accordion.Item
                value='what-is'
                className='border-b border-cosmic-silver/20'
              >
                <Accordion.Trigger className='flex justify-between w-full p-4 hover:bg-cosmic-purple/10'>
                  <h4 className='text-lg font-bold text-cosmic-silver'>
                    What is Human Design?
                  </h4>
                  <ChevronDownIcon />
                </Accordion.Trigger>
                <Accordion.Content className='p-4'>
                  <div className='flex flex-col space-y-4'>
                    <p className='text-cosmic-silver'>
                      Human Design is a synthesis of ancient wisdom and modern
                      science, combining elements from the I Ching, Astrology,
                      Kabbalah, Hindu-Brahmin chakra system, and Quantum
                      Physics. It provides a blueprint for understanding your
                      unique energy type and how to make decisions aligned with
                      your authentic self.
                    </p>
                    <p className='font-bold text-cosmic-silver'>
                      Core Components:
                    </p>
                    <ul className='pl-4 space-y-2'>
                      <li className='flex items-center'>
                        <FaDna className='mr-2 text-blue-500' />
                        <span>
                          <strong>Type:</strong> Your energy configuration
                          (Manifestor, Generator, Manifesting Generator,
                          Projector, Reflector)
                        </span>
                      </li>
                      <li className='flex items-center'>
                        <FaCompass className='mr-2 text-blue-500' />
                        <span>
                          <strong>Strategy:</strong> How you&apos;re designed to
                          engage with life
                        </span>
                      </li>
                      <li className='flex items-center'>
                        <FaHeart className='mr-2 text-blue-500' />
                        <span>
                          <strong>Authority:</strong> Your inner decision-making
                          process
                        </span>
                      </li>
                      <li className='flex items-center'>
                        <FaBrain className='mr-2 text-blue-500' />
                        <span>
                          <strong>Centers:</strong> Nine energy centers that
                          process life force
                        </span>
                      </li>
                    </ul>
                  </div>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item
                value='types'
                className='border-b border-cosmic-silver/20'
              >
                <Accordion.Trigger className='flex justify-between w-full p-4 hover:bg-cosmic-purple/10'>
                  <h4 className='text-lg font-bold text-cosmic-silver'>
                    The Five Types
                  </h4>
                  <ChevronDownIcon />
                </Accordion.Trigger>
                <Accordion.Content className='p-4'>
                  <div className='grid grid-cols-1 gap-4'>
                    <div className='p-4 border border-red-200 rounded-md bg-red-50/95'>
                      <h5 className='mb-2 font-bold text-red-600 text-md'>
                        Manifestor (9%)
                      </h5>
                      <p className='mb-2 text-sm text-gray-700'>
                        <strong>Strategy:</strong> Inform before you act
                      </p>
                      <p className='text-sm text-gray-700'>
                        Initiators who are here to make things happen. They have
                        the power to start new things and impact others through
                        their actions.
                      </p>
                    </div>
                    <div className='p-4 border border-orange-200 rounded-md bg-orange-50/95'>
                      <h5 className='mb-2 font-bold text-orange-600 text-md'>
                        Generator (37%)
                      </h5>
                      <p className='mb-2 text-sm text-gray-700'>
                        <strong>Strategy:</strong> Respond to opportunities
                      </p>
                      <p className='text-sm text-gray-700'>
                        Builders who thrive by responding to life’s
                        opportunities with sustainable energy.
                      </p>
                    </div>
                    <div className='p-4 border border-yellow-200 rounded-md bg-yellow-50/95'>
                      <h5 className='mb-2 font-bold text-yellow-600 text-md'>
                        Manifesting Generator (33%)
                      </h5>
                      <p className='mb-2 text-sm text-gray-700'>
                        <strong>Strategy:</strong> Respond, then inform
                      </p>
                      <p className='text-sm text-gray-700'>
                        Multi-talented creators who combine initiation and
                        response for dynamic impact.
                      </p>
                    </div>
                    <div className='p-4 border border-green-200 rounded-md bg-green-50/95'>
                      <h5 className='mb-2 font-bold text-green-600 text-md'>
                        Projector (20%)
                      </h5>
                      <p className='mb-2 text-sm text-gray-700'>
                        <strong>Strategy:</strong> Wait for invitation
                      </p>
                      <p className='text-sm text-gray-700'>
                        Guides who excel at directing others when invited into
                        roles of leadership.
                      </p>
                    </div>
                    <div className='p-4 border border-blue-200 rounded-md bg-blue-50/95'>
                      <h5 className='mb-2 font-bold text-blue-600 text-md'>
                        Reflector (1%)
                      </h5>
                      <p className='mb-2 text-sm text-gray-700'>
                        <strong>Strategy:</strong> Wait a lunar cycle
                      </p>
                      <p className='text-sm text-gray-700'>
                        Mirrors of the community, reflecting the health of their
                        environment over time.
                      </p>
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </div>

        <div className='cosmic-card'>
          <div className='p-6'>
            <h3 className='mb-4 text-xl font-bold text-center'>
              Integration & Synthesis
            </h3>
            <div className='flex flex-col space-y-6'>
              <p className='text-lg text-center text-cosmic-silver'>
                Human Design and Gene Keys are complementary systems that work
                beautifully together:
              </p>

              <div className='grid grid-cols-2 gap-8'>
                <div className='flex flex-col space-y-4'>
                  <h4 className='font-bold text-blue-600 text-md'>
                    Human Design Provides:
                  </h4>
                  <ul className='space-y-2'>
                    <li className='flex items-center text-sm text-cosmic-silver'>
                      <FaCompass className='mr-2 text-blue-500' />
                      Practical strategy for daily decisions
                    </li>
                    <li className='flex items-center text-sm text-cosmic-silver'>
                      <FaCompass className='mr-2 text-blue-500' />
                      Understanding of your energy mechanics
                    </li>
                    <li className='flex items-center text-sm text-cosmic-silver'>
                      <FaCompass className='mr-2 text-blue-500' />
                      Clear authority for decision-making
                    </li>
                    <li className='flex items-center text-sm text-cosmic-silver'>
                      <FaCompass className='mr-2 text-blue-500' />
                      Framework for authentic living
                    </li>
                  </ul>
                </div>

                <div className='flex flex-col space-y-4'>
                  <h4 className='font-bold text-purple-600 text-md'>
                    Gene Keys Provides:
                  </h4>
                  <ul className='space-y-2'>
                    <li className='flex items-center text-sm text-cosmic-silver'>
                      <FaKey className='mr-2 text-purple-500' />
                      Contemplative practice for transformation
                    </li>
                    <li className='flex items-center text-sm text-cosmic-silver'>
                      <FaKey className='mr-2 text-purple-500' />
                      Path from Shadow to Gift to Siddhi
                    </li>
                    <li className='flex items-center text-sm text-cosmic-silver'>
                      <FaKey className='mr-2 text-purple-500' />
                      Deep psychological insights
                    </li>
                    <li className='flex items-center text-sm text-cosmic-silver'>
                      <FaKey className='mr-2 text-purple-500' />
                      Evolutionary consciousness work
                    </li>
                  </ul>
                </div>
              </div>

              <hr className='border-cosmic-silver/30' />

              <div className='flex p-4 space-x-4 border border-blue-500 rounded-md bg-blue-900/50'>
                <span className='text-xl text-blue-500'>ℹ️</span>
                <div className='flex flex-col space-y-2'>
                  <p className='font-bold text-cosmic-silver'>
                    Recommended Approach:
                  </p>
                  <p className='text-sm text-cosmic-silver'>
                    1. Start with Human Design to understand your mechanics and
                    strategy
                    <br />
                    2. Use Gene Keys contemplation to transform unconscious
                    patterns
                    <br />
                    3. Apply both systems together for a complete path of
                    awakening
                    <br />
                    4. Remember: This is a lifelong journey of self-discovery
                    and service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

EducationalContent.displayName = 'EducationalContent';

export default EducationalContent;
