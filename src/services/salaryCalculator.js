// Configurable Indian salary calculation engine.
//
// IMPORTANT DESIGN NOTE (read before changing row mappings):
// The Offer Letter and Appointment Letter templates are AUTHORITATIVE —
// their Annexure-I table has a fixed, non-negotiable set of rows (Basic,
// HRA, Conveyance, Stat Bonus, Gross Earnings, Employer PF/ESIC/LWF, CTC,
// Employee PF/ESIC/LWF, Take Home). Per the "do not redesign the template"
// requirement, we do NOT add new rows to that table for Special Allowance,
// Other Earnings, TDS, or Other Deductions. Those four inputs still fully
// participate in the math (they flow into Gross Earnings / Total
// Deductions / CTC / Take Home exactly as the formulas below show) — they
// just don't get a dedicated line in the two legal letter templates.
// The independently-designed Salary Slip DOES show them as their own rows,
// since it isn't constrained by an existing template.

export function emptySalaryInput() {
  return {
    basic: 0,
    hra: 0,
    conveyance: 0,
    statBonus: 0,
    specialAllowance: 0,
    otherEarnings: 0,
    employerPF: 0,
    employerESIC: 0,
    lwf: 0,
    employeePF: 0,
    employeeESIC: 0,
    employeeLWF: 0,
    tds: 0,
    otherDeductions: 0,
    // FIX #5 — flexible/configurable salary components. Each is
    // { id, label, amount }. These have no dedicated row in the
    // Offer/Appointment Annexure-I (so the source template stays
    // unmodified — see the header note above), but every rupee still flows
    // into Gross Earnings / CTC / Total Deductions / Take Home via
    // otherEarnings/otherDeductions below, and the independent Salary Slip
    // shows each one by its own name/amount.
    additionalEarnings: [],
    additionalDeductions: [],
  }
}

function sumComponents(list) {
  if (!Array.isArray(list)) return 0
  return list.reduce((total, item) => total + n(item?.amount), 0)
}

function n(v) {
  const num = typeof v === 'number' ? v : parseFloat(v)
  return Number.isFinite(num) ? num : 0
}

function annualize(monthly) {
  return Math.round(monthly * 12 * 100) / 100
}

function round2(v) {
  return Math.round(v * 100) / 100
}

/**
 * Runs the full Indian CTC/take-home calculation for a monthly salary
 * structure. Every component is returned as { monthly, annual }. Formulas:
 *   Gross Earnings   = Basic + HRA + Conveyance + Stat Bonus + Special Allowance + Other Earnings
 *   Employer Contrib = Employer PF + Employer ESIC + LWF
 *   CTC              = Gross Earnings + Employer Contributions
 *   Total Deductions = Employee PF + Employee ESIC + Employee LWF + TDS + Other Deductions
 *   Take Home        = Gross Earnings - Total Deductions
 */
export function calculateSalary(input) {
  const basic = n(input.basic)
  const hra = n(input.hra)
  const conveyance = n(input.conveyance)
  const statBonus = n(input.statBonus)
  const specialAllowance = n(input.specialAllowance)

  const employerPF = n(input.employerPF)
  const employerESIC = n(input.employerESIC)
  const lwf = n(input.lwf)

  const employeePF = n(input.employeePF)
  const employeeESIC = n(input.employeeESIC)
  const employeeLWF = n(input.employeeLWF)
  const tds = n(input.tds)
  const otherDeductionsManual = n(input.otherDeductions)

  const additionalEarningsTotal = sumComponents(input.additionalEarnings)
  const additionalDeductionsTotal = sumComponents(input.additionalDeductions)

  // "Other Earnings" / "Other Deductions" are the single Annexure-safe
  // bucket that everything without a dedicated row folds into — the manual
  // field PLUS the sum of any named "Additional Components" the user added.
  // Nothing entered anywhere is ever silently dropped from the totals.
  const otherEarnings = round2(n(input.otherEarnings) + additionalEarningsTotal)
  const otherDeductions = round2(otherDeductionsManual + additionalDeductionsTotal)

  const grossMonthly = round2(basic + hra + conveyance + statBonus + specialAllowance + otherEarnings)
  const employerContribMonthly = round2(employerPF + employerESIC + lwf)
  const ctcMonthly = round2(grossMonthly + employerContribMonthly)
  const totalDeductionsMonthly = round2(employeePF + employeeESIC + employeeLWF + tds + otherDeductions)
  const takeHomeMonthly = round2(grossMonthly - totalDeductionsMonthly)

  const component = (monthly) => ({ monthly: round2(monthly), annual: annualize(monthly) })

  return {
    basic: component(basic),
    hra: component(hra),
    conveyance: component(conveyance),
    statBonus: component(statBonus),
    specialAllowance: component(specialAllowance),
    otherEarnings: component(otherEarnings),
    grossEarnings: component(grossMonthly),
    employerPF: component(employerPF),
    employerESIC: component(employerESIC),
    lwf: component(lwf),
    employerContributions: component(employerContribMonthly),
    ctc: component(ctcMonthly),
    employeePF: component(employeePF),
    employeeESIC: component(employeeESIC),
    employeeLWF: component(employeeLWF),
    tds: component(tds),
    otherDeductions: component(otherDeductions),
    totalDeductions: component(totalDeductionsMonthly),
    takeHome: component(takeHomeMonthly),
    // Named breakdown for surfaces (like the independent Salary Slip) that
    // aren't constrained by a fixed template and can show each component.
    additionalEarnings: (input.additionalEarnings || []).map((item) => ({
      id: item.id,
      label: item.label || 'Additional Earning',
      ...component(n(item.amount)),
    })),
    additionalDeductions: (input.additionalDeductions || []).map((item) => ({
      id: item.id,
      label: item.label || 'Additional Deduction',
      ...component(n(item.amount)),
    })),
  }
}

export function validateSalaryInput(input) {
  const errors = {}
  const numericFields = Object.keys(emptySalaryInput()).filter(
    (f) => f !== 'additionalEarnings' && f !== 'additionalDeductions'
  )
  for (const field of numericFields) {
    const value = input[field]
    if (value === '' || value === null || value === undefined) continue
    const num = n(value)
    if (Number.isNaN(parseFloat(value))) errors[field] = 'Enter a valid number.'
    else if (num < 0) errors[field] = 'Value cannot be negative.'
  }
  if (n(input.basic) <= 0) errors.basic = 'Basic salary is required and must be greater than zero.'

  const componentErrors = (list) =>
    (Array.isArray(list) ? list : []).some((item) => {
      const amount = item?.amount
      if (amount === '' || amount === null || amount === undefined) return false
      return Number.isNaN(parseFloat(amount)) || n(amount) < 0
    })
  if (componentErrors(input.additionalEarnings)) errors.additionalEarnings = 'Every additional earning needs a valid, non-negative amount.'
  if (componentErrors(input.additionalDeductions)) errors.additionalDeductions = 'Every additional deduction needs a valid, non-negative amount.'

  return errors
}

/** Formats a number as an Indian-grouped currency string, e.g. 439200 -> "4,39,200". */
export function formatIndianNumber(value, { decimals = 0 } = {}) {
  const num = n(value)
  const fixed = num.toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')
  const isNegative = intPart.startsWith('-')
  const digits = isNegative ? intPart.slice(1) : intPart
  let result
  if (digits.length <= 3) {
    result = digits
  } else {
    const last3 = digits.slice(-3)
    const rest = digits.slice(0, -3)
    const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
    result = `${grouped},${last3}`
  }
  return `${isNegative ? '-' : ''}${result}${decPart ? `.${decPart}` : ''}`
}

export function formatCurrencyValue(value) {
  // Templates store amounts as "24356.00" style (two decimals, no commas, no symbol).
  return n(value).toFixed(2)
}

/**
 * Number of calendar days in a "YYYY-MM" month string (from an
 * <input type="month">). Falls back to 30 for an empty/invalid value so the
 * Salary Slip always has a sane denominator to show, even before a month is
 * picked.
 */
export function getDaysInMonth(monthValue) {
  if (!monthValue) return 30
  const [year, month] = monthValue.split('-').map(Number)
  if (!year || !month) return 30
  return new Date(year, month, 0).getDate()
}

/**
 * FIX #9 — Payable Days / LOP Days proration.
 *
 * Salary Calculation Mode is configurable, not hard-coded:
 *   - 'full'      (default — matches the app's original behavior): the
 *     Salary Slip shows the full monthly amounts exactly as entered,
 *     regardless of Payable Days/LOP Days. Use this when payroll is run on
 *     a fixed monthly-salary basis.
 *   - 'prorated'  : every earnings and deduction line is scaled by
 *     (Payable Days ÷ Days in Month) before being shown/totaled — the
 *     standard "loss of pay" proration used when an employee has LOP days
 *     in the period. Change `round2` calls here if your payroll rounds
 *     differently (e.g. to the nearest rupee).
 *
 * Returns { factor, daysInMonth, payableDays } plus nothing else — callers
 * multiply their own line items by `factor` so the exact set of components
 * being prorated stays visible and easy to audit.
 */
export function getProrationFactor({ mode, payableDays, daysInMonth }) {
  const days = n(daysInMonth) || 30
  const payable = payableDays === '' || payableDays === null || payableDays === undefined ? days : n(payableDays)
  if (mode !== 'prorated') {
    return { factor: 1, daysInMonth: days, payableDays: days }
  }
  const clampedPayable = Math.max(0, Math.min(payable, days))
  const factor = days > 0 ? round2((clampedPayable / days) * 10000) / 10000 : 1
  return { factor, daysInMonth: days, payableDays: clampedPayable }
}
