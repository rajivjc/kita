'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed — non-critical, ignore silently
    })

    // Listen for NAVIGATE messages from the service worker's notificationclick
    // handler. We use postMessage + full page reload instead of client.navigate()
    // because client.navigate() corrupts the React tree on iOS PWAs, causing
    // stale content to persist across all routes.
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE' && typeof event.data.url === 'string') {
        window.location.href = event.data.url
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [])

  return null
}
