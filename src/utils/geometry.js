/**
 * Resolve a single representative { lat, lng } point from a GeoJSON geometry.
 * Used as a routing destination because the /route API expects a point, while
 * map features are lines (roads) or polygons (kelurahan areas).
 */
export function getGeometryPoint(geometry) {
  if (!geometry || !geometry.coordinates) return null
  const { type, coordinates } = geometry

  if (type === 'Point') {
    return { lat: coordinates[1], lng: coordinates[0] }
  }

  if (type === 'LineString') {
    if (coordinates.length === 0) return null
    const mid = coordinates[Math.floor(coordinates.length / 2)]
    return { lat: mid[1], lng: mid[0] }
  }

  if (type === 'MultiLineString') {
    // Use the longest line — the most representative for a road
    const line = coordinates.reduce((best, cur) => (cur.length > best.length ? cur : best), coordinates[0] || [])
    if (!line || line.length === 0) return null
    const mid = line[Math.floor(line.length / 2)]
    return { lat: mid[1], lng: mid[0] }
  }

  if (type === 'Polygon') {
    return polygonCentroid(coordinates[0])
  }

  if (type === 'MultiPolygon') {
    return polygonCentroid(coordinates[0]?.[0])
  }

  return null
}

function polygonCentroid(ring) {
  if (!ring || ring.length === 0) return null

  // Area-weighted centroid (robust for concave polygons)
  let twiceArea = 0
  let cx = 0
  let cy = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x0, y0] = ring[j]
    const [x1, y1] = ring[i]
    const cross = x0 * y1 - x1 * y0
    twiceArea += cross
    cx += (x0 + x1) * cross
    cy += (y0 + y1) * cross
  }

  if (Math.abs(twiceArea) > 1e-12) {
    return { lat: cy / (3 * twiceArea), lng: cx / (3 * twiceArea) }
  }

  // Degenerate ring — fall back to the vertex average
  let sx = 0
  let sy = 0
  for (const [x, y] of ring) {
    sx += x
    sy += y
  }
  return { lat: sy / ring.length, lng: sx / ring.length }
}
