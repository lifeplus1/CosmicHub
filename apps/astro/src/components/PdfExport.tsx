import React, { useState, useCallback } from 'react';
import { useToast } from './ToastProvider';
import * as Dialog from '@radix-ui/react-dialog';
import { FaDownload } from 'react-icons/fa';
import FeatureGuard from './FeatureGuard';
import type { ChartData, BirthData } from '../types';
import { serializeAstrologyData, type AstrologyChart } from '@cosmichub/types';
import { devConsole } from '../config/environment';

interface PdfExportProps {
  chartData?: ChartData;
  birthInfo?: BirthData;
  synastryData?: unknown;
  multiSystemData?: unknown;
}

interface ExportOptions {
  reportType: 'standard' | 'synastry' | 'multi_system';
  includeInterpretation: boolean;
  includeAspects: boolean;
  includeTransits: boolean;
}

const PdfExport: React.FC<PdfExportProps> = React.memo(
  ({ chartData, birthInfo, synastryData, multiSystemData }) => {
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<ExportOptions>({
      reportType: 'standard',
      includeInterpretation: true,
      includeAspects: true,
      includeTransits: false,
    });
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleOptionChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setOptions(prev => ({
          ...prev,
          [name]:
            type === 'checkbox'
              ? (e.target as HTMLInputElement).checked
              : value,
        }));
      },
      []
    );

    const exportToPdf = useCallback(async (): Promise<void> => {
      setLoading(true);

      try {
        // Narrow export payload shape
        interface StandardExport {
          chart_data: { chart: unknown };
          birth_info?: BirthData;
          report_type: 'standard';
        }
        interface SynastryExport {
          chart_data: { synastry: unknown };
          report_type: 'synastry';
        }
        interface MultiSystemExport {
          chart_data: { charts: unknown };
          report_type: 'multi_system';
        }
        type ExportPayload =
          | StandardExport
          | SynastryExport
          | MultiSystemExport;

        let exportData: ExportPayload; // will be assigned in switch
        let endpoint = '/api/export-pdf';

        switch (options.reportType) {
          case 'standard': {
            if (chartData === null || chartData === undefined) {
              throw new Error('Chart data is required for standard PDF export');
            }
            // Serialize with safe intermediate cast; if shape mismatch, fall back to raw
            let serializedChartData: string;
            try {
              serializedChartData = serializeAstrologyData(
                chartData as unknown as AstrologyChart
              );
            } catch (serializationError) {
              devConsole.warn?.(
                'Chart serialization failed, falling back to raw chartData',
                serializationError
              );
              serializedChartData = JSON.stringify(chartData);
            }
            exportData = {
              chart_data: { chart: JSON.parse(serializedChartData) },
              birth_info: birthInfo,
              report_type: 'standard',
            };
            break;
          }
          case 'synastry': {
            if (synastryData === null || synastryData === undefined) {
              throw new Error(
                'Synastry data is required for synastry PDF export'
              );
            }
            try {
              const maybeChart = synastryData as Partial<AstrologyChart>;
              const serializedSynastryData = serializeAstrologyData(
                maybeChart as AstrologyChart
              );
              exportData = {
                chart_data: { synastry: JSON.parse(serializedSynastryData) },
                report_type: 'synastry',
              };
            } catch (serializationError) {
              devConsole.warn?.(
                'Could not serialize synastry data, using raw data:',
                serializationError
              );
              exportData = {
                chart_data: { synastry: synastryData },
                report_type: 'synastry',
              };
            }
            endpoint = '/api/export-synastry-pdf';
            break;
          }
          case 'multi_system': {
            if (multiSystemData === null || multiSystemData === undefined) {
              throw new Error(
                'Multi-system data is required for multi-system PDF export'
              );
            }
            exportData = {
              chart_data: { charts: multiSystemData },
              report_type: 'multi_system',
            };
            break;
          }
          default: {
            throw new Error('Invalid report type selected');
          }
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

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `cosmic_hub_${options.reportType}_report.pdf`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'PDF Generated',
          description: 'Your report is downloading.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (err: unknown) {
        toast({
          title: 'PDF Generation Failed',
          description:
            err instanceof Error ? err.message : 'Unknown error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
        setIsOpen(false);
      }
    }, [options, chartData, birthInfo, synastryData, multiSystemData, toast]);

    return (
      <FeatureGuard requiredTier='premium' feature='pdf_export'>
        <div className='cosmic-card'>
          <div className='p-6'>
            <h2 className='mb-4 text-xl font-bold text-cosmic-gold'>
              Export to PDF
            </h2>
            <p className='mb-6 text-cosmic-silver'>
              Download a professional PDF report of your chart analysis.
            </p>
            <button
              className='w-full cosmic-button'
              onClick={() => setIsOpen(true)}
              disabled={loading}
              aria-label='Open PDF Export Options'
            >
              <FaDownload className='mr-2' />
              Export Chart to PDF
            </button>
          </div>
        </div>

        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className='fixed inset-0 bg-black/50 backdrop-blur-sm' />
            <Dialog.Content className='fixed w-full max-w-lg p-6 transform -translate-x-1/2 -translate-y-1/2 border rounded-lg top-1/2 left-1/2 bg-cosmic-blue/80 backdrop-blur-md border-cosmic-silver/20'>
              <div className='flex items-center justify-between mb-4'>
                <Dialog.Title className='text-lg font-bold text-cosmic-gold'>
                  PDF Export Options
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    className='text-cosmic-silver hover:text-cosmic-gold'
                    aria-label='Close'
                  >
                    <svg
                      className='w-6 h-6'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                </Dialog.Close>
              </div>

              <div className='flex flex-col space-y-6'>
                <div>
                  <label
                    htmlFor='reportType'
                    className='block mb-2 text-cosmic-gold'
                  >
                    Report Type
                  </label>
                  <select
                    id='reportType'
                    name='reportType'
                    value={options.reportType}
                    onChange={handleOptionChange}
                    className='cosmic-input'
                    aria-label='Report Type'
                  >
                    <option value='standard'>Standard Chart Report</option>
                    <option value='synastry'>Synastry Report</option>
                    <option value='multi_system'>Multi-System Report</option>
                  </select>
                </div>

                <div className='flex flex-col space-y-4'>
                  <label className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      name='includeInterpretation'
                      checked={options.includeInterpretation}
                      onChange={handleOptionChange}
                      className='w-4 h-4 text-purple-500 rounded'
                      aria-label='checkbox input'
                    />
                    <span className='text-cosmic-silver'>
                      Include AI Interpretation (Elite Feature)
                    </span>
                  </label>
                  <label className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      name='includeAspects'
                      checked={options.includeAspects}
                      onChange={handleOptionChange}
                      className='w-4 h-4 text-purple-500 rounded'
                      aria-label='checkbox input'
                    />
                    <span className='text-cosmic-silver'>
                      Include Detailed Aspects
                    </span>
                  </label>
                  <label className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      name='includeTransits'
                      checked={options.includeTransits}
                      onChange={handleOptionChange}
                      className='w-4 h-4 text-purple-500 rounded'
                      aria-label='checkbox input'
                    />
                    <span className='text-cosmic-silver'>
                      Include Current Transits (Elite Feature)
                    </span>
                  </label>
                </div>

                <div className='flex p-4 space-x-4 border border-blue-500 rounded-md bg-blue-900/50'>
                  <span className='text-xl text-blue-500'>ℹ️</span>
                  <div className='flex flex-col space-y-2'>
                    <p className='font-bold text-cosmic-silver'>
                      What&apos;s Included:
                    </p>
                    <p className='text-sm text-cosmic-silver'>
                      • Professional formatting with planetary positions
                      <br />
                      • House cusp details and sign placements
                      <br />• Major aspect calculations with orbs
                      {options.includeInterpretation && (
                        <>
                          <br />• AI-powered astrological interpretations
                        </>
                      )}
                      {options.reportType === 'synastry' && (
                        <>
                          <br />
                          • Relationship compatibility analysis
                          <br />• House overlays and composite insights
                        </>
                      )}
                      {options.reportType === 'multi_system' && (
                        <>
                          <br />
                          • Western, Vedic, Chinese, and Mayan systems
                          <br />• Integrated cross-system analysis
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex mt-6 space-x-3'>
                <button
                  className='flex-1 bg-transparent border cosmic-button border-cosmic-silver text-cosmic-silver hover:bg-cosmic-silver/10'
                  onClick={() => setIsOpen(false)}
                  aria-label='Cancel'
                >
                  Cancel
                </button>
                <button
                  className='flex-1 cosmic-button'
                  onClick={() => {
                    void exportToPdf();
                  }}
                  disabled={loading}
                >
                  <FaDownload className='mr-2' />
                  {loading ? 'Generating...' : 'Generate & Download'}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </FeatureGuard>
    );
  }
);

PdfExport.displayName = 'PdfExport';

export default PdfExport;
