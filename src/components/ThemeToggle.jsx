import { useState, useRef, useEffect } from 'react'

const OPTIONS = [
  { value: 'light', label: 'Terang', icon: '/icons/sun.svg' },
  { value: 'dark', label: 'Gelap', icon: '/icons/moon.svg' },
  { value: 'system', label: 'Ikut Sistem', icon: '/icons/monitor.svg' },
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
        className="w-9 h-9 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.15)] rounded flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        title={current.label}
      >
        <img src={current.icon} width={18} height={18} alt={current.label} />
      </button>

      {/* Dropdown — all options, highlight active */}
      {open && (
        <div className="absolute bottom-10 left-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-lg py-1 min-w-[150px] overflow-hidden">
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
                    ? 'bg-[#005bbf]/10 text-[#005bbf] font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <img
                  src={opt.icon}
                  width={16}
                  height={16}
                  alt=""
                  className={`shrink-0 ${isActive ? 'opacity-100' : 'opacity-60'}`}
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
