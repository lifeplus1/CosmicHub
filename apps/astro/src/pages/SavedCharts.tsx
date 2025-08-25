import React from 'react';
import { useAuth } from '@cosmichub/auth';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@cosmichub/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSavedCharts,
  deleteChart,
  type SavedChart,
} from '../services/api';
import type { ApiResult } from '../services/apiResult';
import type { ChartId } from '../services/api.types';
import { CosmicLoading } from '../components/CosmicLoading';
import { devConsole } from '../config/environment';

const SavedCharts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch saved charts
  const {
    data: chartsResult,
    isLoading,
    error,
  } = useQuery<ApiResult<SavedChart[]>>({
    queryKey: ['savedCharts'],
    queryFn: fetchSavedCharts,
    enabled: user !== null,
    staleTime: 30 * 1000, // 30 seconds
  });
  const charts: SavedChart[] = chartsResult?.success ? chartsResult.data : [];

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

  const handleDeleteChart = (chartId: string, chartName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${chartName}"? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(chartId as ChartId);
    }
  };

  const handleViewChart = (chart: SavedChart) => {
    sessionStorage.setItem('selectedChart', JSON.stringify(chart));
    navigate('/chart');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

      {/* Charts Grid */}
      {isLoading === false &&
        error === null &&
        chartsResult &&
        chartsResult.success === true && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {charts.length === 0 ? (
              /* Empty State */
              <div className='md:col-span-2 lg:col-span-3 text-center py-16'>
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
            ) : (
              /* Charts Display */
              charts.map(chart => (
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
              ))
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
