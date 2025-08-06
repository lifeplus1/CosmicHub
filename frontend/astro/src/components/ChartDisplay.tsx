import React, { memo, useMemo, useCallback } from "react";
import { useAuth } from '../contexts/AuthContext';
// import { Button, useToast } from '@chakra-ui/react';
import type { ChartData } from '../types';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  Card,
  CardBody,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

interface ExtendedChartData extends ChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  angles: Record<string, number>;
  [key: string]: any;
}

// Type aliases for component use
type PlanetData = NonNullable<ChartData['planets']>[string];
type HouseData = ChartData['houses'][number];
type AspectData = ChartData['aspects'][number];

interface ChartDisplayProps {
  chart: ExtendedChartData | null;
  onSaveChart?: () => void;
  loading?: boolean;
}

// Enhanced planet symbols with better Unicode support
const planetSymbols: Record<string, string> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
  ascendant: "AC",
  midheaven: "MC",
  mc: "MC",
  ic: "IC",
  descendant: "DC",
  north_node: "☊",
  south_node: "☋",
  chiron: "⚷",
  ceres: "⚳",
  pallas: "⚴",
  juno: "⚵",
  vesta: "⚶",
  lilith: "⚸",
  vertex: "Vx",
  antivertex: "AVx",
  part_of_fortune: "⊗"
};

// Zodiac signs with symbols and colors
const zodiacSigns = [
  { name: "Aries", symbol: "♈", color: "red.500", element: "Fire" },
  { name: "Taurus", symbol: "♉", color: "green.500", element: "Earth" },
  { name: "Gemini", symbol: "♊", color: "yellow.500", element: "Air" },
  { name: "Cancer", symbol: "♋", color: "blue.500", element: "Water" },
  { name: "Leo", symbol: "♌", color: "orange.500", element: "Fire" },
  { name: "Virgo", symbol: "♍", color: "green.600", element: "Earth" },
  { name: "Libra", symbol: "♎", color: "pink.500", element: "Air" },
  { name: "Scorpio", symbol: "♏", color: "red.700", element: "Water" },
  { name: "Sagittarius", symbol: "♐", color: "purple.500", element: "Fire" },
  { name: "Capricorn", symbol: "♑", color: "gray.600", element: "Earth" },
  { name: "Aquarius", symbol: "♒", color: "cyan.500", element: "Air" },
  { name: "Pisces", symbol: "♓", color: "blue.400", element: "Water" }
];

// Memoized functions for better performance
const getZodiacSign = (position: number) => {
  if (typeof position !== 'number' || isNaN(position)) return { name: "Unknown", symbol: "?", color: "gray.500" };
  const index = Math.floor(position / 30);
  return zodiacSigns[index] || zodiacSigns[0];
};

const getHouseForPlanet = (position: number, houses: HouseData[]): number => {
  if (!houses || houses.length === 0) return 1;
  
  for (let i = 0; i < houses.length; i++) {
    const start = houses[i].cusp;
    const end = houses[(i + 1) % houses.length].cusp;
    if (start < end) {
      if (position >= start && position < end) return i + 1;
    } else {
      if (position >= start || position < end) return i + 1;
    }
  }
  return 1;
};

const formatDegree = (degree: number): string => {
  if (typeof degree !== 'number' || isNaN(degree)) return "—";
  const sign = getZodiacSign(degree);
  const degreeInSign = Math.floor(degree % 30);
  const minutes = Math.floor((degree % 1) * 60);
  return `${degreeInSign}°${minutes.toString().padStart(2, '0')}' ${sign.symbol}`;
};

// Memoized planet row component
const PlanetRow = memo(({ point, data, houses }: { 
  point: string; 
  data: PlanetData; 
  houses: HouseData[] 
}) => {
  const sign = getZodiacSign(data.position);
  const house = getHouseForPlanet(data.position, houses);
  
  return (
    <Tr>
      <Td borderColor="gold">
        <HStack spacing={2}>
          <Text fontSize="xl" color={sign.color}>
            {planetSymbols[point] || "⭐"}
          </Text>
          <Text fontWeight="bold" color="deepPurple.900">
            {point.charAt(0).toUpperCase() + point.slice(1).replace('_', ' ')}
          </Text>
        </HStack>
      </Td>
      <Td borderColor="gold">
        <HStack spacing={2}>
          <Text fontSize="lg" color={sign.color}>
            {sign.symbol}
          </Text>
          <VStack spacing={0} align="start">
            <Text fontWeight="bold" color="deepPurple.900">
              {sign.name}
            </Text>
            <Text fontSize="sm" color="deepPurple.800" fontWeight="medium">
              {formatDegree(data.position)}
            </Text>
          </VStack>
        </HStack>
      </Td>
      <Td>
        <Badge variant="cosmic" fontSize="sm">
          House {house}
        </Badge>
      </Td>
      <Td borderColor="gold">
        {data.retrograde ? (
          <Badge colorScheme="red" variant="solid">℞</Badge>
        ) : (
          <Text color="deepPurple.800" fontWeight="bold">—</Text>
        )}
      </Td>
    </Tr>
  );
});

PlanetRow.displayName = 'PlanetRow';

// Memoized aspect row component
const AspectRow = memo(({ aspect }: { aspect: AspectData }) => {
  const getAspectColor = (aspectType: string) => {
    switch (aspectType.toLowerCase()) {
      case 'conjunction': return 'red.500';
      case 'opposition': return 'blue.500';
      case 'trine': return 'green.500';
      case 'square': return 'orange.500';
      case 'sextile': return 'purple.500';
      default: return 'gray.500';
    }
  };

  const getAspectSymbol = (aspectType: string) => {
    switch (aspectType.toLowerCase()) {
      case 'conjunction': return '☌';
      case 'opposition': return '☍';
      case 'trine': return '△';
      case 'square': return '□';
      case 'sextile': return '⚹';
      default: return '—';
    }
  };

  return (
    <Tr>
      <Td>
        <HStack spacing={2}>
          <Text color="deepPurple.900" fontWeight="bold">{planetSymbols[aspect.point1] || aspect.point1}</Text>
          <Text fontWeight="bold" color="deepPurple.900">{aspect.point1.replace('_', ' ')}</Text>
        </HStack>
      </Td>
      <Td>
        <HStack spacing={2}>
          <Text fontSize="lg" color={getAspectColor(aspect.aspect)}>
            {getAspectSymbol(aspect.aspect)}
          </Text>
          <Text fontWeight="bold" color={getAspectColor(aspect.aspect)}>
            {aspect.aspect}
          </Text>
        </HStack>
      </Td>
      <Td>
        <HStack spacing={2}>
          <Text color="deepPurple.900" fontWeight="bold">{planetSymbols[aspect.point2] || aspect.point2}</Text>
          <Text fontWeight="bold" color="deepPurple.900">{aspect.point2.replace('_', ' ')}</Text>
        </HStack>
      </Td>
      <Td>
        <Badge 
          variant={aspect.orb < 2 ? 'solid' : 'cosmic'}
          colorScheme={aspect.orb < 2 ? 'green' : aspect.orb < 5 ? 'yellow' : undefined}
        >
          {aspect.orb.toFixed(2)}°
        </Badge>
      </Td>
    </Tr>
  );
});

AspectRow.displayName = 'AspectRow';

const ChartDisplay: React.FC<ChartDisplayProps> = memo(({ 
  chart, 
  onSaveChart, 
  loading = false 
}) => {
  const { user } = useAuth();
  const toast = useToast();

  // Memoized computations
  const chartInfo = useMemo(() => {
    if (!chart) return null;
    
    return {
      latitude: typeof chart.latitude === 'number' && !isNaN(chart.latitude) ? chart.latitude.toFixed(4) : 'N/A',
      longitude: typeof chart.longitude === 'number' && !isNaN(chart.longitude) ? chart.longitude.toFixed(4) : 'N/A',
      timezone: chart.timezone || 'Unknown',
      julianDay: chart.julian_day ? chart.julian_day.toFixed(4) : 'N/A'
    };
  }, [chart]);

  const planetEntries = useMemo(() => {
    if (!chart?.planets) return [];
    return Object.entries(chart.planets).sort(([a], [b]) => {
      const order = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
      return (order.indexOf(a) !== -1 ? order.indexOf(a) : 999) - (order.indexOf(b) !== -1 ? order.indexOf(b) : 999);
    });
  }, [chart?.planets]);

  const aspectEntries = useMemo(() => {
    if (!chart?.aspects) return [];
    return chart.aspects.filter(aspect => aspect.orb <= 8); // Only show tight aspects
  }, [chart?.aspects]);

  const handleSaveChart = useCallback(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save your chart',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onSaveChart?.();
  }, [user, onSaveChart, toast]);

  // Loading state
  if (loading) {
    return (
      <div className="mt-6 cosmic-card p-8">
        <div className="text-center space-y-4">
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text className="text-lg text-white/80 font-medium">
            Calculating your natal chart...
          </Text>
        </div>
      </div>
    );
  }

  // Error state
  if (!chart) {
    return (
      <div className="mt-6 cosmic-card p-6">
        <Alert status="error" borderRadius="md" className="alert-error">
          <AlertIcon />
          <Box>
            <AlertTitle>No Chart Data Available</AlertTitle>
            <AlertDescription>
              Please enter your birth information and calculate your chart.
            </AlertDescription>
          </Box>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mt-6" data-testid="chart-display">
      <Card className="cosmic-card-premium" borderRadius="2xl">
        <CardBody className="p-6 lg:p-8">
          {/* Header Section */}
          <div className="space-y-6 mb-8">
            <div className="text-center space-y-4">
              <Heading 
                size="lg" 
                className="cosmic-heading text-center"
              >
                🌟 Your Natal Chart
              </Heading>
              
              {/* Chart Information */}
              <div className="cosmic-card bg-purple-50/10 p-4 lg:p-6 rounded-xl border border-purple-300/30">
                <div className="space-y-3">
                  <div className="flex flex-wrap justify-center gap-4 lg:gap-8 text-sm lg:text-base">
                    <Text className="cosmic-text font-semibold">
                      <strong>Latitude:</strong> {chartInfo?.latitude}°
                    </Text>
                    <Text className="cosmic-text font-semibold">
                      <strong>Longitude:</strong> {chartInfo?.longitude}°
                    </Text>
                    <Text className="cosmic-text font-semibold">
                      <strong>Timezone:</strong> {chartInfo?.timezone}
                    </Text>
                  </div>
                  <Text className="cosmic-text text-sm text-center opacity-80">
                    Julian Day: {chartInfo?.julianDay}
                  </Text>
                </div>
              </div>

              {/* Save Chart Button */}
              {user && onSaveChart && (
                <div className="flex justify-center">
                  <Button
                    className="cosmic-button-secondary"
                    size="lg"
                    onClick={handleSaveChart}
                    leftIcon={<Text>💾</Text>}
                  >
                    Save Chart
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Chart Sections */}
          <Accordion allowMultiple defaultIndex={[0]} className="space-y-6">
            {/* Planets Section */}
            <AccordionItem className="cosmic-card border-purple-300/30 rounded-xl overflow-hidden">
              <AccordionButton className="bg-purple-500/20 hover:bg-purple-500/30 transition-colors duration-300 p-4 lg:p-6">
                <Box flex="1" textAlign="left">
                  <HStack spacing={3}>
                    <Text fontSize="2xl">🪐</Text>
                    <Text className="cosmic-subheading text-lg lg:text-xl mb-0">
                      Planets ({planetEntries.length})
                    </Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel className="p-0">
                {planetEntries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table size="sm" variant="enhanced" className="enhanced-table">
                      <Thead>
                        <Tr>
                          <Th className="min-w-32">Planet</Th>
                          <Th className="min-w-40">Sign & Position</Th>
                          <Th className="min-w-24">House</Th>
                          <Th className="min-w-20">Motion</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {planetEntries.map(([point, data]) => (
                          <PlanetRow 
                            key={point} 
                            point={point} 
                            data={data} 
                            houses={chart.houses}
                          />
                        ))}
                      </Tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-6">
                    <Alert status="warning" className="alert-warning">
                      <AlertIcon />
                      No planet data available
                    </Alert>
                  </div>
                )}
              </AccordionPanel>
            </AccordionItem>

            {/* Houses Section */}
            <AccordionItem className="cosmic-card border-purple-300/30 rounded-xl overflow-hidden">
              <AccordionButton className="bg-purple-500/20 hover:bg-purple-500/30 transition-colors duration-300 p-4 lg:p-6">
                <Box flex="1" textAlign="left">
                  <HStack spacing={3}>
                    <Text fontSize="2xl">🏠</Text>
                    <Text className="cosmic-subheading text-lg lg:text-xl mb-0">
                      Houses ({chart.houses?.length || 0})
                    </Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel className="p-0">
                <div className="overflow-x-auto">
                  <Table size="sm" variant="enhanced" className="enhanced-table">
                    <Thead>
                      <Tr>
                        <Th className="min-w-24">House</Th>
                        <Th className="min-w-40">Cusp Sign</Th>
                        <Th className="min-w-32">Degree</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(chart.houses || []).map((house, index) => {
                        const sign = getZodiacSign(house.cusp);
                        return (
                          <Tr key={index}>
                            <Td>
                              <Badge className="cosmic-badge-primary">House {house.house}</Badge>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Text fontSize="lg" color={sign.color}>
                                  {sign.symbol}
                                </Text>
                                <Text className="font-semibold text-white">{sign.name}</Text>
                              </HStack>
                            </Td>
                            <Td className="text-white/80 font-mono">
                              {formatDegree(house.cusp)}
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Angles Section */}
            <AccordionItem className="cosmic-card border-purple-300/30 rounded-xl overflow-hidden">
              <AccordionButton className="bg-purple-500/20 hover:bg-purple-500/30 transition-colors duration-300 p-4 lg:p-6">
                <Box flex="1" textAlign="left">
                  <HStack spacing={3}>
                    <Text fontSize="2xl">📐</Text>
                    <Text className="cosmic-subheading text-lg lg:text-xl mb-0">
                      Angles ({Object.keys(chart.angles || {}).length})
                    </Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel className="p-0">
                <div className="overflow-x-auto">
                  <Table size="sm" variant="enhanced" className="enhanced-table">
                    <Thead>
                      <Tr>
                        <Th className="min-w-32">Angle</Th>
                        <Th className="min-w-32">Sign</Th>
                        <Th className="min-w-32">Position</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.entries(chart.angles || {}).map(([angle, degree]) => {
                        const sign = getZodiacSign(degree);
                        return (
                          <Tr key={angle}>
                            <Td>
                              <HStack spacing={2}>
                                <Text fontSize="lg" className="text-amber-400">
                                  {planetSymbols[angle] || "⭐"}
                                </Text>
                                <Text className="font-semibold text-white">
                                  {angle.toUpperCase().replace('_', ' ')}
                                </Text>
                              </HStack>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Text fontSize="lg" color={sign.color}>
                                  {sign.symbol}
                                </Text>
                                <Text className="text-white">{sign.name}</Text>
                              </HStack>
                            </Td>
                            <Td className="text-white/80 font-mono">
                              {formatDegree(degree)}
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Aspects Section */}
            <AccordionItem className="cosmic-card border-purple-300/30 rounded-xl overflow-hidden">
              <AccordionButton className="bg-purple-500/20 hover:bg-purple-500/30 transition-colors duration-300 p-4 lg:p-6">
                <Box flex="1" textAlign="left">
                  <HStack spacing={3}>
                    <Text fontSize="2xl">⚹</Text>
                    <Text className="cosmic-subheading text-lg lg:text-xl mb-0">
                      Major Aspects ({aspectEntries.length})
                    </Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel className="p-0">
                {aspectEntries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table size="sm" variant="enhanced" className="enhanced-table">
                      <Thead>
                        <Tr>
                          <Th className="min-w-32">Planet 1</Th>
                          <Th className="min-w-32">Aspect</Th>
                          <Th className="min-w-32">Planet 2</Th>
                          <Th className="min-w-24">Orb</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {aspectEntries.map((aspect, index) => (
                          <AspectRow key={index} aspect={aspect} />
                        ))}
                      </Tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-6">
                    <Alert status="info" className="alert-info">
                      <AlertIcon />
                      No major aspects found within 8° orb
                    </Alert>
                  </div>
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CardBody>
      </Card>
    </div>
  );
});

ChartDisplay.displayName = 'ChartDisplay';

export default ChartDisplay;
