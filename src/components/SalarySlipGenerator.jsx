import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  Eye,
  FileDown,
  FileText,
} from 'lucide-react'
import Field, { inputClass } from './Field.jsx'
import EmployeeForm from './EmployeeForm.jsx'
import SalaryForm from './SalaryForm.jsx'
import DocumentPreview from './DocumentPreview.jsx'
import { ActionButton } from './OfferLetterGenerator.jsx'
import {
  emptySalaryInput,
  validateSalaryInput,
  getDaysInMonth,
} from '../services/salaryCalculator.js'
import { generateSalarySlipDocx } from '../services/salarySlipBuilder.js'
import { recordDocument } from '../services/documentHistoryStorage.js'
import {
  saveEmployee,
  getEmployee,
} from '../services/employeeStorage.js'
import {
  validateEmployeeCore,
  mergeErrors,
  hasErrors,
  validateRequired,
} from '../utils/validation.js'
import { downloadBlob } from '../utils/fileNaming.js'
import { describeError } from '../utils/errors.js'
import { SALARY_CALCULATION_MODES } from '../config/salaryRules.js'
import { useToast } from '../context/ToastContext.jsx'

function currentMonthValue() {
  const d = new Date()

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, '0')}`
}

export default function SalarySlipGenerator() {
  const [searchParams] = useSearchParams()
  const { notify } = useToast()

  const [employee, setEmployee] = useState({
    salutation: 'Mr.',
  })

  const [slip, setSlip] = useState({
    salaryMonth: currentMonthValue(),
    payableDays: 30,
    lopDays: 0,
    dateOfJoining: '',
    salaryCalculationMode: 'full',
  })

  const [salary, setSalary] =
    useState(emptySalaryInput())

  const [errors, setErrors] = useState({})
  const [blob, setBlob] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadEmployee() {
      const employeeId =
        searchParams.get('employeeId')

      if (!employeeId) {
        return
      }

      try {
        const existing =
          await getEmployee(employeeId)

        if (!existing || cancelled) {
          return
        }

        setEmployee(existing)

        const savedSalary =
          existing.salary ?? existing.salaryProfile

        if (savedSalary) {
          setSalary({
            ...emptySalaryInput(),
            ...savedSalary,

            additionalEarnings:
              Array.isArray(
                savedSalary.additionalEarnings
              )
                ? savedSalary.additionalEarnings
                : [],

            additionalDeductions:
              Array.isArray(
                savedSalary.additionalDeductions
              )
                ? savedSalary.additionalDeductions
                : [],
          })
        } else {
          setSalary(
            emptySalaryInput()
          )
        }

        if (existing.joiningDate) {
          setSlip((current) => ({
            ...current,
            dateOfJoining:
              existing.joiningDate,
          }))
        }
      } catch (err) {
        if (!cancelled) {
          notify(
            describeError(
              err,
              'Could not load the selected employee.'
            ),
            'error'
          )
        }
      }
    }

    loadEmployee()

    return () => {
      cancelled = true
    }
  }, [searchParams, notify])

  function runValidation() {
    const errs = mergeErrors(
      validateEmployeeCore(employee),
      validateSalaryInput(salary)
    )

    const monthErr =
      validateRequired(
        slip.salaryMonth,
        'Salary month'
      )

    if (monthErr) {
      errs.salaryMonth = monthErr
    }

    if (Number(slip.lopDays) < 0) {
      errs.lopDays =
        'LOP days cannot be negative.'
    }

    if (Number(slip.payableDays) < 0) {
      errs.payableDays =
        'Payable days cannot be negative.'
    }

    setErrors(errs)

    return errs
  }

  async function handleGenerate({
    download,
  }) {
    const errs = runValidation()

    if (hasErrors(errs)) {
      notify(
        'Please fix the highlighted fields before generating.',
        'error'
      )
      return
    }

    setBusy(true)

    try {
      const result =
        await generateSalarySlipDocx(
          employee,
          slip,
          salary
        )

      setBlob(result.blob)

      /*
       * PREVIEW ONLY
       *
       * Do not:
       * - save employee
       * - save salary profile
       * - create history
       * - create version
       * - download anything
       */
      if (download === null) {
        notify(
          'Preview updated.',
          'success'
        )

        return
      }

      const employeeToSave = {
        ...employee,

        salary: {
          ...emptySalaryInput(),
          ...salary,

          additionalEarnings:
            Array.isArray(
              salary.additionalEarnings
            )
              ? salary.additionalEarnings
              : [],

          additionalDeductions:
            Array.isArray(
              salary.additionalDeductions
            )
              ? salary.additionalDeductions
              : [],
        },
      }

      const savedEmployee =
        await saveEmployee(employeeToSave)

      setEmployee(savedEmployee)

      /*
       * DOCX ONLY
       */
      if (download === 'docx') {
        await recordDocument({
          employeeId:
            savedEmployee.id,

          employeeName:
            savedEmployee.employeeName,

          documentType:
            'salary_slip',

          files: [
            {
              kind: 'docx',
              blob: result.blob,
              filename: result.filename,
            },
          ],
        })

        downloadBlob(
          result.blob,
          result.filename
        )

        notify(
          'Salary Slip generated and downloaded.',
          'success'
        )

        return
      }
    } catch (err) {
      notify(
        describeError(
          err,
          'Could not generate the Salary Slip.'
        ),
        'error'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
            <FileText size={14} />
            Document Generator
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Salary Slip
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Enter employee, pay period and salary details to
            prepare a professional salary slip.
          </p>
        </div>

        <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
          <CheckCircle2
            size={15}
            className="text-emerald-500"
          />
          DOCX output
        </div>
      </div>

      {/* Main workspace */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
        {/* Form column */}
        <div className="min-w-0 space-y-5">
          <Section
            step="01"
            title="Employee Details"
            description="Basic employee information used in the salary slip."
          >
            <EmployeeForm
              value={employee}
              onChange={setEmployee}
              errors={errors}
            />
          </Section>

          <Section
            step="02"
            title="Pay Period"
            description="Select the salary month and attendance-related details."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Salary Month"
                required
                error={errors.salaryMonth}
              >
                <input
                  type="month"
                  className={inputClass(
                    errors.salaryMonth
                  )}
                  value={slip.salaryMonth}
                  onChange={(e) =>
                    setSlip({
                      ...slip,
                      salaryMonth:
                        e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Date of Joining">
                <input
                  type="date"
                  className={inputClass(false)}
                  value={slip.dateOfJoining}
                  onChange={(e) =>
                    setSlip({
                      ...slip,
                      dateOfJoining:
                        e.target.value,
                    })
                  }
                />
              </Field>

              <Field
                label="Payable Days"
                error={errors.payableDays}
                hint={`Out of ${getDaysInMonth(
                  slip.salaryMonth
                )} days this month`}
              >
                <input
                  type="number"
                  min="0"
                  max="31"
                  className={inputClass(
                    errors.payableDays
                  )}
                  value={slip.payableDays}
                  onChange={(e) =>
                    setSlip({
                      ...slip,
                      payableDays:
                        e.target.value,
                    })
                  }
                />
              </Field>

              <Field
                label="LOP Days"
                error={errors.lopDays}
                hint="Leave without pay days"
              >
                <input
                  type="number"
                  min="0"
                  className={inputClass(
                    errors.lopDays
                  )}
                  value={slip.lopDays}
                  onChange={(e) =>
                    setSlip({
                      ...slip,
                      lopDays:
                        e.target.value,
                    })
                  }
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field
                label="Salary Calculation Mode"
                hint="Full Monthly Salary is the default — Payable/LOP Days are recorded but don't change the payout."
              >
                <select
                  className={inputClass(false)}
                  value={
                    slip.salaryCalculationMode
                  }
                  onChange={(e) =>
                    setSlip({
                      ...slip,
                      salaryCalculationMode:
                        e.target.value,
                    })
                  }
                >
                  {SALARY_CALCULATION_MODES.map(
                    (m) => (
                      <option
                        key={m.value}
                        value={m.value}
                      >
                        {m.label}
                      </option>
                    )
                  )}
                </select>
              </Field>
            </div>
          </Section>

          <Section
            step="03"
            title="Salary Details"
            description="Enter the employee's earnings and deductions."
          >
            <SalaryForm
              value={salary}
              onChange={setSalary}
              errors={errors}
            />
          </Section>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <ActionButton
              icon={Eye}
              label="Preview Salary Slip"
              onClick={() =>
                handleGenerate({
                  download: null,
                })
              }
              busy={busy}
              variant="outline"
            />

            <ActionButton
              icon={FileDown}
              label="Generate DOCX"
              onClick={() =>
                handleGenerate({
                  download: 'docx',
                })
              }
              busy={busy}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="min-w-0 xl:sticky xl:top-6">
          <div className="h-[calc(100vh-170px)] min-h-[620px] max-h-[900px]">
            <DocumentPreview
              blob={blob}
              emptyLabel="Fill in the form and click Preview Salary Slip."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({
  step,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800/80 sm:p-6">
      <div className="mb-6 flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {step}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>

          <p className="mt-0.5 text-xs leading-5 text-slate-400 dark:text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  )
}