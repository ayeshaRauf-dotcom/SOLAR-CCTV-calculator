// Solar calculator logic. Every number comes from settings.json (settings.solar, settings.cities).

import { parseNumber } from './validation.js'
import { ceilTo, clamp, findById, fillTemplate, formatMoney, formatMoneyRange, formatNumber, roundTo } from './format.js'

/**
 * raw = { mode: 'bill' | 'units', amount: string, cityId: string, roofId: string }
 * Returns { errors, values }.
 */
export function validateSolarInputs(raw, settings) {
  const cfg = settings.solar.input
  const errors = {}
  const mode = raw.mode === 'units' ? 'units' : 'bill'

  const parsed = mode === 'bill'
    ? parseNumber(raw.amount, { label: 'your monthly bill', min: cfg.minBill, max: cfg.maxBill, settings })
    : parseNumber(raw.amount, { label: 'your monthly units', min: cfg.minUnits, max: cfg.maxUnits, settings })
  if (parsed.error) errors.amount = parsed.error

  const city = findById(settings.cities, raw.cityId)
  if (!city) errors.city = 'Please select your city.'
  const roof = findById(settings.solar.roofTypes, raw.roofId)
  if (!roof) errors.roof = 'Please select your roof type.'

  if (Object.keys(errors).length) return { errors, values: null }
  return { errors, values: { mode, amount: parsed.value, city, roof } }
}

export function calculateSolar(values, settings) {
  const s = settings.solar
  const { mode, amount, city, roof } = values

  const monthlyUnits = mode === 'units' ? amount : amount / s.tariffPerUnit
  const monthlyBill = mode === 'bill' ? amount : amount * s.tariffPerUnit

  const yieldPerKw = city.peakSunHours * s.daysPerMonth * s.systemEfficiency * roof.yieldMultiplier
  const rawKw = (monthlyUnits * s.targetOffset) / yieldPerKw
  const steppedKw = ceilTo(rawKw, s.sizing.stepKw)
  const sizeKw = clamp(steppedKw, s.sizing.minKw, s.sizing.maxKw)
  const cappedAtMax = steppedKw > s.sizing.maxKw
  const raisedToMin = steppedKw < s.sizing.minKw

  const generatedUnits = sizeKw * yieldPerKw
  const offsetUnits = Math.min(generatedUnits, monthlyUnits)
  const baseSavings = offsetUnits * s.tariffPerUnit
  const savingsMin = Math.max(roundTo(baseSavings * s.savingsRange.low, s.rounding.savingsTo), s.rounding.savingsTo)
  const savingsMax = Math.max(roundTo(baseSavings * s.savingsRange.high, s.rounding.savingsTo), savingsMin)

  const baseCost = sizeKw * s.pricePerKw * roof.costMultiplier * city.costMultiplier + s.fixedCharges
  const costMin = roundTo(baseCost * s.costRange.low, s.rounding.costTo)
  const costMax = Math.max(roundTo(baseCost * s.costRange.high, s.rounding.costTo), costMin)

  const f = 10 ** s.rounding.paybackDecimals
  const paybackMin = Math.round((costMin / (savingsMax * 12)) * f) / f
  const paybackMax = Math.round((costMax / (savingsMin * 12)) * f) / f

  const result = {
    mode, amount, city, roof,
    monthlyUnits, monthlyBill, yieldPerKw, rawKw, sizeKw, cappedAtMax, raisedToMin,
    generatedUnits, offsetUnits,
    cost: { min: costMin, max: costMax },
    savings: { min: savingsMin, max: savingsMax },
    payback: { min: paybackMin, max: paybackMax },
  }
  result.explanation = solarExplanation(result, settings)
  return result
}

export function solarExplanation(r, settings) {
  const s = settings.solar
  const vars = {
    monthlyUnits: formatNumber(r.monthlyUnits, settings),
    monthlyBill: formatMoney(r.monthlyBill, settings),
    tariff: formatMoney(s.tariffPerUnit, settings),
    city: r.city.name,
    roof: r.roof.label.toLowerCase(),
    yieldPerKw: formatNumber(r.yieldPerKw, settings),
    sunHours: formatNumber(r.city.peakSunHours, settings, 1),
    efficiency: formatNumber(s.systemEfficiency * 100, settings),
    offset: formatNumber(s.targetOffset * 100, settings),
    rawKw: formatNumber(r.rawKw, settings, 1),
    sizeKw: formatNumber(r.sizeKw, settings, 1) + ' kW',
    pricePerKw: formatMoney(s.pricePerKw, settings),
    fixedCharges: formatMoney(s.fixedCharges, settings),
    costLow: formatNumber(s.costRange.low * 100, settings),
    costHigh: formatNumber(s.costRange.high * 100, settings),
    generatedUnits: formatNumber(r.generatedUnits, settings),
    savingsLow: formatNumber(s.savingsRange.low * 100, settings),
    savingsHigh: formatNumber(s.savingsRange.high * 100, settings),
  }
  // "{sizeKw} kW" in templates would double the unit, so the template value above carries it.
  return s.explanation.map((t) => fillTemplate(t.replace('{sizeKw} kW', '{sizeKw}'), vars))
}

export function formatPayback(r, settings) {
  const d = settings.solar.rounding.paybackDecimals
  return `${formatNumber(r.payback.min, settings, d)} – ${formatNumber(r.payback.max, settings, d)} years`
}

// Lines used for the WhatsApp message.
export function solarSummary(r, settings) {
  const input = r.mode === 'bill'
    ? { label: 'Monthly electricity bill', value: formatMoney(r.amount, settings) }
    : { label: 'Monthly electricity units', value: `${formatNumber(r.amount, settings)} kWh` }
  return {
    inputs: [
      input,
      { label: 'City', value: r.city.name },
      { label: 'Roof type', value: r.roof.label },
    ],
    results: [
      { label: 'Recommended system size', value: `${formatNumber(r.sizeKw, settings, 1)} kW` },
      { label: 'Estimated system cost', value: formatMoneyRange(r.cost.min, r.cost.max, settings) },
      { label: 'Estimated monthly savings', value: formatMoneyRange(r.savings.min, r.savings.max, settings) },
      { label: 'Estimated payback', value: formatPayback(r, settings) },
    ],
  }
}
