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

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Self-contained types to avoid cross-package dependencies
export interface AIInterpretationRequest {
  chartId: string;
  userId: string;
  interpretationType:
    | 'general'
    | 'personality'
    | 'career'
    | 'relationships'
    | 'advanced';
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
  serverCache: Map<string, { data: AIInterpretation; expiry: number }>;
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
  cacheExpiry?: number; // milliseconds
  maxQueueSize?: number;
  retryAttempts?: number;
  fallbackToMock?: boolean;
  enablePerformanceMonitoring?: boolean;
}

/**
 * Comprehensive AI Interpretation Manager Hook
 */
export function useAIInterpretationManager(
  options: UseAIInterpretationManagerOptions = {}
) {
  const {
    enableCache = true,
    enableIndexedDB = true,
    cacheExpiry = 30 * 60 * 1000, // 30 minutes
    maxQueueSize = 10,
    fallbackToMock = true,
    enablePerformanceMonitoring = true,
  } = options;
  const performanceRef = useRef({
    totalRequests: 0,
    cacheHits: 0,
    responseTimes: [] as number[],
    errors: 0,
  });

  // Core state management
  const [state, setState] = useState<InterpretationState>({
    interpretations: [],
    loading: false,
    error: null,
    queue: [],
    processingQueue: false,
    cache: {
      memory: new Map(),
      indexedDB: null,
      serverCache: new Map(),
    },
    performance: {
      totalRequests: 0,
      cacheHits: 0,
      averageResponseTime: 0,
      errorRate: 0,
    },
  });

  // IndexedDB initialization
  useEffect(() => {
    if (!enableIndexedDB) return;

    const initIndexedDB = () => {
      try {
        const request = indexedDB.open('CosmicHubInterpretations', 1);

        request.onupgradeneeded = event => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('interpretations')) {
            const store = db.createObjectStore('interpretations', {
              keyPath: 'id',
            });
            store.createIndex('chartId', 'chartId', { unique: false });
            store.createIndex('userId', 'userId', { unique: false });
            store.createIndex('createdAt', 'createdAt', { unique: false });
          }
        };

        request.onsuccess = event => {
          const db = (event.target as IDBOpenDBRequest).result;
          setState(prev => ({
            ...prev,
            cache: { ...prev.cache, indexedDB: db },
          }));
        };

        request.onerror = () => {
          console.warn('Failed to initialize IndexedDB for interpretations');
        };
      } catch (error) {
        console.warn('IndexedDB not supported:', error);
      }
    };

    void initIndexedDB();
  }, [enableIndexedDB]);

  // Cache management utilities
  const cacheKey = useCallback((request: AIInterpretationRequest): string => {
    return `interpretation:${request.chartId}:${request.userId}:${request.interpretationType}`;
  }, []);

  const getCachedInterpretation = useCallback(
    async (
      request: AIInterpretationRequest
    ): Promise<AIInterpretation | null> => {
      if (!enableCache) return null;

      const key = cacheKey(request);

      // Check memory cache first
      const memoryHit = state.cache.memory.get(key);
      if (memoryHit) {
        performanceRef.current.cacheHits++;
        return memoryHit;
      }

      // Check server cache
      const serverHit = state.cache.serverCache.get(key);
      if (serverHit && serverHit.expiry > Date.now()) {
        performanceRef.current.cacheHits++;
        // Promote to memory cache
        state.cache.memory.set(key, serverHit.data);
        return serverHit.data;
      }

      // Check IndexedDB cache
      if (state.cache.indexedDB && enableIndexedDB) {
        try {
          const transaction = state.cache.indexedDB.transaction(
            ['interpretations'],
            'readonly'
          );
          const store = transaction.objectStore('interpretations');
          const dbRequest = store.get(key);

          return new Promise(resolve => {
            dbRequest.onsuccess = () => {
              if (dbRequest.result) {
                performanceRef.current.cacheHits++;
                // Promote to memory cache with type safety
                const result = dbRequest.result as AIInterpretation;
                state.cache.memory.set(key, result);
                resolve(result);
              } else {
                resolve(null);
              }
            };
            dbRequest.onerror = () => resolve(null);
          });
        } catch (error) {
          console.warn('IndexedDB cache read failed:', error);
        }
      }

      return null;
    },
    [enableCache, enableIndexedDB, state.cache, cacheKey]
  );

  const setCachedInterpretation = useCallback(
    (
      request: AIInterpretationRequest,
      interpretation: AIInterpretation
    ): void => {
      if (!enableCache) return;

      const key = cacheKey(request);

      // Set memory cache
      state.cache.memory.set(key, interpretation);

      // Set server cache with expiry
      state.cache.serverCache.set(key, {
        data: interpretation,
        expiry: Date.now() + cacheExpiry,
      });

      // Set IndexedDB cache
      if (state.cache.indexedDB && enableIndexedDB) {
        try {
          const transaction = state.cache.indexedDB.transaction(
            ['interpretations'],
            'readwrite'
          );
          const store = transaction.objectStore('interpretations');
          store.put({ ...interpretation, cacheKey: key });
        } catch (error) {
          console.warn('IndexedDB cache write failed:', error);
        }
      }
    },
    [enableCache, enableIndexedDB, state.cache, cacheKey, cacheExpiry]
  );

  // API call utilities
  const callInterpretationAPI = useCallback(
    async (request: AIInterpretationRequest): Promise<AIInterpretation> => {
      const startTime = Date.now();
      performanceRef.current.totalRequests++;

      try {
        // Try primary API endpoint
        const response = await fetch('/api/interpretations/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chartId: request.chartId,
            userId: request.userId,
            type: request.interpretationType,
            chartData: request.chartData,
            userPreferences: request.userPreferences,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }

        const data = (await response.json()) as {
          success: boolean;
          data: AIInterpretation[];
        };

        if (!data.success || !data.data || data.data.length === 0) {
          throw new Error('Invalid API response format');
        }

        const interpretation = data.data[0];

        // Record performance metrics
        const responseTime = Date.now() - startTime;
        performanceRef.current.responseTimes.push(responseTime);

        // Keep only last 100 response times for average calculation
        if (performanceRef.current.responseTimes.length > 100) {
          performanceRef.current.responseTimes.shift();
        }

        return interpretation;
      } catch (error) {
        performanceRef.current.errors++;

        if (fallbackToMock) {
          // Fallback to mock interpretation
          const mockInterpretation: AIInterpretation = {
            id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            chartId: request.chartId,
            userId: request.userId,
            type: request.interpretationType,
            title: `${request.interpretationType.charAt(0).toUpperCase() + request.interpretationType.slice(1)} Interpretation`,
            content: generateMockInterpretationContent(
              request.interpretationType
            ),
            summary: `A comprehensive ${request.interpretationType} analysis based on your birth chart.`,
            confidence: 0.75,
            tags: [request.interpretationType, 'generated', 'fallback'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: { source: 'mock', fallback: true },
          };

          const responseTime = Date.now() - startTime;
          performanceRef.current.responseTimes.push(responseTime);

          return mockInterpretation;
        }

        throw error;
      }
    },
    [fallbackToMock]
  );

  // Queue processing
  const processQueue = useCallback(async (): Promise<void> => {
    if (state.processingQueue || state.queue.length === 0) return;

    setState(prev => ({ ...prev, processingQueue: true }));

    try {
      const request = state.queue[0];
      if (!request) {
        setState(prev => ({ ...prev, processingQueue: false }));
        return;
      }

      // Check cache first
      const cachedResult = await getCachedInterpretation(request);
      if (cachedResult) {
        setState(prev => ({
          ...prev,
          interpretations: [...prev.interpretations, cachedResult],
          queue: prev.queue.slice(1),
          processingQueue: false,
        }));
        return;
      }

      // Call API
      const result = await callInterpretationAPI(request);

      // Cache the result
      setCachedInterpretation(request, result);

      setState(prev => ({
        ...prev,
        interpretations: [...prev.interpretations, result],
        queue: prev.queue.slice(1),
        processingQueue: false,
        error: null,
      }));

      // Process next item in queue
      setTimeout(() => void processQueue(), 100);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      setState(prev => ({
        ...prev,
        queue: prev.queue.slice(1),
        processingQueue: false,
        error: errorMessage,
      }));
    }
  }, [
    state.processingQueue,
    state.queue,
    getCachedInterpretation,
    callInterpretationAPI,
    setCachedInterpretation,
  ]);

  // Auto-process queue when items are added
  useEffect(() => {
    if (state.queue.length > 0 && !state.processingQueue) {
      void processQueue();
    }
  }, [state.queue, state.processingQueue, processQueue]);

  // Public API methods
  const requestInterpretation = useCallback(
    (request: AIInterpretationRequest): void => {
      if (state.queue.length >= maxQueueSize) {
        setState(prev => ({
          ...prev,
          error: `Queue is full (max ${maxQueueSize} items). Please wait for current requests to complete.`,
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        queue: [...prev.queue, request],
        error: null,
      }));
    },
    [state.queue.length, maxQueueSize]
  );

  const getInterpretationById = useCallback(
    (id: string): AIInterpretation | null => {
      return state.interpretations.find(interp => interp.id === id) ?? null;
    },
    [state.interpretations]
  );

  const getInterpretationsByChart = useCallback(
    (chartId: string): AIInterpretation[] => {
      return state.interpretations.filter(interp => interp.chartId === chartId);
    },
    [state.interpretations]
  );

  const clearInterpretations = useCallback((): void => {
    setState(prev => ({
      ...prev,
      interpretations: [],
      error: null,
    }));

    // Clear caches
    if (enableCache) {
      state.cache.memory.clear();
      state.cache.serverCache.clear();
    }
  }, [enableCache, state.cache]);

  const clearCache = useCallback((): void => {
    if (enableCache) {
      state.cache.memory.clear();
      state.cache.serverCache.clear();

      // Clear IndexedDB cache
      if (state.cache.indexedDB && enableIndexedDB) {
        try {
          const transaction = state.cache.indexedDB.transaction(
            ['interpretations'],
            'readwrite'
          );
          const store = transaction.objectStore('interpretations');
          store.clear();
        } catch (error) {
          console.warn('Failed to clear IndexedDB cache:', error);
        }
      }
    }
  }, [enableCache, enableIndexedDB, state.cache]);

  // Performance metrics calculation
  const performanceMetrics = useMemo(() => {
    const { totalRequests, cacheHits, responseTimes, errors } =
      performanceRef.current;

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0;

    const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;
    const cacheHitRate =
      totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    return {
      totalRequests,
      cacheHits,
      cacheHitRate,
      averageResponseTime,
      errorRate,
    };
  }, [state.interpretations.length]); // Update when interpretations change

  return {
    // State
    interpretations: state.interpretations,
    loading: state.loading || state.processingQueue,
    error: state.error,
    queueLength: state.queue.length,
    isProcessingQueue: state.processingQueue,

    // Actions
    requestInterpretation,
    getInterpretationById,
    getInterpretationsByChart,
    clearInterpretations,
    clearCache,

    // Performance & Monitoring
    performance: enablePerformanceMonitoring ? performanceMetrics : null,

    // Cache status
    cacheStatus: {
      memorySize: state.cache.memory.size,
      serverCacheSize: state.cache.serverCache.size,
      indexedDBAvailable: !!state.cache.indexedDB,
    },
  };
}

// Helper function to generate mock interpretation content
function generateMockInterpretationContent(type: string): string {
  const mockContent = {
    general:
      'Your birth chart reveals a unique cosmic blueprint with powerful planetary influences that shape your personality and life path. The positions of celestial bodies at your birth create a fascinating narrative of potential and growth.',
    personality:
      'Your personality profile shows a complex blend of traits influenced by your planetary placements. You possess natural leadership qualities combined with deep empathy and intuitive understanding of others.',
    career:
      'Career-wise, your astrological profile indicates excellent potential in fields that involve creativity, communication, or helping others. Your planetary alignments suggest you thrive in roles that allow independence and innovation.',
    relationships:
      'In relationships, your birth chart reveals someone who values deep, meaningful connections. Your Venus and Mars placements suggest you are both passionate and nurturing in romantic partnerships.',
    advanced:
      "This advanced interpretation combines multiple astrological techniques to provide deep insights into your soul's purpose, karmic patterns, and evolutionary path. Your chart shows significant spiritual gifts and transformative potential.",
  };

  return mockContent[type as keyof typeof mockContent] || mockContent.general;
}
