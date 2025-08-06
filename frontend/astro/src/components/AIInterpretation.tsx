import React, { useState } from 'react';
import { useToast } from './ToastProvider';
import * as Tabs from '@radix-ui/react-tabs';
import * as Accordion from '@radix-ui/react-accordion';
import { FaStar, FaInfoCircle } from 'react-icons/fa';
import FeatureGuard from './FeatureGuard';
import type { ChartData } from '../types';

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
  const { toast } = useToast();

  const generateInterpretation = async () => {
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

      toast({
        title: 'AI Interpretation Generated',
        description: 'Your chart analysis is ready!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast({
        title: 'Generation Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatSign = (sign: string) => sign.charAt(0).toUpperCase() + sign.slice(1);

  const getElementColor = (element: string) => {
    switch (element.toLowerCase()) {
      case 'fire': return 'red-500';
      case 'earth': return 'green-500';
      case 'air': return 'blue-500';
      case 'water': return 'cyan-500';
      default: return 'gray-500';
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto text-4xl text-purple-500 animate-spin">⭐</div>
        <p className="mt-4 text-cosmic-silver">Generating AI interpretation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-500 rounded-md bg-red-900/50">
        <div className="flex space-x-4">
          <span className="text-xl text-red-500">⚠️</span>
          {error}
        </div>
      </div>
    );
  }

  return (
    <FeatureGuard requiredTier="premium" feature="ai_interpretation">
      <div className="flex flex-col space-y-6">
        {!interpretation ? (
          <button
            className="cosmic-button"
            onClick={generateInterpretation}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate AI Interpretation'}
          </button>
        ) : (
          <div className="cosmic-card">
            <Tabs.Root>
              <Tabs.List className="flex flex-wrap border-b border-cosmic-silver/30">
                <Tabs.Trigger value="core" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Core Identity</Tabs.Trigger>
                <Tabs.Trigger value="purpose" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Life Purpose</Tabs.Trigger>
                <Tabs.Trigger value="relationships" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Relationships</Tabs.Trigger>
                <Tabs.Trigger value="career" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Career Path</Tabs.Trigger>
                <Tabs.Trigger value="challenges" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Growth Challenges</Tabs.Trigger>
                <Tabs.Trigger value="spiritual" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Spiritual Gifts</Tabs.Trigger>
                <Tabs.Trigger value="integration" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Integration Themes</Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="core" className="p-4">
                <div className="flex flex-col space-y-6">
                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Sun Identity</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-cosmic-silver">Sign</p>
                        <p className="font-bold">{formatSign(interpretation.core_identity.sun_identity.sign)}</p>
                      </div>
                      <div>
                        <p className="text-cosmic-silver">House</p>
                        <p className="font-bold">{interpretation.core_identity.sun_identity.house}</p>
                      </div>
                      <div>
                        <p className="text-cosmic-silver">Element</p>
                        <p className="font-bold">{interpretation.core_identity.sun_identity.element}</p>
                      </div>
                      <div>
                        <p className="text-cosmic-silver">Quality</p>
                        <p className="font-bold">{interpretation.core_identity.sun_identity.quality}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-cosmic-silver">{interpretation.core_identity.sun_identity.description}</p>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Moon Nature</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-cosmic-silver">Sign</p>
                        <p className="font-bold">{formatSign(interpretation.core_identity.moon_nature.sign)}</p>
                      </div>
                      <div>
                        <p className="text-cosmic-silver">House</p>
                        <p className="font-bold">{interpretation.core_identity.moon_nature.house}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-cosmic-silver">{interpretation.core_identity.moon_nature.description}</p>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Rising Persona</h3>
                    <p className="font-bold">{formatSign(interpretation.core_identity.rising_persona.sign)}</p>
                    <p className="mt-2 text-cosmic-silver">{interpretation.core_identity.rising_persona.description}</p>
                  </div>

                  <div className="p-4 rounded-lg cosmic-card bg-purple-500/20">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Integration Challenge</h3>
                    <p className="text-cosmic-silver">{interpretation.core_identity.integration_challenge}</p>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="purpose" className="p-4">
                <div className="flex flex-col space-y-6">
                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Soul Purpose</h3>
                    <p className="font-bold">{formatSign(interpretation.life_purpose.soul_purpose.north_node_sign)}</p>
                    <p className="mt-2 text-cosmic-silver">{interpretation.life_purpose.soul_purpose.growth_direction}</p>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Career Calling</h3>
                    <p className="font-bold">{formatSign(interpretation.life_purpose.career_calling.mc_sign)}</p>
                    <p className="mt-2 text-cosmic-silver">{interpretation.life_purpose.career_calling.public_expression}</p>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Creative Purpose</h3>
                    <p className="text-cosmic-silver">{interpretation.life_purpose.creative_purpose.sun_expression}</p>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Expansion Path</h3>
                    <p className="text-cosmic-silver">{interpretation.life_purpose.expansion_path.jupiter_gifts}</p>
                  </div>

                  <div className="p-4 rounded-lg cosmic-card bg-purple-500/20">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Life Mission</h3>
                    <p className="text-cosmic-silver">{interpretation.life_purpose.life_mission}</p>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="relationships" className="p-4">
                <div className="flex flex-col space-y-6">
                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Love Style</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-cosmic-silver">Sign</p>
                        <p className="font-bold">{formatSign(interpretation.relationship_patterns.love_style.venus_sign)}</p>
                      </div>
                      <div>
                        <p className="text-cosmic-silver">House</p>
                        <p className="font-bold">{interpretation.relationship_patterns.love_style.venus_house}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-cosmic-silver">{interpretation.relationship_patterns.love_style.attraction_style}</p>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Passion Style</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-cosmic-silver">Sign</p>
                        <p className="font-bold">{formatSign(interpretation.relationship_patterns.passion_style.mars_sign)}</p>
                      </div>
                      <div>
                        <p className="text-cosmic-silver">House</p>
                        <p className="font-bold">{interpretation.relationship_patterns.passion_style.mars_house}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-cosmic-silver">{interpretation.relationship_patterns.passion_style.action_style}</p>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Partnership Karma</h3>
                    <p className="font-bold">{formatSign(interpretation.relationship_patterns.partnership_karma.seventh_house_sign)}</p>
                    <p className="mt-2 text-cosmic-silver">{interpretation.relationship_patterns.partnership_karma.partner_qualities}</p>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Compatibility Keys</h3>
                    <div className="flex flex-wrap space-x-2">
                      {interpretation.relationship_patterns.compatibility_keys.map((key, index) => (
                        <span key={index} className="px-2 py-1 text-sm rounded bg-cosmic-purple/20 text-cosmic-purple">
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="career" className="p-4">
                <div className="flex flex-col space-y-6">
                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Career Direction</h3>
                    <p className="font-bold">{formatSign(interpretation.career_path.career_direction.mc_sign)}</p>
                    <p className="mt-2 text-cosmic-silver">{interpretation.career_path.career_direction.natural_calling}</p>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Mastery Path</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-cosmic-silver">Sign</p>
                        <p className="font-bold">{formatSign(interpretation.career_path.mastery_path.saturn_sign)}</p>
                      </div>
                      <div>
                        <p className="text-cosmic-silver">House</p>
                        <p className="font-bold">{interpretation.career_path.mastery_path.saturn_house}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-cosmic-silver">{interpretation.career_path.mastery_path.discipline_area}</p>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Leadership Style</h3>
                    <p className="text-cosmic-silver">{interpretation.career_path.leadership_style.sun_influence}</p>
                  </div>

                  <div className="p-4 rounded-lg cosmic-card bg-purple-500/20">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Success Formula</h3>
                    <p className="text-cosmic-silver">{interpretation.career_path.success_formula}</p>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="challenges" className="p-4">
                <div className="flex flex-col space-y-6">
                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Saturn Lessons</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-cosmic-silver">Sign</p>
                        <p className="font-bold">{formatSign(interpretation.growth_challenges.saturn_lessons.saturn_sign)}</p>
                      </div>
                      <div>
                        <p className="text-cosmic-silver">House</p>
                        <p className="font-bold">{interpretation.growth_challenges.saturn_lessons.saturn_house}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-cosmic-silver">{interpretation.growth_challenges.saturn_lessons.mastery_challenge}</p>
                    <p className="mt-2 text-cosmic-silver">{interpretation.growth_challenges.saturn_lessons.growth_timeline}</p>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Key Challenges</h3>
                    <Accordion.Root type="single" collapsible>
                      {interpretation.growth_challenges.key_challenges.map((challenge, index) => (
                        <Accordion.Item value={index.toString()} key={index}>
                          <Accordion.Trigger className="flex justify-between w-full">
                            <span className="font-bold">{challenge.aspect}: {challenge.planets}</span>
                            <Accordion.Icon />
                          </Accordion.Trigger>
                          <Accordion.Content className="pb-4">
                            <p className="mb-2 text-cosmic-silver">{challenge.challenge}</p>
                            <p className="text-cosmic-silver">{challenge.growth_opportunity}</p>
                          </Accordion.Content>
                        </Accordion.Item>
                      ))}
                    </Accordion.Root>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Integration Work</h3>
                    <p className="mb-2 text-cosmic-silver">{interpretation.growth_challenges.integration_work.primary_tension}</p>
                    <div className="flex flex-col space-y-2">
                      {interpretation.growth_challenges.integration_work.resolution_path.map((path, index) => (
                        <p key={index} className="text-cosmic-silver">{path}</p>
                      ))}
                    </div>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Empowerment Potential</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="mb-2 font-bold text-cosmic-silver">Hidden Strengths</p>
                        <div className="flex flex-col space-y-2">
                          {interpretation.growth_challenges.empowerment_potential.hidden_strengths.map((strength, index) => (
                            <p key={index} className="text-cosmic-silver">{strength}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 font-bold text-cosmic-silver">Transformation Gifts</p>
                        <div className="flex flex-col space-y-2">
                          {interpretation.growth_challenges.empowerment_potential.transformation_gifts.map((gift, index) => (
                            <p key={index} className="text-cosmic-silver">{gift}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="spiritual" className="p-4">
                <div className="flex flex-col space-y-6">
                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Psychic Abilities</h3>
                    <p className="font-bold">{formatSign(interpretation.spiritual_gifts.psychic_abilities.twelfth_house_sign)}</p>
                    <p className="mt-2 text-cosmic-silver">{interpretation.spiritual_gifts.psychic_abilities.intuitive_gifts}</p>
                    <div className="flex flex-wrap mt-2 space-x-2">
                      {interpretation.spiritual_gifts.psychic_abilities.spiritual_planets.map((planet, index) => (
                        <span key={index} className="px-2 py-1 text-sm rounded bg-cosmic-purple/20 text-cosmic-purple">
                          {planet}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Mystical Nature</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-cosmic-silver">Sign</p>
                        <p className="font-bold">{formatSign(interpretation.spiritual_gifts.mystical_nature.neptune_sign)}</p>
                      </div>
                      <div>
                        <p className="text-cosmic-silver">House</p>
                        <p className="font-bold">{interpretation.spiritual_gifts.mystical_nature.neptune_house}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-cosmic-silver">{interpretation.spiritual_gifts.mystical_nature.spiritual_path}</p>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Transformation Power</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-cosmic-silver">Sign</p>
                        <p className="font-bold">{formatSign(interpretation.spiritual_gifts.transformation_power.pluto_sign)}</p>
                      </div>
                      <div>
                        <p className="text-cosmic-silver">House</p>
                        <p className="font-bold">{interpretation.spiritual_gifts.transformation_power.pluto_house}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-cosmic-silver">{interpretation.spiritual_gifts.transformation_power.healing_gifts}</p>
                  </div>

                  <div className="p-4 rounded-lg cosmic-card bg-purple-500/20">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Service Mission</h3>
                    <p className="text-cosmic-silver">{interpretation.spiritual_gifts.service_mission}</p>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="integration" className="p-4">
                <div className="flex flex-col space-y-6">
                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Elemental Balance</h3>
                    <div className="flex flex-col space-y-4">
                      {Object.entries(interpretation.integration_themes.elemental_balance.distribution).map(([element, count]) => (
                        <div key={element}>
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold capitalize text-cosmic-silver">{element}</span>
                            <span className="text-cosmic-silver">{count} planets</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className={`bg-${getElementColor(element)} h-2.5 rounded-full`} style={{ width: `${(count / 10) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                      <hr className="border-cosmic-silver/30" />
                      <p className="text-cosmic-silver">
                        <strong>Dominant:</strong> {formatSign(interpretation.integration_themes.elemental_balance.dominant_element)}
                      </p>
                      <p className="text-cosmic-silver">
                        <strong>Integration Focus:</strong> {interpretation.integration_themes.elemental_balance.integration_focus}
                      </p>
                    </div>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Modal Balance</h3>
                    <div className="flex flex-col space-y-4">
                      {Object.entries(interpretation.integration_themes.modal_balance.distribution).map(([quality, count]) => (
                        <div key={quality}>
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold capitalize text-cosmic-silver">{quality}</span>
                            <span className="text-cosmic-silver">{count} planets</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(count / 10) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                      <hr className="border-cosmic-silver/30" />
                      <p className="text-cosmic-silver">
                        <strong>Dominant:</strong> {formatSign(interpretation.integration_themes.modal_balance.dominant_quality)}
                      </p>
                      <p className="text-cosmic-silver">
                        <strong>Integration Need:</strong> {interpretation.integration_themes.modal_balance.integration_need}
                      </p>
                    </div>
                  </div>

                  <div className="cosmic-card">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Focal Planets</h3>
                    <p className="mb-2 text-cosmic-silver">Planets with the most aspects (most important for integration):</p>
                    <div className="flex flex-wrap space-x-2">
                      {interpretation.integration_themes.focal_planets.most_aspected.map(([planet, count], index) => (
                        <span key={index} className="px-2 py-1 text-sm rounded bg-cosmic-purple/20 text-cosmic-purple">
                          {formatSign(planet)}: {count} aspects
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-cosmic-silver">
                      <strong>Integration Priority:</strong> {interpretation.integration_themes.focal_planets.integration_priority}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg cosmic-card bg-purple-500/20">
                    <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Overall Integration Theme</h3>
                    <p className="text-cosmic-silver">{interpretation.integration_themes.overall_theme}</p>
                  </div>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        )}

        {/* Action Buttons */}
        {interpretation && (
          <div className="flex justify-center space-x-4">
            <button
              className="px-4 py-2 text-purple-500 transition-colors border border-purple-500 rounded bg-purple-500/20 hover:bg-purple-500/30"
              onClick={generateInterpretation}
              disabled={loading}
            >
              Regenerate Analysis
            </button>
            <button
              className="px-4 py-2 text-blue-500 transition-colors border border-blue-500 rounded bg-blue-500/20 hover:bg-blue-500/30"
              onClick={() => window.print()}
            >
              Print Report
            </button>
          </div>
        )}
      </div>
    </FeatureGuard>
  );
};