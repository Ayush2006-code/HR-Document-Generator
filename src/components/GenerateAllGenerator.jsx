import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Layers,
  FileDown,
  Loader2,
  CheckCircle2,
  FileText,
  Download,
} from 'lucide-react'
import Field, { inputClass } from './Field.jsx'
import EmployeeForm from './EmployeeForm.jsx'
import SalaryForm from './SalaryForm.jsx'
import {
  SALARY_CALCULATION_MODES,
} from '../config/documentFields.js'
import {
  emptySalaryInput,
  validateSalaryInput,
  getDaysInMonth,
} from '../services/salaryCalculator.js'
import {
  generateOfferLetterDocx,
  generateAppointmentLetterDocx,
} from '../services/documentGenerator.js'
import { generateSalarySlipDocx } from '../services/salarySlipBuilder.js'
import { recordDocument } from '../services/documentHistoryStorage.js'
import {
  saveEmployee,
  getEmployee,
} from '../services/employeeStorage.js'
import { zipFiles } from '../services/zipExport.js'
import {
  validateEmployeeCore,
  validateDatesPresent,
  mergeErrors,
  hasErrors,
  validateRequired,
} from '../utils/validation.js'
import { downloadBlob } from '../utils/fileNaming.js'
import { toInputDateValue } from '../utils/dateFormat.js'
import { describeError } from '../utils/errors.js'
import { useToast } from '../context/ToastContext.jsx'

const TODAY = toInputDateValue(new Date())

function currentMonthValue() {
  const date = new Date()

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`
}

export default function GenerateAllGenerator() {
  const [searchParams] = useSearchParams()
  const { notify } = useToast()

  const [employee, setEmployee] = useState({
    salutation: 'Mr.',
    grade: 'As per Policy',
  })

  const [shared, setShared] = useState({
    offerDate: TODAY,
    appointmentDate: TODAY,
    joiningDate: '',
    offerValidTill: '',
    probationPeriod: '3 months',
    noticePeriod: '1 month',
    salaryMonth: currentMonthValue(),
    payableDays: 30,
    lopDays: 0,
    salaryCalculationMode: 'full',
  })

  const [salary, setSalary] = useState(
    emptySalaryInput()
  )

  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [loadingEmployee, setLoadingEmployee] = useState(false)
  const [results, setResults] = useState(null)

  /*
   * Load saved employee when Generate All is opened
   * from Employee Master.
   *
   * Example:
   * /generate/all?employeeId=xxxxxxxx
   */
  useEffect(() => {
    async function loadSavedEmployee() {
      const employeeId =
        searchParams.get('employeeId')

      if (!employeeId) {
        return
      }

      setLoadingEmployee(true)

      try {
        const existing =
          await getEmployee(employeeId)

        if (!existing) {
          notify(
            'Saved employee could not be found.',
            'error'
          )
          return
        }

        /*
         * Load complete saved employee information.
         */
        setEmployee(existing)

        /*
         * Load saved dates and employment terms.
         */
        setShared((current) => ({
          ...current,

          offerDate:
            existing.offerDate ||
            current.offerDate,

          appointmentDate:
            existing.appointmentDate ||
            current.appointmentDate,

          joiningDate:
            existing.joiningDate ||
            current.joiningDate,

          offerValidTill:
            existing.offerValidTill ||
            current.offerValidTill,

          probationPeriod:
            existing.probationPeriod ||
            current.probationPeriod,

          noticePeriod:
            existing.noticePeriod ||
            current.noticePeriod,
        }))

        /*
         * IMPORTANT:
         * Supabase employee storage uses `salary`.
         *
         * Keep fallback to salaryProfile for any older
         * records that may still have the old structure.
         */
        const savedSalary =
          existing.salary ??
          existing.salaryProfile ??
          {}

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
      } catch (err) {
        console.error(
          'Failed to load employee for Generate All:',
          err
        )

        notify(
          describeError(
            err,
            'Could not load the saved employee.'
          ),
          'error'
        )
      } finally {
        setLoadingEmployee(false)
      }
    }

    loadSavedEmployee()
  }, [searchParams, notify])

  function runValidation() {
    const errs = mergeErrors(
      validateEmployeeCore(employee),

      validateDatesPresent(shared, [
        {
          key: 'offerDate',
          label: 'Offer letter date',
        },
        {
          key: 'appointmentDate',
          label: 'Appointment letter date',
        },
        {
          key: 'joiningDate',
          label: 'Date of joining',
        },
        {
          key: 'offerValidTill',
          label: 'Offer valid till',
        },
      ]),

      validateSalaryInput(salary)
    )

    const monthErr =
      validateRequired(
        shared.salaryMonth,
        'Salary month'
      )

    if (monthErr) {
      errs.salaryMonth = monthErr
    }

    setErrors(errs)

    return errs
  }

  async function handleGenerateAll() {
    const errs = runValidation()

    if (hasErrors(errs)) {
      notify(
        'Please fix the highlighted fields before generating.',
        'error'
      )
      return
    }

    setBusy(true)
    setResults(null)

    try {
      /*
       * Save complete employee record.
       *
       * IMPORTANT:
       * Supabase employee storage expects salary,
       * not salaryProfile.
       */
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

        offerDate: shared.offerDate,
        appointmentDate:
          shared.appointmentDate,
        joiningDate: shared.joiningDate,
        offerValidTill:
          shared.offerValidTill,
        probationPeriod:
          shared.probationPeriod,
        noticePeriod:
          shared.noticePeriod,
      }

      /*
       * saveEmployee is async because it uses Supabase.
       */
      const savedEmployee =
        await saveEmployee(employeeToSave)

      setEmployee(savedEmployee)

      /*
       * Generate Offer Letter.
       */
      const offer =
        await generateOfferLetterDocx(
          savedEmployee,
          shared,
          salary
        )

      /*
       * Generate Appointment Letter.
       */
      const appointment =
        await generateAppointmentLetterDocx(
          savedEmployee,
          shared,
          salary
        )

      /*
       * Generate Salary Slip.
       */
      const salarySlip =
        await generateSalarySlipDocx(
          savedEmployee,
          {
            salaryMonth:
              shared.salaryMonth,

            payableDays:
              shared.payableDays,

            lopDays:
              shared.lopDays,

            dateOfJoining:
              shared.joiningDate,

            salaryCalculationMode:
              shared.salaryCalculationMode,
          },
          salary
        )

      /*
       * Save Offer Letter to Document History.
       */
      await recordDocument({
        employeeId:
          savedEmployee.id,

        employeeName:
          savedEmployee.employeeName,

        documentType: 'offer',

        files: [
          {
            kind: 'docx',
            blob: offer.blob,
            filename: offer.filename,
          },
        ],
      })

      /*
       * Save Appointment Letter to Document History.
       */
      await recordDocument({
        employeeId:
          savedEmployee.id,

        employeeName:
          savedEmployee.employeeName,

        documentType: 'appointment',

        files: [
          {
            kind: 'docx',
            blob: appointment.blob,
            filename:
              appointment.filename,
          },
        ],
      })

      /*
       * Save Salary Slip to Document History.
       */
      await recordDocument({
        employeeId:
          savedEmployee.id,

        employeeName:
          savedEmployee.employeeName,

        documentType: 'salary_slip',

        files: [
          {
            kind: 'docx',
            blob: salarySlip.blob,
            filename:
              salarySlip.filename,
          },
        ],
      })

      const generatedFiles = [
        {
          label: 'Offer Letter',
          type: 'DOCX',
          blob: offer.blob,
          filename: offer.filename,
        },
        {
          label: 'Appointment Letter',
          type: 'DOCX',
          blob: appointment.blob,
          filename:
            appointment.filename,
        },
        {
          label: 'Salary Slip',
          type: 'DOCX',
          blob: salarySlip.blob,
          filename:
            salarySlip.filename,
        },
      ]

      setResults(generatedFiles)

      notify(
        'All three DOCX documents generated successfully.',
        'success'
      )
    } catch (err) {
      console.error(
        'Generate All failed:',
        err
      )

      notify(
        describeError(
          err,
          'Could not generate all documents.'
        ),
        'error'
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleDownloadAll() {
    if (!results) {
      return
    }

    try {
      const zipBlob =
        await zipFiles(results)

      downloadBlob(
        zipBlob,
        `${
          employee.employeeName ||
          'Employee'
        } - All Documents.zip`
      )
    } catch (err) {
      notify(
        describeError(
          err,
          'Could not create the ZIP file.'
        ),
        'error'
      )
    }
  }

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div>
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
          <Layers size={14} />
          Bulk Document Generator
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Generate All Documents
        </h1>

        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Enter the information once and generate the Offer Letter,
          Appointment Letter and Salary Slip together.
        </p>
      </div>

      {/* Information banner */}
      <div className="flex gap-3 rounded-2xl bg-blue-50 p-4 dark:bg-blue-500/10">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
          <Layers size={17} />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            One set of information. Three documents.
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            The same employee, dates and salary information will
            be used across all generated documents.
          </p>
        </div>
      </div>

      {/* Loading saved employee */}
      {loadingEmployee && (
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800">
          <Loader2
            size={17}
            className="animate-spin text-blue-500"
          />
          Loading saved employee information...
        </div>
      )}

      {/* Employee */}
      <Section
        step="01"
        title="Employee Details"
        description="Basic employee information used across all three documents."
      >
        <EmployeeForm
          value={employee}
          onChange={setEmployee}
          errors={errors}
        />
      </Section>

      {/* Dates and terms */}
      <Section
        step="02"
        title="Dates & Terms"
        description="Configure dates and employment terms for the generated documents."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Offer Letter Date"
            required
            error={errors.offerDate}
          >
            <input
              type="date"
              className={inputClass(
                errors.offerDate
              )}
              value={shared.offerDate}
              onChange={(e) =>
                setShared({
                  ...shared,
                  offerDate:
                    e.target.value,
                })
              }
            />
          </Field>

          <Field
            label="Appointment Letter Date"
            required
            error={errors.appointmentDate}
          >
            <input
              type="date"
              className={inputClass(
                errors.appointmentDate
              )}
              value={
                shared.appointmentDate
              }
              onChange={(e) =>
                setShared({
                  ...shared,
                  appointmentDate:
                    e.target.value,
                })
              }
            />
          </Field>

          <Field
            label="Date of Joining"
            required
            error={errors.joiningDate}
          >
            <input
              type="date"
              className={inputClass(
                errors.joiningDate
              )}
              value={shared.joiningDate}
              onChange={(e) =>
                setShared({
                  ...shared,
                  joiningDate:
                    e.target.value,
                })
              }
            />
          </Field>

          <Field
            label="Offer Valid Till"
            required
            error={errors.offerValidTill}
          >
            <input
              type="date"
              className={inputClass(
                errors.offerValidTill
              )}
              value={
                shared.offerValidTill
              }
              onChange={(e) =>
                setShared({
                  ...shared,
                  offerValidTill:
                    e.target.value,
                })
              }
            />
          </Field>

          <Field label="Probation Period">
            <input
              className={inputClass(false)}
              value={
                shared.probationPeriod
              }
              onChange={(e) =>
                setShared({
                  ...shared,
                  probationPeriod:
                    e.target.value,
                })
              }
            />
          </Field>

          <Field label="Notice Period">
            <input
              className={inputClass(false)}
              value={shared.noticePeriod}
              onChange={(e) =>
                setShared({
                  ...shared,
                  noticePeriod:
                    e.target.value,
                })
              }
            />
          </Field>

          <Field
            label="Salary Slip Month"
            required
            error={errors.salaryMonth}
            hint={
              shared.salaryMonth
                ? `${getDaysInMonth(
                    shared.salaryMonth
                  )} days in this month`
                : ''
            }
          >
            <input
              type="month"
              className={inputClass(
                errors.salaryMonth
              )}
              value={shared.salaryMonth}
              onChange={(e) =>
                setShared({
                  ...shared,
                  salaryMonth:
                    e.target.value,
                })
              }
            />
          </Field>

          <Field
            label="Salary Slip Calculation Mode"
            hint="Only affects the Salary Slip, not the CTC in the letters."
          >
            <select
              className={inputClass(false)}
              value={
                shared.salaryCalculationMode
              }
              onChange={(e) =>
                setShared({
                  ...shared,
                  salaryCalculationMode:
                    e.target.value,
                })
              }
            >
              {SALARY_CALCULATION_MODES.map(
                (mode) => (
                  <option
                    key={mode.value}
                    value={mode.value}
                  >
                    {mode.label}
                  </option>
                )
              )}
            </select>
          </Field>
        </div>
      </Section>

      {/* Salary */}
      <Section
        step="03"
        title="Salary Details"
        description="Enter the compensation structure used across the generated documents."
      >
        <SalaryForm
          value={salary}
          onChange={setSalary}
          errors={errors}
          foldNote
        />
      </Section>

      {/* Generate */}
      <div className="rounded-2xl bg-slate-900 p-5 dark:bg-slate-800 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText
                size={17}
                className="text-blue-300"
              />

              <h2 className="text-sm font-semibold text-white">
                Ready to generate
              </h2>
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              This will create all three documents and save them
              to Document History.
            </p>
          </div>

          <button
            onClick={handleGenerateAll}
            disabled={
              busy || loadingEmployee
            }
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
            type="button"
          >
            {busy ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Layers size={16} />
            )}

            {busy
              ? 'Generating...'
              : 'Generate All Documents'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800/80 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={18}
                  className="text-emerald-500"
                />

                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Documents ready
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                All three DOCX files have been generated successfully.
              </p>
            </div>

            <button
              onClick={handleDownloadAll}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              type="button"
            >
              <Download size={15} />
              Download All (.zip)
            </button>
          </div>

          <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {results.map((result) => (
              <div
                key={result.filename}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <FileText size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {result.label}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      {result.filename}
                    </p>
                  </div>

                  <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:inline-flex">
                    {result.type}
                  </span>
                </div>

                <button
                  onClick={() =>
                    downloadBlob(
                      result.blob,
                      result.filename
                    )
                  }
                  className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg px-3 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 sm:self-auto"
                  type="button"
                >
                  <FileDown size={14} />
                  Download
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
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