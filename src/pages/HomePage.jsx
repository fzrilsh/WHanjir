import { useState, useCallback, useEffect, useRef } from 'react'
import MapView from '../components/MapView'
import FloatingSearchCard from '../components/FloatingSearchCard'
import ViewToggle from '../components/ViewToggle'
import PreferenceSheet from '../components/PreferenceSheet'
import MapLegend from '../components/MapLegend'
import HelpModal from '../components/HelpModal'
import MapButtons from '../components/MapButtons'
import LocationSheet from '../components/LocationSheet'
import RoadDetailSheet from '../components/RoadDetailSheet'
import AreaDetailSheet from '../components/AreaDetailSheet'
import { useRoadData, useTematicData, useDataUpdated } from '../hooks/SocketProvider'
import { ENDPOINTS } from '../config/api'
import { getCurrentPosition } from '../utils/geolocation'
import { getGeometryPoint } from '../utils/geometry'
import { useI18n } from '../i18n/I18nProvider'

function HomePage({ onMapReady, routeDestination, onSelectRoute, onClearRoute, isDarkMode, theme, onThemeChange }) {
  const [activeView, setActiveView] = useState('road')
  const [selectedRoad, setSelectedRoad] = useState(null)
  const [selectedArea, setSelectedArea] = useState(null)
  const [sheetKey, setSheetKey] = useState(0)
  const [areaSheetKey, setAreaSheetKey] = useState(0)
  const [routeData, setRouteData] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [isRouting, setIsRouting] = useState(false)
  const [preferenceOpen, setPreferenceOpen] = useState(false)
  const [infoMenu, setInfoMenu] = useState(null) // 'data' | 'about' | null
  const mapApiRef = useRef(null)
  const prevRouteRef = useRef(null)

  const { roads, roadsInfo } = useRoadData()
  const { tematic } = useTematicData()

  // Backend's own timestamp for the current dataset (Unix seconds).
  const dataUpdatedAt = roadsInfo?.timestamp ?? null
  const { t } = useI18n()

  useDataUpdated({
    onRoadsUpdated: () => console.log('[WS] Roads data updated'),
    onTematicUpdated: () => console.log('[WS] Tematic data updated'),
  })

  useEffect(() => {
    if (!routeDestination) return
    if (prevRouteRef.current === routeDestination) return
    prevRouteRef.current = routeDestination

    async function fetchRoute() {
      setIsRouting(true)
      setRouteInfo({ name: routeDestination.name || '' })

      // Never route from a made-up origin: if the browser can't tell us where
      // the user is, say so instead of drawing a wrong route.
      const from = await getCurrentPosition()
      if (!from) {
        setRouteData(null)
        setRouteInfo({
          name: routeDestination.name || '',
          error: t('route.noLocation'),
        })
        setIsRouting(false)
        return
      }

      try {
        const url = ENDPOINTS.route(
          from.lat,
          from.lng,
          routeDestination.lat,
          routeDestination.lng,
          40,
        )
        const response = await fetch(url)
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
          setRouteInfo({ error: data.error || t('route.notFound') })
        }
      } catch {
        setRouteData(null)
        setRouteInfo({ error: 'Gagal memuat rute' })
      } finally {
        setIsRouting(false)
      }
    }

    fetchRoute()
  }, [routeDestination, t])

  const handleRoadSelect = useCallback((road) => {
    setSelectedRoad(road)
    setSheetKey((prev) => prev + 1)
  }, [])

  const handleRoadSheetClose = useCallback(() => setSelectedRoad(null), [])

  const handleAreaSelect = useCallback((properties) => {
    setSelectedArea(properties)
    setAreaSheetKey((prev) => prev + 1)
  }, [])

  const handleAreaSheetClose = useCallback(() => setSelectedArea(null), [])

  const handleClearRoute = useCallback(() => {
    setRouteData(null)
    setRouteInfo(null)
    onClearRoute()
  }, [onClearRoute])

  const handleRouteHere = useCallback((target) => {
    // Road features are LineStrings, area features are Polygons — both need
    // to be reduced to a single point before calling the routing API.
    const point = getGeometryPoint(target?.geometry)
    if (point) {
      onSelectRoute({ lat: point.lat, lng: point.lng, name: target.name || target.kelurahan })
    }
    setSelectedRoad(null)
    setSelectedArea(null)
  }, [onSelectRoute])

  const sheetOpen = !!(selectedRoad || selectedArea || routeInfo || isRouting)

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
        mapApiRef={mapApiRef}
      />

      <div className="absolute inset-0 pointer-events-none">
        {/* Top cluster: SearchField + SegmentedTabs */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-32px)] max-w-[380px] flex flex-col items-center gap-3 md:max-w-[460px]">
          <FloatingSearchCard onSelectRoute={onSelectRoute} />
          <ViewToggle activeView={activeView} onToggle={setActiveView} />
        </div>

        {/* Right rail controls */}
        <MapButtons
          mapApiRef={mapApiRef}
          onPreferenceOpen={() => setPreferenceOpen(true)}
          onInfoOpen={() => setInfoMenu('data')}
          labels={{
            zoomIn: t('map.zoomIn'),
            zoomOut: t('map.zoomOut'),
            locate: t('map.locate'),
            preference: t('preference.open'),
            info: t('help.infoOpen'),
          }}
        />

        {/* Legend — sits just above the location sheet on mobile, bottom-left on desktop */}
        <div className={`absolute left-4 z-20 pointer-events-auto transition-all duration-300 ${sheetOpen ? 'bottom-6' : 'bottom-[310px]'} md:bottom-6 md:left-6`}>
          <MapLegend />
        </div>

        {/* Location sheet / MapCard — hidden when other sheet open */}
        {!sheetOpen && (
          <LocationSheet
            roads={roads}
            dataUpdatedAt={dataUpdatedAt}
            onShowDetail={handleRoadSelect}
            onRouteHere={handleRouteHere}
          />
        )}
      </div>

      {/* Route info sheet */}
      {(routeInfo || isRouting) && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
          <div className="w-full md:max-w-[480px] bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0px_-4px_24px_rgba(0,0,0,0.14)] px-5 pt-2.5 pb-6 pointer-events-auto animate-fade-in-up">
            <div className="flex justify-center py-1">
              <div className="w-10 h-1 bg-[#E3E2E6] dark:bg-slate-700 rounded-sm" />
            </div>
            {isRouting ? (
              <div className="flex items-center gap-3 py-3">
                <div className="w-5 h-5 border-2 border-gray-300 dark:border-slate-700 border-t-[#005BBF] rounded-full animate-spin" />
                <p className="text-sm font-medium text-[#5B6270] dark:text-gray-300">{t('route.searching')}</p>
              </div>
            ) : routeInfo?.error ? (
              <div className="flex flex-col gap-2 py-2">
                <div className="flex items-center gap-2 font-bold text-sm text-red-700 dark:text-red-300">
                  <span className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>{t('route.notFound')}</span>
                </div>
                <p className="text-xs text-red-700 dark:text-red-400 font-medium leading-relaxed">
                  {routeInfo.error}
                </p>
                <div className="flex justify-end mt-1">
                  <button
                    onClick={handleClearRoute}
                    className="px-4 py-1.5 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-800/40 text-red-800 dark:text-red-300 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    {t('common.close')}
                  </button>
                </div>
              </div>
            ) : routeInfo ? (
              <div className="flex flex-col gap-3 py-1">
                <div className="bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 rounded-2xl px-4 py-3.5 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#005BBF] shrink-0" />
                    <span className="text-sm font-medium text-[#1A1B1E] dark:text-white">{t('route.myLocation')}</span>
                  </div>
                  <div className="h-px bg-[#E9EBEF] dark:bg-slate-800" />
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#34C759] shrink-0" />
                    <span className="flex-1 text-sm font-medium text-[#1A1B1E] dark:text-white truncate">
                      {routeInfo.name || t('route.destination')}
                    </span>
                    <button
                      onClick={handleClearRoute}
                      className="text-[13px] font-bold text-[#005BBF] tracking-[0.1px] cursor-pointer hover:underline"
                    >
                      {t('common.change')}
                    </button>
                  </div>
                </div>
                <div className="bg-[#E6F6EC] dark:bg-emerald-950/50 rounded-2xl px-4 py-3.5">
                  <p className="text-lg font-semibold text-[#0F7B3E] dark:text-emerald-300 leading-[26px]">
                    {routeInfo.distance ? `${(routeInfo.distance / 1000).toFixed(1)} km` : ''}
                    {routeInfo.distance && routeInfo.time ? ' · ' : ''}
                    {routeInfo.time ? `${routeInfo.time} ${t('common.minuteShort')}` : ''}
                  </p>
                  <p className="text-xs font-medium text-[#12301F] dark:text-emerald-100/80 leading-4 mt-0.5">
                    {t('route.safe')}
                  </p>
                </div>
                <button
                  onClick={handleClearRoute}
                  className="w-full h-[52px] bg-[#005BBF] hover:bg-[#004A9E] rounded-xl flex items-center justify-center text-[15px] font-semibold text-white transition-colors cursor-pointer active:scale-[0.98]"
                >
                  {t('route.close')}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <RoadDetailSheet
        key={`road-${sheetKey}`}
        road={selectedRoad}
        dataUpdatedAt={dataUpdatedAt}
        onClose={handleRoadSheetClose}
        onRouteHere={handleRouteHere}
      />

      <AreaDetailSheet
        key={`area-${areaSheetKey}`}
        area={selectedArea}
        onClose={handleAreaSheetClose}
        onRouteHere={handleRouteHere}
      />

      <PreferenceSheet
        theme={theme}
        onThemeChange={onThemeChange}
        open={preferenceOpen}
        onClose={() => setPreferenceOpen(false)}
      />

      <HelpModal mode={infoMenu} dataUpdatedAt={dataUpdatedAt} onClose={() => setInfoMenu(null)} />
    </div>
  )
}

export default HomePage
