import { useSettings } from '../hooks/useSettings.jsx'
import { Link } from '../router.jsx'
import { calculateSolar, formatPayback, validateSolarInputs } from '../utils/solarCalculations.js'
import { calculateCctv, validateCctv } from '../utils/cctvCalculations.js'
import { formatMoneyRange, formatNumber } from '../utils/format.js'
import Icon from './Icon.jsx'

// Both previews run the real calculators on example inputs from settings.json,
// so the numbers always match the current prices.
export default function CalculatorPreviews() {
  const settings = useSettings()
  const sIn = settings.solar.previewExample
  const cIn = settings.cctv.previewExample
  const solar = validateSolarInputs({ mode: sIn.mode, amount: sIn.amount, cityId: sIn.cityId, roofId: sIn.roofId }, settings)
  const cctv = validateCctv(cIn, settings)
  const s = solar.values && calculateSolar(solar.values, settings)
  const c = cctv.values && calculateCctv(cctv.values, settings)

  return (
    <section className="section section--alt" aria-labelledby="previews-title">
      <div className="container">
        <h2 id="previews-title" className="section__title">Try the calculators</h2>
        <div className="grid grid--2">
          <article className="card preview">
            <header className="preview__head"><Icon name="sun" size={24} /><h3>Solar Savings Calculator</h3></header>
            {s && (
              <>
                <p className="preview__example">Example: {settings.format.currencyLabel} {formatNumber(s.monthlyBill, settings)} monthly bill in {s.city.name}</p>
                <dl className="preview__list">
                  <div><dt>System size</dt><dd>{formatNumber(s.sizeKw, settings, 1)} kW</dd></div>
                  <div><dt>Cost</dt><dd>{formatMoneyRange(s.cost.min, s.cost.max, settings)}</dd></div>
                  <div><dt>Monthly savings</dt><dd>{formatMoneyRange(s.savings.min, s.savings.max, settings)}</dd></div>
                  <div><dt>Payback</dt><dd>{formatPayback(s, settings)}</dd></div>
                </dl>
              </>
            )}
            <Link to="/solar" className="btn btn--primary">Use the solar calculator</Link>
          </article>
          <article className="card preview">
            <header className="preview__head"><Icon name="camera" size={24} /><h3>CCTV &amp; Networking Quick Quote</h3></header>
            {c && (
              <>
                <p className="preview__example">Example: {c.cameras} cameras, {c.placement.label.toLowerCase()}, {c.recording.label} recording, {c.location.label.toLowerCase()}</p>
                <dl className="preview__list">
                  <div><dt>Estimate</dt><dd>{formatMoneyRange(c.estimate.min, c.estimate.max, settings)}</dd></div>
                  <div><dt>Night vision</dt><dd>{c.nightVision ? 'Included' : 'Not included'}</dd></div>
                  <div><dt>Network points</dt><dd>{c.networkPoints}</dd></div>
                </dl>
              </>
            )}
            <Link to="/cctv" className="btn btn--primary">Get a CCTV quote</Link>
          </article>
        </div>
      </div>
    </section>
  )
}
