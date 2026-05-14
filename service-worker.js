// =============================================
// BIMAN XD PORTFOLIO — SERVICE WORKER v1.0
// Handles: Caching, Push Notifications, Background Sync
// =============================================

const CACHE_NAME = 'biman-portfolio-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

// ——— Install: Pre-cache core assets ———
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ——— Activate: Clean old caches ———
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ——— Fetch: Stale-While-Revalidate for images, Network-first for others ———
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Custom caching for GitHub stats and other external images
  if (url.hostname.includes('github-readme-stats') || url.hostname.includes('postimg.cc')) {
    event.respondWith(
      caches.open('biman-external-assets').then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchedResponse = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchedResponse;
        });
      })
    );
  } else {
    // Default strategy for core assets
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});

// ——— Push: Receive push notification ———
self.addEventListener('push', (event) => {
  let data = {
    title: '🎨 Biman Ranasinghe',
    body: 'Hey! Check out what\'s new on my portfolio!',
    icon: 'https://i.postimg.cc/V6prNDSQ/coding.png',
    badge: 'https://i.postimg.cc/V6prNDSQ/coding.png',
    tag: 'biman-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: '🚀 View Portfolio' },
      { action: 'close', title: '✖ Close' }
    ]
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      requireInteraction: data.requireInteraction,
      vibrate: data.vibrate,
      actions: data.actions,
      data: { url: '/' }
    })
  );
});

// ——— Notification Click Handler ———
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

// ——— Periodic Sync (optional future use) ———
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'portfolio-update-check') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  // Placeholder for future update-checking logic
  console.log('[SW] Periodic sync triggered');
}
