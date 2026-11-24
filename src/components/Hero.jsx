import { useSettings } from '../hooks/useSettings.jsx'
import { Link } from '../router.jsx'
import Icon from './Icon.jsx'

// The sun that is also a camera lens, over a solar-panel grid.
function SunLens() {
  const rays = Array.from({ length: 16 }, (_, i) => i * 22.5)
  return (
    <svg className="sunlens" viewBox="0 0 400 400" role="img" aria-label="A sun drawn as a camera lens above a solar panel">
      <defs>
        <radialGradient id="glow" cx="50%" cy="42%" r="50%">
          <stop offset="0" stopColor="var(--c-accent)" stopOpacity=".35" />
          <stop offset="1" stopColor="var(--c-accent)" stopOpacity="0" />
        </radialGradient>
        <pattern id="cells" width="40" height="30" patternUnits="userSpaceOnUse">
          <rect width="40" height="30" fill="none" stroke="var(--c-on-ink-muted)" strokeOpacity=".35" strokeWidth="1" />
        </pattern>
      </defs>
      <circle cx="200" cy="170" r="190" fill="url(#glow)" />
      <g className="sunlens__rays" stroke="var(--c-accent)" strokeWidth="5" strokeLinecap="round">
        {rays.map((a) => (
          <line key={a} x1="200" y1="46" x2="200" y2={a % 45 === 0 ? 20 : 32} transform={`rotate(${a} 200 170)`} />
        ))}
      </g>
      <circle cx="200" cy="170" r="104" fill="var(--c-accent)" />
      <circle cx="200" cy="170" r="84" fill="var(--c-ink)" />
      <circle cx="200" cy="170" r="62" fill="none" stroke="var(--c-signal)" strokeWidth="3" />
      <circle cx="200" cy="170" r="38" fill="var(--c-panel)" />
      <circle cx="200" cy="170" r="18" fill="var(--c-ink)" />
      <circle cx="222" cy="148" r="9" fill="var(--c-accent)" />
      <g transform="translate(70 318) skewX(-18)">
        <rect width="270" height="66" rx="4" fill="var(--c-panel)" />
        <rect width="270" height="66" rx="4" fill="url(#cells)" />
        <rect width="270" height="66" rx="4" fill="none" stroke="var(--c-accent)" strokeWidth="3" />
      </g>
    </svg>
  )
}

export default function Hero() {
  const { content } = useSettings()
  const h = content.hero
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title">{h.headline}</h1>
          <p className="hero__text">{h.description}</p>
          <div className="hero__cta">
            <Link to="/solar" className="btn btn--primary btn--lg"><Icon name="sun" size={20} /> {h.primaryCta}</Link>
            <Link to="/cctv" className="btn btn--outline btn--lg"><Icon name="camera" size={20} /> {h.secondaryCta}</Link>
          </div>
        </div>
        <div className="hero__art"><SunLens /></div>
      </div>
    </section>
  )
}
