import { useEffect, useState } from 'react'

export type Route = '/' | '/app' | '/ledger' | '/policy' | '/panel'

const ROUTES: Route[] = ['/', '/app', '/ledger', '/policy', '/panel']

function readRoute(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  return ROUTES.includes(raw as Route) ? (raw as Route) : '/'
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
