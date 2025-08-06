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
      <div className="cosmic-container py-12">
        <div className="text-center">
          <Alert status="warning" className="alert-warning max-w-md mx-auto">
            <AlertIcon />
            <Text className="cosmic-text">Please log in to view your charts.</Text>
          </Alert>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cosmic-container py-12">
        <div className="text-center space-y-4">
          <Spinner size="xl" color="cosmic.500" />
          <Text className="cosmic-text text-lg">Loading your charts...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cosmic-container py-12">
        <div className="max-w-md mx-auto space-y-4">
          <Alert status="error" className="alert-error">
            <AlertIcon />
            <Text className="cosmic-text">{error}</Text>
          </Alert>
          <div className="text-center">
            <Button onClick={fetchSavedCharts} className="cosmic-button-primary">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedChart) {
    return (
      <div className="cosmic-container">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Heading className="cosmic-heading text-2xl lg:text-3xl">
            {selectedChart.name || (selectedChart.birth_data?.city ? `${selectedChart.birth_data.city} Chart` : 'Unnamed Chart')}
          </Heading>
          <Button 
            onClick={() => setSelectedChart(null)} 
            className="cosmic-button-secondary"
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
                    <div className="flex justify-between items-start gap-3">
                      <Heading 
                        size="md" 
                        className="cosmic-subheading text-lg flex-1 line-clamp-2"
                        noOfLines={2}
                      >
                        {chart.name || (chart.birth_data?.city ? `${chart.birth_data.city} Chart` : 'Unnamed Chart')}
                      </Heading>
                      <IconButton
                        aria-label="Delete chart"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingChartId(chart.id);
                          setIsDeleteOpen(true);
                        }}
                      />
                    </div>

                    {/* Chart Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="cosmic-badge-primary text-xs">Date</Badge>
                        <Text className="cosmic-text text-sm font-medium">
                          {chart.birth_date ? formatDate(chart.birth_date) : 
                           chart.birth_data ? `${chart.birth_data.year}-${chart.birth_data.month.toString().padStart(2, '0')}-${chart.birth_data.day.toString().padStart(2, '0')}` : 
                           'Unknown Date'}
                        </Text>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className="cosmic-badge-primary text-xs">Time</Badge>
                        <Text className="cosmic-text text-sm font-medium">
                          {chart.birth_time || 
                           (chart.birth_data ? `${chart.birth_data.hour.toString().padStart(2, '0')}:${chart.birth_data.minute.toString().padStart(2, '0')}` : 'Unknown Time')}
                        </Text>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className="cosmic-badge-primary text-xs">Location</Badge>
                        <Text 
                          className="cosmic-text text-sm font-medium truncate flex-1" 
                          title={chart.birth_location || chart.birth_data?.city || 'Unknown Location'}
                        >
                          {chart.birth_location || chart.birth_data?.city || 'Unknown Location'}
                        </Text>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className="cosmic-badge-secondary text-xs">Saved</Badge>
                        <Text className="cosmic-text text-sm opacity-80">
                          {formatDate(chart.created_at)}
                        </Text>
                      </div>
                    </div>

                    {/* View Button */}
                    <Button 
                      onClick={() => setSelectedChart(chart)} 
                      className="cosmic-button-primary w-full mt-4"
                      size="sm"
                    >
                      View Chart
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={() => setIsDeleteOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent className="cosmic-card">
            <AlertDialogHeader className="cosmic-subheading">Delete Chart</AlertDialogHeader>
            <AlertDialogBody className="cosmic-text">
              Are you sure you want to delete this chart? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter className="gap-3">
              <Button 
                ref={cancelRef} 
                onClick={() => setIsDeleteOpen(false)}
                variant="outline"
                className="cosmic-button"
              >
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={onDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  );
};

export default SavedCharts;