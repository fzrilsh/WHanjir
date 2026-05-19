const VIEWS = [
  { key: 'road', label: 'Road View' },
  { key: 'area', label: 'Area View' },
]

function ViewToggle({ activeView, onToggle }) {
  return (
    <div className="absolute top-[90px] left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
      <div className="flex bg-white/80 backdrop-blur-md rounded-full p-1 shadow-md w-[214px] h-[44px]">
        {VIEWS.map((view) => {
          const isActive = activeView === view.key
          return (
            <button
              key={view.key}
              type="button"
              onClick={() => onToggle(view.key)}
              className={`
                flex-1 h-full rounded-full flex items-center justify-center
                transition-all duration-200
                ${isActive ? 'bg-[#005bbf]' : 'bg-transparent hover:bg-black/5'}
                active:scale-95
              `}
            >
              <span
                className={`
                  text-[14px] font-semibold tracking-[0.1px] leading-5
                  ${isActive ? 'text-white' : 'text-[#414754]'}
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
