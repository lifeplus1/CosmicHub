/**
 * Advanced Caching and Service Worker Implementation
 * Implements sophisticated caching strategies and offline capabilities
 */

// Cache configuration types
export interface CacheStrategy {
  name: string;
  pattern: RegExp | string;
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only' | 'cache-only';
  maxAge?: number;
  maxEntries?: number;
  networkTimeoutSeconds?: number;
  cacheName?: string;
  plugins?: CachePlugin[];
}

export interface CachePlugin {
  cacheKeyWillBeUsed?: (request: Request) => Promise<string>;
  cachedResponseWillBeUsed?: (response: Response) => Promise<Response | null>;
  requestWillFetch?: (request: Request) => Promise<Request>;
  fetchDidFail?: (request: Request, error: Error) => Promise<void>;
  cacheDidUpdate?: (cacheName: string, request: Request, oldResponse?: Response, newResponse?: Response) => Promise<void>;
}

export interface ServiceWorkerConfig {
  scope: string;
  cacheStrategies: CacheStrategy[];
  offlinePages: string[];
  backgroundSync: BackgroundSyncConfig[];
  pushNotifications: PushNotificationConfig;
  updateStrategy: 'immediate' | 'on-next-visit' | 'prompt-user';
  skipWaiting: boolean;
  clientsClaim: boolean;
}

export interface BackgroundSyncConfig {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  maxRetries: number;
  retryDelay: number;
}

export interface PushNotificationConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
  enabled: boolean;
}

// Advanced cache manager
export class CacheManager {
  private static instance: CacheManager;
  private strategies = new Map<string, CacheStrategy>();
  private caches = new Map<string, Cache>();
  private performance = new Map<string, { hits: number; misses: number; size: number }>();

  static getInstance(): CacheManager {
    CacheManager.instance ??= new CacheManager();
    return CacheManager.instance;
  }

  async initialize(strategies: CacheStrategy[]): Promise<void> {
    console.log('🗄️ Initializing advanced cache manager...');

    for (const strategy of strategies) {
      this.strategies.set(strategy.name, strategy);
      
      if (strategy.cacheName) {
        const cache = await caches.open(strategy.cacheName);
        this.caches.set(strategy.cacheName, cache);
        
        // Initialize performance tracking
        this.performance.set(strategy.cacheName, { hits: 0, misses: 0, size: 0 });
      }
    }

    await this.cleanupOldCaches();
    await this.preloadCriticalResources();
  }

  async get(request: Request | string): Promise<Response | null> {
    const requestKey = typeof request === 'string' ? request : request.url;
    const strategy = this.findMatchingStrategy(requestKey);
    if (strategy === null || strategy === undefined) {
      return null;
    }

    const cache = this.caches.get(strategy.cacheName!);
    if (cache === undefined) {
      return null;
    }

    try {
      switch (strategy.strategy) {
        case 'cache-first':
          return await this.cacheFirstStrategy(request, cache, strategy);
        case 'network-first':
          return await this.networkFirstStrategy(request, cache, strategy);
        case 'stale-while-revalidate':
          return await this.staleWhileRevalidateStrategy(request, cache, strategy);
        case 'network-only':
          return await this.networkOnlyStrategy(request);
        case 'cache-only':
          return await this.cacheOnlyStrategy(request, cache);
        default:
          return await this.networkFirstStrategy(request, cache, strategy);
      }
    } catch (error) {
      console.error('Cache operation failed:', error);
      return null;
    }
  }

  private async cacheFirstStrategy(
    request: Request | string, 
    cache: Cache, 
    strategy: CacheStrategy
  ): Promise<Response | null> {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      this.recordCacheHit(strategy.cacheName!);
      
      // Check if cache is stale
      if (this.isCacheStale(cachedResponse, strategy.maxAge)) {
        // Refresh in background - properly handle the promise
        void this.refreshCacheInBackground(request, cache, strategy);
      }
      
      return cachedResponse;
    }

    // Not in cache, try network
    try {
      const networkResponse = await this.fetchWithTimeout(request, strategy.networkTimeoutSeconds);
      
      if (networkResponse?.ok) {
        await this.putInCache(cache, request, networkResponse.clone(), strategy);
        this.recordCacheMiss(strategy.cacheName!);
        return networkResponse;
      }
    } catch (error) {
      console.warn('Network request failed, no cache available:', error);
    }

    return null;
  }

  private async networkFirstStrategy(
    request: Request | string, 
    cache: Cache, 
    strategy: CacheStrategy
  ): Promise<Response | null> {
    try {
      const networkResponse = await this.fetchWithTimeout(request, strategy.networkTimeoutSeconds);
      
      if (networkResponse?.ok) {
        await this.putInCache(cache, request, networkResponse.clone(), strategy);
        return networkResponse;
      }
    } catch (error) {
      console.warn('Network request failed, trying cache:', error);
    }

    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      this.recordCacheHit(strategy.cacheName!);
      return cachedResponse;
    }

    this.recordCacheMiss(strategy.cacheName!);
    return null;
  }

  private async staleWhileRevalidateStrategy(
    request: Request | string, 
    cache: Cache, 
    strategy: CacheStrategy
  ): Promise<Response | null> {
    const cachedResponse = await cache.match(request);
    
    // Always try to revalidate in background
    void this.refreshCacheInBackground(request, cache, strategy);
    
    if (cachedResponse) {
      this.recordCacheHit(strategy.cacheName!);
      return cachedResponse;
    }

    // No cache, wait for network
    try {
      const networkResponse = await this.fetchWithTimeout(request, strategy.networkTimeoutSeconds);
      
      if (networkResponse?.ok) {
        await this.putInCache(cache, request, networkResponse.clone(), strategy);
        return networkResponse;
      }
    } catch (error) {
      console.warn('Network request failed:', error);
    }

    this.recordCacheMiss(strategy.cacheName!);
    return null;
  }

  private async networkOnlyStrategy(request: Request | string): Promise<Response | null> {
    try {
      return await fetch(request);
    } catch (error) {
      console.warn('Network-only request failed:', error);
      return null;
    }
  }

  private async cacheOnlyStrategy(request: Request | string, cache: Cache): Promise<Response | null> {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      this.recordCacheHit('cache-only');
      return cachedResponse;
    }
    this.recordCacheMiss('cache-only');
    return null;
  }

  private async fetchWithTimeout(
    request: Request | string, 
    timeoutSeconds: number = 5
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

    try {
      const response = await fetch(request, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async putInCache(
    cache: Cache, 
    request: Request | string, 
    response: Response, 
    strategy: CacheStrategy
  ): Promise<void> {
    // Apply cache plugins
    let processedResponse = response;
    
    if (strategy.plugins) {
      for (const plugin of strategy.plugins) {
        if (plugin.cachedResponseWillBeUsed) {
          const result = await plugin.cachedResponseWillBeUsed(processedResponse);
          if (result) {
            processedResponse = result;
          }
        }
      }
    }

    await cache.put(request, processedResponse);
    
    // Enforce cache size limits
    if (strategy.maxEntries) {
      await this.enforceCacheSizeLimit(cache, strategy.maxEntries);
    }

    // Update cache size tracking - use void to handle floating promise
    void this.updateCacheSize(strategy.cacheName!);
  }

  private async refreshCacheInBackground(
    request: Request | string, 
    cache: Cache, 
    strategy: CacheStrategy
  ): Promise<void> {
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse?.ok) {
        await this.putInCache(cache, request, networkResponse, strategy);
      }
    } catch (error) {
      console.warn('Background cache refresh failed:', error);
    }
  }

  private findMatchingStrategy(url: string): CacheStrategy | null {
    const strategies = Array.from(this.strategies.values());
    for (const strategy of strategies) {
      if (strategy.pattern instanceof RegExp) {
        if (strategy.pattern.test(url)) {
          return strategy;
        }
      } else if (typeof strategy.pattern === 'string') {
        if (url.includes(strategy.pattern)) {
          return strategy;
        }
      }
    }
    return null;
  }

  private isCacheStale(response: Response, maxAge?: number): boolean {
  if (maxAge === undefined || maxAge === null || maxAge === 0) return false;

    const cacheDate = response.headers.get('date');
  if (cacheDate === null) return true;

    const cacheTime = new Date(cacheDate).getTime();
    const now = Date.now();
    const age = now - cacheTime;

    return age > maxAge * 1000;
  }

  private async enforceCacheSizeLimit(cache: Cache, maxEntries: number): Promise<void> {
    const requests = await cache.keys();
    
    if (requests.length > maxEntries) {
      // Remove oldest entries (FIFO)
      const toDelete = requests.slice(0, requests.length - maxEntries);
      
      for (const request of toDelete) {
        await cache.delete(request);
      }
    }
  }

  private recordCacheHit(cacheName: string): void {
    const stats = this.performance.get(cacheName);
    if (stats) {
      stats.hits++;
    }
  }

  private recordCacheMiss(cacheName: string): void {
    const stats = this.performance.get(cacheName);
    if (stats) {
      stats.misses++;
    }
  }

  private async updateCacheSize(cacheName: string): Promise<void> {
    const stats = this.performance.get(cacheName);
    if (stats) {
      // Estimate cache size (simplified)
      // Add actual async operation to justify the async method
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      stats.size = keys.length;
    }
  }

  private async cleanupOldCaches(): Promise<void> {
    const cacheNames = await caches.keys();
    const currentCacheNames = new Set(Array.from(this.strategies.values()).map(s => s.cacheName).filter(Boolean));
    
    for (const cacheName of cacheNames) {
  if (!currentCacheNames.has(cacheName)) {
        console.log(`🗑️ Deleting old cache: ${cacheName}`);
        await caches.delete(cacheName);
      }
    }
  }

  private async preloadCriticalResources(): Promise<void> {
    const criticalResources = [
      '/manifest.json',
      '/favicon.ico',
      '/offline.html'
    ];

    const cache = await caches.open('critical-v1');
    
    for (const resource of criticalResources) {
      try {
        const response = await fetch(resource);
        if (response.ok) {
          await cache.put(resource, response);
        }
      } catch (error) {
        console.warn(`Failed to preload ${resource}:`, error);
      }
    }
  }

  getCacheStats(): Map<string, { hits: number; misses: number; size: number; hitRate: number }> {
    const stats = new Map<string, { hits: number; misses: number; size: number; hitRate: number }>();
    
    this.performance.forEach((perf, cacheName) => {
      const total = perf.hits + perf.misses;
      const hitRate = total > 0 ? (perf.hits / total) * 100 : 0;
      
      stats.set(cacheName, {
        hits: perf.hits,
        misses: perf.misses,
        size: perf.size,
        hitRate: parseFloat(hitRate.toFixed(2))
      });
    });
    
    return stats;
  }

  async clearAllCaches(): Promise<void> {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName);
    }
    
    this.caches.clear();
    this.performance.clear();
    console.log('🗑️ All caches cleared');
  }
}

// Service Worker implementation
export class ServiceWorkerManager {
  private config: ServiceWorkerConfig;
  private cacheManager: CacheManager;
  private backgroundSync = new Map<string, BackgroundSyncConfig>();

  constructor(config: ServiceWorkerConfig) {
    this.config = config;
    this.cacheManager = CacheManager.getInstance();
  }

  async initialize(): Promise<void> {
    console.log('🔧 Initializing Service Worker...');

    // Initialize cache manager
    await this.cacheManager.initialize(this.config.cacheStrategies);

    // Set up background sync
    this.setupBackgroundSync();

    // Set up push notifications
    if (this.config.pushNotifications.enabled) {
      this.setupPushNotifications();
    }

    // Handle install event
    self.addEventListener('install', this.handleInstall.bind(this));

    // Handle activate event
    self.addEventListener('activate', this.handleActivate.bind(this));

    // Handle fetch event
    self.addEventListener('fetch', this.handleFetch.bind(this));

    // Handle background sync
    self.addEventListener('sync', this.handleBackgroundSync.bind(this));

    // Handle push notifications
    self.addEventListener('push', this.handlePushNotification.bind(this));

    console.log('✅ Service Worker initialized successfully');
  }

  private handleInstall(event: Event): void {
    console.log('📦 Service Worker installing...');

    if ('waitUntil' in event) {
  (event as unknown as { waitUntil(p: Promise<unknown>): void }).waitUntil(
        (async () => {
          // Pre-cache offline pages
          const cache = await caches.open('offline-v1');
          await cache.addAll(this.config.offlinePages);

          if (this.config.skipWaiting) {
            await (self as unknown as { skipWaiting(): Promise<void> }).skipWaiting();
          }
        })()
      );
    }
  }

  private handleActivate(event: Event): void {
    console.log('🚀 Service Worker activating...');

    if ('waitUntil' in event) {
  (event as unknown as { waitUntil(p: Promise<unknown>): void }).waitUntil(
        (async () => {
          if (this.config.clientsClaim) {
            await (self as unknown as { clients: { claim(): Promise<void> } }).clients.claim();
          }

          // Clean up old caches
          await this.cleanupOldCaches();
        })()
      );
    }
  }

  private handleFetch(event: Event): void {
    const fetchEvent = event as unknown as { request: Request; respondWith(p: Promise<Response>): void };
    const request = fetchEvent.request;

    // Skip non-GET requests for caching
    if (request.method !== 'GET') {
      return;
    }

    // Skip cross-origin requests
  if (typeof request.url !== 'string' || !request.url.startsWith(self.location.origin)) {
      return;
    }

    if (fetchEvent.respondWith) {
      fetchEvent.respondWith(
        (async () => {
          try {
            const cachedResponse = await this.cacheManager.get(request);
            
            if (cachedResponse) {
              return cachedResponse;
            }

            // Fallback to network
            const networkResponse = await fetch(request);
            
            if (networkResponse.ok) {
              return networkResponse;
            }

            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              const offlineCache = await caches.open('offline-v1');
              const offlinePage = await offlineCache.match('/offline.html');
              
              if (offlinePage) {
                return offlinePage;
              }
            }

            return networkResponse;
          } catch (error) {
            console.error('Fetch error:', error);

            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              const offlineCache = await caches.open('offline-v1');
              const offlinePage = await offlineCache.match('/offline.html');
              
              if (offlinePage) {
                return offlinePage;
              }
            }

            throw error;
          }
        })()
      );
    }
  }

  private setupBackgroundSync(): void {
    this.config.backgroundSync.forEach(syncConfig => {
      this.backgroundSync.set(syncConfig.name, syncConfig);
    });
  }

  private handleBackgroundSync(event: Event): void {
    const syncEvent = event as unknown as { tag: string; waitUntil(p: Promise<unknown>): void };
    const syncConfig = this.backgroundSync.get(syncEvent.tag);
    
  if (syncConfig === undefined) {
      return;
    }

    if (syncEvent.waitUntil) {
      syncEvent.waitUntil(
        (async () => {
          let retries = 0;
          let success = false;

          while (retries < syncConfig.maxRetries && !success) {
            try {
              const response = await fetch(syncConfig.url, {
                method: syncConfig.method
              });

              if (response.ok) {
                success = true;
                console.log(`✅ Background sync successful: ${syncConfig.name}`);
              } else {
                throw new Error(`HTTP ${response.status}`);
              }
            } catch (error) {
              retries++;
              console.warn(`❌ Background sync failed (attempt ${retries}): ${syncConfig.name}`, error);

              if (retries < syncConfig.maxRetries) {
                await new Promise(resolve => setTimeout(resolve, syncConfig.retryDelay * 1000));
              }
            }
          }

          if (success === false) {
            console.error(`💥 Background sync failed after ${syncConfig.maxRetries} attempts: ${syncConfig.name}`);
          }
        })()
      );
    }
  }

  private setupPushNotifications(): void {
    console.log('🔔 Push notifications configured');
  }

  private handlePushNotification(event: Event): void {
    interface PushPayload {
      title?: unknown;
      body?: unknown;
      icon?: unknown;
      badge?: unknown;
      data?: unknown;
    }
    const pushEvent = event as unknown as { data: { json(): unknown } | null; waitUntil(p: Promise<unknown>): void };
    if (pushEvent.data === null) {
      return;
    }
    const raw = pushEvent.data.json();
    if (typeof raw !== 'object' || raw === null) {
      return;
    }
    const payload = raw as PushPayload;
    const title = typeof payload.title === 'string' ? payload.title : 'Notification';
    const body = typeof payload.body === 'string' ? payload.body : undefined;
    const icon = typeof payload.icon === 'string' ? payload.icon : '/icon-192x192.png';
    const badge = typeof payload.badge === 'string' ? payload.badge : '/badge-72x72.png';
  const data = payload.data;
    if (pushEvent.waitUntil) {
      const reg = (self as unknown as { registration: { showNotification(t: string, o: NotificationOptions): Promise<void> } }).registration;
      pushEvent.waitUntil(
        reg.showNotification(title, {
          body,
            icon,
            badge,
            data
        })
      );
    }
  }

  private async cleanupOldCaches(): Promise<void> {
    const cacheNames = await caches.keys();
    const currentCacheNames = new Set(Array.from(this.backgroundSync.keys()));
    
    for (const cacheName of cacheNames) {
  if (!currentCacheNames.has(cacheName)) {
        console.log(`🗑️ Deleting old cache: ${cacheName}`);
        await caches.delete(cacheName);
      }
    }
  }
}

// Default cache strategies for CosmicHub
export const DefaultCacheStrategies: CacheStrategy[] = [
  // Static assets - cache first with long expiry
  {
    name: 'static-assets',
    pattern: /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ico)$/,
    strategy: 'cache-first',
    maxAge: 86400 * 30, // 30 days
    maxEntries: 100,
    cacheName: 'static-assets-v1'
  },

  // API responses - network first with short cache
  {
    name: 'api-responses',
    pattern: /\/api\//,
    strategy: 'network-first',
    maxAge: 300, // 5 minutes
    maxEntries: 50,
    networkTimeoutSeconds: 5,
    cacheName: 'api-responses-v1'
  },

  // Chart data - stale while revalidate
  {
    name: 'chart-data',
    pattern: /\/api\/charts\//,
    strategy: 'stale-while-revalidate',
    maxAge: 3600, // 1 hour
    maxEntries: 25,
    cacheName: 'chart-data-v1'
  },

  // HTML pages - network first with offline fallback
  {
    name: 'html-pages',
    pattern: /\.html$/,
    strategy: 'network-first',
    maxAge: 3600, // 1 hour
    maxEntries: 20,
    networkTimeoutSeconds: 3,
    cacheName: 'html-pages-v1'
  },

  // External fonts - cache first
  {
    name: 'google-fonts',
    pattern: /fonts\.googleapis\.com/,
    strategy: 'cache-first',
    maxAge: 86400 * 365, // 1 year
    maxEntries: 10,
    cacheName: 'google-fonts-v1'
  }
];

// Service worker configuration for CosmicHub
export const DefaultServiceWorkerConfig: ServiceWorkerConfig = {
  scope: '/',
  cacheStrategies: DefaultCacheStrategies,
  offlinePages: ['/offline.html', '/'],
  backgroundSync: [
    {
      name: 'chart-sync',
      url: '/api/charts/sync',
      method: 'POST',
      maxRetries: 3,
      retryDelay: 5
    }
  ],
  pushNotifications: {
  publicKey: (globalThis as unknown as { process?: { env?: Record<string,string|undefined> } }).process?.env?.VAPID_PUBLIC_KEY ?? '',
  privateKey: (globalThis as unknown as { process?: { env?: Record<string,string|undefined> } }).process?.env?.VAPID_PRIVATE_KEY ?? '',
    subject: 'mailto:admin@cosmichub.com',
    enabled: false
  },
  updateStrategy: 'prompt-user',
  skipWaiting: false,
  clientsClaim: true
};

// Export utilities
export const CachingSystem = {
  CacheManager,
  ServiceWorkerManager,
  DefaultCacheStrategies,
  DefaultServiceWorkerConfig
};
