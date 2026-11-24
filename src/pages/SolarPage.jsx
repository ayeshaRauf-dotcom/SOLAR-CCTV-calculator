import { usePageMeta } from '../hooks/usePageMeta.js'
import { useSettings } from '../hooks/useSettings.jsx'
import SolarCalculator from '../calculators/SolarCalculator.jsx'
import EmbedCode from '../components/EmbedCode.jsx'

export default function SolarPage() {
  usePageMeta('solar')
  const { content } = useSettings()
  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>{content.seo.solar.title}</h1>
          <p>{content.seo.solar.description}</p>
        </div>
      </section>
      <div className="container page-body">
        <SolarCalculator />
        <EmbedCode kind="solar" title={content.seo.solar.title} />
      </div>
    </>
  )
}
