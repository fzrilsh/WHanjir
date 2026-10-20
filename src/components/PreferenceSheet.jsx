import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { LANGUAGES } from '../i18n/translations'

const base = import.meta.env.BASE_URL || '/'
const A = `${base}assets/whanjir`

const DRAG_THRESHOLD = 80

function OptionButton({ active, onClick, icon, badge, label, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-colors text-left ${
        active
          ? 'bg-[#E6F6EC] dark:bg-emerald-950/40'
          : 'hover:bg-black/[0.03] dark:hover:bg-white/5'
      }`}
    >
      <span className="w-8 h-8 rounded-full bg-[#FAF9FD] dark:bg-slate-800 flex items-center justify-center shrink-0">
        {icon ? (
          <img src={icon} width={16} height={16} alt="" className="dark:invert dark:opacity-80" />
        ) : (
          <span className="text-[11px] font-bold uppercase text-[#1A1B1E] dark:text-white">{badge}</span>
        )}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-semibold text-[#1A1B1E] dark:text-white leading-[22px]">
          {label}
        </span>
        {desc && (
          <span className="block text-xs font-medium text-[#5B6270] dark:text-gray-400 leading-4">
            {desc}
          </span>
        )}
      </span>
      {active && (
        <img src={`${A}/icon-check.svg`} width={20} height={20} alt="" className="shrink-0" />
      )}
    </button>
  )
}

function PreferenceSheet({ theme, onThemeChange, open, onClose }) {
  const { t, lang, setLang } = useI18n()
  const [visible, setVisible] = useState(false)
  const dragState = useRef({ active: false, startY: 0, currentY: 0 })

  const themeOptions = [
    { value: 'light', label: t('preference.light'), desc: t('preference.lightDesc'), icon: `${A}/icon-theme-sun.svg` },
    { value: 'dark', label: t('preference.dark'), desc: t('preference.darkDesc'), icon: `${A}/icon-theme-moon.svg` },
    { value: 'system', label: t('preference.system'), desc: t('preference.systemDesc'), icon: `${A}/icon-theme.svg` },
  ]

  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(frame)
    }
    setVisible(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  function handlePointerDown(e) {
    dragState.current = { active: true, startY: e.clientY, currentY: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function handlePointerMove(e) {
    if (!dragState.current.active) return
    dragState.current.currentY = e.clientY
    const sheet = document.getElementById('preference-sheet')
    if (!sheet) return
    const delta = Math.max(0, dragState.current.currentY - dragState.current.startY)
    sheet.style.transition = 'none'
    sheet.style.transform = `translateY(${delta}px)`
  }
  function handlePointerUp() {
    if (!dragState.current.active) return
    dragState.current.active = false
    const delta = dragState.current.currentY - dragState.current.startY
    const sheet = document.getElementById('preference-sheet')
    if (!sheet) return
    sheet.style.transition = 'transform 300ms ease-out'
    sheet.style.transform = delta > DRAG_THRESHOLD ? 'translateY(100%)' : 'translateY(0)'
    if (delta > DRAG_THRESHOLD) setTimeout(onClose, 300)
  }

  if (!open) return null

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${visible ? 'bg-black/20 dark:bg-black/40 opacity-100' : 'opacity-0'}`}
      />
      <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-center pointer-events-none">
        <div
          id="preference-sheet"
          className="w-full md:max-w-[480px] bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0px_-4px_24px_rgba(0,0,0,0.14)] px-5 pt-2.5 pb-8 flex flex-col gap-3 pointer-events-auto max-h-[85vh] overflow-y-auto premium-scrollbar"
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

          <h2 className="text-xl font-semibold text-[#1A1B1E] dark:text-white leading-7 tracking-[-0.4px]">
            {t('preference.title')}
          </h2>
          <p className="text-[13px] font-medium text-[#5B6270] dark:text-gray-400 leading-5 -mt-1">
            {t('preference.subtitle')}
          </p>

          {/* Theme */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px] px-1 pb-1">
              {t('preference.theme')}
            </span>
            {themeOptions.map((opt) => (
              <OptionButton
                key={opt.value}
                active={opt.value === theme}
                onClick={() => onThemeChange(opt.value)}
                icon={opt.icon}
                label={opt.label}
                desc={opt.desc}
              />
            ))}
          </div>

          {/* Language */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#5B6270] dark:text-gray-400 tracking-[0.6px] px-1 pb-1">
              {t('preference.language')}
            </span>
            {LANGUAGES.map((opt) => (
              <OptionButton
                key={opt.value}
                active={opt.value === lang}
                onClick={() => setLang(opt.value)}
                badge={opt.value}
                label={opt.label}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default PreferenceSheet
