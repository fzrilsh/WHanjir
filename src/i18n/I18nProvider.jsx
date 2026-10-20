import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { translations, LANGUAGES, DEFAULT_LANGUAGE } from './translations'

const STORAGE_KEY = 'app-language'

const I18nContext = createContext(null)

function isSupported(value) {
  return LANGUAGES.some((l) => l.value === value)
}

/**
 * First visit: follow the browser's language — English browsers get English,
 * everything else falls back to Indonesian. Once the user picks a language
 * manually, that choice wins on every later visit.
 */
function getInitialLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isSupported(stored)) return stored
  } catch {
    // localStorage can be unavailable (private mode, blocked storage)
  }

  const browserLangs = [
    ...(navigator.languages || []),
    navigator.language,
  ].filter(Boolean)

  const prefersEnglish = browserLangs.some((tag) => /^en(-|$)/i.test(tag))
  return prefersEnglish ? 'en' : DEFAULT_LANGUAGE
}

/** Resolve a dot-separated key such as "road.detail". */
function lookup(dict, key) {
  return key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), dict)
}

function interpolate(template, params) {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    params[name] === undefined || params[name] === null ? match : String(params[name]),
  )
}

function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next) => {
    if (!isSupported(next)) return
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // safe to ignore
    }
  }, [])

  const t = useCallback(
    (key, params) => {
      const value = lookup(translations[lang], key)
      if (typeof value !== 'string') {
        // Fall back to the default language, then to the key itself, so a
        // missing translation is visible instead of rendering "undefined".
        const fallback = lookup(translations[DEFAULT_LANGUAGE], key)
        return typeof fallback === 'string' ? interpolate(fallback, params) : key
      }
      return interpolate(value, params)
    },
    [lang],
  )

  const locale = lang === 'en' ? 'en-GB' : 'id-ID'

  const formatDate = useCallback(
    (date) => new Date(date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }),
    [locale],
  )

  const formatTime = useCallback(
    (date) => new Date(date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    [locale],
  )

  const value = useMemo(
    () => ({ lang, setLang, t, locale, formatDate, formatTime }),
    [lang, setLang, t, locale, formatDate, formatTime],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}

export default I18nProvider
