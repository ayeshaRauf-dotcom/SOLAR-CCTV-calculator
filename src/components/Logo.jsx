import { useState } from 'react'
import { useSettings } from '../hooks/useSettings.jsx'

export default function Logo() {
  const { company } = useSettings()
  const [broken, setBroken] = useState(false)
  return (
    <span className="logo">
      {company.logoUrl && !broken ? (
        <img className="logo__img" src={company.logoUrl} alt="" width="36" height="36" onError={() => setBroken(true)} />
      ) : (
        <span className="logo__fallback" aria-hidden="true" />
      )}
      <span className="logo__name">{company.name}</span>
    </span>
  )
}
