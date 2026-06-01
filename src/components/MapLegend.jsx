function MapLegend() {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-gray-200/80 dark:border-slate-800/80 rounded-[18px] shadow-lg p-3 w-[150px] flex flex-col gap-2.5 transition-all duration-300 pointer-events-auto">
      <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
        Risiko Banjir
      </div>
      <div className="flex flex-col gap-2">
        {/* Danger State */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#BA1A1A] shrink-0 shadow-sm" />
          <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200">
            BANJIR
          </span>
        </div>

        {/* Caution State */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FFBA52] shrink-0 shadow-sm" />
          <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200">
            TERGENANG
          </span>
        </div>

        {/* Safe State */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#34C759] shrink-0 shadow-sm" />
          <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200">
            AMAN
          </span>
        </div>
      </div>
    </div>
  )
}

export default MapLegend
