import { useEffect, useRef, useState, type ReactNode } from 'react'
import { scrub } from '../lib/ai/scrub'
import { mask } from '../lib/scrub/mask'
import { scrubLabel } from '../lib/format'
import { SAMPLES } from '../lib/samples'
import { useSession } from '../lib/store/session'
import type { ManifestEntry, Span } from '../lib/scene/schema'
import { Switch } from './Switch'

const DEFAULT_TEXT = SAMPLES[0]?.text ?? 'Patient Ada Lovelace, record QQ123456C.'

function highlight(text: string, spans: Span[]): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0
  for (const span of [...spans].sort((left, right) => left.start - right.start)) {
    if (span.start < cursor || span.end > text.length) continue
    nodes.push(text.slice(cursor, span.start))
    nodes.push(<mark key={`${span.start}-${span.end}`} className="entity" data-type={span.type.toLowerCase()}>{text.slice(span.start, span.end)}</mark>)
    cursor = span.end
  }
  nodes.push(text.slice(cursor))
  return nodes
}

function tokenise(redacted: string, manifest: ManifestEntry[]): ReactNode[] {
  const tokens = new Set(manifest.map((entry) => entry.token))
  return redacted.split(/(⟦[A-Z]+_\d+⟧)/g).map((piece, index) =>
    tokens.has(piece)
      ? <span key={index} className="inline-block rounded-[2px] bg-[var(--accent-wash)] px-1 font-mono text-[12px] text-[var(--accent)]">{piece}</span>
      : piece,
  )
}

export function CrossingPanes() {
  const { policy } = useSession()
  const [text, setText] = useState(DEFAULT_TEXT)
  const [sample, setSample] = useState('clinic')
  const [live, setLive] = useState(true)
  const [spans, setSpans] = useState<Span[]>([])
  const [map, setMap] = useState<ManifestEntry[]>([])
  const [redacted, setRedacted] = useState(DEFAULT_TEXT)
  const [source, setSource] = useState<'ON_DEVICE' | 'IN_CLOUD' | 'RULES_ONLY'>('RULES_ONLY')
  const [ms, setMs] = useState(0)
  const [sweeping, setSweeping] = useState(false)
  const sweepTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(async () => {
      setSweeping(true)
      window.clearTimeout(sweepTimer.current)
      sweepTimer.current = window.setTimeout(() => setSweeping(false), 260)
      const result = await scrub(text, policy)
      if (!active) return
      const masked = mask(text, result.spans)
      setSpans(result.spans)
      setMap(masked.map)
      setRedacted(live ? masked.redacted : text)
      setSource(result.source)
      setMs(result.ms)
    }, 400)
    return () => { active = false; window.clearTimeout(timer) }
  }, [text, policy, live])

  useEffect(() => () => window.clearTimeout(sweepTimer.current), [])

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <p className="mb-4 font-stamp text-[10px] uppercase tracking-[0.24em] text-[var(--mark)]">Try it on this text</p>
        <h2 className="max-w-[18ch] font-sans text-[26px] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--ink)] md:text-[30px]">
          The same sentence, on both sides of the line.
        </h2>
        <p className="mt-4 max-w-[38ch] font-sans text-[14px] leading-[1.65] text-[var(--ink-secondary)]">
          This runs on your machine now. If Nano is not ready it borrows the cloud for the scrub pass and says so above the result.
        </p>
        <div className="mt-6"><Switch checked={live} onChange={setLive} label="Live crossing" /></div>
        <div className="mt-6 flex flex-wrap gap-2">
          {SAMPLES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={sample === item.id}
              onClick={() => { setSample(item.id); setText(item.text) }}
              className={`rounded-[2px] border px-2.5 py-1.5 font-mono text-[11px] transition-colors duration-[80ms] ${sample === item.id ? 'border-[var(--ink)] text-[var(--ink)]' : 'border-[var(--rule)] bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:border-[var(--ink)]'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="mt-6 block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">Your sentence</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-[2px] border border-[var(--rule)] bg-[var(--bg-surface)] p-3 font-sans text-[13px] leading-[1.6] outline-none focus:border-[var(--ink)]"
          />
        </label>
      </div>

      <div className="lg:col-span-8">
        <div className="grid grid-cols-1 overflow-hidden rounded-[3px] border border-[var(--rule)] bg-[var(--bg-surface)] md:grid-cols-2">
          <div className="relative min-h-[260px] border-b border-[var(--rule)] p-4 md:border-b-0 md:border-l-0">
            {sweeping && <div className="sweep-bar pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-[2px] bg-[var(--mark)] opacity-50" aria-hidden="true" />}
            <div className="mb-3 flex items-baseline justify-between border-b border-[var(--rule)] pb-2">
              <span className="font-stamp text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">On this device</span>
            </div>
            <p className="whitespace-pre-wrap font-sans text-[14px] leading-[1.7] text-[var(--ink)]">{highlight(text, spans)}</p>
          </div>
          <div className="min-h-[260px] border-l border-[var(--rule-ink)] p-4">
            <div className="mb-3 flex items-baseline justify-between border-b border-[var(--rule)] pb-2">
              <span className="font-stamp text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">Sent to the cloud</span>
            </div>
            <p className="whitespace-pre-wrap font-sans text-[14px] leading-[1.7] text-[var(--ink)]">{tokenise(redacted, map)}</p>
          </div>
          <div className="col-span-1 flex items-center justify-between border-t border-[var(--rule)] bg-[var(--bg-surface)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-secondary)] md:col-span-2">
            <span>{scrubLabel(source, ms)}</span>
            <button
              type="button"
              onClick={() => { void setText((current) => `${current} `); window.setTimeout(() => setText((current) => current.trimEnd()), 20) }}
              className="rounded-[2px] border border-[var(--rule)] px-2 py-1 text-[10px] hover:border-[var(--ink)]"
            >
              Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
