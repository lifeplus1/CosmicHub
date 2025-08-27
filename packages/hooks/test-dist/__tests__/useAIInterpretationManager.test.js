/**
 * useAIInterpretationManager Hook Tests
 * Comprehensive test suite for AI interpretation management functionality
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIInterpretationManager } from '../useAIInterpretationManager';
// Mock fetch globally
global.fetch = vi.fn();
// Mock IndexedDB
const mockIndexedDB = {
    open: vi.fn(),
    result: {
        objectStoreNames: { contains: vi.fn(() => false) },
        createObjectStore: vi.fn(() => ({
            createIndex: vi.fn(),
        })),
        transaction: vi.fn(() => ({
            objectStore: vi.fn(() => ({
                get: vi.fn(() => ({ onsuccess: vi.fn(), onerror: vi.fn() })),
                put: vi.fn(),
                clear: vi.fn(),
            })),
        })),
    },
};
// @ts-ignore
global.indexedDB = mockIndexedDB;
describe('useAIInterpretationManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset fetch mock
        global.fetch.mockReset();
        // Clear localStorage to prevent test interference
        localStorage.clear();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    describe('initialization', () => {
        it('should initialize with empty state', () => {
            const { result } = renderHook(() => useAIInterpretationManager());
            expect(result.current.interpretations).toEqual([]);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
            expect(result.current.queueLength).toBe(0);
            expect(result.current.isProcessingQueue).toBe(false);
        });
        it('should initialize with custom options', () => {
            const options = {
                enableCache: false,
                enableIndexedDB: false,
                maxQueueSize: 5,
                fallbackToMock: false,
            };
            const { result } = renderHook(() => useAIInterpretationManager(options));
            expect(result.current.interpretations).toEqual([]);
            expect(result.current.cacheStatus.memorySize).toBe(0);
        });
    });
    describe('request interpretation', () => {
        it('should add interpretation request to queue', () => {
            const { result } = renderHook(() => useAIInterpretationManager());
            const request = {
                chartId: 'test-chart-1',
                userId: 'test-user-1',
                interpretationType: 'general',
            };
            act(() => {
                result.current.requestInterpretation(request);
            });
            expect(result.current.queueLength).toBe(1);
        });
        it('should reject request when queue is full', () => {
            const { result } = renderHook(() => useAIInterpretationManager({ maxQueueSize: 1 }));
            const request1 = {
                chartId: 'test-chart-1',
                userId: 'test-user-1',
                interpretationType: 'general',
            };
            const request2 = {
                chartId: 'test-chart-2',
                userId: 'test-user-2',
                interpretationType: 'personality',
            };
            // Add first request (should succeed)
            act(() => {
                result.current.requestInterpretation(request1);
            });
            expect(result.current.queueLength).toBe(1);
            expect(result.current.error).toBeNull();
            // Add second request (should be rejected due to queue full)
            act(() => {
                result.current.requestInterpretation(request2);
            });
            expect(result.current.queueLength).toBe(1);
            expect(result.current.error).toContain('Queue is full');
        });
    });
    describe('API integration with fallback', () => {
        it('should use fallback when API fails', async () => {
            // Mock API failure
            global.fetch.mockRejectedValue(new Error('API Error'));
            const { result } = renderHook(() => useAIInterpretationManager({ fallbackToMock: true }));
            const request = {
                chartId: 'test-chart-1',
                userId: 'test-user-1',
                interpretationType: 'general',
            };
            act(() => {
                result.current.requestInterpretation(request);
            });
            // Wait for queue processing
            await waitFor(() => {
                expect(result.current.interpretations).toHaveLength(1);
            }, { timeout: 5000 });
            const interpretation = result.current.interpretations[0];
            expect(interpretation).toBeDefined();
            expect(interpretation.metadata?.source).toBe('mock');
            expect(interpretation.metadata?.fallback).toBe(true);
            expect(interpretation.chartId).toBe('test-chart-1');
            expect(interpretation.userId).toBe('test-user-1');
            expect(interpretation.type).toBe('general');
        });
        it('should use API when available', async () => {
            // Mock successful API response
            const mockInterpretation = {
                id: 'api-interpretation-1',
                chartId: 'test-chart-1',
                userId: 'test-user-1',
                type: 'general',
                title: 'General Interpretation',
                content: 'API-generated content',
                summary: 'API summary',
                confidence: 0.95,
                tags: ['api', 'generated'],
                createdAt: '2025-08-26T10:00:00Z',
                updatedAt: '2025-08-26T10:00:00Z',
            };
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: [mockInterpretation],
                }),
            });
            const { result } = renderHook(() => useAIInterpretationManager());
            const request = {
                chartId: 'test-chart-1',
                userId: 'test-user-1',
                interpretationType: 'general',
            };
            act(() => {
                result.current.requestInterpretation(request);
            });
            await waitFor(() => {
                expect(result.current.interpretations).toHaveLength(1);
            }, { timeout: 5000 });
            const interpretation = result.current.interpretations[0];
            expect(interpretation).toBeDefined();
            expect(interpretation.id).toBe('api-interpretation-1');
            expect(interpretation.content).toBe('API-generated content');
            expect(interpretation.confidence).toBe(0.95);
        });
    });
    describe('cache management', () => {
        it('should have initial cache status', () => {
            const { result } = renderHook(() => useAIInterpretationManager());
            expect(result.current.cacheStatus).toMatchObject({
                memorySize: 0,
                serverCacheSize: 0,
                indexedDBAvailable: expect.any(Boolean),
            });
        });
        it('should clear cache when requested', () => {
            const { result } = renderHook(() => useAIInterpretationManager());
            act(() => {
                result.current.clearCache();
            });
            expect(result.current.cacheStatus.memorySize).toBe(0);
            expect(result.current.cacheStatus.serverCacheSize).toBe(0);
        });
    });
    describe('interpretation retrieval', () => {
        it('should return interpretation by ID', async () => {
            global.fetch.mockRejectedValue(new Error('API Error'));
            const { result } = renderHook(() => useAIInterpretationManager({ fallbackToMock: true }));
            const request = {
                chartId: 'test-chart-1',
                userId: 'test-user-1',
                interpretationType: 'general',
            };
            act(() => {
                result.current.requestInterpretation(request);
            });
            await waitFor(() => {
                expect(result.current.interpretations).toHaveLength(1);
            });
            const interpretation = result.current.interpretations[0];
            expect(interpretation).toBeDefined();
            const retrievedInterpretation = result.current.getInterpretationById(interpretation.id);
            expect(retrievedInterpretation).toEqual(interpretation);
        });
        it('should return interpretations by chart ID', async () => {
            global.fetch.mockRejectedValue(new Error('API Error'));
            const { result } = renderHook(() => useAIInterpretationManager({ fallbackToMock: true }));
            // Clear any existing interpretations from previous tests
            act(() => {
                result.current.clearInterpretations();
            });
            const request1 = {
                chartId: 'test-chart-1',
                userId: 'test-user-1',
                interpretationType: 'general',
            };
            const request2 = {
                chartId: 'test-chart-1',
                userId: 'test-user-1',
                interpretationType: 'personality',
            };
            act(() => {
                result.current.requestInterpretation(request1);
            });
            await waitFor(() => {
                expect(result.current.interpretations).toHaveLength(1);
            });
            act(() => {
                result.current.requestInterpretation(request2);
            });
            await waitFor(() => {
                expect(result.current.interpretations).toHaveLength(2);
            });
            const chartInterpretations = result.current.getInterpretationsByChart('test-chart-1');
            expect(chartInterpretations).toHaveLength(2);
            expect(chartInterpretations.every(i => i.chartId === 'test-chart-1')).toBe(true);
        });
        it('should return null for non-existent interpretation ID', () => {
            const { result } = renderHook(() => useAIInterpretationManager());
            const retrievedInterpretation = result.current.getInterpretationById('non-existent-id');
            expect(retrievedInterpretation).toBe(null);
        });
    });
    describe('performance monitoring', () => {
        it('should provide performance metrics when enabled', () => {
            const { result } = renderHook(() => useAIInterpretationManager({ enablePerformanceMonitoring: true }));
            expect(result.current.performance).toBeDefined();
            expect(result.current.performance).toMatchObject({
                totalRequests: expect.any(Number),
                cacheHits: expect.any(Number),
                cacheHitRate: expect.any(Number),
                averageResponseTime: expect.any(Number),
                errorRate: expect.any(Number),
            });
        });
        it('should not provide performance metrics when disabled', () => {
            const { result } = renderHook(() => useAIInterpretationManager({ enablePerformanceMonitoring: false }));
            expect(result.current.performance).toBe(null);
        });
    });
    describe('multiple interpretation types', () => {
        it('should handle different interpretation types', async () => {
            global.fetch.mockRejectedValue(new Error('API Error'));
            const { result } = renderHook(() => useAIInterpretationManager({ fallbackToMock: true }));
            const types = [
                'general',
                'personality',
                'career',
                'relationships',
            ];
            // Request all types
            types.forEach(type => {
                act(() => {
                    result.current.requestInterpretation({
                        chartId: 'test-chart-1',
                        userId: 'test-user-1',
                        interpretationType: type,
                    });
                });
            });
            await waitFor(() => {
                expect(result.current.interpretations).toHaveLength(4);
            }, { timeout: 10000 });
            // Verify all types are present
            const interpretationTypes = result.current.interpretations.map(i => i.type);
            types.forEach(type => {
                expect(interpretationTypes).toContain(type);
            });
        });
    });
    describe('error handling', () => {
        it('should handle API errors gracefully when fallback is disabled', async () => {
            global.fetch.mockRejectedValue(new Error('API Error'));
            const { result } = renderHook(() => useAIInterpretationManager({ fallbackToMock: false }));
            const request = {
                chartId: 'test-chart-1',
                userId: 'test-user-1',
                interpretationType: 'general',
            };
            act(() => {
                result.current.requestInterpretation(request);
            });
            await waitFor(() => {
                expect(result.current.error).toContain('API Error');
            });
            expect(result.current.interpretations).toHaveLength(0);
        });
    });
    describe('clear interpretations', () => {
        it('should clear all interpretations', async () => {
            global.fetch.mockRejectedValue(new Error('API Error'));
            const { result } = renderHook(() => useAIInterpretationManager({ fallbackToMock: true }));
            const request = {
                chartId: 'test-chart-1',
                userId: 'test-user-1',
                interpretationType: 'general',
            };
            act(() => {
                result.current.requestInterpretation(request);
            });
            await waitFor(() => {
                expect(result.current.interpretations).toHaveLength(1);
            });
            act(() => {
                result.current.clearInterpretations();
            });
            expect(result.current.interpretations).toHaveLength(0);
            expect(result.current.error).toBe(null);
        });
    });
});
//# sourceMappingURL=useAIInterpretationManager.test.js.map