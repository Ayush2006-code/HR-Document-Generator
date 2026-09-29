import { useEffect, useRef, useState } from 'react'
import { renderAsync } from 'docx-preview'
import {
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react'

/**
 * Renders generated DOCX files using docx-preview.
 *
 * This app generates DOCX only. The preview therefore only
 * handles DOCX blobs.
 */
export default function DocumentPreview({
  blob,
  emptyLabel = 'Fill in the form to see a live preview.',
}) {
  const containerRef = useRef(null)

  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    setError(null)
    setRendering(false)

    if (!blob || !containerRef.current) {
      return undefined
    }

    setRendering(true)

    renderAsync(
      blob,
      containerRef.current,
      undefined,
      {
        className: 'docx',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        breakPages: true,
        experimental: false,
      }
    )
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.message ||
              'Could not render the document preview.'
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRendering(false)
        }
      })

    return () => {
      cancelled = true

      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [blob])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-slate-100/80 dark:bg-slate-950/60">
      {/* Preview header */}
      <div className="flex shrink-0 items-center justify-between bg-white px-4 py-3 dark:bg-slate-900 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <FileText size={15} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              Document Preview
            </p>

            <p className="text-[10px] text-slate-400">
              DOCX document
            </p>
          </div>
        </div>

        {rendering && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Loader2
              size={14}
              className="animate-spin"
            />
            Rendering...
          </div>
        )}
      </div>

      {/* Preview body */}
      <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
        {!blob && !rendering && (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl bg-white px-6 py-12 text-center shadow-sm dark:bg-slate-900">
            <div className="max-w-sm">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <FileText size={19} />
              </div>

              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {emptyLabel}
              </p>
            </div>
          </div>
        )}

        {rendering && (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Preparing preview
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Rendering your DOCX document...
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl bg-white px-6 py-12 shadow-sm dark:bg-slate-900">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
                <AlertCircle size={19} />
              </div>

              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Preview unavailable
              </p>

              <p className="mt-1 text-xs leading-5 text-rose-500">
                {error}
              </p>
            </div>
          </div>
        )}

        {blob && !error && (
          <div
            ref={containerRef}
            className="docx-preview-container min-h-full"
          />
        )}
      </div>
    </div>
  )
}