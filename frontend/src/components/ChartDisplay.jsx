import React from 'react';
import { Box, Heading, Text, SimpleGrid, Card, CardHeader, CardBody } from '@chakra-ui/react';

const ChartDisplay = ({ chart }) => {
  return (
    <Box mt={6}>
      <Heading as="h2" size="md" mb={4}>Your Natal Chart</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card>
          <CardHeader>
            <Heading size="sm">Planets</Heading>
          </CardHeader>
          <CardBody>
            {chart.planets && chart.planets.length > 0 ? (
              chart.planets.map((planet, index) => (
                <Text key={index}>
                  {planet.name}: {planet.sign} at {planet.degrees.toFixed(2)}° (House {planet.house})
                </Text>
              ))
            ) : (
              <Text>No planet data available</Text>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <Heading size="sm">Houses</Heading>
          </CardHeader>
          <CardBody>
            {chart.houses && chart.houses.length > 0 ? (
              chart.houses.map((house, index) => (
                <Text key={index}>
                  House {house.number}: {house.sign} at {house.cusp.toFixed(2)}°
                </Text>
              ))
            ) : (
              <Text>No house data available</Text>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <Heading size="sm">Aspects</Heading>
          </CardHeader>
          <CardBody>
            {chart.aspects && chart.aspects.length > 0 ? (
              chart.aspects.map((aspect, index) => (
                <Text key={index}>
                  {aspect.planet1} {aspect.type} {aspect.planet2}: {aspect.orb.toFixed(2)}°
                </Text>
              ))
            ) : (
              <Text>No aspect data available</Text>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default ChartDisplay;