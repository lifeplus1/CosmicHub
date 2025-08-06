import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
// import { Box, Heading, FormControl, FormLabel, Input, Select, Button, VStack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import { getAuthToken } from "../auth";

interface PersonalityResult {
  sun_sign: string;
  traits: string;
}

export default function AnalyzePersonality() {
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
    city: "",
  });
  const [houseSystem, setHouseSystem] = useState("P");
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  if (loading) return <Text color="white">Loading...</Text>;
  if (!user) return <Navigate to="/login" replace />;

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    try {
      const token = await getAuthToken();
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/analyze-personality`,
        {
          year: parseInt(formData.year),
          month: parseInt(formData.month),
          day: parseInt(formData.day),
          hour: parseInt(formData.hour),
          minute: parseInt(formData.minute),
          city: formData.city,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResult(response.data);
      toast({
        title: "Personality Analyzed",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error:", error);
      const err = error as any;
      setError(err.response?.data?.detail || "Failed to analyze personality");
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to analyze personality",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const isFormValid = () =>
    formData.year && formData.month && formData.day && formData.hour && formData.minute && formData.city;

  return (
    <Box 
      maxW="600px" 
      mx="auto" 
      p={4} 
      bg="rgba(15, 23, 42, 0.8)"
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      boxShadow="0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      borderRadius="lg"
      color="white"
    >
      <Heading as="h1" mb={6} textAlign="center" variant="cosmic">
        Personality Analysis
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel color="gold.200">Year</FormLabel>
            <Input type="number" name="year" value={formData.year} onChange={handleInputChange} placeholder="e.g., 1990" variant="cosmic" aria-required="true" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="gold.200">Month</FormLabel>
            <Input type="number" name="month" value={formData.month} onChange={handleInputChange} placeholder="e.g., 1" variant="cosmic" aria-required="true" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="gold.200">Day</FormLabel>
            <Input type="number" name="day" value={formData.day} onChange={handleInputChange} placeholder="e.g., 1" variant="cosmic" aria-required="true" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="gold.200">Hour (24h)</FormLabel>
            <Input type="number" name="hour" value={formData.hour} onChange={handleInputChange} placeholder="e.g., 12" variant="cosmic" aria-required="true" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="gold.200">Minute</FormLabel>
            <Input type="number" name="minute" value={formData.minute} onChange={handleInputChange} placeholder="e.g., 0" variant="cosmic" aria-required="true" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="gold.200">City</FormLabel>
            <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g., New York" variant="cosmic" aria-required="true" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="gold.200">House System</FormLabel>
            <Select value={houseSystem} onChange={(e) => setHouseSystem(e.target.value)} variant="cosmic" aria-required="true">
              <option value="P">Placidus</option>
              <option value="E">Equal House</option>
            </Select>
          </FormControl>
          <Button
            variant="gold"
            type="submit"
            isDisabled={!isFormValid()}
          >
            Analyze Personality
          </Button>
          {error && <Text color="red.300">{error}</Text>}
          {result && (
            <Box mt={4}>
              <Text>Sun Sign: {result.sun_sign}</Text>
              <Text>Traits: {result.traits}</Text>
            </Box>
          )}
        </VStack>
      </form>
    </Box>
  );
}