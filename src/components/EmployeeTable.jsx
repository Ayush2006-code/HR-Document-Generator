import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Pencil,
  FileSignature,
  Trash2,
  Plus,
  Search,
  Copy,
  Sparkles,
  MoreHorizontal,
  UserRound,
  Loader2,
  Layers,
} from 'lucide-react'
import Modal from './Modal.jsx'
import EmployeeForm from './EmployeeForm.jsx'
import {
  saveEmployee,
  deleteEmployee,
} from '../services/employeeStorage.js'
import { emptySalaryInput } from '../services/salaryCalculator.js'
import {
  validateEmployeeCore,
  hasErrors,
} from '../utils/validation.js'
import { describeError } from '../utils/errors.js'
import { useToast } from '../context/ToastContext.jsx'

function demoEmployeeTemplate() {
  return {
    salutation: 'Mr.',
    employeeName: 'Rahul Sharma',
    employeeId: 'EMP1001',
    department: 'Operations',
    designation: 'Operations Executive',
    grade: 'As per Policy',
    location: 'Noida',
    address: 'Noida, Uttar Pradesh',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    salaryProfile: {
      ...emptySalaryInput(),
      basic: 25000,
      hra: 10000,
      conveyance: 1600,
      statBonus: 0,
      specialAllowance: 5000,
      otherEarnings: 0,
      employerPF: 3000,
      employerESIC: 0,
      lwf: 20,
      employeePF: 3000,
      employeeESIC: 0,
      employeeLWF: 10,
      tds: 0,
      otherDeductions: 0,
    },
  }
}

export default function EmployeeTable({
  employees,
  onChanged,
}) {
  const navigate = useNavigate()
  const { notify } = useToast()

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [errors, setErrors] = useState({})
  const [menuFor, setMenuFor] = useState(null)
  const [menuPosition, setMenuPosition] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const filtered = employees.filter((employee) => {
    const q = search.trim().toLowerCase()

    if (!q) {
      return true
    }

    return [
      employee.employeeName,
      employee.designation,
      employee.department,
      employee.location,
      employee.employeeId,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(q)
      )
  })

  function closeGenerateMenu() {
    setMenuFor(null)
    setMenuPosition(null)
  }

  function handleAdd() {
    closeGenerateMenu()
    setErrors({})

    setEditing({
      salutation: 'Mr.',
      grade: 'As per Policy',
    })
  }

  function handleLoadDemo() {
    closeGenerateMenu()
    setErrors({})
    setEditing(demoEmployeeTemplate())
  }

  function handleEdit(employee) {
    closeGenerateMenu()
    setErrors({})

    setEditing({
      ...employee,
    })
  }

  async function handleSave() {
    const errs = validateEmployeeCore(editing)

    setErrors(errs)

    if (hasErrors(errs)) {
      return
    }

    setSaving(true)

    try {
      const savedEmployee = await saveEmployee(editing)

      notify(
        editing?.id
          ? 'Employee updated successfully.'
          : 'Employee added successfully.',
        'success'
      )

      setEditing(null)
      setErrors({})
      closeGenerateMenu()

      await onChanged?.(savedEmployee)
    } catch (err) {
      notify(
        describeError(
          err,
          'Could not save this employee.'
        ),
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(employee) {
    const employeeName = employee.employeeName
      ? `${employee.salutation || ''} ${employee.employeeName}`.trim()
      : 'this employee'

    const confirmed = window.confirm(
      `Are you sure you want to delete ${employeeName}\n\nThis will remove the employee from Employee Master.`
    )

    if (!confirmed) {
      return
    }

    setDeletingId(employee.id)

    try {
      await deleteEmployee(employee.id)

      closeGenerateMenu()

      if (editing?.id === employee.id) {
        setEditing(null)
        setErrors({})
      }

      notify(
        'Employee removed successfully.',
        'success'
      )

      await onChanged?.(employee)
    } catch (err) {
      notify(
        describeError(
          err,
          'Could not remove this employee.'
        ),
        'error'
      )
    } finally {
      setDeletingId(null)
    }
  }

  function handleDuplicate(employee) {
    const {
      id,
      createdAt,
      updatedAt,
      ...rest
    } = employee

    setEditing({
      ...rest,
      employeeName: rest.employeeName
        ? `${rest.employeeName} (Copy)`
        : '',
    })

    setErrors({})
    closeGenerateMenu()
  }

  /*
   * Employee -> Generate -> Document
   *
   * The employee ID is passed through the URL so the
   * generator can automatically load the saved employee.
   */
  function handleGenerate(employee, path) {
    closeGenerateMenu()

    if (!employee?.id) {
      notify(
        'This employee does not have a valid ID.',
        'error'
      )
      return
    }

    navigate(
      `${path}?employeeId=${encodeURIComponent(
        employee.id
      )}`
    )
  }

  function toggleGenerateMenu(employee, event) {
    if (menuFor === employee.id) {
      closeGenerateMenu()
      return
    }

    const rect =
      event.currentTarget.getBoundingClientRect()

    const menuWidth = 208
    const menuHeight = 204
    const gap = 8

    let left = rect.right - menuWidth
    let top = rect.bottom + gap

    if (left < 8) {
      left = 8
    }

    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8
    }

    if (top + menuHeight > window.innerHeight - 8) {
      top = rect.top - menuHeight - gap
    }

    if (top < 8) {
      top = 8
    }

    setMenuFor(employee.id)
    setMenuPosition({
      top,
      left,
    })
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="h-11 w-full rounded-xl bg-white pl-10 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 dark:bg-slate-900 dark:text-white dark:ring-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadDemo}
            disabled={saving}
            className="flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
            title="Fill the Add Employee form with a sample record you can review before saving"
          >
            <Sparkles
              size={15}
              className="text-blue-500"
            />
            Demo Employee
          </button>

          <button
            type="button"
            onClick={handleAdd}
            disabled={saving}
            className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Result count */}
      {employees.length > 0 && (
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-xs font-medium text-slate-400">
            {search
              ? `${filtered.length} of ${employees.length} employees`
              : `${employees.length} employee${
                  employees.length === 1 ? '' : 's'
                }`}
          </p>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            {search ? (
              <Search size={20} />
            ) : (
              <UserRound size={20} />
            )}
          </div>

          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {search
              ? 'No employees found'
              : 'No employees yet'}
          </h3>

          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            {search
              ? 'Try a different name, employee ID, department or location.'
              : 'Add your first employee to start creating HR documents.'}
          </p>

          {!search && (
            <button
              type="button"
              onClick={handleAdd}
              className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={15} />
              Add Employee
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800 md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/40">
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Employee
                    </th>

                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Designation
                    </th>

                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Department
                    </th>

                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Location
                    </th>

                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((employee) => (
                    <tr
                      key={employee.id}
                      className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            {(employee.employeeName || '?')
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 dark:text-white">
                              {employee.salutation}{' '}
                              {employee.employeeName}
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-slate-400">
                              {employee.employeeId ||
                                'No employee ID'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {employee.designation || '—'}
                      </td>

                      <td className="px-5 py-4">
                        {employee.department ? (
                          <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {employee.department}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {employee.location || '—'}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(employee)
                            }
                            disabled={
                              deletingId === employee.id
                            }
                            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                            title="Edit"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDuplicate(employee)
                            }
                            disabled={
                              deletingId === employee.id
                            }
                            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                            title="Duplicate"
                          >
                            <Copy size={14} />
                            Duplicate
                          </button>

                          <button
                            type="button"
                            onClick={(event) =>
                              toggleGenerateMenu(
                                employee,
                                event
                              )
                            }
                            disabled={
                              deletingId === employee.id
                            }
                            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                            title="Generate document"
                          >
                            <FileSignature size={14} />
                            Generate
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(employee)
                            }
                            disabled={
                              deletingId === employee.id
                            }
                            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-rose-500/10"
                            title="Delete"
                          >
                            {deletingId === employee.id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((employee) => (
              <div
                key={employee.id}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      {(employee.employeeName || '?')
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {employee.salutation}{' '}
                        {employee.employeeName}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {employee.employeeId ||
                          'No employee ID'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(event) =>
                      toggleGenerateMenu(
                        employee,
                        event
                      )
                    }
                    disabled={
                      deletingId === employee.id
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                    title="More actions"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Designation
                    </p>

                    <p className="mt-1 truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                      {employee.designation || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Department
                    </p>

                    <p className="mt-1 truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                      {employee.department || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Location
                    </p>

                    <p className="mt-1 truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                      {employee.location || '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(employee)
                    }
                    disabled={
                      deletingId === employee.id
                    }
                    className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDuplicate(employee)
                    }
                    disabled={
                      deletingId === employee.id
                    }
                    className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Copy size={13} />
                    Duplicate
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(employee)
                    }
                    disabled={
                      deletingId === employee.id
                    }
                    className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-rose-500 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-rose-500/10"
                  >
                    {deletingId === employee.id ? (
                      <Loader2
                        size={13}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Generate menu */}
      {menuFor && menuPosition && (
        <>
          <div
            className="fixed inset-0 z-[90]"
            onClick={closeGenerateMenu}
          />

          <div
            className="fixed z-[100] w-52 overflow-hidden rounded-xl bg-white p-1.5 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            {(() => {
              const employee = employees.find(
                (item) => item.id === menuFor
              )

              if (!employee) {
                return null
              }

              return (
                <>
                  <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Generate document
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      handleGenerate(
                        employee,
                        '/generate/offer-letter'
                      )
                    }
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <FileSignature
                      size={15}
                      className="text-blue-500"
                    />
                    Offer Letter
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleGenerate(
                        employee,
                        '/generate/appointment-letter'
                      )
                    }
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <FileSignature
                      size={15}
                      className="text-indigo-500"
                    />
                    Appointment Letter
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleGenerate(
                        employee,
                        '/generate/salary-slip'
                      )
                    }
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <FileSignature
                      size={15}
                      className="text-emerald-500"
                    />
                    Salary Slip
                  </button>

                  <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    type="button"
                    onClick={() =>
                      handleGenerate(
                        employee,
                        '/generate/all'
                      )
                    }
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                  >
                    <Layers
                      size={15}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    Generate All Documents
                  </button>
                </>
              )
            })()}
          </div>
        </>
      )}

      {/* Add / Edit modal */}
      {editing && (
        <Modal
          title={
            editing.id
              ? 'Edit Employee'
              : 'Add Employee'
          }
          onClose={() => {
            if (saving) return

            setEditing(null)
            setErrors({})
          }}
        >
          <EmployeeForm
            value={editing}
            onChange={setEditing}
            errors={errors}
          />

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (saving) return

                setEditing(null)
                setErrors({})
              }}
              disabled={saving}
              className="h-10 rounded-xl px-4 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              )}

              {saving
                ? 'Saving...'
                : 'Save Employee'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}