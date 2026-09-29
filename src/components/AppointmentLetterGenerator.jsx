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
import { APPOINTMENT_LETTER_FIELDS } from '../config/documentFields.js'
import {
  emptySalaryInput,
  validateSalaryInput,
} from '../services/salaryCalculator.js'
import { generateAppointmentLetterDocx } from '../services/documentGenerator.js'
import { recordDocument } from '../services/documentHistoryStorage.js'
import {
  saveEmployee,
  getEmployee,
} from '../services/employeeStorage.js'
import {
  validateEmployeeCore,
  validateDatesPresent,
  mergeErrors,
  hasErrors,
} from '../utils/validation.js'
import { downloadBlob } from '../utils/fileNaming.js'
import { describeError } from '../utils/errors.js'
import { toInputDateValue } from '../utils/dateFormat.js'
import { useToast } from '../context/ToastContext.jsx'

const TODAY = toInputDateValue(new Date())

export default function AppointmentLetterGenerator() {
  const [searchParams] = useSearchParams()
  const { notify } = useToast()

  const [employee, setEmployee] = useState({
    salutation: 'Mr.',
    grade: 'As per Policy',
  })

  const [appointment, setAppointment] = useState({
    appointmentDate: TODAY,
    probationPeriod: '3 months',
    noticePeriod: '1 month',
  })

  const [salary, setSalary] = useState(emptySalaryInput())
  const [errors, setErrors] = useState({})
  const [blob, setBlob] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadEmployee() {
      const employeeId = searchParams.get('employeeId')

      if (!employeeId) return

      try {
        const existing = await getEmployee(employeeId)

        if (!existing || cancelled) return

        setEmployee(existing)

        const savedSalary =
          existing.salary ?? existing.salaryProfile

        if (savedSalary) {
          setSalary({
            ...emptySalaryInput(),
            ...savedSalary,
            additionalEarnings:
              Array.isArray(savedSalary.additionalEarnings)
                ? savedSalary.additionalEarnings
                : [],
            additionalDeductions:
              Array.isArray(savedSalary.additionalDeductions)
                ? savedSalary.additionalDeductions
                : [],
          })
        } else {
          setSalary(emptySalaryInput())
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

      validateDatesPresent(appointment, [
        {
          key: 'appointmentDate',
          label: 'Appointment letter date',
        },
        {
          key: 'offerDate',
          label: 'Offer letter date',
        },
        {
          key: 'joiningDate',
          label: 'Date of joining',
        },
      ]),

      validateSalaryInput(salary)
    )

    setErrors(errs)

    return errs
  }

  async function handleGenerate({ download }) {
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
        await generateAppointmentLetterDocx(
          employee,
          appointment,
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
          employeeId: savedEmployee.id,
          employeeName:
            savedEmployee.employeeName,
          documentType: 'appointment',

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
          'Appointment Letter generated and downloaded.',
          'success'
        )

        return
      }
    } catch (err) {
      notify(
        describeError(
          err,
          'Could not generate the Appointment Letter.'
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
            Appointment Letter
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Enter employee, appointment and salary details to prepare a
            professional appointment letter.
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
            description="Basic employee information used in the document."
          >
            <EmployeeForm
              value={employee}
              onChange={setEmployee}
              errors={errors}
            />
          </Section>

          <Section
            step="02"
            title="Appointment Details"
            description="Set the appointment date and employment terms."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {APPOINTMENT_LETTER_FIELDS.map((f) => (
                <Field
                  key={f.key}
                  label={f.label}
                  required={f.required}
                  error={errors[f.key]}
                >
                  <input
                    type={f.type}
                    className={inputClass(
                      errors[f.key]
                    )}
                    value={
                      appointment[f.key] ??
                      f.defaultValue ??
                      ''
                    }
                    onChange={(e) =>
                      setAppointment({
                        ...appointment,
                        [f.key]: e.target.value,
                      })
                    }
                  />
                </Field>
              ))}
            </div>
          </Section>

          <Section
            step="03"
            title="Salary Details"
            description="Enter the compensation structure for the employee."
          >
            <SalaryForm
              value={salary}
              onChange={setSalary}
              errors={errors}
              foldNote
            />
          </Section>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <ActionButton
              icon={Eye}
              label="Preview Appointment Letter"
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
              emptyLabel="Fill in the form and click Preview Appointment Letter."
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