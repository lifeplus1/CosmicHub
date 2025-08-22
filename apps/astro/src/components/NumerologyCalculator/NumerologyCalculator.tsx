import { ChevronDownIcon } from '@radix-ui/react-icons';
import React, { useState } from 'react';
import { useToast } from '../ToastProvider';
import * as Tabs from '@radix-ui/react-tabs';
import * as Accordion from '@radix-ui/react-accordion';
import { apiConfig } from '../../config/environment';

interface NumerologyData {
  name: string;
  year: number;
  month: number;
  day: number;
}

interface CoreNumbers {
  life_path: {
    number: number;
    meaning: string;
    components?: { month: number; day: number; year: number };
  };
  destiny: {
    number: number;
    meaning: string;
  };
  soul_urge: {
    number: number;
    meaning: string;
  };
  personality: {
    number: number;
    meaning: string;
  };
  birth_day: {
    number: number;
    meaning: string;
  };
  attitude: {
    number: number;
    meaning: string;
  };
  power_name: {
    number: number;
    meaning: string;
  };
}

interface NumerologyResult {
  core_numbers: CoreNumbers;
  karmic_numbers: {
    karmic_debts: number[];
    karmic_lessons: number[];
    debt_meanings: string[];
    lesson_meanings: string[];
  };
  personal_year: {
    number: number;
    year: number;
    meaning: string;
  };
  challenge_numbers: {
    first_challenge: { number: number; period: string };
    second_challenge: { number: number; period: string };
    third_challenge: { number: number; period: string };
    fourth_challenge: { number: number; period: string };
    meanings: {
      first: string;
      second: string;
      third: string;
      fourth: string;
    };
  };
  pinnacle_numbers: {
    first_pinnacle: { number: number; period: string };
    second_pinnacle: { number: number; period: string };
    third_pinnacle: { number: number; period: string };
    fourth_pinnacle: { number: number; period: string };
    meanings: {
      first: string;
      second: string;
      third: string;
      fourth: string;
    };
  };
  systems: {
    pythagorean: {
      system: string;
      letter_values: Record<string, string[]>;
      total_value: number;
      characteristics: string[];
    };
    chaldean: {
      system: string;
      letter_values: Record<string, string[]>;
      total_value: number;
      chaldean_number: number;
      meaning: string;
    };
  };
  interpretation: {
    life_purpose: string;
    personality_overview: string;
    current_focus: string;
    spiritual_path: string;
  };
}

const NumerologyCalculator: React.FC = () => {
  const [formData, setFormData] = useState<NumerologyData>({
    name: '',
    year: new Date().getFullYear() - 30,
    month: 1,
    day: 1
  });
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your full name',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const birthDate = `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(formData.day).padStart(2, '0')}`;
      
  const response = await fetch(`${apiConfig.baseUrl}/calculate-numerology`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          birth_date: birthDate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate numerology');
      }

      interface ApiResponse {
        numerology: NumerologyResult;
      }
      
      const data = await response.json() as ApiResponse;
      setResult(data.numerology);

      toast({
        title: 'Numerology Calculated',
        description: 'Your numerology chart is ready!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Calculation Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'name' ? value : parseInt(value) }));
  };

  const renderCoreNumber = (title: string, number: number, meaning: string, components?: { month: number; day: number; year: number }): React.ReactNode => (
    <div className="cosmic-card">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-md">{title}</h3>
          <span className="px-3 py-1 text-lg text-white rounded-full bg-cosmic-purple">{number}</span>
        </div>
        <p className="text-cosmic-silver">{meaning}</p>
        {components && (
          <p className="mt-2 text-sm text-cosmic-silver/80">
            Calculation: {components.month} + {components.day} + {components.year} = {number}
          </p>
        )}
      </div>
    </div>
  );

  const SystemsDisplay = ({ systems }: { systems: NumerologyResult['systems'] }): React.ReactNode => (
    <div className="flex flex-col space-y-6">
      <div className="cosmic-card">
        <div className="p-4">
          <h3 className="mb-4 text-lg font-bold">Pythagorean System</h3>
          <p className="mb-4 text-cosmic-silver">{systems.pythagorean.system}</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Object.entries(systems.pythagorean.letter_values).map(([letter, values]) => (
              <div key={letter} className="p-2 text-center rounded-md bg-gray-50">
                <p className="font-bold">{letter}</p>
                <p className="text-sm">{values.join(', ')}</p>
              </div>
            ))}
          </div>
          <p className="mb-2 text-cosmic-silver">Total Value: {systems.pythagorean.total_value}</p>
          <div className="flex flex-col space-y-2">
            {systems.pythagorean.characteristics.map((char, index) => (
              <p key={index} className="text-cosmic-silver">{char}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="cosmic-card">
        <div className="p-4">
          <h3 className="mb-4 text-lg font-bold">Chaldean System</h3>
          <p className="mb-4 text-cosmic-silver">{systems.chaldean.system}</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Object.entries(systems.chaldean.letter_values).map(([letter, values]) => (
              <div key={letter} className="p-2 text-center rounded-md bg-gray-50">
                <p className="font-bold">{letter}</p>
                <p className="text-sm">{values.join(', ')}</p>
              </div>
            ))}
          </div>
          <p className="mb-2 text-cosmic-silver">Total Value: {systems.chaldean.total_value}</p>
          <p className="mb-2 text-cosmic-silver">Chaldean Number: {systems.chaldean.chaldean_number}</p>
          <p className="text-cosmic-silver">{systems.chaldean.meaning}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto text-4xl text-purple-500 animate-spin">⭐</div>
        <p className="mt-4 text-cosmic-silver">Calculating your numerology chart...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(e); }}>
        <div className="flex flex-col space-y-4">
          <div>
            <label htmlFor="name" className="block mb-2 text-cosmic-gold">Full Name</label>
            <input
              id="name"
              className="cosmic-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="year" className="block mb-2 text-cosmic-gold">Year</label>
              <input
                id="year"
                className="cosmic-input"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                placeholder="Year"
              />
            </div>
            <div>
              <label htmlFor="month" className="block mb-2 text-cosmic-gold">Month</label>
              <input
                id="month"
                className="cosmic-input"
                name="month"
                type="number"
                min="1"
                max="12"
                value={formData.month}
                onChange={handleChange}
                placeholder="Month"
              />
            </div>
            <div>
              <label htmlFor="day" className="block mb-2 text-cosmic-gold">Day</label>
              <input
                id="day"
                className="cosmic-input"
                name="day"
                type="number"
                min="1"
                max="31"
                value={formData.day}
                onChange={handleChange}
                placeholder="Day"
              />
            </div>
          </div>
          <button className="cosmic-button" type="submit" onClick={(e) => { e.preventDefault(); void handleSubmit(e); }}>
            Calculate Numerology
          </button>
        </div>
      </form>

      {result && (
        <Tabs.Root>
          <Tabs.List className="flex border-b border-cosmic-silver/30">
            <Tabs.Trigger value="core" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Core Numbers</Tabs.Trigger>
            <Tabs.Trigger value="cycles" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Cycles & Challenges</Tabs.Trigger>
            <Tabs.Trigger value="karmic" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Karmic Numbers</Tabs.Trigger>
            <Tabs.Trigger value="systems" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Systems Comparison</Tabs.Trigger>
            <Tabs.Trigger value="interpretation" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Interpretation</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="core" className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {renderCoreNumber("Life Path", result.core_numbers.life_path.number, result.core_numbers.life_path.meaning, result.core_numbers.life_path.components)}
              {renderCoreNumber("Destiny", result.core_numbers.destiny.number, result.core_numbers.destiny.meaning)}
              {renderCoreNumber("Soul Urge", result.core_numbers.soul_urge.number, result.core_numbers.soul_urge.meaning)}
              {renderCoreNumber("Personality", result.core_numbers.personality.number, result.core_numbers.personality.meaning)}
              {renderCoreNumber("Birth Day", result.core_numbers.birth_day.number, result.core_numbers.birth_day.meaning)}
              {renderCoreNumber("Attitude", result.core_numbers.attitude.number, result.core_numbers.attitude.meaning)}
              {renderCoreNumber("Power Name", result.core_numbers.power_name.number, result.core_numbers.power_name.meaning)}
            </div>
          </Tabs.Content>

          <Tabs.Content value="cycles" className="p-4">
            <div className="flex flex-col space-y-6">
              <Accordion.Root type="single" collapsible>
                <Accordion.Item value="challenges">
                  <Accordion.Trigger className="flex justify-between w-full">
                    <span className="font-bold">Challenge Numbers</span>
                    <ChevronDownIcon />
                  </Accordion.Trigger>
                  <Accordion.Content className="pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-md bg-gray-50">
                        <p className="mb-1 font-bold">First Challenge ({result.challenge_numbers.first_challenge.period})</p>
                        <span className="px-2 py-1 mr-2 text-sm text-white bg-blue-500 rounded">{result.challenge_numbers.first_challenge.number}</span>
                        <p className="mt-2 text-sm">{result.challenge_numbers.meanings.first}</p>
                      </div>
                      <div className="p-4 rounded-md bg-gray-50">
                        <p className="mb-1 font-bold">Second Challenge ({result.challenge_numbers.second_challenge.period})</p>
                        <span className="px-2 py-1 mr-2 text-sm text-white bg-blue-500 rounded">{result.challenge_numbers.second_challenge.number}</span>
                        <p className="mt-2 text-sm">{result.challenge_numbers.meanings.second}</p>
                      </div>
                      <div className="p-4 rounded-md bg-gray-50">
                        <p className="mb-1 font-bold">Third Challenge ({result.challenge_numbers.third_challenge.period})</p>
                        <span className="px-2 py-1 mr-2 text-sm text-white bg-blue-500 rounded">{result.challenge_numbers.third_challenge.number}</span>
                        <p className="mt-2 text-sm">{result.challenge_numbers.meanings.third}</p>
                      </div>
                      <div className="p-4 rounded-md bg-gray-50">
                        <p className="mb-1 font-bold">Fourth Challenge ({result.challenge_numbers.fourth_challenge.period})</p>
                        <span className="px-2 py-1 mr-2 text-sm text-white bg-blue-500 rounded">{result.challenge_numbers.fourth_challenge.number}</span>
                        <p className="mt-2 text-sm">{result.challenge_numbers.meanings.fourth}</p>
                      </div>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item value="pinnacles">
                  <Accordion.Trigger className="flex justify-between w-full">
                    <span className="font-bold">Pinnacle Numbers</span>
                    <ChevronDownIcon />
                  </Accordion.Trigger>
                  <Accordion.Content className="pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-md bg-gray-50">
                        <p className="mb-1 font-bold">First Pinnacle ({result.pinnacle_numbers.first_pinnacle.period})</p>
                        <span className="px-2 py-1 mr-2 text-sm text-white bg-green-500 rounded">{result.pinnacle_numbers.first_pinnacle.number}</span>
                        <p className="mt-2 text-sm">{result.pinnacle_numbers.meanings.first}</p>
                      </div>
                      <div className="p-4 rounded-md bg-gray-50">
                        <p className="mb-1 font-bold">Second Pinnacle ({result.pinnacle_numbers.second_pinnacle.period})</p>
                        <span className="px-2 py-1 mr-2 text-sm text-white bg-green-500 rounded">{result.pinnacle_numbers.second_pinnacle.number}</span>
                        <p className="mt-2 text-sm">{result.pinnacle_numbers.meanings.second}</p>
                      </div>
                      <div className="p-4 rounded-md bg-gray-50">
                        <p className="mb-1 font-bold">Third Pinnacle ({result.pinnacle_numbers.third_pinnacle.period})</p>
                        <span className="px-2 py-1 mr-2 text-sm text-white bg-green-500 rounded">{result.pinnacle_numbers.third_pinnacle.number}</span>
                        <p className="mt-2 text-sm">{result.pinnacle_numbers.meanings.third}</p>
                      </div>
                      <div className="p-4 rounded-md bg-gray-50">
                        <p className="mb-1 font-bold">Fourth Pinnacle ({result.pinnacle_numbers.fourth_pinnacle.period})</p>
                        <span className="px-2 py-1 mr-2 text-sm text-white bg-green-500 rounded">{result.pinnacle_numbers.fourth_pinnacle.number}</span>
                        <p className="mt-2 text-sm">{result.pinnacle_numbers.meanings.fourth}</p>
                      </div>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>

              <div className="cosmic-card">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-md">Personal Year {result.personal_year.year}</h3>
                    <span className="px-4 py-2 text-xl text-white bg-orange-500 rounded-full">{result.personal_year.number}</span>
                  </div>
                  <p className="mt-4 text-cosmic-silver">{result.personal_year.meaning}</p>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="karmic" className="p-4">
            <div className="flex flex-col space-y-6">
              {result.karmic_numbers.karmic_debts.length > 0 && (
                <div className="p-4 border border-yellow-500 rounded-md bg-yellow-900/50">
                  <div className="flex mb-2 space-x-4">
                    <span className="text-xl text-yellow-500">⚠️</span>
                    <div>
                      <h4 className="font-bold text-white">Karmic Debts</h4>
                      <p className="text-white/80">Numbers: {result.karmic_numbers.karmic_debts.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    {result.karmic_numbers.debt_meanings.map((meaning, index) => (
                      <p key={index} className="text-sm text-white/80">• {meaning}</p>
                    ))}
                  </div>
                </div>
              )}

              {result.karmic_numbers.karmic_lessons.length > 0 && (
                <div className="p-4 border border-blue-500 rounded-md bg-blue-900/50">
                  <div className="flex mb-2 space-x-4">
                    <span className="text-xl text-blue-500">ℹ️</span>
                    <div>
                      <h4 className="font-bold text-white">Karmic Lessons</h4>
                      <p className="text-white/80">Missing Numbers: {result.karmic_numbers.karmic_lessons.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    {result.karmic_numbers.lesson_meanings.map((meaning, index) => (
                      <p key={index} className="text-sm text-white/80">• {meaning}</p>
                    ))}
                  </div>
                </div>
              )}

              {result.karmic_numbers.karmic_debts.length === 0 && result.karmic_numbers.karmic_lessons.length === 0 && (
                <div className="p-4 border border-green-500 rounded-md bg-green-900/50">
                  <div className="flex space-x-4">
                    <span className="text-xl text-green-500">✅</span>
                    <div>
                      <h4 className="font-bold text-white">Clear Karmic Path</h4>
                      <p className="text-white/80">You have no significant karmic debts or lessons indicated in your numerology chart.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Tabs.Content>

          <Tabs.Content value="systems" className="p-4">
            <SystemsDisplay systems={result.systems} />
          </Tabs.Content>

          <Tabs.Content value="interpretation" className="p-4">
            <div className="flex flex-col space-y-6">
              {Object.entries(result.interpretation).map(([key, value]) => (
                <div key={key} className="border-l-4 border-purple-500 cosmic-card">
                  <div className="p-4">
                    <div className="flex flex-col space-y-2">
                      <h3 className="font-bold text-purple-600 capitalize text-md">{key.replace('_', ' ')}</h3>
                      <p className="text-cosmic-silver">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Tabs.Content>
        </Tabs.Root>
      )}
    </div>
  );
};

export default NumerologyCalculator;