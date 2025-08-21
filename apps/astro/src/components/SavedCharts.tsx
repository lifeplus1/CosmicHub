import React, { useState, type JSX } from 'react';

// Fallback date formatter with better error handling
const formatDate = (date: string | Date | undefined | null): string => {
  if (date === null || date === undefined || date === '') return 'Unknown';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    // Check if date is valid
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

/** Birth data information */
interface ChartBirthData {
  city?: string;
}

/** Chart metadata for displaying saved charts */
interface Chart {
  /** Unique identifier for the chart */
  id: string;
  /** Optional display name for the chart */
  name: string | null;
  /** Type of chart (natal, transit, etc.) */
  chart_type: string | null;
  /** Birth data containing optional city information */
  birth_data: ChartBirthData | null;
  /** Chart creation timestamp */
  created_at: string | null;
  /** Birth time for natal chart */
  birth_time: string | null;
  /** Birth location for natal chart */
  birth_location: string | null;
}

const SavedCharts = (): JSX.Element => {
  // Example charts state (replace with real data/fetch)
  const [charts] = useState<Chart[]>([]);

  return (
    <div className="cosmic-container">
      <div className="cosmic-section">
        <h1 className="mb-8 text-center cosmic-heading lg:mb-12 text-2xl font-bold">
          Saved Charts
        </h1>
        {charts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="max-w-md p-8 mx-auto cosmic-card">
              <p className="mb-4 text-lg cosmic-text">No charts saved yet.</p>
              <p className="text-sm cosmic-text opacity-80">
                Calculate your first chart to get started on your astrological journey!
              </p>
            </div>
          </div>
        ) : (
          <div className="responsive-grid">
            {charts.map((chart) => (
              <div 
                key={chart.id} 
                className="transition-all duration-300 transform cursor-pointer cosmic-card group hover:scale-105"
              >
                <div className="relative p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="flex-1 text-lg font-semibold text-gray-900 line-clamp-2">
                        {(
                          chart.name !== null && chart.name !== ''
                            ? chart.name
                            : (chart.birth_data !== null && chart.birth_data !== undefined && typeof chart.birth_data.city === 'string' && chart.birth_data.city !== ''
                                ? `${chart.birth_data.city} Chart`
                                : 'Unnamed Chart')
                        )}
                      </h3>
                      <span className="px-2 py-1 text-xs text-purple-800 bg-purple-100 rounded">{chart.chart_type}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded">Date</span>
                        <span className="text-sm font-medium text-gray-700">
                          {chart.created_at !== null && chart.created_at !== undefined && chart.created_at !== '' ? formatDate(chart.created_at) : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded">Time</span>
                        <span className="text-sm font-medium text-gray-700">
                          {chart.birth_time !== null && chart.birth_time !== undefined && chart.birth_time !== '' ? chart.birth_time : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded">Location</span>
                        <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                          {chart.birth_location !== null && chart.birth_location !== undefined && chart.birth_location !== '' ? chart.birth_location : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedCharts;