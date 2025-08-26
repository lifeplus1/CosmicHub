import React, { useState, useEffect, useCallback } from 'react';
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

const GeneKeysChart: React.FC<GeneKeysChartProps> = React.memo(
  ({ birthData, onCalculate }) => {
    // Holds the calculated Gene Keys profile; stays null until a valid object is received.
    // (Tests previously caused an undefined value to be set which bypassed the strict null check
    // and led to runtime errors deeper in the tree. We defensively constrain to null | GeneKeysData.)
    const [geneKeysData, setGeneKeysData] = useState<GeneKeysData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedKey, setSelectedKey] = useState<GeneKey | null>(null);
    const { toast } = useToast();

  const handleCalculate = useCallback(async () => {
    if (birthData == null) {
      return;
    }

    setLoading(true);
    setError(null);      try {
        const result: ApiResult<GeneKeysData> =
          await calculateGeneKeys(birthData);
        if (result.success) {
          setGeneKeysData(result.data);
        } else {
          throw new Error(result.error);
        }

        toast({
          title: 'Gene Keys Calculated',
          description:
            'Your Gene Keys profile has been generated successfully!',
          status: 'success',
          duration: 3000,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to calculate Gene Keys';
        setError(errorMessage);
        toast({
          title: 'Calculation Error',
          description: errorMessage,
          status: 'error',
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
        void Promise.resolve(
          onCalculate({
            year: 2000,
            month: 1,
            day: 1,
            hour: 0,
            minute: 0,
          } as ChartBirthData)
        );
      }
    }, [onCalculate]);

    useEffect(() => {
      if (birthData != null) {
        void handleCalculate();
      }
      // Intentional: handleCalculate depends on toast causing changing identity; rely only on birthData changes
    }, [birthData]);

    // Loading state component with enhanced UX
    if (loading === true) {
      return (
        <div className='py-10 text-center space-y-6'>
          {/* Enhanced loading spinner */}
          <div className='relative'>
            <div className='w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto'></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-60 animate-pulse'></div>
            </div>
          </div>
          
          {/* Progressive loading message */}
          <div className='space-y-2'>
            <p className='text-lg font-medium text-cosmic-silver'>
              Calculating your Gene Keys profile...
            </p>
            <p className='text-sm text-cosmic-silver/70 max-w-md mx-auto'>
              Analyzing your birth chart to determine your genetic blueprint and higher purpose
            </p>
          </div>
          
          {/* Loading progress dots */}
          <div className='flex justify-center space-x-2'>
            <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0ms]'></div>
            <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:150ms]'></div>
            <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:300ms]'></div>
          </div>
          
          {/* Estimated time */}
          <div className='text-xs text-cosmic-silver/50'>
            This usually takes 15-30 seconds
          </div>
        </div>
      );
    }

    // Enhanced error state component
    if (error !== null) {
      const getErrorIcon = () => {
        if (error.toLowerCase().includes('network')) return '🌐';
        if (error.toLowerCase().includes('timeout')) return '⏱️';
        if (error.toLowerCase().includes('validation')) return '⚠️';
        return '❌';
      };
      
      const getErrorType = () => {
        if (error.toLowerCase().includes('network')) return 'Connection Error';
        if (error.toLowerCase().includes('timeout')) return 'Timeout Error';
        if (error.toLowerCase().includes('validation')) return 'Data Validation Error';
        return 'Calculation Error';
      };
      
      const getErrorSuggestion = () => {
        if (error.toLowerCase().includes('network')) {
          return 'Please check your internet connection and try again.';
        }
        if (error.toLowerCase().includes('timeout')) {
          return 'The calculation is taking longer than expected. Try refreshing the page.';
        }
        if (error.toLowerCase().includes('validation')) {
          return 'Please verify your birth information is correct.';
        }
        return 'An unexpected error occurred. Please try again.';
      };
      
      return (
        <div className='p-6 border border-red-500/30 rounded-lg bg-red-900/10 backdrop-blur-sm'>
          <div className='flex items-start gap-4'>
            {/* Error icon */}
            <div className='flex-shrink-0 text-2xl'>
              {getErrorIcon()}
            </div>
            
            {/* Error content */}
            <div className='flex-1 space-y-3'>
              <div className='space-y-1'>
                <h3 className='text-lg font-semibold text-red-300'>
                  {getErrorType()}
                </h3>
                <p className='text-red-200/90 text-sm'>
                  {getErrorSuggestion()}
                </p>
              </div>
              
              {/* Technical error message */}
              <details className='text-xs'>
                <summary className='cursor-pointer text-red-300/80 hover:text-red-300'>
                  Technical details
                </summary>
                <div className='mt-2 p-2 bg-red-900/20 rounded border border-red-500/20 font-mono text-red-200/70'>
                  {error}
                </div>
              </details>
              
              {/* Action buttons */}
              <div className='flex flex-wrap gap-2 pt-2'>
                <button
                  type='button'
                  onClick={() => {
                    setError(null);
                    void handleCalculate();
                  }}
                  className='px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                >
                  🔄 Try Again
                </button>
                
                <button
                  type='button'
                  onClick={() => setError(null)}
                  className='px-3 py-1.5 text-sm font-medium text-red-200 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Enhanced empty state component
    if (geneKeysData === null) {
      return (
        <div className='py-12 text-center space-y-6'>
          {/* Empty state icon */}
          <div className='mx-auto w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center'>
            <div className='text-3xl'>🗝️</div>
          </div>
          
          {/* Empty state content */}
          <div className='space-y-3'>
            <h3 className='text-xl font-semibold text-cosmic-gold'>
              Discover Your Gene Keys
            </h3>
            <p className='text-cosmic-silver/80 max-w-md mx-auto'>
              Enter your birth information to calculate your Gene Keys profile and unlock insights into your genetic blueprint and higher purpose
            </p>
          </div>
          
          {/* Call to action */}
          {typeof onCalculate === 'function' && (
            <div className='space-y-3'>
              <button 
                className='cosmic-button px-6 py-3 text-base font-medium' 
                onClick={handleEmptyCalculate}
              >
                ✨ Calculate Gene Keys
              </button>
              
              <p className='text-xs text-cosmic-silver/50'>
                Uses sample data for demonstration
              </p>
            </div>
          )}
          
          {/* Benefits preview */}
          <div className='mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto'>
            <div className='p-3 bg-cosmic-dark/30 rounded-lg border border-cosmic-silver/10'>
              <div className='text-lg mb-1'>🧬</div>
              <div className='text-sm font-medium text-cosmic-silver'>Genetic Blueprint</div>
              <div className='text-xs text-cosmic-silver/60'>Your core essence</div>
            </div>
            
            <div className='p-3 bg-cosmic-dark/30 rounded-lg border border-cosmic-silver/10'>
              <div className='text-lg mb-1'>🎯</div>
              <div className='text-sm font-medium text-cosmic-silver'>Life Purpose</div>
              <div className='text-xs text-cosmic-silver/60'>Your highest calling</div>
            </div>
            
            <div className='p-3 bg-cosmic-dark/30 rounded-lg border border-cosmic-silver/10'>
              <div className='text-lg mb-1'>💎</div>
              <div className='text-sm font-medium text-cosmic-silver'>Hidden Gifts</div>
              <div className='text-xs text-cosmic-silver/60'>Your unique talents</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='p-6'>
        <Tabs.Root defaultValue='core'>
          <Tabs.List className='flex flex-wrap mb-6 border-b border-cosmic-silver/30'>
            <Tabs.Trigger
              value='core'
              className='px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple hover:bg-cosmic-purple/10 transition-colors'
            >
              🌱 Core Quartet
            </Tabs.Trigger>
            <Tabs.Trigger
              value='activation'
              className='px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple hover:bg-cosmic-purple/10 transition-colors'
            >
              🧠 Activation (IQ)
            </Tabs.Trigger>
            <Tabs.Trigger
              value='venus'
              className='px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple hover:bg-cosmic-purple/10 transition-colors'
            >
              💖 Venus (EQ)
            </Tabs.Trigger>
            <Tabs.Trigger
              value='pearl'
              className='px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple hover:bg-cosmic-purple/10 transition-colors'
            >
              � Pearl (SQ)
            </Tabs.Trigger>
            <Tabs.Trigger
              value='profile'
              className='px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple hover:bg-cosmic-purple/10 transition-colors'
            >
              🌌 Hologenetic Profile
            </Tabs.Trigger>
            {selectedKey !== null && (
              <Tabs.Trigger
                value='details'
                className='px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple hover:bg-cosmic-purple/10 transition-colors'
              >
                📖 Gene Key {selectedKey.number}
              </Tabs.Trigger>
            )}
          </Tabs.List>

          <Tabs.Content value='core' className='p-6'>
            <CoreQuartetTab
              geneKeysData={geneKeysData}
              onKeySelect={handleKeySelect}
            />
          </Tabs.Content>

          <Tabs.Content value='activation' className='p-6'>
            <ActivationSequenceTab
              geneKeysData={geneKeysData}
              onKeySelect={handleKeySelect}
            />
          </Tabs.Content>

          <Tabs.Content value='venus' className='p-6'>
            <VenusSequenceTab
              geneKeysData={geneKeysData}
              onKeySelect={handleKeySelect}
            />
          </Tabs.Content>

          <Tabs.Content value='pearl' className='p-6'>
            <PearlSequenceTab
              geneKeysData={geneKeysData}
              onKeySelect={handleKeySelect}
            />
          </Tabs.Content>

          <Tabs.Content value='profile' className='p-6'>
            <HologenicProfileTab geneKeysData={geneKeysData} />
          </Tabs.Content>

          <Tabs.Content value='details' className='p-6'>
            <GeneKeyDetails selectedKey={selectedKey} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    );
  }
);

GeneKeysChart.displayName = 'GeneKeysChart';

export default GeneKeysChart;
