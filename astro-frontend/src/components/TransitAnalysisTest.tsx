import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SimpleGrid,
  Badge,
  Icon,
  Progress,
  Divider,
  useColorModeValue,
  Container,
  Alert,
  AlertIcon,
  Stack,
  Circle,
  Flex,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaCalendarAlt, FaRocket, FaHeart, FaArrowLeft, FaMoon, FaSun, FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import FeatureGuard from './FeatureGuard';
import { EducationalTooltip } from './EducationalTooltip';

export const TransitAnalysisTest: React.FC = () => {
  const navigate = useNavigate();
  const [timeFrame, setTimeFrame] = useState('6months');
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const { isOpen: isGuideOpen, onToggle: onGuideToggle } = useDisclosure();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const bgGradient = useColorModeValue(
    'linear(to-br, indigo.50, purple.50, pink.50)',
    'linear(to-br, gray.900, indigo.900, purple.900)'
  );

  const upcomingTransits = [
    {
      date: 'August 15, 2025',
      transit: 'Jupiter Trine Natal Venus',
      energy: 'positive',
      impact: 'High',
      description: 'Excellent time for love, creativity, and financial opportunities',
      duration: '3 days',
      icon: FaHeart,
      color: 'green'
    },
    {
      date: 'August 22, 2025',
      transit: 'Mars Square Natal Moon',
      energy: 'challenging',
      impact: 'Medium',
      description: 'Emotional tensions may arise, practice patience',
      duration: '2 days',
      icon: FaMoon,
      color: 'orange'
    },
    {
      date: 'September 3, 2025',
      transit: 'Saturn Sextile Natal Sun',
      energy: 'supportive',
      impact: 'High',
      description: 'Structure and discipline lead to lasting achievements',
      duration: '1 week',
      icon: FaSun,
      color: 'blue'
    },
    {
      date: 'September 18, 2025',
      transit: 'Pluto Trine Natal Mercury',
      energy: 'transformative',
      impact: 'Very High',
      description: 'Deep insights and powerful communication breakthroughs',
      duration: '2 weeks',
      icon: FaRocket,
      color: 'purple'
    }
  ];

  const currentTransits = [
    { planet: 'Jupiter', aspect: 'Conjunction', natal: 'Ascendant', intensity: 95 },
    { planet: 'Saturn', aspect: 'Square', natal: 'Mars', intensity: 78 },
    { planet: 'Uranus', aspect: 'Trine', natal: 'Venus', intensity: 85 },
    { planet: 'Neptune', aspect: 'Sextile', natal: 'Moon', intensity: 62 }
  ];

  const handleStartAnalysis = () => {
    setAnalysisStarted(true);
  };

  return (
    <FeatureGuard feature="transit_analysis" requiredTier="elite">
      <Box minH="100vh" bg={bgGradient}>
        <Container maxW="6xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Header Section */}
            <VStack spacing={4} textAlign="center">
              <HStack spacing={3}>
                <Icon as={FaClock} color="purple.500" boxSize={8} />
                <Heading size="xl" bgGradient="linear(to-r, indigo.400, purple.500, pink.400)" bgClip="text">
                  Transit Analysis & Predictions
                </Heading>
                <Icon as={FaClock} color="purple.500" boxSize={8} />
              </HStack>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Discover the cosmic timing of your life through precise planetary transit analysis
              </Text>
              <Badge colorScheme="gold" size="lg" px={4} py={2}>
                👑 Elite Feature Active
              </Badge>
            </VStack>

            {/* Educational Guide */}
            <Box>
              <Button
                onClick={onGuideToggle}
                variant="outline"
                colorScheme="purple"
                size="sm"
                leftIcon={<Icon as={FaQuestionCircle} />}
                rightIcon={<Icon as={isGuideOpen ? FaChevronUp : FaChevronDown} />}
              >
                Transit Analysis Guide
              </Button>
              
              <Collapse in={isGuideOpen} animateOpacity>
                <Card mt={4} bg="purple.50" borderColor="purple.200" borderWidth={1}>
                  <CardHeader pb={2}>
                    <Heading size="sm" color="purple.700">
                      Understanding Planetary Transits
                    </Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="sm" color="purple.700">
                        Transits reveal the cosmic weather of your life. By tracking current planetary positions 
                        relative to your birth chart, we can predict optimal timing for important decisions.
                      </Text>
                      
                      <HStack spacing={6} align="start">
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="purple.600" mb={2}>
                            What Transits Show:
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            • Best times for career moves<br/>
                            • Relationship opportunities<br/>
                            • Creative breakthroughs<br/>
                            • Financial decisions<br/>
                            • Personal growth periods
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="purple.600" mb={2}>
                            Transit Types:
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            • Conjunction: New beginnings<br/>
                            • Trine: Easy, beneficial energy<br/>
                            • Square: Challenges & growth<br/>
                            • Opposition: Balance & awareness<br/>
                            • Sextile: Opportunities
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="purple.600" mb={2}>
                            Major Transits:
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            • Jupiter: Expansion & luck<br/>
                            • Saturn: Structure & lessons<br/>
                            • Uranus: Change & innovation<br/>
                            • Neptune: Spirituality & dreams<br/>
                            • Pluto: Transformation & power
                          </Text>
                        </Box>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </Collapse>
            </Box>

            {!analysisStarted ? (
              /* Configuration */
              <Card bg={cardBg} shadow="xl" maxW="2xl" mx="auto">
                <CardHeader bg="purple.50" roundedTop="md" textAlign="center">
                  <HStack justify="center">
                    <Icon as={FaCalendarAlt} color="purple.500" />
                    <Heading size="md" color="purple.600">
                      Analysis Time Frame
                      <EducationalTooltip
                        title="Choosing Your Time Frame"
                        description="Different time frames reveal different types of influences. Short periods show immediate opportunities, while longer periods reveal major life themes."
                        examples={[
                          "1 Month: Daily decisions & quick opportunities",
                          "3 Months: Project planning & seasonal shifts",
                          "6 Months: Major goals & relationship timing",
                          "1 Year: Life direction & career planning"
                        ]}
                        tier="elite"
                      />
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6}>
                    <Select 
                      value={timeFrame} 
                      onChange={(e) => setTimeFrame(e.target.value)}
                      size="lg"
                    >
                      <option value="1month">Next 1 Month</option>
                      <option value="3months">Next 3 Months</option>
                      <option value="6months">Next 6 Months</option>
                      <option value="1year">Next Year</option>
                      <option value="2years">Next 2 Years</option>
                    </Select>
                    
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Select your preferred time frame for detailed transit predictions and cosmic timing analysis
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              /* Analysis Results */
              <VStack spacing={6}>
                <Alert status="success" borderRadius="lg">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">Transit Analysis Complete!</Text>
                    <Text fontSize="sm">Your cosmic timing report for the next {timeFrame.replace(/\d+/, (match) => match + ' ')} is ready</Text>
                  </VStack>
                </Alert>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} w="full">
                  {/* Current Active Transits */}
                  <Card bg={cardBg} shadow="lg">
                    <CardHeader>
                      <HStack>
                        <Icon as={FaRocket} color="orange.500" />
                        <Heading size="md">Active Transits</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        {currentTransits.map((transit, index) => (
                          <Box key={index}>
                            <HStack justify="space-between" mb={2}>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="bold">
                                  {transit.planet} {transit.aspect} {transit.natal}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  Current intensity: {transit.intensity}%
                                </Text>
                              </VStack>
                              <Circle 
                                size="40px" 
                                bg={transit.intensity > 80 ? 'red.100' : transit.intensity > 60 ? 'orange.100' : 'green.100'}
                                color={transit.intensity > 80 ? 'red.600' : transit.intensity > 60 ? 'orange.600' : 'green.600'}
                                fontSize="xs"
                                fontWeight="bold"
                              >
                                {transit.intensity}%
                              </Circle>
                            </HStack>
                            <Progress 
                              value={transit.intensity} 
                              size="sm" 
                              colorScheme={transit.intensity > 80 ? 'red' : transit.intensity > 60 ? 'orange' : 'green'}
                              borderRadius="full"
                            />
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Transit Timeline */}
                  <Card bg={cardBg} shadow="lg">
                    <CardHeader>
                      <HStack>
                        <Icon as={FaCalendarAlt} color="blue.500" />
                        <Heading size="md">Upcoming Timeline</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        {upcomingTransits.slice(0, 3).map((transit, index) => (
                          <Flex key={index} align="center" gap={3}>
                            <Circle size="30px" bg={`${transit.color}.100`} color={`${transit.color}.600`}>
                              <Icon as={transit.icon} size="sm" />
                            </Circle>
                            <Box flex={1}>
                              <Text fontSize="xs" color="gray.500">{transit.date}</Text>
                              <Text fontSize="sm" fontWeight="medium">{transit.transit}</Text>
                              <Badge size="sm" colorScheme={transit.color}>
                                {transit.impact} Impact
                              </Badge>
                            </Box>
                          </Flex>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Detailed Transit Insights */}
                <Card bg={cardBg} shadow="lg" w="full">
                  <CardHeader>
                    <Heading size="md">Detailed Transit Insights</Heading>
                  </CardHeader>
                  <CardBody>
                    <Stack spacing={4}>
                      {upcomingTransits.map((transit, index) => (
                        <Box key={index}>
                          <HStack justify="space-between" mb={2}>
                            <VStack align="start" spacing={1}>
                              <HStack>
                                <Icon as={transit.icon} color={`${transit.color}.500`} />
                                <Text fontWeight="bold">{transit.transit}</Text>
                                <Badge colorScheme={transit.color} size="sm">
                                  {transit.energy}
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color="gray.600">{transit.date} • Duration: {transit.duration}</Text>
                            </VStack>
                            <Badge colorScheme="purple" variant="outline">
                              {transit.impact} Impact
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" mb={2}>{transit.description}</Text>
                          {index < upcomingTransits.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </Stack>
                  </CardBody>
                </Card>

                {/* Best Days Recommendations */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
                  <Card bg="green.50" borderColor="green.200" borderWidth={2}>
                    <CardHeader textAlign="center">
                      <Icon as={FaHeart} color="green.500" boxSize={6} />
                      <Text fontWeight="bold" color="green.700">Best for Love</Text>
                    </CardHeader>
                    <CardBody textAlign="center">
                      <Text fontSize="sm">August 15-17, 2025</Text>
                      <Text fontSize="xs" color="gray.600">Jupiter Trine Venus</Text>
                    </CardBody>
                  </Card>

                  <Card bg="blue.50" borderColor="blue.200" borderWidth={2}>
                    <CardHeader textAlign="center">
                      <Icon as={FaRocket} color="blue.500" boxSize={6} />
                      <Text fontWeight="bold" color="blue.700">Best for Career</Text>
                    </CardHeader>
                    <CardBody textAlign="center">
                      <Text fontSize="sm">September 3-10, 2025</Text>
                      <Text fontSize="xs" color="gray.600">Saturn Sextile Sun</Text>
                    </CardBody>
                  </Card>

                  <Card bg="purple.50" borderColor="purple.200" borderWidth={2}>
                    <CardHeader textAlign="center">
                      <Icon as={FaClock} color="purple.500" boxSize={6} />
                      <Text fontWeight="bold" color="purple.700">Transformation</Text>
                    </CardHeader>
                    <CardBody textAlign="center">
                      <Text fontSize="sm">September 18-30, 2025</Text>
                      <Text fontSize="xs" color="gray.600">Pluto Trine Mercury</Text>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </VStack>
            )}

            {/* Action Buttons */}
            <HStack spacing={4} justify="center">
              <Button 
                leftIcon={<FaArrowLeft />}
                onClick={() => navigate('/')} 
                variant="outline"
                colorScheme="gray"
              >
                Back to Dashboard
              </Button>
              {!analysisStarted ? (
                <Button 
                  colorScheme="purple" 
                  size="lg"
                  onClick={handleStartAnalysis}
                  leftIcon={<FaClock />}
                >
                  Analyze Transits
                </Button>
              ) : (
                <Button 
                  colorScheme="indigo" 
                  onClick={() => setAnalysisStarted(false)}
                >
                  New Analysis
                </Button>
              )}
            </HStack>
          </VStack>
        </Container>
      </Box>
    </FeatureGuard>
  );
};
