import { InterpretationRequest } from './types';
export declare class XAIService {
    private static baseUrl;
    private static getApiKey;
    static generateInterpretation(request: InterpretationRequest): Promise<string>;
    private static buildPrompt;
    static generateMockInterpretation(request: InterpretationRequest): Promise<string>;
}
//# sourceMappingURL=xaiService.d.ts.map