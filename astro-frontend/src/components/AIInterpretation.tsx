import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Grid,
  GridItem,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  useToast,
  Divider
} from '@chakra-ui/react';
import { InfoIcon, StarIcon } from '@chakra-ui/icons';
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

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

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
        description: 'Your personalized astrological analysis is ready.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: 'AI Interpretation Failed',
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'red';
      case 'earth': return 'green';
      case 'air': return 'blue';
      case 'water': return 'cyan';
      default: return 'gray';
    }
  };

  const formatSign = (sign: string) => {
    return sign ? sign.charAt(0).toUpperCase() + sign.slice(1) : 'Unknown';
  };

  return (
    <FeatureGuard requiredTier="elite" feature="ai_interpretation">
      <Box maxW="container.xl" mx="auto" py={8}>
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="xl" mb={4} color="purple.600">
              🧠 AI-Powered Astrological Analysis
            </Heading>
            <Text fontSize="lg" color="whiteAlpha.800">
              Advanced artificial intelligence interpretation of your birth chart
            </Text>
          </Box>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text>
                  Our AI analyzes your complete birth chart to provide deep, personalized insights 
                  into your personality, life purpose, relationships, and spiritual path.
                </Text>

                {!interpretation && (
                  <Button
                    colorScheme="purple"
                    size="lg"
                    onClick={generateInterpretation}
                    isLoading={loading}
                    loadingText="Analyzing chart..."
                    leftIcon={<InfoIcon />}
                  >
                    Generate AI Interpretation
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {interpretation && (
            <Tabs isFitted variant="enclosed" colorScheme="purple">
              <TabList>
                <Tab>Core Identity</Tab>
                <Tab>Life Purpose</Tab>
                <Tab>Relationships</Tab>
                <Tab>Career Path</Tab>
                <Tab>Growth</Tab>
                <Tab>Spiritual Gifts</Tab>
                <Tab>Integration</Tab>
              </TabList>

              <TabPanels>
                {/* Core Identity Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {/* Big Three */}
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md" color="orange.500">☉ Sun Identity</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <HStack>
                              <Badge colorScheme={getElementColor(interpretation.core_identity.sun_identity.element)}>
                                {formatSign(interpretation.core_identity.sun_identity.sign)}
                              </Badge>
                              <Text fontSize="sm">House {interpretation.core_identity.sun_identity.house}</Text>
                            </HStack>
                            <Text fontSize="sm" fontWeight="semibold">
                              {interpretation.core_identity.sun_identity.archetype}
                            </Text>
                            <Text fontSize="sm">
                              {interpretation.core_identity.sun_identity.description}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md" color="blue.500">☽ Moon Nature</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <HStack>
                              <Badge colorScheme="blue">
                                {formatSign(interpretation.core_identity.moon_nature.sign)}
                              </Badge>
                              <Text fontSize="sm">House {interpretation.core_identity.moon_nature.house}</Text>
                            </HStack>
                            <Text fontSize="sm">
                              {interpretation.core_identity.moon_nature.description}
                            </Text>
                            <Box>
                              <Text fontSize="xs" fontWeight="semibold" color="blue.600">Emotional Needs:</Text>
                              <Text fontSize="xs">{interpretation.core_identity.moon_nature.needs}</Text>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md" color="green.500">↗ Rising Persona</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <Badge colorScheme="green">
                              {formatSign(interpretation.core_identity.rising_persona.sign)}
                            </Badge>
                            <Text fontSize="sm">
                              {interpretation.core_identity.rising_persona.description}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    </Grid>

                    {/* Integration Challenge */}
                    <Card bg={cardBg} borderLeft="4px solid" borderColor="purple.400">
                      <CardBody>
                        <Heading size="sm" mb={3} color="purple.600">Integration Challenge</Heading>
                        <Text>{interpretation.core_identity.integration_challenge}</Text>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* Life Purpose Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md">🎯 Soul Purpose</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <HStack>
                              <Text fontWeight="semibold">North Node:</Text>
                              <Badge colorScheme="purple">
                                {formatSign(interpretation.life_purpose.soul_purpose.north_node_sign)}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm">
                              {interpretation.life_purpose.soul_purpose.growth_direction}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md">🏢 Career Calling</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <HStack>
                              <Text fontWeight="semibold">Midheaven:</Text>
                              <Badge colorScheme="orange">
                                {formatSign(interpretation.life_purpose.career_calling.mc_sign)}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm">
                              {interpretation.life_purpose.career_calling.public_expression}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    </Grid>

                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">✨ Creative Purpose</Heading>
                      </CardHeader>
                      <CardBody>
                        <Text>{interpretation.life_purpose.creative_purpose.sun_expression}</Text>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">🌟 Expansion Path</Heading>
                      </CardHeader>
                      <CardBody>
                        <Text>{interpretation.life_purpose.expansion_path.jupiter_gifts}</Text>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} borderLeft="4px solid" borderColor="gold">
                      <CardBody>
                        <Heading size="sm" mb={3} color="orange.600">Life Mission</Heading>
                        <Text fontWeight="semibold">{interpretation.life_purpose.life_mission}</Text>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* Relationships Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md" color="pink.500">💕 Love Style</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <HStack>
                              <Badge colorScheme="pink">
                                Venus in {formatSign(interpretation.relationship_patterns.love_style.venus_sign)}
                              </Badge>
                              <Text fontSize="sm">House {interpretation.relationship_patterns.love_style.venus_house}</Text>
                            </HStack>
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold" mb={1}>Attraction Style:</Text>
                              <Text fontSize="sm">{interpretation.relationship_patterns.love_style.attraction_style}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold" mb={1}>Love Needs:</Text>
                              <Text fontSize="sm">{interpretation.relationship_patterns.love_style.love_needs}</Text>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md" color="red.500">🔥 Passion Style</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <HStack>
                              <Badge colorScheme="red">
                                Mars in {formatSign(interpretation.relationship_patterns.passion_style.mars_sign)}
                              </Badge>
                              <Text fontSize="sm">House {interpretation.relationship_patterns.passion_style.mars_house}</Text>
                            </HStack>
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold" mb={1}>Action Style:</Text>
                              <Text fontSize="sm">{interpretation.relationship_patterns.passion_style.action_style}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold" mb={1}>Desire Nature:</Text>
                              <Text fontSize="sm">{interpretation.relationship_patterns.passion_style.desire_nature}</Text>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    </Grid>

                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">💫 Partnership Karma</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <HStack>
                            <Text fontWeight="semibold">7th House:</Text>
                            <Badge colorScheme="purple">
                              {formatSign(interpretation.relationship_patterns.partnership_karma.seventh_house_sign)}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm">
                            <strong>Partner Qualities:</strong> {interpretation.relationship_patterns.partnership_karma.partner_qualities}
                          </Text>
                          <Text fontSize="sm">
                            <strong>Relationship Lessons:</strong> {interpretation.relationship_patterns.partnership_karma.relationship_lessons}
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">🔑 Compatibility Keys</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack align="start" spacing={2}>
                          {interpretation.relationship_patterns.compatibility_keys.map((key, index) => (
                            <Text key={index} fontSize="sm">• {key}</Text>
                          ))}
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* Career Path Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md">🎯 Career Direction</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <Badge colorScheme="blue">
                              MC in {formatSign(interpretation.career_path.career_direction.mc_sign)}
                            </Badge>
                            <Text fontSize="sm">
                              {interpretation.career_path.career_direction.natural_calling}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md">🏔️ Mastery Path</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <HStack>
                              <Badge colorScheme="gray">
                                Saturn in {formatSign(interpretation.career_path.mastery_path.saturn_sign)}
                              </Badge>
                              <Text fontSize="sm">House {interpretation.career_path.mastery_path.saturn_house}</Text>
                            </HStack>
                            <Text fontSize="sm">
                              {interpretation.career_path.mastery_path.discipline_area}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    </Grid>

                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">👑 Leadership Style</Heading>
                      </CardHeader>
                      <CardBody>
                        <Text>{interpretation.career_path.leadership_style.sun_influence}</Text>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} borderLeft="4px solid" borderColor="green.400">
                      <CardBody>
                        <Heading size="sm" mb={3} color="green.600">Success Formula</Heading>
                        <Text fontWeight="semibold">{interpretation.career_path.success_formula}</Text>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* Growth Challenges Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">⏰ Saturn Lessons</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <HStack>
                            <Badge colorScheme="gray">
                              Saturn in {formatSign(interpretation.growth_challenges.saturn_lessons.saturn_sign)}
                            </Badge>
                            <Text fontSize="sm">House {interpretation.growth_challenges.saturn_lessons.saturn_house}</Text>
                          </HStack>
                          <Text fontSize="sm">
                            <strong>Mastery Challenge:</strong> {interpretation.growth_challenges.saturn_lessons.mastery_challenge}
                          </Text>
                          <Text fontSize="sm" color="whiteAlpha.800">
                            {interpretation.growth_challenges.saturn_lessons.growth_timeline}
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    {interpretation.growth_challenges.key_challenges && (
                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md">🎯 Key Challenges</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            {interpretation.growth_challenges.key_challenges.map((challenge, index) => (
                              <Box key={index} p={3} borderWidth={1} borderRadius="md">
                                <HStack justify="space-between" mb={2}>
                                  <Text fontWeight="semibold" fontSize="sm">
                                    {challenge.planets} {challenge.aspect}
                                  </Text>
                                  <Badge colorScheme="orange">{challenge.aspect}</Badge>
                                </HStack>
                                <Text fontSize="sm" mb={2}>{challenge.challenge}</Text>
                                <Text fontSize="sm" color="green.600">
                                  <strong>Growth Opportunity:</strong> {challenge.growth_opportunity}
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        </CardBody>
                      </Card>
                    )}

                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md">💪 Hidden Strengths</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={2}>
                            {interpretation.growth_challenges.empowerment_potential.hidden_strengths.map((strength, index) => (
                              <Text key={index} fontSize="sm">• {strength}</Text>
                            ))}
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md">🦋 Transformation Gifts</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={2}>
                            {interpretation.growth_challenges.empowerment_potential.transformation_gifts.map((gift, index) => (
                              <Text key={index} fontSize="sm">• {gift}</Text>
                            ))}
                          </VStack>
                        </CardBody>
                      </Card>
                    </Grid>
                  </VStack>
                </TabPanel>

                {/* Spiritual Gifts Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md" color="purple.500">🔮 Psychic Abilities</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <Badge colorScheme="purple">
                              12th House: {formatSign(interpretation.spiritual_gifts.psychic_abilities.twelfth_house_sign)}
                            </Badge>
                            <Text fontSize="sm">{interpretation.spiritual_gifts.psychic_abilities.intuitive_gifts}</Text>
                            {interpretation.spiritual_gifts.psychic_abilities.spiritual_planets.length > 0 && (
                              <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={1}>Spiritual Planets:</Text>
                                <HStack wrap="wrap">
                                  {interpretation.spiritual_gifts.psychic_abilities.spiritual_planets.map((planet, index) => (
                                    <Badge key={index} size="sm" colorScheme="purple">{formatSign(planet)}</Badge>
                                  ))}
                                </HStack>
                              </Box>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md" color="teal.500">🌊 Mystical Nature</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <HStack>
                              <Badge colorScheme="teal">
                                Neptune in {formatSign(interpretation.spiritual_gifts.mystical_nature.neptune_sign)}
                              </Badge>
                              <Text fontSize="sm">House {interpretation.spiritual_gifts.mystical_nature.neptune_house}</Text>
                            </HStack>
                            <Text fontSize="sm">{interpretation.spiritual_gifts.mystical_nature.spiritual_path}</Text>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md" color="red.500">⚡ Transformation Power</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <HStack>
                              <Badge colorScheme="red">
                                Pluto in {formatSign(interpretation.spiritual_gifts.transformation_power.pluto_sign)}
                              </Badge>
                              <Text fontSize="sm">House {interpretation.spiritual_gifts.transformation_power.pluto_house}</Text>
                            </HStack>
                            <Text fontSize="sm">{interpretation.spiritual_gifts.transformation_power.healing_gifts}</Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    </Grid>

                    <Card bg={cardBg} borderLeft="4px solid" borderColor="purple.400">
                      <CardBody>
                        <Heading size="sm" mb={3} color="purple.600">Service Mission</Heading>
                        <Text fontWeight="semibold">{interpretation.spiritual_gifts.service_mission}</Text>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* Integration Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md">🔥 Elemental Balance</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            {Object.entries(interpretation.integration_themes.elemental_balance.distribution).map(([element, count]) => (
                              <Box key={element}>
                                <HStack justify="space-between" mb={1}>
                                  <Badge colorScheme={getElementColor(element)}>{element.toUpperCase()}</Badge>
                                  <Text fontSize="sm">{count} planets</Text>
                                </HStack>
                                <Progress value={(count / 10) * 100} colorScheme={getElementColor(element)} size="sm" />
                              </Box>
                            ))}
                            <Divider />
                            <Text fontSize="sm">
                              <strong>Dominant:</strong> {formatSign(interpretation.integration_themes.elemental_balance.dominant_element)}
                            </Text>
                            <Text fontSize="sm">
                              <strong>Integration Focus:</strong> {interpretation.integration_themes.elemental_balance.integration_focus}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md">⚡ Modal Balance</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            {Object.entries(interpretation.integration_themes.modal_balance.distribution).map(([quality, count]) => (
                              <Box key={quality}>
                                <HStack justify="space-between" mb={1}>
                                  <Badge colorScheme="blue">{quality.toUpperCase()}</Badge>
                                  <Text fontSize="sm">{count} planets</Text>
                                </HStack>
                                <Progress value={(count / 10) * 100} colorScheme="blue" size="sm" />
                              </Box>
                            ))}
                            <Divider />
                            <Text fontSize="sm">
                              <strong>Dominant:</strong> {formatSign(interpretation.integration_themes.modal_balance.dominant_quality)}
                            </Text>
                            <Text fontSize="sm">
                              <strong>Integration Need:</strong> {interpretation.integration_themes.modal_balance.integration_need}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    </Grid>

                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">🎯 Focal Planets</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <Text fontSize="sm" color="whiteAlpha.800">
                            Planets with the most aspects (most important for integration):
                          </Text>
                          <HStack wrap="wrap" spacing={2}>
                            {interpretation.integration_themes.focal_planets.most_aspected.map(([planet, count]) => (
                              <Badge key={planet} colorScheme="purple" p={2}>
                                {formatSign(planet)}: {count} aspects
                              </Badge>
                            ))}
                          </HStack>
                          <Text fontSize="sm">
                            <strong>Integration Priority:</strong> {interpretation.integration_themes.focal_planets.integration_priority}
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} borderLeft="4px solid" borderColor="gold">
                      <CardBody>
                        <Heading size="sm" mb={3} color="orange.600">Overall Integration Theme</Heading>
                        <Text fontWeight="semibold">{interpretation.integration_themes.overall_theme}</Text>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}

          {/* Action Buttons */}
          {interpretation && (
            <HStack spacing={4} justify="center">
              <Button
                colorScheme="purple"
                variant="outline"
                onClick={generateInterpretation}
                isLoading={loading}
              >
                Regenerate Analysis
              </Button>
              <Button
                colorScheme="blue"
                variant="outline"
                onClick={() => window.print()}
              >
                Print Report
              </Button>
            </HStack>
          )}
        </VStack>
      </Box>
    </FeatureGuard>
  );
};
