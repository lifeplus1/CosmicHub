import React, { useMemo } from 'react';
import { useAuth } from '@cosmichub/auth';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@cosmichub/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSavedCharts,
  deleteChart,
  type SavedChart as ApiSavedChart,
} from '../services/api';
import type { ApiResult } from '../services/apiResult';
import type { ChartId } from '../services/api.types';
import { CosmicLoading } from '../components/CosmicLoading';
import VirtualizedDataTable from '../components/common/VirtualizedDataTable';
import { devConsole } from '../config/environment';
import type { SavedChartTableRow } from './SavedCharts.types';
import { formatDate } from '@cosmichub/config';

const SavedCharts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Virtualization threshold
  const VIRTUALIZATION_THRESHOLD = 20;

  // Fetch saved charts
  const {
    data: chartsResult,
    isLoading,
    error,
  } = useQuery<ApiResult<ApiSavedChart[]>>({
    queryKey: ['savedCharts'],
    queryFn: fetchSavedCharts,
    enabled: user !== null,
    staleTime: 30 * 1000, // 30 seconds
  });
  const charts: ApiSavedChart[] = chartsResult?.success ? chartsResult.data : [];

  // Delete chart mutation
  const deleteMutation = useMutation({
    mutationFn: deleteChart,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['savedCharts'] });
    },
    onError: error => {
      devConsole.error('❌ Error deleting chart:', error);
      alert('Failed to delete chart. Please try again.');
    },
  });

  // Convert SavedChart to VirtualizedDataTable format
  const chartTableData = useMemo(() => 
    charts.map(chart => ({
      id: chart.id,
      name: chart.name || `${chart.birth_location || 'Unknown'} Chart`,
      chart_type: chart.chart_type || 'Natal',
      birth_date: chart.birth_date,
      birth_time: chart.birth_time,
      birth_location: chart.birth_location,
      created_at: chart.created_at,
      // Store original chart for actions
      _originalChart: chart,
    } as SavedChartTableRow)), [charts]);

  // Configure table columns for virtualized display
  const chartTableColumns = useMemo(() => [
    {
      key: 'name' as const,
      label: 'Chart Name',
      width: 200,
      render: (value: unknown, row: SavedChartTableRow) => (
        <div className="flex flex-col">
          <span className="font-semibold text-cosmic-gold truncate">
            {value as string}
          </span>
          <span className="text-xs text-cosmic-silver/70">
            {row.chart_type}
          </span>
        </div>
      ),
    },
    {
      key: 'birth_date' as const,
      label: 'Birth Date',
      width: 120,
      render: (value: unknown) => (
        <span className="text-cosmic-silver">{value as string}</span>
      ),
    },
    {
      key: 'birth_time' as const,
      label: 'Birth Time',
      width: 100,
      render: (value: unknown) => (
        <span className="text-cosmic-silver">{value as string}</span>
      ),
    },
    {
      key: 'birth_location' as const,
      label: 'Location',
      width: 150,
      render: (value: unknown) => (
        <span className="text-cosmic-silver truncate" title={value as string}>
          {value as string}
        </span>
      ),
    },
    {
      key: 'created_at' as const,
      label: 'Created',
      width: 120,
      render: (value: unknown) => (
        <span className="text-cosmic-silver/70 text-sm">
          {formatDate(value as string)}
        </span>
      ),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      width: 160,
      render: (value: unknown, row: SavedChartTableRow) => (
        <div className="flex gap-2">
          <Button
            onClick={() => handleViewChart(row._originalChart)}
            size="sm"
            className="bg-cosmic-gold hover:bg-cosmic-gold/80 text-cosmic-dark text-xs px-3 py-1"
          >
            View
          </Button>
          <Button
            onClick={() => handleDeleteChart(row._originalChart.id, row._originalChart.name)}
            variant="secondary"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs px-3 py-1"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? '...' : 'Delete'}
          </Button>
        </div>
      ),
    },
  ], [deleteMutation.isPending]);

  const handleDeleteChart = (chartId: string, chartName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${chartName}"? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(chartId as ChartId);
    }
  };

  const handleViewChart = (chart: ApiSavedChart) => {
    console.log('🔄 Storing chart in sessionStorage:', chart);

    // Try multiple approaches to ensure data persistence
    sessionStorage.setItem('selectedChart', JSON.stringify(chart));
    localStorage.setItem('tempSelectedChart', JSON.stringify(chart));

    console.log(
      '✅ Chart stored, confirming storage:',
      sessionStorage.getItem('selectedChart')
    );
    console.log(
      '✅ Chart stored in localStorage too:',
      localStorage.getItem('tempSelectedChart')
    );
    console.log('🔄 Navigating to /chart');

    // Add a small delay to ensure storage is written
    setTimeout(() => {
      navigate('/chart');
    }, 50);
  };



  if (user === null) {
    return (
      <div className='space-y-8'>
        <div className='text-center py-12 bg-gradient-to-r from-cosmic-blue/20 to-cosmic-purple/20 rounded-2xl border border-cosmic-silver/10'>
          <h1 className='text-4xl font-bold text-cosmic-gold mb-4 font-cinzel'>
            Saved Charts
          </h1>
          <p className='text-xl text-cosmic-silver/80 font-playfair mb-8'>
            Please sign in to view your saved charts
          </p>
          <Button
            onClick={() => navigate('/login')}
            className='bg-cosmic-purple hover:bg-cosmic-purple/80'
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Hero Section */}
      <div className='text-center py-12 bg-gradient-to-r from-cosmic-blue/20 to-cosmic-purple/20 rounded-2xl border border-cosmic-silver/10'>
        <h1 className='text-4xl font-bold text-cosmic-gold mb-4 font-cinzel'>
          Saved Charts
        </h1>
        <p className='text-xl text-cosmic-silver/80 font-playfair'>
          Access your personal collection of astrological charts
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='flex justify-center py-16'>
          <CosmicLoading size='lg' message='Loading your saved charts...' />
        </div>
      )}

      {/* Error State */}
      {(error !== null || (chartsResult && chartsResult.success === false)) && (
        <Card title='Error Loading Charts'>
          <div className='text-center py-8'>
            <div className='text-red-400 mb-4'>Failed to load saved charts</div>
            <p className='text-cosmic-silver/70 mb-4'>
              {chartsResult && chartsResult.success === false
                ? chartsResult.error
                : error instanceof Error
                  ? error.message
                  : 'An unknown error occurred'}
            </p>
            <Button
              onClick={() => {
                void queryClient.invalidateQueries({
                  queryKey: ['savedCharts'],
                });
              }}
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Charts Display */}
      {isLoading === false &&
        error === null &&
        chartsResult &&
        chartsResult.success === true && (
          <div className="space-y-6">
            {charts.length === 0 ? (
              /* Empty State */
              <div className='text-center py-16'>
                <div className='w-24 h-24 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto mb-6'>
                  <span className='text-4xl'>📊</span>
                </div>
                <h3 className='text-2xl font-semibold text-cosmic-gold mb-4 font-playfair'>
                  No Saved Charts Yet
                </h3>
                <p className='text-cosmic-silver/80 mb-8 max-w-md mx-auto'>
                  Start creating charts to build your personal cosmic library.
                  All your charts will be saved here for easy access.
                </p>
                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                  <button
                    onClick={() => navigate('/calculator')}
                    className='px-8 py-3 bg-gradient-to-r from-cosmic-purple to-cosmic-blue hover:from-cosmic-purple/80 hover:to-cosmic-blue/80 text-white rounded-lg transition-all duration-300 font-semibold'
                  >
                    Create Birth Chart
                  </button>
                  <button
                    onClick={() => navigate('/numerology')}
                    className='px-8 py-3 border border-cosmic-silver/30 hover:border-cosmic-silver/50 text-cosmic-silver hover:bg-cosmic-silver/10 rounded-lg transition-all duration-300 font-semibold'
                  >
                    Calculate Numerology
                  </button>
                </div>
              </div>
            ) : charts.length > VIRTUALIZATION_THRESHOLD ? (
              /* Virtualized Table for Large Collections */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-cosmic-gold">
                    Your Charts ({charts.length})
                  </h2>
                  <div className="flex items-center gap-2 text-cosmic-silver/70 text-sm">
                    <span>📊</span>
                    <span>Optimized view for large collections</span>
                  </div>
                </div>
                <Card className="cosmic-glass border-cosmic-purple/30">
                  <VirtualizedDataTable
                    data={chartTableData}
                    columns={chartTableColumns}
                    height={600}
                    itemHeight={80}
                    searchable={true}
                    sortable={true}
                  />
                </Card>
              </div>
            ) : (
              /* Traditional Grid for Smaller Collections */
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {charts.map(chart => (
                  <Card key={chart.id} title=''>
                    <div className='space-y-4'>
                      {/* Chart Header */}
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h3 className='text-lg font-semibold text-cosmic-gold mb-1'>
                            {chart.name !== null && chart.name !== ''
                              ? chart.name
                              : `${chart.birth_location !== null && chart.birth_location !== '' ? chart.birth_location : 'Unknown'} Chart`}
                          </h3>
                          <div className='flex items-center gap-2'>
                            <span className='px-2 py-1 text-xs bg-cosmic-purple/20 text-cosmic-purple rounded'>
                              {chart.chart_type !== null &&
                              chart.chart_type !== ''
                                ? chart.chart_type
                                : 'Natal'}
                            </span>
                            <span className='text-cosmic-silver/70 text-sm'>
                              {formatDate(chart.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Chart Details */}
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span className='text-cosmic-silver/70'>
                            Birth Date:
                          </span>
                          <span className='text-cosmic-silver'>
                            {chart.birth_date}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-cosmic-silver/70'>
                            Birth Time:
                          </span>
                          <span className='text-cosmic-silver'>
                            {chart.birth_time}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-cosmic-silver/70'>Location:</span>
                          <span className='text-cosmic-silver'>
                            {chart.birth_location}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className='flex gap-2 pt-4 border-t border-cosmic-silver/10'>
                        <Button
                          onClick={() => {
                            handleViewChart(chart);
                          }}
                          className='flex-1 bg-cosmic-gold hover:bg-cosmic-gold/80 text-cosmic-dark'
                        >
                          View Chart
                        </Button>
                        <Button
                          onClick={() => {
                            handleDeleteChart(chart.id, chart.name);
                          }}
                          variant='secondary'
                          className='text-red-400 hover:text-red-300 hover:bg-red-500/10'
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? '...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Quick Actions */}
      <div className='bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8'>
        <h3 className='text-xl font-semibold text-cosmic-gold mb-6 font-playfair flex items-center'>
          <span className='w-8 h-8 bg-cosmic-gold/20 rounded-lg flex items-center justify-center mr-3'>
            ⚡
          </span>
          Quick Actions
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <button
            onClick={() => navigate('/calculator')}
            className='flex items-center p-4 bg-cosmic-dark/30 rounded-lg border border-cosmic-silver/10 hover:border-cosmic-purple/30 transition-colors duration-300 group'
          >
            <div className='w-12 h-12 bg-cosmic-purple/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-cosmic-purple/30 transition-colors duration-300'>
              <span className='text-xl'>🔮</span>
            </div>
            <div className='text-left'>
              <h4 className='font-semibold text-cosmic-gold'>Birth Chart</h4>
              <p className='text-cosmic-silver/70 text-sm'>
                Create natal chart
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/numerology')}
            className='flex items-center p-4 bg-cosmic-dark/30 rounded-lg border border-cosmic-silver/10 hover:border-cosmic-gold/30 transition-colors duration-300 group'
          >
            <div className='w-12 h-12 bg-cosmic-gold/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-cosmic-gold/30 transition-colors duration-300'>
              <span className='text-xl'>📊</span>
            </div>
            <div className='text-left'>
              <h4 className='font-semibold text-cosmic-gold'>Numerology</h4>
              <p className='text-cosmic-silver/70 text-sm'>Calculate numbers</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/human-design')}
            className='flex items-center p-4 bg-cosmic-dark/30 rounded-lg border border-cosmic-silver/10 hover:border-cosmic-silver/30 transition-colors duration-300 group'
          >
            <div className='w-12 h-12 bg-cosmic-silver/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-cosmic-silver/30 transition-colors duration-300'>
              <span className='text-xl'>🧬</span>
            </div>
            <div className='text-left'>
              <h4 className='font-semibold text-cosmic-gold'>Human Design</h4>
              <p className='text-cosmic-silver/70 text-sm'>Energy blueprint</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedCharts;
