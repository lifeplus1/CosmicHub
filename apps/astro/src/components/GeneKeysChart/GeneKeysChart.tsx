import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '../ToastProvider';
import { calculateGeneKeys } from '../../services/api';
import type { ApiResult } from '../../services/apiResult';
import * as Tabs from '@radix-ui/react-tabs';
import type { GeneKeysChartProps, GeneKeysData, GeneKey } from './types';
import type { ChartBirthData } from '@cosmichub/types';
import GeneKeyDetails from './GeneKeyDetails';
import CoreQuartetTab from './CoreQuartetTab';
import ActivationSequenceTab from './ActivationSequenceTab';
import VenusSequenceTab from './VenusSequenceTab';
import PearlSequenceTab from './PearlSequenceTab';
import HologenicProfileTab from './HologenicProfileTab';

const GeneKeysChart: React.FC<GeneKeysChartProps> = React.memo(({ birthData, onCalculate }) => {
  // Holds the calculated Gene Keys profile; stays null until a valid object is received.
  // (Tests previously caused an undefined value to be set which bypassed the strict null check
  // and led to runtime errors deeper in the tree. We defensively constrain to null | GeneKeysData.)
  const [geneKeysData, setGeneKeysData] = useState<GeneKeysData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<GeneKey | null>(null);
  const { toast } = useToast();

  const handleCalculate = useCallback(async () => {
    if (birthData === null || birthData === undefined) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result: ApiResult<GeneKeysData> = await calculateGeneKeys(birthData);
      if (result.success) {
        setGeneKeysData(result.data);
      } else {
        throw new Error(result.error);
      }
      
      toast({
        title: "Gene Keys Calculated",
        description: "Your Gene Keys profile has been generated successfully!",
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate Gene Keys';
      setError(errorMessage);
      toast({
        title: "Calculation Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [birthData, toast]);

  const handleKeySelect = useCallback((key: GeneKey) => {
    setSelectedKey(key);
  }, []);

  // Memoized empty state button handler
  const handleEmptyCalculate = useCallback(() => {
    if (typeof onCalculate === 'function') {
      // Provide a deterministic sample request for quick demo
      void Promise.resolve(onCalculate({
        year: 2000,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0
      } as ChartBirthData));
    }
  }, [onCalculate]);

  useEffect(() => {
    if (birthData !== null && birthData !== undefined) {
      void handleCalculate();
    }
    // Intentional: handleCalculate depends on toast causing changing identity; rely only on birthData changes
     
  }, [birthData]);

  // Memoized loading state
  const loadingState = useMemo(() => (
    <div className="py-10 text-center">
      <div className="mx-auto text-4xl text-purple-500 animate-spin">⭐</div>
      <p className="mt-4 text-cosmic-silver">Calculating your Gene Keys profile...</p>
    </div>
  ), []);

  // Memoized error state
  const errorState = useMemo(() => (
    <div className="p-4 border border-red-500 rounded-md bg-red-900/50">
      {error}
    </div>
  ), [error]);

  // Memoized empty state
  const emptyState = useMemo(() => (
    <div className="py-10 text-center">
      <p className="mb-4 text-lg text-gray-700">
        Enter your birth information to calculate your Gene Keys profile
      </p>
  {(typeof onCalculate === 'function') && (
        <button className="cosmic-button" onClick={handleEmptyCalculate}>
          Calculate Gene Keys
        </button>
      )}
    </div>
  ), [onCalculate, handleEmptyCalculate]);

  if (loading === true) return loadingState;
  if (error !== null) return errorState;
  // Treat both null and undefined (should not happen now) as empty state
  if (geneKeysData === null) return emptyState;

  return (
    <div className="p-6">
      <Tabs.Root defaultValue="core">
                <Tabs.List className="flex flex-wrap mb-6 border-b border-cosmic-silver/30">
          <Tabs.Trigger value="core" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple hover:bg-cosmic-purple/10 transition-colors">
            🌱 Core Quartet
          </Tabs.Trigger>
          <Tabs.Trigger value="activation" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple hover:bg-cosmic-purple/10 transition-colors">
            🧠 Activation (IQ)
          </Tabs.Trigger>
          <Tabs.Trigger value="venus" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple hover:bg-cosmic-purple/10 transition-colors">
            💖 Venus (EQ)
          </Tabs.Trigger>
          <Tabs.Trigger value="pearl" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple hover:bg-cosmic-purple/10 transition-colors">
            � Pearl (SQ)
          </Tabs.Trigger>
          <Tabs.Trigger value="profile" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple hover:bg-cosmic-purple/10 transition-colors">
            🌌 Hologenetic Profile
          </Tabs.Trigger>
          {(selectedKey !== null) && (
            <Tabs.Trigger value="details" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple hover:bg-cosmic-purple/10 transition-colors">
              📖 Gene Key {selectedKey.number}
            </Tabs.Trigger>
          )}
        </Tabs.List>

        <Tabs.Content value="core" className="p-6">
          <CoreQuartetTab 
            geneKeysData={geneKeysData} 
            onKeySelect={handleKeySelect} 
          />
        </Tabs.Content>

        <Tabs.Content value="activation" className="p-6">
          <ActivationSequenceTab 
            geneKeysData={geneKeysData} 
            onKeySelect={handleKeySelect} 
          />
        </Tabs.Content>

        <Tabs.Content value="venus" className="p-6">
          <VenusSequenceTab 
            geneKeysData={geneKeysData} 
            onKeySelect={handleKeySelect} 
          />
        </Tabs.Content>

        <Tabs.Content value="pearl" className="p-6">
          <PearlSequenceTab 
            geneKeysData={geneKeysData} 
            onKeySelect={handleKeySelect} 
          />
        </Tabs.Content>

        <Tabs.Content value="profile" className="p-6">
          <HologenicProfileTab geneKeysData={geneKeysData} />
        </Tabs.Content>

        <Tabs.Content value="details" className="p-6">
          <GeneKeyDetails selectedKey={selectedKey} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
});

GeneKeysChart.displayName = 'GeneKeysChart';

export default GeneKeysChart;
