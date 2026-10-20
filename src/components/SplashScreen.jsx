import { useEffect, useState, useMemo } from 'react'
import { useI18n } from '../i18n/I18nProvider'

const base = import.meta.env.BASE_URL || '/'

function SplashScreen({ ready, onFinish, connected, roadsReady, tematicReady, mapReady, isOnline, serverOffline }) {
  const { t } = useI18n()
  const [fadeOut, setFadeOut] = useState(false)
  const [minTimeDone, setMinTimeDone] = useState(false)
  const [showOffline, setShowOffline] = useState(false)
  const [showServerOffline, setShowServerOffline] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeDone(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (minTimeDone && ready && !fadeOut) {
      setFadeOut(true)
    }
  }, [minTimeDone, ready, fadeOut])

  // Detect offline: navigator.onLine gak selalu reliable.
  // Fallback: kalau socket gak nyambung dalam 8 detik, anggap offline.
  const [socketTimeout, setSocketTimeout] = useState(false)

  useEffect(() => {
    if (connected || ready) {
      setSocketTimeout(false)
      return
    }
    const timer = setTimeout(() => setSocketTimeout(true), 8000)
    return () => clearTimeout(timer)
  }, [connected, ready])

  // Tampilkan offline state
  useEffect(() => {
    const isActuallyOffline = !connected && (socketTimeout || !isOnline)

    if (isActuallyOffline && minTimeDone) {
      const timer = setTimeout(() => setShowOffline(true), 2000)
      return () => clearTimeout(timer)
    }

    setShowOffline(false)
  }, [connected, socketTimeout, isOnline, minTimeDone])

  // Detect server offline (both backends unreachable but user has internet)
  useEffect(() => {
    if (serverOffline && minTimeDone) {
      const timer = setTimeout(() => setShowServerOffline(true), 500)
      return () => clearTimeout(timer)
    }
    setShowServerOffline(false)
  }, [serverOffline, minTimeDone])

  // Real progress based on actual milestones
  const STATUS_MESSAGES = [
    t('splash.starting'),
    t('splash.connecting'),
    t('splash.loadingRoads'),
    t('splash.loadingAreas'),
    t('splash.preparingMap'),
    t('splash.ready'),
  ]

  const currentPhase = useMemo(() => {
    if (ready) return 5
    if (mapReady) return 4
    if (tematicReady) return 3
    if (roadsReady) return 2
    if (connected) return 1
    return 0
  }, [ready, mapReady, tematicReady, roadsReady, connected])

  const progress = useMemo(() => {
    if (ready) return 100
    if (mapReady) return 80
    if (tematicReady) return 65
    if (roadsReady) return 45
    if (connected) return 20
    return 5
  }, [ready, mapReady, tematicReady, roadsReady, connected])

  function handleTransitionEnd() {
    if (fadeOut) onFinish()
  }

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={`
        fixed inset-0 z-[9998] flex flex-col items-center justify-center
        bg-[#005bbf] transition-opacity duration-500
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
      `}
    >
      <div className="mb-5">
        <img
          src={`${base}assets/whanjir/logo-drop.svg`}
          width={72}
          height={72}
          alt={t('common.appName')}
          className="w-[72px] h-[72px]"
        />
      </div>

      <h1 className="text-white text-[32px] font-extrabold leading-10 tracking-[-0.64px] mb-2">
        {t('common.appName')}
      </h1>

      <p className="text-[#EFF6FF] text-sm font-medium leading-5 mb-10 text-center px-4">
        {t('common.tagline')}
      </p>

      {showServerOffline ? (
        <div className="flex flex-col items-center gap-3 px-8">
          {/* Server icon */}
          <svg className="w-10 h-10 text-white/60 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
          </svg>

          <div className="bg-white/10 rounded-2xl p-5 text-center max-w-xs">
            <p className="text-white font-semibold text-base mb-2">
              {t('splash.serverOfflineTitle')}
            </p>
            <p className="text-white/60 text-sm leading-relaxed">
              {t('splash.serverOfflineBody')}
            </p>
          </div>

          {/* Retry button */}
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2.5 bg-white/15 text-white rounded-full text-sm font-semibold hover:bg-white/25 transition-colors cursor-pointer active:scale-95"
          >
            {t('splash.retry')}
          </button>
        </div>
      ) : showOffline ? (
        <div className="flex flex-col items-center gap-3 px-8">
          {/* Offline icon */}
          <svg className="w-10 h-10 text-white/60 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414M3 3l18 18" />
          </svg>

          <div className="bg-white/10 rounded-2xl p-5 text-center max-w-xs">
            <p className="text-white font-semibold text-base mb-2">
              {t('splash.offlineTitle')}
            </p>
            <p className="text-white/60 text-sm leading-relaxed">
              {t('splash.offlineBody')}
            </p>
          </div>

          {/* Retry button */}
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2.5 bg-white/15 text-white rounded-full text-sm font-semibold hover:bg-white/25 transition-colors cursor-pointer active:scale-95"
          >
            {t('splash.retry')}
          </button>
        </div>
      ) : (
        <>
          {/* Loading bar */}
          <div className="w-40 h-1 bg-[#2F6FD6] rounded-sm overflow-hidden mb-3">
            <div
              className="h-full bg-white rounded-sm transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status text */}
          <p className="text-[#DBEAFE] text-xs font-medium tracking-wide min-h-[1.2em]">
            {STATUS_MESSAGES[currentPhase] || STATUS_MESSAGES[0]}
          </p>
        </>
      )}
    </div>
  )
}

export default SplashScreen
