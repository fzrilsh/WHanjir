import { useEffect, useState, useMemo } from 'react'
import RiskBadge, { scoreToLevel } from './RiskBadge'
import RiskScale from './RiskScale'
import { getCurrentPosition } from '../utils/geolocation'
import { useI18n } from '../i18n/I18nProvider'
import { toDate } from '../utils/freshness'

function haversineM(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function roadMidpoint(road) {
  const coords = road?.geometry?.coordinates
  if (!coords || coords.length === 0) return null
  const mid = coords[Math.floor(coords.length / 2)]
  return { lat: mid[1], lng: mid[0] }
}

function getWaterCm(score) {
  if (score >= 70) return Math.round((score - 70) * (70 / 30) + 30)
  if (score >= 40) return Math.round((score - 40) * (20 / 30) + 2)
  return 0
}

function LocationSheet({ roads, dataUpdatedAt, onShowDetail, onRouteHere }) {
  const { t, formatDate, formatTime } = useI18n()
  const [position, setPosition] = useState(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let cancelled = false
    getCurrentPosition()
      .then((pos) => {
        // `null` means the browser could not provide a fix — leave the card in
        // its "Jakarta Barat" placeholder state rather than inventing one.
        if (!cancelled && pos) setPosition(pos)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const nearest = useMemo(() => {
    if (!position || !roads || roads.length === 0) return null
    let best = null
    let bestDist = Infinity
    for (const road of roads) {
      const mid = roadMidpoint(road)
      if (!mid) continue
      const d = haversineM(position.lat, position.lng, mid.lat, mid.lng)
      if (d < bestDist) {
        bestDist = d
        best = road
      }
    }
    return best && bestDist < 5000 ? best : null
  }, [position, roads])

  const level = nearest ? scoreToLevel(nearest.score) : 'aman'
  const water = nearest ? getWaterCm(nearest.score) : 0
  const sensorName = nearest?.sensor_referensi || t('common.sensorNearest')

  const updatedDate = toDate(dataUpdatedAt)
  const updatedLabel = updatedDate
    ? t('location.updated', { time: formatTime(updatedDate), date: formatDate(updatedDate) })
    : t('road.updatedUnknown')

  return (
    <>
    <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center pointer-events-none md:hidden">
      <div className="w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0px_-4px_24px_rgba(0,0,0,0.14)] px-5 pt-2.5 pb-5 flex flex-col gap-3 pointer-events-auto">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex justify-center py-1 cursor-pointer"
          aria-label={expanded ? t('common.collapse') : t('common.expand')}
        >
          <div className="w-10 h-1 bg-[#E3E2E6] dark:bg-slate-700 rounded-sm" />
        </button>

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px]">
            {t('location.yourLocation')}
          </span>
          <span className="text-xs font-medium text-[#5B6270] dark:text-gray-400">
            {updatedLabel}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-[#1A1B1E] dark:text-white leading-7 tracking-[-0.4px] truncate">
            {nearest ? nearest.name : t('common.jakartaBarat')}
          </h2>
          <RiskBadge level={level} />
        </div>

        <div>
          <p className="text-[32px] font-bold text-[#1A1B1E] dark:text-white leading-10 tracking-[-0.64px]">
            {water} {t('common.cm')}
          </p>
          <p className="text-xs font-medium text-[#5B6270] dark:text-gray-400 leading-4 mt-0.5">
            {t('location.waterNow', { sensor: sensorName })}
          </p>
        </div>

        {expanded && (
          <>
            <RiskScale score={nearest?.score ?? 0} level={level} />
          </>
        )}
        <button
          type="button"
          onClick={() => nearest && onShowDetail?.(nearest)}
          className="w-full h-[52px] bg-[#005BBF] hover:bg-[#004A9E] rounded-xl flex items-center justify-center text-[15px] font-semibold text-white transition-colors cursor-pointer active:scale-[0.98]"
        >
          {t('location.showDetail')}
        </button>
      </div>

    </div>

    {/* Desktop MapCard (left top) */}
    <div className="hidden md:flex absolute left-6 top-6 z-30 w-[300px] bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 rounded-2xl shadow-[0px_8px_12px_rgba(0,0,0,0.14)] p-4 flex-col gap-2.5 pointer-events-auto">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px]">
            {t('location.yourLocation')}
          </span>
          <RiskBadge level={level} />
        </div>
        <p className="text-[17px] font-semibold text-[#1A1B1E] dark:text-white leading-[23px] tracking-[-0.34px]">
          {nearest ? nearest.name : t('common.jakartaBarat')}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-[32px] font-bold text-[#1A1B1E] dark:text-white leading-10 tracking-[-0.64px]">
            {water} {t('common.cm')}
          </span>
          <span className="text-xs font-medium text-[#5B6270] dark:text-gray-400">{t('location.waterLevel')}</span>
        </div>
        <p className="text-xs font-medium text-[#5B6270] dark:text-gray-400">
          {t('location.sensorLine', { sensor: sensorName })}
        </p>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => nearest && onShowDetail?.(nearest)}
            className="flex-1 h-10 bg-[#005BBF] hover:bg-[#004A9E] rounded-xl text-[15px] font-semibold text-white transition-colors cursor-pointer active:scale-[0.98]"
          >
            {t('location.showDetailShort')}
          </button>
          <button
            type="button"
            onClick={() => nearest && onRouteHere?.(nearest)}
            className="h-10 px-4 bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-[15px] font-semibold text-[#1A1B1E] dark:text-white transition-colors cursor-pointer active:scale-[0.98]"
          >
            {t('location.route')}
          </button>
        </div>
    </div>
    </>
  )
}

export default LocationSheet
