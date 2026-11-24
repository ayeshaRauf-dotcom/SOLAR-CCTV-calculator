import { useEffect, useState } from 'react'
import { Link, useRouter } from '../router.jsx'
import Logo from './Logo.jsx'
import Icon from './Icon.jsx'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/solar', label: 'Solar Calculator' },
  { to: '/cctv', label: 'CCTV Quote' },
  { to: '/#contact', label: 'Contact' },
]

export default function Navbar() {
  const { path, hash } = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (to) => (to === '/#contact' ? path === '/' && hash === '#contact' : to === '/' ? path === '/' && hash !== '#contact' : path === to)

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="Home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} size={24} />
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
        <nav id="main-nav" aria-label="Main" className={`navbar__nav${open ? ' is-open' : ''}`}>
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="navbar__link" aria-current={isActive(l.to) ? 'page' : undefined} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
