import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({
  title,
  onClose,
  children,
  wide = false,
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKey)

    return () =>
      window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[3px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative flex w-full ${
          wide ? 'max-w-5xl' : 'max-w-xl'
        } max-h-[92vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/20 ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-700/80 dl-enter`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex min-h-[60px] shrink-0 items-center justify-between bg-white/95 px-5 backdrop-blur dark:bg-slate-900/95 sm:px-6">
          <h2 className="pr-4 text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  )
} 