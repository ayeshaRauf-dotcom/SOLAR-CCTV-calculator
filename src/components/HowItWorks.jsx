import { useSettings } from '../hooks/useSettings.jsx'

export default function HowItWorks() {
  const { content } = useSettings()
  return (
    <section className="section" aria-labelledby="how-title">
      <div className="container">
        <h2 id="how-title" className="section__title">How it works</h2>
        <ol className="steps">
          {content.howItWorks.map((s, i) => (
            <li key={s.title} className="steps__item">
              <span className="steps__num" aria-hidden="true">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
