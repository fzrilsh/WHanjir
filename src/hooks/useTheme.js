import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'map-theme'

// Nilai: "light" | "dark" | "system"
function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    // localStorage mungkin gak available
  }
  return 'system'
}

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme)

  // Resolve actual dark mode: preferensi user atau ikut sistem
  const isDark = theme === 'system' ? getSystemDark() : theme === 'dark'

  // Sync with document element class list for Tailwind v4 support
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // aman diabaikan
    }
  }, [])

  // Listen system theme change kalo mode "system"
  useEffect(() => {
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function handleChange() {
      // Force re-render biar isDark di-recalculate
      setThemeState('system')
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [theme])

  return { theme, setTheme, isDark }
}

export default useTheme
