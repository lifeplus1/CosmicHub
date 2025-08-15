// apps/astro/src/services/astrologyService.ts

import { getAuth } from 'firebase/auth';
import { ChartData, ChartType } from '@/types/astrology.types';
import { config } from '@cosmichub/config'; // Shared API config from packages/config

export const fetchChartData = async (userId: string, chartType: ChartType): Promise<ChartData> => {
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${config.api.baseUrl}/api/charts/${chartType}/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch chart data: ${response.statusText}`);
  }

  return response.json();
};