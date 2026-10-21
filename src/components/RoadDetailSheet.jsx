import { useEffect, useRef, useState } from 'react'
import RiskBadge, { scoreToLevel } from './RiskBadge'
import RiskScale from './RiskScale'
import { useI18n } from '../i18n/I18nProvider'
import { toDate } from '../utils/freshness'

const base = import.meta.env.BASE_URL || '/'
const A = `${base}assets/whanjir`

const DRAG_THRESHOLD = 80

const STATUS_CARD = {
  aman: {
    bg: 'bg-[#E6F6EC] dark:bg-emerald-950/50',
    title: 'text-[#0F7B3E] dark:text-emerald-300',
    desc: 'text-[#12301F] dark:text-emerald-100/80',
    descKey: 'road.statusSafe',
  },
  tergenang: {
    bg: 'bg-[#FFFBEB] dark:bg-amber-950/50',
    title: 'text-[#92400E] dark:text-amber-300',
    desc: 'text-[#78350F] dark:text-amber-100/80',
    descKey: 'road.statusFlooded',
  },
  banjir: {
    bg: 'bg-[#FEF2F2] dark:bg-red-950/50',
    title: 'text-[#B91C1C] dark:text-red-300',
    desc: 'text-[#7F1D1D] dark:text-red-100/80',
    descKey: 'road.statusFlood',
  },
}

function getWaterCm(score) {
  if (score >= 70) return Math.round((score - 70) * (70 / 30) + 30)
  if (score >= 40) return Math.round((score - 40) * (20 / 30) + 2)
  return 0
}

function RoadDetailSheet({ road, dataUpdatedAt, onClose, onRouteHere }) {
  const { t, formatDate, formatTime } = useI18n()
  const [visible, setVisible] = useState(false)
  const dragState = useRef({ active: false, startY: 0, currentY: 0 })

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') closeSheet()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  function handlePointerDown(e) {
    dragState.current = { active: true, startY: e.clientY, currentY: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function handlePointerMove(e) {
    if (!dragState.current.active) return
    dragState.current.currentY = e.clientY
    updateSheetTransform()
  }
  function handlePointerUp() {
    if (!dragState.current.active) return
    dragState.current.active = false
    const delta = dragState.current.currentY - dragState.current.startY
    if (delta > DRAG_THRESHOLD) closeSheet()
    else resetSheetTransform()
  }
  function updateSheetTransform() {
    const sheet = document.getElementById('road-detail-sheet')
    if (!sheet) return
    const delta = Math.max(0, dragState.current.currentY - dragState.current.startY)
    sheet.style.transition = 'none'
    sheet.style.transform = `translateY(${delta}px)`
  }
  function resetSheetTransform() {
    const sheet = document.getElementById('road-detail-sheet')
    if (!sheet) return
    sheet.style.transition = 'transform 300ms ease-out'
    sheet.style.transform = 'translateY(0)'
  }
  function closeSheet() {
    const sheet = document.getElementById('road-detail-sheet')
    if (sheet) {
      sheet.style.transition = 'transform 300ms ease-out'
      sheet.style.transform = 'translateY(100%)'
    }
    const backdrop = document.getElementById('road-detail-backdrop')
    if (backdrop) {
      backdrop.style.transition = 'opacity 300ms'
      backdrop.style.opacity = '0'
    }
    setTimeout(onClose, 300)
  }

  if (!road) return null

  const level = scoreToLevel(road.score)
  const card = STATUS_CARD[level]
  const water = getWaterCm(road.score)
  const sensorName =
    road.sensor_referensi ||
    t('road.sensorFallback', { id: String(road.id || '').replace('way/', 'JB-') || '—' })
  // Show the backend's own timestamp. If the socket hasn't told us yet we say
  // so instead of inventing a time.
  const updatedDate = toDate(dataUpdatedAt)
  const updatedAt = updatedDate
    ? t('road.updated', { time: formatTime(updatedDate), date: formatDate(updatedDate) })
    : t('road.updatedUnknown')

  return (
    <>
      <div
        id="road-detail-backdrop"
        onClick={closeSheet}
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${visible ? 'bg-black/20 dark:bg-black/40 opacity-100' : 'opacity-0'}`}
      />

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
        <div
          id="road-detail-sheet"
          className="w-full md:max-w-[480px] bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0px_-4px_24px_rgba(0,0,0,0.14)] px-5 pt-2.5 pb-6 pointer-events-auto"
          style={{
            transform: visible ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 300ms ease-out',
            maxHeight: '80vh',
          }}
        >
          <div
            className="flex justify-center py-1 cursor-grab active:cursor-grabbing touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="w-10 h-1 bg-[#E3E2E6] dark:bg-slate-700 rounded-sm" />
          </div>

          <div className="overflow-y-auto overflow-x-hidden premium-scrollbar flex flex-col gap-3" style={{ maxHeight: 'calc(80vh - 24px)' }}>
            {/* Sheet header */}
            <div className="flex items-center justify-between h-11">
              <span className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px]">
                {t('road.detail')}
              </span>
              <button
                type="button"
                onClick={closeSheet}
                aria-label={t('common.close')}
                className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <img src={`${A}/icon-close.svg`} width={20} height={20} alt="" className="dark:invert dark:opacity-80" />
              </button>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-semibold text-[#1A1B1E] dark:text-white leading-8 tracking-[-0.48px]">
                {road.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <img src={`${A}/icon-pin.svg`} width={14} height={14} alt="" className="shrink-0 dark:invert dark:opacity-70" />
                <span className="text-[13px] font-medium text-[#5B6270] dark:text-gray-400">
                  {t('road.kelurahan', { name: road.kelurahan || '—' })}
                </span>
              </div>
            </div>

            {/* Status card */}
            <div className={`rounded-2xl p-4 flex flex-col gap-2 ${card.bg}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold tracking-[0.6px] ${card.title}`}>
                  {t('road.statusNow')}
                </span>
                <RiskBadge level={level} />
              </div>
              <p className={`text-[40px] font-bold leading-[46px] tracking-[-0.8px] ${card.title}`}>
                {water} cm
              </p>
              <p className={`text-[13px] font-medium leading-5 ${card.desc}`}>
                {t(card.descKey)}
              </p>
            </div>

            {/* Updated at */}
            <div className="bg-[#FAF9FD] dark:bg-slate-800/60 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
              <img src={`${A}/icon-clock.svg`} width={16} height={16} alt="" className="shrink-0 dark:invert dark:opacity-70" />
              <span className="text-xs font-medium text-[#414754] dark:text-gray-300">
                {updatedAt}
              </span>
            </div>

            {/* Sumber data */}
            <div className="bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 rounded-2xl px-4 py-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px]">
                  {t('road.dataSource')}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#E6F6EC] dark:bg-emerald-950/60 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                  <span className="text-[11px] font-bold text-[#0F7B3E] dark:text-emerald-300">{t('common.active')}</span>
                </span>
              </div>
              <p className="text-[15px] font-semibold text-[#1A1B1E] dark:text-white leading-[22px]">
                {t('road.sensorStation', { name: sensorName })}
              </p>
              <p className="text-xs font-medium text-[#5B6270] dark:text-gray-400 leading-4">
                {t('road.sensorMethod')}
              </p>
            </div>

            {/* Risk scale */}
            <div className="bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 rounded-2xl px-4 py-3.5">
              <RiskScale score={road.score} level={level} />
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => onRouteHere?.(road)}
              className="w-full h-[52px] bg-[#005BBF] hover:bg-[#004A9E] rounded-xl flex items-center justify-center text-[15px] font-semibold text-white transition-colors cursor-pointer active:scale-[0.98]"
            >
              {t('road.routeHere')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default RoadDetailSheet
