/**
 * Psychology Tab Controls Component
 * Navigation tabs for psychology chart sections with progress indicators
 * Following Type Bridge validation patterns
 */

import React, { memo, useCallback } from 'react';
import { Brain, Heart, Lightbulb, TestTube } from 'lucide-react';

// Import validation schemas
import {
  PsychologyTabControlsPropsSchema,
  type PsychologyTabControlsProps,
} from '../../schemas/psychologyChart';

/**
 * Individual Tab Button Component
 */
const TabButton: React.FC<{
  id: 'mbti' | 'enneagram' | 'synthesis' | 'assessment';
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCompleted?: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = memo(function TabButton({ id, label, icon, isActive, isCompleted = false, onClick, disabled = false }) {
  const getTabClasses = () => {
    const baseClasses = 'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative overflow-hidden';
    
    if (disabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed bg-cosmic-dark/20 text-cosmic-muted`;
    }
    
    if (isActive) {
      return `${baseClasses} bg-cosmic-gold text-cosmic-dark font-medium shadow-lg`;
    }
    
    return `${baseClasses} bg-cosmic-dark/40 text-cosmic-muted hover:bg-cosmic-dark/60 hover:text-cosmic-light cursor-pointer`;
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={getTabClasses()}
      aria-label={`${label} Tab${isActive ? ' - Active' : ''}${isCompleted ? ' - Completed' : ''}`}
      data-testid={`psychology-tab-${id}`}
    >
      <div className="flex items-center gap-3 relative z-10">
        <span className="text-lg">{icon}</span>
        <span className="font-medium">{label}</span>
        
        {/* Completion Indicator */}
        {isCompleted && !isActive && (
          <div className="w-2 h-2 bg-cosmic-green rounded-full" />
        )}
      </div>
      
      {/* Active Tab Gradient Overlay */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-cosmic-gold to-cosmic-gold/80" />
      )}
    </button>
  );
});

/**
 * Progress Indicator Component
 */
const ProgressIndicator: React.FC<{
  completionStatus?: PsychologyTabControlsProps['completionStatus'];
  activeTab: PsychologyTabControlsProps['activeTab'];
}> = memo(function ProgressIndicator({ completionStatus, activeTab }) {
  if (!completionStatus) return null;

  const totalTabs = Object.keys(completionStatus).length;
  const completedTabs = Object.values(completionStatus).filter(Boolean).length;
  const progressPercentage = (completedTabs / totalTabs) * 100;

  const getTabProgress = (tab: keyof typeof completionStatus) => {
    if (completionStatus[tab]) return 'completed';
    if (tab === activeTab) return 'active';
    return 'pending';
  };

  return (
    <div className="space-y-3">
      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-cosmic-muted">Overall Progress</span>
          <span className="text-cosmic-light">{completedTabs}/{totalTabs} Completed</span>
        </div>
        <div className="h-2 bg-cosmic-dark/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cosmic-blue to-cosmic-purple transition-all duration-500"
            data-progress={progressPercentage}
          />
        </div>
      </div>

      {/* Individual Tab Indicators */}
      <div className="flex justify-between">
        {Object.keys(completionStatus).map((tab) => {
          const tabKey = tab as keyof typeof completionStatus;
          const status = getTabProgress(tabKey);
          
          return (
            <div key={tab} className="flex flex-col items-center gap-1">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  status === 'completed' 
                    ? 'bg-cosmic-green' 
                    : status === 'active' 
                    ? 'bg-cosmic-gold' 
                    : 'bg-cosmic-dark/40'
                }`}
              />
              <span className="text-xs text-cosmic-muted capitalize">
                {tab.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/**
 * Main Psychology Tab Controls Component
 */
const PsychologyTabControls: React.FC<PsychologyTabControlsProps> = memo(function PsychologyTabControls({
  activeTab,
  onTabChange,
  availableTabs = ['mbti', 'enneagram', 'synthesis', 'assessment'],
  completionStatus,
  showProgress = true,
  className = '',
}) {
  // Hooks must be called before any conditional returns
  const handleTabChange = useCallback((tab: typeof activeTab) => {
    onTabChange(tab);
  }, [onTabChange]);

  // Validate props using Zod schema
  const validatedProps = React.useMemo(() => {
    try {
      return PsychologyTabControlsPropsSchema.parse({
        activeTab,
        onTabChange,
        availableTabs,
        completionStatus,
        showProgress,
        className,
      });
    } catch (error) {
      console.error('Invalid PsychologyTabControls props:', error);
      return null;
    }
  }, [activeTab, onTabChange, availableTabs, completionStatus, showProgress, className]);

  if (!validatedProps) {
    return (
      <div className="p-4 text-center text-cosmic-red">
        Invalid tab controls configuration
      </div>
    );
  }

  // Tab configuration
  const tabConfig = {
    mbti: {
      label: 'MBTI Analysis',
      icon: <Brain className="h-5 w-5" />,
    },
    enneagram: {
      label: 'Enneagram',
      icon: <Heart className="h-5 w-5" />,
    },
    synthesis: {
      label: 'Synthesis',
      icon: <Lightbulb className="h-5 w-5" />,
    },
    assessment: {
      label: 'Assessment',
      icon: <TestTube className="h-5 w-5" />,
    },
  };

  return (
    <div className={`psychology-tab-controls space-y-4 ${className}`}>
      {/* Progress Indicator */}
      {validatedProps.showProgress && (
        <ProgressIndicator
          completionStatus={validatedProps.completionStatus}
          activeTab={validatedProps.activeTab}
        />
      )}

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {validatedProps.availableTabs.map((tabId) => {
          const config = tabConfig[tabId];
          const isCompleted = validatedProps.completionStatus?.[tabId] ?? false;
          
          return (
            <TabButton
              key={tabId}
              id={tabId}
              label={config.label}
              icon={config.icon}
              isActive={validatedProps.activeTab === tabId}
              isCompleted={isCompleted}
              onClick={() => handleTabChange(tabId)}
            />
          );
        })}
      </div>

      {/* Tab Description */}
      <div className="bg-cosmic-dark/20 rounded-lg p-4">
        <TabDescription activeTab={validatedProps.activeTab} />
      </div>
    </div>
  );
});

/**
 * Tab Description Component
 */
const TabDescription: React.FC<{
  activeTab: PsychologyTabControlsProps['activeTab'];
}> = memo(function TabDescription({ activeTab }) {
  const descriptions = {
    mbti: {
      title: 'Myers-Briggs Type Indicator',
      description: 'Explore your cognitive functions, personality type, and how they correlate with your astrological chart.',
    },
    enneagram: {
      title: 'Enneagram Personality System',
      description: 'Discover your core motivations, fears, and growth patterns through the nine-point Enneagram system.',
    },
    synthesis: {
      title: 'Integrated Analysis',
      description: 'See how your MBTI and Enneagram types work together with your astrological influences for complete understanding.',
    },
    assessment: {
      title: 'Personality Assessment',
      description: 'Take scientifically-designed assessments to discover or refine your personality type understanding.',
    },
  };

  const current = descriptions[activeTab];

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-cosmic-light">{current.title}</h3>
      <p className="text-sm text-cosmic-muted leading-relaxed">
        {current.description}
      </p>
    </div>
  );
});

PsychologyTabControls.displayName = 'PsychologyTabControls';

export default PsychologyTabControls;
