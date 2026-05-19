import { useState, useCallback, useEffect, Component } from 'react'
import { SocketProvider, useRoadData, useTematicData, useSocketContext } from './hooks/SocketProvider'
import useTheme from './hooks/useTheme'
import SplashScreen from './components/SplashScreen'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'

// Module-level flag — tetap survive StrictMode double-mount / remount apa pun
let splashDone = false

// Error boundary — cegah white screen total
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#005bbf] flex flex-col items-center justify-center text-white p-8">
          <h1 className="text-2xl font-bold mb-4">Ada yang error nih</h1>
          <p className="text-white/60 text-sm mb-6 text-center max-w-xs">
            Coba reload halaman atau periksa koneksi internet kamu.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-white/15 text-white rounded-full text-sm font-semibold hover:bg-white/25 transition-colors cursor-pointer"
          >
            Reload Halaman
          </button>
          {this.state.error && (
            <details className="mt-6 text-white/40 text-xs max-w-md">
              <summary className="cursor-pointer">Detail error</summary>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.error.toString()}</pre>
            </details>
          )}
        </div>
      )
    }
    return this.props.children
  }
}

function AppShell() {
  const [splashVisible, setSplashVisible] = useState(!splashDone)
  const [mapReady, setMapReady] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchAnimatedIn, setSearchAnimatedIn] = useState(false)
  const [routeDestination, setRouteDestination] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { theme, setTheme, isDark } = useTheme()

  const { isConnected } = useSocketContext()
  const { roadsReady } = useRoadData()
  const { tematicReady } = useTematicData()

  const splashReady = mapReady && roadsReady && tematicReady

  // Track browser online/offline status
  useEffect(() => {
    function handleOnline() { setIsOnline(true) }
    function handleOffline() { setIsOnline(false) }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleMapReady = useCallback(() => {
    setMapReady(true)
  }, [])

  const handleSplashFinish = useCallback(() => {
    splashDone = true
    setSplashVisible(false)
    // Update theme-color to match app background after splash
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', '#ffffff')
  }, [])

  const handleOpenSearch = useCallback(() => {
    setShowSearch(true)
    // Lock body scroll — penting buat iOS Safari biar gak geser pas keyboard muncul
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    requestAnimationFrame(() => setSearchAnimatedIn(true))
  }, [])

  const handleCloseSearch = useCallback(() => {
    setSearchAnimatedIn(false)
    setTimeout(() => {
      setShowSearch(false)
      // Restore body scroll
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }, 300)
  }, [])

  const handleSelectRoute = useCallback((to) => {
    setRouteDestination(to)
    handleCloseSearch()
  }, [handleCloseSearch])

  return (
    <>
      {/* HomePage always mounted — map stays alive */}
      <div className={`fixed inset-0 transition-all duration-300 ${showSearch && searchAnimatedIn ? 'scale-[0.92] rounded-2xl overflow-hidden' : 'scale-100 rounded-none'}`}>
        <HomePage
          onMapReady={handleMapReady}
          onOpenSearch={handleOpenSearch}
          routeDestination={routeDestination}
          isDarkMode={isDark}
          theme={theme}
          onThemeChange={setTheme}
        />
      </div>

      {/* SearchPage overlay — slide up from bottom */}
      {showSearch && (
        <div
          className={`fixed inset-0 z-50 transition-transform duration-300 ease-out ${
            searchAnimatedIn ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <SearchPage
            onBack={handleCloseSearch}
            onSelectRoute={handleSelectRoute}
          />
        </div>
      )}

      {/* SplashScreen on top */}
      {splashVisible && (
        <SplashScreen
          ready={splashReady}
          onFinish={handleSplashFinish}
          connected={isConnected}
          roadsReady={roadsReady}
          tematicReady={tematicReady}
          mapReady={mapReady}
          isOnline={isOnline}
        />
      )}
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <SocketProvider>
        <AppShell />
      </SocketProvider>
    </ErrorBoundary>
  )
}

export default App
