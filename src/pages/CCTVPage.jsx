import { usePageMeta } from '../hooks/usePageMeta.js'
import { useSettings } from '../hooks/useSettings.jsx'
import CCTVCalculator from '../calculators/CCTVCalculator.jsx'
import EmbedCode from '../components/EmbedCode.jsx'

export default function CCTVPage() {
  usePageMeta('cctv')
  const { content } = useSettings()
  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>{content.seo.cctv.title}</h1>
          <p>{content.seo.cctv.description}</p>
        </div>
      </section>
      <div className="container page-body">
        <CCTVCalculator />
        <EmbedCode kind="cctv" title={content.seo.cctv.title} />
      </div>
    </>
  )
}
