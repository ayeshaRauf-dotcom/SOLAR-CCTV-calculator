import { useSettings } from '../hooks/useSettings.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import Hero from '../components/Hero.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import CalculatorPreviews from '../components/CalculatorPreviews.jsx'
import FAQ from '../components/FAQ.jsx'

export default function Home() {
  usePageMeta('home')
  const { content } = useSettings()
  return (
    <>
      <Hero />
      <section className="section" id="services" aria-labelledby="services-title">
        <div className="container">
          <h2 id="services-title" className="section__title">What we do</h2>
          <div className="grid grid--3">
            {content.services.map((s) => <ServiceCard key={s.id} icon={s.icon} title={s.title} description={s.description} />)}
          </div>
        </div>
      </section>
      <HowItWorks />
      <CalculatorPreviews />
      <FAQ />
    </>
  )
}
