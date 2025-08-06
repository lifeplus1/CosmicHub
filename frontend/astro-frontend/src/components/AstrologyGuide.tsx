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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Badge,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Divider,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import { 
  FaSun, 
  FaMoon, 
  FaStar, 
  FaGlobe, 
  FaHeart, 
  FaUsers, 
  FaClock, 
  FaBrain,
  FaBook,
  FaQuestionCircle,
  FaCheckCircle,
  FaLightbulb
} from 'react-icons/fa';

interface AstrologyGuideProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: number;
}

export const AstrologyGuide: React.FC<AstrologyGuideProps> = ({ 
  isOpen, 
  onClose, 
  initialTab = 0 
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const cardBg = useColorModeValue('white', 'gray.800');

  const fundamentals = [
    {
      title: 'The Birth Chart',
      icon: FaSun,
      description: 'A snapshot of the sky at your exact moment of birth',
      details: [
        'Based on your birth date, time, and location',
        'Shows positions of planets, signs, and houses',
        'Forms the foundation of all astrological analysis',
        'Unique to you - like a cosmic fingerprint'
      ]
    },
    {
      title: 'The 12 Zodiac Signs',
      icon: FaStar,
      description: 'Energy patterns that color planetary influences',
      details: [
        'Aries through Pisces - each with unique characteristics',
        'Four elements: Fire, Earth, Air, Water',
        'Three modalities: Cardinal, Fixed, Mutable',
        'Signs show HOW planetary energies express'
      ]
    },
    {
      title: 'The Planets',
      icon: FaGlobe,
      description: 'Cosmic actors representing different life themes',
      details: [
        'Sun: Core identity and life purpose',
        'Moon: Emotions and instinctive responses',
        'Mercury: Communication and thinking',
        'Venus: Love, beauty, and values',
        'Mars: Action, drive, and passion',
        'Jupiter: Growth, wisdom, and expansion',
        'Saturn: Structure, discipline, and lessons',
        'Uranus, Neptune, Pluto: Generational influences'
      ]
    },
    {
      title: 'The 12 Houses',
      icon: FaMoon,
      description: 'Life areas where planetary energies play out',
      details: [
        '1st House: Self and appearance',
        '2nd House: Money and possessions',
        '3rd House: Communication and siblings',
        '4th House: Home and family',
        '5th House: Creativity and romance',
        '6th House: Work and health',
        '7th House: Partnerships and marriage',
        '8th House: Transformation and shared resources',
        '9th House: Philosophy and higher learning',
        '10th House: Career and reputation',
        '11th House: Friends and hopes',
        '12th House: Spirituality and hidden things'
      ]
    }
  ];

  const premiumFeatures = [
    {
      title: 'Synastry Analysis',
      icon: FaHeart,
      tier: 'Premium',
      description: 'Relationship compatibility through chart comparison',
      benefits: [
        'Compare two birth charts for relationship insights',
        'Understand romantic compatibility patterns',
        'Identify strengths and challenges in relationships',
        'Learn about communication styles and emotional needs'
      ],
      howItWorks: 'Synastry overlays two birth charts to analyze how planets from one chart interact with planets in another, revealing the dynamics between two people.'
    },
    {
      title: 'Transit Analysis',
      icon: FaClock,
      tier: 'Elite',
      description: 'Predictive timing through current planetary movements',
      benefits: [
        'Understand current cosmic influences in your life',
        'Plan important decisions with astrological timing',
        'Predict challenges and opportunities ahead',
        'Align actions with cosmic cycles for better outcomes'
      ],
      howItWorks: 'Transits track current planetary positions and how they interact with your birth chart, revealing timing for life events and personal growth.'
    },
    {
      title: 'AI Interpretations',
      icon: FaBrain,
      tier: 'Elite',
      description: 'Advanced insights powered by artificial intelligence',
      benefits: [
        'Get personalized interpretations of your chart',
        'Ask specific questions about your astrological patterns',
        'Receive detailed personality analysis',
        'Understand complex astrological combinations'
      ],
      howItWorks: 'Our AI analyzes thousands of astrological factors in your chart to provide nuanced, personalized interpretations that would take hours for a human astrologer.'
    }
  ];

  const houseSystems = [
    {
      name: 'Placidus',
      description: 'Most popular modern system, time-based division',
      bestFor: 'General personality analysis and psychological astrology',
      pros: ['Widely used and understood', 'Good for psychological interpretation'],
      cons: ['Can create very large/small houses in extreme latitudes']
    },
    {
      name: 'Whole Sign',
      description: 'Ancient system where each sign equals one house',
      bestFor: 'Traditional astrology and timing techniques',
      pros: ['Simple and clear', 'Works well with traditional techniques'],
      cons: ['Houses may not align with angles precisely']
    },
    {
      name: 'Equal House',
      description: 'Each house is exactly 30 degrees from the Ascendant',
      bestFor: 'Balanced analysis when birth time is approximate',
      pros: ['Equal emphasis on all life areas', 'Good for uncertain birth times'],
      cons: ['Midheaven may fall in different house than 10th']
    },
    {
      name: 'Koch',
      description: 'Time-based system similar to Placidus',
      bestFor: 'Detailed personality analysis in moderate latitudes',
      pros: ['Handles extreme latitudes better than Placidus'],
      cons: ['Less commonly used, fewer interpretive resources']
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <HStack>
            <Icon as={FaBook} color="purple.500" />
            <Text>Astrology Learning Center</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
            <TabList>
              <Tab>Fundamentals</Tab>
              <Tab>Premium Features</Tab>
              <Tab>House Systems</Tab>
              <Tab>Tips & Best Practices</Tab>
            </TabList>

            <TabPanels>
              {/* Fundamentals Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Box textAlign="center">
                    <Heading size="md" mb={2}>Astrology Fundamentals</Heading>
                    <Text color="whiteAlpha.800">
                      Master the building blocks of astrological understanding
                    </Text>
                  </Box>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {fundamentals.map((item, index) => (
                      <Card key={index} bg={cardBg} shadow="md">
                        <CardHeader>
                          <HStack>
                            <Icon as={item.icon} color="purple.500" boxSize={6} />
                            <Heading size="sm">{item.title}</Heading>
                          </HStack>
                          <Text fontSize="sm" color="whiteAlpha.800" mt={2}>
                            {item.description}
                          </Text>
                        </CardHeader>
                        <CardBody pt={0}>
                          <List spacing={2}>
                            {item.details.map((detail, idx) => (
                              <ListItem key={idx} fontSize="sm">
                                <ListIcon as={FaCheckCircle} color="green.500" />
                                {detail}
                              </ListItem>
                            ))}
                          </List>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Premium Features Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Box textAlign="center">
                    <Heading size="md" mb={2}>Premium Astrology Features</Heading>
                    <Text color="whiteAlpha.800">
                      Advanced tools for deeper astrological insights
                    </Text>
                  </Box>

                  <VStack spacing={6}>
                    {premiumFeatures.map((feature, index) => (
                      <Card key={index} bg={cardBg} shadow="md" w="full">
                        <CardHeader>
                          <HStack justify="space-between">
                            <HStack>
                              <Icon as={feature.icon} color="purple.500" boxSize={6} />
                              <VStack align="start" spacing={0}>
                                <Heading size="sm">{feature.title}</Heading>
                                <Text fontSize="sm" color="whiteAlpha.800">
                                  {feature.description}
                                </Text>
                              </VStack>
                            </HStack>
                            <Badge 
                              variant={feature.tier === 'Elite' ? 'gold' : 'cosmic'}
                              size="sm"
                            >
                              {feature.tier === 'Elite' ? '👑' : '🌟'} {feature.tier}
                            </Badge>
                          </HStack>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack spacing={4} align="stretch">
                            <Box>
                              <Text fontSize="sm" fontWeight="bold" mb={2} color="whiteAlpha.900">How it works:</Text>
                              <Text fontSize="sm" color="whiteAlpha.800">
                                {feature.howItWorks}
                              </Text>
                            </Box>
                            <Divider />
                            <Box>
                              <Text fontSize="sm" fontWeight="bold" mb={2}>Benefits:</Text>
                              <List spacing={1}>
                                {feature.benefits.map((benefit, idx) => (
                                  <ListItem key={idx} fontSize="sm">
                                    <ListIcon as={FaCheckCircle} color="green.500" />
                                    {benefit}
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </VStack>
              </TabPanel>

              {/* House Systems Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Box textAlign="center">
                    <Heading size="md" mb={2}>House Systems Explained</Heading>
                    <Text color="whiteAlpha.800">
                      Choose the right house system for your astrological practice
                    </Text>
                  </Box>

                  <Accordion allowMultiple>
                    {houseSystems.map((system, index) => (
                      <AccordionItem key={index}>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <HStack>
                              <Text fontWeight="bold">{system.name}</Text>
                              <Text fontSize="sm" color="whiteAlpha.800">
                                - {system.description}
                              </Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <VStack spacing={4} align="stretch">
                            <Box>
                              <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                Best for: {system.bestFor}
                              </Text>
                            </Box>
                            
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <Box>
                                <Text fontSize="sm" fontWeight="bold" color="green.600" mb={2}>
                                  Advantages:
                                </Text>
                                <List spacing={1}>
                                  {system.pros.map((pro, idx) => (
                                    <ListItem key={idx} fontSize="sm">
                                      <ListIcon as={FaCheckCircle} color="green.500" />
                                      {pro}
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                              
                              <Box>
                                <Text fontSize="sm" fontWeight="bold" color="orange.600" mb={2}>
                                  Considerations:
                                </Text>
                                <List spacing={1}>
                                  {system.cons.map((con, idx) => (
                                    <ListItem key={idx} fontSize="sm">
                                      <ListIcon as={FaQuestionCircle} color="orange.500" />
                                      {con}
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            </SimpleGrid>
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </VStack>
              </TabPanel>

              {/* Tips & Best Practices Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Box textAlign="center">
                    <Heading size="md" mb={2}>Tips & Best Practices</Heading>
                    <Text color="whiteAlpha.800">
                      Get the most accurate and meaningful results from your charts
                    </Text>
                  </Box>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Card bg={cardBg} shadow="md">
                      <CardHeader>
                        <HStack>
                          <Icon as={FaLightbulb} color="yellow.500" boxSize={6} />
                          <Heading size="sm">Accurate Birth Data</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody pt={0}>
                        <List spacing={2}>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Use exact birth time when possible (within 4 minutes)
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Check birth certificate for official time
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Consider timezone and daylight saving changes
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Use hospital of birth, not home address
                          </ListItem>
                        </List>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} shadow="md">
                      <CardHeader>
                        <HStack>
                          <Icon as={FaUsers} color="blue.500" boxSize={6} />
                          <Heading size="sm">Interpretation Guidelines</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody pt={0}>
                        <List spacing={2}>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Focus on major aspects (conjunction, opposition, square, trine, sextile)
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Consider the whole chart, not isolated elements
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Remember astrology shows potentials, not fixed fate
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Use astrology for self-understanding and growth
                          </ListItem>
                        </List>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} shadow="md">
                      <CardHeader>
                        <HStack>
                          <Icon as={FaClock} color="purple.500" boxSize={6} />
                          <Heading size="sm">When to Use Transit Analysis</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody pt={0}>
                        <List spacing={2}>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Planning major life decisions
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Understanding current challenges
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Timing important events (launches, moves, etc.)
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Personal growth and spiritual development
                          </ListItem>
                        </List>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} shadow="md">
                      <CardHeader>
                        <HStack>
                          <Icon as={FaHeart} color="pink.500" boxSize={6} />
                          <Heading size="sm">Synastry Best Practices</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody pt={0}>
                        <List spacing={2}>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Both partners need accurate birth data
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Focus on Moon, Venus, Mars connections
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Consider composite charts for relationship essence
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FaCheckCircle} color="green.500" />
                            Remember compatibility isn't just about "good" aspects
                          </ListItem>
                        </List>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const useAstrologyGuide = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const openGuide = (tabIndex: number = 0) => {
    onOpen();
  };
  
  return { isOpen, onClose, openGuide };
};
