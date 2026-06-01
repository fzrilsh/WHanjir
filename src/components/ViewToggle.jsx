const VIEWS = [
  { key: 'road', label: 'Tampilan Jalan' },
  { key: 'area', label: 'Tampilan Wilayah' },
]

function ViewToggle({ activeView, onToggle }) {
  return (
    <div className="absolute top-[90px] left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
      <div className="flex bg-white/90 dark:bg-slate-900/90 border border-gray-200/50 dark:border-slate-800/80 backdrop-blur-md rounded-full p-1 shadow-md gap-1">
        {VIEWS.map((view) => {
          const isActive = activeView === view.key
          return (
            <button
              key={view.key}
              type="button"
              onClick={() => onToggle(view.key)}
              className={`
                px-4 h-[36px] rounded-full flex items-center justify-center
                transition-all duration-200 whitespace-nowrap
                ${isActive ? 'bg-[#005bbf] dark:bg-blue-600 shadow-sm' : 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5'}
                active:scale-95
              `}
            >
              <span
                className={`
                  text-[13px] font-bold tracking-[0.1px] leading-5
                  ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}
                `}
              >
                {view.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ViewToggle
