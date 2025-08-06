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
  Input,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast
} from '@chakra-ui/react';
// import { CalendarIcon, TimeIcon } from '@chakra-ui/icons';
import FeatureGuard from './FeatureGuard';
import type { BirthData, TransitData } from '../types';

interface TransitAnalysisProps {
  birthData: BirthData;
}

interface TransitResult {
  period: {
    start: string;
    end: string;
    duration_days: number;
  };
  transits: {
    most_active_days: Array<{
      date: string;
      transit_count: number;
      transits: Array<{
        transit_planet: string;
        natal_planet: string;
        aspect: string;
        orb: number;
        exactness: number;
        interpretation: string;
        applying: boolean;
      }>;
    }>;
    strongest_transits: Array<{
      date: string;
      transit_planet: string;
      natal_planet: string;
      aspect: string;
      orb: number;
      exactness: number;
      interpretation: string;
      applying: boolean;
    }>;
  };
  significant_periods: Array<{
    date: string;
    activity_level: number;
    primary_themes: string[];
    significance_score: number;
  }>;
  summary: {
    period_overview: string;
    most_active_planet: string;
    key_themes: string[];
    overall_intensity: string;
    recommendations: string[];
  };
}

export const TransitAnalysis: React.FC<TransitAnalysisProps> = ({ birthData }) => {
  const [transitResult, setTransitResult] = useState<TransitResult | null>(null);
  const [lunarTransits, setLunarTransits] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLunar, setLoadingLunar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  const calculateTransits = async () => {
    setLoading(true);
    setError(null);

    try {
      const transitData: TransitData = {
        birth_data: birthData,
        start_date: `${dateRange.startDate}T00:00:00Z`,
        end_date: `${dateRange.endDate}T23:59:59Z`,
        orb: 2.0,
        include_retrogrades: true
      };

      const response = await fetch('/api/calculate-transits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transitData),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate transits');
      }

      const data = await response.json();
      setTransitResult(data.transits);

      toast({
        title: 'Transits Calculated',
        description: 'Your transit analysis is ready.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: 'Transit Calculation Failed',
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateLunarTransits = async () => {
    setLoadingLunar(true);

    try {
      const transitData: TransitData = {
        birth_data: birthData,
        start_date: `${dateRange.startDate}T00:00:00Z`,
        end_date: `${dateRange.endDate}T23:59:59Z`
      };

      const response = await fetch('/api/calculate-lunar-transits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transitData),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate lunar transits');
      }

      const data = await response.json();
      setLunarTransits(data.transits);

    } catch (err) {
      console.error('Lunar transit calculation error:', err);
    } finally {
      setLoadingLunar(false);
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'very high': return 'red';
      case 'high': return 'orange';
      case 'moderate': return 'yellow';
      default: return 'green';
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPlanet = (planet: string) => {
    return planet.charAt(0).toUpperCase() + planet.slice(1);
  };

  return (
    <FeatureGuard requiredTier="premium" feature="transits">
      <Box maxW="container.xl" mx="auto" py={8}>
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="xl" mb={4} color="blue.600">
              🔮 Transit Analysis
            </Heading>
            <Text fontSize="lg" color="whiteAlpha.800">
              Discover upcoming planetary influences and timing opportunities
            </Text>
          </Box>

          {/* Date Range Selection */}
          <Card bg={cardBg} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">📅 Select Time Period</Heading>
            </CardHeader>
            <CardBody>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4} alignItems="end">
                <FormControl>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({
                      ...dateRange,
                      startDate: e.target.value
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>End Date</FormLabel>
                  <Input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({
                      ...dateRange,
                      endDate: e.target.value
                    })}
                  />
                </FormControl>

                <VStack spacing={2}>
                  <Button
                    colorScheme="blue"
                    onClick={calculateTransits}
                    isLoading={loading}
                    loadingText="Calculating..."
                    leftIcon={<CalendarIcon />}
                    w="full"
                  >
                    Calculate Transits
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={calculateLunarTransits}
                    isLoading={loadingLunar}
                    loadingText="Moon..."
                    leftIcon={<TimeIcon />}
                    w="full"
                  >
                    Lunar Transits
                  </Button>
                </VStack>
              </Grid>
            </CardBody>
          </Card>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {transitResult && (
            <Tabs isFitted variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab>Overview</Tab>
                <Tab>Significant Periods</Tab>
                <Tab>All Transits</Tab>
                <Tab>Lunar Cycles</Tab>
              </TabList>

              <TabPanels>
                {/* Overview Tab */}
                <TabPanel>
                  <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                    {/* Period Summary */}
                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">📊 Period Summary</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <Box>
                            <Text fontWeight="semibold" mb={2}>Overall Intensity</Text>
                            <HStack>
                              <Progress
                                value={transitResult.summary.overall_intensity === 'Very High' ? 100 :
                                       transitResult.summary.overall_intensity === 'High' ? 75 :
                                       transitResult.summary.overall_intensity === 'Moderate' ? 50 : 25}
                                colorScheme={getIntensityColor(transitResult.summary.overall_intensity)}
                                size="lg"
                                flex={1}
                              />
                              <Badge colorScheme={getIntensityColor(transitResult.summary.overall_intensity)}>
                                {transitResult.summary.overall_intensity}
                              </Badge>
                            </HStack>
                          </Box>

                          <Box>
                            <Text fontWeight="semibold" mb={2}>Most Active Planet</Text>
                            <Badge colorScheme="purple" p={2} fontSize="md">
                              {formatPlanet(transitResult.summary.most_active_planet || 'None')}
                            </Badge>
                          </Box>

                          <Box>
                            <Text fontWeight="semibold" mb={2}>Key Themes</Text>
                            <VStack spacing={1} align="start">
                              {transitResult.summary.key_themes.map((theme, index) => (
                                <Text key={index} fontSize="sm">• {theme}</Text>
                              ))}
                            </VStack>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Recommendations */}
                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">💡 Guidance & Recommendations</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          {transitResult.summary.recommendations.map((rec, index) => (
                            <Box key={index} p={3} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.400">
                              <Text fontSize="sm">{rec}</Text>
                            </Box>
                          ))}
                        </VStack>
                      </CardBody>
                    </Card>
                  </Grid>
                </TabPanel>

                {/* Significant Periods Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Text color="whiteAlpha.800">
                      High-activity periods when multiple planetary influences converge
                    </Text>
                    
                    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
                      {transitResult.significant_periods.map((period, index) => (
                        <Card key={index} bg={cardBg} borderLeft="4px solid" borderColor="orange.400">
                          <CardBody>
                            <VStack align="start" spacing={3}>
                              <HStack justify="space-between" w="full">
                                <Text fontWeight="bold">{formatDate(period.date)}</Text>
                                <Badge colorScheme="orange">{period.activity_level} transits</Badge>
                              </HStack>
                              
                              <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={1}>Primary Themes:</Text>
                                <HStack wrap="wrap" spacing={1}>
                                  {period.primary_themes.map((theme, i) => (
                                    <Badge key={i} size="sm" colorScheme="blue">{theme}</Badge>
                                  ))}
                                </HStack>
                              </Box>
                              
                              <Box w="full">
                                <Text fontSize="sm" fontWeight="semibold" mb={1}>Significance:</Text>
                                <Progress
                                  value={Math.min(period.significance_score / 5, 100)}
                                  colorScheme="orange"
                                  size="sm"
                                />
                              </Box>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </Grid>
                  </VStack>
                </TabPanel>

                {/* All Transits Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {/* Strongest Transits */}
                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">⭐ Strongest Transits</Heading>
                      </CardHeader>
                      <CardBody>
                        <TableContainer>
                          <Table size="sm">
                            <Thead>
                              <Tr>
                                <Th>Date</Th>
                                <Th>Transit</Th>
                                <Th>Exactness</Th>
                                <Th>Trend</Th>
                                <Th>Interpretation</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {transitResult.transits.strongest_transits.slice(0, 15).map((transit, index) => (
                                <Tr key={index}>
                                  <Td>{formatDate(transit.date)}</Td>
                                  <Td>
                                    <VStack align="start" spacing={1}>
                                      <Text fontSize="sm" fontWeight="semibold">
                                        {formatPlanet(transit.transit_planet)} {transit.aspect} {formatPlanet(transit.natal_planet)}
                                      </Text>
                                      <Badge size="sm" colorScheme={getAspectColor(transit.aspect)}>
                                        {transit.aspect}
                                      </Badge>
                                    </VStack>
                                  </Td>
                                  <Td>
                                    <Progress
                                      value={transit.exactness}
                                      colorScheme="green"
                                      size="sm"
                                      w="60px"
                                    />
                                    <Text fontSize="xs">{transit.exactness.toFixed(0)}%</Text>
                                  </Td>
                                  <Td>
                                    <Badge colorScheme={transit.applying ? 'blue' : 'gray'} size="sm">
                                      {transit.applying ? 'Applying' : 'Separating'}
                                    </Badge>
                                  </Td>
                                  <Td>
                                    <Text fontSize="sm" maxW="250px">
                                      {transit.interpretation}
                                    </Text>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </CardBody>
                    </Card>

                    {/* Most Active Days */}
                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">📈 Most Active Days</Heading>
                      </CardHeader>
                      <CardBody>
                        <Accordion allowToggle>
                          {transitResult.transits.most_active_days.slice(0, 10).map((day, index) => (
                            <AccordionItem key={index}>
                              <AccordionButton>
                                <Box flex="1" textAlign="left">
                                  <HStack justify="space-between">
                                    <Text fontWeight="semibold">{formatDate(day.date)}</Text>
                                    <Badge colorScheme="purple">{day.transit_count} transits</Badge>
                                  </HStack>
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                              <AccordionPanel pb={4}>
                                <VStack spacing={2} align="stretch">
                                  {day.transits.map((transit, i) => (
                                    <Box key={i} p={2} bg="gray.50" borderRadius="md">
                                      <HStack justify="space-between" mb={1}>
                                        <Text fontSize="sm" fontWeight="semibold">
                                          {formatPlanet(transit.transit_planet)} {transit.aspect} {formatPlanet(transit.natal_planet)}
                                        </Text>
                                        <Badge size="sm" colorScheme={getAspectColor(transit.aspect)}>
                                          {transit.orb.toFixed(1)}°
                                        </Badge>
                                      </HStack>
                                      <Text fontSize="xs" color="whiteAlpha.800">
                                        {transit.interpretation}
                                      </Text>
                                    </Box>
                                  ))}
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* Lunar Cycles Tab */}
                <TabPanel>
                  <Card bg={cardBg}>
                    <CardHeader>
                      <Heading size="md">🌙 Lunar Transit Cycles</Heading>
                    </CardHeader>
                    <CardBody>
                      {lunarTransits ? (
                        <VStack spacing={4} align="stretch">
                          <Text color="whiteAlpha.800">{lunarTransits.summary}</Text>
                          
                          {lunarTransits.moon_transits && lunarTransits.moon_transits.length > 0 ? (
                            <TableContainer>
                              <Table size="sm">
                                <Thead>
                                  <Tr>
                                    <Th>Date & Time</Th>
                                    <Th>Aspect</Th>
                                    <Th>Interpretation</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {lunarTransits.moon_transits.slice(0, 20).map((transit: any, index: number) => (
                                    <Tr key={index}>
                                      <Td>{new Date(transit.datetime).toLocaleString()}</Td>
                                      <Td>
                                        <Badge colorScheme="blue" size="sm">
                                          Moon {transit.aspect} {formatPlanet(transit.natal_planet)}
                                        </Badge>
                                      </Td>
                                      <Td>
                                        <Text fontSize="sm">{transit.interpretation}</Text>
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Text>No significant lunar transits found in this period.</Text>
                          )}
                        </VStack>
                      ) : (
                        <VStack spacing={4}>
                          <Text color="whiteAlpha.800">
                            Lunar transits show emotional timing and daily rhythms. Click "Lunar Transits" above to calculate.
                          </Text>
                          {loadingLunar && (
                            <HStack>
                              <Spinner size="sm" />
                              <Text>Calculating lunar cycles...</Text>
                            </HStack>
                          )}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </VStack>
      </Box>
    </FeatureGuard>
  );
};
