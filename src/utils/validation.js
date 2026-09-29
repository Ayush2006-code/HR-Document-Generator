import { isValidDate } from './dateFormat.js'

export function validateRequired(value, label) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${label} is required.`
  }
  return null
}

export function validateEmployeeCore(data) {
  const errors = {}
  const req = (field, label) => {
    const err = validateRequired(data[field], label)
    if (err) errors[field] = err
  }
  req('employeeName', 'Employee name')
  req('designation', 'Designation')
  req('location', 'Branch & Location')

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (data.phone && !/^[+]?[\d\s-]{7,15}$/.test(data.phone)) {
    errors.phone = 'Enter a valid phone number.'
  }
  return errors
}

export function validateDatesPresent(data, fields) {
  const errors = {}
  for (const { key, label } of fields) {
    if (!data[key]) {
      errors[key] = `${label} is required.`
    } else if (!isValidDate(data[key])) {
      errors[key] = `${label} is not a valid date.`
    }
  }
  return errors
}

export function mergeErrors(...errorObjects) {
  return Object.assign({}, ...errorObjects)
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}
