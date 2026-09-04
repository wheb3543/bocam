// Service Worker for SGH Admin Dashboard PWA
// مستقل تماماً عن Service Worker التطبيق العام
const CACHE_NAME = 'sgh-admin-v3';
const RUNTIME_CACHE = 'sgh-admin-runtime-v3';
const CACHE_TTL_MS = 60 * 60 * 1000;

function isAdminRouteUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.pathname === '/admin' || url.pathname.startsWith('/admin/');
  } catch {
    return false;
  }
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
      return `${self.location.origin}/admin`;
    }
    return normalized.origin === self.location.origin
      ? normalized.toString()
      : `${self.location.origin}/admin`;
  } catch {
    return `${self.location.origin}/admin`;
  }
}

// الملفات الأساسية لتطبيق الإدارة
// NOTE: لا تُضف favicon.ico هنا - قد يُعيد redirect إلى CDN خارجي ويُسبب CORS error
// NOTE: لا تُضف ملفات من CDN خارجي - يجب أن تكون جميع الملفات من نفس الـ origin
const PRECACHE_URLS = [
  '/admin',
  '/manifest-admin.json',
  '/tenant-assets/icon-admin-192x192.png',
  '/tenant-assets/icon-admin-512x512.png',
  '/tenant-assets/apple-touch-icon.png',
];

// ===== Install Event =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Try to cache each URL individually to avoid failing on missing files
        return Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            // Use no-cors for cross-origin resources if needed
            fetch(url, { mode: 'same-origin' })
              .then((response) => {
                if (!response.ok && response.type !== 'opaque') {
                  throw new Error(`HTTP ${response.status} for ${url}`);
                }
                return cache.put(url, response);
              })
              .catch(() => {
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
        // Only delete caches that belong to admin (sgh-admin-*)
        return cacheNames.filter(
          (cacheName) => cacheName.startsWith('sgh-admin-') && !currentCaches.includes(cacheName)
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
function shouldBypassCache(request) {
  return request.method !== 'GET' || request.cache === 'only-if-cached';
}

self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests entirely - don't try to cache external CDN resources
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  if (shouldBypassCache(event.request)) {
    return;
  }

  // Skip API requests (always fetch fresh for admin)
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline - Admin' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // Network-first for admin navigation (always fresh data)
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
            return caches.match('/admin');
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

// ===== Push Notifications (Admin-specific) =====
self.addEventListener('push', (event) => {
  let data = { title: 'لوحة تحكم SGH', body: 'إشعار جديد', url: '/admin', type: 'general' };
  try {
    if (event.data) {
      data = { ...data, ...JSON.parse(event.data.text()) };
    }
  } catch {
    data.body = event.data ? event.data.text() : 'إشعار جديد';
  }

  const options = {
    body: data.body,
    icon: '/tenant-assets/icon-admin-192x192.png',
    badge: '/tenant-assets/icon-admin-72x72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: `sgh-admin-${data.type || 'notification'}`,
    requireInteraction: true,
    data: { url: data.url || '/admin' },
    actions: [
      { action: 'open', title: 'فتح', icon: '/tenant-assets/icon-admin-72x72.png' },
      { action: 'close', title: 'إغلاق' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title || 'لوحة تحكم SGH', options));
});

// ===== Notification Click =====
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const rawTarget = event.notification.data?.url || '/admin';
    const targetUrl = normalizeNotificationTarget(rawTarget);

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Focus existing admin window if open
        for (const client of clientList) {
          const clientUrl = typeof client.url === 'string' ? client.url : '';
          if (isAdminRouteUrl(clientUrl) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Open new window
        return clients.openWindow(targetUrl);
      })
    );
  }
});

// ===== Message Event =====
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_NAME, app: 'admin' });
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith('sgh-admin-')).map((k) => caches.delete(k)))
      )
      .then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
  }
});

// ===== Background Sync =====
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-admin-data') {
    event.waitUntil(syncAdminData());
  }
});

async function syncAdminData() {
  try {
    // Notify all admin clients that sync is complete
    const clientList = await clients.matchAll({ type: 'window' });
    clientList.forEach((client) => {
      if (isAdminRouteUrl(client.url)) {
        client.postMessage({ type: 'SYNC_COMPLETE' });
      }
    });
  } catch {
    // Silently handle sync errors
  }
}
