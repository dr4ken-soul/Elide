import { useState } from 'react'
import { motion } from 'motion/react'
import { CrossingPanes } from '../components/CrossingPanes'
import { Footer } from '../components/Footer'
import { ManifestSpecimen } from '../components/ManifestSpecimen'
import { routeHref } from '../app/router'

const REPO_URL = 'https://github.com/dr4ken-soul/Elide'

const HONEST_CLAIM = 'Elide removes identifiers from text before it is sent to a cloud model, and restores them afterwards. It cannot guarantee that no re-identification is possible, because prose can imply identity without naming it. It does not control what the remote provider retains. It is a reduction in exposure, applied before the request, not a guarantee of anonymity.'

const LIMITS = [
  ['An identifier Elide has never seen', '→ the manifest shows it was not withheld, and you can add the pattern.'],
  ['Images and PDFs', '→ the on-device pass handles text only. Files are flagged, never auto-sent.'],
  ['Meaning that hides in plain prose', '→ a description can re-identify someone. The warning stays visible.'],
  ["The remote model's own retention", '→ Elide cannot control a server it does not run. It only controls what arrives.'],
]

const STEPS = [
  {
    number: '01',
    title: 'Declare',
    copy: 'A single structured call to Gemini Nano returns every identifier it can find as JSON: type, exact span, replacement token. It runs on the tab, in a few hundred milliseconds, with no network request.',
    artifact: 'type: "object"\nspans: [{ type, start, end,\n  token, confidence }]\nrequired: ["spans"]',
  },
  {
    number: '02',
    title: 'Cross',
    copy: 'Only the rewritten text is sent. The cloud model answers questions about the document without ever receiving a name, a record number or an address.',
    artifact: 'POST /generateContent\n842 bytes → 611 bytes\n0 originals in payload',
  },
  {
    number: '03',
    title: 'Restore',
    copy: 'Tokens are matched back to their originals on the device. The answer reads normally, and the ledger records exactly what was withheld.',
    artifact: '⟦NAME_1⟧ → Ada Lovelace\n⟦ID_1⟧   → QQ123456C\nrestored locally, not logged',
  },
]

const entrance = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.24, ease: [0.2, 0, 0, 1] as [number, number, number, number] },
}

export function Landing() {
  return (
    <main>
      <section className="relative min-h-[calc(100dvh-3.5rem)] overflow-hidden bg-[var(--bg-page)] px-6 pb-20 pt-16">
        <div className="absolute bottom-0 left-1/2 top-0 z-30 hidden w-px origin-top scale-y-0 bg-[var(--rule-ink)] lg:block [animation:border-draw_480ms_var(--ease-out)_50ms_forwards]" aria-hidden="true" />
        <style>{'@keyframes border-draw { to { transform: scaleY(1) } }'}</style>
        <div className="relative z-10 mx-auto grid max-w-[1180px] grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-6 lg:pr-16">
            <motion.p {...entrance} className="mb-7 font-stamp text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--mark)]">
              On-device scrubbing · Cloud answers
            </motion.p>
            <motion.h1 {...entrance} className="max-w-[15ch] font-sans text-[clamp(2.25rem,5.2vw,4.25rem)] font-semibold leading-[0.96] tracking-[-0.03em] text-[var(--ink)]">
              Send the question. Not the client.
            </motion.h1>
            <motion.p {...entrance} transition={{ ...entrance.transition, delay: 0.12 }} className="mt-6 max-w-[42ch] font-sans text-[16px] leading-[1.6] text-[var(--ink-secondary)]">
              Elide rewrites what you type into a manifest. Names, records and account numbers are replaced on your device before the request leaves, then put back into the answer when it returns.
            </motion.p>
            <motion.div {...entrance} transition={{ ...entrance.transition, delay: 0.18 }} className="mt-9 flex flex-wrap items-center gap-3">
              <a href={REPO_URL} className="rounded-[2px] bg-[var(--ink)] px-5 py-3 font-sans text-[13px] font-medium tracking-[0.01em] text-[var(--ink-inverse)] hover:bg-black">Add to Chrome</a>
              <a href={routeHref('/app')} className="rounded-[2px] border border-[var(--rule-strong)] px-5 py-3 font-sans text-[13px] text-[var(--ink)] hover:border-[var(--ink)]">Open the web app</a>
            </motion.div>
            <motion.p {...entrance} transition={{ ...entrance.transition, delay: 0.24 }} className="mt-4 font-mono text-[11px] text-[var(--ink-muted)]">
              No account. No server-side history. The manifest stays in the tab.
            </motion.p>
          </div>
          <motion.div {...entrance} transition={{ ...entrance.transition, delay: 0.3 }} className="mt-14 lg:col-span-6 lg:mt-0 lg:pl-16">
            <p className="mb-3 font-stamp text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">The crossing</p>
            <ManifestSpecimen />
          </motion.div>
        </div>
        <p className="absolute bottom-6 left-6 hidden max-w-[22ch] text-right font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink-muted)] lg:block">
          This side never leaves the device
        </p>
        <p className="absolute bottom-6 right-10 hidden font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink-muted)] lg:block">
          This side is the cloud
        </p>
      </section>

      <section className="border-y border-[var(--rule)] bg-[var(--bg-sunken)]/60 px-6 py-24 md:py-28">
        <div className="mx-auto max-w-[1180px]"><CrossingPanes /></div>
      </section>

      <section className="bg-[var(--bg-page)] px-6 py-24 md:py-32">
        <div className="mx-auto mb-14 grid max-w-[1180px] grid-cols-1 items-baseline gap-4 lg:grid-cols-12">
          <p className="font-stamp text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)] lg:col-span-3">How it works</p>
          <h2 className="max-w-[26ch] font-sans text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.06] tracking-[-0.025em] lg:col-span-9">
            Three calls. One of them never leaves the machine.
          </h2>
        </div>
        <div className="mx-auto max-w-[1180px] divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
          {STEPS.map((step, index) => (
            <motion.div {...entrance} transition={{ ...entrance.transition, delay: index * 0.06 }} key={step.number} className="grid grid-cols-1 gap-6 py-8 hover:bg-[var(--bg-sunken)]/40 lg:grid-cols-12">
              <span className="font-mono text-[11px] text-[var(--ink-muted)] lg:col-span-1">{step.number}</span>
              <div className="lg:col-span-5">
                <h3 className="font-sans text-[17px] font-semibold">{step.title}</h3>
                <p className="mt-2 max-w-[40ch] font-sans text-[14px] leading-[1.65] text-[var(--ink-secondary)]">{step.copy}</p>
              </div>
              <pre tabIndex={0} className="overflow-x-auto rounded-[2px] border border-[var(--rule)] bg-[var(--bg-surface)] p-3 font-mono text-[11.5px] leading-[1.7] text-[var(--ink-secondary)] lg:col-span-6">{step.artifact}</pre>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--rule)] bg-[var(--bg-sunken)] px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="mb-4 font-stamp text-[10px] uppercase tracking-[0.24em] text-[var(--accent)]">What this does not do</p>
            <h2 className="max-w-[20ch] font-sans text-[26px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[30px]">Four honest limits.</h2>
          </div>
          <div className="divide-y divide-[var(--rule)] border-y border-[var(--rule)] lg:col-span-8">
            {LIMITS.map(([lead, tail]) => (
              <div key={lead} className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-4">
                <p className="font-sans text-[14px] font-medium text-[var(--ink)]">{lead}</p>
                <p className="max-w-[34ch] text-right font-sans text-[13px] text-[var(--ink-secondary)]">{tail}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-[900px] border-l-2 border-[var(--rule-strong)] pl-4 font-sans text-[13px] leading-[1.65] text-[var(--ink-secondary)]">{HONEST_CLAIM}</p>
      </section>

      <section className="bg-[var(--bg-page)] px-6 py-28 md:py-36">
        <div className="mx-auto max-w-[680px]">
          <h2 className="font-sans text-[clamp(1.9rem,3.6vw,2.75rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
            Add Elide once. Use it everywhere you were already pasting.
          </h2>
          <p className="mt-4 max-w-[46ch] font-sans text-[15px] leading-[1.65] text-[var(--ink-secondary)]">
            It opens as a side panel on any tab. Compose once, then send the scrubbed version to whichever assistant you already pay for.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={REPO_URL} className="rounded-[2px] bg-[var(--accent)] px-5 py-3 font-sans text-[13px] font-medium text-[var(--accent-ink)] hover:bg-[var(--accent-hover)]">Add to Chrome</a>
            <span className="font-mono text-[12px] text-[var(--ink-secondary)] underline decoration-[var(--rule-strong)] underline-offset-4">chrome://extensions → Load unpacked</span>
          </div>
          <CopySnippet value={REPO_URL} />
        </div>
      </section>
      <Footer />
    </main>
  )
}

function CopySnippet({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="mt-8 flex items-center justify-between gap-3 rounded-[3px] border border-[var(--rule)] bg-[var(--bg-surface)] px-4 py-3 font-mono text-[11.5px] text-[var(--ink-secondary)]">
      <span className="min-w-0 truncate">{value}</span>
      <button
        type="button"
        onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }}
        className="shrink-0 border-b border-[var(--rule-strong)] text-[10.5px] uppercase tracking-[0.12em] hover:border-[var(--ink)]"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
