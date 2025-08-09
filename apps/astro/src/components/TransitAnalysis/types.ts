export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface TransitResult {
  id: string;
  planet: string;
  aspect: string;
  date: string;
  description?: string;
}

export interface LunarTransitResult {
  phase: string;
  date: string;
  energy: string;
  description?: string;
}