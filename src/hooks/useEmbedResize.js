import { useEffect } from 'react'

// When the page is inside an iframe, tell the parent page how tall the content is.
// The message holds only a number and a type string. The parent page decides what to do with it
// (see the embed code in the README), so no data leaves the browser.
export const RESIZE_MESSAGE = 'clientorahq:resize'

export function useEmbedResize(ref) {
  useEffect(() => {
    if (window.parent === window || !ref.current) return undefined
    const el = ref.current
    let last = 0
    const send = () => {
      const height = Math.ceil(el.getBoundingClientRect().height)
      if (height && height !== last) {
        last = height
        window.parent.postMessage({ type: RESIZE_MESSAGE, height }, '*')
      }
    }
    const observer = new ResizeObserver(send)
    observer.observe(el)
    window.addEventListener('load', send)
    send()
    return () => {
      observer.disconnect()
      window.removeEventListener('load', send)
    }
  }, [ref])
}
