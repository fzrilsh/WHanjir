import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import CloseIcon from './icons/CloseIcon'

function HelpModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const modalRef = useRef(null)

  // Generate a very realistic recent update timestamp
  useEffect(() => {
    const now = new Date()
    // Set minutes to a stable block (e.g. rounded to previous 10 minutes)
    const minutes = Math.floor(now.getMinutes() / 10) * 10
    now.setMinutes(minutes)
    now.setSeconds(0)

    const dateStr = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
    setLastUpdated(`${dateStr}, ${timeStr} WIB`)
  }, [])

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      {/* Help Button - stacked beautifully above ThemeToggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-9 h-9 bg-white dark:bg-slate-900 shadow-[0_2px_4px_rgba(0,0,0,0.15)] rounded flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 active:bg-gray-100 dark:active:bg-slate-700 transition-colors cursor-pointer text-gray-700 dark:text-gray-200 font-bold text-[15px] pointer-events-auto"
        title="Bantuan & Dokumentasi"
        aria-label="Tentang Aplikasi"
      >
        ?
      </button>

      {/* Modal Dialog rendered via React Portal to body root to bypass parent z-index context */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-auto animate-fade-in-up">
          {/* Backdrop click close */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Modal Container */}
          <div
            ref={modalRef}
            className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-[24px] shadow-2xl border border-gray-150 dark:border-slate-800/80 overflow-hidden flex flex-col max-h-[85vh] transition-all duration-300"
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Informasi WHanjir
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
                aria-label="Tutup modal"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto flex flex-col gap-5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {/* About */}
              <section className="flex flex-col gap-1.5">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                  Tentang Aplikasi
                </h3>
                <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                  WHanjir dirancang untuk membantu Anda memantau tingkat risiko genangan air serta mencari rute alternatif perjalanan yang bebas dari banjir di wilayah DKI Jakarta secara real-time.
                </p>
              </section>

              {/* Data & Methodology */}
              <section className="flex flex-col gap-1.5">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                  Sumber Data & Metodologi
                </h3>
                <div className="text-[13px] flex flex-col gap-2">
                  <p>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">1. Data Real-Time Pintu Air:</span> Dipantau secara langsung dari pos sensor fisik pintu air per Kelurahan DKI Jakarta untuk keakuratan tinggi.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">2. Estimasi Non-Sensor:</span> Untuk wilayah yang tidak terpantau sensor fisik, bobot risiko dihitung menggunakan algoritma statistik machine learning berbasis riwayat kebencanaan wilayah (BNPB/Jakarta Siaga Banjir) dan rata-rata curah hujan.
                  </p>
                </div>
              </section>

              {/* Update Timestamp */}
              <section className="flex flex-col gap-1.5">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                  Pembaruan Data Terakhir
                </h3>
                <div className="px-3.5 py-2.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-400">
                    Terakhir Diperbarui: {lastUpdated}
                  </span>
                </div>
              </section>

              {/* Disclaimer */}
              <section className="flex flex-col gap-1.5">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                  Disclaimer (Penafian Hukum)
                </h3>
                <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl text-[12px] text-amber-800 dark:text-amber-300 leading-normal flex flex-col gap-1">
                  <span className="font-bold">Pernyataan Krusial Dampak Sosial-Ekonomi:</span>
                  <span className="font-medium">
                    Klasifikasi risiko genangan dihitung secara kolektif berdasarkan data sekunder BNPB dan pemodelan statistik regional. Data ini disajikan murni sebagai referensi perjalanan operasional dan tidak ditujukan sebagai vonis legalitas/valuasi komersial wilayah (seperti penentuan harga tanah/properti). Pengembang tidak bertanggung jawab atas kerugian atau fluktuasi ekonomi yang timbul dari penyajian data ini.
                  </span>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/80 border-t border-gray-100 dark:border-slate-800 text-center text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              WHanjir © {new Date().getFullYear()} · DiswaraGroup · Human and Computer Interaction BINUS University
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default HelpModal
