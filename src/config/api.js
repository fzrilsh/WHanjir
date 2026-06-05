const PORT = import.meta.env.VITE_API_PORT || ''
const PROTOCOL = import.meta.env.VITE_WS_PROTOCOL || 'http'

const BACKEND_HOSTS = [
  import.meta.env.VITE_API_HOST_PRIMARY,
  import.meta.env.VITE_API_HOST_FALLBACK,
].filter(Boolean)

const portSuffix = PORT ? `:${PORT}` : ''

let _resolvedHost = null
let _serverOffline = false
let _resolvePromise = null

function buildBase(host) {
  return `${PROTOCOL}://${host}${portSuffix}`
}

async function checkHealth(host) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(`${buildBase(host)}/health`, {
      signal: controller.signal,
      headers: { 'ngrok-skip-browser-warning': 'true' },
    })
    clearTimeout(timeout)
    return res.ok
  } catch {
    clearTimeout(timeout)
    return false
  }
}

export const hostReady = new Promise((resolve) => {
  _resolvePromise = resolve
})

export async function resolveBackendHost() {
  for (const host of BACKEND_HOSTS) {
    const ok = await checkHealth(host)
    if (ok) {
      _resolvedHost = host
      _serverOffline = false
      _resolvePromise({ host, offline: false })
      return
    }
  }
  _resolvedHost = BACKEND_HOSTS[0]
  _serverOffline = true
  _resolvePromise({ host: _resolvedHost, offline: true })
}

export function getApiBase() {
  return buildBase(_resolvedHost || BACKEND_HOSTS[0])
}

export function getWsUrl() {
  return buildBase(_resolvedHost || BACKEND_HOSTS[0])
}

export function isServerOffline() {
  return _serverOffline
}

export const ENDPOINTS = {
  health: () => `${getApiBase()}/health`,
  roads: () => `${getApiBase()}/`,
  scores: () => `${getApiBase()}/scores`,
  search: (q, limit = 10, offset = 0) =>
    `${getApiBase()}/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`,
  tematic: () => `${getApiBase()}/tematic`,
  route: (fromLat, fromLng, toLat, toLng, speed = 40) =>
    `${getApiBase()}/route?from_lat=${fromLat}&from_lng=${fromLng}&to_lat=${toLat}&to_lng=${toLng}&speed=${speed}`,
}

resolveBackendHost()
