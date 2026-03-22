// sw.js — EcoTrade Rwanda Service Worker (offline-first PWA)
const CACHE_NAME = 'ecotrade-v2';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];
const API_CACHE = 'ecotrade-api-v2';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET mutations — those go through the offline queue in the app
  if (event.request.method !== 'GET') return;

  // API GET requests: network first, cache as fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request.clone())
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(API_CACHE).then(c => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: cache first, network fallback
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

// Background sync — replays the offline queue when connectivity is restored.
// The app's AuthContext also handles this via the 'online' event, so this is
// a belt-and-suspenders backup for when the app tab is not focused.
self.addEventListener('sync', event => {
  if (event.tag === 'ecotrade-sync-queue') {
    event.waitUntil(notifyClientsToSync());
  }
});

async function notifyClientsToSync() {
  const allClients = await self.clients.matchAll({ type: 'window' });
  for (const client of allClients) {
    client.postMessage({ type: 'SYNC_QUEUE' });
  }
}

// Listen for messages from the app
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
