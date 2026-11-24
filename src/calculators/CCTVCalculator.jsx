import { useEffect, useRef, useState } from 'react'
import { useSettings } from '../hooks/useSettings.jsx'
import { calculateCctv, cctvSummary, STEP_FIELDS, validateCctv } from '../utils/cctvCalculations.js'
import { formatMoney } from '../utils/format.js'
import EnquiryForm from '../components/EnquiryForm.jsx'
import Icon from '../components/Icon.jsx'
import CCTVResults from './CCTVResults.jsx'

function Choices({ name, options, value, onChange, error, labelledBy }) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} aria-describedby={error ? `${name}-error` : undefined} className="choices">
      {options.map((o) => (
        <label key={o.value} className="choice">
          <input type="radio" name={name} value={o.value} checked={String(value) === String(o.value)} onChange={() => onChange(String(o.value))} />
          <span className="choice__body">
            {o.icon && <Icon name={o.icon} size={24} />}
            <span className="choice__text">
              <span className="choice__label">{o.label}</span>
              {o.description && <span className="choice__desc">{o.description}</span>}
            </span>
          </span>
        </label>
      ))}
      {error && <p className="field__error" id={`${name}-error`} role="alert">{error}</p>}
    </div>
  )
}

function Quantity({ id, value, onChange, min, max, error, labelledBy }) {
  const current = Number.parseInt(String(value).replace(/[^\d]/g, ''), 10)
  const step = (d) => {
    const base = Number.isFinite(current) ? current : min
    onChange(String(Math.min(max, Math.max(min, base + d))))
  }
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <div className="qty">
        <button type="button" className="qty__btn" onClick={() => step(-1)} disabled={Number.isFinite(current) && current <= min} aria-label="Decrease">
          <Icon name="minus" size={22} />
        </button>
        <input id={id} className="input qty__input" type="text" inputMode="numeric" autoComplete="off" maxLength={4}
          value={value} onChange={(e) => onChange(e.target.value)} aria-labelledby={labelledBy}
          aria-invalid={!!error} aria-describedby={error ? `${id}-error` : `${id}-hint`} />
        <button type="button" className="qty__btn" onClick={() => step(1)} disabled={Number.isFinite(current) && current >= max} aria-label="Increase">
          <Icon name="plus" size={22} />
        </button>
      </div>
      {error ? <p className="field__error" id={`${id}-error`} role="alert">{error}</p> : <p className="field__hint" id={`${id}-hint`}>From {min} to {max}.</p>}
    </div>
  )
}

export default function CCTVCalculator() {
  const settings = useSettings()
  const cfg = settings.cctv
  const steps = cfg.steps

  const [answers, setAnswers] = useState({
    locationId: '', cameras: String(cfg.cameras.default), placement: '', nightVision: '', recordingDays: '', networkPoints: String(cfg.networkPoints.default),
  })
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)
  const headingRef = useRef(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    headingRef.current?.focus()
  }, [step])

  const set = (key) => (value) => {
    setAnswers((a) => ({ ...a, [key]: value }))
    setErrors((er) => ({ ...er, [key]: undefined, ...(key === 'cameras' ? { placement: undefined } : {}) }))
  }

  const current = steps[step]
  const isLast = step === steps.length - 1

  function next(e) {
    e.preventDefault()
    const { errors: found } = validateCctv(answers, settings, STEP_FIELDS[current.id])
    setErrors(found)
    if (Object.keys(found).length) return
    if (!isLast) return setStep(step + 1)
    // Final step: check everything again, jump back to the first problem if any.
    const all = validateCctv(answers, settings)
    if (!all.values) {
      setErrors(all.errors)
      const bad = steps.findIndex((s) => STEP_FIELDS[s.id].some((f) => all.errors[f]))
      if (bad >= 0) setStep(bad)
      return
    }
    setResult(calculateCctv(all.values, settings))
  }

  function back() {
    setErrors({})
    setStep(Math.max(0, step - 1))
  }

  function edit() {
    setResult(null)
    setStep(0)
  }

  const labelId = `cctv-step-${current.id}`
  let body = null
  switch (current.id) {
    case 'location':
      body = <Choices name="locationId" labelledBy={labelId} value={answers.locationId} onChange={set('locationId')} error={errors.locationId}
        options={cfg.locations.map((l) => ({ value: l.id, label: l.label, description: l.description, icon: l.icon }))} />
      break
    case 'cameras':
      body = <Quantity id="cctv-cameras" labelledBy={labelId} value={answers.cameras} onChange={set('cameras')} min={cfg.cameras.min} max={cfg.cameras.max} error={errors.cameras} />
      break
    case 'placement':
      body = <Choices name="placement" labelledBy={labelId} value={answers.placement} onChange={set('placement')} error={errors.placement}
        options={cfg.placements.map((p) => ({ value: p.id, label: p.label, description: p.description }))} />
      break
    case 'nightVision':
      body = <Choices name="nightVision" labelledBy={labelId} value={answers.nightVision} onChange={set('nightVision')} error={errors.nightVision}
        options={[
          { value: 'yes', label: 'Yes', description: `Adds ${formatMoney(cfg.nightVision.addOnPerCamera, settings)} per camera` },
          { value: 'no', label: 'No', description: 'Daytime and well-lit areas only' },
        ]} />
      break
    case 'recording':
      body = <Choices name="recordingDays" labelledBy={labelId} value={answers.recordingDays} onChange={set('recordingDays')} error={errors.recordingDays}
        options={cfg.recordingOptions.map((o) => ({ value: o.days, label: o.label }))} />
      break
    case 'network':
      body = <Quantity id="cctv-network" labelledBy={labelId} value={answers.networkPoints} onChange={set('networkPoints')} min={cfg.networkPoints.min} max={cfg.networkPoints.max} error={errors.networkPoints} />
      break
    default:
      body = null
  }

  if (result) {
    return (
      <div className="calc-layout">
        <div className="calc-layout__result calc-layout__result--wide">
          <CCTVResults result={result} onEdit={edit} />
          <EnquiryForm key={JSON.stringify(result.estimate) + result.cameras} service="cctv" summary={cctvSummary(result, settings)} />
        </div>
      </div>
    )
  }

  const pct = Math.round(((step + 1) / steps.length) * 100)
  return (
    <div className="calc-layout">
      <form className="card calc-form calc-form--wizard" onSubmit={next} noValidate aria-label="CCTV and networking quick quote">
        <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1} aria-label={`Step ${step + 1} of ${steps.length}`}>
          <div className="progress__bar" style={{ width: `${pct}%` }} />
        </div>
        <p className="progress__text">Step {step + 1} of {steps.length}</p>

        <h3 id={labelId} className="wizard__title" tabIndex={-1} ref={headingRef}>{current.title}</h3>
        <p className="wizard__help">{current.help}</p>

        <div className="wizard__body">{body}</div>

        <div className="wizard__nav">
          {step > 0 && <button type="button" className="btn btn--ghost" onClick={back}>Back</button>}
          <button type="submit" className="btn btn--primary wizard__next">
            {isLast ? 'Get my estimate' : 'Next'}
            <Icon name={isLast ? 'check' : 'arrow'} size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}
