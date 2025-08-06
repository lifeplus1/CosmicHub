import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  Switch,
  Text,
  HStack,
  Badge,
  useToast,
  Select,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Collapse,
  useDisclosure
} from "@chakra-ui/react";
import { FaBook, FaInfoCircle } from "react-icons/fa";
import ChartDisplay from "./ChartDisplay";
import { MultiSystemChartDisplay, type MultiSystemChartData } from "./MultiSystemChart";
import FeatureGuard from "./FeatureGuard";
import { EducationalTooltip } from "./EducationalTooltip";

interface FormData {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  city: string;
  multiSystem: boolean;
}

export interface ExtendedChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  angles: Record<string, number>;
  sun?: string;
  moon?: string;
  rising?: string;
  planets: Record<string, {
    position: number;
    house: number;
    retrograde?: boolean;
    speed?: number;
  }>;
  houses: Array<{
    house: number;
    cusp: number;
    sign: string;
  }>;
  aspects: Array<{
    point1: string;
    point2: string;
    aspect: string;
    orb: number;
    exact: boolean;
    point1_sign?: string;
    point2_sign?: string;
    point1_house?: number;
    point2_house?: number;
  }>;
}

export default function ChartCalculator(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
    city: "",
    multiSystem: false,
  });
  const [houseSystem, setHouseSystem] = useState<string>("P"); // Default to Placidus
  const [chart, setChart] = useState<ExtendedChartData | MultiSystemChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();
  const { isOpen: isGuideOpen, onToggle: toggleGuide } = useDisclosure();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean): void => {
    setFormData((prev) => ({ ...prev, multiSystem: checked }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = formData.multiSystem ? '/calculate-multi-system' : '/calculate';
      const url = `${import.meta.env.VITE_BACKEND_URL}${endpoint}?house_system=${houseSystem}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: parseInt(formData.year),
          month: parseInt(formData.month),
          day: parseInt(formData.day),
          hour: parseInt(formData.hour),
          minute: parseInt(formData.minute),
          city: formData.city,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to calculate chart");
      }

      // Parse response JSON
      const data = await response.json();

      // Validate/cast response to ExtendedChartData or MultiSystemChartData
      setChart(data.chart as ExtendedChartData | MultiSystemChartData);
      toast({
        title: "Chart calculated successfully!",
        description: formData.multiSystem 
          ? "Multi-system analysis complete with Western, Vedic, Chinese, Mayan, and Uranian astrology" 
          : "Western tropical chart calculated",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast({
        title: "Calculation failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.year && formData.month && formData.day && formData.hour && formData.minute && formData.city;
  // setHouseSystem is now handled by useState above

  // Type guard for ExtendedChartData
  function isExtendedChartData(data: ExtendedChartData | MultiSystemChartData | null): data is ExtendedChartData {
    return !!data && typeof data === "object" &&
      "latitude" in data &&
      "longitude" in data &&
      "timezone" in data &&
      "julian_day" in data &&
      "angles" in data &&
      "planets" in data &&
      "houses" in data &&
      "aspects" in data;
  }

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <VStack spacing={6} align="stretch">
        <Box bg="purple.800" color="white" borderRadius="lg" shadow="lg" p={6}>
          <Heading as="h1" mb={4} textAlign="center" color="gold">
            {formData.multiSystem ? "Multi-System Astrological Chart" : "Natal Chart Calculator"}
          </Heading>
          
          <HStack justify="center" mb={6}>
            <Button
              size="sm"
              leftIcon={<FaBook />}
              onClick={toggleGuide}
              variant="cosmic"
            >
              {isGuideOpen ? 'Hide' : 'Show'} Chart Guide
            </Button>
          </HStack>
          
          {/* Educational Guide */}
          <Collapse in={isGuideOpen} animateOpacity>
            <Card bg="blue.50" borderColor="blue.200" borderWidth={2} mb={6}>
              <CardHeader>
                <HStack>
                  <Icon as={FaInfoCircle} color="blue.500" />
                  <Heading size="sm" color="blue.700">Understanding Your Birth Chart</Heading>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="sm" color="blue.700">
                    Your birth chart is a map of the sky at your exact moment of birth. 
                    It shows planetary positions, zodiac signs, and houses that influence your personality and life path.
                  </Text>
                  
                  <HStack spacing={6} align="start">
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={2}>
                        Essential Data Needed:
                      </Text>
                      <Text fontSize="xs" color="whiteAlpha.800">
                        • Exact birth date<br/>
                        • Birth time (hour & minute)<br/>
                        • Birth location (city/country)<br/>
                        • House system preference
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={2}>
                        What You'll Discover:
                      </Text>
                      <Text fontSize="xs" color="whiteAlpha.800">
                        • Your Sun, Moon, and Rising signs<br/>
                        • Planetary positions and aspects<br/>
                        • House placements<br/>
                        • Personality insights
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={2}>
                        Multi-System Analysis:
                      </Text>
                      <Text fontSize="xs" color="whiteAlpha.800">
                        • Western tropical astrology<br/>
                        • Vedic sidereal system<br/>
                        • Chinese Four Pillars<br/>
                        • Mayan sacred calendar
                      </Text>
                    </Box>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </Collapse>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              {/* Multi-System Toggle */}
              <FeatureGuard 
                requiredTier="premium"
                feature="Multi-System Analysis"
                upgradeMessage="Unlock advanced astrological insights with our Multi-System Analysis"
              >
                <Box 
                  p={4} 
                  bg="rgba(15, 23, 42, 0.6)"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  borderRadius="md"
                >
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" color="gold.200">
                        Multi-System Analysis
                      </Text>
                      <Text fontSize="sm" color="gray.300">
                        Include Vedic, Chinese, Mayan, and Uranian astrology
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Switch
                        isChecked={formData.multiSystem}
                        onChange={(e) => handleSwitchChange(e.target.checked)}
                        colorScheme="gold"
                        size="lg"
                      />
                      {formData.multiSystem && (
                        <Badge colorScheme="green" fontSize="xs">
                          Enhanced Analysis
                        </Badge>
                      )}
                    </VStack>
                  </HStack>
                  {formData.multiSystem && (
                    <Text fontSize="xs" color="gray.400" mt={2}>
                      ✨ Includes Western tropical, Vedic sidereal, Chinese Four Pillars, 
                      Mayan sacred calendar, and Uranian midpoint analysis
                    </Text>
                  )}
                </Box>
              </FeatureGuard>

              {/* Form Fields */}
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="gold.200" fontSize="md" fontWeight="600">
                    Year
                    <EducationalTooltip
                      title="Birth Year"
                      description="Your birth year determines the positions of all planets in the zodiac and is essential for accurate chart calculation."
                    />
                  </FormLabel>
                  <Input 
                    type="number" 
                    name="year" 
                    value={formData.year} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 1990" 
                    variant="cosmic"
                    size="lg"
                    aria-required="true" 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="gold.200" fontSize="md" fontWeight="600">
                    Month
                    <EducationalTooltip
                      title="Birth Month"
                      description="The month determines your Sun sign and affects the positions of all planets in your natal chart."
                    />
                  </FormLabel>
                  <Input 
                    type="number" 
                    name="month" 
                    value={formData.month} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 6" 
                    variant="cosmic"
                    size="lg"
                    aria-required="true" 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="gold.200" fontSize="md" fontWeight="600">
                    Day
                    <EducationalTooltip
                      title="Birth Day"
                      description="The exact day is crucial for precise planetary positions and can affect your Sun sign if born during sign changes."
                    />
                  </FormLabel>
                  <Input 
                    type="number" 
                    name="day" 
                    value={formData.day} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 15" 
                    variant="cosmic"
                    aria-required="true" 
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="gold.200">
                    Hour (24h)
                    <EducationalTooltip
                      title="Birth Hour Importance"
                      description="Birth hour is crucial for determining your Rising sign and house positions. Use 24-hour format (0-23)."
                      examples={[
                        "0 = Midnight",
                        "12 = Noon", 
                        "18 = 6 PM",
                        "Even small errors can change your chart significantly"
                      ]}
                    />
                  </FormLabel>
                  <Input 
                    type="number" 
                    name="hour" 
                    value={formData.hour} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 14" 
                    variant="cosmic"
                    aria-required="true" 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="gold.200">
                    Minute
                    <EducationalTooltip
                      title="Birth Minute Precision"
                      description="Minutes matter! Even a 4-minute difference can change your Rising sign. Check your birth certificate for exact time."
                    />
                  </FormLabel>
                  <Input 
                    type="number" 
                    name="minute" 
                    value={formData.minute} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 30" 
                    variant="cosmic"
                    aria-required="true" 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="gold.200">
                    House System
                    <EducationalTooltip
                      title="House Systems Explained"
                      description="House systems determine how the 12 houses are calculated and can affect interpretation. Each system has different strengths."
                      examples={[
                        "Placidus: Most popular, time-based division",
                        "Equal House: Each house is exactly 30 degrees",
                        "Whole Sign: Each sign equals one house",
                        "Koch: Similar to Placidus, handles extreme latitudes better"
                      ]}
                    />
                  </FormLabel>

                  <Select 
                    value={houseSystem} 
                    onChange={(e) => setHouseSystem(e.target.value)} 
                    variant="cosmic"
                  >
                    <option value="P">Placidus (Most Popular)</option>
                    <option value="E">Equal House</option>
                    <option value="W">Whole Sign (Traditional)</option>
                    <option value="K">Koch</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel color="gold.200">
                  Birth Location
                  <EducationalTooltip
                    title="Birth Location Importance"
                    description="Your birth location determines time zone and geographical coordinates needed for accurate house calculations and local planetary angles."
                    examples={[
                      "Use the most specific location possible",
                      "Include city, state/province, and country",
                      "Different cities can have different astrology"
                    ]}
                  />
                </FormLabel>
                <Input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  placeholder="e.g., New York, NY, USA" 
                  variant="cosmic"
                  aria-required="true" 
                />
              </FormControl>
              
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              <Button
                type="submit"
                variant="gold"
                size="lg"
                fontWeight="bold"
                isLoading={loading}
                loadingText={formData.multiSystem ? "Calculating Multi-System Chart..." : "Calculating Chart..."}
                isDisabled={!isFormValid}
              >
                {formData.multiSystem ? "🌟 Calculate Multi-System Chart 🌟" : "Calculate Natal Chart"}
              </Button>
            </VStack>
          </form>
        </Box>

        {/* Chart Display */}
        {chart && (
          <Box>
            {formData.multiSystem
              ? !isExtendedChartData(chart) && (
                  <MultiSystemChartDisplay chartData={chart as MultiSystemChartData} isLoading={loading} />
                )
              : isExtendedChartData(chart) && <ChartDisplay chart={chart} />}
          </Box>
        )}
      </VStack>
    </Box>
  );
}
