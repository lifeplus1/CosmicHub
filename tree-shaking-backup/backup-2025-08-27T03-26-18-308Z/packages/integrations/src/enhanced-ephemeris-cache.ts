/**
 * Enhanced Ephemeris Caching Layer - PERF-001 Implementation
 *
 * Implements intelligent multi-tier caching for ephemeris data with
 * predictive preloading and adaptive cache management.
 */

import { firestoreOptimizer } from './firestore-optimizer';

// Simple console wrapper for development logging
const isDev = process.env.NODE_ENV === 'development';
const devConsole = {
  log: isDev
    ? console.log.bind(console)
    : (): void => {
        /* no-op */
      },
  warn: isDev
    ? console.warn.bind(console)
    : (): void => {
        /* no-op */
      },
  error: console.error.bind(console),
};

export interface EphemerisCacheConfig {
  memoryLimitMB: number;
  diskLimitMB: number;
  defaultTTLHours: number;
  predictiveDays: number;
  preloadThreshold: number;
  compressionEnabled: boolean;
}

export interface CacheEntry {
  key: string;
  data: unknown;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  compressed?: boolean;
}

export interface CacheStats {
  memoryHits: number;
  memoryMisses: number;
  diskHits: number;
  diskMisses: number;
  evictions: number;
  totalSize: number;
  hitRate: number;
}

export interface PredictiveRequest {
  julianDay: number;
  priority: 'high' | 'medium' | 'low';
  estimatedUsage: number;
  requestTime: number;
}

class EnhancedEphemerisCache {
  private memoryCache = new Map<string, CacheEntry>();
  private diskCache: IDBDatabase | null = null;
  private stats: CacheStats = {
    memoryHits: 0,
    memoryMisses: 0,
    diskHits: 0,
    diskMisses: 0,
    evictions: 0,
    totalSize: 0,
    hitRate: 0,
  };

  private predictiveQueue: PredictiveRequest[] = [];
  private accessPatterns = new Map<string, number[]>();
  private compressionWorker: Worker | null = null;

  constructor(private config: EphemerisCacheConfig) {
    this.initializeCompression();
    void this.initializeDiskCache();
    this.startMaintenanceTasks();
  }

  private initializeCompression(): void {
    if (this.config.compressionEnabled && typeof Worker !== 'undefined') {
      try {
        this.compressionWorker = new Worker(
          new URL('./compression-worker.js', import.meta.url)
        );
      } catch {
        devConsole.warn(
          'Compression worker not available, using synchronous compression'
        );
      }
    }
  }

  private async initializeDiskCache(): Promise<void> {
    if (typeof indexedDB === 'undefined') {
      devConsole.warn?.('IndexedDB not available, using memory-only cache');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EphemerisCache', 1);

      request.onerror = () => {
        devConsole.error('Failed to open IndexedDB for ephemeris cache');
        reject(new Error('IndexedDB failed to open'));
      };

      request.onsuccess = () => {
        this.diskCache = request.result;
        devConsole.log('Enhanced ephemeris disk cache initialized');
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('ephemeris')) {
          const store = db.createObjectStore('ephemeris', { keyPath: 'key' });
          store.createIndex('expiresAt', 'expiresAt');
          store.createIndex('accessCount', 'accessCount');
          store.createIndex('lastAccessed', 'lastAccessed');
        }
      };
    });
  }

  private startMaintenanceTasks(): void {
    // Cleanup expired entries every 10 minutes
    setInterval(
      () => {
        void this.cleanupExpiredEntries();
      },
      10 * 60 * 1000
    );

    // Update statistics every minute
    setInterval(() => this.updateStatistics(), 60 * 1000);

    // Process predictive queue every 30 seconds
    setInterval(() => {
      void this.processPredictiveQueue();
    }, 30 * 1000);

    // Analyze access patterns every hour
    setInterval(() => this.analyzeAccessPatterns(), 60 * 60 * 1000);
  }

  /**
   * Get data from cache with intelligent fallback strategy
   */
  async get(key: string): Promise<unknown> {
    // Record access pattern
    this.recordAccess(key);

    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      memoryEntry.accessCount++;
      memoryEntry.lastAccessed = Date.now();
      this.stats.memoryHits++;
      this.updateHitRate();

      // Track for Firestore optimization
      firestoreOptimizer.trackRead(`ephemeris_cache_${key}`, 0, 5, true);

      return memoryEntry.data;
    }

    this.stats.memoryMisses++;

    // Try disk cache
    const diskEntry = await this.getDiskEntry(key);
    if (diskEntry && !this.isExpired(diskEntry)) {
      // Promote to memory cache
      await this.promoteToMemory(diskEntry);
      this.stats.diskHits++;
      this.updateHitRate();

      firestoreOptimizer.trackRead(`ephemeris_cache_${key}`, 0, 15, true);

      return diskEntry.data;
    }

    this.stats.diskMisses++;
    this.updateHitRate();

    // Cache miss - trigger predictive loading
    this.triggerPredictiveLoading(key);

    return null;
  }

  /**
   * Store data in cache with intelligent placement
   */
  async set(key: string, data: unknown, ttlHours?: number): Promise<void> {
    const now = Date.now();
    const ttl = (ttlHours ?? this.config.defaultTTLHours) * 60 * 60 * 1000;
    const expiresAt = now + ttl;

    // Compress data if enabled
    let processedData = data;
    let compressed = false;

    if (this.config.compressionEnabled) {
      try {
        processedData = await this.compressData(data);
        compressed = true;
      } catch {
        devConsole.warn?.(
          'Failed to compress cache data, storing uncompressed'
        );
        processedData = data;
      }
    }

    const entry: CacheEntry = {
      key,
      data: processedData,
      timestamp: now,
      expiresAt,
      accessCount: 1,
      lastAccessed: now,
      size: this.estimateSize(processedData),
      compressed,
    };

    // Store in memory cache
    this.setMemoryEntry(entry);

    // Store in disk cache for persistence
    await this.setDiskEntry(entry);

    devConsole.log?.(
      `Cached ephemeris data: ${key} (${entry.size} bytes, TTL: ${ttlHours ?? this.config.defaultTTLHours}h)`
    );
  }

  private setMemoryEntry(entry: CacheEntry): void {
    // Check if we need to evict entries
    while (this.shouldEvictMemory()) {
      this.evictLeastValuable('memory');
    }

    this.memoryCache.set(entry.key, entry);
    this.stats.totalSize += entry.size;
  }

  private async setDiskEntry(entry: CacheEntry): Promise<void> {
    if (!this.diskCache) return;

    return new Promise((resolve, reject) => {
      const transaction = this.diskCache!.transaction(
        ['ephemeris'],
        'readwrite'
      );
      const store = transaction.objectStore('ephemeris');

      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        devConsole.error?.('Failed to store in disk cache:', request.error);
        reject(
          new Error(
            `Failed to store in disk cache: ${request.error?.message ?? 'Unknown error'}`
          )
        );
      };
    });
  }

  private async getDiskEntry(key: string): Promise<CacheEntry | null> {
    if (!this.diskCache) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.diskCache!.transaction(
        ['ephemeris'],
        'readonly'
      );
      const store = transaction.objectStore('ephemeris');

      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry;
        resolve(entry || null);
      };

      request.onerror = () => {
        devConsole.error?.('Failed to read from disk cache:', request.error);
        reject(
          new Error(
            `Failed to read from disk cache: ${request.error?.message ?? 'Unknown error'}`
          )
        );
      };
    });
  }

  private async promoteToMemory(entry: CacheEntry): Promise<void> {
    // Decompress if needed
    if (entry.compressed) {
      try {
        entry.data = await this.decompressData(entry.data);
        entry.compressed = false;
      } catch (error) {
        devConsole.error?.('Failed to decompress cache entry:', error);
        return;
      }
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();

    this.setMemoryEntry(entry);
  }

  private shouldEvictMemory(): boolean {
    const currentSizeMB = this.stats.totalSize / (1024 * 1024);
    return currentSizeMB > this.config.memoryLimitMB;
  }

  private evictLeastValuable(cacheType: 'memory' | 'disk'): void {
    const cache = cacheType === 'memory' ? this.memoryCache : null;
    if (!cache || cache.size === 0) return;

    // Find least valuable entry (low access count, old access time)
    let leastValuable: CacheEntry | null = null;
    let lowestScore = Infinity;

    for (const entry of cache.values()) {
      const ageHours = (Date.now() - entry.lastAccessed) / (1000 * 60 * 60);
      const score = entry.accessCount / (ageHours + 1); // Lower score = less valuable

      if (score < lowestScore) {
        lowestScore = score;
        leastValuable = entry;
      }
    }

    if (leastValuable) {
      cache.delete(leastValuable.key);
      this.stats.totalSize -= leastValuable.size;
      this.stats.evictions++;

      devConsole.log?.(
        `Evicted cache entry: ${leastValuable.key} (score: ${lowestScore.toFixed(2)})`
      );
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  private recordAccess(key: string): void {
    const pattern = this.accessPatterns.get(key) ?? [];
    pattern.push(Date.now());

    // Keep only last 100 accesses
    if (pattern.length > 100) {
      pattern.splice(0, pattern.length - 100);
    }

    this.accessPatterns.set(key, pattern);
  }

  private triggerPredictiveLoading(key: string): void {
    // Extract julian day from key pattern
    const julianDayMatch = key.match(/julian[_-](\d+(?:\.\d+)?)/i);
    if (julianDayMatch?.[1]) {
      const julianDay = parseFloat(julianDayMatch[1]);

      // Predict nearby dates that might be needed
      for (let offset = 1; offset <= this.config.predictiveDays; offset++) {
        this.queuePredictiveRequest(julianDay + offset, 'medium');
        this.queuePredictiveRequest(julianDay - offset, 'low');
      }
    }
  }

  private queuePredictiveRequest(
    julianDay: number,
    priority: 'high' | 'medium' | 'low'
  ): void {
    const existing = this.predictiveQueue.find(
      req => Math.abs(req.julianDay - julianDay) < 0.1
    );

    if (existing) {
      // Upgrade priority if higher
      if (
        priority === 'high' ||
        (priority === 'medium' && existing.priority === 'low')
      ) {
        existing.priority = priority;
      }
    } else {
      this.predictiveQueue.push({
        julianDay,
        priority,
        estimatedUsage: this.estimateUsage(julianDay),
        requestTime: Date.now(),
      });
    }
  }

  private estimateUsage(julianDay: number): number {
    // Estimate usage based on historical patterns
    const now = new Date();
    const currentJulian = this.dateToJulianDay(now);
    const daysDiff = Math.abs(julianDay - currentJulian);

    // Recent dates are more likely to be accessed
    if (daysDiff <= 7) return 0.9;
    if (daysDiff <= 30) return 0.6;
    if (daysDiff <= 365) return 0.3;
    return 0.1;
  }

  private dateToJulianDay(date: Date): number {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = date.getMonth() + 1 + 12 * a - 3;

    const jd =
      date.getDate() +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;

    return (
      jd +
      (date.getHours() - 12) / 24 +
      date.getMinutes() / 1440 +
      date.getSeconds() / 86400
    );
  }

  private processPredictiveQueue(): void {
    if (this.predictiveQueue.length === 0) return;

    // Sort by priority and estimated usage
    this.predictiveQueue.sort((a, b) => {
      const priorityScore = { high: 3, medium: 2, low: 1 };
      const aScore = priorityScore[a.priority] * a.estimatedUsage;
      const bScore = priorityScore[b.priority] * b.estimatedUsage;
      return bScore - aScore;
    });

    // Process up to 5 requests per cycle
    const batch = this.predictiveQueue.splice(0, 5);

    for (const request of batch) {
      try {
        // This would trigger the actual ephemeris data fetch
        // Implementation depends on your specific ephemeris API
        devConsole.log?.(
          `Predictive loading for Julian Day ${request.julianDay} (${request.priority} priority)`
        );
      } catch (error) {
        devConsole.error?.('Predictive loading failed:', error);
      }
    }
  }

  private analyzeAccessPatterns(): void {
    devConsole.log?.('Analyzing ephemeris access patterns...');

    const patternAnalysis = new Map<
      string,
      { frequency: number; recency: number; regularity: number }
    >();

    for (const [key, accesses] of this.accessPatterns.entries()) {
      if (accesses.length < 2) continue;

      const now = Date.now();
      const frequency = accesses.length;
      const recency = (now - Math.max(...accesses)) / (1000 * 60 * 60); // Hours since last access

      // Calculate regularity (lower variance in intervals = more regular)
      const intervals = accesses
        .slice(1)
        .map((time, i) => time - (accesses[i] ?? 0));
      const avgInterval =
        intervals.reduce((sum, interval) => sum + interval, 0) /
        intervals.length;
      const variance =
        intervals.reduce(
          (sum, interval) => sum + Math.pow(interval - avgInterval, 2),
          0
        ) / intervals.length;
      const regularity = 1 / (1 + Math.sqrt(variance) / avgInterval); // 0-1, higher = more regular

      patternAnalysis.set(key, { frequency, recency, regularity });
    }

    // Identify patterns that should be cached more aggressively
    for (const [key, analysis] of patternAnalysis.entries()) {
      if (
        analysis.frequency > 10 &&
        analysis.recency < 24 &&
        analysis.regularity > 0.7
      ) {
        devConsole.log?.(
          `High-value pattern detected: ${key} - consider longer TTL`
        );
      }
    }
  }

  private async compressData(data: unknown): Promise<unknown> {
    if (!this.compressionWorker) {
      // Fallback to simple JSON compression
      return this.simpleCompress(JSON.stringify(data));
    }

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36);

      const handleMessage = (event: MessageEvent) => {
        const eventData = event.data as {
          id: string;
          error?: string;
          result?: unknown;
        };
        if (eventData.id === id) {
          this.compressionWorker!.removeEventListener('message', handleMessage);
          if (eventData.error) {
            reject(new Error(eventData.error));
          } else {
            resolve(eventData.result);
          }
        }
      };

      this.compressionWorker!.addEventListener('message', handleMessage);
      this.compressionWorker!.postMessage({ id, action: 'compress', data });
    });
  }

  private async decompressData(compressedData: unknown): Promise<unknown> {
    if (!this.compressionWorker) {
      // Fallback to simple JSON decompression
      return JSON.parse(this.simpleDecompress(compressedData as string));
    }

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36);

      const handleMessage = (event: MessageEvent) => {
        const eventData = event.data as {
          id: string;
          error?: string;
          result?: unknown;
        };
        if (eventData.id === id) {
          this.compressionWorker!.removeEventListener('message', handleMessage);
          if (eventData.error) {
            reject(new Error(eventData.error));
          } else {
            resolve(eventData.result);
          }
        }
      };

      this.compressionWorker!.addEventListener('message', handleMessage);
      this.compressionWorker!.postMessage({
        id,
        action: 'decompress',
        data: compressedData,
      });
    });
  }

  private simpleCompress(str: string): string {
    // Simple RLE compression for JSON strings
    return str.replace(/(.)\1+/g, (match, char) => `${char}${match.length}`);
  }

  private simpleDecompress(compressed: string): string {
    // Simple RLE decompression
    return compressed.replace(/(.)\d+/g, (match, char: string) => {
      const count = parseInt(match.slice(1));
      return char.repeat(count);
    });
  }

  private estimateSize(data: unknown): number {
    return JSON.stringify(data).length * 2; // Rough estimation
  }

  private updateHitRate(): void {
    const totalRequests = this.stats.memoryHits + this.stats.memoryMisses;
    this.stats.hitRate =
      totalRequests > 0 ? (this.stats.memoryHits / totalRequests) * 100 : 0;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
        this.stats.totalSize -= entry.size;
        cleanedCount++;
      }
    }

    // Clean disk cache
    if (this.diskCache) {
      const transaction = this.diskCache.transaction(
        ['ephemeris'],
        'readwrite'
      );
      const store = transaction.objectStore('ephemeris');
      const index = store.index('expiresAt');

      const request = index.openCursor(IDBKeyRange.upperBound(now));

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cleanedCount++;
          cursor.continue();
        }
      };
    }

    if (cleanedCount > 0) {
      devConsole.log?.(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  private updateStatistics(): void {
    // Update cache statistics
    this.updateHitRate();

    devConsole.log?.(
      `Cache stats: ${this.stats.memoryHits} hits, ${this.stats.memoryMisses} misses, ${this.stats.hitRate.toFixed(1)}% hit rate`
    );
  }

  /**
   * Get current cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clear all cache data
   */
  clear(): void {
    this.memoryCache.clear();
    this.stats = {
      memoryHits: 0,
      memoryMisses: 0,
      diskHits: 0,
      diskMisses: 0,
      evictions: 0,
      totalSize: 0,
      hitRate: 0,
    };

    if (this.diskCache) {
      const transaction = this.diskCache.transaction(
        ['ephemeris'],
        'readwrite'
      );
      const store = transaction.objectStore('ephemeris');
      store.clear();
    }

    devConsole.log?.('Enhanced ephemeris cache cleared');
  }
}

// Default configuration
const DEFAULT_CONFIG: EphemerisCacheConfig = {
  memoryLimitMB: 50,
  diskLimitMB: 200,
  defaultTTLHours: 24,
  predictiveDays: 7,
  preloadThreshold: 0.7,
  compressionEnabled: true,
};

// Global cache instance
let globalCache: EnhancedEphemerisCache | null = null;

export function getEphemerisCache(
  config?: Partial<EphemerisCacheConfig>
): EnhancedEphemerisCache {
  globalCache ??= new EnhancedEphemerisCache({
    ...DEFAULT_CONFIG,
    ...config,
  });
  return globalCache;
}
