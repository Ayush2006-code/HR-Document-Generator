// Salary Slip generation. FIX #10: the Salary Slip is now a REPLACEABLE
// TEMPLATE, exactly like the Offer/Appointment letters — see
// public/templates/salary-slip-template.docx (produced by
// scripts/build_salary_slip_template.cjs) and the Templates page, which
// lists it alongside the other two and lets HR upload their own company
// payslip design as long as it keeps the same {{TAGS}}.
//
// Safety net: if the template can't be loaded or filled for any reason (a
// bad upload, a missing file, a future tag mismatch), generation falls back
// automatically to `buildSalarySlipProgrammatically`, the original
// from-scratch `docx`-library design this app shipped with — so the Salary
// Slip never breaks even while this replaceable-template layer is new.
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  Packer,
  ShadingType,
} from 'docx'
import { calculateSalary, formatIndianNumber, getDaysInMonth, getProrationFactor } from './salaryCalculator.js'
import { SALARY_CALCULATION_MODES } from '../config/salaryRules.js'
import { buildFileName } from '../utils/fileNaming.js'
import { fillDocxTemplate } from './templateProcessor.js'
import { AppError } from '../utils/errors.js'

const SALARY_SLIP_TEMPLATE_URL = '/templates/salary-slip-template.docx'
const COMPANY_NAME = 'V2RM Retail Private Limited'
const COMPANY_CIN = 'U10719DL2019PTC355148'

const ACCENT = '1F4E79'
const LIGHT_FILL = 'EAF1F8'
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' }
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }

/** Applies the configured Salary Calculation Mode (FIX #9) to a computed
 * salary result, scaling every earnings/deduction line by the proration
 * factor and recomputing the totals from the scaled parts (so the numbers
 * shown always add up, even after proration). Returns the scaled figures
 * plus a human-readable summary of how the number was reached. */
function applyCalculationMode(calc, slipDetails) {
  const mode = slipDetails.salaryCalculationMode === 'prorated' ? 'prorated' : 'full'
  const daysInMonth = getDaysInMonth(slipDetails.salaryMonth)
  const { factor, payableDays } = getProrationFactor({ mode, payableDays: slipDetails.payableDays, daysInMonth })

  const scale = (monthly) => Math.round(monthly * factor * 100) / 100
  const earnings = {
    basic: scale(calc.basic.monthly),
    hra: scale(calc.hra.monthly),
    conveyance: scale(calc.conveyance.monthly),
    specialAllowance: scale(calc.specialAllowance.monthly),
    statBonus: scale(calc.statBonus.monthly),
    otherEarnings: scale(calc.otherEarnings.monthly),
  }
  const deductions = {
    employeePF: scale(calc.employeePF.monthly),
    employeeESIC: scale(calc.employeeESIC.monthly),
    employeeLWF: scale(calc.employeeLWF.monthly),
    tds: scale(calc.tds.monthly),
    otherDeductions: scale(calc.otherDeductions.monthly),
  }
  const additionalEarnings = calc.additionalEarnings.map((c) => ({ ...c, monthly: scale(c.monthly) }))
  const additionalDeductions = calc.additionalDeductions.map((c) => ({ ...c, monthly: scale(c.monthly) }))

  const grossEarnings =
    Math.round(
      (earnings.basic + earnings.hra + earnings.conveyance + earnings.specialAllowance + earnings.statBonus + earnings.otherEarnings) * 100
    ) / 100
  const totalDeductions =
    Math.round(
      (deductions.employeePF + deductions.employeeESIC + deductions.employeeLWF + deductions.tds + deductions.otherDeductions) * 100
    ) / 100
  const netSalary = Math.round((grossEarnings - totalDeductions) * 100) / 100

  const modeConfig = SALARY_CALCULATION_MODES.find((m) => m.value === mode) || SALARY_CALCULATION_MODES[0]
  const calculationSummary =
    mode === 'prorated'
      ? `Prorated: Payable Days ${payableDays} ÷ Days in Month ${daysInMonth} = factor ${factor.toFixed(4)}, applied to every earning and deduction line.`
      : `Full Monthly Salary: Payable/LOP Days recorded for reference but do not change the amount paid.`

  return {
    mode,
    modeLabel: modeConfig.label,
    daysInMonth,
    payableDays,
    factor,
    calculationSummary,
    earnings,
    deductions,
    additionalEarnings,
    additionalDeductions,
    grossEarnings,
    totalDeductions,
    netSalary,
    // Employer contributions are informational only (not deducted from the
    // employee), so they are shown at their full monthly value regardless
    // of proration mode.
    employerPF: calc.employerPF.monthly,
    employerESIC: calc.employerESIC.monthly,
  }
}

function describeAdditionalComponents(list) {
  if (!list || list.length === 0) return 'None'
  return list.map((c) => `${c.label}: Rs. ${formatIndianNumber(c.monthly, { decimals: 2 })}`).join('; ')
}

function buildTagMap(employee, slipDetails, scaled) {
  const monthLabel = slipDetails.salaryMonth
    ? new Date(`${slipDetails.salaryMonth}-01`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : ''
  const amt = (v) => formatIndianNumber(v, { decimals: 2 })
  return {
    COMPANY_NAME,
    COMPANY_CIN,
    SALARY_MONTH_LABEL: monthLabel || '—',
    EMPLOYEE_NAME: `${employee.salutation || ''} ${employee.employeeName || ''}`.trim() || '—',
    EMPLOYEE_ID: employee.employeeId || '—',
    DESIGNATION: employee.designation || '—',
    DEPARTMENT: employee.department || '—',
    LOCATION: employee.location || '—',
    DATE_OF_JOINING: slipDetails.dateOfJoining || '—',
    PAYABLE_DAYS_LABEL: `${scaled.payableDays} of ${scaled.daysInMonth}`,
    LOP_DAYS: String(slipDetails.lopDays ?? 0),
    CALCULATION_MODE_LABEL: scaled.modeLabel,
    BASIC: amt(scaled.earnings.basic),
    HRA: amt(scaled.earnings.hra),
    CONVEYANCE: amt(scaled.earnings.conveyance),
    SPECIAL_ALLOWANCE: amt(scaled.earnings.specialAllowance),
    BONUS: amt(scaled.earnings.statBonus),
    OTHER_EARNINGS: amt(scaled.earnings.otherEarnings),
    ADDITIONAL_EARNINGS_TEXT: describeAdditionalComponents(scaled.additionalEarnings),
    GROSS_EARNINGS: amt(scaled.grossEarnings),
    PF: amt(scaled.deductions.employeePF),
    ESIC: amt(scaled.deductions.employeeESIC),
    LWF_DEDUCTION: amt(scaled.deductions.employeeLWF),
    TDS: amt(scaled.deductions.tds),
    OTHER_DEDUCTIONS: amt(scaled.deductions.otherDeductions),
    ADDITIONAL_DEDUCTIONS_TEXT: describeAdditionalComponents(scaled.additionalDeductions),
    TOTAL_DEDUCTIONS: amt(scaled.totalDeductions),
    NET_SALARY: amt(scaled.netSalary),
    EMPLOYER_PF: amt(scaled.employerPF),
    EMPLOYER_ESIC: amt(scaled.employerESIC),
  }
}

// --- Programmatic fallback (the app's original design) -------------------

function cell(text, { bold = false, fill = null, align = AlignmentType.LEFT, width = 25 } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    borders: CELL_BORDERS,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text: String(text), bold, size: 20 })] })],
  })
}

function amountRow(label, monthly) {
  return new TableRow({
    children: [cell(label, { width: 60 }), cell(formatIndianNumber(monthly, { decimals: 2 }), { width: 40, align: AlignmentType.RIGHT })],
  })
}

function totalRow(label, monthly) {
  return new TableRow({
    children: [
      cell(label, { bold: true, fill: LIGHT_FILL, width: 60 }),
      cell(formatIndianNumber(monthly, { decimals: 2 }), { bold: true, fill: LIGHT_FILL, width: 40, align: AlignmentType.RIGHT }),
    ],
  })
}

function infoRow(label, value) {
  return new TableRow({ children: [cell(label, { bold: true, fill: LIGHT_FILL, width: 30 }), cell(value ?? '—', { width: 70 })] })
}

async function buildSalarySlipProgrammatically(employee, slipDetails, scaled) {
  const monthLabel = slipDetails.salaryMonth
    ? new Date(`${slipDetails.salaryMonth}-01`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : ''

  const additionalEarningRows = scaled.additionalEarnings.map((c) => amountRow(c.label, c.monthly))
  const additionalDeductionRows = scaled.additionalDeductions.map((c) => amountRow(c.label, c.monthly))

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: COMPANY_NAME, bold: true, size: 32, color: ACCENT })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: `CIN: ${COMPANY_CIN}`, size: 18, color: '555555' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: `Payslip for ${monthLabel}`, bold: true, size: 26 })],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              infoRow('Employee Name', `${employee.salutation || ''} ${employee.employeeName}`.trim()),
              infoRow('Employee ID', employee.employeeId || '—'),
              infoRow('Designation', employee.designation),
              infoRow('Department', employee.department || '—'),
              infoRow('Location', employee.location),
              infoRow('Date of Joining', slipDetails.dateOfJoining || '—'),
              infoRow('Payable Days', `${scaled.payableDays} of ${scaled.daysInMonth}`),
              infoRow('LOP Days', String(slipDetails.lopDays ?? 0)),
              infoRow('Salary Calculation Mode', scaled.modeLabel),
            ],
          }),

          new Paragraph({ spacing: { before: 300, after: 120 }, children: [new TextRun({ text: 'Earnings', bold: true, size: 22, color: ACCENT })] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell('Particulars', { bold: true, fill: ACCENT, width: 60 }),
                  cell('Amount', { bold: true, fill: ACCENT, width: 40, align: AlignmentType.RIGHT }),
                ],
              }),
              amountRow('Basic', scaled.earnings.basic),
              amountRow('HRA', scaled.earnings.hra),
              amountRow('Conveyance', scaled.earnings.conveyance),
              amountRow('Special Allowance', scaled.earnings.specialAllowance),
              amountRow('Bonus', scaled.earnings.statBonus),
              amountRow('Other Earnings', scaled.earnings.otherEarnings),
              ...additionalEarningRows,
              totalRow('Gross Earnings', scaled.grossEarnings),
            ],
          }),

          new Paragraph({ spacing: { before: 300, after: 120 }, children: [new TextRun({ text: 'Deductions', bold: true, size: 22, color: ACCENT })] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell('Particulars', { bold: true, fill: ACCENT, width: 60 }),
                  cell('Amount', { bold: true, fill: ACCENT, width: 40, align: AlignmentType.RIGHT }),
                ],
              }),
              amountRow('PF', scaled.deductions.employeePF),
              amountRow('ESIC', scaled.deductions.employeeESIC),
              amountRow('LWF', scaled.deductions.employeeLWF),
              amountRow('TDS', scaled.deductions.tds),
              amountRow('Other Deductions', scaled.deductions.otherDeductions),
              ...additionalDeductionRows,
              totalRow('Total Deductions', scaled.totalDeductions),
            ],
          }),

          new Paragraph({ spacing: { before: 300, after: 120 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell('Net Salary (Take Home)', { bold: true, fill: LIGHT_FILL, width: 60 }),
                  cell(formatIndianNumber(scaled.netSalary, { decimals: 2 }), { bold: true, fill: LIGHT_FILL, width: 40, align: AlignmentType.RIGHT }),
                ],
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 300, after: 80 },
            children: [new TextRun({ text: 'Employer Contributions (informational, not deducted from employee)', italics: true, size: 18, color: '555555' })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [amountRow('Employer PF', scaled.employerPF), amountRow('Employer ESIC', scaled.employerESIC)],
          }),

          new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({ text: scaled.calculationSummary, italics: true, size: 16, color: '888888' })],
          }),
          new Paragraph({
            spacing: { before: 400 },
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'This is a computer-generated payslip and does not require a signature.', italics: true, size: 16, color: '888888' })],
          }),
        ],
      },
    ],
  })

  return Packer.toBlob(doc)
}

/**
 * Generates the Salary Slip. Tries the replaceable template first (see
 * public/templates/salary-slip-template.docx); if that isn't available or
 * fails to fill, falls back to the built-in programmatic design so the
 * Salary Slip always works.
 */
export async function generateSalarySlipDocx(employee, slipDetails, salaryInput) {
  if (!employee?.employeeName) {
    throw new AppError('Employee name is required to generate a Salary Slip.')
  }
  const calc = calculateSalary(salaryInput)
  const scaled = applyCalculationMode(calc, slipDetails)
  const tags = buildTagMap(employee, slipDetails, scaled)

  let blob
  try {
    blob = await fillDocxTemplate(SALARY_SLIP_TEMPLATE_URL, tags)
  } catch (templateErr) {
    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn('Salary Slip template unavailable/invalid, using the built-in design instead:', templateErr)
    }
    blob = await buildSalarySlipProgrammatically(employee, slipDetails, scaled)
  }

  const filename = buildFileName(employee.employeeName, 'salary_slip', 'docx')
  return { blob, filename, calc, scaled }
}
