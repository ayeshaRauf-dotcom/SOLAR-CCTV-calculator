import { useSettings } from '../hooks/useSettings.jsx'

// Shown while settings.json still holds sample prices. Turn off with "showSampleBanner": false.
export default function SampleNotice() {
  const s = useSettings()
  if (!s.showSampleBanner) return null
  return <div className="sample-notice" role="note">{s.settingsNotice}</div>
}
