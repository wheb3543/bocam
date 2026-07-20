// Service Worker for SGH Public App (Patients & Visitors)
// مستقل تماماً عن Service Worker لوحة التحكم الإدارية (sw-admin.js)
const CACHE_NAME = 'sgh-public-v1';
const RUNTIME_CACHE = 'sgh-public-runtime-v1';
const OFFLINE_URL = '/offline';

// الملفات الأساسية للتطبيق العام
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

// ===== Install Event =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            cache.add(url).catch(() => {
              // Silently handle cache errors
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ===== Activate Event =====
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        // Only delete caches that belong to public app (sgh-public-*)
        return cacheNames.filter(
          (cacheName) => cacheName.startsWith('sgh-public-') && !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ===== Fetch Event =====
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip admin/admin requests - handled by sw-admin.js exclusively
  // IMPORTANT: Do NOT cache or intercept any /admin or /admin routes
  if (event.request.url.includes('/admin') || event.request.url.includes('/admin')) {
    return;
  }

  // Skip API requests (always fetch fresh)
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // Network-first for navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    })
  );
});

// ===== Push Notifications (Public App) =====
self.addEventListener('push', (event) => {
  let data = { title: 'المستشفى السعودي الألماني', body: 'إشعار جديد', url: '/', type: 'general' };
  try {
    if (event.data) {
      data = { ...data, ...JSON.parse(event.data.text()) };
    }
  } catch {
    data.body = event.data ? event.data.text() : 'إشعار جديد';
  }

  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: `sgh-public-${data.type || 'notification'}`,
    requireInteraction: false,
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'فتح', icon: '/icon-72x72.png' },
      { action: 'close', title: 'إغلاق' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'المستشفى السعودي الألماني', options)
  );
});

// ===== Notification Click =====
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const targetUrl = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (
            !client.url.includes('/admin') &&
            !client.url.includes('/admin') &&
            'focus' in client
          ) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      })
    );
  }
});

// ===== Background Sync =====
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  }
});

async function syncAppointments() {
  try {
    const clientList = await clients.matchAll({ type: 'window' });
    clientList.forEach((client) => {
      if (!client.url.includes('/admin') && !client.url.includes('/admin')) {
        client.postMessage({ type: 'SYNC_COMPLETE' });
      }
    });
  } catch {
    // Silently handle sync errors
  }
}

// ===== Message Event =====
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_NAME, app: 'public' });
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith('sgh-public-')).map((k) => caches.delete(k)))
      )
      .then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
  }
});
