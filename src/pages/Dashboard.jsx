import { useCallback, useEffect, useState } from 'react'
import {
  ArrowRight,
  Clock3,
  FileStack,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import DocumentSelector from '../components/DocumentSelector.jsx'
import DocumentHistoryTable from '../components/DocumentHistoryTable.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { listHistory } from '../services/documentHistoryStorage.js'
import { describeError } from '../utils/errors.js'

export default function Dashboard() {
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshRecent = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const history = await listHistory()

      setRecent(
        Array.isArray(history)
          ? history.slice(0, 5)
          : []
      )
    } catch (err) {
      console.error(
        'Failed to load recent documents:',
        err
      )

      setRecent([])
      setError(
        describeError(
          err,
          'Could not load recent documents.'
        )
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshRecent()
  }, [refreshRecent])

  function handleDeleted(deletedId) {
    setRecent((current) =>
      current.filter(
        (record) => record.id !== deletedId
      )
    )
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-7 lg:px-10 lg:py-9">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-slate-900 dark:bg-slate-900">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
                <Sparkles size={14} />
                HR Workspace
              </div>

              <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Create professional HR documents
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Generate offer letters, appointment letters and salary slips
                quickly from one simple workspace.
              </p>
            </div>

            <div className="hidden shrink-0 lg:block">
              <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-white/10">
                <FileText
                  size={46}
                  strokeWidth={1.5}
                  className="text-blue-300"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <OverviewCard
            label="Recent Documents"
            value={
              loading
                ? '...'
                : recent.length
            }
            description="Latest documents generated in your workspace."
            icon={FileStack}
            iconClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          />

          <OverviewCard
            label="Workspace"
            value="HR"
            description="Everything you need for everyday HR documentation."
            icon={Sparkles}
            iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
          />

          <OverviewCard
            label="Output"
            value="DOCX"
            description="Generate editable Microsoft Word documents."
            icon={FileText}
            iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          />
        </section>

        {/* Create document */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Create a document
                </h2>

                <ArrowRight
                  size={18}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Choose what you want to generate.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800/80 sm:p-6">
            <DocumentSelector />
          </div>
        </section>

        {/* Recent documents */}
        <section className="mt-10 pb-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock3
                  size={18}
                  className="text-slate-400"
                />

                <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Recent documents
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your latest generated HR documents.
              </p>
            </div>

            {!loading && recent.length > 0 && (
              <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:block">
                Latest {recent.length}
              </span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex min-h-[240px] items-center justify-center rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800/80">
              <div className="flex flex-col items-center gap-3">
                <Loader2
                  size={24}
                  className="animate-spin text-blue-500"
                />

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Loading recent documents...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex min-h-[240px] items-center justify-center rounded-[24px] bg-white px-6 py-10 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800/80">
              <div className="flex max-w-md flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
                  <AlertCircle size={21} />
                </div>

                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Could not load recent documents
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={refreshRecent}
                  className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  <RefreshCw size={14} />
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            recent.length === 0 && (
              <div className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800/80 sm:p-8">
                <EmptyState
                  icon={FileStack}
                  title="No documents generated yet"
                  body="Choose a document type above to create your first HR document."
                />
              </div>
            )}

          {/* Recent records */}
          {!loading &&
            !error &&
            recent.length > 0 && (
              <div className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800/80">
                <DocumentHistoryTable
                  records={recent}
                  onDeleted={handleDeleted}
                />
              </div>
            )}
        </section>
      </div>
    </div>
  )
}

function OverviewCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 dark:ring-slate-800/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-3 max-w-xs text-sm leading-5 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  )
}