import { useState } from 'react';
import { ChakraProvider, Box, Heading, FormControl, FormLabel, Input, Select, Button, VStack, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';
import ChartDisplay from './components/ChartDisplay';

function App() {
  const [formData, setFormData] = useState({
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
    city: ''
  });
  const [houseSystem, setHouseSystem] = useState('P');
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchChart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `https://astrology-app-0emh.onrender.com/calculate?house_system=${houseSystem}`,
        {
          year: parseInt(formData.year),
          month: parseInt(formData.month),
          day: parseInt(formData.day),
          hour: parseInt(formData.hour),
          minute: parseInt(formData.minute),
          city: formData.city
        },
        {
          headers: {
            'x-api-key': process.env.VITE_API_KEY || 'c3a579e58484f1eb21bfc96966df9a25'
          }
        }
      );
      setChart(response.data);
      toast({
        title: 'Chart Calculated',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.detail || 'Failed to fetch chart data');
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to fetch chart data',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () =>
    formData.year && formData.month && formData.day && formData.hour && formData.minute && formData.city;

  return (
    <ChakraProvider>
      <Box maxW="600px" mx="auto" p={4}>
        <Heading as="h1" mb={6} textAlign="center">Astrology App</Heading>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Year</FormLabel>
            <Input type="number" name="year" value={formData.year} onChange={handleInputChange} placeholder="e.g., 1990" />
          </FormControl>
          <FormControl>
            <FormLabel>Month</FormLabel>
            <Input type="number" name="month" value={formData.month} onChange={handleInputChange} placeholder="e.g., 1" />
          </FormControl>
          <FormControl>
            <FormLabel>Day</FormLabel>
            <Input type="number" name="day" value={formData.day} onChange={handleInputChange} placeholder="e.g., 1" />
          </FormControl>
          <FormControl>
            <FormLabel>Hour (24h)</FormLabel>
            <Input type="number" name="hour" value={formData.hour} onChange={handleInputChange} placeholder="e.g., 12" />
          </FormControl>
          <FormControl>
            <FormLabel>Minute</FormLabel>
            <Input type="number" name="minute" value={formData.minute} onChange={handleInputChange} placeholder="e.g., 0" />
          </FormControl>
          <FormControl>
            <FormLabel>City</FormLabel>
            <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g., New York" />
          </FormControl>
          <FormControl>
            <FormLabel>House System</FormLabel>
            <Select value={houseSystem} onChange={(e) => setHouseSystem(e.target.value)}>
              <option value="P">Placidus</option>
              <option value="E">Equal House</option>
            </Select>
          </FormControl>
          <Button
            colorScheme="teal"
            onClick={fetchChart}
            isLoading={loading}
            isDisabled={!isFormValid()}
          >
            Calculate Chart
          </Button>
          {error && <Text color="red.500">{error}</Text>}
          {chart && <ChartDisplay chart={chart} />}
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;