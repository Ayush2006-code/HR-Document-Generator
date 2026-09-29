import { fillDocxTemplate } from './templateProcessor.js'
import { calculateSalary, formatIndianNumber, formatCurrencyValue } from './salaryCalculator.js'
import { numberToIndianWords } from './numberToWords.js'
import { formatSlashDate, formatDashDate, formatOrdinalDate } from '../utils/dateFormat.js'
import { buildFileName } from '../utils/fileNaming.js'

const OFFER_TEMPLATE_URL = '/templates/offer-letter-template.docx'
const APPOINTMENT_TEMPLATE_URL = '/templates/appointment-letter-template.docx'

function ctcTags(calc) {
  return {
    BASIC_MONTHLY: formatCurrencyValue(calc.basic.monthly),
    BASIC_ANNUAL: formatCurrencyValue(calc.basic.annual),
    HRA_MONTHLY: formatCurrencyValue(calc.hra.monthly),
    HRA_ANNUAL: formatCurrencyValue(calc.hra.annual),
    CONVEYANCE_MONTHLY: formatCurrencyValue(calc.conveyance.monthly),
    CONVEYANCE_ANNUAL: formatCurrencyValue(calc.conveyance.annual),
    STAT_BONUS_MONTHLY: formatCurrencyValue(calc.statBonus.monthly),
    STAT_BONUS_ANNUAL: formatCurrencyValue(calc.statBonus.annual),
    GROSS_MONTHLY: formatCurrencyValue(calc.grossEarnings.monthly),
    GROSS_ANNUAL: formatCurrencyValue(calc.grossEarnings.annual),
    EMPLOYER_PF_MONTHLY: formatCurrencyValue(calc.employerPF.monthly),
    EMPLOYER_PF_ANNUAL: formatCurrencyValue(calc.employerPF.annual),
    EMPLOYER_ESIC_MONTHLY: formatCurrencyValue(calc.employerESIC.monthly),
    EMPLOYER_ESIC_ANNUAL: formatCurrencyValue(calc.employerESIC.annual),
    LWF_MONTHLY: formatCurrencyValue(calc.lwf.monthly),
    LWF_ANNUAL: formatCurrencyValue(calc.lwf.annual),
    CTC_MONTHLY: formatCurrencyValue(calc.ctc.monthly),
    CTC_ANNUAL: formatCurrencyValue(calc.ctc.annual),
    EMPLOYEE_PF_MONTHLY: formatCurrencyValue(calc.employeePF.monthly),
    EMPLOYEE_PF_ANNUAL: formatCurrencyValue(calc.employeePF.annual),
    EMPLOYEE_ESIC_MONTHLY: formatCurrencyValue(calc.employeeESIC.monthly),
    EMPLOYEE_ESIC_ANNUAL: formatCurrencyValue(calc.employeeESIC.annual),
    EMPLOYEE_LWF_MONTHLY: formatCurrencyValue(calc.employeeLWF.monthly),
    EMPLOYEE_LWF_ANNUAL: formatCurrencyValue(calc.employeeLWF.annual),
    TAKE_HOME_MONTHLY: formatCurrencyValue(calc.takeHome.monthly),
    TAKE_HOME_ANNUAL: formatCurrencyValue(calc.takeHome.annual),
    CTC_FORMATTED: formatIndianNumber(calc.ctc.annual),
    CTC_IN_WORDS: `Rupee ${numberToIndianWords(calc.ctc.annual)} only`,
  }
}

export function buildOfferLetterTagMap(employee, offer, salaryInput) {
  const calc = calculateSalary(salaryInput)
  return {
    tags: {
      SALUTATION: employee.salutation || 'Mr.',
      EMPLOYEE_NAME: employee.employeeName,
      ADDRESS: employee.address || employee.location,
      DESIGNATION: employee.designation,
      LOCATION: employee.location,
      GRADE: employee.grade || 'As per Policy',
      OFFER_DATE: formatSlashDate(offer.offerDate),
      JOINING_DATE: formatOrdinalDate(offer.joiningDate),
      OFFER_VALID_TILL: formatOrdinalDate(offer.offerValidTill),
      ...ctcTags(calc),
    },
    calc,
  }
}

export function buildAppointmentLetterTagMap(employee, appointment, salaryInput) {
  const calc = calculateSalary(salaryInput)
  return {
    tags: {
      SALUTATION: employee.salutation || 'Mr.',
      EMPLOYEE_NAME: employee.employeeName,
      ADDRESS: employee.address || employee.location,
      DESIGNATION: employee.designation,
      LOCATION: employee.location,
      GRADE: employee.grade || 'As per Policy',
      APPOINTMENT_DATE: formatDashDate(appointment.appointmentDate),
      OFFER_DATE: formatDashDate(appointment.offerDate),
      JOINING_DATE: formatOrdinalDate(appointment.joiningDate),
      PROBATION_PERIOD: appointment.probationPeriod || '3 months',
      NOTICE_PERIOD: appointment.noticePeriod || '1 month',
      ...ctcTags(calc),
    },
    calc,
  }
}

export async function generateOfferLetterDocx(employee, offer, salaryInput) {
  const { tags, calc } = buildOfferLetterTagMap(employee, offer, salaryInput)
  const blob = await fillDocxTemplate(OFFER_TEMPLATE_URL, tags)
  const filename = buildFileName(employee.employeeName, 'offer', 'docx')
  return { blob, filename, tags, calc }
}

export async function generateAppointmentLetterDocx(employee, appointment, salaryInput) {
  const { tags, calc } = buildAppointmentLetterTagMap(employee, appointment, salaryInput)
  const blob = await fillDocxTemplate(APPOINTMENT_TEMPLATE_URL, tags)
  const filename = buildFileName(employee.employeeName, 'appointment', 'docx')
  return { blob, filename, tags, calc }
}
