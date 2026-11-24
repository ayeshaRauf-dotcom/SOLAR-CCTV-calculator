import { useEffect, useRef } from 'react'
import { useSettings } from '../hooks/useSettings.jsx'
import { formatMoneyRange, formatNumber } from '../utils/format.js'
import { formatPayback } from '../utils/solarCalculations.js'
import Disclaimer from '../components/Disclaimer.jsx'
import Icon from '../components/Icon.jsx'

export default function SolarResults({ result }) {
  const settings = useSettings()
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus({ preventScroll: false }) }, [result])

  return (
    <section className="card result" ref={ref} tabIndex={-1} aria-labelledby="solar-result-title" data-testid="solar-result">
      <h3 id="solar-result-title" className="result__heading">Your solar estimate</h3>
      <div className="result__hero">
        <Icon name="sun" size={34} />
        <div>
          <p className="result__label">Recommended system size</p>
          <p className="result__big">{formatNumber(result.sizeKw, settings, 1)} kW</p>
        </div>
      </div>

      <dl className="stats">
        <div className="stat">
          <dt>Estimated system cost</dt>
          <dd>{formatMoneyRange(result.cost.min, result.cost.max, settings)}</dd>
        </div>
        <div className="stat">
          <dt>Estimated monthly savings</dt>
          <dd>{formatMoneyRange(result.savings.min, result.savings.max, settings)}</dd>
        </div>
        <div className="stat">
          <dt>Estimated payback period</dt>
          <dd>{formatPayback(result, settings)}</dd>
        </div>
      </dl>

      <ul className="chips">
        <li><span>City</span> {result.city.name}</li>
        <li><span>Roof type</span> {result.roof.label}</li>
      </ul>

      {result.cappedAtMax && (
        <p className="notice notice--warn" role="note">
          Your usage needs more than the largest size we estimate online. This estimate is capped at {formatNumber(settings.solar.sizing.maxKw, settings)} kW. Please send an enquiry so we can design it properly.
        </p>
      )}
      {result.raisedToMin && (
        <p className="notice" role="note">
          This is the smallest system size we estimate online. It may produce more than you use, and the savings shown only count the units you would actually use.
        </p>
      )}

      <Disclaimer />

      <details className="how" open>
        <summary>How We Worked This Out</summary>
        <ol>
          {result.explanation.map((line) => <li key={line}>{line}</li>)}
        </ol>
      </details>
    </section>
  )
}
