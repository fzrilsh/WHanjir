const HOST = import.meta.env.VITE_API_HOST || 'localhost'
const PORT = import.meta.env.VITE_API_PORT || ''
const PROTOCOL = import.meta.env.VITE_WS_PROTOCOL || 'http'

const portSuffix = PORT ? `:${PORT}` : ''
export const API_BASE = `${PROTOCOL}://${HOST}${portSuffix}`
export const WS_URL = `${PROTOCOL}://${HOST}${portSuffix}`

export const ENDPOINTS = {
  health: () => `${API_BASE}/health`,
  roads: () => `${API_BASE}/`,
  search: (q, limit = 10, offset = 0) =>
    `${API_BASE}/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`,
  tematic: () => `${API_BASE}/tematic`,
  route: (fromLat, fromLng, toLat, toLng, speed = 40) =>
    `${API_BASE}/route?from_lat=${fromLat}&from_lng=${fromLng}&to_lat=${toLat}&to_lng=${toLng}&speed=${speed}`,
}
