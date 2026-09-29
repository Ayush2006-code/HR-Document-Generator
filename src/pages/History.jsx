import { useCallback, useEffect, useState } from 'react'
import {
  History as HistoryIcon,
  FileStack,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import DocumentHistoryTable from '../components/DocumentHistoryTable.jsx'
import { listHistory } from '../services/documentHistoryStorage.js'
import { describeError } from '../utils/errors.js'

export default function History() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await listHistory()

      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load document history:', err)

      setRecords([])
      setError(
        describeError(
          err,
          'Could not load your document history.'
        )
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  function handleDeleted(deletedId) {
    setRecords((current) =>
      current.filter((record) => record.id !== deletedId)
    )
  }

  const documentCount = records.length

  return (
    <div className="min-h-full bg-slate-50/70 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-7 lg:px-10 lg:py-9">

        {/* Page header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <HistoryIcon size={15} />
              Activity
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Document History
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              View and manage the HR documents generated from this workspace.
            </p>
          </div>

          {/* Count */}
          <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <FileStack size={17} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Generated
              </p>

              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {loading
                  ? 'Loading...'
                  : `${documentCount} ${
                      documentCount === 1
                        ? 'document'
                        : 'documents'
                    }`}
              </p>
            </div>
          </div>
        </div>

        {/* Supporting line */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Sparkles size={16} className="text-blue-500" />
          <span>Newest documents appear first.</span>
        </div>

        {/* Loading */}
        {loading && (
          <section className="flex min-h-[260px] items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2
                size={24}
                className="animate-spin text-blue-500"
              />

              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Loading document history...
              </p>
            </div>
          </section>
        )}

        {/* Error */}
        {!loading && error && (
          <section className="flex min-h-[260px] items-center justify-center rounded-2xl bg-white px-6 py-12 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex max-w-md flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
                <AlertCircle size={21} />
              </div>

              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Could not load document history
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {error}
              </p>

              <button
                type="button"
                onClick={loadHistory}
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          </section>
        )}

        {/* History */}
        {!loading && !error && (
          <section>
            <DocumentHistoryTable
              records={records}
              onDeleted={handleDeleted}
            />
          </section>
        )}
      </div>
    </div>
  )
}