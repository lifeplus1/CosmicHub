import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Select,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Heading,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
// import { DownloadIcon } from '@chakra-ui/icons';
import FeatureGuard from './FeatureGuard';
import type { ChartData, BirthData } from '../types';

interface PdfExportProps {
  chartData?: ChartData;
  birthInfo?: BirthData;
  synastryData?: any;
  multiSystemData?: any;
}

interface ExportOptions {
  reportType: 'standard' | 'synastry' | 'multi_system';
  includeInterpretation: boolean;
  includeAspects: boolean;
  includeTransits: boolean;
}

export const PdfExport: React.FC<PdfExportProps> = ({
  chartData,
  birthInfo,
  synastryData,
  multiSystemData
}) => {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    reportType: 'standard',
    includeInterpretation: true,
    includeAspects: true,
    includeTransits: false
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const exportToPdf = async () => {
    setLoading(true);

    try {
      let exportData: any = {};
      let endpoint = '/api/export-pdf';

      switch (options.reportType) {
        case 'standard':
          if (!chartData) {
            throw new Error('Chart data is required for standard PDF export');
          }
          exportData = {
            chart_data: { chart: chartData },
            birth_info: birthInfo,
            report_type: 'standard'
          };
          break;

        case 'synastry':
          if (!synastryData) {
            throw new Error('Synastry data is required for synastry PDF export');
          }
          exportData = {
            chart_data: { synastry: synastryData },
            report_type: 'synastry'
          };
          endpoint = '/api/export-synastry-pdf';
          break;

        case 'multi_system':
          if (!multiSystemData) {
            throw new Error('Multi-system data is required for multi-system PDF export');
          }
          exportData = {
            chart_data: { charts: multiSystemData },
            report_type: 'multi_system'
          };
          break;

        default:
          throw new Error('Invalid report type selected');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const result = await response.json();
      
      // Create download link
      const linkSource = `data:application/pdf;base64,${result.pdf_base64}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = linkSource;
      downloadLink.download = result.filename || 'astrology_report.pdf';
      downloadLink.click();

      toast({
        title: 'PDF Generated Successfully',
        description: 'Your astrological report has been downloaded.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();

    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: 'PDF Export Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableReports = () => {
    const reports = [];
    
    if (chartData) {
      reports.push({ value: 'standard', label: 'Standard Chart Report' });
    }
    
    if (synastryData) {
      reports.push({ value: 'synastry', label: 'Synastry Compatibility Report' });
    }
    
    if (multiSystemData) {
      reports.push({ value: 'multi_system', label: 'Multi-System Analysis Report' });
    }

    return reports;
  };

  const availableReports = getAvailableReports();

  if (availableReports.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        No chart data available for PDF export. Calculate a chart first.
      </Alert>
    );
  }

  return (
    <FeatureGuard requiredTier="premium" feature="pdf_export">
      <Card>
        <CardHeader>
          <Heading size="md">📄 PDF Export</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text color="whiteAlpha.800">
              Generate professional PDF reports from your astrological data. 
              Premium feature includes detailed interpretations and formatting.
            </Text>

            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="purple"
              onClick={onOpen}
              isDisabled={availableReports.length === 0}
            >
              Export PDF Report
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Export PDF Report</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack spacing={6} align="stretch">
                    <FormControl>
                      <FormLabel>Report Type</FormLabel>
                      <Select
                        value={options.reportType}
                        onChange={(e) => setOptions({
                          ...options,
                          reportType: e.target.value as any
                        })}
                        aria-label="Report Type"
                      >
                        {availableReports.map(report => (
                          <option key={report.value} value={report.value}>
                            {report.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <Box>
                      <Text fontWeight="semibold" mb={3}>Report Options</Text>
                      <VStack spacing={3} align="start">
                        <Box>
                          <input
                            type="checkbox"
                            id="includeInterpretation"
                            checked={options.includeInterpretation}
                            onChange={(e) => setOptions({
                              ...options,
                              includeInterpretation: e.target.checked
                            })}
                          />
                          <Text as="label" htmlFor="includeInterpretation" ml={2}>
                            Include Astrological Interpretations
                          </Text>
                        </Box>

                        <Box>
                          <input
                            type="checkbox"
                            id="includeAspects"
                            checked={options.includeAspects}
                            onChange={(e) => setOptions({
                              ...options,
                              includeAspects: e.target.checked
                            })}
                          />
                          <Text as="label" htmlFor="includeAspects" ml={2}>
                            Include Aspect Details
                          </Text>
                        </Box>

                        <Box>
                          <input
                            type="checkbox"
                            id="includeTransits"
                            checked={options.includeTransits}
                            onChange={(e) => setOptions({
                              ...options,
                              includeTransits: e.target.checked
                            })}
                          />
                          <Text as="label" htmlFor="includeTransits" ml={2}>
                            Include Current Transits (Elite Feature)
                          </Text>
                        </Box>
                      </VStack>
                    </Box>

                    <Box p={4} bg="blue.50" borderRadius="md">
                      <Text fontSize="sm" color="blue.700">
                        <strong>What's Included:</strong>
                        <br />
                        • Professional formatting with planetary positions
                        • House cusp details and sign placements
                        • Major aspect calculations with orbs
                        {options.includeInterpretation && (
                          <>
                            <br />
                            • AI-powered astrological interpretations
                          </>
                        )}
                        {options.reportType === 'synastry' && (
                          <>
                            <br />
                            • Relationship compatibility analysis
                            <br />
                            • House overlays and composite insights
                          </>
                        )}
                        {options.reportType === 'multi_system' && (
                          <>
                            <br />
                            • Western, Vedic, Chinese, and Mayan systems
                            <br />
                            • Integrated cross-system analysis
                          </>
                        )}
                      </Text>
                    </Box>
                  </VStack>
                </ModalBody>

                <ModalFooter>
                  <HStack spacing={3}>
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      colorScheme="purple"
                      onClick={exportToPdf}
                      isLoading={loading}
                      loadingText="Generating PDF..."
                      leftIcon={loading ? <Spinner size="sm" /> : <DownloadIcon />}
                    >
                      Generate & Download
                    </Button>
                  </HStack>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </VStack>
        </CardBody>
      </Card>
    </FeatureGuard>
  );
};
