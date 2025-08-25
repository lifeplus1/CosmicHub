/**
 * CosmicHub Service Worker - Enhanced for Chart Offline Mode
 * Provides caching, offline support, chart data sync, and PWA features
 */

const CACHE_NAME = 'cosmichub-v2'; // Incremented for offline chart support
const OFFLINE_URL = '/offline.html';
const CHART_CACHE = 'cosmichub-charts-v1';

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json'
];

// Chart API endpoints to cache
const CHART_API_PATTERNS = [
  /\/api\/charts\//,
  /\/api\/chart-data\//,
  /\/api\/saved-charts/
];

// Lightweight guarded logger (avoids bundler import + satisfies no-console)
const log = (globalThis.devConsole && globalThis.devConsole.log) ? (...args) => globalThis.devConsole.log(...args) : undefined;
const warn = (globalThis.devConsole && globalThis.devConsole.warn) ? (...args) => globalThis.devConsole.warn(...args) : undefined;
const error = (globalThis.devConsole && globalThis.devConsole.error) ? (...args) => globalThis.devConsole.error(...args) : undefined;

// Install event - precache resources
self.addEventListener('install', (event) => {
  log?.('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Precache static resources
      caches.open(CACHE_NAME)
        .then((cache) => {
          log?.('📦 Precaching resources...');
          return cache.addAll(PRECACHE_URLS);
        }),
      // Initialize chart cache
      caches.open(CHART_CACHE)
        .then(() => {
          log?.('📊 Chart cache initialized...');
        })
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  log?.('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Keep current caches
            if ([CACHE_NAME, CHART_CACHE].includes(cacheName)) {
              return Promise.resolve();
            }
            // Delete old caches
            log?.('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Enhanced fetch event - handle chart data with offline support
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (!url.origin === self.location.origin) {
    return;
  }

  // Skip non-GET requests for caching (but allow POST for chart save)
  const isGetRequest = event.request.method === 'GET';
  const isChartApiRequest = CHART_API_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  // Handle chart API requests specially
  if (isChartApiRequest) {
    event.respondWith(handleChartApiRequest(event.request));
    return;
  }

  // Handle GET requests with caching
  if (isGetRequest) {
    event.respondWith(handleGetRequest(event.request));
    return;
  }
});

/**
 * Handle chart API requests with offline support
 */
async function handleChartApiRequest(request) {
  const url = new URL(request.url);
  const isGetRequest = request.method === 'GET';
  
  if (isGetRequest) {
    // For GET requests, try cache first, then network
    try {
      const cache = await caches.open(CHART_CACHE);
      const cachedResponse = await cache.match(request);
      
      // Try network first for fresh data
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          // Cache successful response
          const responseClone = networkResponse.clone();
          await cache.put(request, responseClone);
          
          log?.('📊 Chart data fetched from network and cached');
          return networkResponse;
        }
      } catch (networkError) {
        log?.('⚠️ Network failed for chart request, trying cache...');
      }
      
      // Return cached version if network fails
      if (cachedResponse) {
        log?.('📊 Serving chart data from cache');
        return cachedResponse;
      }
      
      // No cache available, return error
      return new Response('Chart data not available offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
      
    } catch (error) {
      error?.('❌ Chart API request failed:', error);
      return new Response('Chart request failed', {
        status: 500,
        statusText: 'Internal Error',
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  } else {
    // For POST/PUT/DELETE requests (chart saves/deletes), handle offline
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        // Invalidate cache for successful mutations
        const cache = await caches.open(CHART_CACHE);
        const cacheKeys = await cache.keys();
        
        // Clear related cached data
        for (const key of cacheKeys) {
          if (key.url.includes('/charts/') || key.url.includes('/saved-charts')) {
            await cache.delete(key);
          }
        }
        
        log?.('📊 Chart mutated successfully, cache cleared');
        return networkResponse;
      }
    } catch (networkError) {
      log?.('⚠️ Chart mutation failed, queuing for background sync...');
      
      // Queue request for background sync
      await queueOfflineRequest(request);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Chart saved offline and will sync when connection is restored',
        offline: true
      }), {
        status: 202,
        statusText: 'Accepted',
        headers: { 
          'Content-Type': 'application/json',
          'X-Offline-Mode': 'true'
        }
      });
    }
  }
}

/**
 * Handle regular GET requests with caching
 */
async function handleGetRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // If fetch is successful, cache the response
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (networkError) {
    // If fetch fails, try to serve from cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If requesting an HTML page and no cache, serve offline page
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match(OFFLINE_URL);
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    return new Response('Network error', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Queue offline requests for background sync
 */
async function queueOfflineRequest(request) {
  try {
    // Store request data in IndexedDB for background sync
    // This integrates with our OfflineSyncManager
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.clone().text() : null,
      timestamp: Date.now()
    };
    
    // Store in IndexedDB (simplified implementation)
    const db = await openIndexedDB();
    const transaction = db.transaction(['offline_requests'], 'readwrite');
    const store = transaction.objectStore('offline_requests');
    
    await store.add({
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...requestData
    });
    
    log?.('📤 Request queued for background sync');
  } catch (error) {
    error?.('❌ Failed to queue offline request:', error);
  }
}

/**
 * Open IndexedDB for offline request queue
 */
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CosmicHubServiceWorker', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('offline_requests')) {
        const store = db.createObjectStore('offline_requests', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('url', 'url', { unique: false });
      }
    };
  });
}

// Enhanced background sync for offline chart actions
self.addEventListener('sync', (event) => {
  log?.('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'chart-sync') {
    event.waitUntil(syncOfflineRequests());
  } else if (event.tag.startsWith('chart-')) {
    event.waitUntil(syncSpecificChart(event.tag));
  }
});

// Sync offline chart requests
async function syncOfflineRequests() {
  try {
    log?.('📊 Syncing offline chart requests...');
    
    const db = await openIndexedDB();
    const transaction = db.transaction(['offline_requests'], 'readonly');
    const store = transaction.objectStore('offline_requests');
    const requests = await store.getAll();
    
    for (const requestData of requests) {
      try {
        // Recreate and send the request
        const request = new Request(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });
        
        const response = await fetch(request);
        
        if (response.ok) {
          // Remove successfully synced request
          const deleteTransaction = db.transaction(['offline_requests'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('offline_requests');
          await deleteStore.delete(requestData.id);
          
          log?.('✅ Offline request synced successfully:', requestData.url);
        } else {
          log?.('⚠️ Offline request sync failed with status:', response.status);
        }
      } catch (syncError) {
        error?.('❌ Failed to sync offline request:', syncError);
      }
    }
  } catch (syncError) {
    error?.('❌ Background sync failed:', syncError);
  }
}

// Sync specific chart by ID
async function syncSpecificChart(tag) {
  const chartId = tag.replace('chart-', '');
  log?.('📊 Syncing specific chart:', chartId);
  // Implementation would integrate with OfflineSyncManager
}

// Push notification handler for sync notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  if (data.type === 'sync-complete') {
    event.waitUntil(
      self.registration.showNotification('CosmicHub Sync Complete', {
        body: `${data.syncedItems} charts synchronized`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'sync-notification',
        data: { type: 'sync' }
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data?.type === 'sync') {
    event.waitUntil(
      clients.openWindow('/saved-charts')
    );
  } else {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'SYNC_CHARTS':
      // Trigger chart sync
      self.registration.sync.register('chart-sync').then(() => {
        log?.('📊 Chart sync registered');
      });
      break;
      
    case 'CACHE_CHART':
      // Cache specific chart data
      if (payload?.chartData && payload?.chartId) {
        cacheChartData(payload.chartId, payload.chartData);
      }
      break;
      
    default:
      log?.('Unknown message type:', type);
  }
});

// Cache chart data manually
async function cacheChartData(chartId, chartData) {
  try {
    const cache = await caches.open(CHART_CACHE);
    const response = new Response(JSON.stringify(chartData), {
      headers: {
        'Content-Type': 'application/json',
        'X-Cached-At': new Date().toISOString(),
        'X-Chart-ID': chartId
      }
    });
    
    await cache.put(`/api/charts/${chartId}`, response);
    log?.('📊 Chart data cached manually:', chartId);
  } catch (error) {
    error?.('❌ Failed to cache chart data:', error);
  }
}
