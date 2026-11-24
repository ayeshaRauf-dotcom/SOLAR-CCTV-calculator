import { useRef, useState } from 'react'
import { useSettings } from '../hooks/useSettings.jsx'
import { calculateSolar, solarSummary, validateSolarInputs } from '../utils/solarCalculations.js'
import { formatNumber } from '../utils/format.js'
import Field, { describedBy } from '../components/Field.jsx'
import EnquiryForm from '../components/EnquiryForm.jsx'
import Icon from '../components/Icon.jsx'
import SolarResults from './SolarResults.jsx'

export default function SolarCalculator() {
  const settings = useSettings()
  const cfg = settings.solar
  const cur = settings.format.currencyLabel

  const [mode, setMode] = useState(cfg.input.defaultMode)
  const [amount, setAmount] = useState('')
  const [cityId, setCityId] = useState('')
  const [roofId, setRoofId] = useState('')
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)
  const refs = { amount: useRef(null), city: useRef(null), roof: useRef(null) }

  const clearResult = () => setResult(null)
  const change = (setter, key) => (e) => {
    setter(e.target.value)
    clearResult()
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
  }

  function switchMode(next) {
    setMode(next)
    setAmount('')
    setErrors((er) => ({ ...er, amount: undefined }))
    clearResult()
  }

  function submit(e) {
    e.preventDefault()
    const { errors: found, values } = validateSolarInputs({ mode, amount, cityId, roofId }, settings)
    setErrors(found)
    if (!values) {
      const first = ['amount', 'city', 'roof'].find((k) => found[k])
      refs[first].current?.focus()
      setResult(null)
      return
    }
    setResult(calculateSolar(values, settings))
  }

  const isBill = mode === 'bill'
  const amountLabel = isBill ? `Monthly electricity bill (${cur})` : 'Monthly electricity units (kWh)'
  const amountHint = isBill
    ? `Between ${formatNumber(cfg.input.minBill, settings)} and ${formatNumber(cfg.input.maxBill, settings)}. For example ${formatNumber(cfg.input.exampleBill, settings)}.`
    : `Between ${formatNumber(cfg.input.minUnits, settings)} and ${formatNumber(cfg.input.maxUnits, settings)} units. For example ${formatNumber(cfg.input.exampleUnits, settings)}.`
  const roof = cfg.roofTypes

  return (
    <div className="calc-layout">
      <div className="calc-layout__form">
        <form className="card calc-form" onSubmit={submit} noValidate aria-label="Solar savings calculator">
          <div className="segmented" role="group" aria-label="Calculate using">
            <button type="button" className={`segmented__btn${isBill ? ' is-active' : ''}`} aria-pressed={isBill} onClick={() => switchMode('bill')}>My bill</button>
            <button type="button" className={`segmented__btn${!isBill ? ' is-active' : ''}`} aria-pressed={!isBill} onClick={() => switchMode('units')}>My units</button>
          </div>

          <Field id="solar-amount" label={amountLabel} hint={amountHint} error={errors.amount}>
            <input ref={refs.amount} id="solar-amount" className="input" type="text" inputMode="decimal" autoComplete="off" maxLength={14}
              placeholder={isBill ? String(cfg.input.exampleBill) : String(cfg.input.exampleUnits)}
              value={amount} onChange={change(setAmount, 'amount')}
              aria-invalid={!!errors.amount} aria-describedby={describedBy('solar-amount', true, errors.amount)} aria-required="true" />
          </Field>

          <Field id="solar-city" label="City" error={errors.city}>
            <select ref={refs.city} id="solar-city" className="input" value={cityId} onChange={change(setCityId, 'city')}
              aria-invalid={!!errors.city} aria-describedby={describedBy('solar-city', null, errors.city)} aria-required="true">
              <option value="">Select your city</option>
              {settings.cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>

          <Field id="solar-roof" label="Roof type" error={errors.roof}>
            <select ref={refs.roof} id="solar-roof" className="input" value={roofId} onChange={change(setRoofId, 'roof')}
              aria-invalid={!!errors.roof} aria-describedby={describedBy('solar-roof', null, errors.roof)} aria-required="true">
              <option value="">Select your roof type</option>
              {roof.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </Field>

          <button type="submit" className="btn btn--primary btn--block">
            <Icon name="bolt" size={20} /> Calculate my solar estimate
          </button>
        </form>
      </div>

      <div className="calc-layout__result" aria-live="polite">
        {result ? (
          <>
            <SolarResults result={result} />
            <EnquiryForm key={`${result.amount}-${result.mode}-${result.city.id}-${result.roof.id}`} service="solar" summary={solarSummary(result, settings)} defaultCityId={result.city.id} />
          </>
        ) : (
          <div className="card placeholder">
            <Icon name="sun" size={36} />
            <h3>Your estimate will appear here</h3>
            <p>Enter your bill or units, choose your city and roof type, then calculate. No sign-up needed.</p>
          </div>
        )}
      </div>
    </div>
  )
}
