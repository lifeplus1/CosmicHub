// frontend/src/components/AnalyzePersonality.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Heading, FormControl, FormLabel, Input, Select, Button, VStack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import { getAuthToken } from "./lib/auth";

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
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  if (loading) return <Text color="white">Loading...</Text>;
  if (!user) return <Navigate to="/login" replace />;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
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
      setError(error.response?.data?.detail || "Failed to analyze personality");
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to analyze personality",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const isFormValid = () =>
    formData.year && formData.month && formData.day && formData.hour && formData.minute && formData.city;

  return (
    <Box maxW="600px" mx="auto" p={4} bg="purple.800" color="white" borderRadius="lg" shadow="lg">
      <Heading as="h1" mb={6} textAlign="center" color="gold">
        Personality Analysis
      </Heading>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel color="yellow.200">Year</FormLabel>
          <Input type="number" name="year" value={formData.year} onChange={handleInputChange} placeholder="e.g., 1990" bg="purple.700" color="white" borderColor="gold" />
        </FormControl>
        <FormControl>
          <FormLabel color="yellow.200">Month</FormLabel>
          <Input type="number" name="month" value={formData.month} onChange={handleInputChange} placeholder="e.g., 1" bg="purple.700" color="white" borderColor="gold" />
        </FormControl>
        <FormControl>
          <FormLabel color="yellow.200">Day</FormLabel>
          <Input type="number" name="day" value={formData.day} onChange={handleInputChange} placeholder="e.g., 1" bg="purple.700" color="white" borderColor="gold" />
        </FormControl>
        <FormControl>
          <FormLabel color="yellow.200">Hour (24h)</FormLabel>
          <Input type="number" name="hour" value={formData.hour} onChange={handleInputChange} placeholder="e.g., 12" bg="purple.700" color="white" borderColor="gold" />
        </FormControl>
        <FormControl>
          <FormLabel color="yellow.200">Minute</FormLabel>
          <Input type="number" name="minute" value={formData.minute} onChange={handleInputChange} placeholder="e.g., 0" bg="purple.700" color="white" borderColor="gold" />
        </FormControl>
        <FormControl>
          <FormLabel color="yellow.200">City</FormLabel>
          <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g., New York" bg="purple.700" color="white" borderColor="gold" />
        </FormControl>
        <FormControl>
          <FormLabel color="yellow.200">House System</FormLabel>
          <Select value={houseSystem} onChange={(e) => setHouseSystem(e.target.value)} bg="purple.700" color="white" borderColor="gold">
            <option value="P" style={{ backgroundColor: "#4B0082" }}>Placidus</option>
            <option value="E" style={{ backgroundColor: "#4B0082" }}>Equal House</option>
          </Select>
        </FormControl>
        <Button
          colorScheme="yellow"
          onClick={handleSubmit}
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
    </Box>
  );
}