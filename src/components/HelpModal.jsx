import { useState, useEffect, useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { toDate } from '../utils/freshness'

const base = import.meta.env.BASE_URL || '/'
const A = `${base}assets/whanjir`

const DRAG_THRESHOLD = 80

function useSheetDrag(sheetId, onClose) {
  const dragState = useRef({ active: false, startY: 0, currentY: 0 })
  function handlePointerDown(e) {
    dragState.current = { active: true, startY: e.clientY, currentY: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function handlePointerMove(e) {
    if (!dragState.current.active) return
    dragState.current.currentY = e.clientY
    const sheet = document.getElementById(sheetId)
    if (!sheet) return
    const delta = Math.max(0, dragState.current.currentY - dragState.current.startY)
    sheet.style.transition = 'none'
    sheet.style.transform = `translateY(${delta}px)`
  }
  function handlePointerUp() {
    if (!dragState.current.active) return
    dragState.current.active = false
    const delta = dragState.current.currentY - dragState.current.startY
    const sheet = document.getElementById(sheetId)
    if (sheet) {
      sheet.style.transition = 'transform 300ms ease-out'
      sheet.style.transform = delta > DRAG_THRESHOLD ? 'translateY(100%)' : 'translateY(0)'
      if (delta > DRAG_THRESHOLD) setTimeout(onClose, 300)
    }
  }
  return { handlePointerDown, handlePointerMove, handlePointerUp }
}

function InfoRow({ title, desc }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 rounded-xl px-3.5 py-3">
      <p className="text-[15px] font-semibold text-[#1A1B1E] dark:text-white leading-[22px]">{title}</p>
      <p className="text-xs font-medium text-[#5B6270] dark:text-gray-400 leading-4 mt-0.5">{desc}</p>
    </div>
  )
}

function HelpModal({ mode, dataUpdatedAt, onClose }) {
  const { t, formatDate, formatTime } = useI18n()
  const [visible, setVisible] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const { handlePointerDown, handlePointerMove, handlePointerUp } = useSheetDrag('info-sheet', onClose)

  useEffect(() => {
    if (!mode) return
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [mode])

  useEffect(() => {
    const updatedDate = toDate(dataUpdatedAt)
    setLastUpdated(
      updatedDate
        ? `${formatDate(updatedDate)}, ${formatTime(updatedDate)} WIB`
        : t('road.updatedUnknown'),
    )
  }, [dataUpdatedAt, formatDate, formatTime, t])

  useEffect(() => {
    if (!mode) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, onClose])

  if (!mode) return null

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${visible ? 'bg-black/20 dark:bg-black/40 opacity-100' : 'opacity-0'}`}
      />
      <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-center pointer-events-none">
        <div
          id="info-sheet"
          className="w-full md:max-w-[480px] bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0px_-4px_24px_rgba(0,0,0,0.18)] px-5 pt-2.5 pb-8 flex flex-col gap-3 pointer-events-auto max-h-[85vh] overflow-y-auto premium-scrollbar"
          style={{
            transform: visible ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 300ms ease-out',
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

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#1A1B1E] dark:text-white leading-7 tracking-[-0.4px]">
              {mode === 'data' ? t('help.dataTitle') : t('help.aboutTitle')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common.close')}
              className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <img src={`${A}/icon-close.svg`} width={20} height={20} alt="" className="dark:invert dark:opacity-80" />
            </button>
          </div>

          {mode === 'data' ? (
            <>
              {/* About */}
              <div>
                <p className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px] leading-4 mb-1.5 uppercase">
                  {t('help.aboutAppHeading')}
                </p>
                <p className="text-[13px] font-medium text-[#414754] dark:text-gray-300 leading-5">
                  {t('help.aboutBodyFull')}
                </p>
              </div>

              {/* Sources & methodology */}
              <div>
                <p className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px] leading-4 mb-1.5 uppercase">
                  {t('help.sourcesHeading')}
                </p>
                <div className="text-[13px] font-medium text-[#414754] dark:text-gray-300 leading-5 flex flex-col gap-2">
                  <p>
                    <span className="font-semibold text-[#1A1B1E] dark:text-gray-100">
                      {t('help.source1Lead')}
                    </span>{' '}
                    {t('help.source1Body')}
                  </p>
                  <p>
                    <span className="font-semibold text-[#1A1B1E] dark:text-gray-100">
                      {t('help.source2Lead')}
                    </span>{' '}
                    {t('help.source2Body')}
                  </p>
                </div>
              </div>

              {/* Data sources at a glance */}
              <div className="flex flex-col gap-2">
                <InfoRow title={t('help.dataSource')} desc={t('help.dataSourceDesc')} />
                <InfoRow title={t('help.scoring')} desc={t('help.scoringDesc')} />
                <InfoRow title={t('help.limitations')} desc={t('help.limitationsDesc')} />
                <InfoRow title={t('help.mapLicense')} desc="OpenStreetMap · ODbL" />
              </div>

              {/* Last update */}
              <div>
                <p className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px] leading-4 mb-1.5 uppercase">
                  {t('help.updateHeading')}
                </p>
                <div className="bg-[#EFF5FF] dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                  <span className="text-[12px] font-semibold text-[#1D4ED8] dark:text-blue-300">
                    {t('help.lastUpdatedLabel')} {lastUpdated}
                  </span>
                </div>
              </div>

              {/* Disclaimer */}
              <div>
                <p className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px] leading-4 mb-1.5 uppercase">
                  {t('help.disclaimerHeading')}
                </p>
                <div className="bg-[#FFFBEB] dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 rounded-xl px-3.5 py-3 flex flex-col gap-1">
                  <span className="text-[12px] font-bold text-[#92400E] dark:text-amber-300">
                    {t('help.disclaimerLead')}
                  </span>
                  <span className="text-[12px] font-medium text-[#92400E] dark:text-amber-300 leading-normal">
                    {t('help.disclaimerBodyFull')}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px] leading-4 mb-1.5">
                  {t('help.aboutApp')}
                </p>
                <p className="text-[13px] font-medium text-[#414754] dark:text-gray-300 leading-5">
                  {t('help.aboutBody')}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px] leading-4 mb-1.5">
                  {t('help.sourcesMethod')}
                </p>
                <div className="text-[13px] font-medium text-[#414754] dark:text-gray-300 leading-5 flex flex-col gap-2">
                  <p>{t('help.sourcePoint1')}</p>
                  <p>{t('help.sourcePoint2')}</p>
                </div>
              </div>

              <div className="bg-[#EFF5FF] dark:bg-blue-950/40 rounded-xl px-3.5 py-3">
                <p className="text-[11px] font-bold text-[#1D4ED8] dark:text-blue-300 leading-4">
                  {t('help.lastUpdate')}
                </p>
                <p className="text-[13px] font-semibold text-[#1D4ED8] dark:text-blue-300 leading-5 mt-1">
                  {lastUpdated}
                </p>
              </div>

              <div className="bg-[#FFFBEB] dark:bg-amber-950/40 rounded-xl px-3.5 py-3">
                <p className="text-[11px] font-bold text-[#92400E] dark:text-amber-300 leading-4">
                  {t('help.disclaimer')}
                </p>
                <p className="text-xs font-medium text-[#92400E] dark:text-amber-300 leading-4 mt-1.5">
                  {t('help.disclaimerBody')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default HelpModal
