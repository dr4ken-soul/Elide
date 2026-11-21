import { useEffect, useState } from 'react'
import { AnswerPane } from '../components/AnswerPane'
import { DeviceChip } from '../components/DeviceChip'
import { DeviceSheet } from '../components/DeviceSheet'
import { EmptyState } from '../components/EmptyState'
import { EntityMirror } from '../components/EntityMirror'
import { ProgressRule } from '../components/ProgressRule'
import { SAMPLES } from '../lib/samples'
import { useSession } from '../lib/store/session'
import { routeHref } from './router'

export function Workbench() {
  const {
    text, title, question, spans, manifest, scan, scanning, online, answerState, setText, setTitle,
    setQuestion, loadSample, send, prepare, policy, device,
  } = useSession()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [mobileAnswer, setMobileAnswer] = useState(false)
  const withheld = manifest.length
  const flagged = manifest.filter((item) => item.confidence === 'low').length
  const canSend = Boolean(text.trim() && question.trim() && online && !answerState.sending && !scanning)
  const summary = withheld === 0 ? 'Nothing withheld' : `${withheld} withheld · ${flagged} flagged`
  const nanoReady = device.availability === 'available'

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && canSend) {
        event.preventDefault()
        void send()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canSend, send])

  return (
    <main className="flex h-[calc(100dvh-3.5rem)] overflow-hidden bg-[var(--bg-page)]">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-[var(--rule)] bg-[var(--bg-device)] lg:flex" aria-label="Documents">
        <div className="flex h-11 items-center justify-between border-b border-[var(--rule)] px-3">
          <span className="font-stamp text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">Documents</span>
          <button type="button" aria-label="New document" onClick={() => { setTitle(''); setText(''); setQuestion('') }} className="flex h-6 w-6 items-center justify-center rounded-[2px] border border-[var(--rule)] text-[var(--ink-secondary)] hover:border-[var(--ink)] hover:text-[var(--ink)]">
            <span className="relative block h-2.5 w-2.5"><span className="absolute left-1/2 top-0 h-2.5 w-px -translate-x-1/2 bg-current" /><span className="absolute left-0 top-1/2 h-px w-2.5 -translate-y-1/2 bg-current" /></span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-0.5 border-b border-[var(--rule)] bg-[var(--bg-surface)] px-3 py-2.5 shadow-[inset_2px_0_0_var(--ink)]">
            <span className="truncate font-sans text-[13px] font-medium text-[var(--ink)]">{title || 'Untitled document'}</span>
            <span className="font-mono text-[10px] text-[var(--ink-muted)]">{`${withheld} IDENTIFIERS · just now`}</span>
          </div>
          {SAMPLES.map((sample) => (
            <button key={sample.id} type="button" onClick={() => loadSample(sample.id)} className="flex flex-col gap-0.5 border-b border-[var(--rule)] px-3 py-2.5 text-left hover:bg-[var(--bg-surface)]">
              <span className="truncate font-sans text-[13px] font-medium text-[var(--ink)]">{sample.title}</span>
              <span className="font-mono text-[10px] text-[var(--ink-muted)]">SAMPLE · {sample.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
        <div className="flex h-10 items-center border-t border-[var(--rule)] px-3 font-mono text-[10px] text-[var(--ink-muted)]">LOCAL ONLY · NOT SYNCED</div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col" aria-label="Compose">
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--rule)] px-4">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-label="Document title"
            placeholder="Untitled document"
            className="min-w-0 flex-1 bg-transparent font-sans text-[13px] font-medium outline-none placeholder:text-[var(--ink-muted)]"
          />
          <DeviceChip onClick={() => setSheetOpen(true)} />
          <a href={routeHref('/policy')} className="h-7 shrink-0 rounded-[2px] border border-[var(--rule)] px-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--ink-secondary)] hover:border-[var(--ink)] hover:text-[var(--ink)]">
            Policy · {policy.version}
          </a>
        </div>

        <div className={`min-h-0 flex-1 overflow-y-auto ${answerState.sending ? 'border-r-2' : 'border-r'} border-[var(--rule-ink)]`}>
          <div className="mx-auto max-w-[720px] px-6 py-6">
            {text.length === 0 ? (
              <EmptyState title="Nothing to check yet" body="Paste a document, or pick a sample.">
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {SAMPLES.map((sample) => (
                    <button key={sample.id} type="button" onClick={() => loadSample(sample.id)} className="rounded-[2px] border border-[var(--rule)] bg-[var(--bg-surface)] px-2.5 py-1.5 font-mono text-[11px] hover:border-[var(--ink)]">{sample.label}</button>
                  ))}
                </div>
              </EmptyState>
            ) : (
              <EntityMirror
                value={text}
                spans={withheld > 0 ? spans : []}
                onChange={setText}
                onGesture={() => { if (!nanoReady && device.availability !== 'downloading') void prepare() }}
                scanning={scanning}
                describedBy="crossing-summary"
              />
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-[var(--rule)] bg-[var(--bg-surface)]">
          <div className="mx-auto max-w-[720px] px-6 py-3">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={2}
              aria-label="Question"
              placeholder="Ask about this document"
              className="w-full resize-none bg-transparent font-sans text-[14px] leading-[1.6] outline-none placeholder:text-[var(--ink-muted)]"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p id="crossing-summary" aria-live="polite" className="truncate font-mono text-[10.5px] text-[var(--ink-secondary)]">
                  {!nanoReady ? `${summary} · marks appear after send` : summary}
                </p>
                {scan && <p className="truncate font-mono text-[10px] text-[var(--ink-muted)]">{scan.source} · {Math.round(scan.ms)} ms</p>}
                {!online && <p className="font-mono text-[10.5px] text-[var(--warn)]">Send needs a connection. Scrubbing still works.</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {answerState.sending && <div className="w-12"><ProgressRule value={60} label="Sending" /></div>}
                <button
                  type="button"
                  disabled={!canSend}
                  onClick={() => { void send(); setMobileAnswer(true) }}
                  className="rounded-[2px] bg-[var(--ink)] px-4 py-2 font-sans text-[12px] font-medium text-[var(--ink-inverse)] hover:bg-black disabled:bg-[var(--bg-sunken)] disabled:text-[var(--ink-muted)]"
                >
                  {answerState.sending ? 'Sending' : scanning ? 'Scanning' : 'Send'}
                </button>
                <button type="button" onClick={() => setMobileAnswer(true)} className="rounded-[2px] border border-[var(--rule)] px-2 py-2 font-mono text-[10px] uppercase xl:hidden">Answer</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hidden w-[420px] shrink-0 border-l border-[var(--rule-ink)] bg-[var(--bg-surface)] xl:flex" aria-label="Answer pane">
        <AnswerPane />
      </section>

      {mobileAnswer && (
        <div className="fixed inset-0 z-50 flex items-end bg-[rgba(19,19,19,0.28)] xl:hidden" onClick={() => setMobileAnswer(false)}>
          <div className="h-[70dvh] w-full overflow-hidden rounded-t-[3px] border-t border-[var(--rule-strong)] bg-[var(--bg-surface)]" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto my-2 h-1 w-10 rounded-full bg-[var(--rule-strong)]" />
            <div className="h-[calc(100%-1.5rem)]"><AnswerPane onClose={() => setMobileAnswer(false)} /></div>
          </div>
        </div>
      )}

      <DeviceSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </main>
  )
}
