import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Container,
  Alert,
  AlertIcon,
  Divider,
  SimpleGrid,
  Icon,
  Flex
} from '@chakra-ui/react';
import { FaUser, FaStar, FaKey, FaChartLine, FaBook } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import HumanDesignChart from './HumanDesignChart';
import GeneKeysChart from './GeneKeysChart';
import EducationalContent from './EducationalContent';

interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  timezone?: string;
  lat?: number;
  lon?: number;
}

const HumanDesignGeneKeys: React.FC = () => {
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [showCalculation, setShowCalculation] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
    city: '',
    timezone: 'America/New_York'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCalculate = (): void => {
    // Validate form data
    const requiredFields = ['year', 'month', 'day', 'hour', 'minute', 'city'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.join(', ')}`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const data: BirthData = {
      year: parseInt(formData.year),
      month: parseInt(formData.month),
      day: parseInt(formData.day),
      hour: parseInt(formData.hour),
      minute: parseInt(formData.minute),
      city: formData.city,
      timezone: formData.timezone
    };

    setBirthData(data);
    setShowCalculation(true);
  };

  const handleNewCalculation = (): void => {
    setBirthData(null);
    setShowCalculation(false);
    setFormData({
      year: '',
      month: '',
      day: '',
      hour: '',
      minute: '',
      city: '',
      timezone: 'America/New_York'
    });
  };

  if (!user) {
    return (
      <Container centerContent py={10}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          Please log in to access Human Design and Gene Keys calculations.
        </Alert>
      </Container>
    );
  }

  if (showCalculation && birthData) {
    return (
      <Box minH="100vh" bg="gray.50">
        {/* Header */}
        <Box bg="gradient-to-r" bgGradient="linear(to-r, purple.600, pink.600)" color="white" py={6}>
          <Container maxW="7xl">
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={2}>
                <Heading size="lg">Human Design & Gene Keys</Heading>
                <Text>Your complete genetic blueprint and consciousness codes</Text>
              </VStack>
              <Button 
                colorScheme="whiteAlpha" 
                variant="outline" 
                onClick={handleNewCalculation}
              >
                New Calculation
              </Button>
            </Flex>
          </Container>
        </Box>

        {/* Birth Data Summary */}
        <Container maxW="7xl" py={4}>
          <Card mb={6}>
            <CardBody>
              <HStack justify="space-between">
                <HStack spacing={4}>
                  <Icon as={FaUser} color="gold.400" />
                  <Text fontWeight="bold">
                    {formData.city} • {formData.month}/{formData.day}/{formData.year} • {formData.hour}:{formData.minute.toString().padStart(2, '0')}
                  </Text>
                </HStack>
                <Badge variant="gold">
                  {formData.timezone}
                </Badge>
              </HStack>
            </CardBody>
          </Card>
        </Container>

        {/* Main Content */}
        <Container maxW="7xl" pb={10}>
          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaChartLine} />
                  <Text>Human Design</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaKey} />
                  <Text>Gene Keys</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaStar} />
                  <Text>Integration</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaBook} />
                  <Text>Learn</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0} pt={6}>
                <HumanDesignChart birthData={birthData} />
              </TabPanel>
              
              <TabPanel p={0} pt={6}>
                <GeneKeysChart birthData={birthData} />
              </TabPanel>
              
              <TabPanel p={0} pt={6}>
                <VStack spacing={6}>
                  <Card w="full">
                    <CardHeader>
                      <Heading size="lg" textAlign="center">Integration & Synthesis</Heading>
                      <Text textAlign="center" color="whiteAlpha.800">
                        How Human Design and Gene Keys work together
                      </Text>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                        <Box>
                          <Heading size="md" mb={3} color="blue.600">Human Design Focus</Heading>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" color="whiteAlpha.900">• Strategy & Authority for decision-making</Text>
                            <Text fontSize="sm" color="whiteAlpha.900">• Energy centers and how you process life</Text>
                            <Text fontSize="sm" color="whiteAlpha.900">• Gates and channels for specific traits</Text>
                            <Text fontSize="sm" color="whiteAlpha.900">• Profile lines for life purpose expression</Text>
                            <Text fontSize="sm" color="whiteAlpha.900">• Variables for health and environment</Text>
                          </VStack>
                        </Box>
                        
                        <Box>
                          <Heading size="md" mb={3} color="gold.300">Gene Keys Focus</Heading>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" color="whiteAlpha.900">• Shadow to Gift to Siddhi transformation</Text>
                            <Text fontSize="sm" color="whiteAlpha.900">• Contemplation practice for self-awareness</Text>
                            <Text fontSize="sm" color="whiteAlpha.900">• Three sequences for different intelligence types</Text>
                            <Text fontSize="sm" color="whiteAlpha.900">• Core quartet for life purpose and radiance</Text>
                            <Text fontSize="sm" color="whiteAlpha.900">• Integration path for consciousness evolution</Text>
                          </VStack>
                        </Box>
                      </SimpleGrid>
                      
                      <Divider my={6} />
                      
                      <Box textAlign="center">
                        <Heading size="md" mb={4}>Synthesis Approach</Heading>
                        <Text fontSize="lg" mb={4}>
                          Use Human Design as your practical operating manual and Gene Keys as your 
                          contemplative spiritual practice. They are complementary systems that can 
                          deepen your self-understanding and evolutionary journey.
                        </Text>
                        
                        <Alert status="info" textAlign="left">
                          <AlertIcon />
                          <VStack align="start" spacing={2}>
                            <Text fontWeight="bold">Recommended Practice:</Text>
                            <Text fontSize="sm" color="whiteAlpha.900">
                              1. Start with your Human Design strategy and authority for daily decisions
                            </Text>
                            <Text fontSize="sm" color="whiteAlpha.900">
                              2. Use Gene Keys contemplation to transform unconscious patterns
                            </Text>
                            <Text fontSize="sm" color="whiteAlpha.900">
                              3. Notice how your defined/undefined centers relate to your Gene Key shadows
                            </Text>
                            <Text fontSize="sm" color="whiteAlpha.900">
                              4. Allow both systems to guide your unique path of awakening
                            </Text>
                          </VStack>
                        </Alert>
                      </Box>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>
              
              <TabPanel p={0} pt={6}>
                <EducationalContent />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    );
  }

  return (
    <Container maxW="2xl" py={10}>
      <VStack spacing={8}>
        {/* Header */}
        <VStack spacing={4} textAlign="center">
          <Heading size="xl" variant="cosmic">
            Human Design & Gene Keys
          </Heading>
          <Text fontSize="lg" color="whiteAlpha.800">
            Discover your genetic blueprint and consciousness codes
          </Text>
          <SimpleGrid columns={2} spacing={4} w="full">
            <Card>
              <CardBody textAlign="center">
                <Icon as={FaChartLine} size="2rem" color="blue.500" mb={2} />
                <Heading size="sm" mb={2}>Human Design</Heading>
                <Text fontSize="sm" color="whiteAlpha.800">
                  Your energy type, strategy, authority, and life purpose
                </Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody textAlign="center">
                <Icon as={FaKey} size="2rem" color="gold.400" mb={2} />
                <Heading size="sm" mb={2}>Gene Keys</Heading>
                <Text fontSize="sm" color="whiteAlpha.800">
                  Shadow to Gift to Siddhi - your path to higher consciousness
                </Text>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>

        {/* Birth Data Form */}
        <Card w="full">
          <CardHeader>
            <Heading size="md">Enter Your Birth Information</Heading>
            <Text fontSize="sm" color="whiteAlpha.800">
              Accurate birth time is essential for precise calculations
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Month</FormLabel>
                  <Select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    placeholder="Month"
                    aria-label="Month"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i, 1).toLocaleDateString('en', { month: 'long' })}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Day</FormLabel>
                  <Input
                    name="day"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.day}
                    onChange={handleInputChange}
                    placeholder="Day"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Year</FormLabel>
                  <Input
                    name="year"
                    type="number"
                    min="1900"
                    max="2030"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="Year"
                  />
                </FormControl>
              </Grid>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Hour (24h)</FormLabel>
                  <Input
                    name="hour"
                    type="number"
                    min="0"
                    max="23"
                    value={formData.hour}
                    onChange={handleInputChange}
                    placeholder="Hour"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Minute</FormLabel>
                  <Input
                    name="minute"
                    type="number"
                    min="0"
                    max="59"
                    value={formData.minute}
                    onChange={handleInputChange}
                    placeholder="Minute"
                  />
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel fontSize="sm">Birth City</FormLabel>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City, State/Country"
                />
              </FormControl>

              <FormControl>
                <Select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  aria-label="Timezone"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">GMT</option>
                  <option value="Europe/Paris">Central European Time</option>
                  <option value="Asia/Tokyo">Japan Standard Time</option>
                  <option value="Australia/Sydney">Australian Eastern Time</option>
                </Select>
              </FormControl>

              <Button
                variant="cosmic"
                size="lg"
                w="full"
                onClick={handleCalculate}
              >
                Calculate Human Design & Gene Keys
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Educational Info */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" fontSize="sm">Why both systems?</Text>
            <Text fontSize="sm">
              Human Design provides your mechanical operating instructions, while Gene Keys offers 
              the contemplative path for consciousness evolution. Together, they create a complete 
              map for living your authentic purpose.
            </Text>
          </VStack>
        </Alert>
      </VStack>
    </Container>
  );
};

export default HumanDesignGeneKeys;
