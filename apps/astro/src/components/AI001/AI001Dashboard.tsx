// AI-001 Enhanced Components - Next-Generation UI for Advanced AI Features
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@cosmichub/ui';
import { ProgressBar } from '../ui/ProgressBar';
import type { ChartData, SavedChart } from '../../services/api.types';
import {
  TransitPrediction,
  PersonalGrowthInsight,
  MultiSystemInterpretation,
  ChartPattern,
  useAI001Analysis,
  useTransitPredictions,
  useGrowthInsights,
} from '../../services/ai-001-enhanced';

interface AI001DashboardProps {
  chartData: Partial<SavedChart> & { 
    id?: string;
    planets?: ChartData['planets']; 
    houses?: ChartData['houses']; 
  };
  userId: string;
  className?: string;
}

// =============================================================================
// Main AI-001 Dashboard Component
// =============================================================================

export const AI001Dashboard: React.FC<AI001DashboardProps> = ({
  chartData,
  userId,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'transits' | 'growth' | 'synthesis' | 'patterns'
  >('overview');

  const {
    data: comprehensiveAnalysis,
    isLoading: isLoadingComprehensive,
    error: comprehensiveError,
  } = useAI001Analysis(chartData, userId);

  const { data: transits, isLoading: isLoadingTransits } =
    useTransitPredictions(chartData);

  const { data: growthInsights, isLoading: isLoadingGrowth } =
    useGrowthInsights(chartData);

  if (isLoadingComprehensive) {
    return (
      <Card className={`cosmic-glass border-cosmic-purple/30 ${className}`}>
        <CardContent className='p-8 text-center'>
          <div className='animate-pulse space-y-4'>
            <div className='w-16 h-16 bg-cosmic-purple/30 rounded-full mx-auto'></div>
            <h3 className='text-lg text-cosmic-gold'>
              Generating AI-001 Analysis...
            </h3>
            <p className='text-cosmic-silver/70'>
              Advanced AI processing your cosmic blueprint
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (comprehensiveError) {
    return (
      <Card className={`cosmic-glass border-red-500/30 ${className}`}>
        <CardContent className='p-8 text-center'>
          <h3 className='text-lg text-red-400 mb-4'>Analysis Error</h3>
          <p className='text-cosmic-silver/70'>
            Unable to generate AI-001 analysis. Please try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className='mt-4 bg-cosmic-purple hover:bg-cosmic-purple/80'
          >
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI-001 Header */}
      <Card className='cosmic-glass border-cosmic-gold/30'>
        <CardHeader className='bg-gradient-to-r from-cosmic-purple/20 to-cosmic-blue/20 border-b border-cosmic-gold/30'>
          <CardTitle className='text-2xl text-cosmic-gold flex items-center gap-3'>
            🚀 AI-001 Enhanced Analysis
            <Badge className='bg-cosmic-gold/20 text-cosmic-gold border-cosmic-gold/30'>
              Next-Gen AI
            </Badge>
          </CardTitle>
          <p className='text-cosmic-silver/80 mt-2'>
            Advanced astrological insights powered by predictive analysis,
            growth coaching, and multi-system synthesis
          </p>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className='flex flex-wrap gap-2'>
        {[
          { id: 'overview', label: '📊 Overview', icon: '📊' },
          { id: 'transits', label: '🌟 Transits', icon: '🌟' },
          { id: 'growth', label: '🌱 Growth', icon: '🌱' },
          { id: 'synthesis', label: '🌍 Synthesis', icon: '🌍' },
          { id: 'patterns', label: '🔮 Patterns', icon: '🔮' },
        ].map(tab => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            variant={activeTab === tab.id ? 'default' : 'secondary'}
            className={`${
              activeTab === tab.id
                ? 'bg-cosmic-gold text-cosmic-dark'
                : 'bg-cosmic-purple/20 text-cosmic-silver hover:bg-cosmic-purple/30'
            }`}
          >
            {tab.icon} {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          analysis={comprehensiveAnalysis}
          transits={transits}
          growthInsights={growthInsights}
        />
      )}

      {activeTab === 'transits' && (
        <TransitsTab transits={transits} isLoading={isLoadingTransits} />
      )}

      {activeTab === 'growth' && (
        <GrowthTab insights={growthInsights} isLoading={isLoadingGrowth} />
      )}

      {activeTab === 'synthesis' && (
        <SynthesisTab synthesis={comprehensiveAnalysis?.synthesis} />
      )}

      {activeTab === 'patterns' && (
        <PatternsTab patterns={comprehensiveAnalysis?.patterns} />
      )}
    </div>
  );
};

// =============================================================================
// Overview Tab Component
// =============================================================================

interface OverviewTabProps {
  analysis?: {
    transits: TransitPrediction[];
    growth: PersonalGrowthInsight[];
    synthesis: MultiSystemInterpretation;
    patterns: ChartPattern[];
    summary: string;
  };
  transits?: TransitPrediction[];
  growthInsights?: PersonalGrowthInsight[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  analysis,
  transits,
  growthInsights,
}) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {/* Executive Summary */}
      {analysis?.summary && (
        <Card className='cosmic-glass border-cosmic-gold/30 md:col-span-2 lg:col-span-3'>
          <CardHeader>
            <CardTitle className='text-xl text-cosmic-gold'>
              📋 Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-cosmic-silver leading-relaxed'>
              {analysis.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Transits Preview */}
      <Card className='cosmic-glass border-cosmic-purple/30'>
        <CardHeader>
          <CardTitle className='text-lg text-cosmic-gold'>
            🌟 Next Major Transit
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transits && transits.length > 0 ? (
            <div>
              <h4 className='font-semibold text-cosmic-silver mb-2'>
                {transits[0]?.transitType ?? 'Loading...'}
              </h4>
              <p className='text-sm text-cosmic-silver/80 mb-2'>
                {transits[0]?.exactDate ?? 'Date pending...'}
              </p>
              <p className='text-cosmic-silver text-sm'>
                {transits[0]?.theme ?? 'Theme loading...'}
              </p>
              <Badge
                className={`mt-2 ${
                  transits[0]?.influence === 'major'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {transits[0]?.influence ?? 'unknown'} influence
              </Badge>
            </div>
          ) : (
            <p className='text-cosmic-silver/60'>No upcoming transits</p>
          )}
        </CardContent>
      </Card>

      {/* Growth Focus */}
      <Card className='cosmic-glass border-cosmic-green/30'>
        <CardHeader>
          <CardTitle className='text-lg text-cosmic-gold'>
            🌱 Current Growth Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          {growthInsights && growthInsights.length > 0 ? (
            <div>
              <h4 className='font-semibold text-cosmic-silver mb-2'>
                {growthInsights[0]?.title ?? 'Loading...'}
              </h4>
              <p className='text-sm text-cosmic-silver/80 mb-2'>
                {growthInsights[0]?.currentPhase ?? 'Phase loading...'}
              </p>
              <div className='flex items-center gap-2'>
                <ProgressBar
                  progress={growthInsights[0]?.metrics?.progress ?? 0}
                  className='flex-1'
                />
                <span className='text-xs text-cosmic-silver'>
                  {growthInsights[0]?.metrics?.progress ?? 0}%
                </span>
              </div>
            </div>
          ) : (
            <p className='text-cosmic-silver/60'>Loading growth insights...</p>
          )}
        </CardContent>
      </Card>

      {/* Pattern Highlights */}
      <Card className='cosmic-glass border-cosmic-blue/30'>
        <CardHeader>
          <CardTitle className='text-lg text-cosmic-gold'>
            🔮 Key Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis?.patterns && analysis.patterns.length > 0 ? (
            <div>
              <h4 className='font-semibold text-cosmic-silver mb-2'>
                {analysis.patterns[0]?.patternType ?? 'Loading...'}
              </h4>
              <p className='text-sm text-cosmic-silver/80 mb-2'>
                {analysis.patterns[0]?.significance ??
                  'Significance loading...'}
              </p>
              <Badge className='bg-cosmic-blue/20 text-cosmic-blue'>
                {analysis.patterns[0]?.evolutionStage ?? 'unknown'}
              </Badge>
            </div>
          ) : (
            <p className='text-cosmic-silver/60'>Analyzing patterns...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// =============================================================================
// Transits Tab Component
// =============================================================================

interface TransitsTabProps {
  transits?: TransitPrediction[];
  isLoading: boolean;
}

const TransitsTab: React.FC<TransitsTabProps> = ({ transits, isLoading }) => {
  if (isLoading) {
    return (
      <div className='text-center py-8'>
        <div className='animate-spin w-8 h-8 border-2 border-cosmic-purple border-t-transparent rounded-full mx-auto mb-4'></div>
        <p className='text-cosmic-silver/70'>
          Calculating transit predictions...
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Card className='cosmic-glass border-cosmic-purple/30'>
        <CardHeader>
          <CardTitle className='text-xl text-cosmic-gold'>
            🌟 Predictive Transit Analysis
          </CardTitle>
          <p className='text-cosmic-silver/80'>
            AI-powered timing recommendations for the next 12 months
          </p>
        </CardHeader>
      </Card>

      <div className='grid gap-4'>
        {transits?.map(transit => (
          <TransitCard key={transit.id} transit={transit} />
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// Growth Tab Component
// =============================================================================

interface GrowthTabProps {
  insights?: PersonalGrowthInsight[];
  isLoading: boolean;
}

const GrowthTab: React.FC<GrowthTabProps> = ({ insights, isLoading }) => {
  if (isLoading) {
    return (
      <div className='text-center py-8'>
        <div className='animate-spin w-8 h-8 border-2 border-cosmic-green border-t-transparent rounded-full mx-auto mb-4'></div>
        <p className='text-cosmic-silver/70'>Generating growth insights...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Card className='cosmic-glass border-cosmic-green/30'>
        <CardHeader>
          <CardTitle className='text-xl text-cosmic-gold'>
            🌱 Personal Growth Coaching
          </CardTitle>
          <p className='text-cosmic-silver/80'>
            AI-driven developmental insights tailored to your cosmic blueprint
          </p>
        </CardHeader>
      </Card>

      <div className='grid gap-4'>
        {insights?.map(insight => (
          <GrowthInsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// Individual Card Components
// =============================================================================

interface TransitCardProps {
  transit: TransitPrediction;
}

const TransitCard: React.FC<TransitCardProps> = ({ transit }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className='cosmic-glass border-cosmic-purple/30'>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div>
            <h3 className='text-lg font-semibold text-cosmic-silver'>
              {transit.transitType}
            </h3>
            <p className='text-cosmic-gold text-sm'>
              {transit.exactDate} • {transit.theme}
            </p>
          </div>
          <Badge
            className={`${
              transit.influence === 'major'
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : transit.influence === 'moderate'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}
          >
            {transit.influence}
          </Badge>
        </div>

        <div className='space-y-3'>
          <div>
            <h4 className='text-cosmic-gold text-sm font-medium mb-1'>
              Opportunities
            </h4>
            <ul className='text-cosmic-silver/80 text-sm space-y-1'>
              {transit.opportunities
                .slice(0, expanded ? undefined : 2)
                .map((opp, idx) => (
                  <li key={idx}>• {opp}</li>
                ))}
            </ul>
          </div>

          {expanded && (
            <>
              <div>
                <h4 className='text-cosmic-gold text-sm font-medium mb-1'>
                  Recommendations
                </h4>
                <ul className='text-cosmic-silver/80 text-sm space-y-1'>
                  {transit.recommendations.map((rec, idx) => (
                    <li key={idx}>• {rec}</li>
                  ))}
                </ul>
              </div>

              <div className='flex items-center justify-between text-xs text-cosmic-silver/60'>
                <span>
                  Duration: {transit.duration.start} - {transit.duration.end}
                </span>
                <span>Confidence: {Math.round(transit.confidence * 100)}%</span>
              </div>
            </>
          )}
        </div>

        <Button
          onClick={() => setExpanded(!expanded)}
          variant='secondary'
          size='sm'
          className='mt-4 text-cosmic-purple hover:text-cosmic-gold'
        >
          {expanded ? 'Show Less' : 'Show More'}
        </Button>
      </CardContent>
    </Card>
  );
};

interface GrowthInsightCardProps {
  insight: PersonalGrowthInsight;
}

const GrowthInsightCard: React.FC<GrowthInsightCardProps> = ({ insight }) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      spiritual: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
      emotional: 'text-pink-400 bg-pink-500/20 border-pink-500/30',
      mental: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      physical: 'text-green-400 bg-green-500/20 border-green-500/30',
      social: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    };
    return (
      colors[category as keyof typeof colors] ||
      'text-cosmic-silver bg-cosmic-silver/20'
    );
  };

  return (
    <Card className='cosmic-glass border-cosmic-green/30'>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div>
            <h3 className='text-lg font-semibold text-cosmic-silver'>
              {insight.title}
            </h3>
            <p className='text-cosmic-silver/70 text-sm mt-1'>
              {insight.currentPhase}
            </p>
          </div>
          <Badge className={getCategoryColor(insight.category)}>
            {insight.category}
          </Badge>
        </div>

        <div className='space-y-4'>
          {/* Progress Bar */}
          <div>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-cosmic-gold text-sm'>Progress</span>
              <span className='text-cosmic-silver text-sm'>
                {insight.metrics.progress}%
              </span>
            </div>
            <ProgressBar
              progress={insight.metrics.progress}
              className='w-full'
            />
          </div>

          {/* Next Steps */}
          <div>
            <h4 className='text-cosmic-gold text-sm font-medium mb-2'>
              Next Steps
            </h4>
            <ul className='text-cosmic-silver/80 text-sm space-y-1'>
              {insight.nextSteps.slice(0, 3).map((step, idx) => (
                <li key={idx}>• {step}</li>
              ))}
            </ul>
          </div>

          <div className='flex justify-between items-center text-xs text-cosmic-silver/60'>
            <span>Timeline: {insight.timeframe}</span>
            <span>Difficulty: {insight.metrics.difficulty}/100</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// =============================================================================
// Synthesis and Patterns Tabs (Simplified for now)
// =============================================================================

const SynthesisTab: React.FC<{ synthesis?: MultiSystemInterpretation }> = ({
  synthesis,
}) => (
  <Card className='cosmic-glass border-cosmic-blue/30'>
    <CardHeader>
      <CardTitle className='text-xl text-cosmic-gold'>
        🌍 Multi-System Synthesis
      </CardTitle>
    </CardHeader>
    <CardContent>
      {synthesis ? (
        <div className='space-y-4'>
          <p className='text-cosmic-silver'>{synthesis.synthesis}</p>
          {/* Add more synthesis content here */}
        </div>
      ) : (
        <p className='text-cosmic-silver/60'>
          Synthesizing cross-cultural insights...
        </p>
      )}
    </CardContent>
  </Card>
);

const PatternsTab: React.FC<{ patterns?: ChartPattern[] }> = ({ patterns }) => (
  <Card className='cosmic-glass border-cosmic-purple/30'>
    <CardHeader>
      <CardTitle className='text-xl text-cosmic-gold'>
        🔮 Advanced Pattern Recognition
      </CardTitle>
    </CardHeader>
    <CardContent>
      {patterns && patterns.length > 0 ? (
        <div className='space-y-4'>
          {patterns.map(pattern => (
            <div
              key={pattern.id}
              className='border-l-4 border-cosmic-purple pl-4'
            >
              <h4 className='font-semibold text-cosmic-silver'>
                {pattern.patternType}
              </h4>
              <p className='text-cosmic-silver/80 text-sm'>
                {pattern.significance}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-cosmic-silver/60'>Analyzing chart patterns...</p>
      )}
    </CardContent>
  </Card>
);

export default AI001Dashboard;
