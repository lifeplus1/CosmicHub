/**
 * useAIInterpretationManager Hook - Comprehensive AI Interpretation Management
 *
 * Provides enterprise-grade AI interpretation management with:
 * - Multi-level caching (memory, IndexedDB, server)
 * - Complex state normalization from different sources
 * - API orchestration for REST and WebSocket endpoints
 * - Advanced error recovery and fallback mechanisms
 * - Cross-component state management
 * - Performance monitoring and optimization
 *
 * This hook consolidates all AI interpretation logic that was previously
 * scattered across components and provides a unified management interface.
 */
export interface AIInterpretationRequest {
    chartId: string;
    userId: string;
    interpretationType: 'general' | 'personality' | 'career' | 'relationships' | 'advanced';
    chartData?: Record<string, unknown>;
    userPreferences?: Record<string, unknown>;
    priority?: 'low' | 'normal' | 'high';
}
export interface AIInterpretation {
    id: string;
    chartId: string;
    userId: string;
    type: string;
    title: string;
    content: string;
    summary: string;
    confidence: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, unknown>;
}
export interface InterpretationCache {
    memory: Map<string, AIInterpretation>;
    indexedDB: IDBDatabase | null;
    serverCache: Map<string, {
        data: AIInterpretation;
        expiry: number;
    }>;
}
export interface InterpretationState {
    interpretations: AIInterpretation[];
    loading: boolean;
    error: string | null;
    queue: AIInterpretationRequest[];
    processingQueue: boolean;
    cache: InterpretationCache;
    performance: {
        totalRequests: number;
        cacheHits: number;
        averageResponseTime: number;
        errorRate: number;
    };
}
export interface UseAIInterpretationManagerOptions {
    enableCache?: boolean;
    enableIndexedDB?: boolean;
    enableWebSocket?: boolean;
    cacheExpiry?: number;
    maxQueueSize?: number;
    retryAttempts?: number;
    fallbackToMock?: boolean;
    enablePerformanceMonitoring?: boolean;
}
/**
 * Comprehensive AI Interpretation Manager Hook
 */
export declare function useAIInterpretationManager(options?: UseAIInterpretationManagerOptions): {
    interpretations: AIInterpretation[];
    loading: boolean;
    error: string | null;
    queueLength: number;
    isProcessingQueue: boolean;
    requestInterpretation: (request: AIInterpretationRequest) => void;
    getInterpretationById: (id: string) => AIInterpretation | null;
    getInterpretationsByChart: (chartId: string) => AIInterpretation[];
    clearInterpretations: () => void;
    clearCache: () => void;
    performance: {
        totalRequests: number;
        cacheHits: number;
        cacheHitRate: number;
        averageResponseTime: number;
        errorRate: number;
    } | null;
    cacheStatus: {
        memorySize: number;
        serverCacheSize: number;
        indexedDBAvailable: boolean;
    };
};
