// Builds the WhatsApp enquiry. Nothing here sends data anywhere except the wa.me link
// that the visitor's own device opens. Customer text is treated as plain text only.

import { fillTemplate } from './format.js'

// Remove control characters (keeps line breaks) and cap the length.
export function sanitizeText(value, maxLength = 500) {
  return String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength)
}

// "+92 300 1234567", "0300-1234567" or "923001234567" -> "923001234567"
export function normalizeWhatsAppNumber(raw) {
  let digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (digits.startsWith('0')) digits = '92' + digits.slice(1)
  return digits
}

export function buildWhatsAppUrl(number, message) {
  return `https://wa.me/${normalizeWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`
}

export function buildMessage({ settings, service, customer, summary }) {
  const w = settings.content.whatsapp
  const serviceName = service === 'solar' ? w.solarServiceName : w.cctvServiceName
  const block = (rows) => rows.map((r) => `${r.label}: ${r.value}`).join('\n')

  const parts = [
    fillTemplate(w.greeting, { company: settings.company.name }),
    '',
    `${w.headings.service}: ${serviceName}`,
    '',
    `${w.headings.customer}`,
    `Name: ${sanitizeText(customer.name, 80)}`,
    `Phone: ${customer.phone.display}`,
    `City: ${customer.city.name}`,
  ]
  const note = sanitizeText(customer.note, 500)
  if (note) parts.push(`Note: ${note}`)
  parts.push('', w.headings.inputs, block(summary.inputs), '', w.headings.results, block(summary.results), '', settings.content.disclaimer)
  return parts.join('\n')
}
