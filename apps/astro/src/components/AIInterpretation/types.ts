export interface AIInterpretationData {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

export interface Interpretation {
  id: string;
  chartId: string;
  userId: string;
  type: string; // e.g., 'natal', 'transit', 'synastry', 'composite'
  title: string;
  content: string;
  summary: string;
  tags: string[];
  confidence: number; // 0-1 confidence score
  createdAt: string;
  updatedAt: string;
}

export interface ChartInterpretationRequest {
  chartId: string;
  userId: string;
  type?: string;
  focus?: string[]; // Areas to focus on: planets, houses, aspects
}

export interface ChartInterpretationResponse {
  data: Interpretation[];
  success: boolean;
  message?: string;
}

// AI Service types (inline for now)
export interface InterpretationRequest {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  interpretationType: 'general' | 'personality' | 'career' | 'relationships';
}

export interface InterpretationResponse {
  interpretation: string;
}

export interface AIServiceError {
  message: string;
  code?: string;
  statusCode?: number;
}

// Modal component types
export interface InterpretationModalProps {
  interpretation: Interpretation;
  isOpen: boolean;
  onClose: () => void;
}
