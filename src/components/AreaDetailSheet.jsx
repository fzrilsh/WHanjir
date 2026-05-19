import { useEffect, useRef, useState } from 'react'
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
  if (avgScore >= 70) return { label: 'BANJIR PARAH', color: '#BA1A1A', statusText: 'Flooded Critical' }
  if (avgScore >= 40) return { label: 'TERGENANG', color: '#E88502', statusText: 'Moderate Flood' }
  return { label: 'AMAN', color: '#34C759', statusText: 'Not Flooded' }
}

function AreaDetailSheet({ area, onClose }) {
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

  return (
    <>
      {/* Backdrop */}
      <div
        id="area-detail-backdrop"
        onClick={handleClose}
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          visible ? 'bg-black/30 opacity-100' : 'bg-black/0 opacity-0'
        }`}
      />

      {/* Bottom Sheet */}
      <div
        id="area-detail-sheet"
        className="fixed inset-x-0 bottom-0 z-50"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms ease-out',
        }}
      >
        <div className="bg-white rounded-t-[24px] shadow-[0_-8px_40px_rgba(0,0,0,0.15)]"
          style={{ maxHeight: '85vh' }}
        >
          {/* Drag Handle */}
          <div
            className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="w-12 h-1.5 bg-[#C1C6D6] rounded-full" />
          </div>

          <div className="px-5 pb-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BuildingIcon className="w-[21px] h-[27px]" />
                  <h2 className="text-[26px] font-semibold text-[#1A1B1E] leading-8 tracking-[-0.65px]">
                    Kelurahan<br />{area.kelurahan}
                  </h2>
                </div>
                <div className="flex items-center gap-2 mt-1.5 ml-7">
                  <LocationPinIcon className="w-[11px] h-[14px]" />
                  <span className="text-sm text-[#414754]">
                    Kecamatan: {area.kelurahan.split(' ')[0] || area.kelurahan}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0 mt-0.5"
                aria-label="Tutup"
              >
                <CloseIcon className="w-5 h-5 text-[#414754]" />
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
                <span className="text-[13px] font-medium leading-5" style={{ color: risk.color }}>
                  {risk.statusText}
                </span>
              </div>
            </div>

            {/* Bento Grid Stats */}
            <div className="mt-6 flex gap-4">
              <div className="flex-1 bg-white rounded-2xl p-4 border border-[#E3E2E6]">
                <div className="flex items-center gap-2 mb-2">
                  <SensorSignalIcon className="w-[16.67px] h-[11.79px]" />
                  <span className="text-[11px] font-semibold text-[#414754] tracking-[0.55px] leading-[16.5px]">
                    ACTIVE SENSORS
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[36px] font-bold text-[#1A1B1E] leading-9">5</span>
                  <span className="text-sm text-[#414754] mt-1">Sensor</span>
                </div>
              </div>

              <div className="flex-1 bg-white rounded-2xl p-4 border border-[#E3E2E6]">
                <div className="flex items-center gap-2 mb-2">
                  <HeightArrowIcon className="w-[13.33px] h-[16.67px]" />
                  <span className="text-[11px] font-semibold text-[#414754] tracking-[0.55px] leading-[16.5px]">
                    HEIGHT
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[36px] font-bold text-[#1A1B1E] leading-9">
                    {Math.round(area.avg_road_score * 0.1)}
                  </span>
                  <span className="text-sm text-[#414754] mt-1">cm</span>
                </div>
              </div>
            </div>

            {/* Risk Score Card */}
            <div className="mt-3 bg-white rounded-2xl p-4 border border-[#C1C6D6]">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="text-[11px] font-semibold text-[#414754] tracking-[0.55px] leading-[16.5px]">
                    RISK SCORE
                  </span>
                  <p className="text-xl font-semibold text-[#1A1B1E] leading-7 mt-1.5">Critical Level</p>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[28px] font-bold leading-[42px]" style={{ color: risk.color }}>
                    {Math.round(area.avg_road_score)}
                  </span>
                  <span className="text-sm text-[#414754]">/100</span>
                </div>
              </div>
              <div className="h-[10px] bg-[#E3E2E6] rounded-full overflow-hidden mt-3">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(area.avg_road_score, 100)}%`, backgroundColor: risk.color }}
                />
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-4 flex items-start gap-3 bg-[#FAF9FD] rounded-2xl p-4 border border-[#E3E2E6]">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: hexToRgba(risk.color, 0.1) }}
              >
                <ForkIcon className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-[#1A1B1E] leading-[22.5px]">
                  {area.affected_roads} affected roads
                </p>
                <p className="text-sm text-[#414754] leading-[21px] mt-0.5">
                  Traffic severely disrupted
                </p>
              </div>
              <ChevronRightIcon className="w-[6px] h-[10px] mt-2 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AreaDetailSheet
