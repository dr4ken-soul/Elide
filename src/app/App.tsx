import { useEffect, useState } from 'react'
import { Footer } from '../components/Footer'
import { Toast } from '../components/Toast'
import { TopRail } from '../components/TopRail'
import { useSession } from '../lib/store/session'
import { Landing } from './Landing'
import { Ledger } from './Ledger'
import { Panel } from './Panel'
import { PolicyEditor } from './Policy'
import { navigate, routeHref, useRoute, type Route } from './router'
import { Workbench } from './Workbench'

const COMMANDS: Array<{ label: string; route: Route }> = [
  { label: 'Go to Playground', route: '/app' },
  { label: 'Go to Ledger', route: '/ledger' },
  { label: 'Go to Policy', route: '/policy' },
  { label: 'Go to Home', route: '/' },
]

export function App() {
  const route = useRoute()
  const { toast } = useSession()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
      if (event.key === 'Escape') setPaletteOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (route === '/panel') {
    return (
      <>
        <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[3] opacity-[0.6]" />
        <Panel />
        <Toast message={toast} />
      </>
    )
  }

  return (
    <>
      <a href="#main-content" className="sr-only z-60 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-[2px] focus:bg-[var(--ink)] focus:px-3 focus:py-2 focus:text-[var(--ink-inverse)]">Skip to content</a>
      <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[3] opacity-[0.6]" />
      <TopRail route={route} />
      <div id="main-content">
        {route === '/' && <Landing />}
        {route === '/app' && <Workbench />}
        {route === '/ledger' && <><Ledger /><Footer /></>}
        {route === '/policy' && <><PolicyEditor /><Footer /></>}
      </div>
      <Toast message={toast} />

      {paletteOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-[rgba(19,19,19,0.28)] pt-[14vh]" onClick={() => setPaletteOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Command palette" className="w-[380px] max-w-[92vw] rounded-[3px] border border-[var(--rule-strong)] bg-[var(--bg-surface)] p-2" onClick={(event) => event.stopPropagation()}>
            {COMMANDS.map((command) => (
              <a key={command.route} href={routeHref(command.route)} onClick={() => setPaletteOpen(false)} className="block rounded-[2px] px-3 py-2 font-sans text-[13px] hover:bg-[var(--bg-sunken)]">
                {command.label}
              </a>
            ))}
            <button type="button" onClick={() => { navigate('/app'); setPaletteOpen(false) }} className="hidden" aria-hidden="true" />
          </div>
        </div>
      )}
    </>
  )
}
