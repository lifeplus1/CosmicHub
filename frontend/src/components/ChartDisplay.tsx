import React from "react";
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

interface PlanetData {
  position: number;
  retrograde: boolean;
}

interface HouseData {
  house: number;
  cusp: number;
}

interface AspectData {
  point1: string;
  point2: string;
  aspect: string;
  orb: number;
  point1_sign?: string;
  point2_sign?: string;
  point1_house?: number;
  point2_house?: number;
}

interface ChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  planets: Record<string, PlanetData>;
  houses: HouseData[];
  angles: Record<string, number>;
  aspects: AspectData[];
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
  const sign = Math.floor(degree / 30);
  const deg = degree % 30;
  return `${deg.toFixed(2)}° ${zodiacSigns[sign]}`;
};

const getHouseForPlanet = (position: number, houses: HouseData[]) => {
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

const ChartDisplay: React.FC<{ chart: ChartData }> = ({ chart }) => {
  if (!chart) return null;
  return (
    <Card mt={4} bg="rgba(255,255,255,0.92)" boxShadow="0 4px 32px 0 rgba(36,0,70,0.12)">
      <CardBody fontFamily="Quicksand, sans-serif" color="deepPurple.900">
        <Heading size="md" mb={2} color="deepPurple.700" fontFamily="Cormorant Garamond, serif">
          Natal Chart
        </Heading>
        <Text mb={2} color="deepPurple.800">
          Latitude: {chart.latitude.toFixed(2)}° | Longitude: {chart.longitude.toFixed(2)}° | Timezone:{" "}
          {chart.timezone}
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
                  {Object.entries(chart.planets).map(([point, data]) => (
                    <Tr key={point}>
                      <Td borderColor="gold">
                        <b>{planetSymbols[point] || point}</b> {point.charAt(0).toUpperCase() + point.slice(1)}
                      </Td>
                      <Td borderColor="gold">
                        <Box display="flex" alignItems="center">
                          <Text as="span" fontWeight="bold" color="yellow.200">{getZodiacSign(data.position)}</Text>
                        </Box>
                      </Td>
                      <Td borderColor="gold">
                        <Text as="span" color="yellow.200">{getHouseForPlanet(data.position, chart.houses)}</Text>
                      </Td>
                      <Td borderColor="gold">{data.retrograde ? "℞" : "—"}</Td>
                    </Tr>
                  ))}
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
                  {chart.houses.map((house, index) => (
                    <Tr key={index}>
                      <Td borderColor="gold">{house.house}</Td>
                      <Td borderColor="gold">{house.cusp.toFixed(2)}°</Td>
                    </Tr>
                  ))}
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
                  {Object.entries(chart.angles).map(([angle, degree]) => (
                    <Tr key={angle}>
                      <Td borderColor="gold">{planetSymbols[angle] || angle}</Td>
                      <Td borderColor="gold">{degree.toFixed(2)}°</Td>
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
                  {chart.aspects.map((aspect, index) => (
                    <Tr key={index}>
                      <Td borderColor="gold">
                        <b>{aspect.aspect}</b>
                      </Td>
                      <Td borderColor="gold">
                        <Box>
                          <b>{planetSymbols[aspect.point1] || aspect.point1}</b> {aspect.point1.charAt(0).toUpperCase() + aspect.point1.slice(1)}
                          {aspect.point1_sign && (
                            <Text as="span" color="yellow.200" ml={2}>{aspect.point1_sign}</Text>
                          )}
                          {aspect.point1_house && (
                            <Text as="span" color="teal.200" ml={2}>House {aspect.point1_house}</Text>
                          )}
                        </Box>
                      </Td>
                      <Td borderColor="gold">
                        <Box>
                          <b>{planetSymbols[aspect.point2] || aspect.point2}</b> {aspect.point2.charAt(0).toUpperCase() + aspect.point2.slice(1)}
                          {aspect.point2_sign && (
                            <Text as="span" color="yellow.200" ml={2}>{aspect.point2_sign}</Text>
                          )}
                          {aspect.point2_house && (
                            <Text as="span" color="teal.200" ml={2}>House {aspect.point2_house}</Text>
                          )}
                        </Box>
                      </Td>
                      <Td borderColor="gold">{aspect.orb.toFixed(2)}°</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
};

export default ChartDisplay;