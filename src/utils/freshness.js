/**
 * Backend data timestamp helpers.
 *
 * The backend reports when its dataset was last refreshed via the socket
 * handshake: `{ roads: { timestamp }, tematic: { timestamp } }`, as Unix
 * seconds. We surface that value directly so the UI never claims data is
 * newer than it really is.
 */

export function toDate(timestamp) {
  if (timestamp === null || timestamp === undefined) return null
  const value = Number(timestamp)
  if (!Number.isFinite(value) || value <= 0) return null
  const date = new Date(value * 1000)
  return Number.isNaN(date.getTime()) ? null : date
}
