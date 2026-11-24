// Loads public/settings.json in the browser and shares it with every component.
// Nothing is cached on purpose: edit the file, refresh the page, and the site uses the new values.
import { createContext, useContext, useEffect, useState } from 'react'
import { validateSettings } from '../utils/settings.js'

const SettingsContext = createContext(null)

const kebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())

function applyColors(colors) {
  const root = document.documentElement
  Object.entries(colors).forEach(([key, value]) => root.style.setProperty(`--c-${kebab(key)}`, String(value)))
}

export function SettingsProvider({ children }) {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}settings.json`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`The server answered ${res.status}.`)
        const data = await res.json()
        const problems = validateSettings(data)
        if (cancelled) return
        if (problems.length) return setState({ status: 'invalid', problems })
        applyColors(data.colors)
        setState({ status: 'ready', settings: data })
      } catch (err) {
        if (!cancelled) setState({ status: 'error', message: err instanceof Error ? err.message : String(err) })
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (state.status === 'loading') {
    return (
      <div className="boot" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <span>Loading…</span>
      </div>
    )
  }
  if (state.status === 'error') {
    return (
      <div className="boot boot--error" role="alert">
        <h1>We could not load the settings.</h1>
        <p>{state.message} Check that <code>settings.json</code> is in the public folder and is valid JSON, then refresh.</p>
      </div>
    )
  }
  if (state.status === 'invalid') {
    return (
      <div className="boot boot--error" role="alert">
        <h1>settings.json needs fixing.</h1>
        <ul>{state.problems.map((p) => <li key={p}>{p}</li>)}</ul>
      </div>
    )
  }
  return <SettingsContext.Provider value={state.settings}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext)
}
