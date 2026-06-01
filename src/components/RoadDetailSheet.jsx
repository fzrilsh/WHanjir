import { useEffect, useRef, useState } from 'react'
import RoadJunctionIcon from './icons/RoadJunctionIcon'
import LocationPinIcon from './icons/LocationPinIcon'
import CloseIcon from './icons/CloseIcon'
import WarningTriangleIcon from './icons/WarningTriangleIcon'
import SensorSignalIcon from './icons/SensorSignalIcon'

const DRAG_THRESHOLD = 80

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getStatusLevel(score) {
  if (score >= 70) {
    // Skala banjir: 30 cm sampai 100 cm
    const water = Math.round((score - 70) * (70 / 30) + 30)
    return { label: 'BANJIR', color: '#BA1A1A', water }
  }
  if (score >= 40) {
    // Skala tergenang: 10 cm sampai 29 cm
    const water = Math.round((score - 40) * (20 / 30) + 2)
    return { label: 'TERGENANG', color: '#FFCC00', water }
  }
  // Aman: 0 cm (jalan kering)
  return { label: 'AMAN', color: '#34C759', water: 0 }
}

function RoadDetailSheet({ road, onClose }) {
  const [visible, setVisible] = useState(false)
  const dragState = useRef({ active: false, startY: 0, currentY: 0 })

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

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
    if (delta > DRAG_THRESHOLD) {
      closeSheet()
    } else {
      resetSheetTransform()
    }
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

  function handleClose() {
    closeSheet()
  }

  if (!road) return null

  const status = getStatusLevel(road.score)

  return (
    <>
      {/* Backdrop */}
      <div
        id="road-detail-backdrop"
        onClick={handleClose}
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${visible ? 'bg-black/30 opacity-100' : 'bg-black/0 opacity-0'
          }`}
      />

      {/* Bottom Sheet Wrapper */}
      <div
        className="fixed inset-x-0 bottom-0 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:inset-x-auto w-full md:max-w-[400px] z-50 pointer-events-auto"
      >
        {/* Animated Inner Sheet */}
        <div
          id="road-detail-sheet"
          className="bg-white dark:bg-slate-900 border-t md:border border-transparent dark:border-slate-800/80 md:border-gray-200/80 rounded-t-[24px] md:rounded-[24px] shadow-[0_-8px_40px_rgba(0,0,0,0.15)] transition-colors"
          style={{
            transform: visible ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 300ms ease-out',
            maxHeight: '75vh'
          }}
        >
          {/* Drag Handle */}
          <div
            className="flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="w-12 h-1.5 bg-[#C1C6D6] dark:bg-slate-700 rounded-full" />
          </div>

          <div className="px-4 pb-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <RoadJunctionIcon className="w-[19px] h-[19px] text-[#005BBF] dark:text-blue-500" />
                  <h2 className="text-xl font-semibold text-[#1A1B1E] dark:text-white leading-7">
                    {road.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2 ml-[27px] mt-1">
                  <LocationPinIcon className="!w-[11px] !h-[14px] text-gray-400 dark:text-gray-500" />
                  <span className="text-xs font-medium text-[#414754] dark:text-gray-300 leading-4">
                    Kelurahan: {road.kelurahan}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-[#414754] dark:text-gray-400 transition-colors shrink-0 mt-0.5"
                aria-label="Tutup"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics */}
            <div className="mt-6 flex flex-col gap-3">
              {/* Status Area Card — dynamic bg/border by status */}
              <div
                className="rounded-3xl p-4 relative overflow-hidden"
                style={{
                  backgroundColor: hexToRgba(status.color, 0.1),
                  border: `1px solid ${hexToRgba(status.color, 0.3)}`,
                }}
              >
                <div
                  className="absolute -right-8 -top-16 w-32 h-32 rounded-full opacity-10"
                  style={{ backgroundColor: status.color }}
                />

                <div className="relative z-[1]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#414754] dark:text-gray-400 tracking-[0.6px]">
                      STATUS JALAN
                    </span>
                    <div
                      className="flex items-center gap-1.5 rounded-full px-3 py-1"
                      style={{ backgroundColor: status.color }}
                    >
                      {status.label === 'BANJIR PARAH' && (
                        <WarningTriangleIcon className="w-[12.83px] h-[11.08px]" />
                      )}
                      <span className="text-[11px] font-bold text-white tracking-[0.275px] leading-4">
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-[2.4px]">
                    <span
                      className="text-[32px] font-bold leading-10 tracking-[-0.64px]"
                      style={{ color: status.color }}
                    >
                      {status.water}
                    </span>
                    <span
                      className="text-2xl font-semibold leading-8 tracking-[-0.64px]"
                      style={{ color: status.color }}
                    >
                      cm
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-[#414754] dark:text-gray-400 tracking-[0.5px] leading-4 mt-1">
                    Tinggi Air Saat Ini
                  </p>
                </div>
              </div>

              {/* Sensor Info Card — dynamic icon bg + color by status */}
              <div className="rounded-[48px] p-4 flex items-center gap-4 bg-white dark:bg-slate-800/50 border border-[#E3E2E6] dark:border-slate-800/80 shadow-sm transition-colors">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: hexToRgba(status.color, 0.1),
                    color: status.color,
                  }}
                >
                  <SensorSignalIcon className="w-5 h-[15px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#414754] dark:text-gray-400 leading-4">
                    Sumber Data
                  </p>
                  <p className="text-sm font-medium text-[#1A1B1E] dark:text-white leading-5 mt-0.5">
                    {road.sensor_referensi || `Sensor Banjir ${String(road.id).replace('way/', 'JB-') || 'JB-012'}`}
                  </p>
                </div>
              </div>

              {/* Risk Score Card */}
              <div className="rounded-[48px] p-4 bg-white dark:bg-slate-800/50 border border-[#E3E2E6] dark:border-slate-800/80 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#414754] dark:text-gray-400 leading-4">
                    Tingkat Risiko
                  </span>
                  <div className="flex items-baseline gap-0.5">
                    <span
                      className="text-sm font-bold leading-5 tracking-[0.1px]"
                      style={{ color: status.color }}
                    >
                      {Math.round(road.score)}
                    </span>
                    <span className="text-[11px] font-normal text-[#414754] dark:text-gray-450 tracking-[0.5px] leading-4">
                      /100
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-[10px] bg-[#E3E2E6] dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ width: `${Math.min(road.score, 100)}%`, backgroundColor: status.color }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'repeating-linear-gradient(-45deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 2px, transparent 5px)',
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] font-medium text-[#414754] dark:text-gray-450 opacity-70 tracking-[0.5px] leading-4">
                    Aman
                  </span>
                  <span className="text-[11px] font-medium text-[#414754] dark:text-gray-450 opacity-70 tracking-[0.5px] leading-4">
                    Kritis
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RoadDetailSheet
