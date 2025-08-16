/**
 * Shared types for AI interpretation service
 */
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
//# sourceMappingURL=types.d.ts.map