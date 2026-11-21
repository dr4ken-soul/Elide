import { SITE_LOGO_SRC } from '../lib/brand'
import { routeHref } from '../app/router'

export function Footer() {
  return (
    <footer className="border-t border-[var(--rule)] bg-[var(--bg-page)] px-6 py-10">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <img src={SITE_LOGO_SRC} alt="Elide" className="h-5 w-auto" />
          <p className="mt-2 max-w-[44ch] font-sans text-[12px] text-[var(--ink-muted)]">
            Built for #BuildHybridAI 2026. Inference by Firebase AI Logic, on-device through Gemini Nano, in the cloud through Gemini.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            { label: 'Ledger', href: routeHref('/ledger') },
            { label: 'Policy', href: routeHref('/policy') },
            { label: 'GitHub', href: 'https://github.com/dr4ken-soul/Elide' },
            { label: 'Rules', href: routeHref('/policy') },
          ].map((link) => (
            <a key={link.label} href={link.href} className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-secondary)] hover:text-[var(--accent)]">
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-[1180px] flex-wrap justify-between gap-3 border-t border-[var(--rule)] pt-5 font-mono text-[10.5px] text-[var(--ink-muted)]">
        <span>© 2026 Elide</span>
        <span>Apache-2.0 · Firebase AI Logic · App Check enforced</span>
      </div>
    </footer>
  )
}
