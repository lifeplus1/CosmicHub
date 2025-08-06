import React, { useState } from 'react';
import { cn, cardVariants, badgeVariants } from '../shared/utils';

// Fallback date formatter
const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
};

type Chart = {
  id: string;
  name?: string;
  chart_type?: string;
  birth_data?: { city?: string };
  created_at?: string;
  birth_time?: string;
  birth_location?: string;
};

const SavedCharts = (): JSX.Element => {
  // Example charts state (replace with real data/fetch)
  const [charts] = useState<Chart[]>([]);

  return (
    <div className="cosmic-container">
      <div className="cosmic-section">
        <h1 className="mb-8 text-center cosmic-heading lg:mb-12 text-4xl font-bold text-white">
          Saved Charts
        </h1>
        {charts.length === 0 ? (
          <div className="py-16 text-center">
            <div className={cn(cardVariants({ variant: 'default' }), "max-w-md p-8 mx-auto")}>
              <p className="mb-4 text-lg text-slate-300">No charts saved yet.</p>
              <p className="text-sm text-slate-400">
                Calculate your first chart to get started on your astrological journey!
              </p>
            </div>
          </div>
        ) : (
          <div className="responsive-grid">
            {charts.map((chart) => (
              <div 
                key={chart.id} 
                className={cn(
                  cardVariants({ variant: 'secondary' }),
                  "transition-all duration-300 transform cursor-pointer group hover:scale-105"
                )}
              >
                <div className="relative p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="flex-1 text-lg font-semibold text-white line-clamp-2">
                        {chart.name || (chart.birth_data?.city ? `${chart.birth_data.city} Chart` : 'Unnamed Chart')}
                      </h3>
                      <span className={cn(badgeVariants({ variant: 'purple' }))}>
                        {chart.chart_type}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={cn(badgeVariants({ variant: 'secondary' }))}>Date</span>
                        <span className="text-sm font-medium text-slate-300">
                          {chart.created_at ? formatDate(chart.created_at) : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(badgeVariants({ variant: 'secondary' }))}>Time</span>
                        <span className="text-sm font-medium text-slate-300">
                          {chart.birth_time || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(badgeVariants({ variant: 'secondary' }))}>Location</span>
                        <span className="flex-1 text-sm font-medium text-slate-300 truncate">
                          {chart.birth_location || 'Unknown'}
                        </span>
                      </div>
                      {/* ...other chart details and controls... */}
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