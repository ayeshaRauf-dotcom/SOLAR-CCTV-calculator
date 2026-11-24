import { useEffect } from 'react'
import { Router, useRouter } from './router.jsx'
import { SettingsProvider } from './hooks/useSettings.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import SampleNotice from './components/SampleNotice.jsx'
import Home from './pages/Home.jsx'
import SolarPage from './pages/SolarPage.jsx'
import CCTVPage from './pages/CCTVPage.jsx'
import EmbedPage from './pages/EmbedPage.jsx'
import NotFound from './pages/NotFound.jsx'

function Routes() {
  const { path, hash, nonce } = useRouter()

  // Scroll to the section in the link, or to the top on a new page.
  useEffect(() => {
    if (path.startsWith('/embed/')) return
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [path, hash, nonce])

  if (path === '/embed/solar') return <EmbedPage kind="solar" />
  if (path === '/embed/cctv') return <EmbedPage kind="cctv" />

  let page
  if (path === '/') page = <Home />
  else if (path === '/solar') page = <SolarPage />
  else if (path === '/cctv') page = <CCTVPage />
  else page = <NotFound />

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <SampleNotice />
      <Navbar />
      <main id="main">{page}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Router>
      <SettingsProvider>
        <Routes />
      </SettingsProvider>
    </Router>
  )
}
