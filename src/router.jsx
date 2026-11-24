// A very small client-side router (History API). No extra dependency needed for 5 routes.
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const RouterContext = createContext(null)

function normalize(pathname) {
  const p = pathname.replace(/\/+$/, '')
  return p === '' ? '/' : p
}

function read() {
  return { path: normalize(window.location.pathname), hash: window.location.hash }
}

export function Router({ children }) {
  const [loc, setLoc] = useState(() => ({ ...read(), nonce: 0 }))

  useEffect(() => {
    const onPop = () => setLoc((l) => ({ ...read(), nonce: l.nonce + 1 }))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to) => {
    const url = new URL(to, window.location.origin)
    window.history.pushState({}, '', url.pathname + url.search + url.hash)
    setLoc((l) => ({ ...read(), nonce: l.nonce + 1 }))
  }, [])

  return <RouterContext.Provider value={{ ...loc, navigate }}>{children}</RouterContext.Provider>
}

export function useRouter() {
  return useContext(RouterContext)
}

export function Link({ to, onClick, children, ...rest }) {
  const { navigate } = useRouter()
  const handle = (e) => {
    if (onClick) onClick(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') return
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
