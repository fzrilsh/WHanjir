import ZoomIcon from './icons/ZoomIcon'

function ZoomControls({ onZoomIn }) {
  return (
    <div className="absolute bottom-[15px] right-[11px] flex flex-col gap-2 z-10 pointer-events-auto">
      <button
        type="button"
        onClick={onZoomIn}
        className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
        aria-label="Zoom in"
      >
        <ZoomIcon className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  )
}

export default ZoomControls
