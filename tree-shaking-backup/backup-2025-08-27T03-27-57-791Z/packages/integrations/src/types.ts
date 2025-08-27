/**
 * Shared types for AI interpretation service
 */

export interface InterpretationRequest {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  interpretationType: 'general' | 'personality' | 'career' | 'relationships';
}

}

  code?: string;
  statusCode?: number;
}
