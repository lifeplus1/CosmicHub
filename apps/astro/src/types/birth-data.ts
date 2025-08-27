// Birth Data Types

export interface ChartBirthData {
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
export interface BirthDataInput {
  time: string;
  location: string;
  lat?: number;
  lon?: number;
  timezone?: string;
}

// Type guard for StoredBirthData
