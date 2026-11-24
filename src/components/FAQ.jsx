import { useSettings } from '../hooks/useSettings.jsx'
import Icon from './Icon.jsx'

export default function FAQ() {
  const { content } = useSettings()
  return (
    <section className="section section--alt" id="faq" aria-labelledby="faq-title">
      <div className="container container--narrow">
        <h2 id="faq-title" className="section__title">Common questions</h2>
        <div className="faq">
          {content.faq.map((item) => (
            <details key={item.q} className="faq__item">
              <summary>
                <span>{item.q}</span>
                <Icon name="chevron" size={20} className="faq__chevron" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
