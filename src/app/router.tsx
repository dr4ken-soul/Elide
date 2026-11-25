import { useEffect, useState } from 'react'

export type Route = '/' | '/app' | '/ledger' | '/policy' | '/panel'

const ROUTES: Route[] = ['/', '/app', '/ledger', '/policy', '/panel']

function isPanelDocument(): boolean {
  return window.location.pathname.toLowerCase().endsWith('sidepanel.html')
}

export function readRoute(): Route {
  const fallback: Route = isPanelDocument() ? '/panel' : '/'
  const raw = window.location.hash.replace(/^#/, '') || fallback
  return ROUTES.includes(raw as Route) ? (raw as Route) : fallback
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute)
  useEffect(() => {
    const onChange = (): void => setRoute(readRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function navigate(route: Route): void {
  window.location.hash = `#${route}`
}

export function routeHref(route: Route): string {
  return `#${route}`
}
