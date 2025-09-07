/**
 * Psychology Chart Container Component
 * Main orchestrator component for psychology analysis with Type Bridge validation
 * Handles state management and component composition
 */

import React, { memo, useState, useMemo, useCallback, useEffect } from 'react';
import { Card } from '@cosmichub/ui';

// Import split components
import MBTIDetailView from './MBTIDetailView';
import EnneagramDetailView from './EnneagramDetailView';
import PsychologySynthesisView from './PsychologySynthesisView';
import PsychologyTabControls from './PsychologyTabControls';

// Import validation schemas
import {
  PsychologyChartPropsSchema,
  type PsychologyChartProps as _PsychologyChartProps,
  type PsychologyAnalytics as _PsychologyAnalytics,
  type AssessmentResults,
  type CognitiveFunction,
} from '../../schemas/psychologyChart';

import { z } from 'zod';

// Props type from schema
type PsychologyChartContainerProps = z.infer<typeof PsychologyChartPropsSchema>;

// Define internal state type
interface PsychologyChartState {
  activeTab: 'mbti' | 'enneagram' | 'synthesis' | 'assessment';
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  selectedFunction?: CognitiveFunction;
  selectedEnneagramType?: number;
}

// Simple state components
const PsychologyLoadingState: React.FC = () => (
  <div className="flex items-center justify-center p-12">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-purple mx-auto"></div>
      <p className="text-cosmic-muted">Analyzing psychological patterns...</p>
    </div>
  </div>
);

const PsychologyErrorState: React.FC<{ error?: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <Card className="p-8 text-center">
    <p className="text-cosmic-red mb-4">{error ?? 'Failed to load psychology data'}</p>
    {onRetry && (
      <button 
        onClick={onRetry} 
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onRetry();
          }
        }}
        className="px-4 py-2 bg-cosmic-purple text-cosmic-light rounded focus:outline-none focus:ring-2 focus:ring-cosmic-purple"
        aria-label="Retry psychology analysis"
      >
        Retry Analysis
      </button>
    )}
  </Card>
);

const PsychologyEmptyState: React.FC = () => (
  <Card className="p-12 text-center">
    <div className="space-y-4">
      <div className="text-6xl" role="img" aria-label="Brain icon">🧠</div>
      <h3 className="text-lg font-medium text-cosmic-light">No Psychology Data Available</h3>
      <p className="text-cosmic-muted">
        Complete your personality assessment to see your psychology chart analysis.
      </p>
      <button 
        className="px-6 py-3 bg-cosmic-purple text-cosmic-light rounded-lg hover:bg-cosmic-purple/80 transition-colors focus:outline-none focus:ring-2 focus:ring-cosmic-purple"
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Handle start assessment action
          }
        }}
        aria-label="Start personality assessment"
      >
        Start Assessment
      </button>
    </div>
  </Card>
);

// Simple assessment panel placeholder
const PsychologyAssessmentPanel: React.FC<{
  onComplete: (results: AssessmentResults) => void;
  onCancel: () => void;
}> = ({ onComplete, onCancel }) => (
  <Card className="p-8">
    <h3 className="text-lg font-medium mb-4">Personality Assessment</h3>
    <p className="text-cosmic-muted mb-6">
      Complete this assessment to discover your MBTI and Enneagram types.
    </p>
    <div className="flex gap-3">
      <button 
        onClick={onCancel}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCancel();
          }
        }}
        className="px-4 py-2 border border-cosmic-border rounded focus:outline-none focus:ring-2 focus:ring-cosmic-purple"
        aria-label="Cancel personality assessment"
      >
        Cancel
      </button>
      <button 
        onClick={() => onComplete({
          assessment_id: 'demo-123',
          completed_at: new Date().toISOString(),
          mbti: {
            type: 'INTJ',
            confidence: 0.85,
            function_scores: {},
            type_probabilities: {},
          }
        })}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onComplete({
              assessment_id: 'demo-123',
              completed_at: new Date().toISOString(),
              mbti: {
                type: 'INTJ',
                confidence: 0.85,
                function_scores: {},
                type_probabilities: {},
              }
            });
          }
        }}
        className="px-4 py-2 bg-cosmic-purple text-cosmic-light rounded focus:outline-none focus:ring-2 focus:ring-cosmic-purple"
        aria-label="Start demo personality assessment"
      >
        Start Demo Assessment
      </button>
    </div>
  </Card>
);

/**
 * Main Psychology Chart Container Component
 * Orchestrates all psychology chart functionality with type safety
 */
const PsychologyChartContainer: React.FC<PsychologyChartContainerProps> = memo(function PsychologyChartContainer({
  data,
  birthData,
  isLoading = false,
  onTabChange,
  onAssessmentComplete,
  className = '',
  'data-testid': dataTestId = 'psychology-chart',
}) {
  // Validate props using Zod schema with Type Bridge pattern
  const validatedProps = useMemo<PsychologyChartContainerProps | null>(() => {
    try {
      return PsychologyChartPropsSchema.parse({
        data,
        birthData,
        isLoading,
        onTabChange,
        onAssessmentComplete,
        className,
        'data-testid': dataTestId,
      });
    } catch (error) {
      console.error('Invalid PsychologyChart props:', error);
      return null;
    }
  }, [data, birthData, isLoading, onTabChange, onAssessmentComplete, className, dataTestId]);

  // Component state
  const [state, setState] = useState<PsychologyChartState>({
    activeTab: 'mbti',
    isLoading: false,
    hasError: false,
    errorMessage: undefined,
    selectedFunction: undefined,
    selectedEnneagramType: undefined,
  });

  // Memoized processed data
  const processedData = useMemo(() => {
    if (!validatedProps?.data) return null;
    
    return {
      mbti: validatedProps.data.mbti,
      enneagram: validatedProps.data.enneagram,
      synthesis: validatedProps.data.synthesis,
      metadata: {
        timestamp: Date.now(),
        isValid: !!(validatedProps.data.mbti && validatedProps.data.enneagram),
        hasAssessment: !!validatedProps.data.assessment_data,
      }
    };
  }, [validatedProps?.data]);

  // Completion status calculation
  const completionStatus = useMemo(() => {
    if (!processedData) return undefined;
    
    return {
      mbti: !!processedData.mbti,
      enneagram: !!processedData.enneagram,
      synthesis: !!processedData.synthesis,
      assessment: !!processedData.metadata.hasAssessment,
    };
  }, [processedData]);

  // Available tabs based on data
  const availableTabs = useMemo((): ('mbti' | 'enneagram' | 'synthesis' | 'assessment')[] => {
    const tabs: ('mbti' | 'enneagram' | 'synthesis' | 'assessment')[] = ['assessment'];
    
    if (processedData?.mbti) tabs.push('mbti');
    if (processedData?.enneagram) tabs.push('enneagram');
    if (processedData?.synthesis && processedData.mbti && processedData.enneagram) {
      tabs.push('synthesis');
    }
    
    return tabs;
  }, [processedData]);

  // Event handlers
  const handleTabChange = useCallback((tab: 'mbti' | 'enneagram' | 'synthesis' | 'assessment') => {
    setState(prev => ({ ...prev, activeTab: tab }));
    onTabChange?.(tab);
    
    // Track analytics (simplified for now)
    console.log('Psychology tab changed:', tab);
  }, [onTabChange]);

  const handleFunctionSelect = useCallback((cognitiveFunction: CognitiveFunction) => {
    setState(prev => ({ ...prev, selectedFunction: cognitiveFunction }));
    console.log('Cognitive function selected:', cognitiveFunction.name);
  }, []);

  const handleEnneagramTypeSelect = useCallback((type: number) => {
    setState(prev => ({ ...prev, selectedEnneagramType: type }));
    console.log('Enneagram type selected:', type);
  }, []);

  const handleAssessmentComplete = useCallback((results: AssessmentResults) => {
    onAssessmentComplete?.(results);
    console.log('Assessment completed:', results);
    
    // Switch to appropriate tab based on results
    if (results.mbti) {
      setState(prev => ({ ...prev, activeTab: 'mbti' }));
    } else if (results.enneagram) {
      setState(prev => ({ ...prev, activeTab: 'enneagram' }));
    }
  }, [onAssessmentComplete]);

  const handleInsightExpand = useCallback((insight: string) => {
    console.log('Insight expanded:', insight);
  }, []);

  // Set initial tab based on available data
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(state.activeTab)) {
      const defaultTab: 'mbti' | 'enneagram' | 'synthesis' | 'assessment' = 
        processedData?.mbti ? 'mbti' : (availableTabs[0] ?? 'assessment');
      setState(prev => ({ ...prev, activeTab: defaultTab }));
    }
  }, [availableTabs, state.activeTab, processedData]);

  // Early return for invalid props
  if (!validatedProps) {
    return (
      <PsychologyErrorState
        error="Invalid psychology chart configuration"
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Loading state
  if (isLoading || state.isLoading) {
    return <PsychologyLoadingState />;
  }

  // Error state
  if (state.hasError) {
    return (
      <PsychologyErrorState
        error={state.errorMessage ?? 'Psychology analysis failed'}
        onRetry={() => setState(prev => ({ ...prev, hasError: false, errorMessage: undefined }))}
      />
    );
  }

  // Empty state - no psychology data
  if (!processedData || availableTabs.length === 0) {
    return <PsychologyEmptyState />;
  }

  return (
    <div className={`psychology-chart-container space-y-6 ${className}`} data-testid={dataTestId}>
      {/* Tab Controls */}
      <PsychologyTabControls
        activeTab={state.activeTab}
        onTabChange={handleTabChange}
        availableTabs={availableTabs}
        showProgress={true}
        completionStatus={completionStatus}
        className=""
      />

      {/* Tab Content */}
      <div className="psychology-chart-content">
        {state.activeTab === 'mbti' && processedData.mbti && (
          <MBTIDetailView
            profile={processedData.mbti.profile}
            astrology={processedData.mbti.birth_correlation}
            onFunctionSelect={handleFunctionSelect}
            showAstrology={true}
            className=""
          />
        )}

        {state.activeTab === 'enneagram' && processedData.enneagram && (
          <EnneagramDetailView
            profile={processedData.enneagram.profile}
            astrology={processedData.enneagram.astrological_indicators}
            onTypeSelect={handleEnneagramTypeSelect}
            showWings={true}
            className=""
          />
        )}

        {state.activeTab === 'synthesis' && processedData.synthesis && (
          <PsychologySynthesisView
            synthesis={processedData.synthesis}
            mbtiProfile={processedData.mbti?.profile}
            enneagramProfile={processedData.enneagram?.profile}
            onInsightExpand={handleInsightExpand}
            showDevelopmentPath={true}
            className=""
          />
        )}

        {state.activeTab === 'assessment' && (
          <PsychologyAssessmentPanel
            onComplete={handleAssessmentComplete}
            onCancel={() => setState(prev => ({ ...prev, activeTab: availableTabs[0] ?? 'assessment' }))}
          />
        )}
      </div>

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 bg-cosmic-dark/20">
          <details>
            <summary className="text-xs text-cosmic-muted cursor-pointer">Debug Info</summary>
            <pre className="text-xs text-cosmic-muted mt-2 overflow-auto">
              {JSON.stringify({
                activeTab: state.activeTab,
                availableTabs,
                completionStatus,
                hasData: !!processedData,
              }, null, 2)}
            </pre>
          </details>
        </Card>
      )}
    </div>
  );
});

PsychologyChartContainer.displayName = 'PsychologyChartContainer';

export default PsychologyChartContainer;
