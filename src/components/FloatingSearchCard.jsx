import { useState, useEffect, useCallback, useRef } from 'react'
import LocationPinIcon from './icons/LocationPinIcon'
import CloseIcon from './icons/CloseIcon'
import WaterDropIcon from './icons/WaterDropIcon'
import SearchIcon from './icons/SearchIcon'
import { ENDPOINTS } from '../config/api'

function FloatingSearchCard({ onSelectRoute }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([])
      setErrorMsg('')
      return
    }

    setIsSearching(true)
    setErrorMsg('')
    try {
      const response = await fetch(ENDPOINTS.search(query, 5), {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Gagal mengambil data')
      const data = await response.json()
      setSuggestions(data.results || [])
    } catch (err) {
      setSuggestions([])
      setErrorMsg('Koneksi bermasalah. Gagal mencari lokasi.')
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounce search query
  useEffect(() => {
    if (searchQuery.length === 0) {
      setSuggestions([])
      setErrorMsg('')
      return
    }
    const timer = setTimeout(() => fetchSuggestions(searchQuery), 350)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchSuggestions])

  // Load recent searches on mount (acting as typical popular/recent locations)
  useEffect(() => {
    async function loadRecent() {
      try {
        const response = await fetch(
          ENDPOINTS.search('jalan', 5, {
            headers: {
              'ngrok-skip-browser-warning': 'true',
              'Content-Type': 'application/json',
            },
          }),
        )
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
    // Focus input on next frame after mount/render
    setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
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

  function getStatusInfo(score) {
    if (score >= 70) return { color: 'bg-red-500', label: 'danger' }
    if (score >= 40) return { color: 'bg-yellow-500', label: 'caution' }
    return { color: 'bg-green-500', label: 'safe' }
  }

  const showSuggestions = suggestions.length > 0

  return (
    <>
      {/* Premium Backdrop Blur Overlay */}
      {isOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-md transition-all duration-300 pointer-events-auto"
        />
      )}

      {/* Floating Card Container */}
      <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[360px] z-50 pointer-events-auto flex flex-col gap-2">
        
        {/* Main Search Bar Card */}
        <div 
          onClick={!isOpen ? handleOpen : undefined}
          className={`w-full h-[56px] rounded-[16px] flex items-center px-4 gap-3 transition-all duration-300 select-none shadow-lg border border-[#E3E2E6] dark:border-slate-800/80 ${
            isOpen 
              ? 'bg-white dark:bg-slate-900 shadow-xl cursor-default' 
              : 'bg-white/95 dark:bg-slate-900/95 hover:shadow-xl cursor-pointer active:scale-[0.98]'
          }`}
        >
          {/* Left Element: Logo (Closed) or Close Action (Open) */}
          {isOpen ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClose()
              }}
              className="w-8 h-8 -ml-1 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Tutup pencarian"
            >
              <CloseIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          ) : (
            <div className="text-[#005BBF] dark:text-[#3b82f6] shrink-0">
              <WaterDropIcon className="w-6 h-6" />
            </div>
          )}

          {/* Middle Element: Placeholder or Active Input */}
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mau cek jalan mana hari ini?"
              className="flex-1 bg-transparent text-[15px] text-gray-900 dark:text-white font-medium outline-none border-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          ) : (
            <span className="text-[14px] text-gray-600 dark:text-gray-300 font-medium flex-1 text-left">
              Mau cek jalan mana hari ini?
            </span>
          )}

          {/* Right Element: SearchIcon (Closed) or Clear (Open) */}
          {isOpen && searchQuery.length > 0 ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-gray-500 shrink-0"
              aria-label="Hapus teks"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          ) : (
            <SearchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
          )}
        </div>

        {/* Dropdown Card: Suggestions & Recent Searches */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-[#E3E2E6] dark:border-slate-800/80 rounded-[20px] shadow-2xl max-h-[60vh] overflow-y-auto overflow-x-hidden flex flex-col divide-y divide-gray-100 dark:divide-slate-800 animate-fade-in-up"
          >
            {/* Search Loading Indicator */}
            {isSearching && (
              <div className="px-4 py-4 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-300 dark:border-slate-700 border-t-[#005BBF] dark:border-t-blue-500 rounded-full animate-spin" />
                <span>Mencari rute jalan...</span>
              </div>
            )}

            {/* Error Message: Styled with Soft Red Background */}
            {errorMsg && (
              <div className="m-3 p-3 bg-red-50/90 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-100 dark:border-red-900/50 rounded-xl text-xs flex flex-col gap-1">
                <span className="font-semibold">Pencarian Gagal</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Suggestions List */}
            {showSuggestions && !isSearching && (
              <div className="flex flex-col">
                <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Hasil Pencarian
                </div>
                {suggestions.map((item) => {
                  const status = getStatusInfo(item.score)
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#005BBF]/5 dark:hover:bg-blue-500/10 cursor-pointer active:bg-gray-100 dark:active:bg-slate-800 transition-colors"
                    >
                      <LocationPinIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-gray-800 dark:text-gray-100 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                          {item.kelurahan}
                        </div>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${status.color}`} />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Empty Search Query -> show Recent Searches (Pencarian Terkini) */}
            {searchQuery.length === 0 && (
              <div className="flex flex-col">
                <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  PENCARIAN TERKINI
                </div>
                {recentSearches.length > 0 ? (
                  <div className="flex flex-col">
                    {recentSearches.slice(0, 5).map((item) => {
                      const status = getStatusInfo(item.score)
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[#005BBF]/5 dark:hover:bg-blue-500/10 cursor-pointer active:bg-gray-100 dark:active:bg-slate-800 transition-colors"
                        >
                          <LocationPinIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-semibold text-gray-800 dark:text-gray-100 truncate">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                              {item.kelurahan}
                            </div>
                          </div>
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${status.color}`} />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 italic">
                    Belum ada riwayat pencarian
                  </div>
                )}
              </div>
            )}

            {/* No Results Feedback: Styled with Soft Red Background */}
            {!isSearching && searchQuery.length > 0 && suggestions.length === 0 && !errorMsg && (
              <div className="m-3 p-3 bg-red-50/70 dark:bg-red-950/20 text-red-800 dark:text-red-300 border border-red-100 dark:border-red-950/50 rounded-xl text-xs text-center flex flex-col items-center gap-1">
                <span className="font-semibold">Lokasi tidak ditemukan</span>
                <span>Tidak ada hasil untuk &ldquo;{searchQuery}&rdquo;. Coba gunakan nama jalan lain.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default FloatingSearchCard
