// Central field definitions per document type. Components read this to
// render forms consistently rather than hardcoding field lists in JSX.
// Fields marked `docTagged: false` are captured in the app/data layer
// (Employee Master, filenames, history) but intentionally do NOT appear in
// the generated legal document body, because the authoritative Offer/
// Appointment templates have no slot for them and the brief requires us not
// to redesign those templates by adding new lines. See README for details.

export const SALUTATIONS = ['Mr.', 'Ms.', 'Mrs.', 'Dr.']

export const EMPLOYEE_CORE_FIELDS = [
  { key: 'salutation', label: 'Salutation', type: 'select', options: SALUTATIONS, docTagged: true },
  { key: 'employeeName', label: 'Employee Name', type: 'text', required: true, docTagged: true },
  { key: 'employeeId', label: 'Employee ID', type: 'text', docTagged: false },
  { key: 'address', label: 'Address', type: 'textarea', docTagged: true },
  { key: 'designation', label: 'Designation', type: 'text', required: true, docTagged: true },
  { key: 'department', label: 'Department', type: 'text', docTagged: false },
  { key: 'grade', label: 'Grade', type: 'text', docTagged: true, defaultValue: 'As per Policy' },
  { key: 'location', label: 'Branch & Location', type: 'text', required: true, docTagged: true },
  { key: 'email', label: 'Email', type: 'email', docTagged: false },
  { key: 'phone', label: 'Phone', type: 'tel', docTagged: false },
]

export const OFFER_LETTER_FIELDS = [
  { key: 'offerDate', label: 'Offer Letter Date', type: 'date', required: true },
  { key: 'joiningDate', label: 'Date of Joining', type: 'date', required: true },
  { key: 'offerValidTill', label: 'Offer Valid Till', type: 'date', required: true },
  { key: 'probationPeriod', label: 'Probation Period', type: 'text', defaultValue: '3 months' },
  { key: 'noticePeriod', label: 'Notice Period', type: 'text', defaultValue: '1 month' },
  { key: 'reportingManager', label: 'Reporting Manager', type: 'text', docTagged: false },
]

export const APPOINTMENT_LETTER_FIELDS = [
  { key: 'appointmentDate', label: 'Appointment Letter Date', type: 'date', required: true },
  { key: 'offerDate', label: 'Offer Letter Date', type: 'date', required: true },
  { key: 'joiningDate', label: 'Date of Joining', type: 'date', required: true },
  { key: 'probationPeriod', label: 'Probation Period', type: 'text', defaultValue: '3 months' },
  { key: 'noticePeriod', label: 'Notice Period', type: 'text', defaultValue: '1 month' },
  { key: 'reportingManager', label: 'Reporting Manager', type: 'text', docTagged: false },
]

export const SALARY_SLIP_FIELDS = [
  { key: 'salaryMonth', label: 'Salary Month', type: 'month', required: true },
  { key: 'payableDays', label: 'Payable Days', type: 'number', defaultValue: 30 },
  { key: 'lopDays', label: 'LOP Days', type: 'number', defaultValue: 0 },
]

// FIX #9 — the Salary Calculation Mode is its own field so it appears
// wherever the Salary Slip's pay-period details are shown; the actual
// proration math lives in services/salaryCalculator.js /
// services/salarySlipBuilder.js, driven by config/salaryRules.js.
export { SALARY_CALCULATION_MODES } from './salaryRules.js'

export const EARNINGS_FIELDS = [
  { key: 'basic', label: 'Basic Salary', required: true },
  { key: 'hra', label: 'HRA' },
  { key: 'conveyance', label: 'Conveyance Allowance' },
  { key: 'statBonus', label: 'Stat Bonus' },
  { key: 'specialAllowance', label: 'Special Allowance' },
  { key: 'otherEarnings', label: 'Other Earnings' },
]

export const EMPLOYER_CONTRIBUTION_FIELDS = [
  { key: 'employerPF', label: 'Employer PF' },
  { key: 'employerESIC', label: 'Employer ESIC' },
  { key: 'lwf', label: 'LWF (Employer)' },
]

export const DEDUCTION_FIELDS = [
  { key: 'employeePF', label: 'Employee PF' },
  { key: 'employeeESIC', label: 'Employee ESIC' },
  { key: 'employeeLWF', label: 'Employee LWF' },
  { key: 'tds', label: 'TDS' },
  { key: 'otherDeductions', label: 'Other Deductions' },
]

export const DOCUMENT_TYPES = {
  OFFER: 'offer',
  APPOINTMENT: 'appointment',
  SALARY_SLIP: 'salary_slip',
}

export const DOCUMENT_TYPE_LABELS = {
  [DOCUMENT_TYPES.OFFER]: 'Offer Letter',
  [DOCUMENT_TYPES.APPOINTMENT]: 'Appointment Letter',
  [DOCUMENT_TYPES.SALARY_SLIP]: 'Salary Slip',
}
