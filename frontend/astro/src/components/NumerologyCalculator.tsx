import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Spinner,
  Divider,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
// import { StarIcon, InfoIcon } from '@chakra-ui/icons';
import FeatureGuard from './FeatureGuard';

interface NumerologyData {
  name: string;
  year: number;
  month: number;
  day: number;
}

interface CoreNumbers {
  life_path: {
    number: number;
    meaning: string;
    components?: { month: number; day: number; year: number };
  };
  destiny: {
    number: number;
    meaning: string;
  };
  soul_urge: {
    number: number;
    meaning: string;
  };
  personality: {
    number: number;
    meaning: string;
  };
  birth_day: {
    number: number;
    meaning: string;
  };
  attitude: {
    number: number;
    meaning: string;
  };
  power_name: {
    number: number;
    meaning: string;
  };
}

interface NumerologyResult {
  core_numbers: CoreNumbers;
  karmic_numbers: {
    karmic_debts: number[];
    karmic_lessons: number[];
    debt_meanings: string[];
    lesson_meanings: string[];
  };
  personal_year: {
    number: number;
    year: number;
    meaning: string;
  };
  challenge_numbers: {
    first_challenge: { number: number; period: string };
    second_challenge: { number: number; period: string };
    third_challenge: { number: number; period: string };
    fourth_challenge: { number: number; period: string };
    meanings: {
      first: string;
      second: string;
      third: string;
      fourth: string;
    };
  };
  pinnacle_numbers: {
    first_pinnacle: { number: number; period: string };
    second_pinnacle: { number: number; period: string };
    third_pinnacle: { number: number; period: string };
    fourth_pinnacle: { number: number; period: string };
    meanings: {
      first: string;
      second: string;
      third: string;
      fourth: string;
    };
  };
  systems: {
    pythagorean: {
      system: string;
      letter_values: Record<string, string[]>;
      total_value: number;
      characteristics: string[];
    };
    chaldean: {
      system: string;
      letter_values: Record<string, string[]>;
      total_value: number;
      chaldean_number: number;
      meaning: string;
    };
  };
  interpretation: {
    life_purpose: string;
    personality_overview: string;
    current_focus: string;
    spiritual_path: string;
  };
}

const NumerologyCalculator: React.FC = () => {
  const [formData, setFormData] = useState<NumerologyData>({
    name: '',
    year: new Date().getFullYear() - 30,
    month: 1,
    day: 1
  });
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your full name',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      // Format the birth date as YYYY-MM-DD
      const birthDate = `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(formData.day).padStart(2, '0')}`;
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/calculate-numerology`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          birth_date: birthDate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate numerology');
      }

      const data = await response.json();
      setResult(data.numerology);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to calculate numerology. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getNumberColor = (number: number): string => {
    const colors = [
      'red.500', 'orange.500', 'yellow.500', 'green.500', 'blue.500',
      'purple.500', 'pink.500', 'teal.500', 'cyan.500'
    ];
    return colors[(number - 1) % colors.length];
  };

  const CoreNumbersDisplay: React.FC<{ coreNumbers: CoreNumbers }> = ({ coreNumbers }) => (
    <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
      {Object.entries(coreNumbers).map(([key, data]) => (
        <GridItem key={key}>
          <Card variant="elevated" borderTop="4px" borderTopColor={getNumberColor(data.number)}>
            <CardHeader pb={2}>
              <HStack justify="space-between">
                <Heading size="md" textTransform="capitalize">
                  {key.replace('_', ' ')}
                </Heading>
                <Badge
                  colorScheme={data.number > 9 ? 'purple' : 'blue'}
                  fontSize="lg"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {data.number}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <Text fontSize="sm" color="whiteAlpha.800">
                {data.meaning}
              </Text>
            </CardBody>
          </Card>
        </GridItem>
      ))}
    </Grid>
  );

  const CyclesDisplay: React.FC<{ challenges: any; pinnacles: any }> = ({ challenges, pinnacles }) => (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={4} color="red.600">Life Challenges</Heading>
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
          {Object.entries(challenges).filter(([key]) => key.includes('challenge')).map(([key, data]: [string, any]) => (
            <Card key={key} variant="outline" borderColor="red.200">
              <CardBody>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Badge colorScheme="red">{data.number}</Badge>
                    <Text fontSize="sm" fontWeight="semibold">
                      {key.replace('_', ' ').replace('challenge', '').trim()} Challenge
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">{data.period}</Text>
                  <Text fontSize="sm">{challenges.meanings[key.replace('_challenge', '')]}</Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Box>
      
      <Box>
        <Heading size="md" mb={4} color="green.600">Life Pinnacles</Heading>
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
          {Object.entries(pinnacles).filter(([key]) => key.includes('pinnacle')).map(([key, data]: [string, any]) => (
            <Card key={key} variant="outline" borderColor="green.200">
              <CardBody>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Badge colorScheme="green">{data.number}</Badge>
                    <Text fontSize="sm" fontWeight="semibold">
                      {key.replace('_', ' ').replace('pinnacle', '').trim()} Pinnacle
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">{data.period}</Text>
                  <Text fontSize="sm">{pinnacles.meanings[key.replace('_pinnacle', '')]}</Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Box>
    </VStack>
  );

  const SystemsDisplay: React.FC<{ systems: NumerologyResult['systems'] }> = ({ systems }) => (
    <VStack spacing={6} align="stretch">
      {Object.entries(systems).map(([systemName, systemData]) => {
        const isChaldean = systemName === 'chaldean';
        
        if (isChaldean) {
          return (
            <FeatureGuard 
              key={systemName}
              requiredTier="premium"
              feature="Chaldean Numerology System"
              upgradeMessage="Unlock the ancient Chaldean numerology system for deeper insights"
            >
              <Card variant="outline">
                <CardHeader>
                  <Heading size="md" textTransform="capitalize">{systemName} System</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <HStack>
                      <Text fontWeight="semibold">Total Value:</Text>
                      <Badge colorScheme="blue">{systemData.total_value}</Badge>
                    </HStack>
                    
                    {'characteristics' in systemData && systemData.characteristics && (
                      <Box>
                        <Text fontWeight="semibold" mb={2}>Characteristics:</Text>
                        <List spacing={1}>
                          {systemData.characteristics.map((char: string, index: number) => (
                            <ListItem key={index} fontSize="sm">
                              <ListIcon as={StarIcon} color="orange.500" />
                              {char}
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    {'meaning' in systemData && systemData.meaning && (
                      <Box>
                        <Text fontWeight="semibold">Meaning:</Text>
                        <Text fontSize="sm" color="whiteAlpha.800">{systemData.meaning}</Text>
                      </Box>
                    )}
                    
                    {'chaldean_number' in systemData && (
                      <HStack>
                        <Text fontWeight="semibold">Chaldean Number:</Text>
                        <Badge colorScheme="purple">{systemData.chaldean_number}</Badge>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </FeatureGuard>
          );
        }
        
        return (
          <Card key={systemName} variant="outline">
            <CardHeader>
              <Heading size="md" textTransform="capitalize">{systemName} System</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Text fontWeight="semibold">Total Value:</Text>
                  <Badge colorScheme="blue">{systemData.total_value}</Badge>
                </HStack>
                
                {'characteristics' in systemData && systemData.characteristics && (
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Characteristics:</Text>
                    <List spacing={1}>
                      {systemData.characteristics.map((char: string, index: number) => (
                        <ListItem key={index} fontSize="sm">
                          <ListIcon as={StarIcon} color="orange.500" />
                          {char}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {'meaning' in systemData && systemData.meaning && (
                  <Box>
                    <Text fontWeight="semibold">Meaning:</Text>
                    <Text fontSize="sm" color="whiteAlpha.800">{systemData.meaning}</Text>
                  </Box>
                )}
                
                {'chaldean_number' in systemData && (
                  <HStack>
                    <Text fontWeight="semibold">Chaldean Number:</Text>
                    <Badge colorScheme="purple">{systemData.chaldean_number}</Badge>
                  </HStack>
                )}
              </VStack>
            </CardBody>
          </Card>
        );
      })}
    </VStack>
  );

  return (
    <Box maxW="6xl" mx="auto" p={6}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={4} bgGradient="linear(to-r, purple.600, pink.600)" bgClip="text">
            🔢 Numerology Calculator
          </Heading>
          <Text color="whiteAlpha.800" maxW="2xl" mx="auto">
            Discover the hidden meanings in your name and birth date through the ancient wisdom of numerology.
            Explore Pythagorean and Chaldean systems for comprehensive insights.
          </Text>
        </Box>

        <Card variant="elevated" bg="white">
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 1fr" }} gap={4} w="full">
                  <Box>
                    <Text mb={2} fontWeight="semibold">Full Name *</Text>
                    <Input
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      bg="gray.50"
                      border="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: "purple.500", bg: "white" }}
                    />
                  </Box>
                  
                  <Box>
                    <Text mb={2} fontWeight="semibold">Birth Year</Text>
                    <Input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.year}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setFormData({ ...formData, year: isNaN(value) ? new Date().getFullYear() - 30 : value });
                      }}
                      bg="gray.50"
                      border="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: "purple.500", bg: "white" }}
                    />
                  </Box>
                  
                  <Box>
                    <Text mb={2} fontWeight="semibold">Birth Month</Text>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.month}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setFormData({ ...formData, month: isNaN(value) ? 1 : value });
                      }}
                      bg="gray.50"
                      border="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: "purple.500", bg: "white" }}
                    />
                  </Box>
                  
                  <Box>
                    <Text mb={2} fontWeight="semibold">Birth Day</Text>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.day}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setFormData({ ...formData, day: isNaN(value) ? 1 : value });
                      }}
                      bg="gray.50"
                      border="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: "purple.500", bg: "white" }}
                    />
                  </Box>
                </Grid>

                <Button
                  type="submit"
                  size="lg"
                  colorScheme="purple"
                  isLoading={loading}
                  loadingText="Calculating..."
                  leftIcon={<StarIcon />}
                  bgGradient="linear(to-r, purple.600, pink.600)"
                  _hover={{ bgGradient: "linear(to-r, purple.700, pink.700)" }}
                >
                  Calculate Numerology
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        {loading && (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" color="purple.500" thickness="4px" />
            <Text mt={4} color="whiteAlpha.800">Calculating your numerological profile...</Text>
          </Box>
        )}

        {result && (
          <Tabs variant="enclosed" colorScheme="purple">
            <TabList flexWrap="wrap">
              <Tab>Core Numbers</Tab>
              <Tab>Life Cycles</Tab>
              <Tab>Personal Year</Tab>
              <Tab>Karmic Numbers</Tab>
              <Tab>Number Systems</Tab>
              <Tab>Interpretation</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <CoreNumbersDisplay coreNumbers={result.core_numbers} />
              </TabPanel>

              <TabPanel>
                <CyclesDisplay 
                  challenges={result.challenge_numbers} 
                  pinnacles={result.pinnacle_numbers} 
                />
              </TabPanel>

              <TabPanel>
                <Card variant="elevated" borderTop="4px" borderTopColor="orange.500">
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Personal Year {result.personal_year.year}</Heading>
                      <Badge colorScheme="orange" fontSize="xl" px={4} py={2} borderRadius="full">
                        {result.personal_year.number}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Text color="whiteAlpha.800">{result.personal_year.meaning}</Text>
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {result.karmic_numbers.karmic_debts.length > 0 && (
                    <Alert status="warning" borderRadius="lg">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Karmic Debts</AlertTitle>
                        <AlertDescription>
                          Numbers: {result.karmic_numbers.karmic_debts.join(', ')}
                          <VStack align="start" mt={2} spacing={1}>
                            {result.karmic_numbers.debt_meanings.map((meaning, index) => (
                              <Text key={index} fontSize="sm">• {meaning}</Text>
                            ))}
                          </VStack>
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {result.karmic_numbers.karmic_lessons.length > 0 && (
                    <Alert status="info" borderRadius="lg">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Karmic Lessons</AlertTitle>
                        <AlertDescription>
                          Missing Numbers: {result.karmic_numbers.karmic_lessons.join(', ')}
                          <VStack align="start" mt={2} spacing={1}>
                            {result.karmic_numbers.lesson_meanings.map((meaning, index) => (
                              <Text key={index} fontSize="sm">• {meaning}</Text>
                            ))}
                          </VStack>
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {result.karmic_numbers.karmic_debts.length === 0 && result.karmic_numbers.karmic_lessons.length === 0 && (
                    <Alert status="success" borderRadius="lg">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Clear Karmic Path</AlertTitle>
                        <AlertDescription>
                          You have no significant karmic debts or lessons indicated in your numerology chart.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              <TabPanel>
                <SystemsDisplay systems={result.systems} />
              </TabPanel>

              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {Object.entries(result.interpretation).map(([key, value]) => (
                    <Card key={key} variant="outline" borderLeft="4px" borderLeftColor="purple.500">
                      <CardBody>
                        <VStack align="start" spacing={2}>
                          <Heading size="sm" textTransform="capitalize" color="purple.600">
                            {key.replace('_', ' ')}
                          </Heading>
                          <Text color="gray.700">{value}</Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </VStack>
    </Box>
  );
};

export default NumerologyCalculator;
