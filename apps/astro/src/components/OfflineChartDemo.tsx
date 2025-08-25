/**
 * Offline Chart Demo - Showcase Component
 * Demonstrates the offline chart functionality and UX-020 implementation
 */

import React, { useState } from 'react';
import { useOfflineCharts } from '@/hooks/useOfflineCharts';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import type { ChartData } from '@/types';
import type { ChartCalculationParams } from '@/services/offline-chart-service';

const OfflineChartDemo: React.FC = () => {
  const {
    charts,
    networkStatus,
    syncStatus,
    storageStats,
    loading,
    error,
    saveChart,
    loadChart,
    deleteChart,
    syncCharts,
    clearCache,
    exportCharts,
    importCharts,
    isOnline,
    isSyncing,
    hasOfflineCharts,
    hasPendingSync,
    storageUsagePercent
  } = useOfflineCharts();

  const [selectedChart, setSelectedChart] = useState<{
    chartData: ChartData;
    params: ChartCalculationParams;
    metadata: Record<string, unknown>;
  } | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChartName, setNewChartName] = useState('');

  // Sample chart data for demo
  const createSampleChart = async () => {
    const sampleChartData: ChartData = {
      planets: {
        Sun: { position: 15.5, house: 1 },
        Moon: { position: 120.3, house: 5 },
        Mercury: { position: 25.8, house: 2 },
        Venus: { position: 45.2, house: 3 },
        Mars: { position: 200.7, house: 8 },
        Jupiter: { position: 165.4, house: 6 },
        Saturn: { position: 285.9, house: 10 },
        Uranus: { position: 320.1, house: 11 },
        Neptune: { position: 340.5, house: 12 },
        Pluto: { position: 260.8, house: 9 }
      },
      houses: Array.from({ length: 12 }, (_, i) => ({
        house: i + 1,
        cusp: (i * 30) + Math.random() * 30,
        sign: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
              'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][i] as string
      })),
      aspects: [
        { 
          point1: 'Sun', 
          point2: 'Moon', 
          aspect: 'Trine', 
          orb: 2.1, 
          exact: false,
          point1_sign: 'Aries',
          point2_sign: 'Leo'
        },
        { 
          point1: 'Sun', 
          point2: 'Mercury', 
          aspect: 'Conjunction', 
          orb: 0.5, 
          exact: true,
          point1_sign: 'Aries',
          point2_sign: 'Aries'
        }
      ]
    };

    const sampleParams: ChartCalculationParams = {
      name: newChartName || `Sample Chart ${Date.now()}`,
      birthData: {
        date: '1990-06-15',
        time: '14:30',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          city: 'San Francisco',
          country: 'US'
        }
      },
      systems: ['western'],
      houses: 'placidus',
      aspects: ['major']
    };

    try {
      const result = await saveChart(sampleChartData, sampleParams);
      setNewChartName('');
      setShowCreateForm(false);
      
      if (result.offline) {
        alert(`Chart saved offline! It will sync when you're back online.`);
      } else {
        alert(`Chart saved successfully!`);
      }
    } catch (err) {
      alert(`Failed to save chart: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleLoadChart = async (chartId: string) => {
    try {
      const chart = await loadChart(chartId);
      setSelectedChart(chart);
    } catch (err) {
      alert(`Failed to load chart: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteChart = async (chartId: string) => {
    if (confirm('Are you sure you want to delete this chart?')) {
      try {
        const result = await deleteChart(chartId);
        if (result.offline) {
          alert('Chart deleted offline. Changes will sync when online.');
        } else {
          alert('Chart deleted successfully!');
        }
      } catch (err) {
        alert(`Failed to delete chart: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleSync = async () => {
    try {
      const result = await syncCharts();
      alert(`Sync complete! Synced: ${result.synced}, Errors: ${result.errors}`);
    } catch (err) {
      alert(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleExport = async () => {
    try {
      const exportData = await exportCharts();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cosmic-hub-charts-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = e.target?.result as string;
        const result = await importCharts(importData);
        alert(`Import complete! Imported: ${result.imported}, Errors: ${result.errors}`);
      } catch (err) {
        alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleClearCache = async () => {
    if (confirm('This will delete all offline charts. Are you sure?')) {
      try {
        await clearCache();
        alert('Cache cleared successfully!');
      } catch (err) {
        alert(`Failed to clear cache: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🌟 Offline Chart Mode Demo
              </h1>
              <p className="text-blue-100">
                UX-020 Implementation - Progressive Web App with Offline Chart Storage
              </p>
            </div>
            <OfflineIndicator />
          </div>

          {/* Status Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Network</h3>
              <div className="text-2xl font-bold text-white">
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </div>
              <div className="text-sm text-blue-100">
                Quality: {networkStatus.connectionQuality}
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Charts</h3>
              <div className="text-2xl font-bold text-white">
                {charts.length}
              </div>
              <div className="text-sm text-blue-100">
                {hasOfflineCharts && '⚠️ Some offline'}
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Storage</h3>
              <div className="text-2xl font-bold text-white">
                {storageUsagePercent.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-100">
                {storageStats.totalCharts} charts
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Sync</h3>
              <div className="text-2xl font-bold text-white">
                {isSyncing ? '🔄 Active' : '✓ Ready'}
              </div>
              <div className="text-sm text-blue-100">
                {hasPendingSync && `${syncStatus.pendingItems} pending`}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ➕ Create Sample Chart
            </button>

            <button
              onClick={() => void handleSync()}
              disabled={isSyncing || !hasPendingSync}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isSyncing ? '🔄 Syncing...' : '🔄 Force Sync'}
            </button>

            <button
              onClick={() => void handleExport()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              📥 Export Charts
            </button>

            <label className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
              📤 Import Charts
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                aria-label="file input"
              />
            </label>

            <button
              onClick={() => void handleClearCache()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🗑️ Clear Cache
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-100">❌ {error}</p>
            </div>
          )}
        </div>

        {/* Create Chart Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Create Sample Chart</h2>
              <div className="mb-4">
                <label htmlFor="chart-name" className="block text-sm font-medium mb-2">Chart Name</label>
                <input
                  id="chart-name"
                  type="text"
                  value={newChartName}
                  onChange={(e) => setNewChartName(e.target.value)}
                  placeholder="Enter chart name (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="text input"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => void createSampleChart()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                >
                  Create Chart
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Charts List */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">📊 Saved Charts</h2>
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin text-4xl mb-4">⭐</div>
              <p className="text-white">Loading charts...</p>
            </div>
          )}

          {!loading && charts.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-white">No charts found. Create one to get started!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {charts.map((chart) => (
              <div key={chart.id} className="bg-white/10 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white truncate">{chart.name}</h3>
                  <div className="flex items-center gap-1">
                    {chart.fromCache && <span title="From cache">💾</span>}
                    {!chart.synced && <span title="Not synced">⚠️</span>}
                  </div>
                </div>
                
                <div className="text-sm text-blue-100 space-y-1 mb-4">
                  <div>Created: {new Date(chart.createdAt).toLocaleDateString()}</div>
                  <div>Updated: {new Date(chart.updatedAt).toLocaleDateString()}</div>
                  <div>Status: {chart.synced ? 'Synced' : 'Offline'}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => void handleLoadChart(chart.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => void handleDeleteChart(chart.id)}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Chart Details */}
        {selectedChart && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                📈 Chart Details: {selectedChart.metadata.name ? String(selectedChart.metadata.name) : 'Unknown'}
              </h2>
              <button
                onClick={() => setSelectedChart(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Birth Data</h3>
                <div className="text-blue-100 space-y-2">
                  <div>Date: {selectedChart.params.birthData.date}</div>
                  <div>Time: {selectedChart.params.birthData.time}</div>
                  <div>Location: {selectedChart.params.birthData.location.city}, {selectedChart.params.birthData.location.country}</div>
                  <div>Coordinates: {selectedChart.params.birthData.location.latitude}°, {selectedChart.params.birthData.location.longitude}°</div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Chart Info</h3>
                <div className="text-blue-100 space-y-2">
                  <div>Created: {new Date(selectedChart.metadata.createdAt as string | number | Date).toLocaleString()}</div>
                  <div>Updated: {new Date(selectedChart.metadata.updatedAt as string | number | Date).toLocaleString()}</div>
                  <div>Synced: {selectedChart.metadata.synced ? 'Yes' : 'No'}</div>
                  <div>Planets: {Object.keys(selectedChart.chartData.planets || {}).length}</div>
                  <div>Houses: {selectedChart.chartData.houses?.length || 0}</div>
                  <div>Aspects: {selectedChart.chartData.aspects?.length || 0}</div>
                </div>
              </div>
            </div>

            {/* Planet positions */}
            {selectedChart.chartData.planets && Object.keys(selectedChart.chartData.planets).length > 0 && (
              <div className="mt-6 bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Planet Positions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(selectedChart.chartData.planets).map(([planetName, planetData]) => (
                    <div key={planetName} className="bg-white/10 rounded p-3">
                      <div className="font-semibold text-white">{planetName}</div>
                      <div className="text-sm text-blue-100">
                        {planetData.position.toFixed(2)}° (House {planetData.house})
                        {planetData.retrograde && ' ℞'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineChartDemo;
