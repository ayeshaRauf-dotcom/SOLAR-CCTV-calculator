import { useState } from 'react'
import { RESIZE_MESSAGE } from '../hooks/useEmbedResize.js'
import Icon from './Icon.jsx'

export function buildEmbedCode(kind, title) {
  const src = `${window.location.origin}${import.meta.env.BASE_URL}embed/${kind}`
  const id = `clientorahq-${kind}`
  return `<iframe id="${id}" src="${src}" title="${title}" style="width:100%;min-height:640px;border:0;display:block" loading="lazy"></iframe>
<script>
  // Lets the calculator resize the frame so it never shows its own scrollbar.
  window.addEventListener('message', function (e) {
    var f = document.getElementById('${id}');
    if (!f || e.source !== f.contentWindow) return;
    if (e.data && e.data.type === '${RESIZE_MESSAGE}' && typeof e.data.height === 'number') {
      f.style.height = Math.ceil(e.data.height) + 'px';
    }
  });
</script>`
}

export default function EmbedCode({ kind, title }) {
  const [copied, setCopied] = useState('')
  const code = buildEmbedCode(kind, title)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied('Embed code copied.')
    } catch {
      const area = document.getElementById(`embed-${kind}`)
      if (area) {
        area.focus()
        area.select()
        try { document.execCommand('copy'); setCopied('Embed code copied.'); return } catch { /* fall through */ }
      }
      setCopied('Press Ctrl+C to copy the selected code.')
    }
  }

  return (
    <section className="embed-box" aria-labelledby={`embed-${kind}-title`}>
      <h2 id={`embed-${kind}-title`}>Add this calculator to your website</h2>
      <p>Paste this code into your page where you want the calculator to appear.</p>
      <label className="sr-only" htmlFor={`embed-${kind}`}>Embed code for the {title}</label>
      <textarea id={`embed-${kind}`} className="embed-box__code" readOnly rows={8} value={code} onFocus={(e) => e.target.select()} />
      <div className="embed-box__row">
        <button type="button" className="btn btn--secondary" onClick={copy}>
          <Icon name="copy" size={18} /> Copy Embed Code
        </button>
        <a className="btn btn--ghost" href={`${import.meta.env.BASE_URL}embed/${kind}`} target="_blank" rel="noopener noreferrer">Open embed page</a>
        <span className="embed-box__status" role="status" aria-live="polite">{copied}</span>
      </div>
    </section>
  )
}
