import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Progress from '@radix-ui/react-progress';
import * as Separator from '@radix-ui/react-separator';
import { InfoIcon } from '@radix-ui/react-icons';
import FeatureGuard from './FeatureGuard';
import type { ChartData } from '../types';
import { cn, cardVariants, badgeVariants, buttonVariants } from '../shared/utils';

interface AIInterpretationProps {
  chartData: ChartData;
}

interface AIInterpretationResult {
  core_identity: {
    sun_identity: {
      sign: string;
      house: number;
      description: string;
      archetype: string;
      element: string;
      quality: string;
    };
    moon_nature: {
      sign: string;
      house: number;
      description: string;
      needs: string;
    };
    rising_persona: {
      sign: string;
      description: string;
    };
    integration_challenge: string;
  };
  life_purpose: {
    soul_purpose: {
      north_node_sign: string;
      growth_direction: string;
    };
    career_calling: {
      mc_sign: string;
      public_expression: string;
    };
    creative_purpose: {
      sun_expression: string;
    };
    expansion_path: {
      jupiter_gifts: string;
    };
    life_mission: string;
  };
  relationship_patterns: {
    love_style: {
      venus_sign: string;
      venus_house: number;
      attraction_style: string;
      love_needs: string;
    };
    passion_style: {
      mars_sign: string;
      mars_house: number;
      action_style: string;
      desire_nature: string;
    };
    partnership_karma: {
      seventh_house_sign: string;
      partner_qualities: string;
      relationship_lessons: string;
    };
    compatibility_keys: string[];
  };
  career_path: {
    career_direction: {
      mc_sign: string;
      natural_calling: string;
    };
    mastery_path: {
      saturn_sign: string;
      saturn_house: number;
      discipline_area: string;
    };
    leadership_style: {
      sun_influence: string;
    };
    success_formula: string;
  };
  growth_challenges: {
    saturn_lessons: {
      saturn_sign: string;
      saturn_house: number;
      mastery_challenge: string;
      growth_timeline: string;
    };
    key_challenges: Array<{
      aspect: string;
      planets: string;
      challenge: string;
      growth_opportunity: string;
    }>;
    integration_work: {
      primary_tension: string;
      resolution_path: string[];
    };
    empowerment_potential: {
      hidden_strengths: string[];
      transformation_gifts: string[];
    };
  };
  spiritual_gifts: {
    psychic_abilities: {
      twelfth_house_sign: string;
      intuitive_gifts: string;
      spiritual_planets: string[];
    };
    mystical_nature: {
      neptune_sign: string;
      neptune_house: number;
      spiritual_path: string;
    };
    transformation_power: {
      pluto_sign: string;
      pluto_house: number;
      healing_gifts: string;
    };
    service_mission: string;
  };
  integration_themes: {
    elemental_balance: {
      distribution: Record<string, number>;
      dominant_element: string;
      missing_elements: string[];
      integration_focus: string;
    };
    modal_balance: {
      distribution: Record<string, number>;
      dominant_quality: string;
      integration_need: string;
    };
    focal_planets: {
      most_aspected: Array<[string, number]>;
      integration_priority: string;
    };
    overall_theme: string;
  };
}

export const AIInterpretation: React.FC<AIInterpretationProps> = ({ chartData }) => {
  const [interpretation, setInterpretation] = useState<AIInterpretationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInterpretation = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-interpretation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chart_data: chartData,
          interpretation_type: 'advanced'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI interpretation');
      }

      const data = await response.json();
      setInterpretation(data.interpretation);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getElementColor = (element: string): 'fire' | 'earth' | 'air' | 'water' | 'default' => {
    switch (element) {
      case 'fire': return 'fire';
      case 'earth': return 'earth';
      case 'air': return 'air';
      case 'water': return 'water';
      default: return 'default';
    }
  };

  const formatSign = (sign: string): string => {
    return sign ? sign.charAt(0).toUpperCase() + sign.slice(1) : 'Unknown';
  };

  return (
    <FeatureGuard requiredTier="elite" feature="ai_interpretation">
      <div className="max-w-7xl mx-auto py-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-purple-400">
            🧠 AI-Powered Astrological Analysis
          </h1>
          <p className="text-lg text-white/80">
            Advanced artificial intelligence interpretation of your birth chart
          </p>
        </div>

        <div className={cn(cardVariants.cosmic, 'p-6')}>
          <div className="space-y-4">
            <p className="text-white/90">
              Our AI analyzes your complete birth chart to provide deep, personalized insights 
              into your personality, life purpose, relationships, and spiritual path.
            </p>

            {!interpretation && (
              <button
                className={cn(buttonVariants.base, buttonVariants.primary, 'flex items-center space-x-2')}
                onClick={generateInterpretation}
                disabled={loading}
              >
                <InfoIcon className="w-4 h-4" />
                <span>{loading ? 'Analyzing chart...' : 'Generate AI Interpretation'}</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 flex items-center space-x-2">
            <div className="text-red-400">⚠️</div>
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {interpretation && (
          <Tabs.Root defaultValue="core-identity" className="space-y-4">
            <Tabs.List className="grid w-full grid-cols-7 bg-slate-800/50 rounded-lg p-1 gap-1">
              <Tabs.Trigger 
                value="core-identity"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/70 hover:text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-colors"
              >
                Core Identity
              </Tabs.Trigger>
              <Tabs.Trigger 
                value="life-purpose"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/70 hover:text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-colors"
              >
                Life Purpose
              </Tabs.Trigger>
              <Tabs.Trigger 
                value="relationships"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/70 hover:text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-colors"
              >
                Relationships
              </Tabs.Trigger>
              <Tabs.Trigger 
                value="career"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/70 hover:text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-colors"
              >
                Career Path
              </Tabs.Trigger>
              <Tabs.Trigger 
                value="growth"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/70 hover:text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-colors"
              >
                Growth
              </Tabs.Trigger>
              <Tabs.Trigger 
                value="spiritual"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/70 hover:text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-colors"
              >
                Spiritual Gifts
              </Tabs.Trigger>
              <Tabs.Trigger 
                value="integration"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/70 hover:text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-colors"
              >
                Integration
              </Tabs.Trigger>
            </Tabs.List>

            {/* Core Identity Tab */}
            <Tabs.Content value="core-identity" className="space-y-6">
              {/* Big Three */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={cn(cardVariants.cosmic, 'overflow-hidden')}>
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-orange-400">☉ Sun Identity</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className={cn(badgeVariants.base, badgeVariants[getElementColor(interpretation.core_identity.sun_identity.element)])}>
                        {formatSign(interpretation.core_identity.sun_identity.sign)}
                      </span>
                      <span className="text-sm text-white/70">House {interpretation.core_identity.sun_identity.house}</span>
                    </div>
                    <p className="text-sm font-semibold text-white/90">
                      {interpretation.core_identity.sun_identity.archetype}
                    </p>
                    <p className="text-sm text-white/80">
                      {interpretation.core_identity.sun_identity.description}
                    </p>
                  </div>
                </div>

                <div className={cn(cardVariants.cosmic, 'overflow-hidden')}>
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-blue-400">☽ Moon Nature</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className={cn(badgeVariants.base, badgeVariants.air)}>
                        {formatSign(interpretation.core_identity.moon_nature.sign)}
                      </span>
                      <span className="text-sm text-white/70">House {interpretation.core_identity.moon_nature.house}</span>
                    </div>
                    <p className="text-sm text-white/80">
                      {interpretation.core_identity.moon_nature.description}
                    </p>
                    <div>
                      <p className="text-xs font-semibold text-blue-400">Emotional Needs:</p>
                      <p className="text-xs text-white/70">{interpretation.core_identity.moon_nature.needs}</p>
                    </div>
                  </div>
                </div>

                <div className={cn(cardVariants.cosmic, 'overflow-hidden')}>
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-green-400">↗ Rising Persona</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <span className={cn(badgeVariants.base, badgeVariants.earth)}>
                      {formatSign(interpretation.core_identity.rising_persona.sign)}
                    </span>
                    <p className="text-sm text-white/80">
                      {interpretation.core_identity.rising_persona.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Integration Challenge */}
              <div className={cn(cardVariants.cosmic, 'border-l-4 border-purple-400')}>
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-3 text-purple-400">Integration Challenge</h3>
                  <p className="text-white/90">{interpretation.core_identity.integration_challenge}</p>
                </div>
              </div>
            </Tabs.Content>

            {/* Life Purpose Tab */}
            <Tabs.Content value="life-purpose" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={cn(cardVariants.cosmic, 'overflow-hidden')}>
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold">🎯 Soul Purpose</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-white/90">North Node:</span>
                      <span className={cn(badgeVariants.base, badgeVariants.purple)}>
                        {formatSign(interpretation.life_purpose.soul_purpose.north_node_sign)}
                      </span>
                    </div>
                    <p className="text-sm text-white/80">
                      {interpretation.life_purpose.soul_purpose.growth_direction}
                    </p>
                  </div>
                </div>

                <div className={cn(cardVariants.cosmic, 'overflow-hidden')}>
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold">🏢 Career Calling</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-white/90">Midheaven:</span>
                      <span className={cn(badgeVariants.base, badgeVariants.orange)}>
                        {formatSign(interpretation.life_purpose.career_calling.mc_sign)}
                      </span>
                    </div>
                    <p className="text-sm text-white/80">
                      {interpretation.life_purpose.career_calling.public_expression}
                    </p>
                  </div>
                </div>
              </div>

              <div className={cn(cardVariants.cosmic, 'overflow-hidden')}>
                <div className="p-4 border-b border-slate-700">
                  <h3 className="text-lg font-semibold">✨ Creative Purpose</h3>
                </div>
                <div className="p-4">
                  <p className="text-white/90">{interpretation.life_purpose.creative_purpose.sun_expression}</p>
                </div>
              </div>

              <div className={cn(cardVariants.cosmic, 'overflow-hidden')}>
                <div className="p-4 border-b border-slate-700">
                  <h3 className="text-lg font-semibold">🌟 Expansion Path</h3>
                </div>
                <div className="p-4">
                  <p className="text-white/90">{interpretation.life_purpose.expansion_path.jupiter_gifts}</p>
                </div>
              </div>

              <div className={cn(cardVariants.cosmic, 'border-l-4 border-yellow-400')}>
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-3 text-yellow-400">Life Mission</h3>
                  <p className="font-semibold text-white/90">{interpretation.life_purpose.life_mission}</p>
                </div>
              </div>
            </Tabs.Content>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-6">
              <button
                className={cn(buttonVariants.base, buttonVariants.outline)}
                onClick={generateInterpretation}
                disabled={loading}
              >
                Regenerate Analysis
              </button>
              <button
                className={cn(buttonVariants.base, buttonVariants.outline)}
                onClick={() => window.print()}
              >
                Print Report
              </button>
            </div>
          </Tabs.Root>
        )}
      </div>
    </FeatureGuard>
  );
};
