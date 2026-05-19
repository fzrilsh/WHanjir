import { useState } from 'react'

function MapLoadingIndicator() {
  const [show, setShow] = useState(true)

  // Auto-hide after 5 seconds (tiles should be loaded by then)
  useState(() => {
    const timer = setTimeout(() => setShow(false), 5000)
    return () => clearTimeout(timer)
  })

  if (!show) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#E8EDF2] z-[1] pointer-events-none">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-[#005BBF]/20 border-t-[#005BBF] rounded-full animate-spin" />
        <p className="text-xs text-gray-400">Memuat peta...</p>
      </div>
    </div>
  )
}

export default MapLoadingIndicator
