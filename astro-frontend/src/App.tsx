import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Box, Button, ChakraProvider, FormControl, FormLabel, Heading, Input, Text, VStack } from '@chakra-ui/react';
import theme from './theme';
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import { useToast } from '@chakra-ui/toast';
import { getFirestore } from 'firebase/firestore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChartDisplay from './components/ChartDisplayOptimized';
import SavedCharts from './components/SavedCharts';
import AnalyzePersonality from './components/AnalyzePersonality';
import AIChat from './components/AIChat';
import Login from './components/Login';
import Signup from './components/Signup';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Contact from './components/Contact';
import ChartCalculator from './components/ChartCalculator';
import NumerologyCalculator from './components/NumerologyCalculator';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import PricingPage from './components/PricingPage';
import { SubscriptionStatus } from './components/SubscriptionStatus';
import { PremiumFeaturesDashboard } from './components/PremiumFeaturesDashboard';
import { SynastryTest } from './components/SynastryTest';
import { PDFExportTest } from './components/PDFExportTest';
import { TransitAnalysisTest } from './components/TransitAnalysisTest';
import { AIInterpretationTest } from './components/AIInterpretationTest';
import { EducationalTooltip } from './components/EducationalTooltip';
import MockLoginPanel from './components/MockLoginPanel';
import UserProfile from './components/UserProfile';
import { getAuthToken } from './auth';
import type { ChartData } from './types';

interface ExtendedChartData extends ChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  angles: Record<string, number>;
}

function MainApp() {
  const { user } = useAuth() || { user: null };
  const [birthData, setBirthData] = useState({
    date: '',
    time: '',
    city: '',
  });
  const [chart, setChart] = useState<ExtendedChartData | null>(null);
  const [multiSystemData, setMultiSystemData] = useState<any>(null);
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
      const [year, month, day] = birthData.date.split('-').map(Number);
      const [hour, minute] = birthData.time.split(':').map(Number);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/calculate-multi-system`, {
        year,
        month,
        day,
        hour,
        minute,
        city: birthData.city,
      });
      // Store the full multi-system response
      setMultiSystemData(response.data);
      
      // Extract western tropical chart data for ChartDisplay
      const westernChart = response.data.chart?.western_tropical;
      if (westernChart) {
        setChart(westernChart);
      } else {
        setChart(response.data);
      }
      toast({ title: 'Chart Calculated', status: 'success', duration: 3000 });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch chart data';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
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
        title: 'Error',
        description: !user ? 'Please log in to save charts' : 'No chart to save',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    try {
      const token = await getAuthToken();
      const [year, month, day] = birthData.date.split('-').map(Number);
      const [hour, minute] = birthData.time.split(':').map(Number);
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast({ title: 'Chart Saved', status: 'success', duration: 3000 });
    } catch (err: any) {
      toast({ title: 'Save Failed', description: err.message, status: 'error', duration: 3000 });
    }
  };

  return (
    <>
      <Navbar />
      <Box minH="100vh" pt={8} pb={20} px={4}>
        <Routes>
          <Route
            path="/"
            element={
              <VStack spacing={4}>
                <Heading color="gold">Astrology Chart Calculator</Heading>
                
                {/* Show subscription status for logged in users */}
                {user && <SubscriptionStatus />}
                
                {/* Premium Features Dashboard for testing */}
                {user && <PremiumFeaturesDashboard />}
                
                <form onSubmit={handleSubmit}>
                  <FormControl isRequired>
                    <FormLabel color="yellow.200">
                      Date of Birth
                      <EducationalTooltip
                        title="Birth Date Importance"
                        description="Your birth date determines the positions of all planets in your natal chart, including your Sun sign and the exact degrees of every celestial body."
                        examples={[
                          "Determines your Sun sign (zodiac sign)",
                          "Sets the positions of all planets (Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)",
                          "Essential for accurate chart calculation and aspects",
                          "Affects daily planetary transits and progressions"
                        ]}
                      />
                    </FormLabel>
                    <Input
                      type="date"
                      name="date"
                      value={birthData.date}
                      onChange={handleInputChange}
                      variant="cosmic"
                      size="lg"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel 
                      color="gold.200" 
                      fontSize="lg" 
                      fontWeight="600"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      Time of Birth
                      <EducationalTooltip
                        title="Birth Time Accuracy"
                        description="Birth time determines your Rising sign (Ascendant) and house positions. Even a few minutes can change these important factors."
                        examples={[
                          "Determines your Rising sign",
                          "Sets all house positions",
                          "Affects Moon sign if born near sign change",
                          "Critical for timing techniques"
                        ]}
                      />
                    </FormLabel>
                    <Input
                      type="time"
                      name="time"
                      value={birthData.time}
                      onChange={handleInputChange}
                      variant="cosmic"
                      size="lg"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel 
                      color="gold.200" 
                      fontSize="lg" 
                      fontWeight="600"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      Birth City
                      <EducationalTooltip
                        title="Birth Location"
                        description="Your birth location provides the geographic coordinates and timezone needed for accurate chart calculation."
                        examples={[
                          "Determines local timezone",
                          "Sets geographic coordinates",
                          "Affects house cusps and angles",
                          "Use the city where you were actually born"
                        ]}
                      />
                    </FormLabel>
                    <Input
                      type="text"
                      name="city"
                      value={birthData.city}
                      onChange={handleInputChange}
                      placeholder="e.g., New York, London, Tokyo"
                      variant="cosmic"
                      size="lg"
                    />
                  </FormControl>
                  <Button 
                    type="submit" 
                    variant="gold"
                    size="xl"
                    w="100%"
                    h="60px"
                    fontSize="lg"
                    isLoading={loading}
                    loadingText="Calculating..."
                  >
                    ✨ Calculate Your Cosmic Chart ✨
                  </Button>
                </form>
                {error && (
                  <Box
                    bg="red.900"
                    color="red.100"
                    p={4}
                    borderRadius="16px"
                    border="1px solid"
                    borderColor="red.700"
                    maxW="2xl"
                    w="100%"
                  >
                    <Text fontSize="lg">{error}</Text>
                  </Box>
                )}
                {chart && <ChartDisplay chart={chart} onSaveChart={handleSaveChart} />}
                {!user && (
                  <VStack spacing={4} w="100%">
                    <Button
                      variant="cosmic"
                      size="lg"
                      w="100%"
                      onClick={() => navigate('/signup')}
                    >
                      Sign Up for an Account
                    </Button>
                    <Button
                      colorScheme="purple"
                      variant="outline"
                      w="100%"
                      size="lg"
                      onClick={() => navigate('/premium')}
                      borderWidth="2px"
                      _hover={{
                        bg: 'purple.600',
                        color: 'white',
                        transform: 'translateY(-2px)',
                        shadow: 'lg'
                      }}
                    >
                      🌟 Go Premium - Unlock Multi-System Analysis 🌟
                    </Button>
                  </VStack>
                )}
                {user && (
                  <Button
                    colorScheme="purple"
                    variant="outline"
                    w="100%"
                    size="lg"
                    onClick={() => navigate('/premium')}
                    borderWidth="2px"
                    _hover={{
                      bg: 'purple.600',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      shadow: 'lg'
                    }}
                  >
                    🌟 Upgrade to Premium 🌟
                  </Button>
                )}
              </VStack>
            }
          />
          <Route path="/saved-charts" element={user ? <SavedCharts /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <UserProfile /> : <Navigate to="/login" />} />
          <Route path="/calculator" element={<ChartCalculator />} />
          <Route path="/numerology" element={<NumerologyCalculator />} />
          <Route path="/premium" element={<PricingPage />} />
          <Route path="/synastry" element={<SynastryTest />} />
          <Route path="/pdf-export" element={<PDFExportTest />} />
          <Route path="/transits" element={<TransitAnalysisTest />} />
          <Route path="/ai-interpretation" element={<AIInterpretationTest />} />
          <Route path="/mock-login" element={<MockLoginPanel />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/analyze-personality" element={<AnalyzePersonality />} />
          <Route path="/chat" element={<AIChat />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<Contact />} />
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
      <SubscriptionProvider>
        <ChakraProvider theme={theme}>
          <MainApp />
        </ChakraProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
};

export default App;