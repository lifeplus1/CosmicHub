import React, { useState } from 'react';
import {
  Box,
  Text,
  Card,
  CardBody,
  Grid,
  GridItem,
  Button,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Alert,
  AlertIcon,
  Progress,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  HStack,
  Heading,
  Divider,
  useColorModeValue,
  Stack,
  Container
} from '@chakra-ui/react';
// import { StarIcon, InfoIcon } from '@chakra-ui/icons';
import type { BirthData } from '../types';
import FeatureGuard from './FeatureGuard';

interface SynastryAnalysisProps {
  person1: BirthData;
  person2: BirthData;
  person1Name?: string;
  person2Name?: string;
}

interface SynastryResult {
  compatibility_analysis: {
    overall_score: number;
    interpretation: string;
    breakdown: Record<string, number>;
  };
  interaspects: Array<{
    person1_planet: string;
    person2_planet: string;
    aspect: string;
    orb: number;
    strength: string;
    interpretation: string;
  }>;
  house_overlays: Array<{
    person1_planet: string;
    person2_house: number;
    interpretation: string;
  }>;
  composite_chart: {
    midpoint_sun: number;
    midpoint_moon: number;
    relationship_purpose: string;
  };
  summary: {
    key_themes: string[];
    strengths: string[];
    challenges: string[];
    advice: string[];
  };
}

export const SynastryAnalysis: React.FC<SynastryAnalysisProps> = ({
  person1,
  person2,
  person1Name = "Person 1",
  person2Name = "Person 2"
}) => {
  const [synastryResult, setSynastryResult] = useState<SynastryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const calculateSynastry = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calculate-synastry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          person1,
          person2
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate synastry');
      }

      const data = await response.json();
      setSynastryResult(data.synastry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'yellow';
    return 'red';
  };

  const getAspectColor = (aspect: string) => {
    switch (aspect) {
      case 'conjunction':
      case 'trine':
      case 'sextile':
        return 'green';
      case 'square':
      case 'opposition':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const formatPlanetName = (planet: string) => {
    return planet.charAt(0).toUpperCase() + planet.slice(1);
  };

  const renderStars = (score: number) => {
    const stars = Math.round(score / 20);
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon 
        key={i} 
        color={i < stars ? 'yellow.400' : 'gray.300'} 
        boxSize={5}
      />
    ));
  };

  return (
    <FeatureGuard requiredTier="premium" feature="synastry">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="xl" mb={4} color="purple.600">
              💕 Relationship Compatibility Analysis
            </Heading>
            <Text fontSize="lg" color="whiteAlpha.800">
              Synastry Comparison: {person1Name} & {person2Name}
            </Text>
          </Box>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Text mb={4}>
                Synastry compares two birth charts to reveal relationship dynamics, compatibility patterns, 
                and growth opportunities between partners.
              </Text>

              {!synastryResult && (
                <Button
                  colorScheme="purple"
                  onClick={calculateSynastry}
                  isLoading={loading}
                  loadingText="Calculating..."
                  leftIcon={<InfoIcon />}
                  size="lg"
                >
                  Calculate Compatibility
                </Button>
              )}
            </CardBody>
          </Card>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {synastryResult && (
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              {/* Overall Compatibility Score */}
              <GridItem colSpan={{ base: 1, lg: 2 }}>
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardBody>
                    <Heading size="md" mb={4}>Overall Compatibility Score</Heading>
                    
                    <HStack spacing={4} mb={4}>
                      <HStack>
                        {renderStars(synastryResult.compatibility_analysis.overall_score)}
                      </HStack>
                      <Text fontSize="3xl" fontWeight="bold" color={getCompatibilityColor(synastryResult.compatibility_analysis.overall_score)}>
                        {synastryResult.compatibility_analysis.overall_score}/100
                      </Text>
                    </HStack>
                    
                    <Text mb={6}>
                      {synastryResult.compatibility_analysis.interpretation}
                    </Text>

                    {/* Compatibility Breakdown */}
                    {synastryResult.compatibility_analysis.breakdown && (
                      <Box>
                        <Heading size="sm" mb={4}>Compatibility Areas</Heading>
                        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                          {Object.entries(synastryResult.compatibility_analysis.breakdown).map(([area, score]) => (
                            <Box key={area} p={4} borderWidth={1} borderRadius="md">
                              <Text fontSize="sm" fontWeight="semibold" mb={2}>
                                {area.charAt(0).toUpperCase() + area.slice(1)}
                              </Text>
                              <Progress 
                                value={score} 
                                colorScheme={getCompatibilityColor(score)}
                                mb={2}
                              />
                              <Text fontSize="sm" color="whiteAlpha.800">
                                {score.toFixed(1)}%
                              </Text>
                            </Box>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </CardBody>
                </Card>
              </GridItem>

              {/* Key Relationship Aspects */}
              <GridItem>
                <Card bg={cardBg} borderColor={borderColor} h="fit-content">
                  <CardBody>
                    <Accordion allowToggle defaultIndex={0}>
                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Heading size="sm">Key Relationship Aspects</Heading>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <VStack spacing={3} align="stretch">
                            {synastryResult.interaspects.slice(0, 8).map((aspect, index) => (
                              <Box key={index} p={3} borderWidth={1} borderRadius="md">
                                <HStack justify="space-between" mb={2}>
                                  <Text fontWeight="semibold" fontSize="sm">
                                    {formatPlanetName(aspect.person1_planet)} {aspect.aspect} {formatPlanetName(aspect.person2_planet)}
                                  </Text>
                                  <Badge colorScheme={getAspectColor(aspect.aspect)}>
                                    {aspect.aspect}
                                  </Badge>
                                </HStack>
                                <Text fontSize="xs" color="whiteAlpha.800" mb={1}>
                                  Orb: {aspect.orb.toFixed(2)}° | Strength: {aspect.strength}
                                </Text>
                                <Text fontSize="sm">
                                  {aspect.interpretation}
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </CardBody>
                </Card>
              </GridItem>

              {/* House Overlays & Composite */}
              <GridItem>
                <VStack spacing={4} align="stretch">
                  <Card bg={cardBg} borderColor={borderColor}>
                    <CardBody>
                      <Accordion allowToggle>
                        <AccordionItem>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              <Heading size="sm">House Overlays</Heading>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel pb={4}>
                            <VStack spacing={3} align="stretch">
                              {synastryResult.house_overlays.slice(0, 6).map((overlay, index) => (
                                <Box key={index} p={3} bg="gray.50" borderRadius="md">
                                  <Text fontWeight="semibold" fontSize="sm" mb={1}>
                                    {formatPlanetName(overlay.person1_planet)} in {overlay.person2_house}th House
                                  </Text>
                                  <Text fontSize="sm" color="whiteAlpha.800">
                                    {overlay.interpretation}
                                  </Text>
                                </Box>
                              ))}
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} borderColor={borderColor}>
                    <CardBody>
                      <Accordion allowToggle>
                        <AccordionItem>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              <Heading size="sm">Composite Chart</Heading>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel pb={4}>
                            <Text fontWeight="semibold" mb={2}>Relationship Purpose:</Text>
                            <Text mb={4}>
                              {synastryResult.composite_chart.relationship_purpose}
                            </Text>
                            
                            <Text fontSize="sm" color="whiteAlpha.800">
                              Composite Sun: {synastryResult.composite_chart.midpoint_sun.toFixed(2)}°
                              <br />
                              Composite Moon: {synastryResult.composite_chart.midpoint_moon.toFixed(2)}°
                            </Text>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </CardBody>
                  </Card>
                </VStack>
              </GridItem>

              {/* Relationship Summary */}
              <GridItem colSpan={{ base: 1, lg: 2 }}>
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardBody>
                    <Heading size="md" mb={4}>Relationship Summary</Heading>
                    
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                      <VStack align="stretch" spacing={4}>
                        <Box>
                          <Text fontWeight="semibold" color="green.600" mb={2}>
                            🌟 Key Themes
                          </Text>
                          <Stack direction="row" wrap="wrap" spacing={2}>
                            {synastryResult.summary.key_themes.map((theme, index) => (
                              <Badge key={index} colorScheme="green" variant="subtle">
                                {theme}
                              </Badge>
                            ))}
                          </Stack>
                        </Box>

                        <Box>
                          <Text fontWeight="semibold" color="blue.600" mb={2}>
                            💪 Strengths
                          </Text>
                          <VStack align="start" spacing={1}>
                            {synastryResult.summary.strengths.map((strength, index) => (
                              <Text key={index} fontSize="sm">
                                • {strength}
                              </Text>
                            ))}
                          </VStack>
                        </Box>
                      </VStack>

                      <VStack align="stretch" spacing={4}>
                        <Box>
                          <Text fontWeight="semibold" color="orange.600" mb={2}>
                            🔄 Growth Areas
                          </Text>
                          <VStack align="start" spacing={1}>
                            {synastryResult.summary.challenges.map((challenge, index) => (
                              <Text key={index} fontSize="sm">
                                • {challenge}
                              </Text>
                            ))}
                          </VStack>
                        </Box>

                        <Box>
                          <Text fontWeight="semibold" color="purple.600" mb={2}>
                            💡 Relationship Advice
                          </Text>
                          <VStack align="start" spacing={1}>
                            {synastryResult.summary.advice.map((advice, index) => (
                              <Text key={index} fontSize="sm">
                                • {advice}
                              </Text>
                            ))}
                          </VStack>
                        </Box>
                      </VStack>
                    </Grid>
                  </CardBody>
                </Card>
              </GridItem>

              {/* Action Buttons */}
              <GridItem colSpan={{ base: 1, lg: 2 }}>
                <HStack spacing={4} justify="center">
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => window.location.href = '/transits'}
                  >
                    View Relationship Transits
                  </Button>
                  <Button
                    colorScheme="purple"
                    variant="outline"
                    onClick={calculateSynastry}
                    isLoading={loading}
                  >
                    Recalculate
                  </Button>
                </HStack>
              </GridItem>
            </Grid>
          )}
        </VStack>
      </Container>
    </FeatureGuard>
  );
};
