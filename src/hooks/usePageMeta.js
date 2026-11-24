import { useEffect } from 'react'
import { useSettings } from './useSettings.jsx'

// Sets the page title and meta description from settings.json (per route).
export function usePageMeta(seoKey, { noindex = false } = {}) {
  const settings = useSettings()
  const seo = settings.content.seo[seoKey]
  useEffect(() => {
    document.title = `${seo.title} | ${settings.company.name}`
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', seo.description)
    let robots = document.querySelector('meta[name="robots"]')
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta')
        robots.setAttribute('name', 'robots')
        document.head.appendChild(robots)
      }
      robots.setAttribute('content', 'noindex')
    } else if (robots) robots.remove()
  }, [seo, settings.company.name, noindex])
}
