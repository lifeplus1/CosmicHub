import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  Textarea,
  SimpleGrid,
  Badge,
  Icon,
  Progress,
  Divider,
  useColorModeValue,
  Container,
  Alert,
  AlertIcon,
  Flex,
  Avatar,
  Spinner,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaBrain, FaRobot, FaMagic, FaLightbulb, FaArrowLeft, FaComments, FaUser, FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import FeatureGuard from './FeatureGuard';
import { EducationalTooltip } from './EducationalTooltip';

export const AIInterpretationTest: React.FC = () => {
  const navigate = useNavigate();
  const [analysisType, setAnalysisType] = useState('personality');
  const [userQuestion, setUserQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const { isOpen: isGuideOpen, onToggle: onGuideToggle } = useDisclosure();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const bgGradient = useColorModeValue(
    'linear(to-br, cyan.50, blue.50, purple.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );

  const aiInsights = [
    {
      category: 'Core Personality',
      insight: 'Your Sagittarius Sun combined with Pisces Moon creates a fascinating blend of philosophical exploration and emotional depth. You possess an innate wisdom that draws others to seek your guidance.',
      confidence: 94,
      color: 'blue'
    },
    {
      category: 'Relationship Patterns',
      insight: 'With Venus in Scorpio, you experience love intensely and transformatively. Your relationships tend to be profound, life-changing experiences rather than casual connections.',
      confidence: 89,
      color: 'pink'
    },
    {
      category: 'Career Path',
      insight: 'Mars in Capricorn suggests natural leadership abilities and a methodical approach to achieving goals. You excel in roles requiring long-term planning and structured execution.',
      confidence: 92,
      color: 'green'
    },
    {
      category: 'Life Purpose',
      insight: 'Your North Node in Gemini indicates a lifetime journey toward improving communication, learning diverse skills, and sharing knowledge with others in meaningful ways.',
      confidence: 87,
      color: 'purple'
    }
  ];

  const conversationHistory = [
    {
      type: 'user',
      message: 'Can you explain the significance of my Saturn return?',
      timestamp: '2:34 PM'
    },
    {
      type: 'ai',
      message: 'Your Saturn return, occurring around age 29-30, represents a cosmic coming-of-age. Saturn in your chart shows where you need to develop discipline and maturity. For you, with Saturn in Aquarius, this period will focus on balancing your individuality with social responsibility and finding your unique contribution to collective progress.',
      timestamp: '2:35 PM'
    },
    {
      type: 'user',
      message: 'What about my career prospects this year?',
      timestamp: '2:37 PM'
    },
    {
      type: 'ai',
      message: 'With Jupiter transiting your 10th house of career, this is an exceptionally favorable year for professional growth. Your Mars in Capricorn gives you the persistence to capitalize on opportunities. I recommend focusing on leadership roles or starting that project you\'ve been planning - the cosmic timing is perfect.',
      timestamp: '2:38 PM'
    }
  ];

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);
  };

  const handleSendMessage = () => {
    if (!userQuestion.trim()) return;
    setIsAnalyzing(true);
    setCurrentResponse('');
    
    // Simulate typing response
    const responses = [
      "That's a fascinating question about your astrological profile. Based on your chart configuration...",
      "Your planetary aspects suggest unique patterns that illuminate this area of your life...",
      "The cosmic influences in your birth chart reveal important insights about this topic..."
    ];
    
    setTimeout(() => {
      setCurrentResponse(responses[Math.floor(Math.random() * responses.length)]);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <FeatureGuard feature="ai_interpretation" requiredTier="elite">
      <Box minH="100vh" bg={bgGradient}>
        <Container maxW="6xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Header Section */}
            <VStack spacing={4} textAlign="center">
              <HStack spacing={3}>
                <Icon as={FaBrain} color="cyan.500" boxSize={8} />
                <Heading size="xl" bgGradient="linear(to-r, cyan.400, blue.500, purple.500)" bgClip="text">
                  AI Astrological Interpretation
                </Heading>
                <Icon as={FaBrain} color="cyan.500" boxSize={8} />
              </HStack>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Unlock deep astrological insights with advanced AI-powered interpretation and personalized guidance
              </Text>
              <Badge colorScheme="gold" size="lg" px={4} py={2}>
                👑 Elite Feature Active
              </Badge>
            </VStack>

            {/* Educational Guide */}
            <Box>
              <Button
                onClick={onGuideToggle}
                variant="outline"
                colorScheme="cyan"
                size="sm"
                leftIcon={<Icon as={FaQuestionCircle} />}
                rightIcon={<Icon as={isGuideOpen ? FaChevronUp : FaChevronDown} />}
              >
                AI Interpretation Guide
              </Button>
              
              <Collapse in={isGuideOpen} animateOpacity>
                <Card mt={4} bg="cyan.50" borderColor="cyan.200" borderWidth={1}>
                  <CardHeader pb={2}>
                    <Heading size="sm" color="cyan.700">
                      Advanced AI Astrological Analysis
                    </Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="sm" color="cyan.700">
                        Our AI combines traditional astrological wisdom with modern analytical capabilities 
                        to provide personalized insights tailored to your unique chart patterns.
                      </Text>
                      
                      <HStack spacing={6} align="start">
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="cyan.600" mb={2}>
                            Analysis Types:
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            • Personality: Core traits & tendencies<br/>
                            • Career: Professional path insights<br/>
                            • Relationships: Compatibility patterns<br/>
                            • Life Purpose: Soul mission guidance<br/>
                            • Custom: Ask specific questions
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="cyan.600" mb={2}>
                            AI Capabilities:
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            • Synthesizes multiple chart factors<br/>
                            • Identifies complex patterns<br/>
                            • Provides nuanced interpretations<br/>
                            • Offers practical guidance<br/>
                            • Answers follow-up questions
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="cyan.600" mb={2}>
                            Best Questions:
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            • "What does my chart say about...?"<br/>
                            • "How can I work with my..."<br/>
                            • "What timing is best for...?"<br/>
                            • "Help me understand my..."<br/>
                            • "What should I focus on...?"
                          </Text>
                        </Box>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </Collapse>
            </Box>

            {!analysisComplete ? (
              /* Configuration */
              <Card bg={cardBg} shadow="xl" maxW="2xl" mx="auto">
                <CardHeader bg="cyan.50" roundedTop="md" textAlign="center">
                  <HStack justify="center">
                    <Icon as={FaRobot} color="cyan.500" />
                    <Heading size="md" color="cyan.600">
                      AI Analysis Type
                      <EducationalTooltip
                        title="AI Analysis Types"
                        description="Our AI can focus on different aspects of your chart to provide specialized insights tailored to your interests."
                        examples={[
                          "Personality: Core traits, strengths, and patterns",
                          "Relationships: Love style and compatibility",
                          "Career: Professional strengths and path",
                          "Spiritual: Soul purpose and growth areas",
                          "Timing: Current life phase and opportunities"
                        ]}
                        tier="elite"
                      />
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6}>
                    <Select 
                      value={analysisType} 
                      onChange={(e) => setAnalysisType(e.target.value)}
                      size="lg"
                    >
                      <option value="personality">Deep Personality Analysis</option>
                      <option value="relationships">Relationship Patterns</option>
                      <option value="career">Career & Life Path</option>
                      <option value="spiritual">Spiritual Growth</option>
                      <option value="timing">Current Life Phase</option>
                      <option value="comprehensive">Comprehensive Reading</option>
                    </Select>
                    
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Choose the type of AI interpretation you'd like to receive based on your birth chart
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              /* Analysis Results */
              <VStack spacing={6}>
                <Alert status="success" borderRadius="lg">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">AI Analysis Complete!</Text>
                    <Text fontSize="sm">Advanced insights generated based on your unique astrological signature</Text>
                  </VStack>
                </Alert>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} w="full">
                  {/* AI Insights */}
                  <Card bg={cardBg} shadow="lg">
                    <CardHeader>
                      <HStack>
                        <Icon as={FaLightbulb} color="yellow.500" />
                        <Heading size="md">AI Insights</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        {aiInsights.map((insight, index) => (
                          <Box key={index}>
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="sm" fontWeight="bold" color={`${insight.color}.600`}>
                                {insight.category}
                              </Text>
                              <Badge colorScheme={insight.color} size="sm">
                                {insight.confidence}% confidence
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" mb={2}>{insight.insight}</Text>
                            <Progress 
                              value={insight.confidence} 
                              size="xs" 
                              colorScheme={insight.color}
                              borderRadius="full"
                            />
                            {index < aiInsights.length - 1 && <Divider mt={3} />}
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* AI Chat Interface */}
                  <Card bg={cardBg} shadow="lg">
                    <CardHeader>
                      <HStack>
                        <Icon as={FaComments} color="blue.500" />
                        <Heading size="md">AI Chat</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch" h="400px">
                        <Box flex={1} overflowY="auto" bg="gray.50" p={3} borderRadius="md">
                          <VStack spacing={3} align="stretch">
                            {conversationHistory.map((msg, index) => (
                              <Flex key={index} justify={msg.type === 'user' ? 'flex-end' : 'flex-start'}>
                                <Flex 
                                  maxW="80%" 
                                  bg={msg.type === 'user' ? 'blue.500' : 'white'} 
                                  color={msg.type === 'user' ? 'white' : 'gray.800'}
                                  p={3} 
                                  borderRadius="lg"
                                  shadow="sm"
                                  align="start"
                                  gap={2}
                                >
                                  {msg.type === 'ai' && (
                                    <Avatar size="xs" bg="cyan.500" icon={<FaRobot />} />
                                  )}
                                  <Box>
                                    <Text fontSize="sm">{msg.message}</Text>
                                    <Text fontSize="xs" opacity={0.7} mt={1}>
                                      {msg.timestamp}
                                    </Text>
                                  </Box>
                                  {msg.type === 'user' && (
                                    <Avatar size="xs" bg="blue.500" icon={<FaUser />} />
                                  )}
                                </Flex>
                              </Flex>
                            ))}
                            {isAnalyzing && (
                              <Flex justify="flex-start">
                                <Flex bg="white" p={3} borderRadius="lg" shadow="sm" align="center" gap={2}>
                                  <Avatar size="xs" bg="cyan.500" icon={<FaRobot />} />
                                  <Spinner size="sm" color="cyan.500" />
                                  <Text fontSize="sm" color="gray.500">AI is thinking...</Text>
                                </Flex>
                              </Flex>
                            )}
                            {currentResponse && (
                              <Flex justify="flex-start">
                                <Flex bg="white" p={3} borderRadius="lg" shadow="sm" align="start" gap={2} maxW="80%">
                                  <Avatar size="xs" bg="cyan.500" icon={<FaRobot />} />
                                  <Text fontSize="sm">{currentResponse}</Text>
                                </Flex>
                              </Flex>
                            )}
                          </VStack>
                        </Box>
                        <HStack>
                          <Textarea
                            placeholder="Ask the AI about your chart..."
                            size="sm"
                            value={userQuestion}
                            onChange={(e) => setUserQuestion(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <Button 
                            colorScheme="blue" 
                            size="sm"
                            onClick={handleSendMessage}
                            isLoading={isAnalyzing}
                            isDisabled={!userQuestion.trim()}
                          >
                            Send
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Key Recommendations */}
                <Card bg={cardBg} shadow="lg" w="full">
                  <CardHeader>
                    <HStack>
                      <Icon as={FaMagic} color="purple.500" />
                      <Heading size="md">AI Recommendations</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <Box bg="green.50" p={4} borderRadius="md" borderColor="green.200" borderWidth={1}>
                        <Text fontWeight="bold" color="green.700" mb={2}>🌱 Growth Focus</Text>
                        <Text fontSize="sm">Develop your communication skills through writing or teaching. Your Mercury-Jupiter trine suggests natural teaching abilities.</Text>
                      </Box>
                      <Box bg="blue.50" p={4} borderRadius="md" borderColor="blue.200" borderWidth={1}>
                        <Text fontWeight="bold" color="blue.700" mb={2}>🎯 Career Direction</Text>
                        <Text fontSize="sm">Leadership roles in innovative fields suit your Mars-Uranus aspect. Consider technology or social reform sectors.</Text>
                      </Box>
                      <Box bg="purple.50" p={4} borderRadius="md" borderColor="purple.200" borderWidth={1}>
                        <Text fontWeight="bold" color="purple.700" mb={2}>💫 Spiritual Path</Text>
                        <Text fontSize="sm">Your Neptune-Moon connection suggests strong intuitive abilities. Meditation and creative expression will enhance this gift.</Text>
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </VStack>
            )}

            {/* Action Buttons */}
            <HStack spacing={4} justify="center">
              <Button 
                leftIcon={<FaArrowLeft />}
                onClick={() => navigate('/')} 
                variant="outline"
                colorScheme="gray"
              >
                Back to Dashboard
              </Button>
              {!analysisComplete && (
                <Button 
                  colorScheme="cyan" 
                  size="lg"
                  onClick={handleStartAnalysis}
                  leftIcon={<FaBrain />}
                  isLoading={isAnalyzing}
                  loadingText="AI Analyzing..."
                >
                  Generate AI Insights
                </Button>
              )}
              {analysisComplete && (
                <Button 
                  colorScheme="purple" 
                  onClick={() => {
                    setAnalysisComplete(false);
                    setIsAnalyzing(false);
                    setCurrentResponse('');
                    setUserQuestion('');
                  }}
                >
                  New Analysis
                </Button>
              )}
            </HStack>

            {isAnalyzing && !analysisComplete && (
              <Card bg={cardBg} shadow="lg" maxW="md" mx="auto">
                <CardBody>
                  <VStack spacing={4}>
                    <HStack>
                      <Spinner color="cyan.500" />
                      <Text fontWeight="bold">AI Processing Your Chart...</Text>
                    </HStack>
                    <Progress size="lg" colorScheme="cyan" isIndeterminate w="full" />
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Analyzing planetary positions, aspects, and cosmic patterns
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </Container>
      </Box>
    </FeatureGuard>
  );
};
