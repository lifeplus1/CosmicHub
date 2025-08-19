/**
 * HealWave Service Worker
 * Provides caching, offline support, and PWA features
 */

const CACHE_NAME = 'healwave-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/styles/index.css'
];

// Install event - precache resources
// Lightweight guarded logger (shared pattern with Astro SW) to satisfy no-console
const log = (globalThis.devConsole && globalThis.devConsole.log) ? (...args) => globalThis.devConsole.log(...args) : undefined;
const warn = (globalThis.devConsole && globalThis.devConsole.warn) ? (...args) => globalThis.devConsole.warn(...args) : undefined;
const error = (globalThis.devConsole && globalThis.devConsole.error) ? (...args) => globalThis.devConsole.error(...args) : undefined;

self.addEventListener('install', (event) => {
  log?.('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
  log?.('📦 Precaching resources...');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
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
            if (cacheName !== CACHE_NAME) {
              log?.('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If fetch is successful, cache the response
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // If fetch fails, try to serve from cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If requesting an HTML page and no cache, serve offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  log?.('🔄 Background sync:', event.tag);
  
  if (event.tag === 'frequency-sync') {
    event.waitUntil(syncFrequencyData());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: data.data
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// Sync frequency data when back online
async function syncFrequencyData() {
  try {
    // This would sync any pending frequency settings or user data
  log?.('🎵 Syncing frequency data...');
    // Implementation would depend on your specific sync needs
  } catch (error) {
  error?.('❌ Frequency sync failed:', error);
  }
}
