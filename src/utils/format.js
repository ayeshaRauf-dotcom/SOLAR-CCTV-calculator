// Small formatting helpers. No business values live here.

export function roundTo(value, step) {
  if (!step || step <= 0) return value
  return Math.round(value / step) * step
}

export function ceilTo(value, step) {
  if (!step || step <= 0) return value
  return Math.ceil(value / step - 1e-9) * step
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function formatNumber(value, settings, maxFractionDigits = 0) {
  return new Intl.NumberFormat(settings.format.locale, {
    maximumFractionDigits: maxFractionDigits,
  }).format(value)
}

export function formatMoney(value, settings) {
  return `${settings.format.currencyLabel} ${formatNumber(value, settings)}`
}

export function formatMoneyRange(min, max, settings) {
  return `${settings.format.currencyLabel} ${formatNumber(min, settings)} – ${formatNumber(max, settings)}`
}

// Replace {name} placeholders. Output is plain text; React escapes it when rendered.
export function fillTemplate(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
  )
}

export function findById(list, id) {
  return list.find((item) => item.id === id) || null
}
