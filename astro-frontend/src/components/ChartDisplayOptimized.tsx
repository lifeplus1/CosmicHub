import React, { memo, useMemo, useCallback } from "react";
import { useAuth } from '../contexts/AuthContext';
import { Button, useToast } from '@chakra-ui/react';
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
      <Td borderColor="gold">
        <Badge colorScheme="purple" variant="solid" color="white">
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
      <Td borderColor="gold">
        <HStack spacing={2}>
          <Text color="deepPurple.900" fontWeight="bold">{planetSymbols[aspect.point1] || aspect.point1}</Text>
          <Text fontWeight="bold" color="deepPurple.900">{aspect.point1.replace('_', ' ')}</Text>
        </HStack>
      </Td>
      <Td borderColor="gold">
        <HStack spacing={2}>
          <Text fontSize="lg" color={getAspectColor(aspect.aspect)}>
            {getAspectSymbol(aspect.aspect)}
          </Text>
          <Text fontWeight="bold" color={getAspectColor(aspect.aspect)}>
            {aspect.aspect}
          </Text>
        </HStack>
      </Td>
      <Td borderColor="gold">
        <HStack spacing={2}>
          <Text color="deepPurple.900" fontWeight="bold">{planetSymbols[aspect.point2] || aspect.point2}</Text>
          <Text fontWeight="bold" color="deepPurple.900">{aspect.point2.replace('_', ' ')}</Text>
        </HStack>
      </Td>
      <Td borderColor="gold">
        <Badge colorScheme={aspect.orb < 2 ? 'green' : aspect.orb < 5 ? 'yellow' : 'gray'}>
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
      <Card mt={4} bg="rgba(255,255,255,0.95)" boxShadow="xl">
        <CardBody textAlign="center" py={8}>
          <VStack spacing={4}>
            <Spinner size="xl" color="purple.500" thickness="4px" />
            <Text fontSize="lg" color="deepPurple.800" fontWeight="medium">
              Calculating your natal chart...
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  // Error state
  if (!chart) {
    return (
      <Card mt={4} bg="rgba(255,255,255,0.95)" boxShadow="xl">
        <CardBody>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>No Chart Data Available</AlertTitle>
              <AlertDescription>
                Please enter your birth information and calculate your chart.
              </AlertDescription>
            </Box>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card mt={4} bg="rgba(255,255,255,0.95)" boxShadow="xl" borderRadius="xl">
      <CardBody fontFamily="system-ui, sans-serif" color="gray.800">
        {/* Header Section */}
        <VStack spacing={4} mb={6}>
          <Heading 
            size="lg" 
            color="purple.700" 
            fontFamily="serif"
            textAlign="center"
          >
            🌟 Your Natal Chart
          </Heading>
          
          {/* Chart Information */}
          <Box 
            bg="purple.50" 
            p={4} 
            borderRadius="lg" 
            border="1px solid" 
            borderColor="purple.200"
            w="full"
          >
            <VStack spacing={2}>
              <HStack spacing={6} wrap="wrap" justify="center">
                <Text color="deepPurple.900" fontWeight="bold"><strong>Latitude:</strong> {chartInfo?.latitude}°</Text>
                <Text color="deepPurple.900" fontWeight="bold"><strong>Longitude:</strong> {chartInfo?.longitude}°</Text>
                <Text color="deepPurple.900" fontWeight="bold"><strong>Timezone:</strong> {chartInfo?.timezone}</Text>
              </HStack>
              <Text color="deepPurple.800" fontSize="sm" fontWeight="medium">
                Julian Day: {chartInfo?.julianDay}
              </Text>
            </VStack>
          </Box>

          {/* Save Chart Button */}
          {user && onSaveChart && (
            <Button
              colorScheme="purple"
              size="md"
              onClick={handleSaveChart}
              leftIcon={<Text>💾</Text>}
              borderRadius="full"
              boxShadow="md"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              Save Chart
            </Button>
          )}
        </VStack>

        {/* Chart Sections */}
        <Accordion allowMultiple defaultIndex={[0]}>
          {/* Planets Section */}
          <AccordionItem border="1px solid" borderColor="purple.200" borderRadius="lg" mb={4}>
            <AccordionButton 
              bg="purple.100" 
              _hover={{ bg: "purple.200" }}
              borderTopRadius="lg"
            >
              <Box flex="1" textAlign="left">
                <HStack spacing={2}>
                  <Text fontSize="xl">🪐</Text>
                  <Text fontWeight="bold" fontSize="lg" color="deepPurple.900">
                    Planets ({planetEntries.length})
                  </Text>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {planetEntries.length > 0 ? (
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Planet</Th>
                      <Th>Sign & Position</Th>
                      <Th>House</Th>
                      <Th>Motion</Th>
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
              ) : (
                <Alert status="warning">
                  <AlertIcon />
                  No planet data available
                </Alert>
              )}
            </AccordionPanel>
          </AccordionItem>

          {/* Houses Section */}
          <AccordionItem border="1px solid" borderColor="purple.200" borderRadius="lg" mb={4}>
            <AccordionButton 
              bg="purple.100" 
              _hover={{ bg: "purple.200" }}
              borderTopRadius="lg"
            >
              <Box flex="1" textAlign="left">
                <HStack spacing={2}>
                  <Text fontSize="xl">🏠</Text>
                  <Text fontWeight="bold" fontSize="lg" color="deepPurple.900">
                    Houses ({chart.houses?.length || 0})
                  </Text>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>House</Th>
                    <Th>Cusp Sign</Th>
                    <Th>Degree</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(chart.houses || []).map((house, index) => {
                    const sign = getZodiacSign(house.cusp);
                    return (
                      <Tr key={index}>
                        <Td borderColor="purple.200">
                          <Badge colorScheme="purple" variant="solid" color="white">{house.house}</Badge>
                        </Td>
                        <Td borderColor="purple.200">
                          <HStack spacing={2}>
                            <Text fontSize="lg" color={sign.color}>
                              {sign.symbol}
                            </Text>
                            <Text fontWeight="bold">{sign.name}</Text>
                          </HStack>
                        </Td>
                        <Td borderColor="purple.200">
                          {formatDegree(house.cusp)}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>

          {/* Angles Section */}
          <AccordionItem border="1px solid" borderColor="purple.200" borderRadius="lg" mb={4}>
            <AccordionButton 
              bg="purple.100" 
              _hover={{ bg: "purple.200" }}
              borderTopRadius="lg"
            >
              <Box flex="1" textAlign="left">
                <HStack spacing={2}>
                  <Text fontSize="xl">📐</Text>
                  <Text fontWeight="bold" fontSize="lg" color="deepPurple.900">
                    Angles ({Object.keys(chart.angles || {}).length})
                  </Text>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Angle</Th>
                    <Th>Sign</Th>
                    <Th>Position</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(chart.angles || {}).map(([angle, degree]) => {
                    const sign = getZodiacSign(degree);
                    return (
                      <Tr key={angle}>
                        <Td borderColor="purple.200">
                          <HStack spacing={2}>
                            <Text fontSize="lg">{planetSymbols[angle] || "⭐"}</Text>
                            <Text fontWeight="bold">
                              {angle.toUpperCase().replace('_', ' ')}
                            </Text>
                          </HStack>
                        </Td>
                        <Td borderColor="purple.200">
                          <HStack spacing={2}>
                            <Text fontSize="lg" color={sign.color}>
                              {sign.symbol}
                            </Text>
                            <Text>{sign.name}</Text>
                          </HStack>
                        </Td>
                        <Td borderColor="purple.200">
                          {formatDegree(degree)}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>

          {/* Aspects Section */}
          <AccordionItem border="1px solid" borderColor="purple.200" borderRadius="lg">
            <AccordionButton 
              bg="purple.100" 
              _hover={{ bg: "purple.200" }}
              borderTopRadius="lg"
            >
              <Box flex="1" textAlign="left">
                <HStack spacing={2}>
                  <Text fontSize="xl">⚹</Text>
                  <Text fontWeight="bold" fontSize="lg" color="deepPurple.900">
                    Major Aspects ({aspectEntries.length})
                  </Text>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {aspectEntries.length > 0 ? (
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Planet 1</Th>
                      <Th>Aspect</Th>
                      <Th>Planet 2</Th>
                      <Th>Orb</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {aspectEntries.map((aspect, index) => (
                      <AspectRow key={index} aspect={aspect} />
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  No major aspects found within 8° orb
                </Alert>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
});

ChartDisplay.displayName = 'ChartDisplay';

export default ChartDisplay;
