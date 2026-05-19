import { useEffect, useState, useMemo } from 'react'
import WaterDropIcon from './icons/WaterDropIcon'

function SplashScreen({ ready, onFinish, connected, roadsReady, tematicReady, mapReady, isOnline }) {
  const [fadeOut, setFadeOut] = useState(false)
  const [minTimeDone, setMinTimeDone] = useState(false)
  const [showOffline, setShowOffline] = useState(false)

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

  // Real progress based on actual milestones
  const STATUS_MESSAGES = [
    'Memulai aplikasi...',
    'Menghubungkan ke server...',
    'Memuat data jalan...',
    'Memuat data kelurahan...',
    'Menyiapkan peta...',
    'Siap!',
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
      <div className="mb-6 text-white/90">
        <WaterDropIcon className="w-24 h-24 md:w-28 md:h-28" />
      </div>

      <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
        WHanjir
      </h1>

      <p className="text-white/60 text-sm md:text-base font-medium tracking-wide mb-10">
        Pantau Risiko Banjir di Sekitarmu
      </p>

      {showOffline ? (
        <div className="flex flex-col items-center gap-3 px-8">
          {/* Offline icon */}
          <svg className="w-10 h-10 text-white/60 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414M3 3l18 18" />
          </svg>

          <div className="bg-white/10 rounded-2xl p-5 text-center max-w-xs">
            <p className="text-white font-semibold text-base mb-2">
              Tidak Ada Koneksi Internet
            </p>
            <p className="text-white/60 text-sm leading-relaxed">
              Aplikasi tidak dapat dibuka karena membutuhkan data real-time dari server. Periksa koneksi internet kamu dan coba lagi.
            </p>
          </div>

          {/* Retry button */}
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2.5 bg-white/15 text-white rounded-full text-sm font-semibold hover:bg-white/25 transition-colors cursor-pointer active:scale-95"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <>
          {/* Loading bar */}
          <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-white/80 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status text */}
          <p className="text-white/50 text-xs tracking-wide min-h-[1.2em]">
            {STATUS_MESSAGES[currentPhase] || STATUS_MESSAGES[0]}
          </p>
        </>
      )}
    </div>
  )
}

export default SplashScreen
