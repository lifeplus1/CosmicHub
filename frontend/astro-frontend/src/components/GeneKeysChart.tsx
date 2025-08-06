import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
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
  Spinner,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Tooltip,
  Divider,
  SimpleGrid,
  Container,
  Flex,
  Icon
} from '@chakra-ui/react';
import { FaLeaf, FaGem, FaSun } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { calculateGeneKeys } from '../services/api';

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

interface GeneKey {
  number: number;
  name: string;
  shadow: string;
  gift: string;
  siddhi: string;
  codon: string;
  description: string;
}

interface Sequence {
  name: string;
  description: string;
  keys: GeneKey[];
}

interface GeneKeysData {
  life_work: GeneKey;
  evolution: GeneKey;
  radiance: GeneKey;
  purpose: GeneKey;
  activation: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  iq: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  eq: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  sq: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  contemplation_sequence: string[];
  hologenetic_profile: {
    description: string;
    integration_path: string[];
  };
}

interface Props {
  birthData?: BirthData;
  onCalculate?: (data: BirthData) => void;
}

const GeneKeysChart: React.FC<Props> = ({ birthData, onCalculate }) => {
  const [geneKeysData, setGeneKeysData] = useState<GeneKeysData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<GeneKey | null>(null);
  const { user } = useAuth();
  const toast = useToast();

  const handleCalculate = async () => {
    if (!birthData) return;

    setLoading(true);
    setError(null);

    try {
      const response = await calculateGeneKeys(birthData);
      setGeneKeysData(response.gene_keys);
      
      toast({
        title: "Gene Keys Calculated",
        description: "Your Gene Keys profile has been generated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate Gene Keys';
      setError(errorMessage);
      toast({
        title: "Calculation Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (birthData) {
      handleCalculate();
    }
  }, [birthData]);

  const renderGeneKey = (geneKey: GeneKey, title: string, description?: string) => (
    <Card 
      cursor="pointer" 
      onClick={() => setSelectedKey(geneKey)}
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <CardHeader pb={2}>
        <Heading size="md" color="purple.600">{title}</Heading>
        <Text fontSize="sm" color="gray.700">{description}</Text>
      </CardHeader>
      <CardBody pt={0}>
        <VStack align="stretch" spacing={3}>
          <Box textAlign="center">
            <Badge colorScheme="purple" fontSize="lg" px={3} py={1}>
              Gene Key {geneKey.number}
            </Badge>
            <Heading size="sm" mt={2}>{geneKey.name}</Heading>
          </Box>
          
          <Grid templateColumns="repeat(3, 1fr)" gap={2} textAlign="center">
            <VStack spacing={1}>
              <Icon as={FaLeaf} color="red.500" />
              <Text fontSize="xs" fontWeight="bold" color="red.600">SHADOW</Text>
              <Text fontSize="xs">{geneKey.shadow}</Text>
            </VStack>
            <VStack spacing={1}>
              <Icon as={FaGem} color="green.500" />
              <Text fontSize="xs" fontWeight="bold" color="green.600">GIFT</Text>
              <Text fontSize="xs">{geneKey.gift}</Text>
            </VStack>
            <VStack spacing={1}>
              <Icon as={FaSun} color="gold" />
              <Text fontSize="xs" fontWeight="bold" color="yellow.600">SIDDHI</Text>
              <Text fontSize="xs">{geneKey.siddhi}</Text>
            </VStack>
          </Grid>
        </VStack>
      </CardBody>
    </Card>
  );

  const renderSequence = (sequence: any, title: string) => (
    <Card>
      <CardHeader>
        <Heading size="md">{title}</Heading>
        <Text fontSize="sm" color="gray.700">{sequence.description}</Text>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {sequence.keys.map((key: GeneKey, index: number) => (
            <Box 
              key={index}
              p={3} 
              border="1px" 
              borderColor="gray.200" 
              borderRadius="md"
              cursor="pointer"
              onClick={() => setSelectedKey(key)}
              _hover={{ borderColor: 'purple.300', bg: 'purple.50' }}
            >
              <VStack spacing={2}>
                <Badge colorScheme="purple">Gene Key {key.number}</Badge>
                <Text fontSize="sm" fontWeight="bold" textAlign="center">
                  {key.name}
                </Text>
                <HStack spacing={1} fontSize="xs">
                  <Text color="red.600">{key.shadow}</Text>
                  <Text>•</Text>
                  <Text color="green.600">{key.gift}</Text>
                  <Text>•</Text>
                  <Text color="yellow.600">{key.siddhi}</Text>
                </HStack>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" color="purple.500" />
        <Text mt={4}>Calculating your Gene Keys profile...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (!geneKeysData) {
    return (
      <Container centerContent py={10}>
        <Text fontSize="lg" color="gray.700" textAlign="center">
          Enter your birth information to calculate your Gene Keys profile
        </Text>
        {onCalculate && (
          <Button mt={4} variant="cosmic" onClick={() => onCalculate({} as BirthData)}>
            Calculate Gene Keys
          </Button>
        )}
      </Container>
    );
  }

  return (
    <Box maxW="7xl" mx="auto" p={6}>
      {/* Header */}
      <Card mb={6} bg="gradient-to-r" bgGradient="linear(to-r, purple.500, pink.500)">
        <CardBody>
          <VStack spacing={4} color="white" textAlign="center">
            <Heading size="xl">Your Gene Keys Profile</Heading>
            <Text fontSize="lg">
              A journey from Shadow through Gift to Siddhi - your genetic pathway to higher consciousness
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Core Quartet */}
      <VStack spacing={6} mb={8}>
        <Heading size="lg" textAlign="center">Core Quartet - Your Hologenetic Profile</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
          {renderGeneKey(geneKeysData.life_work, "Life's Work", "Your deepest calling and contribution")}
          {renderGeneKey(geneKeysData.evolution, "Evolution", "Your genetic pathway of growth")}
          {renderGeneKey(geneKeysData.radiance, "Radiance", "Your highest expression and magnetism")}
          {renderGeneKey(geneKeysData.purpose, "Purpose", "Your reason for being here")}
        </SimpleGrid>
      </VStack>

      <Tabs variant="enclosed" colorScheme="purple">
        <TabList>
          <Tab>Sequences</Tab>
          <Tab>Contemplation</Tab>
          <Tab>Integration</Tab>
          <Tab>Gene Key Details</Tab>
        </TabList>

        <TabPanels>
          {/* Sequences Tab */}
          <TabPanel>
            <VStack spacing={8}>
              {renderSequence(geneKeysData.activation, "Activation Sequence (IQ)")}
              {renderSequence(geneKeysData.iq, "IQ Sequence (Mental Intelligence)")}
              {renderSequence(geneKeysData.eq, "EQ Sequence (Emotional Intelligence)")}
              {renderSequence(geneKeysData.sq, "SQ Sequence (Somatic Intelligence)")}
            </VStack>
          </TabPanel>

          {/* Contemplation Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="lg">Contemplation Sequence</Heading>
                <Text color="gray.700">Your personalized order for Gene Keys study</Text>
              </CardHeader>
              <CardBody>
                <Text mb={6}>
                  The Gene Keys are designed to be contemplated in a specific sequence based on your 
                  birth data. This order creates a natural flow of understanding and transformation.
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {geneKeysData.contemplation_sequence.map((keyNum, index) => (
                    <Box 
                      key={index}
                      p={4} 
                      bg="purple.50" 
                      borderRadius="md"
                      border="1px"
                      borderColor="purple.200"
                    >
                      <VStack spacing={2}>
                        <Badge colorScheme="purple" fontSize="md">
                          Step {index + 1}
                        </Badge>
                        <Text fontWeight="bold">Gene Key {keyNum}</Text>
                        <Text fontSize="sm" color="gray.700" textAlign="center">
                          Contemplate for 7 days minimum
                        </Text>
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
                
                <Alert status="info" mt={6}>
                  <AlertIcon />
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Contemplation Practice:</Text>
                    <Text fontSize="sm">
                      Spend 7+ days with each Gene Key. Read the description, observe how its 
                      Shadow-Gift-Siddhi spectrum shows up in your life, and allow insights to arise naturally.
                    </Text>
                  </VStack>
                </Alert>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Integration Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="lg">Integration Path</Heading>
                <Text color="gray.700">Your journey of embodiment and mastery</Text>
              </CardHeader>
              <CardBody>
                <Text fontSize="lg" mb={6}>
                  {geneKeysData.hologenetic_profile.description}
                </Text>
                
                <Heading size="md" mb={4}>Integration Steps</Heading>
                <VStack align="stretch" spacing={4}>
                  {geneKeysData.hologenetic_profile.integration_path.map((step, index) => (
                    <Box 
                      key={index}
                      p={4} 
                      bg="gradient-to-r"
                      bgGradient={`linear(to-r, purple.${50 + index * 50}, pink.${50 + index * 50})`}
                      borderRadius="md"
                      border="1px"
                      borderColor="purple.200"
                    >
                      <HStack>
                        <Badge colorScheme="purple" fontSize="md">
                          Phase {index + 1}
                        </Badge>
                        <Text fontWeight="bold">{step}</Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
                
                <Alert status="success" mt={6}>
                  <AlertIcon />
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Remember:</Text>
                    <Text fontSize="sm">
                      The Gene Keys are not about becoming something new, but about remembering 
                      and embodying what you already are at the deepest level.
                    </Text>
                  </VStack>
                </Alert>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Gene Key Details Tab */}
          <TabPanel>
            {selectedKey ? (
              <Card>
                <CardHeader>
                  <Heading size="lg">Gene Key {selectedKey.number}: {selectedKey.name}</Heading>
                  <Text color="gray.700">Codon: {selectedKey.codon}</Text>
                </CardHeader>
                <CardBody>
                  <Text fontSize="lg" mb={6}>{selectedKey.description}</Text>
                  
                  <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                    <Card bg="red.50" borderColor="red.200" border="1px">
                      <CardHeader pb={2}>
                        <HStack>
                          <Icon as={FaLeaf} color="red.500" />
                          <Heading size="md" color="red.600">Shadow</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody pt={0}>
                        <Text fontWeight="bold" mb={2}>{selectedKey.shadow}</Text>
                        <Text fontSize="sm">
                          The unconscious, reactive pattern that creates suffering and limitation.
                        </Text>
                      </CardBody>
                    </Card>
                    
                    <Card bg="green.50" borderColor="green.200" border="1px">
                      <CardHeader pb={2}>
                        <HStack>
                          <Icon as={FaGem} color="green.500" />
                          <Heading size="md" color="green.600">Gift</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody pt={0}>
                        <Text fontWeight="bold" mb={2}>{selectedKey.gift}</Text>
                        <Text fontSize="sm">
                          The conscious, stable frequency that serves yourself and others.
                        </Text>
                      </CardBody>
                    </Card>
                    
                    <Card bg="yellow.50" borderColor="yellow.200" border="1px">
                      <CardHeader pb={2}>
                        <HStack>
                          <Icon as={FaSun} color="yellow.500" />
                          <Heading size="md" color="yellow.600">Siddhi</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody pt={0}>
                        <Text fontWeight="bold" mb={2}>{selectedKey.siddhi}</Text>
                        <Text fontSize="sm">
                          The superconsious, transcendent state of pure being and service.
                        </Text>
                      </CardBody>
                    </Card>
                  </Grid>
                </CardBody>
              </Card>
            ) : (
              <Alert status="info">
                <AlertIcon />
                Click on any Gene Key above to see detailed information about its Shadow, Gift, and Siddhi.
              </Alert>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default GeneKeysChart;
