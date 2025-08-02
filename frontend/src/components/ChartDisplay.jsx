import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, Text, Card, CardBody, Heading, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

const zodiacSigns = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const planetSymbols = {
  sun: "☉", moon: "☾", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  chiron: "⚷", ceres: "⚳", pallas: "⚴", juno: "⚵", vesta: "⚶",
  ascendant: "Asc", descendant: "Dsc", mc: "MC", ic: "IC",
  vertex: "Vx", antivertex: "Av"
};

const getZodiacSign = (degree) => {
  const normalizedDegree = degree % 360;
  const signIndex = Math.floor(normalizedDegree / 30);
  const signDegree = (normalizedDegree % 30).toFixed(2);
  return `${signDegree}° ${zodiacSigns[signIndex]}`;
};

// Function to determine the house of a planet based on its position
const getHouseForPlanet = (position, houses) => {
  const normalizedPosition = position % 360;
  for (let i = 0; i < houses.length; i++) {
    const currentCusp = houses[i].cusp % 360;
    const nextCusp = houses[(i + 1) % houses.length].cusp % 360;
    // Handle house boundaries crossing 0/360 degrees
    if (nextCusp > currentCusp) {
      if (normalizedPosition >= currentCusp && normalizedPosition < nextCusp) {
        return houses[i].house;
      }
    } else {
      if (normalizedPosition >= currentCusp || normalizedPosition < nextCusp) {
        return houses[i].house;
      }
    }
  }
  return "Unknown"; // Fallback in case of edge cases
};

export default function ChartDisplay({ chart }) {
  return (
    <Card
      mt={4}
      shadow="lg"
      borderRadius="lg"
      bgGradient="linear(to-b, purple.800, purple.900)"
      color="white"
      border="1px solid"
      borderColor="gold"
    >
      <CardBody>
        <Accordion allowMultiple>
          <AccordionItem borderColor="gold">
            <AccordionButton bg="purple.700" _hover={{ bg: "purple.600" }}>
              <Box flex="1" textAlign="left">
                <Heading size="md" color="gold">Location & Time</Heading>
              </Box>
              <AccordionIcon color="gold" />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Text>Latitude: {chart.latitude.toFixed(2)}°</Text>
              <Text>Longitude: {chart.longitude.toFixed(2)}°</Text>
              <Text>Timezone: {chart.timezone}</Text>
              <Text>Julian Day: {chart.julian_day.toFixed(6)}</Text>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem borderColor="gold">
            <AccordionButton bg="purple.700" _hover={{ bg: "purple.600" }}>
              <Box flex="1" textAlign="left">
                <Heading size="md" color="gold">Planets & Points</Heading>
              </Box>
              <AccordionIcon color="gold" />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Table variant="simple" colorScheme="yellow">
                <Thead>
                  <Tr>
                    <Th color="gold" borderColor="gold">Planet</Th>
                    <Th color="gold" borderColor="gold">Sign</Th>
                    <Th color="gold" borderColor="gold">House</Th>
                    <Th color="gold" borderColor="gold">Retrograde</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(chart.planets).map(([point, data], index) => (
                    <Tr key={`point-${index}`} bg="purple.700" _hover={{ bg: "purple.600" }}>
                      <Td borderColor="gold">
                        {planetSymbols[point]} {point.charAt(0).toUpperCase() + point.slice(1)}
                      </Td>
                      <Td borderColor="gold">{getZodiacSign(data.position)}</Td>
                      <Td borderColor="gold">{getHouseForPlanet(data.position, chart.houses)}</Td>
                      <Td borderColor="gold">{data.retrograde ? "℞" : "—"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem borderColor="gold">
            <AccordionButton bg="purple.700" _hover={{ bg: "purple.600" }}>
              <Box flex="1" textAlign="left">
                <Heading size="md" color="gold">Houses</Heading>
              </Box>
              <AccordionIcon color="gold" />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {chart.houses.map((house, index) => (
                <Text key={`house-${index}`}>House {house.house}: {getZodiacSign(house.cusp)}</Text>
              ))}
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem borderColor="gold">
            <AccordionButton bg="purple.700" _hover={{ bg: "purple.600" }}>
              <Box flex="1" textAlign="left">
                <Heading size="md" color="gold">Angles & Vertex</Heading>
              </Box>
              <AccordionIcon color="gold" />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Text>{planetSymbols.ascendant} Ascendant: {getZodiacSign(chart.angles.ascendant)}</Text>
              <Text>{planetSymbols.descendant} Descendant: {getZodiacSign(chart.angles.descendant)}</Text>
              <Text>{planetSymbols.mc} Midheaven (MC): {getZodiacSign(chart.angles.mc)}</Text>
              <Text>{planetSymbols.ic} Imum Coeli (IC): {getZodiacSign(chart.angles.ic)}</Text>
              <Text>{planetSymbols.vertex} Vertex: {getZodiacSign(chart.angles.vertex)}</Text>
              <Text>{planetSymbols.antivertex} Anti-Vertex: {getZodiacSign(chart.angles.antivertex)}</Text>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem borderColor="gold">
            <AccordionButton bg="purple.700" _hover={{ bg: "purple.600" }}>
              <Box flex="1" textAlign="left">
                <Heading size="md" color="gold">Aspects</Heading>
              </Box>
              <AccordionIcon color="gold" />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {chart.aspects.length > 0 ? (
                chart.aspects.map((aspect, index) => (
                  <Text key={`aspect-${index}`}>
                    {planetSymbols[aspect.point1]} {aspect.point1.charAt(0).toUpperCase() + aspect.point1.slice(1)} -{" "}
                    {planetSymbols[aspect.point2]} {aspect.point2.charAt(0).toUpperCase() + aspect.point2.slice(1)}: {aspect.aspect} (Orb: {aspect.orb.toFixed(2)}°)
                  </Text>
                ))
              ) : (
                <Text>No major aspects found</Text>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
}