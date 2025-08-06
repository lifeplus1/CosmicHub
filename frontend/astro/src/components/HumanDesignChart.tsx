import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { calculateHumanDesign } from '../services/api';

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

interface HumanDesignData {
  type: string;
  strategy: string;
  authority: string;
  profile: {
    line1: number;
    line2: number;
    description: string;
  };
  defined_centers: string[];
  undefined_centers: string[];
  channels: any[];
  gates: any[];
  incarnation_cross: {
    name: string;
    description: string;
    gates: Record<string, number>;
  };
  variables: any;
  not_self_theme: string;
  signature: string;
}

interface Props {
  birthData?: BirthData;
  onCalculate?: (data: BirthData) => void;
}

const HumanDesignChart: React.FC<Props> = ({ birthData, onCalculate }) => {
  const [humanDesignData, setHumanDesignData] = useState<HumanDesignData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const toast = useToast();

  const handleCalculate = async () => {
    if (!birthData) return;

    setLoading(true);
    setError(null);

    try {
      const response = await calculateHumanDesign(birthData);
      setHumanDesignData(response.human_design);
      
      toast({
        title: "Human Design Calculated",
        description: "Your Human Design chart has been generated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate Human Design';
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

  const getCenterColor = (centerName: string, isActive: boolean) => {
    const colors = {
      'Head': isActive ? 'yellow.400' : 'gray.200',
      'Ajna': isActive ? 'green.400' : 'gray.200',
      'Throat': isActive ? 'brown.400' : 'gray.200',
      'G': isActive ? 'yellow.400' : 'gray.200',
      'Heart': isActive ? 'red.400' : 'gray.200',
      'Spleen': isActive ? 'brown.400' : 'gray.200',
      'Solar Plexus': isActive ? 'orange.400' : 'gray.200',
      'Sacral': isActive ? 'red.400' : 'gray.200',
      'Root': isActive ? 'brown.400' : 'gray.200'
    };
    return colors[centerName as keyof typeof colors] || 'gray.200';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Manifestor': 'red.500',
      'Generator': 'orange.500',
      'Manifesting Generator': 'orange.600',
      'Projector': 'green.500',
      'Reflector': 'blue.500'
    };
    return colors[type as keyof typeof colors] || 'gray.500';
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="purple.500" />
        <Text mt={4}>Calculating your Human Design chart...</Text>
      </Box>
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

  if (!humanDesignData) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.700">
          Enter your birth information to calculate your Human Design chart
        </Text>
        {onCalculate && (
          <Button mt={4} variant="cosmic" onClick={() => onCalculate({} as BirthData)}>
            Calculate Human Design
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box maxW="6xl" mx="auto" p={6}>
      {/* Header with Type and Strategy */}
      <Card mb={6}>
        <CardHeader>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="lg">Your Human Design</Heading>
              <Badge 
                variant="solid"
                colorScheme={getTypeColor(humanDesignData.type)} 
                fontSize="lg" 
                px={3} 
                py={1}
                borderRadius="full"
              >
                {humanDesignData.type}
              </Badge>
            </VStack>
            <VStack align="end" spacing={1}>
              <Text fontSize="sm" color="gray.700">Strategy</Text>
              <Text fontWeight="bold">{humanDesignData.strategy}</Text>
            </VStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            <Stat>
              <StatLabel>Authority</StatLabel>
              <StatNumber fontSize="md">{humanDesignData.authority}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Signature</StatLabel>
              <StatNumber fontSize="md">{humanDesignData.signature}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Not-Self Theme</StatLabel>
              <StatNumber fontSize="md">{humanDesignData.not_self_theme}</StatNumber>
            </Stat>
          </Grid>
        </CardBody>
      </Card>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Centers</Tab>
          <Tab>Profile</Tab>
          <Tab>Incarnation Cross</Tab>
          <Tab>Gates & Channels</Tab>
          <Tab>Variables</Tab>
        </TabList>

        <TabPanels>
          {/* Centers Tab */}
          <TabPanel>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <Card>
                <CardHeader>
                  <Heading size="md" color="green.600">Defined Centers</Heading>
                  <Text fontSize="sm" color="gray.700">
                    Consistent energy - your reliable traits
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    {humanDesignData.defined_centers.map((center, index) => (
                      <Box
                        key={index}
                        p={3}
                        bg={getCenterColor(center, true)}
                        borderRadius="md"
                        color="white"
                        fontWeight="bold"
                      >
                        {center}
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md" color="blue.600">Undefined Centers</Heading>
                  <Text fontSize="sm" color="gray.700">
                    Where you take in and amplify energy from others
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    {humanDesignData.undefined_centers.map((center, index) => (
                      <Box
                        key={index}
                        p={3}
                        bg={getCenterColor(center, false)}
                        borderRadius="md"
                        border="2px dashed"
                        borderColor="gray.400"
                        color="gray.700"
                        fontWeight="bold"
                      >
                        {center}
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </TabPanel>

          {/* Profile Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="lg">
                  Profile {humanDesignData.profile.line1}/{humanDesignData.profile.line2}
                </Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="lg" mb={4}>
                  {humanDesignData.profile.description}
                </Text>
                <Divider mb={4} />
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <Box>
                    <Heading size="md" mb={3}>Conscious Line {humanDesignData.profile.line1}</Heading>
                    <Text>Your conscious personality theme</Text>
                  </Box>
                  <Box>
                    <Heading size="md" mb={3}>Unconscious Line {humanDesignData.profile.line2}</Heading>
                    <Text>Your unconscious design theme</Text>
                  </Box>
                </Grid>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Incarnation Cross Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="lg">{humanDesignData.incarnation_cross.name}</Heading>
                <Text color="gray.700">Your Life Purpose</Text>
              </CardHeader>
              <CardBody>
                <Text fontSize="lg" mb={6}>
                  {humanDesignData.incarnation_cross.description}
                </Text>
                
                <Heading size="md" mb={4}>Cross Gates</Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  {Object.entries(humanDesignData.incarnation_cross.gates).map(([position, gate]) => (
                    <Stat key={position}>
                      <StatLabel textTransform="capitalize">{position.replace('_', ' ')}</StatLabel>
                      <StatNumber>Gate {gate}</StatNumber>
                    </Stat>
                  ))}
                </Grid>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Gates & Channels Tab */}
          <TabPanel>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <Card>
                <CardHeader>
                  <Heading size="md">Active Gates</Heading>
                  <Text fontSize="sm" color="gray.700">
                    Your activated genetic traits
                  </Text>
                </CardHeader>
                <CardBody>
                  <Accordion allowMultiple>
                    {humanDesignData.gates.slice(0, 10).map((gate, index) => (
                      <AccordionItem key={index}>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            Gate {gate.number}: {gate.name}
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <Text>{gate.description || 'Gate description'}</Text>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md">Channels</Heading>
                  <Text fontSize="sm" color="gray.700">
                    Your defined energy pathways
                  </Text>
                </CardHeader>
                <CardBody>
                  {humanDesignData.channels.length > 0 ? (
                    <VStack align="stretch" spacing={3}>
                      {humanDesignData.channels.map((channel, index) => (
                        <Box key={index} p={3} bg="purple.50" borderRadius="md">
                          <Text fontWeight="bold">
                            Channel {channel.gate1}-{channel.gate2}
                          </Text>
                          <Text fontSize="sm" color="gray.700">
                            {channel.name}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.700">No defined channels</Text>
                  )}
                </CardBody>
              </Card>
            </Grid>
          </TabPanel>

          {/* Variables Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="lg">Variables (PHS)</Heading>
                <Text color="gray.700">Primary Health System</Text>
              </CardHeader>
              <CardBody>
                <Text fontSize="lg" mb={6}>
                  {humanDesignData.variables.description}
                </Text>
                
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <Stat>
                    <StatLabel>Digestion</StatLabel>
                    <StatNumber fontSize="md">{humanDesignData.variables.digestion}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Environment</StatLabel>
                    <StatNumber fontSize="md">{humanDesignData.variables.environment}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Awareness</StatLabel>
                    <StatNumber fontSize="md">{humanDesignData.variables.awareness}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Perspective</StatLabel>
                    <StatNumber fontSize="md">{humanDesignData.variables.perspective}</StatNumber>
                  </Stat>
                </Grid>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default HumanDesignChart;
