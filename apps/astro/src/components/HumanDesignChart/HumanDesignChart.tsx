import React, { useState, useEffect, Suspense, useCallback } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useToast } from '../ToastProvider';
// Removed unused imports (axios, icons, memo hooks) for lint compliance
import { calculateHumanDesign } from '../../services/api';
import type { ApiResult } from '../../services/apiResult';
import type { HumanDesignData, HumanDesignChartProps } from './types';
import type { ChartBirthData } from '@cosmichub/types';
import { getTypeColor, getTypeDescription } from './utils';

// Lazy load tab components for better performance
const CentersTab = React.lazy(() => import('./CentersTab'));
const ProfileTab = React.lazy(() => import('./ProfileTab'));
const IncarnationCrossTab = React.lazy(() => import('./IncarnationCrossTab'));
const GatesChannelsTab = React.lazy(() => import('./GatesChannelsTab'));
const VariablesTab = React.lazy(() => import('./VariablesTab'));

// Loading fallback component
const TabLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-2xl text-purple-500 animate-spin">⭐</div>
  </div>
);

const HumanDesignChart: React.FC<HumanDesignChartProps> = ({ birthData, onCalculate, onHumanDesignCalculated }) => {
  const [humanDesignData, setHumanDesignData] = useState<HumanDesignData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Note: user context not required in this component currently (removed to satisfy no-unused-vars)
  const { toast } = useToast();

  const handleCalculate = useCallback(async (): Promise<void> => {
    if (birthData === null || birthData === undefined) return;

    setLoading(true);
    setError(null);

    try {
      const result: ApiResult<{ human_design: HumanDesignData }> = await calculateHumanDesign(birthData);
      if (result.success) {
        setHumanDesignData(result.data.human_design);
        if (onHumanDesignCalculated) {
          onHumanDesignCalculated(result.data.human_design);
        }
        toast({
          title: "Human Design Calculated",
          description: "Your Human Design chart has been generated successfully!",
          status: "success",
          duration: 3000,
        });
      } else {
        setError(result.error);
        toast({
          title: "Calculation Error",
          description: result.error,
          status: "error",
          duration: 5000,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate Human Design';
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
  }, [birthData, onHumanDesignCalculated, toast]);

  useEffect(() => {
    if (birthData !== null && birthData !== undefined) {
      void handleCalculate();
    }
  }, [birthData, handleCalculate]);

  if (loading) {
    return (
      <div className="p-8 cosmic-card">
        <div className="space-y-4 text-center">
          <div className="mx-auto text-4xl text-purple-500 animate-spin">⭐</div>
          <p className="text-lg font-medium text-cosmic-silver">Calculating your Human Design chart...</p>
        </div>
      </div>
    );
  }

  if (error !== null) {
    return (
      <div className="p-6 cosmic-card">
        <div className="flex p-4 space-x-4 border border-red-500 rounded-md bg-red-900/50">
          <span className="text-xl text-red-500">⚠️</span>
          <div>
            <h3 className="font-bold text-white">Calculation Error</h3>
            <p className="text-white/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (humanDesignData === null) {
    return (
      <div className="p-8 cosmic-card">
        <div className="space-y-4 text-center">
          <div className="mb-4 text-4xl">🔮</div>
          <h3 className="text-xl font-bold text-cosmic-gold">Human Design Chart</h3>
          <p className="text-cosmic-silver">
            Enter your birth information to calculate your Human Design chart
          </p>
          {onCalculate && (
            <button 
              className="mt-4 cosmic-button" 
              onClick={() => onCalculate({
                year: 2000,
                month: 1,
                day: 1,
                hour: 0,
                minute: 0
              } as ChartBirthData)}
            >
              🧬 Calculate Human Design
            </button>
          )}
        </div>
      </div>
    );
  }

  // Normalize potentially nullable string fields
  const typeValue: string = typeof humanDesignData.type === 'string' && humanDesignData.type.trim().length > 0
    ? humanDesignData.type
    : 'Unknown Type';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Type and Strategy */}
      <div className="cosmic-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col space-y-3">
              <h2 className="text-2xl font-bold text-cosmic-gold">🧬 Your Human Design</h2>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <span
                      className={`${getTypeColor(typeValue)} text-white font-bold text-lg px-4 py-2 rounded-full cursor-help inline-block`}
                    >
                      {typeValue}
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="z-50 max-w-xs p-3 text-sm border rounded-lg shadow-lg cosmic-card text-cosmic-silver border-cosmic-gold/30"
                      sideOffset={5}
                    >
                      <div className="space-y-2">
                        <div className="font-bold text-cosmic-gold">{typeValue}</div>
                        <div>{getTypeDescription(typeValue)}</div>
                      </div>
                      <Tooltip.Arrow className="fill-cosmic-dark" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <p className="text-sm text-cosmic-silver">Strategy</p>
              <p className="text-lg font-bold text-cosmic-gold">{humanDesignData.strategy}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center md:text-left">
              <p className="mb-1 text-cosmic-silver">Authority</p>
              <p className="text-lg font-bold text-cosmic-silver">{humanDesignData.authority}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="mb-1 text-cosmic-silver">Signature</p>
              <p className="text-lg font-bold text-green-400">{humanDesignData.signature}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="mb-1 text-cosmic-silver">Not-Self Theme</p>
              <p className="text-lg font-bold text-red-400">{humanDesignData.not_self_theme}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs.Root className="border rounded-md border-cosmic-silver/30" defaultValue="centers">
        <Tabs.List className="flex border-b border-cosmic-silver/30">
          <Tabs.Trigger value="centers" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">
            Centers
          </Tabs.Trigger>
          <Tabs.Trigger value="profile" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">
            Profile
          </Tabs.Trigger>
          <Tabs.Trigger value="cross" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">
            Incarnation Cross
          </Tabs.Trigger>
          <Tabs.Trigger value="gates" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">
            Gates & Channels
          </Tabs.Trigger>
          <Tabs.Trigger value="variables" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">
            Variables
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="centers" className="p-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <CentersTab humanDesignData={humanDesignData} />
          </Suspense>
        </Tabs.Content>

        <Tabs.Content value="profile" className="p-4">
          <Suspense fallback={<TabLoadingFallback />}>
            <ProfileTab humanDesignData={humanDesignData} />
          </Suspense>
        </Tabs.Content>

        <Tabs.Content value="cross" className="p-4">
          <Suspense fallback={<TabLoadingFallback />}>
            <IncarnationCrossTab humanDesignData={humanDesignData} />
          </Suspense>
        </Tabs.Content>

        <Tabs.Content value="gates" className="p-4">
          <Suspense fallback={<TabLoadingFallback />}>
            <GatesChannelsTab humanDesignData={humanDesignData} />
          </Suspense>
        </Tabs.Content>

        <Tabs.Content value="variables" className="p-4">
          <Suspense fallback={<TabLoadingFallback />}>
            <VariablesTab humanDesignData={humanDesignData} />
          </Suspense>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

export default HumanDesignChart;
