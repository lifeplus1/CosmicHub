import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  ChakraProvider,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import ChartDisplay from "./components/ChartDisplay";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SaveChart from "./components/SaveChart";
import AnalyzePersonality from "./components/AnalyzePersonality";
import AIChat from "./components/AIChat";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { getAuthToken, logOut } from "./lib/auth";

interface ChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  planets: Record<string, { position: number; retrograde: boolean }>;
  houses: Array<{ house: number; cusp: number }>;
  angles: Record<string, number>;
  aspects: Array<any>;
}

const App: React.FC = () => {
  const [birthData, setBirthData] = useState({
    date: "",
    time: "",
    latitude: "",
    longitude: "",
    timezone: "",
  });
  const [houseSystem, setHouseSystem] = useState("placidus");
  const [chart, setChart] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBirthData({ ...birthData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/calculate?house_system=${houseSystem}`,
        { params: birthData }
      );
      setChart(response.data);
    } catch (error: any) {
      setError(error.response?.data?.detail || "Failed to fetch chart data");
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch chart data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChakraProvider>
      <AuthProvider>
        <Navbar />
        <Box p={4}>
          <Routes>
            <Route
              path="/"
              element={
                <VStack spacing={4}>
                  <Heading>Astrology App</Heading>
                  <form onSubmit={handleSubmit}>
                    <FormControl>
                      <FormLabel>Date of Birth</FormLabel>
                      <Input
                        type="date"
                        name="date"
                        value={birthData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Time of Birth</FormLabel>
                      <Input
                        type="time"
                        name="time"
                        value={birthData.time}
                        onChange={handleInputChange}
                        required
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Latitude</FormLabel>
                      <Input
                        type="number"
                        name="latitude"
                        value={birthData.latitude}
                        onChange={handleInputChange}
                        required
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Longitude</FormLabel>
                      <Input
                        type="number"
                        name="longitude"
                        value={birthData.longitude}
                        onChange={handleInputChange}
                        required
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Timezone</FormLabel>
                      <Input
                        type="text"
                        name="timezone"
                        value={birthData.timezone}
                        onChange={handleInputChange}
                        required
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>House System</FormLabel>
                      <Select
                        name="houseSystem"
                        value={houseSystem}
                        onChange={(e) => setHouseSystem(e.target.value)}
                      >
                        <option value="placidus">Placidus</option>
                        <option value="whole_sign">Whole Sign</option>
                        <option value="koch">Koch</option>
                      </Select>
                    </FormControl>
                    <Button type="submit" colorScheme="teal" isLoading={loading}>
                      Calculate Chart
                    </Button>
                  </form>
                  {error && <Text color="red.500">{error}</Text>}
                  {chart && <ChartDisplay chart={chart} />}
                  <SaveChart chart={chart} />
                  <AnalyzePersonality chart={chart} />
                  <AIChat />
                </VStack>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Box>
        <Footer />
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App;