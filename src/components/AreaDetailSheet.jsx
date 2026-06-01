import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import BuildingIcon from './icons/BuildingIcon'
import LocationPinIcon from './icons/LocationPinIcon'
import CloseIcon from './icons/CloseIcon'
import SensorSignalIcon from './icons/SensorSignalIcon'
import HeightArrowIcon from './icons/HeightArrowIcon'
import ForkIcon from './icons/ForkIcon'
import ChevronRightIcon from './icons/ChevronRightIcon'

const DRAG_THRESHOLD = 80

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getRiskLevel(avgScore) {
  if (avgScore >= 70) return { label: 'BANJIR', color: '#BA1A1A', statusText: 'Banjir Kritis' }
  if (avgScore >= 40) return { label: 'TERGENANG', color: '#E88502', statusText: 'Genangan Sedang' }
  return { label: 'AMAN', color: '#34C759', statusText: 'Aman Bebas Banjir' }
}

function AreaDetailSheet({ area, onClose }) {
  const [visible, setVisible] = useState(false)
  const [showSensorTooltip, setShowSensorTooltip] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, placement: 'top' })
  const triggerRef = useRef(null)
  const dragState = useRef({ active: false, startY: 0, currentY: 0 })
  const closeTimeoutRef = useRef(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => {
      cancelAnimationFrame(frame)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  function handleTooltipOpen() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const tooltipHeight = 220
      const spaceAbove = rect.top
      const placement = spaceAbove > tooltipHeight + 20 ? 'top' : 'bottom'

      let top = 0
      if (placement === 'top') {
        top = rect.top - 8
      } else {
        top = rect.bottom + 8
      }

      const tooltipWidth = 224 // w-56
      let left = rect.left + rect.width / 2
      if (left - tooltipWidth / 2 < 12) {
        left = tooltipWidth / 2 + 12
      } else if (left + tooltipWidth / 2 > window.innerWidth - 12) {
        left = window.innerWidth - tooltipWidth / 2 - 12
      }

      setTooltipPos({ top, left, placement })
    }
    setShowSensorTooltip(true)
  }

  function handleTooltipClose() {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = setTimeout(() => {
      setShowSensorTooltip(false)
    }, 150)
  }

  function handleTooltipToggle(e) {
    e.stopPropagation()
    if (showSensorTooltip) {
      setShowSensorTooltip(false)
    } else {
      handleTooltipOpen()
    }
  }

  function handleTooltipMouseEnter() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

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
    const sheet = document.getElementById('area-detail-sheet')
    if (!sheet) return
    const delta = Math.max(0, dragState.current.currentY - dragState.current.startY)
    sheet.style.transition = 'none'
    sheet.style.transform = `translateY(${delta}px)`
  }

  function resetSheetTransform() {
    const sheet = document.getElementById('area-detail-sheet')
    if (!sheet) return
    sheet.style.transition = 'transform 300ms ease-out'
    sheet.style.transform = 'translateY(0)'
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

  function handleClose() {
    closeSheet()
  }

  if (!area) return null

  const risk = getRiskLevel(area.avg_road_score)

  let sensorList = []
  try {
    if (area.sensors) {
      sensorList = typeof area.sensors === 'string' ? JSON.parse(area.sensors) : area.sensors
    }
  } catch (e) {
    console.error("Error parsing sensors:", e)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        id="area-detail-backdrop"
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
          id="area-detail-sheet"
          className="bg-white dark:bg-slate-900 border-t md:border border-transparent dark:border-slate-800/80 md:border-gray-200/80 rounded-t-[24px] md:rounded-[24px] shadow-[0_-8px_40px_rgba(0,0,0,0.15)] transition-colors"
          style={{
            transform: visible ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 300ms ease-out',
            maxHeight: '85vh'
          }}
        >
          {/* Drag Handle */}
          <div
            className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="w-12 h-1.5 bg-[#C1C6D6] dark:bg-slate-700 rounded-full" />
          </div>

          <div className="px-5 pb-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <BuildingIcon className="w-[21px] h-[27px] text-[#005BBF] dark:text-blue-500" />
                  <h2 className="text-[26px] font-semibold text-[#1A1B1E] dark:text-white leading-8 tracking-[-0.65px]">
                    Kelurahan<br />{area.kelurahan}
                  </h2>
                </div>
                <div className="flex items-center gap-2 mt-1.5 ml-7">
                  <LocationPinIcon className="w-[11px] h-[14px] text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-[#414754] dark:text-gray-300">
                    Kecamatan: {area.kelurahan.split(' ')[0] || area.kelurahan}
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

            {/* Status Badge */}
            <div className="mt-6 flex items-center gap-3">
              <div
                className="flex items-center rounded-full px-4 py-1.5"
                style={{ backgroundColor: risk.color }}
              >
                <span className="text-[13px] font-bold text-white tracking-[0.65px] leading-5">
                  {risk.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: risk.color }} />
                <span className="text-[13px] font-medium leading-5 animate-pulse" style={{ color: risk.color }}>
                  {risk.statusText}
                </span>
              </div>
            </div>

            {/* Bento Grid Stats */}
            <div className="mt-6 flex gap-4">
              <div className="relative flex-1 bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-[#E3E2E6] dark:border-slate-800/80 shadow-sm transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <SensorSignalIcon className="w-[16.67px] h-[11.79px] text-[#005BBF] dark:text-blue-500" />
                  <span className="text-[11px] font-bold text-[#414754] dark:text-gray-400 tracking-[0.55px] leading-[16.5px]">
                    SUMBER DATA
                  </span>

                  {/* Tooltip trigger button */}
                  <div className="relative shrink-0 flex items-center">
                    <button
                      ref={triggerRef}
                      type="button"
                      onClick={handleTooltipToggle}
                      onMouseEnter={handleTooltipOpen}
                      onMouseLeave={handleTooltipClose}
                      className="w-3.5 h-3.5 rounded-full bg-gray-100 dark:bg-slate-700/80 flex items-center justify-center text-[9px] text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-250 dark:hover:bg-slate-600 cursor-pointer pointer-events-auto select-none transition-all duration-200"
                      aria-label="Info sensor aktif"
                    >
                      ?
                    </button>

                    {/* Floating Tooltip Card rendered in document.body Portal */}
                    {showSensorTooltip && createPortal(
                      <div
                        onMouseEnter={handleTooltipMouseEnter}
                        onMouseLeave={handleTooltipClose}
                        style={{
                          position: 'fixed',
                          top: `${tooltipPos.top}px`,
                          left: `${tooltipPos.left}px`,
                          transform: tooltipPos.placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
                        }}
                        className="w-56 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-gray-200 dark:border-slate-800 rounded-xl shadow-xl text-[11px] text-gray-655 dark:text-gray-300 leading-normal pointer-events-auto z-[9999] text-left animate-fade-in-up transition-all"
                      >
                        <div className="font-bold text-[11px] text-gray-800 dark:text-white mb-1.5 border-b border-gray-100 dark:border-slate-800 pb-1">
                          Sensor Aktif Wilayah:
                        </div>
                        {sensorList.length > 0 ? (
                          <ul className="list-disc pl-3.5 space-y-1 text-gray-650 dark:text-gray-400 font-medium max-h-36 overflow-y-auto premium-scrollbar pr-1">
                            {sensorList.map((v, i) => (
                              <li key={i} className="hover:text-[#005BBF] dark:hover:text-blue-400 transition-colors">
                                {v}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 dark:text-gray-500 italic">Tidak ada sensor aktif</p>
                        )}
                      </div>,
                      document.body
                    )}
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[36px] font-bold text-[#1A1B1E] dark:text-white leading-9">{area.sensor_count}</span>
                  <span className="text-sm text-[#414754] dark:text-gray-300 mt-1">Sensor</span>
                </div>
              </div>

              <div className="flex-1 bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-[#E3E2E6] dark:border-slate-800/80 shadow-sm transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <HeightArrowIcon className="w-[13.33px] h-[16.67px] text-[#005BBF] dark:text-blue-500" />
                  <span className="text-[11px] font-bold text-[#414754] dark:text-gray-400 tracking-[0.55px] leading-[16.5px]">
                    TINGGI GENANGAN
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[36px] font-bold text-[#1A1B1E] dark:text-white leading-9">
                    {Math.round(area.avg_road_score * 0.1)}
                  </span>
                  <span className="text-sm text-[#414754] dark:text-gray-300 mt-1">cm</span>
                </div>
              </div>
            </div>

            {/* Risk Score Card */}
            <div className="mt-3 bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-[#C1C6D6] dark:border-slate-800/80 shadow-sm transition-colors">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="text-[11px] font-bold text-[#414754] dark:text-gray-400 tracking-[0.55px] leading-[16.5px]">
                    SKOR RISIKO
                  </span>
                  <p className="text-xl font-semibold text-[#1A1B1E] dark:text-white leading-7 mt-1.5">
                    {risk.label === 'BANJIR PARAH' ? 'Tingkat Kritis' : risk.label === 'TERGENANG' ? 'Tingkat Waspada' : 'Tingkat Aman'}
                  </p>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[28px] font-bold leading-[42px]" style={{ color: risk.color }}>
                    {Math.round(area.avg_road_score)}
                  </span>
                  <span className="text-sm text-[#414754] dark:text-gray-400">/100</span>
                </div>
              </div>
              <div className="h-[10px] bg-[#E3E2E6] dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(area.avg_road_score, 100)}%`, backgroundColor: risk.color }}
                />
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-4 flex items-start gap-3 bg-[#FAF9FD] dark:bg-slate-800/30 rounded-2xl p-4 border border-[#E3E2E6] dark:border-slate-800/80 shadow-sm transition-colors">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: hexToRgba(risk.color, 0.1) }}
              >
                <ForkIcon className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-[#1A1B1E] dark:text-white leading-[22.5px]">
                  {area.affected_roads} jalan terdampak
                </p>
                <p className="text-sm text-[#414754] dark:text-gray-300 leading-[21px] mt-0.5">
                  {risk.label === 'BANJIR PARAH' ? 'Lalu lintas sangat terganggu' : risk.label === 'TERGENANG' ? 'Lalu lintas terganggu' : 'Lalu lintas aman lancar'}
                </p>
              </div>
              <ChevronRightIcon className="w-[6px] h-[10px] mt-2 shrink-0 text-[#414754] dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AreaDetailSheet
