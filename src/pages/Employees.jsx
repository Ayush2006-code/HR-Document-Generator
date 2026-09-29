import { useCallback, useEffect, useState } from 'react'
import {
  Users,
  UserPlus,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import EmployeeTable from '../components/EmployeeTable.jsx'
import { listEmployees } from '../services/employeeStorage.js'
import { describeError } from '../utils/errors.js'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await listEmployees()
      setEmployees(Array.isArray(data) ? data : [])
    } catch (err) {
      setEmployees([])
      setError(
        describeError(
          err,
          'Could not load your employees.'
        )
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const employeeCount = employees.length

  return (
    <div className="min-h-full bg-slate-50/70 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-7 lg:px-10 lg:py-9">

        {/* Page header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Users size={15} />
              People Management
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Employees
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Manage your employee master list and use employee information
              across your HR documents.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Users size={17} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Master list
              </p>

              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {loading
                  ? 'Loading...'
                  : `${employeeCount} ${
                      employeeCount === 1
                        ? 'employee'
                        : 'employees'
                    }`}
              </p>
            </div>
          </div>
        </div>

        {/* Quick information */}
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Sparkles size={16} className="text-blue-500" />
            <span>
              Keep employee details updated for accurate document generation.
            </span>
          </div>

          {!loading && employeeCount === 0 && !error && (
            <div className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
              <UserPlus size={14} />
              Add your first employee
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Loading employees
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching your employee master from Supabase...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-white px-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
                <AlertCircle size={20} />
              </div>

              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Could not load employees
              </h2>

              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {error}
              </p>

              <button
                type="button"
                onClick={refresh}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <RefreshCw size={15} />
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Employee workspace */}
        {!loading && !error && (
          <section>
            <EmployeeTable
              employees={employees}
              onChanged={refresh}
            />
          </section>
        )}
      </div>
    </div>
  )
}