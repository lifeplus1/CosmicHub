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
} from "@chakra-ui/react";
import ChartDisplay from "./ChartDisplay";
import { MultiSystemChartDisplay } from "./MultiSystemChartDisplay";

interface FormData {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  city: string;
  multiSystem: boolean;
}

export default function ChartCalculator() {
  const [formData, setFormData] = useState<FormData>({
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
    city: "",
    multiSystem: false,
  });
  const [houseSystem, setHouseSystem] = useState("P");
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, multiSystem: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      const data = await response.json();
      setChart(data.chart);
      
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

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <VStack spacing={6} align="stretch">
        <Box bg="purple.800" color="white" borderRadius="lg" shadow="lg" p={6}>
          <Heading as="h1" mb={6} textAlign="center" color="gold">
            {formData.multiSystem ? "Multi-System Astrological Chart" : "Natal Chart Calculator"}
          </Heading>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              {/* Multi-System Toggle */}
              <Box p={4} bg="purple.700" borderRadius="md">
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color="yellow.200">
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
                      colorScheme="yellow"
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

              {/* Form Fields */}
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="yellow.200">Year</FormLabel>
                  <Input 
                    type="number" 
                    name="year" 
                    value={formData.year} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 1990" 
                    bg="purple.700" 
                    color="white" 
                    borderColor="gold" 
                    aria-required="true" 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="yellow.200">Month</FormLabel>
                  <Input 
                    type="number" 
                    name="month" 
                    value={formData.month} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 6" 
                    bg="purple.700" 
                    color="white" 
                    borderColor="gold" 
                    aria-required="true" 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="yellow.200">Day</FormLabel>
                  <Input 
                    type="number" 
                    name="day" 
                    value={formData.day} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 15" 
                    bg="purple.700" 
                    color="white" 
                    borderColor="gold" 
                    aria-required="true" 
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="yellow.200">Hour (24h)</FormLabel>
                  <Input 
                    type="number" 
                    name="hour" 
                    value={formData.hour} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 14" 
                    bg="purple.700" 
                    color="white" 
                    borderColor="gold" 
                    aria-required="true" 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="yellow.200">Minute</FormLabel>
                  <Input 
                    type="number" 
                    name="minute" 
                    value={formData.minute} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 30" 
                    bg="purple.700" 
                    color="white" 
                    borderColor="gold" 
                    aria-required="true" 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="yellow.200">House System</FormLabel>
                  <Select 
                    value={houseSystem} 
                    onChange={(e) => setHouseSystem(e.target.value)} 
                    bg="purple.700" 
                    color="white" 
                    borderColor="gold"
                  >
                    <option value="P" style={{ backgroundColor: "#553C9A" }}>Placidus</option>
                    <option value="E" style={{ backgroundColor: "#553C9A" }}>Equal House</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel color="yellow.200">Birth Location</FormLabel>
                <Input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  placeholder="e.g., New York, NY, USA" 
                  bg="purple.700" 
                  color="white" 
                  borderColor="gold" 
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
                colorScheme="yellow"
                bg="gold"
                color="purple.800"
                size="lg"
                fontWeight="bold"
                isLoading={loading}
                loadingText={formData.multiSystem ? "Calculating Multi-System Chart..." : "Calculating Chart..."}
                isDisabled={!isFormValid}
                _hover={{ bg: "yellow.400" }}
                _loading={{ bg: "yellow.600" }}
              >
                {formData.multiSystem ? "🌟 Calculate Multi-System Chart 🌟" : "Calculate Natal Chart"}
              </Button>
            </VStack>
          </form>
        </Box>

        {/* Chart Display */}
        {chart && (
          <Box>
            {formData.multiSystem ? (
              <MultiSystemChartDisplay chartData={chart} isLoading={loading} />
            ) : (
              <ChartDisplay chart={chart} />
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
}
