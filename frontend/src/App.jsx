import { useState } from "react";
import { ChakraProvider, Box, Heading, FormControl, FormLabel, Input, Select, Button, VStack, Text, useToast } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import ChartDisplay from "./components/ChartDisplay";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { getAuthToken, logOut } from "./lib/auth";

function ChartPage() {
  const [formData, setFormData] = useState({
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
    city: "",
  });
  const [houseSystem, setHouseSystem] = useState("P");
  const [chart, setChart] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchChart = async () => {
    setLoadingChart(true);
    setError(null);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/calculate?house_system=${houseSystem}`,
        {
          year: parseInt(formData.year),
          month: parseInt(formData.month),
          day: parseInt(formData.day),
          hour: parseInt(formData.hour),
          minute: parseInt(formData.minute),
          city: formData.city,
        }
      );
      setChart(response.data);
      toast({
        title: "Chart Calculated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.detail || "Failed to fetch chart data");
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch chart data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingChart(false);
    }
  };

  const isFormValid = () =>
    formData.year && formData.month && formData.day && formData.hour && formData.minute && formData.city;

  return (
    <Box maxW="600px" mx="auto" p={4}>
      <Heading as="h1" mb={6} textAlign="center">
        Astrology App
      </Heading>
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
          isLoading={loadingChart}
          isDisabled={!isFormValid()}
        >
          Calculate Chart
        </Button>
        {error && <Text color="red.500">{error}</Text>}
        {chart && <ChartDisplay chart={chart} />}
      </VStack>
    </Box>
  );
}

function ProtectedChartPage() {
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
  const [chart, setChart] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  if (loading) return <Text>Loading...</Text>;
  if (!user) return <Navigate to="/login" replace />;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchChart = async () => {
    setLoadingChart(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/calculate?house_system=${houseSystem}`,
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
      setChart(response.data);
      toast({
        title: "Chart Calculated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.detail || "Failed to fetch chart data");
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch chart data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingChart(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      toast({ title: "Logged Out", status: "success", duration: 3000, isClosable: true });
      navigate("/login");
    } catch (error) {
      toast({ title: "Logout Failed", description: error.message, status: "error", duration: 3000, isClosable: true });
    }
  };

  const isFormValid = () =>
    formData.year && formData.month && formData.day && formData.hour && formData.minute && formData.city;

  return (
    <Box maxW="600px" mx="auto" p={4}>
      <Heading as="h1" mb={6} textAlign="center">
        Astrology App
      </Heading>
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
          isLoading={loadingChart}
          isDisabled={!isFormValid()}
        >
          Calculate Chart
        </Button>
        <Button colorScheme="red" onClick={handleLogout}>
          Log Out
        </Button>
        {error && <Text color="red.500">{error}</Text>}
        {chart && <ChartDisplay chart={chart} />}
      </VStack>
    </Box>
  );
}

function App() {
  return (
    <ChakraProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/chart" element={<ProtectedChartPage />} />
            <Route path="/" element={<ChartPage />} />
          </Routes>
          <Footer />
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;
