// Indian numbering system (Thousand / Lakh / Crore) number-to-words
// converter. Pure function, no dependencies — used for CTC_IN_WORDS.

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigits(num) {
  if (num === 0) return ''
  if (num < 20) return ONES[num]
  const tens = Math.floor(num / 10)
  const ones = num % 10
  return ones === 0 ? TENS[tens] : `${TENS[tens]}-${ONES[ones]}`
}

function threeDigits(num) {
  const hundreds = Math.floor(num / 100)
  const remainder = num % 100
  const parts = []
  if (hundreds) parts.push(`${ONES[hundreds]} Hundred`)
  if (remainder) parts.push(twoDigits(remainder))
  return parts.join(' ')
}

/**
 * Converts a non-negative integer (or numeric string) into words using the
 * Indian numbering system: ... Crore, Lakh, Thousand, Hundred.
 * Example: 439200 -> "Four Lakh Thirty-Nine Thousand Two Hundred"
 */
export function numberToIndianWords(value) {
  let num = Math.round(Math.abs(Number(value) || 0))
  if (num === 0) return 'Zero'

  const crore = Math.floor(num / 1_00_00_000)
  num %= 1_00_00_000
  const lakh = Math.floor(num / 1_00_000)
  num %= 1_00_000
  const thousand = Math.floor(num / 1_000)
  num %= 1_000
  const hundred = num

  const parts = []
  if (crore) parts.push(`${numberToIndianWords(crore)} Crore`)
  if (lakh) parts.push(`${twoDigits(lakh) || ONES[lakh]} Lakh`)
  if (thousand) parts.push(`${twoDigits(thousand) || ONES[thousand]} Thousand`)
  if (hundred) parts.push(threeDigits(hundred))

  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

/** Formats a rupee amount in words the way the reference letters do:
 * "Rupee Four Lakh Thirty-Nine Thousand Two Hundred only per annum" */
export function amountInWordsRupees(value) {
  const words = numberToIndianWords(value)
  return `Rupee ${words} only`
}
