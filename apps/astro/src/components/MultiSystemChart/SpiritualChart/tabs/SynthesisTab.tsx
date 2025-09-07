import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cosmichub/ui';
import type { SpiritualTabProps, SpiritualSynthesis } from '../utils/types';

/**
 * Synthesis Tab Component
 * Provides holistic overview and integration of all spiritual analysis aspects
 */
export const SynthesisTab: React.FC<SpiritualTabProps> = React.memo(function SynthesisTab({
  chartData,
  isLoading
}) {
  // Memoize synthesis calculations and data - moved to top to avoid conditional hooks
  const synthesisData = useMemo(() => {
    if (!chartData) return null;

    const { tarot, kabbalah, correspondences } = chartData;
    
    // Generate key insights from available data
    const insights: string[] = [];
    
    if (tarot?.daily_card) {
      insights.push(`Daily guidance through ${tarot.daily_card.name} card`);
    }
    
    if (tarot?.life_path) {
      insights.push(`Life path illuminated by ${tarot.life_path.card}`);
    }
    
    if (kabbalah?.primary_sephirah) {
      insights.push(`Primary spiritual focus: ${kabbalah.primary_sephirah.name} sphere`);
    }
    
    if (kabbalah?.spiritual_focus) {
      insights.push('Clear spiritual focus identified through Tree of Life analysis');
    }
    
    if (correspondences?.spiritual_center) {
      insights.push(`Spiritual center aligned with ${correspondences.spiritual_center.chakra} chakra`);
    }

    // Generate synthesis overview
    const synthesis: SpiritualSynthesis = {
      overall_theme: kabbalah?.spiritual_focus || 'Spiritual growth and self-discovery',
      key_insights: insights,
      spiritual_path: kabbalah?.tree_guidance || 'Journey of consciousness expansion through ancient wisdom',
      daily_practices: [
        'Morning meditation on your primary Sephirah',
        'Evening reflection with Tarot guidance',
        'Chakra balancing exercises',
        'Study of Kabbalistic principles'
      ],
      integration_guidance: [
        'Combine Tarot insights with Tree of Life understanding',
        'Use correspondences to enhance daily spiritual practice',
        'Balance receptive (Tarot) and active (Kabbalah) spiritual work',
        'Create personal ritual incorporating all systems'
      ],
      chakra_focus: correspondences?.spiritual_center?.chakra,
      primary_sephirah: kabbalah?.primary_sephirah?.name,
      guiding_tarot: tarot?.daily_card?.name
    };

    return synthesis;
  }, [chartData]);

  // Memoize spiritual development practices - moved to top to avoid conditional hooks
  const developmentPractices = useMemo(() => [
    {
      title: 'Daily Contemplation',
      description: 'Regular meditation and reflection practices',
      icon: '🧘',
      practices: [
        'Morning Sephirah meditation (10-15 minutes)',
        'Tarot card contemplation during meals',
        'Evening gratitude and reflection journal',
        'Breathing exercises aligned with Tree of Life'
      ]
    },
    {
      title: 'Weekly Study',
      description: 'Deeper exploration of spiritual systems',
      icon: '📚',
      practices: [
        'Study one Tarot card archetype in depth',
        'Research your primary Sephirah qualities',
        'Practice Tree of Life pathworking',
        'Learn Hebrew letters and their meanings'
      ]
    },
    {
      title: 'Monthly Rituals',
      description: 'Ceremonial practices for deeper integration',
      icon: '🕯️',
      practices: [
        'Full moon Tarot spread with Tree of Life positions',
        'New moon intention setting using correspondences',
        'Seasonal spiritual alignment ceremonies',
        'Personal sacred space consecration'
      ]
    }
  ], []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-cosmic-silver">Loading spiritual synthesis...</div>
      </div>
    );
  }

  if (!synthesisData) {
    return (
      <div className="text-cosmic-silver text-center py-8">
        <p>No synthesis data available</p>
        <p className="text-sm mt-2">Complete the spiritual analysis to see your holistic overview</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Spiritual Overview */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">🔮</span>
            Spiritual Synthesis Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-cosmic-gold font-semibold text-lg mb-3">Overall Theme</h3>
              <p className="text-cosmic-silver">{synthesisData.overall_theme}</p>
            </div>
            
            <div>
              <h3 className="text-cosmic-blue font-semibold text-lg mb-3">Spiritual Path</h3>
              <p className="text-cosmic-silver">{synthesisData.spiritual_path}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {synthesisData.primary_sephirah && (
                <div className="text-center p-4 bg-cosmic-purple/10 rounded-lg border border-cosmic-purple/20">
                  <h4 className="text-cosmic-purple font-medium">Primary Sephirah</h4>
                  <p className="text-cosmic-gold text-lg font-semibold">{synthesisData.primary_sephirah}</p>
                </div>
              )}
              
              {synthesisData.guiding_tarot && (
                <div className="text-center p-4 bg-cosmic-blue/10 rounded-lg border border-cosmic-blue/20">
                  <h4 className="text-cosmic-blue font-medium">Guiding Tarot</h4>
                  <p className="text-cosmic-gold text-lg font-semibold">{synthesisData.guiding_tarot}</p>
                </div>
              )}
              
              {synthesisData.chakra_focus && (
                <div className="text-center p-4 bg-cosmic-green/10 rounded-lg border border-cosmic-green/20">
                  <h4 className="text-cosmic-green font-medium">Chakra Focus</h4>
                  <p className="text-cosmic-gold text-lg font-semibold">{synthesisData.chakra_focus}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">💡</span>
            Key Spiritual Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {synthesisData.key_insights.length > 0 ? (
            <div className="space-y-3">
              {synthesisData.key_insights.map((insight, index) => (
                <div key={`insight-${index}`} className="flex items-start">
                  <span className="text-cosmic-gold mr-3 mt-1">▶</span>
                  <span className="text-cosmic-silver">{insight}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-cosmic-silver text-center py-4">
              Complete your spiritual analysis to generate personalized insights
            </div>
          )}
        </CardContent>
      </Card>

      {/* Development Practices */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">🌟</span>
            Spiritual Development Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {developmentPractices.map((practice, index) => (
              <div key={`practice-${index}`} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{practice.icon}</span>
                  <div>
                    <h4 className="text-cosmic-gold font-medium">{practice.title}</h4>
                    <p className="text-cosmic-silver text-sm">{practice.description}</p>
                  </div>
                </div>
                
                <div className="pl-6 space-y-1">
                  {practice.practices.map((item, itemIndex) => (
                    <div key={`practice-item-${index}-${itemIndex}`} className="flex items-start">
                      <span className="text-cosmic-purple mr-2 mt-1 text-xs">•</span>
                      <span className="text-cosmic-silver text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Guidance */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">🔗</span>
            Integration & Daily Practice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-cosmic-blue font-medium mb-3">Daily Practice Suggestions</h4>
              <div className="space-y-2">
                {synthesisData.daily_practices.map((practice, index) => (
                  <div key={`daily-${index}`} className="flex items-start">
                    <span className="text-cosmic-blue mr-2 mt-1">✓</span>
                    <span className="text-cosmic-silver text-sm">{practice}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-cosmic-purple font-medium mb-3">Integration Guidelines</h4>
              <div className="space-y-2">
                {synthesisData.integration_guidance.map((guidance, index) => (
                  <div key={`integration-${index}`} className="flex items-start">
                    <span className="text-cosmic-purple mr-2 mt-1">⚡</span>
                    <span className="text-cosmic-silver text-sm">{guidance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-cosmic-purple/10 to-cosmic-gold/10 rounded-lg border border-cosmic-purple/20">
            <h4 className="text-cosmic-gold font-medium mb-2">🌱 Growth Approach</h4>
            <p className="text-cosmic-silver text-sm">
              Spiritual development is a gradual process. Start with one practice that resonates most 
              strongly, then slowly incorporate others. Trust your intuition and allow your practice 
              to evolve naturally as you deepen your understanding of these ancient wisdom systems.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

SynthesisTab.displayName = 'SynthesisTab';
