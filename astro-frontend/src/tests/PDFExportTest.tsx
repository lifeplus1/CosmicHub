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
  Switch,
  FormControl,
  FormLabel,
  SimpleGrid,
  Badge,
  Icon,
  Progress,
  Divider,
  useColorModeValue,
  Container,
  Alert,
  AlertIcon,
  CheckboxGroup,
  Checkbox,
  Stack,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaFilePdf, FaDownload, FaCog, FaPalette, FaArrowLeft, FaCheck, FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import FeatureGuard from './FeatureGuard';
import { EducationalTooltip } from './EducationalTooltip';

export const PDFExportTest: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [selectedSections, setSelectedSections] = useState(['chart', 'planets', 'aspects']);
  const [reportStyle, setReportStyle] = useState('modern');
  const [includeInterpretations, setIncludeInterpretations] = useState(true);
  const { isOpen: isGuideOpen, onToggle: onGuideToggle } = useDisclosure();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, indigo.50, purple.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );

  const reportSections = [
    { id: 'chart', label: 'Birth Chart Wheel', description: 'Visual chart diagram' },
    { id: 'planets', label: 'Planetary Positions', description: 'Detailed planet positions and signs' },
    { id: 'aspects', label: 'Aspect Analysis', description: 'Planetary aspects and their meanings' },
    { id: 'houses', label: 'House Analysis', description: 'House positions and interpretations' },
    { id: 'elements', label: 'Element Balance', description: 'Fire, Earth, Air, Water distribution' },
    { id: 'modalities', label: 'Modality Analysis', description: 'Cardinal, Fixed, Mutable balance' }
  ];

  const handleGeneratePDF = () => {
    setIsGenerating(true);
    // Simulate PDF generation
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationComplete(true);
    }, 3000);
  };

  return (
    <FeatureGuard feature="pdf_export" requiredTier="premium">
      <Box minH="100vh" bg={bgGradient}>
        <Container maxW="6xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Header Section */}
            <VStack spacing={4} textAlign="center">
              <HStack spacing={3}>
                <Icon as={FaFilePdf} color="red.500" boxSize={8} />
                <Heading size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                  Professional PDF Export
                </Heading>
                <Icon as={FaFilePdf} color="red.500" boxSize={8} />
              </HStack>
              <Text fontSize="lg" color="whiteAlpha.800" maxW="2xl">
                Generate beautiful, professional-quality PDF reports of your astrological charts
              </Text>
              <Badge colorScheme="purple" size="lg" px={4} py={2}>
                🌟 Premium Feature Active
              </Badge>
            </VStack>

            {/* Educational Guide */}
            <Box>
              <Button
                onClick={onGuideToggle}
                variant="outline"
                colorScheme="blue"
                size="sm"
                leftIcon={<Icon as={FaQuestionCircle} />}
                rightIcon={<Icon as={isGuideOpen ? FaChevronUp : FaChevronDown} />}
              >
                PDF Export Guide
              </Button>
              
              <Collapse in={isGuideOpen} animateOpacity>
                <Card mt={4} bg="blue.50" borderColor="blue.200" borderWidth={1}>
                  <CardHeader pb={2}>
                    <Heading size="sm" color="blue.700">
                      Creating Professional Astrological Reports
                    </Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="sm" color="blue.700">
                        Our PDF export feature creates publication-quality astrological reports perfect for 
                        professional consultations, personal reference, or sharing with clients.
                      </Text>
                      
                      <HStack spacing={6} align="start">
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={2}>
                            Report Styles:
                          </Text>
                          <Text fontSize="xs" color="whiteAlpha.800">
                            • Modern: Clean, minimalist design<br/>
                            • Classical: Traditional astrology layout<br/>
                            • Detailed: Comprehensive analysis<br/>
                            • Colorful: Visual with color coding
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={2}>
                            Professional Uses:
                          </Text>
                          <Text fontSize="xs" color="whiteAlpha.800">
                            • Client consultations<br/>
                            • Personal study and reference<br/>
                            • Educational materials<br/>
                            • Portfolio documentation
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={2}>
                            Quality Features:
                          </Text>
                          <Text fontSize="xs" color="whiteAlpha.800">
                            • High-resolution chart wheels<br/>
                            • Detailed interpretations<br/>
                            • Professional formatting<br/>
                            • Customizable sections
                          </Text>
                        </Box>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </Collapse>
            </Box>

            {!generationComplete ? (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {/* Configuration Panel */}
                <Card bg={cardBg} shadow="xl" borderWidth={2} borderColor="blue.200">
                  <CardHeader bg="blue.50" roundedTop="md">
                    <HStack>
                      <Icon as={FaCog} color="blue.500" />
                      <Heading size="md" color="blue.600">Report Configuration</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <FormControl>
                        <FormLabel>
                          Report Style
                          <EducationalTooltip
                            title="Report Style Options"
                            description="Choose the visual design that best fits your needs. Each style presents the same data with different aesthetics."
                            examples={[
                              "Modern: Best for contemporary clients",
                              "Classical: Traditional astrology enthusiasts",
                              "Detailed: In-depth professional reports",
                              "Colorful: Visual learners and presentations"
                            ]}
                          />
                        </FormLabel>
                        <Select value={reportStyle} onChange={(e) => setReportStyle(e.target.value)}>
                          <option value="modern">Modern & Minimalist</option>
                          <option value="classical">Classical Astrology</option>
                          <option value="detailed">Detailed Professional</option>
                          <option value="colorful">Colorful & Visual</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>
                          Include Sections
                          <EducationalTooltip
                            title="Report Sections"
                            description="Select which parts of the astrological analysis to include in your PDF report."
                            examples={[
                              "Chart: Visual representation essential for understanding",
                              "Planets: Core personality factors",
                              "Aspects: Relationships between planets",
                              "Houses: Life areas and themes"
                            ]}
                          />
                        </FormLabel>
                        <CheckboxGroup 
                          value={selectedSections} 
                          onChange={(values) => setSelectedSections(values as string[])}
                        >
                          <Stack spacing={2}>
                            {reportSections.map((section) => (
                              <Checkbox key={section.id} value={section.id}>
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="medium">{section.label}</Text>
                                  <Text fontSize="xs" color="gray.500">{section.description}</Text>
                                </VStack>
                              </Checkbox>
                            ))}
                          </Stack>
                        </CheckboxGroup>
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="interpretations" mb="0">
                          Include Interpretations
                          <EducationalTooltip
                            title="Astrological Interpretations"
                            description="Add detailed explanations of planetary positions, aspects, and house meanings to help understand the chart."
                            tier="premium"
                          />
                        </FormLabel>
                        <Switch 
                          id="interpretations" 
                          isChecked={includeInterpretations}
                          onChange={(e) => setIncludeInterpretations(e.target.checked)}
                          colorScheme="purple"
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Preview Panel */}
                <Card bg={cardBg} shadow="xl" borderWidth={2} borderColor="purple.200">
                  <CardHeader bg="purple.50" roundedTop="md">
                    <HStack>
                      <Icon as={FaPalette} color="purple.500" />
                      <Heading size="md" color="purple.600">Report Preview</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <Box 
                        w="full" 
                        h="200px" 
                        bg="gray.100" 
                        borderRadius="md" 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                        border="2px dashed"
                        borderColor="gray.300"
                      >
                        <VStack spacing={2}>
                          <Icon as={FaFilePdf} color="gray.400" boxSize={10} />
                          <Text color="gray.500" fontSize="sm">PDF Preview</Text>
                          <Text color="gray.400" fontSize="xs">
                            {selectedSections.length} sections • {reportStyle} style
                          </Text>
                        </VStack>
                      </Box>
                      
                      <VStack spacing={2} w="full" align="start">
                        <Text fontSize="sm" fontWeight="bold">Report Details:</Text>
                        <Text fontSize="xs" color="whiteAlpha.800">
                          • Style: {reportStyle.charAt(0).toUpperCase() + reportStyle.slice(1)}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.800">
                          • Sections: {selectedSections.length} of {reportSections.length}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.800">
                          • Interpretations: {includeInterpretations ? 'Included' : 'Not included'}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.800">
                          • Estimated pages: {Math.max(5, selectedSections.length * 2 + (includeInterpretations ? 5 : 0))}
                        </Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            ) : (
              /* Generation Complete */
              <VStack spacing={6}>
                <Alert status="success" borderRadius="lg">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">PDF Report Generated Successfully!</Text>
                    <Text fontSize="sm">Your professional astrology report is ready for download</Text>
                  </VStack>
                </Alert>

                <Card bg={cardBg} shadow="lg" maxW="2xl" mx="auto">
                  <CardHeader textAlign="center">
                    <Icon as={FaCheck} color="green.500" boxSize={12} />
                    <Heading size="md" mt={2}>Report Ready</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <Box textAlign="center">
                        <Text fontSize="lg" fontWeight="bold">Birth_Chart_Report.pdf</Text>
                        <Text fontSize="sm" color="whiteAlpha.800">Generated on {new Date().toLocaleDateString()}</Text>
                      </Box>
                      
                      <Divider />
                      
                      <VStack spacing={2} w="full">
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm">File size:</Text>
                          <Text fontSize="sm" fontWeight="medium">2.4 MB</Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm">Pages:</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {Math.max(5, selectedSections.length * 2 + (includeInterpretations ? 5 : 0))}
                          </Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm">Format:</Text>
                          <Text fontSize="sm" fontWeight="medium">High-resolution PDF</Text>
                        </HStack>
                      </VStack>
                      
                      <Button 
                        colorScheme="green" 
                        size="lg" 
                        w="full"
                        leftIcon={<FaDownload />}
                      >
                        Download PDF Report
                      </Button>
                    </VStack>
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
              {!generationComplete && (
                <Button 
                  colorScheme="blue" 
                  size="lg"
                  onClick={handleGeneratePDF}
                  leftIcon={<FaFilePdf />}
                  isLoading={isGenerating}
                  loadingText="Generating PDF..."
                  isDisabled={selectedSections.length === 0}
                >
                  Generate PDF Report
                </Button>
              )}
              {generationComplete && (
                <Button 
                  colorScheme="purple" 
                  onClick={() => {
                    setGenerationComplete(false);
                    setIsGenerating(false);
                  }}
                >
                  Generate New Report
                </Button>
              )}
            </HStack>

            {isGenerating && (
              <Card bg={cardBg} shadow="lg" maxW="md" mx="auto">
                <CardBody>
                  <VStack spacing={4}>
                    <Text fontWeight="bold">Generating Your Report...</Text>
                    <Progress size="lg" colorScheme="blue" isIndeterminate w="full" />
                    <Text fontSize="sm" color="whiteAlpha.800" textAlign="center">
                      Creating high-quality charts and formatting interpretations
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
