// Migrated spiritual AI hook (originally in packages/shared/src/hooks/useSpiritualAI.ts)
// Keeping implementation duplicate temporarily until shared version is deprecated.
import { useState, useCallback, useRef, useEffect } from 'react';
import type {
	SpiritualAIService,
	SynthesisInput,
	SynthesisOutput,
	LearningPath,
	PatternAnalysis,
	SpiritualAIUserProfile as UserProfile,
	CurrentKnowledge,
	SpiritualAIError,
	SpiritualAIConfig,
	UseSpiritualAI,
} from '@cosmichub/types';

interface SpiritualAIHookOptions {
	config?: Partial<SpiritualAIConfig>;
	enableCaching?: boolean;
	autoRefresh?: boolean;
	refreshInterval?: number;
}

export function useSpiritualAI(
	options: SpiritualAIHookOptions = {}
): UseSpiritualAI {
	const defaultConfig: SpiritualAIConfig = {
		api_endpoint: '/api/spiritual-ai',
		timeout_ms: 30000,
		cache_duration_minutes: 15,
		enable_pattern_caching: true,
		max_synthesis_complexity: 10,
		safety_checks_enabled: true,
		...(options.config ?? {}),
	};

	const [synthesisData, setSynthesisData] = useState<SynthesisOutput | null>(null);
	const [synthesisLoading, setSynthesisLoading] = useState(false);
	const [synthesisError, setSynthesisError] = useState<SpiritualAIError | null>(null);
	const [learningPathData, setLearningPathData] = useState<LearningPath | null>(null);
	const [learningPathLoading, setLearningPathLoading] = useState(false);
	const [learningPathError, setLearningPathError] = useState<SpiritualAIError | null>(null);
	const [patternsData, setPatternsData] = useState<PatternAnalysis | null>(null);
	const [patternsLoading, setPatternsLoading] = useState(false);
	const [patternsError, setPatternsError] = useState<SpiritualAIError | null>(null);
	const [isConnected, setIsConnected] = useState(true);

	interface BaseCacheEntry { timestamp: number }
	interface SynthesisCacheEntry extends BaseCacheEntry { kind: 'synthesis'; data: SynthesisOutput }
	interface LearningPathCacheEntry extends BaseCacheEntry { kind: 'learningPath'; data: LearningPath }
	interface PatternsCacheEntry extends BaseCacheEntry { kind: 'patterns'; data: PatternAnalysis }
	type CacheValue = SynthesisCacheEntry | LearningPathCacheEntry | PatternsCacheEntry;
	const cacheRef = useRef(new Map<string, CacheValue>());
	const abortControllerRef = useRef<AbortController | null>(null);

	const getCachedData = useCallback(
		(key: string) => {
			if (!options.enableCaching) return null;
			const cached = cacheRef.current.get(key);
			if (!cached) return null;
			const isExpired = Date.now() - cached.timestamp > defaultConfig.cache_duration_minutes * 60 * 1000;
			if (isExpired) {
				cacheRef.current.delete(key);
				return null;
			}
			return cached.data;
		},
		[options.enableCaching, defaultConfig.cache_duration_minutes]
	);

	const setCachedData = useCallback(
		<K extends CacheValue['kind']>(key: string, kind: K, data: Extract<CacheValue, { kind: K }>['data']) => {
			if (!options.enableCaching) return;
			cacheRef.current.set(key, { kind, data, timestamp: Date.now() } as CacheValue);
		},
		[options.enableCaching]
	);

	const createCacheKey = useCallback((type: string, params: unknown) => {
		try { return `${type}_${JSON.stringify(params)}`; } catch { return `${type}`; }
	}, []);

	interface ApiSuccess<T> { success: true; data: T }
	interface ApiFailure { success: false; code?: string; message?: string }
	type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

	const makeAPICall = useCallback(async <T>(
		endpoint: string,
		payload: unknown,
		setLoading: (l: boolean) => void,
		setError: (e: SpiritualAIError | null) => void
	): Promise<T | null> => {
		try {
			setLoading(true); setError(null);
			if (abortControllerRef.current) abortControllerRef.current.abort();
			abortControllerRef.current = new AbortController();
			const response = await fetch(`${defaultConfig.api_endpoint}${endpoint}`, {
				method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: abortControllerRef.current.signal,
			});
			if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			const json = (await response.json()) as unknown;
			const result = json as ApiEnvelope<T>;
			if (!('success' in result)) throw new Error('Malformed API response');
			if (!result.success) throw new Error(result.message ?? result.code ?? 'API call failed');
			setIsConnected(true);
			return result.data;
		} catch (err) {
			const error = err as Error & { name?: string; code?: string };
			if (error.name === 'AbortError') return null;
			setError({
				code: (error as { code?: string }).code ?? 'UNKNOWN_ERROR',
				message: error.message ?? 'An unknown error occurred',
				details: { originalError: error },
				suggestions: ['Check your internet connection', 'Try again later'],
			});
			setIsConnected(false);
			return null;
		} finally { setLoading(false); }
	}, [defaultConfig.api_endpoint]);

	const synthesize = useCallback(async (input: SynthesisInput) => {
		const cacheKey = createCacheKey('synthesis', input);
		const cached = getCachedData(cacheKey);
		if (cached) { setSynthesisData(cached as SynthesisOutput); return; }
		const complexityScore = (input.birth_data.planets?.length ?? 0) + (input.birth_data.transits?.length ?? 0) + (input.spiritual_systems.kabbalah?.active_sephirot?.length ?? 0);
		if (complexityScore > defaultConfig.max_synthesis_complexity) {
			setSynthesisError({ code: 'COMPLEXITY_LIMIT_EXCEEDED', message: 'Input data is too complex for processing', suggestions: ['Reduce planets or transits', 'Simplify inputs'] });
			return; }
		const result = await makeAPICall<SynthesisOutput>('/synthesize', input, setSynthesisLoading, setSynthesisError);
		if (result) { setSynthesisData(result); setCachedData(cacheKey, 'synthesis', result); }
	}, [createCacheKey, getCachedData, setCachedData, makeAPICall, defaultConfig.max_synthesis_complexity]);

	const generatePath = useCallback(async (profile: UserProfile, knowledge: CurrentKnowledge) => {
		const cacheKey = createCacheKey('learning_path', { profile, knowledge });
		const cached = getCachedData(cacheKey);
		if (cached) { setLearningPathData(cached as LearningPath); return; }
		const result = await makeAPICall<LearningPath>( '/learning-path', { user_profile: profile, current_knowledge: knowledge }, setLearningPathLoading, setLearningPathError );
		if (result) { setLearningPathData(result); setCachedData(cacheKey, 'learningPath', result); }
	}, [createCacheKey, getCachedData, setCachedData, makeAPICall]);

	const analyzePatterns = useCallback(async (
		history: Parameters<SpiritualAIService['analyzePatterns']>[0],
		current: Parameters<SpiritualAIService['analyzePatterns']>[1]
	) => {
		if (!Array.isArray(history)) { setPatternsError({ code: 'INVALID_HISTORY', message: 'History must be an array' }); return; }
		const cacheKey = createCacheKey('patterns', { history: history.slice(-10), current });
		const cached = getCachedData(cacheKey);
		if (cached) { setPatternsData(cached as PatternAnalysis); return; }
		const result = await makeAPICall<PatternAnalysis>( '/patterns', { user_history: history, current_analysis: current }, setPatternsLoading, setPatternsError );
		if (result) { setPatternsData(result); setCachedData(cacheKey, 'patterns', result); }
	}, [createCacheKey, getCachedData, setCachedData, makeAPICall]);

	useEffect(() => {
		if (!options.autoRefresh || !options.refreshInterval) return;
		const interval = setInterval(() => { if (synthesisData) console.log('Auto-refresh synthesis'); if (patternsData) console.log('Auto-refresh patterns'); }, options.refreshInterval);
		return () => clearInterval(interval);
	}, [options.autoRefresh, options.refreshInterval, synthesisData, patternsData]);

	useEffect(() => () => { if (abortControllerRef.current) abortControllerRef.current.abort(); }, []);

	return { synthesis: { data: synthesisData, loading: synthesisLoading, error: synthesisError, synthesize }, learningPath: { data: learningPathData, loading: learningPathLoading, error: learningPathError, generatePath }, patterns: { data: patternsData, loading: patternsLoading, error: patternsError, analyzePatterns }, config: defaultConfig, isConnected };
}

export function useSpiritualSynthesis(input?: SynthesisInput) { const { synthesis } = useSpiritualAI(); useEffect(() => { if (input) void synthesis.synthesize(input); }, [input, synthesis.synthesize]); return synthesis; }
export function useLearningPath(profile?: UserProfile, knowledge?: CurrentKnowledge) { const { learningPath } = useSpiritualAI(); useEffect(() => { if (profile && knowledge) void learningPath.generatePath(profile, knowledge); }, [profile, knowledge, learningPath.generatePath]); return learningPath; }
export function usePatternAnalysis(history?: Parameters<SpiritualAIService['analyzePatterns']>[0], current?: Parameters<SpiritualAIService['analyzePatterns']>[1]) { const { patterns } = useSpiritualAI(); useEffect(() => { if (history && current) void patterns.analyzePatterns(history, current); }, [history, current, patterns.analyzePatterns]); return patterns; }
export function useSpiritualAIOptimized(_deps: unknown[] = []) { return useSpiritualAI({ enableCaching: true, autoRefresh: false }); }
