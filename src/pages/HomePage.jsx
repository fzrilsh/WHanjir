import { useState, useCallback, useEffect, useRef } from 'react'
import MapView from '../components/MapView'
import FloatingSearchCard from '../components/FloatingSearchCard'
import ViewToggle from '../components/ViewToggle'
import ThemeToggle from '../components/ThemeToggle'
import MapLegend from '../components/MapLegend'
import HelpModal from '../components/HelpModal'
import RoadDetailSheet from '../components/RoadDetailSheet'
import AreaDetailSheet from '../components/AreaDetailSheet'
import { useRoadData, useTematicData, useDataUpdated } from '../hooks/SocketProvider'
import { ENDPOINTS } from '../config/api'
import { getCurrentPosition } from '../utils/geolocation'

function HomePage({ onMapReady, routeDestination, onSelectRoute, onClearRoute, isDarkMode, theme, onThemeChange }) {
  const [activeView, setActiveView] = useState('road')
  const [selectedRoad, setSelectedRoad] = useState(null)
  const [selectedArea, setSelectedArea] = useState(null)
  const [sheetKey, setSheetKey] = useState(0)
  const [areaSheetKey, setAreaSheetKey] = useState(0)
  const [routeData, setRouteData] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [isRouting, setIsRouting] = useState(false)
  const prevRouteRef = useRef(null)

  const { roads } = useRoadData()
  const { tematic } = useTematicData()

  useDataUpdated({
    onRoadsUpdated: () => console.log('[WS] Roads data updated'),
    onTematicUpdated: () => console.log('[WS] Tematic data updated'),
  })

  // Fetch route when routeDestination changes
  useEffect(() => {
    if (!routeDestination) return
    if (prevRouteRef.current === routeDestination) return
    prevRouteRef.current = routeDestination

    async function fetchRoute() {
      setIsRouting(true)
      setRouteInfo({ name: routeDestination.name || '' })

      const from = await getCurrentPosition()

      try {
        const response = await fetch(
          ENDPOINTS.route(from.lat, from.lng, routeDestination.lat, routeDestination.lng, 40),
          { headers: { 'ngrok-skip-browser-warning': 'true' } },
        )
        const data = await response.json()

        if (data.found) {
          setRouteData(data.path)
          setRouteInfo({
            name: routeDestination.name || '',
            distance: data.total_distance_m,
            time: data.total_time_min,
          })
        } else {
          setRouteData(null)
          setRouteInfo({ error: data.error || 'Rute tidak ditemukan' })
        }
      } catch {
        setRouteData(null)
        setRouteInfo({ error: 'Gagal memuat rute' })
      } finally {
        setIsRouting(false)
      }
    }

    fetchRoute()
  }, [routeDestination])

  const handleRoadSelect = useCallback((road) => {
    setSelectedRoad(road)
    setSheetKey((prev) => prev + 1)
  }, [])

  const handleRoadSheetClose = useCallback(() => {
    setSelectedRoad(null)
  }, [])

  const handleAreaSelect = useCallback((properties) => {
    setSelectedArea(properties)
    setAreaSheetKey((prev) => prev + 1)
  }, [])

  const handleAreaSheetClose = useCallback(() => {
    setSelectedArea(null)
  }, [])

  const handleClearRoute = useCallback(() => {
    setRouteData(null)
    setRouteInfo(null)
    onClearRoute()
  }, [onClearRoute])

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#E8EDF2]">
      <MapView
        activeView={activeView}
        onRoadSelect={handleRoadSelect}
        onAreaSelect={handleAreaSelect}
        onReady={onMapReady}
        roads={roads}
        tematic={tematic}
        routeData={routeData}
        isDarkMode={isDarkMode}
      />

      <div className="absolute inset-0 pointer-events-none">
        <FloatingSearchCard onSelectRoute={onSelectRoute} />
        <ViewToggle
          activeView={activeView}
          onToggle={setActiveView}
        />

        {/* Utilities Stack — bottom left */}
        <div className="absolute bottom-6 left-4 z-30 flex flex-col gap-2.5 pointer-events-auto items-start">
          <HelpModal />
          <ThemeToggle theme={theme} onChange={onThemeChange} />
          <MapLegend />
        </div>
      </div>

      {/* Route Info Banner */}
      {(routeInfo || isRouting) && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-fade-in-up">
          <div className={`rounded-2xl shadow-2xl px-5 py-3 min-w-[280px] max-w-sm border transition-all duration-300 ${routeInfo?.error
            ? 'bg-red-50/95 dark:bg-red-950/90 border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200'
            : 'bg-white dark:bg-slate-900 border-[#E3E2E6] dark:border-slate-800 text-gray-900 dark:text-gray-100'
            }`}>
            {isRouting ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#005BBF] rounded-full animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Mencari rute...</p>
              </div>
            ) : routeInfo?.error ? (
              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Rute Tidak Ditemukan</span>
                </div>
                <p className="text-xs text-red-700 dark:text-red-400 font-medium leading-relaxed">
                  {routeInfo.error}. Silakan pastikan lokasi terhubung jalan DKI Jakarta dan gunakan titik pencarian lain.
                </p>
                <div className="mt-1 flex justify-end">
                  <button
                    onClick={handleClearRoute}
                    className="px-4 py-1.5 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-800/40 text-red-850 dark:text-red-300 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : routeInfo ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {routeInfo.name && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">{routeInfo.name}</p>
                  )}
                  <p className="text-sm font-semibold">
                    {routeInfo.distance ? `${(routeInfo.distance / 1000).toFixed(1)} km` : ''}
                    {routeInfo.distance && routeInfo.time ? ` · ${routeInfo.time} menit` : ''}
                  </p>
                </div>
                <button
                  onClick={handleClearRoute}
                  className="text-xs font-bold text-white bg-[#005BBF] hover:bg-[#004a9e] rounded-full px-4 py-1.5 transition-colors cursor-pointer active:scale-95"
                >
                  Tutup
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <RoadDetailSheet
        key={sheetKey}
        road={selectedRoad}
        onClose={handleRoadSheetClose}
      />

      <AreaDetailSheet
        key={areaSheetKey}
        area={selectedArea}
        onClose={handleAreaSheetClose}
      />
    </div>
  )
}

export default HomePage
