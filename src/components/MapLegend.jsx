import { useI18n } from '../i18n/I18nProvider'

function MapLegend() {
  const { t } = useI18n()
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 rounded-full shadow-[0px_2px_5px_rgba(23,28,38,0.08)] px-3 py-2 flex items-center gap-3.5 pointer-events-auto">
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#BA1A1A] shrink-0" />
        <span className="text-xs font-medium text-[#414754] dark:text-gray-300 whitespace-nowrap">{t('legend.flood')}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#E88502] shrink-0" />
        <span className="text-xs font-medium text-[#414754] dark:text-gray-300 whitespace-nowrap">{t('legend.flooded')}</span>
      </span>
    </div>
  )
}

export default MapLegend
