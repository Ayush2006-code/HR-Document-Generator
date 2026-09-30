import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  Eye,
  FileDown,
  FileText,
  Loader2,
} from 'lucide-react'
import Field, { inputClass } from './Field.jsx'
import EmployeeForm from './EmployeeForm.jsx'
import SalaryForm from './SalaryForm.jsx'
import DocumentPreview from './DocumentPreview.jsx'
import { OFFER_LETTER_FIELDS } from '../config/documentFields.js'
import {
  emptySalaryInput,
  validateSalaryInput,
} from '../services/salaryCalculator.js'
import { generateOfferLetterDocx } from '../services/documentGenerator.js'
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
import {
  downloadBlob,
  buildFileName,
} from '../utils/fileNaming.js'
import { describeError } from '../utils/errors.js'
import { toInputDateValue } from '../utils/dateFormat.js'
import { useToast } from '../context/ToastContext.jsx'

const TODAY = toInputDateValue(new Date())

export default function OfferLetterGenerator() {
  const [searchParams] = useSearchParams()
  const { notify } = useToast()

  const [employee, setEmployee] = useState({
    salutation: 'Mr.',
    grade: 'As per Policy',
  })

  const [offer, setOffer] = useState({
    offerDate: TODAY,
    probationPeriod: '3 months',
    noticePeriod: '1 month',
  })

  const [salary, setSalary] = useState(emptySalaryInput())
  const [errors, setErrors] = useState({})
  const [blob, setBlob] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const employeeId = searchParams.get('employeeId')

    if (!employeeId) return

    const existing = getEmployee(employeeId)

    if (!existing) return

    setEmployee(existing)

    if (existing.salaryProfile) {
      setSalary({
        ...emptySalaryInput(),
        ...existing.salaryProfile,
        additionalEarnings:
          Array.isArray(
            existing.salaryProfile.additionalEarnings
          )
            ? existing.salaryProfile.additionalEarnings
            : [],
        additionalDeductions:
          Array.isArray(
            existing.salaryProfile.additionalDeductions
          )
            ? existing.salaryProfile.additionalDeductions
            : [],
      })
    } else {
      setSalary(emptySalaryInput())
    }
  }, [searchParams])

  function runValidation() {
    const errs = mergeErrors(
      validateEmployeeCore(employee),

      validateDatesPresent(offer, [
        {
          key: 'offerDate',
          label: 'Offer letter date',
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
      const result = await generateOfferLetterDocx(
        employee,
        offer,
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

        salaryProfile: {
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
        saveEmployee(employeeToSave)

      setEmployee(savedEmployee)

      if (download === 'docx') {
        const filename =
          result.filename ||
          buildFileName(
            savedEmployee.employeeName,
            'offer',
            'docx'
          )

        await recordDocument({
          employeeId: savedEmployee.id,
          employeeName:
            savedEmployee.employeeName,
          documentType: 'offer',

          files: [
            {
              kind: 'docx',
              blob: result.blob,
              filename,
            },
          ],
        })

        downloadBlob(
          result.blob,
          filename
        )

        notify(
          'Offer Letter generated and downloaded.',
          'success'
        )

        return
      }
    } catch (err) {
      notify(
        describeError(
          err,
          'Could not generate the Offer Letter.'
        ),
        'error'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-full space-y-7 pb-16">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
            <FileText size={14} />
            Document Generator
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Offer Letter
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Enter employee, offer and salary details to prepare a
            professional offer letter.
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
            title="Offer Details"
            description="Set the important dates and employment terms."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {OFFER_LETTER_FIELDS.map((f) => (
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
                      offer[f.key] ??
                      f.defaultValue ??
                      ''
                    }
                    onChange={(e) =>
                      setOffer({
                        ...offer,
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
          <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-6 dark:border-slate-800 sm:flex-row">
            <ActionButton
              icon={Eye}
              label="Preview Offer Letter"
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
        <div className="min-w-0 self-start xl:sticky xl:top-6">
          <div className="h-[calc(100vh-170px)] min-h-[620px] max-h-[900px]">
            <DocumentPreview
              blob={blob}
              emptyLabel="Fill in the form and click Preview Offer Letter."
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
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition-shadow duration-200 dark:bg-slate-900 dark:ring-slate-800/80 sm:p-6">
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

export function ActionButton({
  icon: Icon,
  label,
  onClick,
  busy,
  variant = 'solid',
}) {
  const base =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60'

  const style =
    variant === 'solid'
      ? `${base} bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 active:translate-y-px dark:bg-blue-500 dark:hover:bg-blue-600`
      : `${base} bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:text-white`

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={style}
      type="button"
    >
      {busy ? (
        <Loader2
          size={16}
          className="animate-spin"
        />
      ) : (
        <Icon size={16} />
      )}

      {label}
    </button>
  )
}