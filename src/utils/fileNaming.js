const DOCUMENT_TYPE_SUFFIX = {
  offer: 'Offer Letter',
  appointment: 'Appointment Letter',
  salary_slip: 'Salary Slip',
}

// FIX #22 — never let "undefined"/"null"/an empty string reach a filename,
// and strip every character that's illegal (or awkward) in a filename on
// Windows/macOS/Linux, plus control characters and stray trailing dots.
function sanitizeForFilename(name) {
  const raw = name === undefined || name === null || name === 'undefined' || name === 'null' ? '' : String(name).trim()
  const cleaned = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .trim()
  return cleaned || 'Employee'
}

export function buildFileName(employeeName, documentType, extension) {
  const safeName = sanitizeForFilename(employeeName)
  const suffix = DOCUMENT_TYPE_SUFFIX[documentType] || documentType
  const safeExtension = String(extension || 'docx').replace(/[^a-z0-9]/gi, '') || 'docx'
  return `${safeName} - ${suffix}.${safeExtension}`
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
