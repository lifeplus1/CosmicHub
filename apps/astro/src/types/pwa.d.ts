// Minimal ambient types used by the PWA performance utilities
interface NetworkInformation {
  downlink?: number;
  effectiveType?: string;
  saveData?: boolean;
}

declare interface PerformanceEntry {
  startTime?: number;
  value?: number;
  hadRecentInput?: boolean;
}
