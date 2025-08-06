import React, { useState } from 'react';
import FeatureGuard from './FeatureGuard';
import type { ChartData, AspectInterpretation } from '../types';
import { cn } from '../shared/utils-new';

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
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900/80 backdrop-blur-sm border-slate-700/50 rounded-lg border p-6 shadow-sm transition-colors">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-700 rounded"></div>
                <div className="h-3 bg-slate-700 rounded w-5/6"></div>
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

  const renderAspectCard = (aspect: AspectInterpretation, index: number): JSX.Element => (
    <div key={index} className="bg-slate-800/50 backdrop-blur-sm border-slate-600/50 rounded-lg border p-6 shadow-sm transition-colors relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{aspect.icon || '⭐'}</span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {formatAspectName(aspect.name)}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="bg-slate-600/50 text-slate-200 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors">
                {aspect.planets?.join(' - ') || 'N/A'}
              </span>
              {aspect.type && (
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                  formatAspectType(aspect.type).color,
                  "text-white"
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
            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300",
                  aspect.strength >= 8 ? "w-full" : 
                  aspect.strength >= 6 ? "w-4/5" :
                  aspect.strength >= 4 ? "w-3/5" :
                  aspect.strength >= 2 ? "w-2/5" : "w-1/5"
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
          <p className="text-slate-300 leading-relaxed">
            {aspect.description}
          </p>
        )}

        {aspect.keywords && aspect.keywords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Key Themes:</h4>
            <div className="flex flex-wrap gap-2">
              {aspect.keywords.map((keyword: string, i: number) => (
                <span key={i} className="border border-slate-600 text-slate-300 bg-transparent inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {aspect.influence && (
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Influence:</h4>
            <p className="text-sm text-slate-300">{aspect.influence}</p>
          </div>
        )}

        {aspect.advice && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-400 mt-0.5">💡</span>
              <div>
                <h4 className="text-sm font-medium text-yellow-300 mb-1">Guidance:</h4>
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
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            AI Astrological Interpretation
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Discover deep insights into your cosmic blueprint with AI-powered astrological analysis
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-7 bg-slate-800/50 rounded-lg p-1 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center p-3 text-xs font-medium transition-all duration-200 rounded-md",
                activeTab === tab.id 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" 
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              )}
            >
              <span className="text-lg mb-1">{tab.icon}</span>
              <span className="text-center leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white">{currentContent.title}</h3>
            <p className="text-slate-400">{currentContent.description}</p>
          </div>

          {currentContent.aspects && currentContent.aspects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {currentContent.aspects.map((aspect, index) => renderAspectCard(aspect, index))}
            </div>
          ) : (
            <div className="bg-slate-900/80 backdrop-blur-sm border-slate-700/50 rounded-lg border p-6 shadow-sm transition-colors text-center py-12">
              <div className="text-6xl mb-4">🔮</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Generating Insights...
              </h3>
              <p className="text-slate-400 max-w-md mx-auto">
                AI interpretation for this section is being generated. 
                Please check back soon for personalized insights.
              </p>
            </div>
          )}
        </div>

        {/* Summary Section */}
        {chartData?.interpretation?.summary && (
          <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-purple-500/30 rounded-lg border p-6 shadow-sm transition-colors">
            <div className="flex items-start space-x-3 mb-4">
              <span className="text-3xl">✨</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Chart Summary</h3>
                <p className="text-slate-300 leading-relaxed">
                  {chartData.interpretation.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Items */}
        {chartData?.interpretation?.action_items && chartData.interpretation.action_items.length > 0 && (
          <div className="bg-slate-900/80 backdrop-blur-sm border-slate-700/50 rounded-lg border p-6 shadow-sm transition-colors">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Personalized Action Items
            </h3>
            <div className="space-y-3">
              {chartData.interpretation.action_items.map((item: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-slate-800/50 rounded-lg">
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
