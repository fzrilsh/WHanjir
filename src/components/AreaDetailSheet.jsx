import { useEffect, useRef, useState } from 'react'
import RiskBadge, { scoreToLevel } from './RiskBadge'
import RiskScale from './RiskScale'
import { useRoadData } from '../hooks/SocketProvider'
import { useI18n } from '../i18n/I18nProvider'

const base = import.meta.env.BASE_URL || '/'
const A = `${base}assets/whanjir`

const DRAG_THRESHOLD = 80

function StatCard({ value, label }) {
  return (
    <div className="flex-1 bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 rounded-[14px] p-3.5">
      <p className="text-[22px] font-bold text-[#1A1B1E] dark:text-white leading-[30px] tracking-[-0.44px]">
        {value}
      </p>
      <p className="text-[11px] font-medium text-[#5B6270] dark:text-gray-400 tracking-[0.5px] leading-4 mt-0.5">
        {label}
      </p>
    </div>
  )
}

function AreaDetailSheet({ area, onClose, onRouteHere }) {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)
  const dragState = useRef({ active: false, startY: 0, currentY: 0 })
  const { roads } = useRoadData()

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
    const sheet = document.getElementById('area-detail-sheet')
    if (!sheet) return
    const delta = Math.max(0, dragState.current.currentY - dragState.current.startY)
    sheet.style.transition = 'none'
    sheet.style.transform = `translateY(${delta}px)`
  }
  function handlePointerUp() {
    if (!dragState.current.active) return
    dragState.current.active = false
    const delta = dragState.current.currentY - dragState.current.startY
    if (delta > DRAG_THRESHOLD) closeSheet()
    else {
      const sheet = document.getElementById('area-detail-sheet')
      if (sheet) {
        sheet.style.transition = 'transform 300ms ease-out'
        sheet.style.transform = 'translateY(0)'
      }
    }
  }
  function closeSheet() {
    const sheet = document.getElementById('area-detail-sheet')
    if (sheet) {
      sheet.style.transition = 'transform 300ms ease-out'
      sheet.style.transform = 'translateY(100%)'
    }
    const backdrop = document.getElementById('area-detail-backdrop')
    if (backdrop) {
      backdrop.style.transition = 'opacity 300ms'
      backdrop.style.opacity = '0'
    }
    setTimeout(onClose, 300)
  }

  if (!area) return null

  const score = Math.round(area.avg_road_score || 0)
  const level = scoreToLevel(score)
  const waterCm = Math.round((area.avg_road_score || 0) * 0.1)
  const sensorCount = area.sensor_count ?? 0
  const affectedRoads = area.affected_roads ?? 0

  const areaRoads = (roads || [])
    .filter((r) => (r.kelurahan || '').toLowerCase() === (area.kelurahan || '').toLowerCase())
    .slice(0, 3)

  return (
    <>
      <div
        id="area-detail-backdrop"
        onClick={closeSheet}
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${visible ? 'bg-black/20 dark:bg-black/40 opacity-100' : 'opacity-0'}`}
      />

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
        <div
          id="area-detail-sheet"
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

          <div className="overflow-y-auto premium-scrollbar flex flex-col gap-3" style={{ maxHeight: 'calc(80vh - 24px)' }}>
            <div className="flex items-center justify-between h-11">
              <span className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px]">
                {t('area.detail')}
              </span>
              <button
                type="button"
                onClick={closeSheet}
                aria-label={t('common.close')}
                className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer -mr-2"
              >
                <img src={`${A}/icon-close.svg`} width={20} height={20} alt="" className="dark:invert dark:opacity-80" />
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#1A1B1E] dark:text-white leading-8 tracking-[-0.48px]">
                {area.kelurahan}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <img src={`${A}/icon-area.svg`} width={14} height={14} alt="" className="shrink-0 dark:invert dark:opacity-70" />
                <span className="text-[13px] font-medium text-[#5B6270] dark:text-gray-400">
                  {t('area.kecamatan', { name: area.kelurahan })}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-2.5">
              <StatCard value={sensorCount} label={t('area.activeSensors')} />
              <StatCard value={`${waterCm} ${t('common.cm')}`} label={t('area.waterLevel')} />
              <StatCard value={affectedRoads} label={t('area.affectedRoads')} />
            </div>

            {/* Skor risiko */}
            <div className="bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 rounded-2xl px-4 py-3.5">
              <RiskScale score={score} level={level} />
            </div>

            {/* Jalan di wilayah ini */}
            {areaRoads.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 rounded-2xl px-4 py-3.5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px]">
                    {t('area.roadsInArea')}
                  </span>
                </div>
                {areaRoads.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <span className="flex-1 text-[13px] font-medium text-[#1A1B1E] dark:text-white leading-5 truncate">
                      {r.name}
                    </span>
                    <RiskBadge level={scoreToLevel(r.score)} />
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => onRouteHere?.(area)}
              className="w-full h-[52px] bg-[#005BBF] hover:bg-[#004A9E] rounded-xl flex items-center justify-center text-[15px] font-semibold text-white transition-colors cursor-pointer active:scale-[0.98]"
            >
              {t('area.routeHere')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AreaDetailSheet
