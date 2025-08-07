import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { calculateGeneKeys } from '../services/api';
import * as Tabs from '@radix-ui/react-tabs';
import * as Accordion from '@radix-ui/react-accordion';
import { FaLeaf, FaGem, FaSun } from 'react-icons/fa';

interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  timezone?: string;
  lat?: number;
  lon?: number;
}

interface GeneKey {
  number: number;
  name: string;
  shadow: string;
  gift: string;
  siddhi: string;
  codon: string;
  description: string;
}

interface Sequence {
  name: string;
  description: string;
  keys: GeneKey[];
}

interface GeneKeysData {
  life_work: GeneKey;
  evolution: GeneKey;
  radiance: GeneKey;
  purpose: GeneKey;
  activation: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  iq: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  eq: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  sq: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  contemplation_sequence: string[];
  hologenetic_profile: {
    description: string;
    integration_path: string[];
  };
}

interface Props {
  birthData?: BirthData;
  onCalculate?: (data: BirthData) => void;
}

const GeneKeysChart: React.FC<Props> = ({ birthData, onCalculate }) => {
  const [geneKeysData, setGeneKeysData] = useState<GeneKeysData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<GeneKey | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCalculate = async () => {
    if (!birthData) return;

    setLoading(true);
    setError(null);

    try {
      const response = await calculateGeneKeys(birthData);
      setGeneKeysData(response.gene_keys);
      
      toast({
        title: "Gene Keys Calculated",
        description: "Your Gene Keys profile has been generated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate Gene Keys';
      setError(errorMessage);
      toast({
        title: "Calculation Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (birthData) {
      handleCalculate();
    }
  }, [birthData]);

  const renderGeneKey = (geneKey: GeneKey, title: string, description?: string) => (
    <div 
      className="transition-all duration-200 cursor-pointer cosmic-card hover:shadow-lg"
      onClick={() => setSelectedKey(geneKey)}
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

  const renderSequence = (sequence: Sequence) => (
    <div className="cosmic-card">
      <div className="p-4">
        <h3 className="mb-2 font-bold text-md">{sequence.name}</h3>
        <p className="mb-4 text-sm text-gray-700">{sequence.description}</p>
        <div className="grid grid-cols-2 gap-4">
          {sequence.keys.map((key, index) => (
            <div 
              key={index}
              className="p-3 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
              onClick={() => setSelectedKey(key)}
            >
              <p className="mb-1 text-sm font-bold">Gene Key {key.number}</p>
              <p className="text-xs">{key.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto text-4xl text-purple-500 animate-spin">⭐</div>
        <p className="mt-4 text-cosmic-silver">Calculating your Gene Keys profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-500 rounded-md bg-red-900/50">
        {error}
      </div>
    );
  }

  if (!geneKeysData) {
    return (
      <div className="py-10 text-center">
        <p className="mb-4 text-lg text-gray-700">
          Enter your birth information to calculate your Gene Keys profile
        </p>
        {onCalculate && (
          <button className="cosmic-button" onClick={() => onCalculate({} as BirthData)}>
            Calculate Gene Keys
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <Tabs.Root defaultValue="profile">
        <Tabs.List className="flex mb-6 border-b border-cosmic-silver/30">
          <Tabs.Trigger value="profile" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Hologenetic Profile</Tabs.Trigger>
          <Tabs.Trigger value="activation" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Activation Sequence</Tabs.Trigger>
          <Tabs.Trigger value="venus" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Venus Sequence</Tabs.Trigger>
          <Tabs.Trigger value="pearl" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Pearl Sequence</Tabs.Trigger>
          <Tabs.Trigger value="details" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Gene Key Details</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="profile" className="p-0">
          <div className="mb-6 cosmic-card">
            <div className="p-4">
              <h2 className="mb-4 text-lg font-bold">Your Hologenetic Profile</h2>
              <p className="mb-6 text-sm text-gray-700">{geneKeysData.hologenetic_profile.description}</p>
              
              <h3 className="mb-4 font-bold text-md">Core Spheres</h3>
              <div className="grid grid-cols-2 gap-4">
                {renderGeneKey(geneKeysData.life_work, "Life's Work", "What you're here to do")}
                {renderGeneKey(geneKeysData.evolution, "Evolution", "What you're here to learn")}
                {renderGeneKey(geneKeysData.radiance, "Radiance", "What keeps you healthy")}
                {renderGeneKey(geneKeysData.purpose, "Purpose", "What fulfills you")}
              </div>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="activation" className="p-0">
          <div className="cosmic-card">
            <div className="p-4">
              <h2 className="mb-4 text-lg font-bold">Activation Sequence</h2>
              <p className="mb-6 text-sm text-gray-700">
                The Activation Sequence focuses on grounding your core purpose through four primary Gene Keys.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {geneKeysData.activation.keys.map((key, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onClick={() => setSelectedKey(key)}
                  >
                    <p className="mb-1 text-sm font-bold">Gene Key {key.number}</p>
                    <p className="text-xs">{key.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="venus" className="p-0">
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
                    <Accordion.Icon />
                  </Accordion.Trigger>
                  <Accordion.Content className="pb-4">
                    <p className="mb-4 text-sm text-gray-700">{geneKeysData.iq.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {geneKeysData.iq.keys.map((key, index) => (
                        <div 
                          key={index}
                          className="p-3 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                          onClick={() => setSelectedKey(key)}
                        >
                          <p className="mb-1 text-sm font-bold">Gene Key {key.number}</p>
                          <p className="text-xs">{key.name}</p>
                        </div>
                      ))}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item value="1">
                  <Accordion.Trigger className="flex justify-between w-full">
                    <span className="font-bold">EQ Sphere</span>
                    <Accordion.Icon />
                  </Accordion.Trigger>
                  <Accordion.Content className="pb-4">
                    <p className="mb-4 text-sm text-gray-700">{geneKeysData.eq.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {geneKeysData.eq.keys.map((key, index) => (
                        <div 
                          key={index}
                          className="p-3 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                          onClick={() => setSelectedKey(key)}
                        >
                          <p className="mb-1 text-sm font-bold">Gene Key {key.number}</p>
                          <p className="text-xs">{key.name}</p>
                        </div>
                      ))}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item value="2">
                  <Accordion.Trigger className="flex justify-between w-full">
                    <span className="font-bold">SQ Sphere</span>
                    <Accordion.Icon />
                  </Accordion.Trigger>
                  <Accordion.Content className="pb-4">
                    <p className="mb-4 text-sm text-gray-700">{geneKeysData.sq.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {geneKeysData.sq.keys.map((key, index) => (
                        <div 
                          key={index}
                          className="p-3 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                          onClick={() => setSelectedKey(key)}
                        >
                          <p className="mb-1 text-sm font-bold">Gene Key {key.number}</p>
                          <p className="text-xs">{key.name}</p>
                        </div>
                      ))}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="pearl" className="p-0">
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
        </Tabs.Content>

        <Tabs.Content value="details" className="p-0">
          {selectedKey ? (
            <div className="cosmic-card">
              <div className="p-4">
                <h2 className="text-lg font-bold">Gene Key {selectedKey.number}: {selectedKey.name}</h2>
                <p className="text-gray-700">Codon: {selectedKey.codon}</p>
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
          ) : (
            <div className="flex p-4 space-x-4 border border-blue-500 rounded-md bg-blue-900/50">
              <span className="text-xl text-blue-500">ℹ️</span>
              <p className="text-white/80">Click on any Gene Key above to see detailed information about its Shadow, Gift, and Siddhi.</p>
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

export default GeneKeysChart;