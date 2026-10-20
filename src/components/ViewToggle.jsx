import { useI18n } from '../i18n/I18nProvider'

const VIEWS = [
  { key: 'road', labelKey: 'view.road' },
  { key: 'area', labelKey: 'view.area' },
]

function ViewToggle({ activeView, onToggle }) {
  const { t } = useI18n()
  return (
    <div className="flex bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 rounded-full p-[5px] shadow-[0px_2px_5px_rgba(23,28,38,0.08)] gap-1 pointer-events-auto">
      {VIEWS.map((view) => {
        const isActive = activeView === view.key
        return (
          <button
            key={view.key}
            type="button"
            onClick={() => onToggle(view.key)}
            className={`px-5 h-[34px] rounded-full flex items-center justify-center transition-all duration-200 whitespace-nowrap cursor-pointer active:scale-95 ${
              isActive
                ? 'bg-[#005BBF] shadow-sm'
                : 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <span
              className={`text-sm leading-5 ${
                isActive
                  ? 'font-semibold text-white'
                  : 'font-medium text-[#414754] dark:text-gray-300'
              }`}
            >
              {t(view.labelKey)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default ViewToggle
