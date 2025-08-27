// Core types for transit analysis birth data (textual form)
// NOTE: This differs from the shared ChartBirthData (numeric unified form)
  birth_time: string; // HH:MM:SS
  latitude: number;
  longitude: number;
  timezone?: string;
  city?: string;
}

  endDate: string; // ISO format: YYYY-MM-DD
}

// Enhanced transit result interface
  planet: string;
  aspect: string;
  natal_planet: string;
  date: string; // ISO format: YYYY-MM-DD
  degree: number;
  exact_time?: string;
  orb: number;
  intensity: number; // 0-100 scale
  energy: string;
  duration_days: number;
  description?: string;
}

// Enhanced lunar transit result interface
  date: string; // ISO format: YYYY-MM-DD
  exact_time: string;
  energy: string;
  degree: number;
  moon_sign: string;
  intensity: number; // 0-100 scale
  description?: string;
}

// API Response types
  totalCount: number;
  dateRange: DateRange;
  calculatedAt: string;
  cached: boolean;
}

  totalCount: number;
  dateRange: DateRange;
  calculatedAt: string;
  cached: boolean;
}

// Error handling types
  code: string;
  details?: Record<string, unknown>;
}

// Transit analysis options
  includeAsteroids?: boolean;
  orb?: number;
}

  includeDailyPhases?: boolean;
}
