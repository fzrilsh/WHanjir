import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (registration) {
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md">
      <div className="bg-[#1a1a2e] text-white rounded-2xl shadow-2xl p-5 flex flex-col gap-4">
        <p className="text-sm leading-relaxed m-0">
          {offlineReady
            ? 'Aplikasi siap digunakan secara offline'
            : 'Konten baru tersedia, klik perbarui untuk versi terbaru'}
        </p>
        <div className="flex gap-3 justify-end">
          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-5 py-2.5 bg-[#005bbf] text-white rounded-full text-sm font-semibold hover:bg-[#004a9e] transition-colors cursor-pointer"
            >
              Perbarui
            </button>
          )}
          <button
            onClick={close}
            className="px-5 py-2.5 bg-white/10 text-white rounded-full text-sm font-semibold hover:bg-white/20 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReloadPrompt
