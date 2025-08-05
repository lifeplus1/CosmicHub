import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Heading, FormControl, FormLabel, Input, Select, Button, VStack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export default function SaveChart() {
  const { user, getAuthToken } = useAuth();
  const [formData, setFormData] = useState({
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
    city: "",
  });
  const [houseSystem, setHouseSystem] = useState("P");
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = await getAuthToken();
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/save-chart`,
        {
          year: parseInt(formData.year),
          month: parseInt(formData.month),
          day: parseInt(formData.day),
          hour: parseInt(formData.hour),
          minute: parseInt(formData.minute),
          city: formData.city,
          house_system: houseSystem
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Chart Saved", status: "success", duration: 3000 });
      navigate("/saved-charts");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to save chart";
      setError(msg);
      toast({ title: "Error", description: msg, status: "error", duration: 5000 });
    }
  };

  const isFormValid = () => Object.values(formData).every((v) => v);

  return (
    <Box maxW="600px" mx="auto" p={4} bg="rgba(15, 23, 42, 0.8)" border="1px solid" borderColor="whiteAlpha.200" boxShadow="0 20px 60px rgba(0, 0, 0, 0.3)" borderRadius="lg" color="white">
      <Heading mb={6} textAlign="center" variant="cosmic">Save Natal Chart</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired><FormLabel color="gold.200">Year</FormLabel><Input type="number" name="year" value={formData.year} onChange={handleInputChange} placeholder="1990" variant="cosmic" /></FormControl>
          <FormControl isRequired><FormLabel color="gold.200">Month</FormLabel><Input type="number" name="month" value={formData.month} onChange={handleInputChange} placeholder="1" variant="cosmic" /></FormControl>
          <FormControl isRequired><FormLabel color="gold.200">Day</FormLabel><Input type="number" name="day" value={formData.day} onChange={handleInputChange} placeholder="1" variant="cosmic" /></FormControl>
          <FormControl isRequired><FormLabel color="gold.200">Hour (24h)</FormLabel><Input type="number" name="hour" value={formData.hour} onChange={handleInputChange} placeholder="12" variant="cosmic" /></FormControl>
          <FormControl isRequired><FormLabel color="gold.200">Minute</FormLabel><Input type="number" name="minute" value={formData.minute} onChange={handleInputChange} placeholder="0" variant="cosmic" /></FormControl>
          <FormControl isRequired><FormLabel color="gold.200">City</FormLabel><Input name="city" value={formData.city} onChange={handleInputChange} placeholder="New York" variant="cosmic" /></FormControl>
          <FormControl isRequired><FormLabel color="gold.200">House System</FormLabel><Select value={houseSystem} onChange={(e) => setHouseSystem(e.target.value)} variant="cosmic"><option value="P">Placidus</option><option value="E">Equal House</option></Select></FormControl>
          <Button variant="gold" type="submit" isDisabled={!isFormValid()}>Save Chart</Button>
          {error && <Text color="red.300">{error}</Text>}
        </VStack>
      </form>
    </Box>
  );
}