// Service Worker for SGH Public App (Patients & Visitors)
// مستقل تماماً عن Service Worker لوحة التحكم الإدارية (sw-admin.js)
const CACHE_NAME = 'sgh-public-v2';
const RUNTIME_CACHE = 'sgh-public-runtime-v2';
const OFFLINE_URL = '/offline';
const CACHE_TTL_MS = 60 * 60 * 1000;

function shouldBypassCache(request) {
  return request.method !== 'GET' || request.cache === 'only-if-cached';
}

function withCacheTimestamp(response) {
  if (!response || !response.headers) {
    return response;
  }

  const headers = new globalThis.Headers(response.headers);
  headers.set('x-cache-timestamp', String(Date.now()));

  return new globalThis.Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isFreshCacheEntry(response, ttlMs = CACHE_TTL_MS) {
  const timestamp = Number(response?.headers?.get('x-cache-timestamp') ?? '0');
  return Number.isFinite(timestamp) && Date.now() - timestamp < ttlMs;
}

function normalizeNotificationTarget(targetUrl) {
  try {
    const normalized = new URL(targetUrl, self.location.origin);
    if (!['http:', 'https:'].includes(normalized.protocol)) {
      return self.location.origin;
    }
    return normalized.origin === self.location.origin
      ? normalized.toString()
      : self.location.origin;
  } catch {
    return self.location.origin;
  }
}

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
function isAdminRouteUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.pathname === '/admin' || url.pathname.startsWith('/admin/');
  } catch {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  if (shouldBypassCache(event.request)) {
    return;
  }

  // Skip admin routes - handled by sw-admin.js exclusively
  // IMPORTANT: Do NOT cache or intercept any /admin routes
  if (isAdminRouteUrl(event.request.url)) {
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
            cache.put(event.request, withCacheTimestamp(responseClone));
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse && isFreshCacheEntry(cachedResponse)) {
              return cachedResponse;
            }
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Cache-first for static assets with TTL
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse && isFreshCacheEntry(cachedResponse)) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, withCacheTimestamp(responseClone));
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
    const rawTarget = event.notification.data?.url || '/';
    const targetUrl = normalizeNotificationTarget(rawTarget);

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          const clientUrl = typeof client.url === 'string' ? client.url : '';
          if (!isAdminRouteUrl(clientUrl) && 'focus' in client) {
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
      if (!isAdminRouteUrl(client.url)) {
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
