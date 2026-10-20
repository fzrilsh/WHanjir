const base = import.meta.env.BASE_URL || '/'
const A = `${base}assets/whanjir`

function RailButton({ icon, iconSize = 20, label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-11 h-11 bg-white dark:bg-slate-900 border border-[#E3E2E6] dark:border-slate-800 rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
    >
      {children || (
        <img
          src={`${A}/${icon}`}
          width={iconSize}
          height={iconSize}
          alt=""
          className="dark:invert dark:opacity-90"
        />
      )}
    </button>
  )
}

function MapButtons({ mapApiRef, onPreferenceOpen, onInfoOpen, labels }) {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 pointer-events-auto">
      <RailButton
        icon="icon-zoom-in.svg"
        label={labels.zoomIn}
        onClick={() => mapApiRef?.current?.zoomIn()}
      />
      <RailButton
        icon="icon-zoom-out.svg"
        label={labels.zoomOut}
        onClick={() => mapApiRef?.current?.zoomOut()}
      />
      <RailButton
        icon="icon-locate.svg"
        label={labels.locate}
        onClick={() => mapApiRef?.current?.locate()}
      />
      <RailButton
        icon="icon-theme.svg"
        iconSize={16}
        label={labels.preference}
        onClick={onPreferenceOpen}
      />
      <RailButton
        icon="icon-info.svg"
        label={labels.info}
        onClick={onInfoOpen}
      />
    </div>
  )
}

export default MapButtons
