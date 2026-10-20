import { useI18n } from '../i18n/I18nProvider'

const LEVELS = {
  aman: {
    labelKey: 'risk.safe',
    bg: 'bg-[#E6F6EC] dark:bg-emerald-950/60',
    text: 'text-[#0F7B3E] dark:text-emerald-300',
    dot: '#34C759',
  },
  tergenang: {
    labelKey: 'risk.flooded',
    bg: 'bg-[#FFFBEB] dark:bg-amber-950/60',
    text: 'text-[#92400E] dark:text-amber-300',
    dot: '#E88502',
  },
  banjir: {
    labelKey: 'risk.flood',
    bg: 'bg-[#FEF2F2] dark:bg-red-950/60',
    text: 'text-[#B91C1C] dark:text-red-300',
    dot: '#BA1A1A',
  },
}

export function scoreToLevel(score) {
  if (score >= 70) return 'banjir'
  if (score >= 40) return 'tergenang'
  return 'aman'
}

function RiskBadge({ level = 'aman', className = '' }) {
  const { t } = useI18n()
  const l = LEVELS[level] || LEVELS.aman
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full ${l.bg} ${className}`}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: l.dot }}
      />
      <span className={`text-[11px] font-bold leading-4 whitespace-nowrap ${l.text}`}>
        {t(l.labelKey)}
      </span>
    </span>
  )
}

export default RiskBadge
