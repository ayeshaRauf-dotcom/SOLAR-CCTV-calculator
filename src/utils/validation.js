// Input parsing and validation. Customer text is never interpreted as HTML:
// it is only stored in React state and rendered through React's escaped text nodes.

import { formatNumber } from './format.js'

/**
 * Parse a typed number safely.
 * Returns { value, error }. Exactly one of them is non-null.
 */
export function parseNumber(raw, { label, min, max, integer = false, settings }) {
  const text = String(raw ?? '').trim().replace(/[,\s]/g, '')
  if (text === '') return { value: null, error: `Please enter ${label}.` }
  if (text.startsWith('-')) return { value: null, error: `${capitalize(label)} cannot be negative.` }
  if (!/^[0-9]*\.?[0-9]*$/.test(text) || text === '.') {
    return { value: null, error: `Use numbers only for ${label}, with no letters or symbols.` }
  }
  if (integer && text.includes('.')) {
    return { value: null, error: `Enter a whole number for ${label}.` }
  }
  const value = Number(text)
  if (!Number.isFinite(value)) return { value: null, error: `Please enter a valid number for ${label}.` }
  if (min > 0 && value === 0) return { value: null, error: `${capitalize(label)} must be more than zero.` }
  if (value < min) {
    return { value: null, error: `${capitalize(label)} must be at least ${formatNumber(min, settings)}.` }
  }
  if (value > max) {
    return {
      value: null,
      error: `${capitalize(label)} above ${formatNumber(max, settings)} needs a custom design. Please contact us directly and we will size it on a site survey.`,
    }
  }
  return { value, error: null }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ---- Enquiry form ----

const PK_MOBILE = /^(?:\+?92|0092|0)?(3[0-4]\d{8})$/

export function normalizePhone(raw) {
  const text = String(raw ?? '').trim().replace(/[\s\-().]/g, '')
  const match = PK_MOBILE.exec(text)
  if (!match) return null
  const national = match[1]
  return {
    e164: `+92${national}`,
    display: `+92 ${national.slice(0, 3)} ${national.slice(3)}`,
  }
}

export function validateEnquiry(form, settings) {
  const errors = {}
  const name = String(form.name ?? '').trim()
  if (!name) errors.name = 'Please enter your full name.'
  else if (name.length < 2) errors.name = 'Your name needs at least 2 characters.'
  else if (name.length > 80) errors.name = 'Please keep your name under 80 characters.'

  const phone = normalizePhone(form.phone)
  if (!String(form.phone ?? '').trim()) errors.phone = 'Please enter your mobile number.'
  else if (!phone) errors.phone = 'Enter a Pakistani mobile number, like 0300 1234567 or +92 300 1234567.'

  const city = settings.cities.find((c) => c.id === form.cityId)
  if (!city) errors.city = 'Please select your city.'

  const note = String(form.note ?? '')
  if (note.length > 500) errors.note = 'Please keep your note under 500 characters.'

  return {
    errors,
    valid: Object.keys(errors).length === 0,
    values: Object.keys(errors).length === 0 ? { name, phone, city, note: note.trim() } : null,
  }
}
