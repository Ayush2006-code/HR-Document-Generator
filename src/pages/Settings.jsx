import { useState } from 'react'
import {
  Sun,
  Moon,
  Trash2,
  Info,
  Settings as SettingsIcon,
  Database,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { notify } = useToast()
  const [confirming, setConfirming] = useState(false)

  function estimateStorage() {
    let total = 0

    try {
      for (const key in localStorage) {
        if (
          Object.prototype.hasOwnProperty.call(localStorage, key)
        ) {
          total += (localStorage[key]?.length || 0) * 2
        }
      }
    } catch {
      /* ignore */
    }

    return total
  }

  function handleClearAll() {
    localStorage.removeItem('hrdoc.employees')
    localStorage.removeItem('hrdoc.history')
    indexedDB.deleteDatabase('hrdoc-files')
    indexedDB.deleteDatabase('hrdoc-templates')

    notify('All local data cleared.', 'success')
    setConfirming(false)

    setTimeout(() => window.location.reload(), 800)
  }

  return (
    <div className="min-h-full bg-slate-50/70 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-5xl px-5 py-7 sm:px-7 lg:px-10 lg:py-9">

        {/* Header */}
        <div className="mb-9">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <SettingsIcon size={15} />
            Workspace Settings
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Manage your appearance preferences, local application data,
            and workspace information.
          </p>
        </div>

        <div className="space-y-8">

          {/* Appearance */}
          <section>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Appearance
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Choose how HR Docs looks while you work.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Light */}
              <button
                onClick={() => setTheme('light')}
                className={[
                  'group flex min-h-[86px] items-center gap-4 rounded-2xl px-5 text-left transition-all',
                  theme === 'light'
                    ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-500/10 dark:text-blue-400'
                    : 'bg-white text-slate-600 shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 dark:text-slate-300',
                ].join(' ')}
                type="button"
              >
                <span
                  className={[
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors',
                    theme === 'light'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                  ].join(' ')}
                >
                  <Sun size={20} />
                </span>

                <span>
                  <span className="block text-sm font-semibold">
                    Light mode
                  </span>

                  <span className="mt-1 block text-xs text-slate-400">
                    Bright and clean workspace
                  </span>
                </span>

                {theme === 'light' && (
                  <span className="ml-auto h-2.5 w-2.5 rounded-full bg-blue-600" />
                )}
              </button>

              {/* Dark */}
              <button
                onClick={() => setTheme('dark')}
                className={[
                  'group flex min-h-[86px] items-center gap-4 rounded-2xl px-5 text-left transition-all',
                  theme === 'dark'
                    ? 'bg-blue-500/10 text-blue-400 shadow-sm'
                    : 'bg-white text-slate-600 shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 dark:text-slate-300',
                ].join(' ')}
                type="button"
              >
                <span
                  className={[
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors',
                    theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                  ].join(' ')}
                >
                  <Moon size={20} />
                </span>

                <span>
                  <span className="block text-sm font-semibold">
                    Dark mode
                  </span>

                  <span className="mt-1 block text-xs text-slate-400">
                    Comfortable for low-light work
                  </span>
                </span>

                {theme === 'dark' && (
                  <span className="ml-auto h-2.5 w-2.5 rounded-full bg-blue-500" />
                )}
              </button>
            </div>
          </section>

          {/* Data & Privacy */}
          <section>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Data & Privacy
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Review local storage usage and clear browser data.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900 sm:p-6">

              {/* Storage */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Database size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Local storage
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Metadata currently stored in this browser
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-2.5 dark:bg-slate-800">
                  <p className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {(estimateStorage() / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {/* Privacy information */}
              <div className="mt-5 flex gap-3 rounded-2xl bg-emerald-50/80 p-4 dark:bg-emerald-500/5">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                />

                <p className="text-xs leading-5 text-emerald-800/80 dark:text-emerald-300/80">
                  Employee records, salary figures, and generated documents
                  are currently stored in this browser using localStorage and
                  IndexedDB. Clearing browser data removes this local data.
                </p>
              </div>

              {/* Clear */}
              <div className="mt-6 pt-1">
                {!confirming ? (
                  <button
                    onClick={() => setConfirming(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-50 px-4 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/15"
                    type="button"
                  >
                    <Trash2 size={15} />
                    Clear all local data
                  </button>
                ) : (
                  <div className="rounded-2xl bg-rose-50 p-4 dark:bg-rose-500/5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                          Clear everything?
                        </p>

                        <p className="mt-1 text-xs leading-5 text-rose-700/70 dark:text-rose-300/70">
                          This deletes every employee, document, and template
                          override stored locally.
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={handleClearAll}
                          className="inline-flex h-9 items-center gap-2 rounded-xl bg-rose-500 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-rose-600"
                          type="button"
                        >
                          <Trash2 size={14} />
                          Yes, clear
                        </button>

                        <button
                          onClick={() => setConfirming(false)}
                          className="inline-flex h-9 items-center rounded-xl bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* About */}
          <section>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                About
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Application information.
              </p>
            </div>

            <div className="flex gap-4 rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Info size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  HR Document Generator
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Version 1.0.0
                </p>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Generate Offer Letters, Appointment Letters, and Salary
                  Slips from real DOCX templates directly from your workspace.
                </p>
              </div>

              <div className="ml-auto hidden shrink-0 items-center gap-1.5 self-start rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 sm:flex">
                <Sparkles size={12} />
                HR Docs
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}