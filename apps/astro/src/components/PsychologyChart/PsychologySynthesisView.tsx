/**
 * Psychology Synthesis View Component
 * Displays integrated analysis of MBTI, Enneagram, and astrological correlations
 * Following Type Bridge validation patterns
 */

import React, { memo, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@cosmichub/ui';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Star, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Target,
  Compass
} from 'lucide-react';

// Import validation schemas
import {
  PsychologySynthesisViewPropsSchema,
  type PsychologySynthesisViewProps,
  type PsychologySynthesis,
  type MBTIProfile,
  type EnneagramProfile,
} from '../../schemas/psychologyChart';

/**
 * Insight Card Component
 */
const InsightCard: React.FC<{
  title: string;
  insights: string[];
  icon: React.ReactNode;
  iconColor: string;
  onExpand?: (title: string) => void;
  expandable?: boolean;
}> = memo(function InsightCard({ title, insights, icon, iconColor, onExpand, expandable = true }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setIsExpanded(!isExpanded);
    if (onExpand && !isExpanded) {
      onExpand(title);
    }
  }, [isExpanded, onExpand, title]);

  const displayedInsights = isExpanded ? insights : insights.slice(0, 2);

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className={iconColor}>{icon}</span>
            {title}
          </CardTitle>
          {expandable && insights.length > 2 && (
            <Button
              className="cosmic-button-ghost p-1"
              onClick={handleToggle}
              aria-label={isExpanded ? 'Collapse insights' : 'Expand insights'}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedInsights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-cosmic-dark/20 rounded-lg">
              <span className="w-2 h-2 bg-cosmic-gold rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm leading-relaxed text-cosmic-muted">
                {insight}
              </p>
            </div>
          ))}
          
          {!isExpanded && insights.length > 2 && (
            <div className="text-center pt-2">
              <Button
                className="cosmic-button-outline text-xs"
                onClick={handleToggle}
              >
                Show {insights.length - 2} more insights
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Development Phase Indicator
 */
const DevelopmentPhaseIndicator: React.FC<{
  phase: PsychologySynthesis['development_phase'];
  integrationLevel: number;
}> = memo(function DevelopmentPhaseIndicator({ phase, integrationLevel }) {
  const phaseConfig = {
    forming: { color: 'text-cosmic-red', description: 'Initial self-discovery phase' },
    developing: { color: 'text-cosmic-gold', description: 'Active growth and learning' },
    integrating: { color: 'text-cosmic-blue', description: 'Synthesizing insights' },
    mastering: { color: 'text-cosmic-green', description: 'Advanced self-awareness' },
  };

  const config = phaseConfig[phase];

  return (
    <Card className="cosmic-gradient-bg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-cosmic-gold" />
          Development Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className={`text-lg font-semibold capitalize ${config.color}`}>
              {phase} Phase
            </h3>
            <p className="text-sm text-cosmic-muted">{config.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-cosmic-muted">Integration Level</div>
            <div className="text-xl font-bold text-cosmic-blue">
              {Math.round(integrationLevel * 100)}%
            </div>
          </div>
        </div>

        {/* Integration Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>Complete Integration</span>
          </div>
          <div className="h-3 bg-cosmic-dark/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cosmic-blue to-cosmic-purple transition-all duration-500"
              data-integration-level={integrationLevel}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Cross-System Integration Display
 */
const CrossSystemIntegration: React.FC<{
  mbtiProfile?: MBTIProfile;
  enneagramProfile?: EnneagramProfile;
}> = memo(function CrossSystemIntegration({ mbtiProfile, enneagramProfile }) {
  if (!mbtiProfile || !enneagramProfile) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-cosmic-purple" />
          Cross-System Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type Combination */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-cosmic-blue">MBTI Type</h4>
            <div className="bg-cosmic-blue/10 p-3 rounded-lg">
              <div className="font-bold text-cosmic-blue">{mbtiProfile.type}</div>
              <div className="text-xs text-cosmic-muted">{mbtiProfile.name}</div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-cosmic-purple">Enneagram Type</h4>
            <div className="bg-cosmic-purple/10 p-3 rounded-lg">
              <div className="font-bold text-cosmic-purple">Type {enneagramProfile.type}</div>
              <div className="text-xs text-cosmic-muted">{enneagramProfile.name}</div>
            </div>
          </div>
        </div>

        {/* Elemental Correlations */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Elemental Patterns</h4>
          <div className="flex items-center justify-between bg-cosmic-dark/20 p-3 rounded-lg">
            <span className="text-sm">MBTI Element:</span>
            <span className="font-medium text-cosmic-gold">{mbtiProfile.elementalCorrelation}</span>
          </div>
        </div>

        {/* Compatibility Synthesis */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">System Harmony</h4>
          <div className="bg-cosmic-green/10 p-3 rounded-lg">
            <p className="text-xs text-cosmic-muted">
              Your {mbtiProfile.type} type and Enneagram {enneagramProfile.type} create a complementary 
              pattern of cognitive processing and emotional motivation.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Main Psychology Synthesis View Component
 */
const PsychologySynthesisView: React.FC<PsychologySynthesisViewProps> = memo(function PsychologySynthesisView({
  synthesis,
  mbtiProfile,
  enneagramProfile,
  onInsightExpand,
  showDevelopmentPath = true,
  className = '',
}) {
  // Hooks must be called before any conditional returns
  const handleInsightExpand = useCallback((insight: string) => {
    onInsightExpand?.(insight);
  }, [onInsightExpand]);

  // Validate props using Zod schema
  const validatedProps = React.useMemo(() => {
    try {
      return PsychologySynthesisViewPropsSchema.parse({
        synthesis,
        mbtiProfile,
        enneagramProfile,
        onInsightExpand,
        showDevelopmentPath,
        className,
      });
    } catch (error) {
      console.error('Invalid PsychologySynthesisView props:', error);
      return null;
    }
  }, [synthesis, mbtiProfile, enneagramProfile, onInsightExpand, showDevelopmentPath, className]);

  if (!validatedProps) {
    return (
      <Card className="p-8 text-center">
        <p className="text-cosmic-red">Invalid synthesis data</p>
      </Card>
    );
  }

  return (
    <div className={`psychology-synthesis-view space-y-6 ${className}`}>
      {/* Development Phase Indicator */}
      {validatedProps.showDevelopmentPath && (
        <DevelopmentPhaseIndicator
          phase={validatedProps.synthesis.development_phase}
          integrationLevel={validatedProps.synthesis.integration_level}
        />
      )}

      {/* Cross-System Integration */}
      <CrossSystemIntegration
        mbtiProfile={validatedProps.mbtiProfile}
        enneagramProfile={validatedProps.enneagramProfile}
      />

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personality Themes */}
        <InsightCard
          title="Personality Themes"
          insights={validatedProps.synthesis.personality_themes}
          icon={<Lightbulb className="h-5 w-5" />}
          iconColor="text-cosmic-gold"
          onExpand={handleInsightExpand}
        />

        {/* Growth Opportunities */}
        <InsightCard
          title="Growth Opportunities"
          insights={validatedProps.synthesis.growth_opportunities}
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="text-cosmic-green"
          onExpand={handleInsightExpand}
        />

        {/* Spiritual Path Indicators */}
        <InsightCard
          title="Spiritual Path"
          insights={validatedProps.synthesis.spiritual_path_indicators}
          icon={<Star className="h-5 w-5" />}
          iconColor="text-cosmic-purple"
          onExpand={handleInsightExpand}
        />

        {/* Potential Challenges */}
        <InsightCard
          title="Potential Challenges"
          insights={validatedProps.synthesis.potential_challenges}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconColor="text-cosmic-red"
          onExpand={handleInsightExpand}
        />
      </div>

      {/* Astrological Timing Guidance */}
      {validatedProps.synthesis.astrological_timing_guidance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cosmic-blue" />
              Astrological Timing Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validatedProps.synthesis.astrological_timing_guidance.map((guidance, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-cosmic-blue/10 rounded-lg">
                  <Clock className="h-4 w-4 text-cosmic-blue mt-1 flex-shrink-0" />
                  <p className="text-sm text-cosmic-muted leading-relaxed">
                    {guidance}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          className="cosmic-button-outline"
          onClick={() => console.log('Export synthesis')}
        >
          Export Analysis
        </Button>
        <Button
          className="cosmic-button-primary"
          onClick={() => console.log('Schedule consultation')}
        >
          Schedule Consultation
        </Button>
      </div>
    </div>
  );
});

PsychologySynthesisView.displayName = 'PsychologySynthesisView';

export default PsychologySynthesisView;
