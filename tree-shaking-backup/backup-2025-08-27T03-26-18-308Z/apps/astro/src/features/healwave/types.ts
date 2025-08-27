export interface HealwaveSession {
  id: string;
  frequency: number;
  duration: number;
  startTime: Date;
  isActive: boolean;
}

export interface HealwaveState {
  currentFrequency: number;
  isPlaying: boolean;
  volume: number;
  duration: number;
  timeRemaining: number;
  sessions: HealwaveSession[];
}

export interface FrequencyPreset {
  name: string;
  value: number;
  description?: string;
  chakra?: string;
}
