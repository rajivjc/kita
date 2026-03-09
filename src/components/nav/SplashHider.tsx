'use client'

import { useEffect } from 'react'

export default function SplashHider() {
  useEffect(() => {
    const splash = document.getElementById('pwa-splash')
    if (splash) {
      splash.style.transition = 'opacity 0.4s ease'
      splash.style.opacity = '0'
      // Hide with CSS instead of remove() — the splash div is rendered by
      // React in layout.tsx, so calling .remove() tears it out of the DOM
      // before React can reconcile, causing "removeChild" NotFoundError.
      setTimeout(() => {
        splash.style.display = 'none'
      }, 400)
    }
  }, [])
  return null
}
