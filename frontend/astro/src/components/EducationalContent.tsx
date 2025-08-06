import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Divider,
  Alert,
  AlertIcon,
  Icon,
  Container
} from '@chakra-ui/react';
import { FaChartLine, FaKey, FaDna, FaHeart, FaBrain, FaCompass, FaStar } from 'react-icons/fa';

const EducationalContent: React.FC = () => {
  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8}>
        {/* Header */}
        <VStack spacing={4} textAlign="center">
          <Heading size="xl" color="purple.600">
            Understanding Human Design & Gene Keys
          </Heading>
          <Text fontSize="lg" color="whiteAlpha.800" maxW="2xl">
            Comprehensive guides to help you understand and apply these powerful systems 
            for personal transformation and authentic living.
          </Text>
        </VStack>

        {/* Human Design Section */}
        <Card w="full">
          <CardHeader>
            <HStack>
              <Icon as={FaChartLine} color="blue.500" boxSize={6} />
              <Heading size="lg">Human Design System</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <Accordion allowMultiple>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Heading size="md">What is Human Design?</Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="start" spacing={4}>
                    <Text>
                      Human Design is a synthesis of ancient wisdom and modern science, combining 
                      elements from the I Ching, Astrology, Kabbalah, Hindu-Brahmin chakra system, 
                      and Quantum Physics. It provides a blueprint for understanding your unique 
                      energy type and how to make decisions aligned with your authentic self.
                    </Text>
                    <Text fontWeight="bold">Core Components:</Text>
                    <List spacing={2} pl={4}>
                      <ListItem>
                        <ListIcon as={FaDna} color="blue.500" />
                        <strong>Type:</strong> Your energy configuration (Manifestor, Generator, Manifesting Generator, Projector, Reflector)
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FaCompass} color="blue.500" />
                        <strong>Strategy:</strong> How you're designed to engage with life
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FaHeart} color="blue.500" />
                        <strong>Authority:</strong> Your inner decision-making process
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FaBrain} color="blue.500" />
                        <strong>Centers:</strong> Nine energy centers that process life force
                      </ListItem>
                    </List>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Heading size="md">The Five Types</Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Grid templateColumns="repeat(1, 1fr)" gap={4}>
                    <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                      <Heading size="sm" color="red.600" mb={2}>Manifestor (9%)</Heading>
                      <Text fontSize="sm" mb={2}>
                        <strong>Strategy:</strong> Inform before you act
                      </Text>
                      <Text fontSize="sm">
                        Initiators who are here to make things happen. They have the power to 
                        start new things and impact others through their actions.
                      </Text>
                    </Box>
                    
                    <Box p={4} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">
                      <Heading size="sm" color="orange.600" mb={2}>Generator (37%)</Heading>
                      <Text fontSize="sm" mb={2}>
                        <strong>Strategy:</strong> Respond to life
                      </Text>
                      <Text fontSize="sm">
                        Builders who are here to master their craft. They have sustainable 
                        life force energy when engaged in work they love.
                      </Text>
                    </Box>
                    
                    <Box p={4} bg="yellow.50" borderRadius="md" border="1px" borderColor="yellow.200">
                      <Heading size="sm" color="yellow.600" mb={2}>Manifesting Generator (33%)</Heading>
                      <Text fontSize="sm" mb={2}>
                        <strong>Strategy:</strong> Respond, then inform
                      </Text>
                      <Text fontSize="sm">
                        Multi-passionate builders and initiators. They can do multiple things 
                        at once and skip steps in the process.
                      </Text>
                    </Box>
                    
                    <Box p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                      <Heading size="sm" color="green.600" mb={2}>Projector (20%)</Heading>
                      <Text fontSize="sm" mb={2}>
                        <strong>Strategy:</strong> Wait for invitation
                      </Text>
                      <Text fontSize="sm">
                        Guides who are here to see the big picture. They excel at managing 
                        and directing energy when recognized and invited.
                      </Text>
                    </Box>
                    
                    <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                      <Heading size="sm" color="blue.600" mb={2}>Reflector (1%)</Heading>
                      <Text fontSize="sm" mb={2}>
                        <strong>Strategy:</strong> Wait a lunar cycle
                      </Text>
                      <Text fontSize="sm">
                        Mirrors who reflect the health of their community. They need time 
                        to make decisions and are deeply connected to lunar cycles.
                      </Text>
                    </Box>
                  </Grid>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Heading size="md">Centers & Definition</Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="start" spacing={4}>
                    <Text>
                      The nine centers process different types of energy and awareness:
                    </Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                      <VStack align="start" spacing={2}>
                        <Heading size="sm" color="purple.600">Defined Centers</Heading>
                        <Text fontSize="sm">
                          • Consistent, reliable energy<br/>
                          • Your authentic self<br/>
                          • Where you have wisdom to share<br/>
                          • Fixed way of processing this energy
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Heading size="sm" color="blue.600">Undefined Centers</Heading>
                        <Text fontSize="sm">
                          • Variable, conditioning energy<br/>
                          • Where you take in others' energy<br/>
                          • Potential for wisdom through experience<br/>
                          • Area of potential conditioning
                        </Text>
                      </VStack>
                    </Grid>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </CardBody>
        </Card>

        {/* Gene Keys Section */}
        <Card w="full">
          <CardHeader>
            <HStack>
              <Icon as={FaKey} color="purple.500" boxSize={6} />
              <Heading size="lg">Gene Keys System</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <Accordion allowMultiple>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Heading size="md">What are the Gene Keys?</Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="start" spacing={4}>
                    <Text>
                      The Gene Keys is a contemporary synthesis of the I Ching, genetics, and 
                      consciousness studies. It maps 64 genetic archetypes that describe the 
                      journey from fear (Shadow) through love (Gift) to enlightenment (Siddhi).
                    </Text>
                    <Text fontWeight="bold">The Three Levels:</Text>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
                      <Box p={3} bg="red.50" borderRadius="md" textAlign="center">
                        <Icon as={FaHeart} color="red.500" mb={2} />
                        <Heading size="sm" color="red.600">Shadow</Heading>
                        <Text fontSize="sm">Victim consciousness, fear-based patterns</Text>
                      </Box>
                      <Box p={3} bg="green.50" borderRadius="md" textAlign="center">
                        <Icon as={FaStar} color="green.500" mb={2} />
                        <Heading size="sm" color="green.600">Gift</Heading>
                        <Text fontSize="sm">Genius frequency, love-based service</Text>
                      </Box>
                      <Box p={3} bg="yellow.50" borderRadius="md" textAlign="center">
                        <Icon as={FaStar} color="yellow.500" mb={2} />
                        <Heading size="sm" color="yellow.600">Siddhi</Heading>
                        <Text fontSize="sm">Enlightened state, unity consciousness</Text>
                      </Box>
                    </Grid>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Heading size="md">The Three Sequences</Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="start" spacing={4}>
                    <Grid templateColumns="repeat(1, 1fr)" gap={4}>
                      <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                        <Heading size="sm" color="blue.600" mb={2}>Activation Sequence (IQ)</Heading>
                        <Text fontSize="sm">
                          The first sequence focuses on mental intelligence and breaking free 
                          from victim consciousness. It teaches you to take responsibility for 
                          your life and awaken your genius.
                        </Text>
                      </Box>
                      
                      <Box p={4} bg="pink.50" borderRadius="md" border="1px" borderColor="pink.200">
                        <Heading size="sm" color="pink.600" mb={2}>EQ Sequence (Emotional Intelligence)</Heading>
                        <Text fontSize="sm">
                          The second sequence develops emotional intelligence and the ability 
                          to transform relationships. It's about opening your heart and 
                          learning to love unconditionally.
                        </Text>
                      </Box>
                      
                      <Box p={4} bg="purple.50" borderRadius="md" border="1px" borderColor="purple.200">
                        <Heading size="sm" color="purple.600" mb={2}>SQ Sequence (Somatic Intelligence)</Heading>
                        <Text fontSize="sm">
                          The third sequence activates somatic intelligence and prepares you 
                          for higher states of consciousness. It's about embodying your gifts 
                          and serving the collective.
                        </Text>
                      </Box>
                    </Grid>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Heading size="md">Contemplation Practice</Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="start" spacing={4}>
                    <Text>
                      The Gene Keys are designed to be contemplated, not analyzed. Here's how to work with them:
                    </Text>
                    <List spacing={2} pl={4}>
                      <ListItem>
                        <ListIcon as={FaStar} color="purple.500" />
                        <strong>Daily Contemplation:</strong> Spend 10-20 minutes quietly reflecting on your Gene Key
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FaStar} color="purple.500" />
                        <strong>Observe Patterns:</strong> Notice how the Shadow-Gift-Siddhi spectrum shows up in your life
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FaStar} color="purple.500" />
                        <strong>Patient Transformation:</strong> Allow natural shifts to occur over time (7+ days per Gene Key)
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FaStar} color="purple.500" />
                        <strong>Embodied Living:</strong> Practice living from the Gift frequency in daily interactions
                      </ListItem>
                    </List>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </CardBody>
        </Card>

        {/* Integration Section */}
        <Card w="full">
          <CardHeader>
            <Heading size="lg" textAlign="center">Integration & Synthesis</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              <Text fontSize="lg" textAlign="center">
                Human Design and Gene Keys are complementary systems that work beautifully together:
              </Text>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={8}>
                <VStack align="start" spacing={4}>
                  <Heading size="md" color="blue.600">Human Design Provides:</Heading>
                  <List spacing={2}>
                    <ListItem fontSize="sm">
                      <ListIcon as={FaCompass} color="blue.500" />
                      Practical strategy for daily decisions
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={FaCompass} color="blue.500" />
                      Understanding of your energy mechanics
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={FaCompass} color="blue.500" />
                      Clear authority for decision-making
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={FaCompass} color="blue.500" />
                      Framework for authentic living
                    </ListItem>
                  </List>
                </VStack>
                
                <VStack align="start" spacing={4}>
                  <Heading size="md" color="purple.600">Gene Keys Provides:</Heading>
                  <List spacing={2}>
                    <ListItem fontSize="sm">
                      <ListIcon as={FaKey} color="purple.500" />
                      Contemplative practice for transformation
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={FaKey} color="purple.500" />
                      Path from Shadow to Gift to Siddhi
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={FaKey} color="purple.500" />
                      Deep psychological insights
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={FaKey} color="purple.500" />
                      Evolutionary consciousness work
                    </ListItem>
                  </List>
                </VStack>
              </Grid>

              <Divider />

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Recommended Approach:</Text>
                  <Text fontSize="sm">
                    1. Start with Human Design to understand your mechanics and strategy<br/>
                    2. Use Gene Keys contemplation to transform unconscious patterns<br/>
                    3. Apply both systems together for a complete path of awakening<br/>
                    4. Remember: This is a lifelong journey of self-discovery and service
                  </Text>
                </VStack>
              </Alert>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default EducationalContent;
