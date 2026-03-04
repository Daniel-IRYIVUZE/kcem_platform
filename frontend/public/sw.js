// sw.js — EcoTrade Rwanda Service Worker (offline-first PWA)
const CACHE_NAME = 'ecotrade-v1';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];
const API_CACHE = 'ecotrade-api-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== API_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API requests: network first, then cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          if (res.ok && event.request.method === 'GET') {
            const clone = res.clone();
            caches.open(API_CACHE).then(c => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-listings') {
    event.waitUntil(syncPendingListings());
  }
});

async function syncPendingListings() {
  // Retrieve queued offline submissions from IndexedDB and replay them
  console.log('[SW] Syncing pending listings...');
}
