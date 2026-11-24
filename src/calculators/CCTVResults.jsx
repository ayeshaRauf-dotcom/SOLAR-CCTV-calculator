import { useEffect, useRef } from 'react'
import { useSettings } from '../hooks/useSettings.jsx'
import { formatMoneyRange } from '../utils/format.js'
import Disclaimer from '../components/Disclaimer.jsx'
import Icon from '../components/Icon.jsx'

export default function CCTVResults({ result, onEdit }) {
  const settings = useSettings()
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [result])

  const rows = [
    ['Installation location', result.location.label],
    ['Number of cameras', String(result.cameras)],
    ['Camera type', result.cameraTypeText],
    ['Night vision', result.nightVision ? 'Yes' : 'No'],
    ['Recording duration', result.recording.label],
    ['Network points', String(result.networkPoints)],
  ]

  return (
    <section className="card result" ref={ref} tabIndex={-1} aria-labelledby="cctv-result-title" data-testid="cctv-result">
      <h3 id="cctv-result-title" className="result__heading">Your CCTV estimate</h3>
      <div className="result__hero">
        <Icon name="camera" size={34} />
        <div>
          <p className="result__label">Estimated quotation range</p>
          <p className="result__big">{formatMoneyRange(result.estimate.min, result.estimate.max, settings)}</p>
        </div>
      </div>

      <dl className="summary">
        {rows.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>

      <h4 className="result__sub">What is included</h4>
      <ul className="included">
        {result.included.map((item) => (
          <li key={item}><Icon name="check" size={18} /><span>{item}</span></li>
        ))}
      </ul>

      <Disclaimer />
      <button type="button" className="btn btn--ghost" onClick={onEdit}>Change my answers</button>
    </section>
  )
}
