import React from "react";
import { useAuth } from '../contexts/AuthContext';
import { Button, useToast } from '@chakra-ui/react';
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
} from "@chakra-ui/react";
import type { ChartData } from '../types';

// Type aliases for component use
type PlanetData = NonNullable<ChartData['planets']>[string];
type HouseData = ChartData['houses'][number];
type AspectData = ChartData['aspects'][number];

interface ExtendedChartData extends ChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  angles: Record<string, number>;
}

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
  chiron: "⚷",
  ceres: "⚳",
  pallas: "⚴",
  juno: "⚵",
  vesta: "⚶",
  north_node: "☊",
  south_node: "☋",
  ascendant: "Asc",
  descendant: "Dsc",
  mc: "MC",
  ic: "IC",
  vertex: "Vx",
  antivertex: "AVx",
};

const zodiacSigns = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const getZodiacSign = (degree: number) => {
  if (typeof degree !== 'number' || isNaN(degree)) {
    return 'N/A';
  }
  const sign = Math.floor(degree / 30);
  const deg = degree % 30;
  const signIndex = sign % 12; // Ensure we stay within array bounds
  return `${deg.toFixed(2)}° ${zodiacSigns[signIndex] || 'Unknown'}`;
};

const getHouseForPlanet = (position: number, houses: HouseData[]) => {
  if (typeof position !== 'number' || isNaN(position) || !houses || houses.length === 0) {
    return 1; // Default to first house
  }
  
  for (let i = 0; i < houses.length; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % houses.length];
    
    if (!currentHouse || typeof currentHouse.cusp !== 'number' || 
        !nextHouse || typeof nextHouse.cusp !== 'number') {
      continue;
    }
    
    const start = currentHouse.cusp;
    const end = nextHouse.cusp;
    
    if (start < end) {
      if (position >= start && position < end) return i + 1;
    } else {
      if (position >= start || position < end) return i + 1;
    }
  }
  return 1;
};

const ChartDisplay: React.FC<{ chart: ExtendedChartData | null; onSaveChart?: () => void }> = ({ chart, onSaveChart }) => {
  const { user } = useAuth();
  const toast = useToast();

  // Early return if chart is null or undefined
  if (!chart) {
    return (
      <Card mt={4} bg="rgba(255,255,255,0.92)" boxShadow="0 4px 32px 0 rgba(36,0,70,0.12)">
        <CardBody fontFamily="Quicksand, sans-serif" color="deepPurple.900">
          <Text color="red.500">No chart data available</Text>
        </CardBody>
      </Card>
    );
  }

  // Ensure planets is an object, even if empty
  const planets = chart.planets ?? {};

  return (
    <Card mt={4} bg="rgba(255,255,255,0.92)" boxShadow="0 4px 32px 0 rgba(36,0,70,0.12)">
      <CardBody fontFamily="Quicksand, sans-serif" color="deepPurple.900">
        <Heading size="md" mb={2} color="deepPurple.700" fontFamily="Cormorant Garamond, serif">
          Natal Chart
        </Heading>
        <Text mb={2} color="deepPurple.800">
          Latitude: {typeof chart.latitude === 'number' && !isNaN(chart.latitude) ? chart.latitude.toFixed(2) : ''}° | Longitude: {typeof chart.longitude === 'number' && !isNaN(chart.longitude) ? chart.longitude.toFixed(2) : ''}° | Timezone: {chart.timezone}
        </Text>
        <Text mb={2} color="deepPurple.800">Julian Day: {chart.julian_day}</Text>
        <Accordion allowToggle>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Planets
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Planet</Th>
                    <Th>Sign</Th>
                    <Th>House</Th>
                    <Th>Retrograde</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(planets).length > 0 ? (
                    Object.entries(planets).map(([point, data]) => (
                      <Tr key={point}>
                        <Td borderColor="gold">
                          <b>{planetSymbols[point] || point}</b> {point.charAt(0).toUpperCase() + point.slice(1)}
                        </Td>
                        <Td borderColor="gold">
                          <Box display="flex" alignItems="center">
                            <Text as="span" fontWeight="bold" color="deepPurple.700">
                              {data && typeof data.position === 'number' ? getZodiacSign(data.position) : 'N/A'}
                            </Text>
                          </Box>
                        </Td>
                        <Td borderColor="gold">
                          <Text as="span" color="gold.200">
                            {data && typeof data.position === 'number' && chart.houses ? 
                              getHouseForPlanet(data.position, chart.houses) : 'N/A'}
                          </Text>
                        </Td>
                        <Td borderColor="gold">{data && data.retrograde ? "℞" : "—"}</Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={4} textAlign="center">
                        <Text color="red.500">No planet data available</Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Houses
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>House</Th>
                    <Th>Cusp</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(chart.houses && Array.isArray(chart.houses) && chart.houses.length > 0) ? (
                    chart.houses.map((house, index) => (
                      <Tr key={index}>
                        <Td borderColor="gold">{house && house.house ? house.house : index + 1}</Td>
                        <Td borderColor="gold">
                          {house && typeof house.cusp === 'number' && !isNaN(house.cusp) ? 
                            `${house.cusp.toFixed(2)}°` : 'N/A'}
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={2} borderColor="gold" textAlign="center" color="gray.500">
                        No house data available
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Angles
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Angle</Th>
                    <Th>Degree</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(chart.angles || {}).map(([angle, degree]) => (
                    <Tr key={angle}>
                      <Td borderColor="gold">{planetSymbols[angle] || angle}</Td>
                      <Td borderColor="gold">{typeof degree === 'number' && !isNaN(degree) ? degree.toFixed(2) : ''}°</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Aspects
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Aspect</Th>
                    <Th>Point 1</Th>
                    <Th>Point 2</Th>
                    <Th>Orb</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(chart.aspects && Array.isArray(chart.aspects) && chart.aspects.length > 0) ? (
                    chart.aspects.map((aspect, index) => (
                      <Tr key={index}>
                        <Td borderColor="gold">
                          <b>{aspect && aspect.aspect ? aspect.aspect : 'Unknown'}</b>
                        </Td>
                        <Td borderColor="gold">
                          <Box>
                            <b>{aspect && aspect.point1 ? (planetSymbols[aspect.point1] || aspect.point1) : 'Unknown'}</b>{' '}
                            {aspect && aspect.point1 ? (aspect.point1.charAt(0).toUpperCase() + aspect.point1.slice(1)) : ''}
                            {aspect && aspect.point1_sign && (
                              <Text as="span" color="gold.200" ml={2}>{aspect.point1_sign}</Text>
                            )}
                            {aspect && aspect.point1_house && (
                              <Text as="span" color="teal.200" ml={2}>House {aspect.point1_house}</Text>
                            )}
                          </Box>
                        </Td>
                        <Td borderColor="gold">
                          <Box>
                            <b>{aspect && aspect.point2 ? (planetSymbols[aspect.point2] || aspect.point2) : 'Unknown'}</b>{' '}
                            {aspect && aspect.point2 ? (aspect.point2.charAt(0).toUpperCase() + aspect.point2.slice(1)) : ''}
                            {aspect && aspect.point2_sign && (
                              <Text as="span" color="gold.200" ml={2}>{aspect.point2_sign}</Text>
                            )}
                            {aspect && aspect.point2_house && (
                              <Text as="span" color="teal.200" ml={2}>House {aspect.point2_house}</Text>
                            )}
                          </Box>
                        </Td>
                        <Td borderColor="gold">
                          {aspect && typeof aspect.orb === 'number' && !isNaN(aspect.orb) ? 
                            `${aspect.orb.toFixed(2)}°` : 'N/A'}
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={4} borderColor="gold" textAlign="center" color="gray.500">
                        No aspect data available
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        {user && (
          <Button
            mt={6}
            variant="gold"
            size="lg"
            borderRadius="full"
            fontWeight="bold"
            onClick={onSaveChart}
            alignSelf="center"
          >
            Save Chart
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default ChartDisplay;