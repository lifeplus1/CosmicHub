export declare const API_ENDPOINTS: {
    readonly astrology: "/api/astrology";
    readonly healwave: "/api/healwave";
    readonly numerology: "/api/numerology";
    readonly humanDesign: "/api/human-design";
};
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
export declare function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>>;
//# sourceMappingURL=api.d.ts.map