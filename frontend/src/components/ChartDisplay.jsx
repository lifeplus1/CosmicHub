import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, Text, Card, CardBody, Heading } from "@chakra-ui/react";

const zodiacSigns = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const getZodiacSign = (degree) => {
  const signIndex = Math.floor(degree / 30);
  const signDegree = (degree % 30).toFixed(2);
  return `${signDegree}° ${zodiacSigns[signIndex]}`;
};

export default function ChartDisplay({ chart }) {
  return (
    <Card mt={4} shadow="md" borderRadius="md" bg="white">
      <CardBody>
        <Accordion allowMultiple>
          <AccordionItem>
            <AccordionButton bg="blue.50" _hover={{ bg: "blue.100" }}>
              <Box flex="1" textAlign="left">
                <Heading size="md" color="blue.700">Location & Time</Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Text>Latitude: {chart.latitude.toFixed(2)}°</Text>
              <Text>Longitude: {chart.longitude.toFixed(2)}°</Text>
              <Text>Timezone: {chart.timezone}</Text>
              <Text>Julian Day: {chart.julian_day.toFixed(6)}</Text>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton bg="blue.50" _hover={{ bg: "blue.100" }}>
              <Box flex="1" textAlign="left">
                <Heading size="md" color="blue.700">Planets</Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {Object.entries(chart.planets).map(([planet, position], index) => (
                <Text key={index}>
                  {planet.charAt(0).toUpperCase() + planet.slice(1)}: {getZodiacSign(position)}
                </Text>
              ))}
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton bg="blue.50" _hover={{ bg: "blue.100" }}>
              <Box flex="1" textAlign="left">
                <Heading size="md" color="blue.700">Houses</Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {chart.houses.map((house, index) => (
                <Text key={index}>House {house.house}: {getZodiacSign(house.cusp)}</Text>
              ))}
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton bg="blue.50" _hover={{ bg: "blue.100" }}>
              <Box flex="1" textAlign="left">
                <Heading size="md" color="blue.700">Angles</Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Text>Ascendant: {getZodiacSign(chart.angles.ascendant)}</Text>
              <Text>Midheaven (MC): {getZodiacSign(chart.angles.mc)}</Text>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton bg="blue.50" _hover={{ bg: "blue.100" }}>
              <Box flex="1" textAlign="left">
                <Heading size="md" color="blue.700">Aspects</Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {chart.aspects.length > 0 ? (
                chart.aspects.map((aspect, index) => (
                  <Text key={index}>
                    {aspect.point1.charAt(0).toUpperCase() + aspect.point1.slice(1)} {aspect.aspect} {aspect.point2.charAt(0).toUpperCase() + aspect.point2.slice(1)} (Orb: {aspect.orb.toFixed(2)}°)
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