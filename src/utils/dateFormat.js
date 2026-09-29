// Multiple date-format renderers matching the literal styles found in the
// original letter templates:
//   OFFER_DATE (offer letter)        -> "15/09/2026"
//   OFFER_DATE (in appointment ref)  -> "15-09-2026"
//   APPOINTMENT_DATE                 -> "15-10-2026"
//   JOINING_DATE / OFFER_VALID_TILL  -> "15th Oct 2026"

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function toDate(value) {
  if (value instanceof Date) return value
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function ordinalSuffix(day) {
  if (day >= 11 && day <= 13) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

/** "15/09/2026" */
export function formatSlashDate(value) {
  const d = toDate(value)
  if (!d) return ''
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`
}

/** "15-09-2026" */
export function formatDashDate(value) {
  const d = toDate(value)
  if (!d) return ''
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`
}

/** "15th Oct 2026" */
export function formatOrdinalDate(value) {
  const d = toDate(value)
  if (!d) return ''
  const day = d.getDate()
  return `${day}${ordinalSuffix(day)} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

/** Formatted for <input type="date"> value binding: "2026-10-15" */
export function toInputDateValue(value) {
  const d = toDate(value)
  if (!d) return ''
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function isValidDate(value) {
  return toDate(value) !== null
}
