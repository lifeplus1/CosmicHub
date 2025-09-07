import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cosmichub/ui';
import type { TCMTabProps } from '../utils/types';

/**
 * Synthesis Tab Component
 * Provides holistic overview and integration of all TCM analysis aspects
 */
export const SynthesisTab: React.FC<TCMTabProps> = React.memo(({ chartData }) => {
  // Memoize synthesis calculations
  const synthesisData = useMemo(() => {
    if (!chartData) return null;

    const { constitution, elements, meridians, health } = chartData;
    
    // Calculate overall balance score
    let elementBalance = 0;
    let elementArray: Array<{ name: string; value: number }> = [];
    
    if (elements) {
      elementArray = [
        { name: 'Wood', value: elements.wood },
        { name: 'Fire', value: elements.fire },
        { name: 'Earth', value: elements.earth },
        { name: 'Metal', value: elements.metal },
        { name: 'Water', value: elements.water }
      ];
      
      elementBalance = elementArray.reduce((acc: number, element) => {
        const percentage = element.value || 0;
        const ideal = 20; // Ideal 20% for each element
        const deviation = Math.abs(percentage - ideal);
        return acc + (20 - deviation);
      }, 0);
    }

    const maxElementBalance = 100;
    const balanceScore = Math.round((elementBalance / maxElementBalance) * 100);

    // Identify dominant and deficient patterns
    const sortedElements = elementArray
      .sort((a, b) => (b.value || 0) - (a.value || 0));
    
    const dominant = sortedElements[0];
    const deficient = sortedElements[sortedElements.length - 1];

    // Generate key insights
    const insights: string[] = [];
    
    if (constitution?.primaryType) {
      insights.push(`Primary constitution type: ${constitution.primaryType}`);
    }
    
    if (dominant?.name && (dominant.value || 0) > 25) {
      insights.push(`${dominant.name} element shows dominance (${dominant.value}%)`);
    }
    
    if (deficient?.name && (deficient.value || 0) < 15) {
      insights.push(`${deficient.name} element may need support (${deficient.value}%)`);
    }

    if (balanceScore < 70) {
      insights.push('Significant elemental imbalances detected');
    } else if (balanceScore > 85) {
      insights.push('Good overall elemental harmony');
    }

    return {
      balanceScore,
      dominant,
      deficient,
      insights,
      constitution: constitution?.primaryType ?? 'Unknown',
      hasData: Boolean(constitution ?? elements ?? meridians ?? health)
    };
  }, [chartData]);

  // Memoize TCM integration principles (must be called before conditional returns)
  const integrationPrinciples = useMemo(() => [
    {
      title: 'Holistic Unity',
      description: 'All body systems are interconnected and influence each other',
      icon: '🔗'
    },
    {
      title: 'Dynamic Balance',
      description: 'Health is maintained through constant adjustment and harmony',
      icon: '⚖️'
    },
    {
      title: 'Root and Branch',
      description: 'Address underlying causes while managing surface symptoms',
      icon: '🌳'
    },
    {
      title: 'Natural Harmony',
      description: 'Align with natural rhythms and environmental influences',
      icon: '🌿'
    }
  ], []);

  if (!synthesisData?.hasData) {
    return (
      <div className="text-cosmic-silver text-center py-8">
        <p>No synthesis data available</p>
        <p className="text-sm mt-2">Complete the analysis to see your holistic overview</p>
      </div>
    );
  }

  const getBalanceColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBalanceLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Moderate';
    return 'Needs Attention';
  };

  return (
    <div className="space-y-6">
      {/* Overall Assessment */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">🎯</span>
            Holistic TCM Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Balance Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getBalanceColor(synthesisData.balanceScore)}`}>
                {synthesisData.balanceScore}%
              </div>
              <div className="text-cosmic-silver text-sm mt-1">Overall Balance</div>
              <div className={`text-sm mt-2 ${getBalanceColor(synthesisData.balanceScore)}`}>
                {getBalanceLabel(synthesisData.balanceScore)}
              </div>
            </div>

            {/* Constitution Type */}
            <div className="text-center">
              <div className="text-2xl font-bold text-cosmic-gold">
                {synthesisData.constitution}
              </div>
              <div className="text-cosmic-silver text-sm mt-1">Primary Constitution</div>
              <div className="text-sm mt-2 text-cosmic-silver">
                Base energetic pattern
              </div>
            </div>

            {/* Dominant Element */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {synthesisData.dominant?.name ?? 'N/A'}
              </div>
              <div className="text-cosmic-silver text-sm mt-1">Dominant Element</div>
              <div className="text-sm mt-2 text-cosmic-silver">
                {synthesisData.dominant?.value ?? 0}% influence
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">💡</span>
            Key Insights & Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {synthesisData.insights.length > 0 ? (
            <div className="space-y-3">
              {synthesisData.insights.map((insight, index) => (
                <div key={`insight-${index}`} className="flex items-start">
                  <span className="text-cosmic-gold mr-3 mt-1">▶</span>
                  <span className="text-cosmic-silver">{insight}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-cosmic-silver text-center py-4">
              Complete your analysis to generate personalized insights
            </div>
          )}

          <div className="mt-6 p-4 bg-cosmic-blue/10 rounded-lg border border-cosmic-blue/20">
            <h4 className="text-cosmic-blue font-medium mb-2">📊 Pattern Recognition</h4>
            <p className="text-cosmic-silver text-sm">
              TCM analysis identifies energetic patterns that may manifest as physical, 
              emotional, or lifestyle tendencies. These insights guide personalized 
              approaches to maintaining or restoring balance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integration Framework */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title">TCM Integration Principles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {integrationPrinciples.map((principle, index) => (
              <div key={`principle-${index}`} className="flex items-start space-x-3">
                <span className="text-2xl">{principle.icon}</span>
                <div>
                  <h4 className="text-cosmic-gold font-medium">{principle.title}</h4>
                  <p className="text-cosmic-silver text-sm mt-1">{principle.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Summary */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">🌟</span>
            Integrated Wellness Approach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-green-400 font-medium mb-2">🎭 Constitutional Harmony</h4>
              <p className="text-cosmic-silver text-sm">
                Work with your natural constitution ({synthesisData.constitution}) rather than against it. 
                Your inherent patterns provide the foundation for optimal wellness strategies.
              </p>
            </div>

            <div>
              <h4 className="text-blue-400 font-medium mb-2">🔄 Elemental Balance</h4>
              <p className="text-cosmic-silver text-sm">
                {synthesisData.balanceScore >= 85 ? (
                  'Maintain your excellent elemental balance through consistent practices and seasonal awareness.'
                ) : synthesisData.balanceScore >= 70 ? (
                  'Fine-tune your elemental harmony by addressing minor imbalances through diet and lifestyle adjustments.'
                ) : (
                  'Focus on rebalancing your five elements through targeted dietary changes, appropriate exercise, and stress management.'
                )}
              </p>
            </div>

            <div>
              <h4 className="text-purple-400 font-medium mb-2">🌊 Energy Flow</h4>
              <p className="text-cosmic-silver text-sm">
                Support healthy qi circulation through your meridian channels with appropriate movement, 
                breathing practices, and acupressure techniques suited to your constitution.
              </p>
            </div>

            <div>
              <h4 className="text-yellow-400 font-medium mb-2">🌱 Lifestyle Integration</h4>
              <p className="text-cosmic-silver text-sm">
                Integrate TCM principles gradually into your daily routine. Small, consistent changes 
                aligned with natural rhythms create lasting improvements in overall well-being.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-cosmic-purple/10 to-cosmic-blue/10 rounded-lg border border-cosmic-purple/20">
            <h4 className="text-cosmic-purple font-medium mb-2">🔮 Next Steps</h4>
            <div className="space-y-2 text-sm text-cosmic-silver">
              <div>• Review individual tabs for detailed recommendations</div>
              <div>• Start with one or two changes that resonate most strongly</div>
              <div>• Monitor how adjustments affect your energy and well-being</div>
              <div>• Consider consulting with a qualified TCM practitioner for deeper guidance</div>
              <div>• Reassess your patterns seasonally as your needs evolve</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

SynthesisTab.displayName = 'SynthesisTab';
