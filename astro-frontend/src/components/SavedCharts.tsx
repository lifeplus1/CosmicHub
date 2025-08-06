import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Badge,
  Button,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Heading,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useAuth } from '../../../shared/AuthContext';
import ChartDisplay from './ChartDisplay';
import axios from 'axios';
import { parseISO, format, isValid } from 'date-fns';

interface SavedChart {
  id: string;
  name?: string;
  birth_date?: string;
  birth_time?: string;
  birth_location?: string;
  chart_type: string;
  birth_data?: { year: number; month: number; day: number; hour: number; minute: number; city: string };
  chart_data: any;
  created_at: string;
}

const SavedCharts: React.FC = () => {
  const { user, getAuthToken } = useAuth();
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState<SavedChart | null>(null);
  const [deletingChartId, setDeletingChartId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const cancelRef = React.useRef(null);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchSavedCharts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getAuthToken();
      if (!token) throw new Error('No token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/charts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCharts(response.data.charts || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch charts');
    } finally {
      setLoading(false);
    }
  }, [user, getAuthToken]);

  useEffect(() => {
    fetchSavedCharts();
  }, [fetchSavedCharts]);

  const handleDelete = async (chartId: string) => {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('No token');
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/charts/${chartId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Chart deleted', status: 'success', duration: 3000 });
      fetchSavedCharts();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.response?.data?.detail || 'Error deleting chart', status: 'error', duration: 5000 });
    }
  };

  const onDeleteConfirm = () => {
    if (deletingChartId) handleDelete(deletingChartId);
    setIsDeleteOpen(false);
    setDeletingChartId(null);
  };

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Unknown Date';
      return format(date, 'MMMM d, yyyy');
    } catch {
      return 'Invalid Date';
    }
  }, []);

  if (!user) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto">
        <div className="text-center">
          <Alert status="warning" className="max-w-md mx-auto bg-yellow-100 border-l-4 border-yellow-500">
            <AlertIcon />
            <Text className="text-gray-700 font-medium">Please log in to view your charts.</Text>
          </Alert>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <Spinner size="xl" color="purple.500" />
          <Text className="text-lg text-gray-700">Loading your charts...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto">
        <div className="max-w-md mx-auto space-y-4">
          <Alert status="error" className="bg-red-100 border-l-4 border-red-500">
            <AlertIcon />
            <Text className="text-red-700 font-medium">{error}</Text>
          </Alert>
          <div className="text-center">
            <Button onClick={fetchSavedCharts} className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedChart) {
    return (
      <div className="px-4 max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Heading className="text-2xl lg:text-3xl font-bold text-gray-900">
            {selectedChart.name || (selectedChart.birth_data?.city ? `${selectedChart.birth_data.city} Chart` : 'Unnamed Chart')}
          </Heading>
          <Button 
            onClick={() => setSelectedChart(null)} 
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-300"
            size="md"
          >
            Back to Charts
          </Button>
        </div>
        <ChartDisplay chart={selectedChart.chart_data} />
      </div>
    );
  }

  return (
    <div className="cosmic-container">
      <div className="cosmic-section">
        <Heading className="cosmic-heading text-center mb-8 lg:mb-12">
          Saved Charts
        </Heading>
        
        {charts.length === 0 ? (
          <div className="text-center py-16">
            <div className="cosmic-card max-w-md mx-auto p-8">
              <Text className="cosmic-text text-lg mb-4">No charts saved yet.</Text>
              <Text className="cosmic-text text-sm opacity-80">
                Calculate your first chart to get started on your astrological journey!
              </Text>
            </div>
          </div>
        ) : (
          <div className="responsive-grid">
            {charts.map((chart) => (
              <Card 
                key={chart.id} 
                className="cosmic-card group cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <CardBody className="p-6 relative">
                  <div className="space-y-4">
                    {/* Chart Header */}
    <div className="px-4 max-w-4xl mx-auto">
      <div className="py-8">
        <Heading className="text-center mb-8 lg:mb-12 text-3xl font-bold text-gray-900">
          Saved Charts
        </Heading>
        {charts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white shadow rounded-lg max-w-md mx-auto p-8">
              <Text className="text-lg mb-4 text-gray-700">No charts saved yet.</Text>
              <Text className="text-sm opacity-80 text-gray-500">
                Calculate your first chart to get started on your astrological journey!
              </Text>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charts.map((chart) => (
              <Card 
                key={chart.id} 
                className="bg-white shadow group cursor-pointer transform transition-all duration-300 hover:scale-105 rounded-lg"
              >
                <CardBody className="p-6 relative">
                  <div className="space-y-4">
                    {/* Chart Header */}
    <div className="px-4 max-w-4xl mx-auto">
      <div className="py-8">
        <Heading className="text-center mb-8 lg:mb-12 text-3xl font-bold text-gray-900">
          Saved Charts
        </Heading>
        {charts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white shadow rounded-lg max-w-md mx-auto p-8">
              <Text className="text-lg mb-4 text-gray-700">No charts saved yet.</Text>
              <Text className="text-sm opacity-80 text-gray-500">
                Calculate your first chart to get started on your astrological journey!
              </Text>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charts.map((chart) => (
              <Card 
                key={chart.id} 
                className="bg-white shadow group cursor-pointer transform transition-all duration-300 hover:scale-105 rounded-lg"
              >
                <CardBody className="p-6 relative">
                  <div className="space-y-4">
                    {/* Chart Header */}
                    <div className="flex justify-between items-start gap-3">
                      <Heading 
                        size="md" 
                        className="text-lg flex-1 line-clamp-2 font-semibold text-gray-900"
                      >
                        {chart.name || (chart.birth_data?.city ? `${chart.birth_data.city} Chart` : 'Unnamed Chart')}
                      </Heading>
                      <Badge className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">{chart.chart_type}</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Date</Badge>
                        <Text className="text-sm font-medium text-gray-700">
                          {formatDate(chart.created_at)}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Time</Badge>
                        <Text className="text-sm font-medium text-gray-700">
                          {chart.birth_time || 'Unknown'}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Location</Badge>
                        <Text className="text-sm font-medium truncate flex-1 text-gray-700" >
                          {chart.birth_location || 'Unknown'}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Saved</Badge>
                        <Text className="text-sm opacity-80 text-gray-500">
                          {chart.created_at ? formatDate(chart.created_at) : 'Unknown'}
                        </Text>
                      </div>
                    </div>
                    <Button 
                      onClick={() => { setDeletingChartId(chart.id); setIsDeleteOpen(true); }} 
                      className="bg-red-600 text-white w-full mt-4 rounded shadow hover:bg-red-700"
                      colorScheme="red"
                    >
                      Delete
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteOpen(false)}
        >
          <AlertDialogOverlay />
          <AlertDialogContent className="bg-white shadow rounded-lg">
            <AlertDialogHeader className="font-bold text-lg text-gray-900">Delete Chart</AlertDialogHeader>
            <AlertDialogBody className="text-gray-700">
              Are you sure you want to delete this chart? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter className="gap-3">
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-300">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={() => handleDelete(deletingChartId!)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>