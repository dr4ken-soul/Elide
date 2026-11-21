import { useState } from 'react'
import { SITE_LOGO_SRC, EXTENSION_LOGO_SRC } from '../lib/brand'
import { routeHref, type Route } from '../app/router'
import { useSession } from '../lib/store/session'
import { DeviceChip } from './DeviceChip'
import { DeviceSheet } from './DeviceSheet'

interface TopRailProps {
  route: Route
  compact?: boolean
  onLedger?: () => void
}

const TABS: Array<{ label: string; route: Route }> = [
  { label: 'Playground', route: '/app' },
  { label: 'Ledger', route: '/ledger' },
  { label: 'Policy', route: '/policy' },
]

export function TopRail({ route, compact = false, onLedger }: TopRailProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { status } = useSession()

  if (compact) {
    return (
      <>
        <header role="banner" className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b border-[var(--rule)] bg-[var(--bg-page)]/95 px-3 backdrop-blur-[2px]">
          <img src={EXTENSION_LOGO_SRC} alt="Elide" className="h-5 w-auto" />
          <div className="ml-auto flex items-center gap-2">
            <DeviceChip compact onClick={() => setSheetOpen(true)} />
            <button type="button" onClick={onLedger} className="rounded-[2px] border border-[var(--rule)] px-2 py-1 font-mono text-[11px] hover:border-[var(--ink)]">LEDGER</button>
          </div>
        </header>
        <DeviceSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      </>
    )
  }

  return (
    <>
      <header role="banner" className="sticky top-0 z-50 h-14 border-b border-[var(--rule)] bg-[var(--bg-page)]/95 backdrop-blur-[2px]">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-6 px-6">
          <a href={routeHref('/')} aria-label="Elide home" className="shrink-0"><img src={SITE_LOGO_SRC} alt="Elide" className="h-6 w-auto" /></a>
          <nav aria-label="Primary" className="ml-6 flex items-center gap-1">
            {TABS.map((tab) => {
              const active = route === tab.route
              return (
                <a
                  key={tab.route}
                  href={routeHref(tab.route)}
                  aria-current={active ? 'page' : undefined}
                  className={`border-b-2 px-3 py-1.5 font-sans text-[13px] font-medium transition-colors duration-[80ms] ${active ? 'border-[var(--ink)] text-[var(--ink)]' : 'border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink)]'}`}
                >
                  {tab.label}
                </a>
              )
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <DeviceChip onClick={() => setSheetOpen(true)} />
            <span className="flex h-8 items-center rounded-[2px] border border-[var(--rule)] bg-[var(--bg-surface)] px-3 font-sans text-[12px] font-medium" title={status.uid ?? 'Not signed in'}>
              {status.uid ? 'Anonymous' : 'Sign in'}
            </span>
          </div>
        </div>
      </header>
      <DeviceSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  )
}
