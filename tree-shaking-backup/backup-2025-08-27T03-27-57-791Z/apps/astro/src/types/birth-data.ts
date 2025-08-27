import type { UnifiedBirthData } from '@cosmichub/types';

  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
}

// Type guard for ChartBirthData

  time: string;
  location: string;
  lat?: number;
  lon?: number;
  timezone?: string;
}

// Type guard for StoredBirthData
