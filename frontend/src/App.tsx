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
    city: "",
  });
  const [chart, setChart] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const db = getFirestore();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBirthData({ ...birthData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const [year, month, day] = birthData.date.split("-").map(Number);
      const [hour, minute] = birthData.time.split(":").map(Number);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/calculate`,
        {
          year,
          month,
          day,
          hour,
          minute,
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
          // Removed latitude, longitude, timezone for simplified form
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
    <AuthProvider>
      <ChakraProvider>
        <Navbar />
        <Box p={4}>
          <Routes>
            <Route
              path="/"
              element={
                <VStack spacing={4}>
                  <Heading color="gold">Astrology Chart Calculator</Heading>
                  <form onSubmit={handleSubmit}>
                    <FormControl isRequired>
                      <FormLabel color="yellow.200">Date of Birth</FormLabel>
                      <Input
                        type="date"
                        name="date"
                        value={birthData.date}
                        onChange={handleInputChange}
                        bg="purple.700"
                        color="white"
                        borderColor="gold"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel color="yellow.200">Time of Birth</FormLabel>
                      <Input
                        type="time"
                        name="time"
                        value={birthData.time}
                        onChange={handleInputChange}
                        bg="purple.700"
                        color="white"
                        borderColor="gold"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel color="yellow.200">City</FormLabel>
                      <Input
                        type="text"
                        name="city"
                        value={birthData.city}
                        onChange={handleInputChange}
                        bg="purple.700"
                        color="white"
                        borderColor="gold"
                      />
                    </FormControl>
                    <Button type="submit" colorScheme="teal" isLoading={loading} w="100%">
                      Calculate Chart
                    </Button>
                  </form>
                  {error && <Text color="red.500">{error}</Text>}
                  {chart && <ChartDisplay chart={chart} />}
                  {!user && (
                    <Button colorScheme="yellow" variant="solid" w="100%" mt={4} onClick={() => navigate("/signup")}>Sign Up for an Account</Button>
                  )}
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
      </ChakraProvider>
    </AuthProvider>
  );
};

export default App;