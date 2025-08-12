import React, { useState } from 'react';
import FeatureGuard from './FeatureGuard';
import type { ChartData } from '../types';
import { cn, cardVariants, badgeVariants, buttonVariants } from '../shared/utils';

interface AIInterpretationProps {
  chartData: ChartData;
  loading?: boolean;
}

const AIInterpretation: React.FC<AIInterpretationProps> = ({
  chartData,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState('core-identity');

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="space-y-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={cn(cardVariants({ variant: 'default' }))}>
              <div className="w-3/4 h-4 mb-3 rounded bg-slate-700"></div>
              <div className="space-y-2">
                <div className="h-3 rounded bg-slate-700"></div>
                <div className="w-5/6 h-3 rounded bg-slate-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'core-identity', label: 'Core Identity', icon: '🔮' },
    { id: 'life-purpose', label: 'Life Purpose', icon: '🎯' },
    { id: 'relationships', label: 'Relationships', icon: '💝' },
    { id: 'career', label: 'Career', icon: '🚀' },
    { id: 'growth', label: 'Growth', icon: '📈' },
    { id: 'spiritual', label: 'Spiritual', icon: '✨' },
    { id: 'integration', label: 'Integration', icon: '🧩' }
  ];

  const formatAspectName = (aspect: string): string => {
    return aspect.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatAspectType = (type: string): { label: string; color: string } => {
    const typeMap: { [key: string]: { label: string; color: string } } = {
      'harmonious': { label: 'Harmonious', color: 'bg-emerald-500' },
      'challenging': { label: 'Challenging', color: 'bg-red-500' },
      'neutral': { label: 'Neutral', color: 'bg-blue-500' },
      'powerful': { label: 'Powerful', color: 'bg-purple-500' }
    };
    return typeMap[type] || { label: type, color: 'bg-gray-500' };
  };

  interface Aspect {
    name: string;
    icon?: string;
    planets?: string[];
    type?: string;
    strength?: number;
    description?: string;
    keywords?: string[];
    influence?: string;
    advice?: string;
  }

  const renderAspectCard = (aspect: Aspect, index: number): JSX.Element => (
    <div key={index} className={cn(cardVariants({ variant: 'secondary' }), "relative")}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{aspect.icon || '⭐'}</span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {formatAspectName(aspect.name)}
            </h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className={cn(badgeVariants({ variant: 'secondary' }))}>
                {aspect.planets?.join(' - ') || 'N/A'}
              </span>
              {aspect.type && (
                <span className={cn(
                  badgeVariants({ variant: 'default' }),
                  formatAspectType(aspect.type).color
                )}>
                  {formatAspectType(aspect.type).label}
                </span>
              )}
            </div>
          </div>
        </div>
        {aspect.strength && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">Strength:</span>
            <div className="w-20 h-2 overflow-hidden rounded-full bg-slate-700">
              <div 
                className={cn(
                  "h-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500",
                  aspect.strength >= 9 ? "w-full" : 
                  aspect.strength >= 8 ? "w-11/12" :
                  aspect.strength >= 7 ? "w-5/6" :
                  aspect.strength >= 6 ? "w-4/6" :
                  aspect.strength >= 5 ? "w-3/6" :
                  aspect.strength >= 4 ? "w-2/6" :
                  aspect.strength >= 3 ? "w-1/6" : "w-1/12"
                )}
              />
            </div>
            <span className="text-sm font-medium text-white">
              {aspect.strength.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {aspect.description && (
          <p className="leading-relaxed text-slate-300">
            {aspect.description}
          </p>
        )}

        {aspect.keywords && aspect.keywords.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-slate-400">Key Themes:</h4>
            <div className="flex flex-wrap gap-2">
              {aspect.keywords.map((keyword: string, i: number) => (
                <span key={i} className={cn(badgeVariants({ variant: 'outline' }))}>
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {aspect.influence && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-slate-400">Influence:</h4>
            <p className="text-sm text-slate-300">{aspect.influence}</p>
          </div>
        )}

        {aspect.advice && (
          <div className="p-3 border rounded-lg bg-slate-800/50 border-slate-700">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-400 mt-0.5">💡</span>
              <div>
                <h4 className="mb-1 text-sm font-medium text-yellow-300">Guidance:</h4>
                <p className="text-sm text-slate-300">{aspect.advice}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const tabContent = {
    'core-identity': {
      title: 'Core Identity & Personality',
      description: 'Your fundamental nature and how you express yourself in the world',
      aspects: chartData?.interpretation?.core_identity || []
    },
    'life-purpose': {
      title: 'Life Purpose & Soul Mission',
      description: 'Your deeper calling and the path of growth in this lifetime',
      aspects: chartData?.interpretation?.life_purpose || []
    },
    'relationships': {
      title: 'Relationships & Love',
      description: 'How you connect with others and approach romantic partnerships',
      aspects: chartData?.interpretation?.relationships || []
    },
    'career': {
      title: 'Career & Vocation',
      description: 'Your professional path and how you contribute to the world',
      aspects: chartData?.interpretation?.career || []
    },
    'growth': {
      title: 'Personal Growth',
      description: 'Areas of development and life lessons to embrace',
      aspects: chartData?.interpretation?.growth || []
    },
    'spiritual': {
      title: 'Spiritual Path',
      description: 'Your connection to the divine and spiritual development',
      aspects: chartData?.interpretation?.spiritual || []
    },
    'integration': {
      title: 'Integration & Synthesis',
      description: 'How all aspects of your chart work together harmoniously',
      aspects: chartData?.interpretation?.integration || []
    }
  };

  const currentContent = tabContent[activeTab as keyof typeof tabContent];

  return (
    <FeatureGuard 
      feature="ai_interpretation"
      requiredTier="premium"
      upgradeMessage="Get deep insights into your astrological chart with AI-powered interpretation. Discover your core identity, life purpose, relationships, career guidance, and spiritual path."
    >
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text">
            AI Astrological Interpretation
          </h2>
          <p className="max-w-2xl mx-auto text-slate-400">
            Discover deep insights into your cosmic blueprint with AI-powered astrological analysis
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-7 gap-1 p-1 rounded-lg bg-slate-800/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                buttonVariants({ variant: activeTab === tab.id ? 'default' : 'ghost' }),
                "flex flex-col items-center p-3 text-xs font-medium transition-all duration-200",
                activeTab === tab.id 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" 
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              )}
            >
              <span className="mb-1 text-lg">{tab.icon}</span>
              <span className="leading-tight text-center">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="text-2xl font-bold text-white">{currentContent.title}</h3>
            <p className="text-slate-400">{currentContent.description}</p>
          </div>

          {currentContent.aspects && currentContent.aspects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {currentContent.aspects.map((aspect, index) => renderAspectCard(aspect, index))}
            </div>
          ) : (
            <div className={cn(cardVariants({ variant: 'default' }), "text-center py-12")}>
              <div className="mb-4 text-6xl">🔮</div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                Generating Insights...
              </h3>
              <p className="max-w-md mx-auto text-slate-400">
                AI interpretation for this section is being generated. 
                Please check back soon for personalized insights.
              </p>
            </div>
          )}
        </div>

        {/* Summary Section */}
        {chartData?.interpretation?.summary && (
          <div className={cn(cardVariants({ variant: 'default' }), "bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30")}>
            <div className="flex items-start mb-4 space-x-3">
              <span className="text-3xl">✨</span>
              <div>
                <h3 className="mb-2 text-xl font-bold text-white">Chart Summary</h3>
                <p className="leading-relaxed text-slate-300">
                  {chartData.interpretation.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Items */}
        {chartData?.interpretation?.action_items && chartData.interpretation.action_items.length > 0 && (
          <div className={cn(cardVariants({ variant: 'default' }))}>
            <h3 className="flex items-center mb-4 text-xl font-bold text-white">
              <span className="mr-2">🎯</span>
              Personalized Action Items
            </h3>
            <div className="space-y-3">
              {chartData.interpretation.action_items.map((item: string, index: number) => (
                <div key={index} className="flex items-start p-3 space-x-3 rounded-lg bg-slate-800/50">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <p className="text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FeatureGuard>
  );
};

export default AIInterpretation;
