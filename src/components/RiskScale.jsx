import { useI18n } from '../i18n/I18nProvider'

const LEVEL_TEXT = {
  aman: 'text-[#1E9E4A] dark:text-emerald-400',
  tergenang: 'text-[#E88502] dark:text-amber-400',
  banjir: 'text-[#BA1A1A] dark:text-red-400',
}

const LEVEL_LABEL_KEY = {
  aman: 'risk.levelSafe',
  tergenang: 'risk.levelFlooded',
  banjir: 'risk.levelFlood',
}

function RiskScale({ score = 0, level = 'aman', className = '' }) {
  const { t } = useI18n()
  const pct = Math.max(0, Math.min(100, score))
  const levelLabel = LEVEL_LABEL_KEY[level] ? ` · ${t(LEVEL_LABEL_KEY[level])}` : ''
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#5B6270] dark:text-gray-400">
          {t('risk.riskLevel')}
        </span>
        <span className={`font-bold tracking-[0.6px] ${LEVEL_TEXT[level] || LEVEL_TEXT.aman}`}>
          {Math.round(score)} / 100{levelLabel}
        </span>
      </div>
      <div className="relative h-2 rounded bg-gradient-to-r from-[#2BB673] via-[#E88502] to-[#D93B30]">
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#1A1B1E] dark:border-slate-900 shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex items-start justify-between text-[11px] font-medium text-[#5B6270] dark:text-gray-400 tracking-[0.5px]">
        <span>{t('risk.scaleSafe')}</span>
        <span>{t('risk.scaleCaution')}</span>
        <span>{t('risk.scaleFlood')}</span>
      </div>
    </div>
  )
}

export default RiskScale
