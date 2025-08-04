import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardBody, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Table, Thead, Tbody, Tr, Th, Td, Badge, VStack, HStack, Divider,
  Alert, AlertIcon, AlertTitle, AlertDescription, SimpleGrid, Stat,
  StatLabel, StatNumber, StatHelpText, useColorModeValue, Flex
} from '@chakra-ui/react';

interface MultiSystemChartProps {
  chartData: any;
  isLoading?: boolean;
}

// Enhanced symbols for different systems
const planetSymbols = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  chiron: "⚷", ceres: "⚳", pallas: "⚴", juno: "⚵", vesta: "⚶",
  rahu: "☊", ketu: "☋"
};

const aspectSymbols = {
  "Conjunction": "☌", "Opposition": "☍", "Trine": "△", "Square": "□",
  "Sextile": "⚹", "Quincunx": "⚻", "Semisextile": "⚺", "Semisquare": "∠"
};

const getZodiacSign = (position: number): string => {
  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  if (typeof position !== 'number' || isNaN(position)) return 'N/A';
  const sign = Math.floor(position / 30);
  const deg = position % 30;
  const signIndex = sign % 12;
  return `${deg.toFixed(2)}° ${zodiacSigns[signIndex] || 'Unknown'}`;
};

const WesternChart: React.FC<{ data: any }> = ({ data }) => {
  if (!data || !data.planets) return <Text>No Western chart data available</Text>;

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="rgba(255,255,255,0.95)">
        <CardBody>
          <Heading size="md" mb={4} color="purple.700">Western Tropical Chart</Heading>
          <Text fontSize="sm" color="gray.600" mb={4}>
            Based on tropical zodiac, solar-focused approach emphasizing personality and life expression
          </Text>
          
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Text fontWeight="bold">Planets & Positions</Text>
                    <Badge colorScheme="purple">{Object.keys(data.planets).length}</Badge>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Planet</Th>
                      <Th>Position</Th>
                      <Th>Retrograde</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(data.planets).map(([planet, info]: [string, any]) => (
                      <Tr key={planet}>
                        <Td>
                          <HStack>
                            <Text>{planetSymbols[planet as keyof typeof planetSymbols] || '●'}</Text>
                            <Text fontWeight="medium">{planet.charAt(0).toUpperCase() + planet.slice(1)}</Text>
                          </HStack>
                        </Td>
                        <Td fontFamily="mono">{getZodiacSign(info.position)}</Td>
                        <Td>{info.retrograde ? "℞" : "—"}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Text fontWeight="bold">Aspects</Text>
                    <Badge colorScheme="blue">{data.aspects?.length || 0}</Badge>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Aspect</Th>
                      <Th>Planets</Th>
                      <Th>Orb</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(data.aspects || []).slice(0, 10).map((aspect: any, idx: number) => (
                      <Tr key={idx}>
                        <Td>
                          <HStack>
                            <Text>{aspectSymbols[aspect.aspect as keyof typeof aspectSymbols] || '●'}</Text>
                            <Text>{aspect.aspect}</Text>
                          </HStack>
                        </Td>
                        <Td>{aspect.point1} - {aspect.point2}</Td>
                        <Td>{aspect.orb?.toFixed(2)}°</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CardBody>
      </Card>
    </VStack>
  );
};

const VedicChart: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <Text>No Vedic chart data available</Text>;

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="rgba(255,246,223,0.95)">
        <CardBody>
          <Heading size="md" mb={4} color="orange.700">Vedic Sidereal Chart</Heading>
          <Text fontSize="sm" color="gray.600" mb={4}>
            {data.description}
          </Text>

          <SimpleGrid columns={[1, 2]} spacing={4} mb={4}>
            <Stat>
              <StatLabel>Ayanamsa</StatLabel>
              <StatNumber>{data.ayanamsa?.toFixed(2)}°</StatNumber>
              <StatHelpText>Precession correction</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Moon Sign (Rashi)</StatLabel>
              <StatNumber>{data.analysis?.moon_sign || 'Unknown'}</StatNumber>
              <StatHelpText>Primary emotional nature</StatHelpText>
            </Stat>
          </SimpleGrid>

          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Sidereal Planets & Nakshatras</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Planet</Th>
                      <Th>Sidereal Sign</Th>
                      <Th>Nakshatra</Th>
                      <Th>Pada</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(data.planets || {}).map(([planet, info]: [string, any]) => (
                      <Tr key={planet}>
                        <Td>
                          <HStack>
                            <Text>{planetSymbols[planet as keyof typeof planetSymbols] || '●'}</Text>
                            <Text fontWeight="medium">{planet.charAt(0).toUpperCase() + planet.slice(1)}</Text>
                          </HStack>
                        </Td>
                        <Td fontFamily="mono">{info.vedic_sign || 'N/A'}</Td>
                        <Td>{info.nakshatra?.name || 'N/A'}</Td>
                        <Td>{info.nakshatra?.pada || 'N/A'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Vedic Analysis</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <VStack align="stretch" spacing={3}>
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Birth Star Analysis</AlertTitle>
                      <AlertDescription>
                        {data.analysis?.analysis || 'Vedic chart analysis based on lunar mansions and sidereal calculations'}
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CardBody>
      </Card>
    </VStack>
  );
};

const ChineseChart: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <Text>No Chinese astrology data available</Text>;

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="rgba(255,240,240,0.95)">
        <CardBody>
          <Heading size="md" mb={4} color="red.700">Chinese Astrology</Heading>
          <Text fontSize="sm" color="gray.600" mb={4}>
            {data.description}
          </Text>

          <SimpleGrid columns={[1, 2]} spacing={4} mb={4}>
            <Card variant="outline">
              <CardBody textAlign="center">
                <Heading size="lg" color="red.600">{data.year?.animal}</Heading>
                <Text fontSize="sm" color="gray.600">{data.year?.element}</Text>
                <Text fontSize="xs" mt={2}>{data.year?.traits}</Text>
              </CardBody>
            </Card>
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text fontWeight="bold">Month:</Text>
                <Badge colorScheme="red">{data.month?.animal}</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="bold">Day:</Text>
                <Badge colorScheme="orange">{data.day?.animal}</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="bold">Hour:</Text>
                <Badge colorScheme="gold">{data.hour?.animal}</Badge>
              </HStack>
            </VStack>
          </SimpleGrid>

          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Four Pillars of Destiny</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Your Four Pillars</AlertTitle>
                    <AlertDescription>
                      {data.four_pillars || 'Complete Four Pillars analysis combining year, month, day, and hour animals'}
                    </AlertDescription>
                  </Box>
                </Alert>
                <Box mt={4}>
                  <Text fontWeight="bold" mb={2}>Elements Analysis:</Text>
                  <Text fontSize="sm">{data.elements_analysis?.analysis || 'Five Elements interaction analysis'}</Text>
                </Box>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Personality Summary</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Text>{data.personality_summary || 'Chinese astrological personality analysis'}</Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CardBody>
      </Card>
    </VStack>
  );
};

const MayanChart: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <Text>No Mayan astrology data available</Text>;

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="rgba(240,255,240,0.95)">
        <CardBody>
          <Heading size="md" mb={4} color="green.700">Mayan Sacred Calendar</Heading>
          <Text fontSize="sm" color="gray.600" mb={4}>
            {data.description}
          </Text>

          <SimpleGrid columns={[1, 2]} spacing={4} mb={4}>
            <Card variant="outline" borderColor="green.200">
              <CardBody textAlign="center">
                <Heading size="lg" color="green.600">
                  {data.day_sign?.symbol} {data.day_sign?.name}
                </Heading>
                <Text fontSize="sm" color="gray.600">{data.day_sign?.meaning}</Text>
                <Badge colorScheme="green" mt={2}>{data.day_sign?.color}</Badge>
              </CardBody>
            </Card>
            <VStack align="stretch" spacing={2}>
              <Stat>
                <StatLabel>Sacred Number</StatLabel>
                <StatNumber>{data.sacred_number?.number}</StatNumber>
                <StatHelpText>{data.sacred_number?.meaning}</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Galactic Signature</StatLabel>
                <StatNumber fontSize="sm">{data.galactic_signature}</StatNumber>
              </Stat>
            </VStack>
          </SimpleGrid>

          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Wavespell & Long Count</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <SimpleGrid columns={[1, 2]} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" mb={2}>Wavespell Position:</Text>
                    <Text>{data.wavespell?.tone?.name} (Day {data.wavespell?.position}/13)</Text>
                    <Text fontSize="sm" color="gray.600">{data.wavespell?.description}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>Long Count:</Text>
                    <Text fontFamily="mono">{data.long_count?.date}</Text>
                    <Text fontSize="sm" color="gray.600">Mayan calendar correlation</Text>
                  </Box>
                </SimpleGrid>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Life Purpose & Guidance</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <VStack align="stretch" spacing={3}>
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Life Purpose</AlertTitle>
                      <AlertDescription>{data.life_purpose}</AlertDescription>
                    </Box>
                  </Alert>
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Spiritual Guidance</AlertTitle>
                      <AlertDescription>{data.spiritual_guidance}</AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CardBody>
      </Card>
    </VStack>
  );
};

const UranianChart: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <Text>No Uranian astrology data available</Text>;

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="rgba(240,240,255,0.95)">
        <CardBody>
          <Heading size="md" mb={4} color="indigo.700">Uranian Astrology</Heading>
          <Text fontSize="sm" color="gray.600" mb={4}>
            {data.description}
          </Text>

          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Transneptunian Points</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Planet</Th>
                      <Th>Position</Th>
                      <Th>Meaning</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(data.uranian_planets || {}).map(([planet, info]: [string, any]) => (
                      <Tr key={planet}>
                        <Td>
                          <HStack>
                            <Text>{info.symbol}</Text>
                            <Text fontWeight="medium">{planet.charAt(0).toUpperCase() + planet.slice(1)}</Text>
                          </HStack>
                        </Td>
                        <Td fontFamily="mono">{info.position?.toFixed(2)}°</Td>
                        <Td fontSize="sm">{info.meaning}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">90° Dial Aspects</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Bodies</Th>
                      <Th>Aspect</Th>
                      <Th>Orb</Th>
                      <Th>Meaning</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(data.dial_aspects || []).slice(0, 8).map((aspect: any, idx: number) => (
                      <Tr key={idx}>
                        <Td fontSize="sm">{aspect.body1} - {aspect.body2}</Td>
                        <Td>{aspect.angle}°</Td>
                        <Td>{aspect.orb?.toFixed(2)}°</Td>
                        <Td fontSize="xs">{aspect.meaning}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CardBody>
      </Card>
    </VStack>
  );
};

const SynthesisChart: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <Text>No synthesis data available</Text>;

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,255,255,0.95))">
        <CardBody>
          <Heading size="md" mb={4} color="teal.700">Integrated Analysis</Heading>
          <Text fontSize="sm" color="gray.600" mb={4}>
            Synthesis of insights from all astrological traditions
          </Text>

          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Primary Themes</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <VStack align="stretch" spacing={2}>
                  {(data.primary_themes || []).map((theme: string, idx: number) => (
                    <Badge key={idx} variant="outline" p={2} borderRadius="md">
                      {theme}
                    </Badge>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Life Purpose Integration</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <VStack align="stretch" spacing={3}>
                  {(data.life_purpose || []).map((purpose: string, idx: number) => (
                    <Alert key={idx} status="info" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription>{purpose}</AlertDescription>
                    </Alert>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Personality Integration</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <SimpleGrid columns={[1, 2]} spacing={4}>
                  {Object.entries(data.personality_integration || {}).map(([aspect, traits]: [string, any]) => (
                    <Box key={aspect}>
                      <Text fontWeight="bold" mb={2} textTransform="capitalize">
                        {aspect.replace('_', ' ')}:
                      </Text>
                      <VStack align="stretch" spacing={1}>
                        {(traits || []).map((trait: string, idx: number) => (
                          <Text key={idx} fontSize="sm" color="gray.600">
                            {trait}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Spiritual Path</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <VStack align="stretch" spacing={3}>
                  {(data.spiritual_path || []).map((guidance: string, idx: number) => (
                    <Alert key={idx} status="success" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription>{guidance}</AlertDescription>
                    </Alert>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CardBody>
      </Card>
    </VStack>
  );
};

export const MultiSystemChartDisplay: React.FC<MultiSystemChartProps> = ({ chartData, isLoading = false }) => {
  const bgColor = useColorModeValue("purple.50", "purple.900");
  const cardBg = useColorModeValue("white", "gray.800");

  if (isLoading) {
    return (
      <Box p={4} bg={bgColor} borderRadius="lg">
        <Text textAlign="center">Calculating multi-system chart...</Text>
      </Box>
    );
  }

  if (!chartData) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>No Chart Data</AlertTitle>
        <AlertDescription>Please calculate a chart to see the multi-system analysis.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box bg={bgColor} borderRadius="lg" p={4}>
      <VStack spacing={6} align="stretch">
        {/* Birth Information Header */}
        <Card bg={cardBg}>
          <CardBody>
            <Heading size="lg" mb={4} textAlign="center" color="purple.700">
              Multi-System Astrological Analysis
            </Heading>
            {chartData.birth_info && (
              <Flex justify="center" wrap="wrap" gap={4}>
                <Text><strong>Date:</strong> {chartData.birth_info.date}</Text>
                <Text><strong>Time:</strong> {chartData.birth_info.time}</Text>
                <Text><strong>Coordinates:</strong> {chartData.birth_info.location?.latitude?.toFixed(2)}°, {chartData.birth_info.location?.longitude?.toFixed(2)}°</Text>
                <Text><strong>Timezone:</strong> {chartData.birth_info.location?.timezone}</Text>
              </Flex>
            )}
          </CardBody>
        </Card>

        {/* Multi-System Tabs */}
        <Tabs isLazy colorScheme="purple" variant="enclosed">
          <TabList flexWrap="wrap">
            <Tab>Western Tropical</Tab>
            <Tab>Vedic Sidereal</Tab>
            <Tab>Chinese</Tab>
            <Tab>Mayan</Tab>
            <Tab>Uranian</Tab>
            <Tab>Synthesis</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={4}>
              <WesternChart data={chartData.western_tropical} />
            </TabPanel>
            <TabPanel p={0} pt={4}>
              <VedicChart data={chartData.vedic_sidereal} />
            </TabPanel>
            <TabPanel p={0} pt={4}>
              <ChineseChart data={chartData.chinese} />
            </TabPanel>
            <TabPanel p={0} pt={4}>
              <MayanChart data={chartData.mayan} />
            </TabPanel>
            <TabPanel p={0} pt={4}>
              <UranianChart data={chartData.uranian} />
            </TabPanel>
            <TabPanel p={0} pt={4}>
              <SynthesisChart data={chartData.synthesis} />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Footer with methodology */}
        <Card bg={cardBg} variant="outline">
          <CardBody>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              This analysis combines Western tropical astrology, Vedic sidereal calculations, Chinese Four Pillars, 
              Mayan sacred calendar, and Uranian midpoint techniques to provide a comprehensive astrological perspective.
            </Text>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default MultiSystemChartDisplay;
