const CACHE_NAME = 'sosg-v6'
const SHELL_ASSETS = ['/api/manifest.json', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// Web Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return
  try {
    const data = event.data.json()
    const options = {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'sosg-notification',
      data: { url: data.url || '/' },
    }
    event.waitUntil(self.registration.showNotification(data.title || 'SOSG Running Club', options))
  } catch (e) {
    // Malformed push payload — ignore silently
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
      // Find an existing PWA window
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Use postMessage instead of client.navigate() — on iOS PWAs,
          // client.navigate() can corrupt the React tree, leaving stale
          // content from the previous page visible across all routes.
          // The client-side listener will do a full window.location.href
          // assignment for a clean page load.
          client.postMessage({ type: 'NAVIGATE', url })
          try {
            await client.focus()
          } catch {
            // focus() can fail on frozen/discarded tabs
          }
          return
        }
      }
      // No existing window — open a new one
      return self.clients.openWindow(url)
    })
  )
})

self.addEventListener('fetch', (event) => {
  // Only serve shell assets from cache. Never cache navigation responses —
  // Next.js pages are dynamic and serving stale HTML causes content bleed.
  if (event.request.mode === 'navigate') return

  if (SHELL_ASSETS.some((asset) => event.request.url.endsWith(asset))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    )
  }
})
