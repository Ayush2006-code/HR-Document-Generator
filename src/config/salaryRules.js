// Configurable salary computation rules — kept separate from the pure math
// in services/salaryCalculator.js so HR can adjust defaults/groupings
// without touching calculation logic.

/** Which computed components map to a dedicated row in the Offer/Appointment
 * Annexure-I table (the authoritative legal template's fixed row set), vs.
 * which are folded into Gross Earnings / Total Deductions without a row of
 * their own display line (see salaryCalculator.js header comment). */
export const ANNEXURE_ROW_COMPONENTS = [
  'basic',
  'hra',
  'conveyance',
  'statBonus',
  'grossEarnings',
  'employerPF',
  'employerESIC',
  'lwf',
  'ctc',
  'employeePF',
  'employeeESIC',
  'employeeLWF',
  'takeHome',
]

export const FOLDED_INTO_GROSS = ['specialAllowance', 'otherEarnings']
export const FOLDED_INTO_DEDUCTIONS = ['tds', 'otherDeductions']

/** Optional convenience presets a form can offer as a starting point; HR can
 * override every value — nothing here is applied automatically. */
export const STATUTORY_PRESETS = {
  employeePFRateOnBasic: 0.12, // 12% of Basic, subject to statutory wage ceiling
  employerPFRateOnBasic: 0.12,
  esicEmployeeRateOnGross: 0.0075, // applicable only below the ESIC wage threshold
  esicEmployerRateOnGross: 0.0325,
}

export function suggestPFFromBasic(basic) {
  const value = Number(basic) || 0
  return Math.round(value * STATUTORY_PRESETS.employeePFRateOnBasic)
}

/** FIX #9 — configurable Salary Slip payroll modes. 'full' is the default
 * and matches the app's original behavior (Payable/LOP Days are recorded
 * but don't change the amount paid). 'prorated' scales every earnings and
 * deduction line by (Payable Days ÷ Days in Month) — see
 * services/salaryCalculator.js `getProrationFactor`. */
export const SALARY_CALCULATION_MODES = [
  { value: 'full', label: 'Full Monthly Salary', hint: 'Pay the full monthly amount regardless of Payable/LOP Days (default).' },
  { value: 'prorated', label: 'Prorated Based on Payable Days', hint: 'Scale every earning and deduction by Payable Days ÷ Days in Month.' },
]
