import { useState, useEffect, useCallback, useRef } from "react";
import BackArrowIcon from "../components/icons/BackArrowIcon";
import LocationPinIcon from "../components/icons/LocationPinIcon";
import CloseIcon from "../components/icons/CloseIcon";
import { ENDPOINTS } from "../config/api";

const VILLAGES = [
  "Cengkareng",
  "Grogol Petamburan",
  "Kalideres",
  "Kebon Jeruk",
  "Kembangan",
  "Palmerah",
  "Taman Sari",
  "Tambora",
];

function SearchPage({ onBack, onSelectRoute }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(ENDPOINTS.search(query, 5), {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setSuggestions(data.results || []);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.length === 0) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => fetchSuggestions(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  useEffect(() => {
    async function loadRecent() {
      try {
        const response = await fetch(
          ENDPOINTS.search("jalan", 5, {
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
          }),
        );
        const data = await response.json();
        setRecentSearches(data.results || []);
      } catch {
        setRecentSearches([]);
      }
    }
    loadRecent();
  }, []);

  // Pas mount, scroll ke atas biar search input keliatan
  useEffect(() => {
    const el = scrollRef.current;
    if (el) requestAnimationFrame(() => el.scrollTo(0, 0));
  }, []);

  const showSuggestions = suggestions.length > 0;

  function handleClear() {
    setSearchQuery("");
    setSuggestions([]);
  }

  function handleSelect(item) {
    if (item.lat && item.lng) {
      onSelectRoute({ lat: item.lat, lng: item.lng, name: item.name });
    }
  }

  function getStatusInfo(score) {
    if (score >= 70) return { color: "bg-red-500", label: "danger" };
    if (score >= 40) return { color: "bg-yellow-500", label: "caution" };
    return { color: "bg-green-500", label: "safe" };
  }

  return (
    <div className="relative w-full h-full bg-white flex flex-col">
      {/* Header: Back + Search Input */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0 active:scale-95 transition-transform"
          aria-label="Kembali"
        >
          <BackArrowIcon className="w-[41px] h-[40px]" />
        </button>

        <div className="flex-1 h-12 bg-gray-100 rounded-full flex items-center px-4 gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Cari jalan atau kelurahan..."
            className="flex-1 bg-transparent text-sm text-black/60 outline-none border-none placeholder:text-gray-400"
          />

          {searchQuery.length > 0 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              className="shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors active:scale-90 transition-transform"
              aria-label="Hapus pencarian"
            >
              <CloseIcon className="w-4 h-4 text-[#414754]" />
            </button>
          )}
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="mx-4 h-px bg-gray-200 shrink-0" />

      {/* Search indicator */}
      {isSearching && searchQuery.length > 0 && (
        <div className="px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#005BBF] rounded-full animate-spin" />
          <span>Mencari...</span>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && !isSearching && (
        <>
          <div className="px-4 z-20 my-3 shrink-0">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                <LocationPinIcon className="w-6 h-6" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Suggestions
                </span>
              </div>

              <div className="flex flex-col">
                {suggestions.map((item) => {
                  const status = getStatusInfo(item.score);
                  return (
                    <div
                      key={item.id}
                      onMouseDown={() => handleSelect(item)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 active:bg-blue-100 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                        <LocationPinIcon className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.kelurahan}
                        </div>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${status.color}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mx-4 h-px bg-gray-100 shrink-0" />
        </>
      )}

      {/* No results feedback */}
      {!isSearching && searchQuery.length > 0 && suggestions.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-gray-400">
          Tidak ada hasil untuk &ldquo;{searchQuery}&rdquo;
        </div>
      )}

      {/* Content */}
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        {/* Pencarian Terkini */}
        <section className="px-4 pt-5 pb-3">
          <h2 className="text-sm font-semibold text-gray-800 mb-3 tracking-wide">
            PENCARIAN TERKINI
          </h2>
          {recentSearches.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentSearches.slice(0, 5).map((item) => {
                const status = getStatusInfo(item.score);
                return (
                  <div
                    key={item.id}
                    onMouseDown={() => handleSelect(item)}
                    className="flex items-center justify-between py-2.5 px-1 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <LocationPinIcon className="w-8 h-8 shrink-0" />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${status.color}`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-3">Belum ada pencarian</p>
          )}
        </section>

        {/* Divider */}
        <div className="h-2 bg-gray-50 shrink-0" />

        {/* Kelurahan */}
        <section className="px-4 pt-5 pb-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-3 tracking-wide">
            KELURAHAN DI JAKARTA BARAT
          </h2>
          <div className="flex flex-wrap gap-2">
            {VILLAGES.map((village) => (
              <span
                key={village}
                onClick={() =>
                  onSelectRoute({
                    lat: -6.17,
                    lng: 106.78,
                    name: `Kelurahan ${village}`,
                  })
                }
                className="px-4 py-2 text-xs font-medium text-[#414754] bg-[#faf9fd] border border-[#c1c6d6] rounded-full cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                {village}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default SearchPage;
