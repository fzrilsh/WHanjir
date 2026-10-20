import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ENDPOINTS } from '../config/api'
import { useI18n } from '../i18n/I18nProvider'

const base = import.meta.env.BASE_URL || '/'
const A = `${base}assets/whanjir`

function levelFromScore(score) {
  if (score >= 70) return 'banjir'
  if (score >= 40) return 'tergenang'
  return 'aman'
}

const DOT_COLORS = { banjir: '#BA1A1A', tergenang: '#E88502', aman: '#34C759' }

function FloatingSearchCard({ onSelectRoute }) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef(null)

  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([])
      setErrorMsg('')
      return
    }
    setIsSearching(true)
    setErrorMsg('')
    try {
      const response = await fetch(ENDPOINTS.search(query, 5))
      if (!response.ok) throw new Error('Gagal mengambil data')
      const data = await response.json()
      setSuggestions(data.results || [])
    } catch {
      setSuggestions([])
      setErrorMsg(t('search.errorBody'))
    } finally {
      setIsSearching(false)
    }
  }, [t])

  useEffect(() => {
    if (searchQuery.length === 0) {
      setSuggestions([])
      setErrorMsg('')
      return
    }
    const timer = setTimeout(() => fetchSuggestions(searchQuery), 350)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchSuggestions])

  useEffect(() => {
    async function loadRecent() {
      try {
        const response = await fetch(ENDPOINTS.search('jalan', 5))
        const data = await response.json()
        setRecentSearches(data.results || [])
      } catch {
        setRecentSearches([])
      }
    }
    loadRecent()
  }, [])

  const handleOpen = () => {
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSearchQuery('')
    setSuggestions([])
    setErrorMsg('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setSearchQuery('')
    setSuggestions([])
    setErrorMsg('')
    inputRef.current?.focus()
  }

  const handleSelect = (item) => {
    if (item.lat && item.lng) {
      onSelectRoute({ lat: item.lat, lng: item.lng, name: item.name })
      handleClose()
    }
  }

  const showSuggestions = suggestions.length > 0

  const row = (item) => {
    const dot = DOT_COLORS[levelFromScore(item.score)]
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleSelect(item)}
        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/5 cursor-pointer transition-colors text-left"
      >
        <img src={`${A}/icon-pin.svg`} width={14} height={14} alt="" className="shrink-0 dark:invert dark:opacity-70" />
        <span className="flex-1 min-w-0">
          <span className="block text-[15px] font-semibold text-[#1A1B1E] dark:text-gray-100 truncate leading-[22px]">
            {item.name}
          </span>
          <span className="block text-xs font-medium text-[#5B6270] dark:text-gray-400 truncate leading-4">
            {item.kelurahan}
          </span>
        </span>
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />
      </button>
    )
  }

  // Collapsed pill (design: SearchField)
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="w-full h-[52px] bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 rounded-full shadow-[0px_4px_8px_rgba(23,28,38,0.08)] flex items-center gap-3 pl-1.5 pr-3.5 cursor-pointer active:scale-[0.98] transition-transform pointer-events-auto"
      >
        <span className="w-10 h-10 rounded-full bg-[#005BBF] flex items-center justify-center shrink-0 overflow-hidden">
          <img src={`${A}/logo-drop-white.svg`} width={15} height={20} alt="WHanjir" />
        </span>
        <span className="flex-1 text-[15px] text-[#5B6270] dark:text-gray-400 text-center leading-[22px]">
          {t('search.placeholder')}
        </span>
        <img src={`${A}/icon-search.svg`} width={20} height={20} alt="" className="shrink-0 dark:invert dark:opacity-80" />
      </button>
    )
  }

  // Expanded search panel (design: Search)
  // Rendered in a portal at body level: the trigger sits inside a z-30 stacking
  // context, so an in-place backdrop (z-40) would paint over — and blur — the
  // panel itself.
  return (
    <>
      {/* Keeps the collapsed pill's slot so siblings (ViewToggle) don't jump */}
      <div className="w-full h-[52px] shrink-0" aria-hidden="true" />
      {createPortal(
        <>
          <div
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-[2px] pointer-events-auto"
          />
      <div className="fixed inset-x-0 top-4 z-50 mx-auto w-[calc(100%-32px)] max-w-[380px] md:max-w-[460px] flex flex-col gap-2.5 pointer-events-auto animate-fade-in-up">
        {/* Active search field */}
        <div className="w-full h-[52px] bg-white dark:bg-slate-900 border-2 border-[#005BBF] rounded-2xl flex items-center gap-2.5 pl-4 pr-1 overflow-hidden">
          <img src={`${A}/logo-drop-blue.svg`} width={16} height={20} alt="" className="shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="flex-1 min-w-0 bg-transparent text-[15px] font-semibold text-[#1A1B1E] dark:text-white leading-[22px] outline-none border-none placeholder:font-normal placeholder:text-[#5B6270] dark:placeholder:text-gray-500"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label={t('search.clear')}
              className="w-11 h-11 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <span className="w-6 h-6 rounded-full bg-[#E9EBEF] dark:bg-slate-700 flex items-center justify-center">
                <img src={`${A}/icon-close.svg`} width={12} height={12} alt="" className="dark:invert" />
              </span>
            </button>
          )}
        </div>

        {/* Results card */}
        <div className="w-full bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 rounded-2xl shadow-[0px_6px_20px_rgba(23,28,38,0.08)] max-h-[50vh] overflow-y-auto overflow-x-hidden py-1.5 px-2 premium-scrollbar">
          {isSearching && (
            <div className="px-3 py-4 flex items-center gap-3 text-sm text-[#5B6270] dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-300 dark:border-slate-700 border-t-[#005BBF] rounded-full animate-spin" />
              <span>{t('search.searching')}</span>
            </div>
          )}

          {errorMsg && (
            <div className="m-2 p-3 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-100 dark:border-red-900/50 rounded-xl text-xs">
              <span className="font-semibold block">{t('search.errorTitle')}</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {showSuggestions && !isSearching && (
            <div className="flex flex-col">
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-[#5B6270] dark:text-gray-500 uppercase tracking-widest">
                {t('search.results')}
              </div>
              {suggestions.map(row)}
            </div>
          )}

          {searchQuery.length === 0 && !isSearching && (
            <div className="flex flex-col">
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-[#5B6270] dark:text-gray-500 uppercase tracking-widest">
                {t('search.recent')}
              </div>
              {recentSearches.length > 0 ? (
                recentSearches.slice(0, 5).map(row)
              ) : (
                <div className="px-3 py-3 text-xs text-[#5B6270] dark:text-gray-500 italic">
                  {t('search.noHistory')}
                </div>
              )}
            </div>
          )}

          {!isSearching && searchQuery.length > 0 && suggestions.length === 0 && !errorMsg && (
            <div className="m-2 p-3 bg-red-50/70 dark:bg-red-950/20 text-red-800 dark:text-red-300 border border-red-100 dark:border-red-950/50 rounded-xl text-xs text-center">
              <span className="font-semibold block">{t('search.notFoundTitle')}</span>
              <span>{t('search.notFoundBody', { query: searchQuery })}</span>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] font-medium text-[#5B6270] dark:text-gray-400 tracking-[0.5px]">
          {t('search.source')}
        </p>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}

export default FloatingSearchCard
