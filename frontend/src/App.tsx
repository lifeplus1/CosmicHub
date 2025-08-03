// frontend/src/App.tsx
import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Box, Button, ChakraProvider, FormControl, FormLabel, Heading, Input, Text, VStack } from "@chakra-ui/react";
import axios from "axios";
import { useAuth, AuthProvider } from "./components/AuthProvider";
import { useToast } from "@chakra-ui/toast";
import { getFirestore } from "firebase/firestore";
import Navbar from "./components/Navbar"; // Adjust path as needed
import Footer from "./components/Footer"; // Adjust path as needed
import ChartDisplay from "./components/ChartDisplay"; // Adjust path as needed
import SavedCharts from "./components/SavedCharts"; // Adjust path as needed
import Login from "./components/Login"; // Adjust path as needed
import Signup from "./components/Signup"; // Adjust path as needed
import { getAuthToken } from "./lib/auth";

interface ChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  houses: any; // Replace 'any' with a more specific type if available
  planets: any; // Replace 'any' with a more specific type if available
  angles: any; // Add the correct type if available
  aspects: any; // Add the correct type if available
  [key: string]: any; // Keep this if there are additional dynamic properties
}

function MainApp() {
  const authContext = useAuth();
  const { user } = authContext || { user: null }; // Fallback to null if authContext is undefined
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
      const errorMsg = error.response?.data?.detail || "Failed to fetch chart data";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChart = async () => {
    if (!user || !chart) {
      toast({
        title: "Error",
        description: !user ? "Please log in to save charts" : "No chart to save",
        status: "error",
        duration: 3000,
      });
      return;
    }
    try {
      const token = await getAuthToken(); // Ensure getAuthToken is defined in AuthContext
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
    <>
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
                  <Button
                    colorScheme="yellow"
                    variant="solid"
                    w="100%"
                    mt={4}
                    onClick={() => navigate("/signup")}
                  >
                    Sign Up for an Account
                  </Button>
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
    </>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ChakraProvider>
        <MainApp />
      </ChakraProvider>
    </AuthProvider>
  );
};

export default App;