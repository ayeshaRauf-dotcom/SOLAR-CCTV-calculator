import { useEffect, useRef } from 'react'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { useEmbedResize } from '../hooks/useEmbedResize.js'
import { useSettings } from '../hooks/useSettings.jsx'
import SolarCalculator from '../calculators/SolarCalculator.jsx'
import CCTVCalculator from '../calculators/CCTVCalculator.jsx'
import SampleNotice from '../components/SampleNotice.jsx'

// Bare page for iframes: no navbar, no footer, reports its height to the parent page.
export default function EmbedPage({ kind }) {
  usePageMeta(kind, { noindex: true })
  const { content } = useSettings()
  const ref = useRef(null)
  useEmbedResize(ref)
  useEffect(() => {
    document.body.classList.add('embed')
    return () => document.body.classList.remove('embed')
  }, [])
  return (
    <div className="embed-root" ref={ref}>
      <SampleNotice />
      <div className="embed-inner">
        <h1 className="embed-title">{content.seo[kind].title}</h1>
        {kind === 'solar' ? <SolarCalculator /> : <CCTVCalculator />}
      </div>
    </div>
  )
}
