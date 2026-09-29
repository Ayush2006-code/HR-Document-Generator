import { useEffect, useRef, useState } from 'react'
import {
  UploadCloud,
  RotateCcw,
  FileStack,
  CheckCircle2,
  FileText,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import {
  setTemplateOverride,
  clearTemplateOverride,
  hasTemplateOverride,
} from '../services/templateStorage.js'
import {
  clearTemplateCache,
  findMissingTags,
} from '../services/templateProcessor.js'
import { useToast } from '../context/ToastContext.jsx'

const TEMPLATES = [
  {
    key: 'offer-letter-template.docx',
    name: 'Offer Letter',
    description:
      'Used for every generated Offer Letter, including its salary Annexure-I.',
    tags: [
      'SALUTATION',
      'EMPLOYEE_NAME',
      'ADDRESS',
      'DESIGNATION',
      'LOCATION',
      'GRADE',
      'OFFER_DATE',
      'JOINING_DATE',
      'OFFER_VALID_TILL',
      'BASIC_MONTHLY',
      'BASIC_ANNUAL',
      'HRA_MONTHLY',
      'HRA_ANNUAL',
      'CONVEYANCE_MONTHLY',
      'CONVEYANCE_ANNUAL',
      'STAT_BONUS_MONTHLY',
      'STAT_BONUS_ANNUAL',
      'GROSS_MONTHLY',
      'GROSS_ANNUAL',
      'EMPLOYER_PF_MONTHLY',
      'EMPLOYER_PF_ANNUAL',
      'EMPLOYER_ESIC_MONTHLY',
      'EMPLOYER_ESIC_ANNUAL',
      'LWF_MONTHLY',
      'LWF_ANNUAL',
      'CTC_MONTHLY',
      'CTC_ANNUAL',
      'EMPLOYEE_PF_MONTHLY',
      'EMPLOYEE_PF_ANNUAL',
      'EMPLOYEE_ESIC_MONTHLY',
      'EMPLOYEE_ESIC_ANNUAL',
      'EMPLOYEE_LWF_MONTHLY',
      'EMPLOYEE_LWF_ANNUAL',
      'TAKE_HOME_MONTHLY',
      'TAKE_HOME_ANNUAL',
      'CTC_FORMATTED',
      'CTC_IN_WORDS',
    ],
  },
  {
    key: 'appointment-letter-template.docx',
    name: 'Appointment Letter',
    description:
      'Used for every generated Appointment Letter, including its salary Annexure-I.',
    tags: [
      'SALUTATION',
      'EMPLOYEE_NAME',
      'ADDRESS',
      'DESIGNATION',
      'LOCATION',
      'GRADE',
      'APPOINTMENT_DATE',
      'OFFER_DATE',
      'JOINING_DATE',
      'PROBATION_PERIOD',
      'NOTICE_PERIOD',
      'BASIC_MONTHLY',
      'BASIC_ANNUAL',
      'HRA_MONTHLY',
      'HRA_ANNUAL',
      'CONVEYANCE_MONTHLY',
      'CONVEYANCE_ANNUAL',
      'STAT_BONUS_MONTHLY',
      'STAT_BONUS_ANNUAL',
      'GROSS_MONTHLY',
      'GROSS_ANNUAL',
      'EMPLOYER_PF_MONTHLY',
      'EMPLOYER_PF_ANNUAL',
      'EMPLOYER_ESIC_MONTHLY',
      'EMPLOYER_ESIC_ANNUAL',
      'LWF_MONTHLY',
      'LWF_ANNUAL',
      'CTC_MONTHLY',
      'CTC_ANNUAL',
      'EMPLOYEE_PF_MONTHLY',
      'EMPLOYEE_PF_ANNUAL',
      'EMPLOYEE_ESIC_MONTHLY',
      'EMPLOYEE_ESIC_ANNUAL',
      'EMPLOYEE_LWF_MONTHLY',
      'EMPLOYEE_LWF_ANNUAL',
      'TAKE_HOME_MONTHLY',
      'TAKE_HOME_ANNUAL',
      'CTC_FORMATTED',
      'CTC_IN_WORDS',
    ],
  },
  {
    key: 'salary-slip-template.docx',
    name: 'Salary Slip',
    description:
      'Used for every generated Salary Slip. Unlike the two letters above, this template has no legal wording — replace it freely with your own company payslip design as long as the tags below stay in the file.',
    tags: [
      'COMPANY_NAME',
      'COMPANY_CIN',
      'SALARY_MONTH_LABEL',
      'EMPLOYEE_NAME',
      'EMPLOYEE_ID',
      'DESIGNATION',
      'DEPARTMENT',
      'LOCATION',
      'DATE_OF_JOINING',
      'PAYABLE_DAYS_LABEL',
      'LOP_DAYS',
      'CALCULATION_MODE_LABEL',
      'BASIC',
      'HRA',
      'CONVEYANCE',
      'SPECIAL_ALLOWANCE',
      'BONUS',
      'OTHER_EARNINGS',
      'ADDITIONAL_EARNINGS_TEXT',
      'GROSS_EARNINGS',
      'PF',
      'ESIC',
      'LWF_DEDUCTION',
      'TDS',
      'OTHER_DEDUCTIONS',
      'ADDITIONAL_DEDUCTIONS_TEXT',
      'TOTAL_DEDUCTIONS',
      'NET_SALARY',
      'EMPLOYER_PF',
      'EMPLOYER_ESIC',
    ],
  },
]

export default function Templates() {
  const { notify } = useToast()
  const [overrides, setOverrides] = useState({})
  const fileInputs = useRef({})

  useEffect(() => {
    async function check() {
      const result = {}

      for (const t of TEMPLATES) {
        // eslint-disable-next-line no-await-in-loop
        result[t.key] = await hasTemplateOverride(t.key)
      }

      setOverrides(result)
    }

    check()
  }, [])

  async function handleUpload(key, file) {
    if (!file.name.endsWith('.docx')) {
      notify('Please upload a .docx file.', 'error')
      return
    }

    const template = TEMPLATES.find((t) => t.key === key)
    const buffer = await file.arrayBuffer()

    const missing = template
      ? findMissingTags(buffer, template.tags)
      : []

    if (missing.length > 0) {
      notify(
        `This file is missing ${missing.length} required tag${
          missing.length > 1 ? 's' : ''
        } (e.g. ${missing
          .slice(0, 3)
          .map((t) => `{{${t}}}`)
          .join(', ')}). Upload was NOT applied — the previous template is still active.`,
        'error'
      )
      return
    }

    await setTemplateOverride(key, buffer)
    clearTemplateCache()

    setOverrides((o) => ({
      ...o,
      [key]: true,
    }))

    notify(
      'Template replaced. New documents will use this file immediately.',
      'success'
    )
  }

  async function handleReset(key) {
    await clearTemplateOverride(key)
    clearTemplateCache()

    setOverrides((o) => ({
      ...o,
      [key]: false,
    }))

    notify('Reverted to the default template.', 'success')
  }

  return (
    <div className="min-h-full bg-slate-50/70 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-7 lg:px-10 lg:py-9">

        {/* Header */}
        <div className="mb-9 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <FileStack size={15} />
              Document Templates
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Templates
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Customize the documents generated by your HR workspace.
              Replace a template to change its wording, branding, or layout
              while keeping the required fields intact.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-900 lg:self-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Sparkles size={17} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Available
              </p>

              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {TEMPLATES.length} templates
              </p>
            </div>
          </div>
        </div>

        {/* Template list */}
        <div className="space-y-5">
          {TEMPLATES.map((t) => {
            const isCustom = Boolean(overrides[t.key])

            return (
              <section
                key={t.key}
                className="rounded-3xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900 sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                  {/* Template information */}
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <FileText size={21} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                          {t.name}
                        </h2>

                        {isCustom && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <CheckCircle2 size={12} />
                            Custom active
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {t.description}
                      </p>

                      <p className="mt-2 truncate font-mono text-[11px] text-slate-400">
                        /templates/{t.key}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <input
                      ref={(el) => {
                        fileInputs.current[t.key] = el
                      }}
                      type="file"
                      accept=".docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]

                        if (file) {
                          handleUpload(t.key, file)
                        }

                        e.target.value = ''
                      }}
                    />

                    <button
                      onClick={() => fileInputs.current[t.key]?.click()}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/15 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20"
                      type="button"
                    >
                      <UploadCloud size={15} />
                      Replace
                    </button>

                    {isCustom && (
                      <button
                        onClick={() => handleReset(t.key)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                        type="button"
                      >
                        <RotateCcw size={14} />
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <details className="group mt-6">
                  <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    <ChevronDown
                      size={15}
                      className="transition-transform duration-200 group-open:rotate-180"
                    />

                    Show required tags

                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {t.tags.length}
                    </span>
                  </summary>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {t.tags.map((tag) => (
                      <code
                        key={tag}
                        className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      >
                        {'{{' + tag + '}}'}
                      </code>
                    ))}
                  </div>
                </details>
              </section>
            )
          })}
        </div>

        {/* Help */}
        <section className="mt-8 rounded-3xl bg-blue-50/80 p-6 dark:bg-blue-500/5 sm:p-7">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Sparkles size={18} />
            </div>

            <div className="space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  How to edit a template
                </p>

                <p className="mt-1.5">
                  Open the current template in Microsoft Word and edit any
                  text you like. Keep every{' '}
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-400">
                    {'{{TAG}}'}
                  </code>{' '}
                  exactly as it appears. Tags are case-sensitive and should
                  remain inside one run.
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Salary Slip
                </p>

                <p className="mt-1.5">
                  The Salary Slip template has no legal wording, so you can
                  freely redesign its layout. If a replacement is missing,
                  corrupt, or fails during generation, the application falls
                  back to its original built-in payslip design.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}