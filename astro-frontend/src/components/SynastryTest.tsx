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
  Input,
  FormControl,
  FormLabel,
  Select,
  SimpleGrid,
  Progress,
  Badge,
  Icon,
  Divider,
  useColorModeValue,
  Container,
  Alert,
  AlertIcon,
  Stack,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaUsers, FaStar, FaChartLine, FaArrowLeft, FaBook, FaInfoCircle } from 'react-icons/fa';
import FeatureGuard from './FeatureGuard';
import { EducationalTooltip } from './EducationalTooltip';

export const SynastryTest: React.FC = () => {
  const navigate = useNavigate();
  const [person1Data, setPerson1Data] = useState({ name: '', date: '', time: '', location: '' });
  const [person2Data, setPerson2Data] = useState({ name: '', date: '', time: '', location: '' });
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const { isOpen: isGuideOpen, onToggle: toggleGuide } = useDisclosure();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const bgGradient = useColorModeValue(
    'linear(to-br, pink.50, purple.50, blue.50)',
    'linear(to-br, gray.900, purple.900, blue.900)'
  );

  const compatibilityAspects = [
    { aspect: 'Sun-Moon Harmony', score: 85, description: 'Strong emotional connection' },
    { aspect: 'Venus-Mars Chemistry', score: 92, description: 'Passionate romantic attraction' },
    { aspect: 'Mercury Communication', score: 78, description: 'Good intellectual rapport' },
    { aspect: 'Jupiter Expansion', score: 88, description: 'Mutual growth and optimism' }
  ];

  const handleStartAnalysis = () => {
    setAnalysisStarted(true);
  };

  return (
    <FeatureGuard feature="synastry_analysis" requiredTier="premium">
      <Box minH="100vh" bg={bgGradient}>
        <Container maxW="6xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Header Section */}
            <VStack spacing={4} textAlign="center">
              <HStack spacing={3}>
                <Icon as={FaHeart} color="pink.500" boxSize={8} />
                <Heading size="xl" bgGradient="linear(to-r, pink.400, purple.500)" bgClip="text">
                  Synastry Analysis
                  <EducationalTooltip
                    title="What is Synastry?"
                    description="Synastry is the astrological practice of comparing two birth charts to understand relationship compatibility and dynamics between two people."
                    examples={[
                      "Romantic partnerships",
                      "Business relationships", 
                      "Friendships and family bonds",
                      "Parent-child connections"
                    ]}
                    tier="premium"
                  />
                </Heading>
                <Icon as={FaHeart} color="pink.500" boxSize={8} />
              </HStack>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Discover the cosmic compatibility between two souls through advanced astrological synastry analysis
              </Text>
              <HStack spacing={4}>
                <Badge colorScheme="purple" size="lg" px={4} py={2}>
                  🌟 Premium Feature Active
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<FaBook />}
                  onClick={toggleGuide}
                  colorScheme="blue"
                >
                  Learn About Synastry
                </Button>
              </HStack>
              
              {/* Educational Guide */}
              <Collapse in={isGuideOpen} animateOpacity>
                <Card bg="blue.50" borderColor="blue.200" borderWidth={2} maxW="4xl">
                  <CardHeader>
                    <HStack>
                      <Icon as={FaInfoCircle} color="blue.500" />
                      <Heading size="sm" color="blue.700">Understanding Synastry Analysis</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="sm" color="blue.700">
                        Synastry reveals how two people's energies interact by comparing their birth charts. 
                        Key factors include planetary aspects, sign compatibility, and house overlays.
                      </Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={2}>
                            Key Aspects to Look For:
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            • Sun-Moon connections (emotional harmony)<br/>
                            • Venus-Mars aspects (romantic attraction)<br/>
                            • Mercury aspects (communication style)<br/>
                            • Saturn aspects (long-term potential)
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={2}>
                            What It Reveals:
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            • Natural compatibility areas<br/>
                            • Potential challenges to work on<br/>
                            • Communication patterns<br/>
                            • Growth opportunities together
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={2}>
                            Remember:
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            • Challenges can strengthen bonds<br/>
                            • Free will shapes relationships<br/>
                            • Synastry shows potential, not fate<br/>
                            • Both charts matter equally
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </VStack>
                  </CardBody>
                </Card>
              </Collapse>
            </VStack>

            {!analysisStarted ? (
              /* Input Forms */
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card bg={cardBg} shadow="xl" borderWidth={2} borderColor="pink.200">
                  <CardHeader bg="pink.50" roundedTop="md">
                    <HStack>
                      <Icon as={FaUsers} color="pink.500" />
                      <Heading size="md" color="pink.600">Person 1</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>
                          Name
                          <EducationalTooltip
                            title="Why Names Matter"
                            description="Names help personalize the analysis and make results more meaningful, though they don't affect calculations."
                          />
                        </FormLabel>
                        <Input 
                          placeholder="Enter first person's name"
                          value={person1Data.name}
                          onChange={(e) => setPerson1Data({...person1Data, name: e.target.value})}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>
                          Birth Date
                          <EducationalTooltip
                            title="Birth Date Accuracy"
                            description="The exact date determines Sun sign and slower-moving planet positions. Critical for accurate analysis."
                            examples={["Affects Sun, Moon, and planetary signs", "Determines generational planet influences"]}
                          />
                        </FormLabel>
                        <Input 
                          type="date"
                          value={person1Data.date}
                          onChange={(e) => setPerson1Data({...person1Data, date: e.target.value})}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>
                          Birth Time
                          <EducationalTooltip
                            title="Birth Time Importance"
                            description="Exact time determines Rising sign and house positions. Even small differences can change the analysis significantly."
                            examples={["Affects Ascendant and house cusps", "Changes Moon sign if born near sign change", "Critical for house overlays in synastry"]}
                          />
                        </FormLabel>
                        <Input 
                          type="time"
                          value={person1Data.time}
                          onChange={(e) => setPerson1Data({...person1Data, time: e.target.value})}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>
                          Birth Location
                          <EducationalTooltip
                            title="Location Precision"
                            description="Birth location determines local time and coordinates for accurate house calculations and planetary positions."
                            examples={["City where birth occurred", "Hospital or exact address preferred", "Affects house cusps and angles"]}
                          />
                        </FormLabel>
                        <Input 
                          placeholder="City, Country"
                          value={person1Data.location}
                          onChange={(e) => setPerson1Data({...person1Data, location: e.target.value})}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} shadow="xl" borderWidth={2} borderColor="blue.200">
                  <CardHeader bg="blue.50" roundedTop="md">
                    <HStack>
                      <Icon as={FaUsers} color="blue.500" />
                      <Heading size="md" color="blue.600">Person 2</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input 
                          placeholder="Enter second person's name"
                          value={person2Data.name}
                          onChange={(e) => setPerson2Data({...person2Data, name: e.target.value})}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Birth Date</FormLabel>
                        <Input 
                          type="date"
                          value={person2Data.date}
                          onChange={(e) => setPerson2Data({...person2Data, date: e.target.value})}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Birth Time</FormLabel>
                        <Input 
                          type="time"
                          value={person2Data.time}
                          onChange={(e) => setPerson2Data({...person2Data, time: e.target.value})}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Birth Location</FormLabel>
                        <Input 
                          placeholder="City, Country"
                          value={person2Data.location}
                          onChange={(e) => setPerson2Data({...person2Data, location: e.target.value})}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            ) : (
              /* Analysis Results */
              <VStack spacing={6}>
                <Alert status="success" borderRadius="lg">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">Synastry Analysis Complete!</Text>
                    <Text fontSize="sm">Cosmic compatibility calculated for your relationship</Text>
                  </VStack>
                </Alert>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                  <Card bg={cardBg} shadow="lg">
                    <CardHeader>
                      <HStack>
                        <Icon as={FaStar} color="gold" />
                        <Heading size="md">
                          Overall Compatibility
                          <EducationalTooltip
                            title="Compatibility Score"
                            description="This score considers major planetary aspects, element balance, and relationship-focused connections between the charts."
                            examples={[
                              "80-100%: Excellent natural harmony",
                              "60-79%: Good compatibility with effort", 
                              "40-59%: Moderate compatibility",
                              "Below 40%: Significant challenges"
                            ]}
                          />
                        </Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4}>
                        <Box textAlign="center">
                          <Text fontSize="4xl" fontWeight="bold" color="purple.500">86%</Text>
                          <Text color="gray.600">Cosmic Match Score</Text>
                        </Box>
                        <Progress value={86} colorScheme="purple" size="lg" borderRadius="full" />
                        <Text fontSize="sm" textAlign="center" color="gray.600">
                          Excellent compatibility with strong potential for lasting connection
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} shadow="lg">
                    <CardHeader>
                      <HStack>
                        <Icon as={FaChartLine} color="blue.500" />
                        <Heading size="md">
                          Key Aspects
                          <EducationalTooltip
                            title="Synastry Aspects"
                            description="Aspects show how planets from one chart interact with planets in the other chart, revealing relationship dynamics."
                            examples={[
                              "Conjunction (0°): Intense blending of energies",
                              "Trine (120°): Natural harmony and flow",
                              "Square (90°): Dynamic tension requiring work",
                              "Opposition (180°): Attraction with need for balance"
                            ]}
                            tier="premium"
                          />
                        </Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        {compatibilityAspects.map((aspect, index) => (
                          <Box key={index}>
                            <HStack justify="space-between" mb={1}>
                              <Text fontSize="sm" fontWeight="medium">{aspect.aspect}</Text>
                              <Badge colorScheme={aspect.score > 80 ? 'green' : 'orange'}>
                                {aspect.score}%
                              </Badge>
                            </HStack>
                            <Progress value={aspect.score} size="sm" colorScheme={aspect.score > 80 ? 'green' : 'orange'} />
                            <Text fontSize="xs" color="gray.500" mt={1}>{aspect.description}</Text>
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <Card bg={cardBg} shadow="lg" w="full">
                  <CardHeader>
                    <Heading size="md">
                      Detailed Synastry Insights
                      <EducationalTooltip
                        title="Relationship Analysis"
                        description="These insights combine multiple astrological factors to provide a comprehensive view of your relationship dynamics."
                        tier="premium"
                      />
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <Stack spacing={4}>
                      <Box>
                        <HStack mb={2}>
                          <Text fontWeight="bold">Romantic Chemistry:</Text>
                          <EducationalTooltip
                            title="Venus-Mars Connections"
                            description="Venus represents love and attraction, Mars represents passion and desire. Their interactions show romantic and physical compatibility."
                            examples={[
                              "Venus conjunct Mars: Instant attraction",
                              "Venus trine Mars: Natural romantic flow",
                              "Venus square Mars: Passionate but challenging"
                            ]}
                          />
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Your Venus-Mars connections indicate intense physical and emotional attraction. The fire-water element balance creates both passion and depth.
                        </Text>
                      </Box>
                      <Divider />
                      <Box>
                        <HStack mb={2}>
                          <Text fontWeight="bold">Communication Style:</Text>
                          <EducationalTooltip
                            title="Mercury Aspects"
                            description="Mercury governs communication, thinking, and mental connection. Mercury aspects show how well you understand each other mentally."
                            examples={[
                              "Mercury conjunct Mercury: Think alike",
                              "Mercury trine Mercury: Easy understanding",
                              "Mercury square Mercury: Different thinking styles"
                            ]}
                          />
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Mercury aspects suggest you communicate on similar wavelengths, with potential for deep intellectual discussions and mutual understanding.
                        </Text>
                      </Box>
                      <Divider />
                      <Box>
                        <HStack mb={2}>
                          <Text fontWeight="bold">Long-term Potential:</Text>
                          <EducationalTooltip
                            title="Jupiter-Saturn Connections"
                            description="Jupiter brings growth and optimism, Saturn provides structure and commitment. Their interactions show relationship stability and growth potential."
                            examples={[
                              "Jupiter-Saturn harmony: Balanced growth and stability",
                              "Strong Saturn aspects: Serious, committed energy",
                              "Jupiter aspects: Optimism and expansion together"
                            ]}
                          />
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Jupiter-Saturn connections indicate this relationship has strong foundations for growth and commitment over time.
                        </Text>
                      </Box>
                      <Divider />
                      <Box>
                        <HStack mb={2}>
                          <Text fontWeight="bold">Areas to Develop:</Text>
                          <EducationalTooltip
                            title="Moon Sign Compatibility"
                            description="Moon signs represent emotional needs and instinctive responses. Different Moon signs can complement or challenge each other."
                            examples={[
                              "Same element Moons: Similar emotional needs",
                              "Opposite Moons: Complementary but different",
                              "Square Moons: Different emotional languages"
                            ]}
                          />
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Focus on balancing independence with togetherness. Your individual Moon signs suggest different emotional needs that can be harmonized with awareness.
                        </Text>
                      </Box>
                    </Stack>
                  </CardBody>
                </Card>
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
                  leftIcon={<FaHeart />}
                  isDisabled={!person1Data.name || !person2Data.name}
                >
                  Calculate Compatibility
                </Button>
              ) : (
                <Button 
                  colorScheme="green" 
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
