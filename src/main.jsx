import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// The PWA service worker used to run in dev too. It cached the app shell and
// kept serving it after the dev server stopped, producing ERR_CONNECTION_REFUSED
// noise for the manifest and JS chunks. Dev SW is disabled now, but browsers
// that already registered it need a one-time cleanup.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      const scriptUrl =
        registration.active?.scriptURL ||
        registration.waiting?.scriptURL ||
        registration.installing?.scriptURL ||
        ''
      if (scriptUrl.includes('dev-sw.js')) registration.unregister()
    }
  })

  if ('caches' in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        if (name.startsWith('workbox-precache')) caches.delete(name)
      }
    })
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
