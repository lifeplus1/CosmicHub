// frontend/src/App.tsx
import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
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
import ChartDisplay from "./components/ChartDisplay.js";
import Login from "./components/Login.js";
import Signup from "./components/Signup.js";
import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js";
import AnalyzePersonality from "./components/AnalyzePersonality.js";
import AIChat from "./components/AIChat.js";
import { AuthProvider, useAuth } from "./components/AuthProvider.js";
import SavedCharts from "./components/SavedCharts.js";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuthToken } from "./lib/auth";

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
  const authContext = useAuth();
  console.log('AuthContext value in App:', authContext);
  const { user } = authContext;
  const [birthData, setBirthData] = useState({
    date: "",
    time: "",
    latitude: "",
    longitude: "",
    timezone: "",
    city: "",
  });
  const [houseSystem, setHouseSystem] = useState("P"); // Updated to match backend enum
  const [chart, setChart] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const db = getFirestore();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBirthData({ ...birthData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
      const [year, month, day] = birthData.date.split("-").map(Number);
      const [hour, minute] = birthData.time.split(":").map(Number);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/calculate?house_system=${houseSystem}`,
        {
          year,
          month,
          day,
          hour,
          minute,
          lat: Number(birthData.latitude),
          lon: Number(birthData.longitude),
          timezone: birthData.timezone,
          city: birthData.city,
        }
      );
      setChart(response.data);
      toast({ title: "Chart Calculated", status: "success", duration: 3000 });
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

  const handleSaveChart = async () => {
    if (!user || !chart) return;
    try {
      const token = await getAuthToken();
      const [year, month, day] = birthData.date.split("-").map(Number);
      const [hour, minute] = birthData.time.split(":").map(Number);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/save-chart`,
        {
          year,
          month,
          day,
          hour,
          minute,
          lat: Number(birthData.latitude),
          lon: Number(birthData.longitude),
          timezone: birthData.timezone,
          city: birthData.city,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Chart Saved", status: "success", duration: 3000 });
    } catch (err: any) {
      toast({ title: "Save Failed", description: err.message, status: "error", duration: 3000 });
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
                      <FormLabel>City</FormLabel>
                      <Input
                        type="text"
                        name="city"
                        value={birthData.city}
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
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setHouseSystem(e.target.value)}
                      >
                        <option value="P">Placidus</option>
                        <option value="E">Equal House</option>
                      </Select>
                    </FormControl>
                    <Button type="submit" colorScheme="teal" isLoading={loading}>
                      Calculate Chart
                    </Button>
                  </form>
                  {error && <Text color="red.500">{error}</Text>}
                  {chart && <ChartDisplay chart={chart} />}
                  {user && chart && (
                    <Button colorScheme="yellow" onClick={handleSaveChart}>
                      Save Chart
                    </Button>
                  )}
                  <AnalyzePersonality />
                  <AIChat />
                </VStack>
              }
            />
            <Route path="/saved-charts" element={user ? <SavedCharts /> : <Navigate to="/login" />} />
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