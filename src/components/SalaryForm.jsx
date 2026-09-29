import { Plus, X, Calculator, WalletCards } from 'lucide-react'
import Field, { inputClass } from './Field.jsx'
import {
  EARNINGS_FIELDS,
  EMPLOYER_CONTRIBUTION_FIELDS,
  DEDUCTION_FIELDS,
} from '../config/documentFields.js'
import {
  calculateSalary,
  formatIndianNumber,
} from '../services/salaryCalculator.js'
import { numberToIndianWords } from '../services/numberToWords.js'

function newComponentId() {
  return `comp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function AdditionalComponents({
  label,
  list,
  onChange,
  error,
}) {
  const items = list || []

  function update(id, patch) {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      )
    )
  }

  function add() {
    onChange([
      ...items,
      {
        id: newComponentId(),
        label: '',
        amount: '',
      },
    ])
  }

  function remove(id) {
    onChange(items.filter((item) => item.id !== id))
  }

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </h4>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Add custom salary components when required.
          </p>
        </div>

        <button
          type="button"
          onClick={add}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
        >
          <Plus size={13} />
          Add component
        </button>
      </div>

      {items.length === 0 && (
        <div className="rounded-xl bg-white/70 px-4 py-3 text-xs text-slate-400 dark:bg-slate-900/40 dark:text-slate-500">
          No additional components added.
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 rounded-xl bg-white/80 p-2.5 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900/60 dark:ring-slate-800 sm:flex-row sm:items-center"
          >
            <input
              className={`${inputClass(false)} flex-1`}
              placeholder="Component name (e.g. Festival Allowance)"
              value={item.label}
              onChange={(e) =>
                update(item.id, {
                  label: e.target.value,
                })
              }
            />

            <div className="relative sm:w-36 sm:shrink-0">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                ₹
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                className={`${inputClass(false)} pl-7`}
                placeholder="0.00"
                value={item.amount}
                onChange={(e) =>
                  update(item.id, {
                    amount: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="button"
              onClick={() => remove(item.id)}
              className="flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 sm:self-auto"
              title="Remove"
              aria-label={`Remove ${item.label || 'component'}`}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-xs font-medium text-rose-500">
          {error}
        </p>
      )}
    </div>
  )
}

function NumberInput({
  field,
  value,
  onChange,
  error,
}) {
  const monthly = parseFloat(value[field.key]) || 0

  return (
    <Field
      label={field.label}
      required={field.required}
      error={error}
    >
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
          ₹
        </span>

        <input
          type="number"
          min="0"
          step="0.01"
          className={`${inputClass(error)} pl-7`}
          value={value[field.key] ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              [field.key]: e.target.value,
            })
          }
          placeholder="0.00"
        />
      </div>

      <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
        Annual: ₹
        {formatIndianNumber(monthly * 12, {
          decimals: 2,
        })}
      </p>
    </Field>
  )
}

/**
 * Shared salary-details section with a live CTC/take-home calculation.
 *
 * `foldNote` shows the clarifying note about Special
 * Allowance / Other Earnings / TDS / Other Deductions not having
 * dedicated rows in the Offer/Appointment Annexure-I table.
 */
export default function SalaryForm({
  value,
  onChange,
  errors = {},
  foldNote = false,
}) {
  const calc = calculateSalary(value)

  return (
    <div className="space-y-7">
      <SalarySection
        title="Earnings"
        description="Monthly earning components used to calculate gross salary."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {EARNINGS_FIELDS.map((field) => (
            <NumberInput
              key={field.key}
              field={field}
              value={value}
              onChange={onChange}
              error={errors[field.key]}
            />
          ))}
        </div>
      </SalarySection>

      <SalarySection
        title="Employer Contributions"
        description="Employer-side contributions included in the overall CTC."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {EMPLOYER_CONTRIBUTION_FIELDS.map((field) => (
            <NumberInput
              key={field.key}
              field={field}
              value={value}
              onChange={onChange}
              error={errors[field.key]}
            />
          ))}
        </div>
      </SalarySection>

      <SalarySection
        title="Deductions"
        description="Employee deductions used to calculate take-home salary."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {DEDUCTION_FIELDS.map((field) => (
            <NumberInput
              key={field.key}
              field={field}
              value={value}
              onChange={onChange}
              error={errors[field.key]}
            />
          ))}
        </div>
      </SalarySection>

      <div className="rounded-2xl bg-slate-50/90 p-4 ring-1 ring-slate-200/70 dark:bg-slate-950/40 dark:ring-slate-800/80 sm:p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200/70 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Plus size={17} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Additional Components
            </h3>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400 dark:text-slate-500">
              Add named earnings or deductions that are not covered by
              the standard salary fields. These amounts are included in
              all applicable totals.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <AdditionalComponents
            label="Additional Earnings"
            list={value.additionalEarnings}
            onChange={(list) =>
              onChange({
                ...value,
                additionalEarnings: list,
              })
            }
            error={errors.additionalEarnings}
          />

          <div className="h-px bg-slate-200/70 dark:bg-slate-800" />

          <AdditionalComponents
            label="Additional Deductions"
            list={value.additionalDeductions}
            onChange={(list) =>
              onChange({
                ...value,
                additionalDeductions: list,
              })
            }
            error={errors.additionalDeductions}
          />
        </div>
      </div>

      {foldNote && (
        <div className="rounded-xl bg-amber-50/80 px-4 py-3.5 text-xs leading-5 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-500/5 dark:text-amber-300 dark:ring-amber-500/20">
          Special Allowance, Other Earnings, TDS and Other Deductions
          are included in the Gross Earnings / Take Home totals below,
          but the original letter template's Annexure-I table only has
          dedicated rows for Basic, HRA, Conveyance and Stat Bonus —
          so those four amounts are reflected in the totals without a
          row of their own, to keep the legal template unmodified.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-blue-50/80 ring-1 ring-blue-200/70 dark:bg-blue-500/5 dark:ring-blue-500/20">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <Calculator size={17} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Live Calculation
            </h3>
            <p className="mt-0.5 text-[11px] text-blue-600/70 dark:text-blue-400/70">
              Totals update automatically as you edit salary components.
            </p>
          </div>
        </div>

        <div className="space-y-0 px-4 pb-2 sm:px-5">
          <SummaryLine
            label="Gross Earnings"
            monthly={calc.grossEarnings.monthly}
            annual={calc.grossEarnings.annual}
          />

          <SummaryLine
            label="Employer Contributions"
            monthly={calc.employerContributions.monthly}
            annual={calc.employerContributions.annual}
          />

          <SummaryLine
            label="Cost to Company (CTC)"
            monthly={calc.ctc.monthly}
            annual={calc.ctc.annual}
            bold
          />

          <SummaryLine
            label="Total Deductions"
            monthly={calc.totalDeductions.monthly}
            annual={calc.totalDeductions.annual}
          />

          <SummaryLine
            label="Take Home Salary"
            monthly={calc.takeHome.monthly}
            annual={calc.takeHome.annual}
            bold
          />
        </div>

        <div className="mx-4 border-t border-blue-200/70 px-0 py-4 text-xs dark:border-blue-500/20 sm:mx-5">
          <div className="flex items-start gap-2">
            <WalletCards
              size={14}
              className="mt-0.5 shrink-0 text-blue-500"
            />

            <p className="leading-5 text-blue-700/80 dark:text-blue-300/80">
              CTC in words:{' '}
              <span className="font-medium italic">
                Rupee {numberToIndianWords(calc.ctc.annual)} only per annum
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SalarySection({
  title,
  description,
  children,
}) {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-400 dark:text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  )
}

function SummaryLine({
  label,
  monthly,
  annual,
  bold,
}) {
  return (
    <div
      className={[
        'flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        bold
          ? 'font-semibold text-slate-900 dark:text-white'
          : 'text-slate-500 dark:text-slate-400',
      ].join(' ')}
    >
      <span>{label}</span>

      <span className="text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300 sm:text-sm">
        ₹
        {formatIndianNumber(monthly, {
          decimals: 0,
        })}
        <span className="mx-1.5 text-slate-300 dark:text-slate-700">
          /
        </span>
        mo
        <span className="mx-2 text-slate-300 dark:text-slate-700">
          ·
        </span>
        ₹
        {formatIndianNumber(annual, {
          decimals: 0,
        })}
        <span className="mx-1.5 text-slate-300 dark:text-slate-700">
          /
        </span>
        yr
      </span>
    </div>
  )
} 