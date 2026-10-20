// Last position we know about, with the time it was captured.
// `source` is 'maplibre' when it came from the map's GeolocateControl, or
// 'browser' when it came from a direct geolocation call.
let lastPosition = null

// A fix younger than this is reused instead of asking the browser again.
const FRESH_MS = 5 * 60 * 1000

/**
 * Record a position obtained elsewhere (e.g. MapLibre's GeolocateControl).
 * The map already asks the browser for a fix on load, so reusing that avoids a
 * second — often slower — geolocation request when the user taps "Rute".
 */
function setKnownPosition(position) {
  if (!position || typeof position.lat !== 'number' || typeof position.lng !== 'number') {
    return
  }
  lastPosition = {
    lat: position.lat,
    lng: position.lng,
    accuracy: position.accuracy ?? null,
    source: position.source || 'browser',
    timestamp: Date.now(),
  }
}

/**
 * Ask the browser for the user's position.
 *
 * Resolves `{ lat, lng, accuracy, source }`, or `null` when the position is
 * unavailable (permission denied, timeout, insecure context).
 *
 * It deliberately does NOT fall back to a hardcoded coordinate: routing from a
 * made-up origin silently produced wrong directions. Callers must handle `null`.
 *
 * Order of attempts:
 *  1. A fresh fix recorded by the map's GeolocateControl
 *  2. High-accuracy request (GPS / Wi-Fi triangulation)
 *  3. Coarse request
 *  4. Any previous fix, even if stale — better than failing outright
 */
async function getCurrentPosition({ maxAgeMs = FRESH_MS } = {}) {
  if (lastPosition && Date.now() - lastPosition.timestamp <= maxAgeMs) {
    return lastPosition
  }

  if (!navigator.geolocation) return lastPosition

  const attempts = [
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
  ]

  for (const options of attempts) {
    const position = await requestPosition(options)
    if (position) {
      setKnownPosition({ ...position, source: 'browser' })
      return lastPosition
    }
  }

  return lastPosition
}

function requestPosition(options) {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      () => resolve(null),
      options,
    )
  })
}

/** Drop the cached fix (e.g. after the user enables location). */
function clearCachedPosition() {
  lastPosition = null
}

export { getCurrentPosition, setKnownPosition, clearCachedPosition }
