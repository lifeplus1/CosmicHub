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

export interface InterpretationRequest {
  chartId: string;
  userId: string;
  type?: string;
  focus?: string[]; // Areas to focus on: planets, houses, aspects
}

export interface InterpretationResponse {
  data: Interpretation[];
  success: boolean;
  message?: string;
}