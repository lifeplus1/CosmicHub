import React, { useState } from 'react';
import { Heading, Badge, Text } from '@chakra-ui/react';
import { Card, CardBody } from '@chakra-ui/react';

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
        <Heading className="mb-8 text-center cosmic-heading lg:mb-12">
          Saved Charts
        </Heading>
        {charts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="max-w-md p-8 mx-auto cosmic-card">
              <Text className="mb-4 text-lg cosmic-text">No charts saved yet.</Text>
              <Text className="text-sm cosmic-text opacity-80">
                Calculate your first chart to get started on your astrological journey!
              </Text>
            </div>
          </div>
        ) : (
          <div className="responsive-grid">
            {charts.map((chart) => (
              <Card 
                key={chart.id} 
                className="transition-all duration-300 transform cursor-pointer cosmic-card group hover:scale-105"
              >
                <CardBody className="relative p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <Heading 
                        size="md" 
                        className="flex-1 text-lg font-semibold text-gray-900 line-clamp-2"
                      >
                        {chart.name || (chart.birth_data?.city ? `${chart.birth_data.city} Chart` : 'Unnamed Chart')}
                      </Heading>
                      <Badge className="px-2 py-1 text-xs text-purple-800 bg-purple-100 rounded">{chart.chart_type}</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded">Date</Badge>
                        <Text className="text-sm font-medium text-gray-700">
                          {chart.created_at ? formatDate(chart.created_at) : 'Unknown'}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded">Time</Badge>
                        <Text className="text-sm font-medium text-gray-700">
                          {chart.birth_time || 'Unknown'}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded">Location</Badge>
                        <Text className="flex-1 text-sm font-medium text-gray-700 truncate" >
                          {chart.birth_location || 'Unknown'}
                        </Text>
                      </div>
                      {/* ...other chart details and controls... */}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedCharts;