import { useState, useRef, useEffect } from 'react'

const base = import.meta.env.BASE_URL || '/'

const OPTIONS = [
  { value: 'light', label: 'Terang', icon: `${base}icons/sun.svg` },
  { value: 'dark', label: 'Gelap', icon: `${base}icons/moon.svg` },
  { value: 'system', label: 'Ikut Sistem', icon: `${base}icons/monitor.svg` },
]

function ThemeToggle({ theme, onChange }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    requestAnimationFrame(() => document.addEventListener('click', handleClick))
    return () => document.removeEventListener('click', handleClick)
  }, [open])

  const current = OPTIONS.find((o) => o.value === theme) || OPTIONS[2]

  return (
    <div ref={panelRef} className="relative pointer-events-auto">
      {/* Current mode button — like MapLibre view control */}
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800/80 shadow-[0_2px_4px_rgba(0,0,0,0.15)] rounded flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 active:bg-gray-100 dark:active:bg-slate-750 transition-colors cursor-pointer text-gray-750 dark:text-gray-250"
        title={current.label}
      >
        <img src={current.icon} width={18} height={18} alt={current.label} className="dark:invert dark:opacity-85" />
      </button>

      {/* Dropdown — all options, highlight active */}
      {open && (
        <div className="absolute bottom-10 left-0 bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-lg py-1 min-w-[150px] overflow-hidden">
          {OPTIONS.map((opt) => {
            const isActive = opt.value === theme
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#005bbf]/10 dark:bg-blue-500/10 text-[#005bbf] dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <img
                  src={opt.icon}
                  width={16}
                  height={16}
                  alt=""
                  className={`shrink-0 dark:invert ${isActive ? 'opacity-100 dark:opacity-90' : 'opacity-60 dark:opacity-50'}`}
                />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ThemeToggle
