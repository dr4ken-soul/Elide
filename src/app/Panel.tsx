import { useState } from 'react'
import { AnswerPane } from '../components/AnswerPane'
import { EmptyState } from '../components/EmptyState'
import { EntityMirror } from '../components/EntityMirror'
import { TopRail } from '../components/TopRail'
import { SAMPLES } from '../lib/samples'
import { useSession } from '../lib/store/session'
import { Ledger } from './Ledger'

export function Panel() {
  const { text, question, spans, manifest, online, answerState, setText, setQuestion, loadSample, send, scan } = useSession()
  const [tab, setTab] = useState<'Compose' | 'Check'>('Compose')
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const withheld = manifest.length
  const canSend = Boolean(text.trim() && question.trim() && online && !answerState.sending)

  return (
    <main className="min-h-dvh bg-[var(--bg-page)]">
      <TopRail route="/panel" compact onLedger={() => setLedgerOpen(true)} />
      <div role="tablist" aria-label="Panel sections" className="grid grid-cols-2 border-b border-[var(--rule)]">
        {(['Compose', 'Check'] as const).map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={tab === item}
            type="button"
            onClick={() => setTab(item)}
            className={`h-9 font-sans text-[12px] ${tab === item ? 'bg-[var(--bg-surface)] text-[var(--ink)] shadow-[inset_0_-2px_0_var(--ink)]' : 'text-[var(--ink-muted)]'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'Compose' ? (
        <section className="px-3 py-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SAMPLES.map((sample) => (
              <button key={sample.id} type="button" onClick={() => loadSample(sample.id)} className="rounded-[2px] border border-[var(--rule)] bg-[var(--bg-surface)] px-2 py-1 font-mono text-[10.5px] hover:border-[var(--ink)]">{sample.label}</button>
            ))}
          </div>
          <div className="rounded-[3px] border border-[var(--rule)] bg-[var(--bg-surface)] p-3">
            {text ? (
              <EntityMirror value={text} spans={spans} onChange={setText} describedBy="panel-summary" />
            ) : (
              <EmptyState title="Nothing to check yet" body="Paste a document, or pick a sample." />
            )}
          </div>
          <label className="mt-3 block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">Question</span>
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={2} placeholder="Ask about this document" className="w-full resize-none rounded-[2px] border border-[var(--rule)] bg-[var(--bg-surface)] p-2 font-sans text-[13px] outline-none placeholder:text-[var(--ink-muted)]" />
          </label>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span id="panel-summary" className="min-w-0 truncate font-mono text-[10px] text-[var(--ink-secondary)]">{withheld ? `${withheld} withheld` : 'Nothing withheld'}{scan ? ` · ${scan.source}` : ''}</span>
            <button type="button" disabled={!canSend} onClick={() => { void send(); setTab('Check') }} className="shrink-0 rounded-[2px] bg-[var(--ink)] px-3 py-2 font-sans text-[12px] text-[var(--ink-inverse)] disabled:bg-[var(--bg-sunken)] disabled:text-[var(--ink-muted)]">Send</button>
          </div>
          {!online && <p className="mt-2 font-mono text-[10.5px] text-[var(--warn)]">Send needs a connection. Scrubbing still works.</p>}
        </section>
      ) : (
        <section className="h-[calc(100dvh-6.75rem)]"><AnswerPane /></section>
      )}

      {ledgerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg-page)]">
          <div className="flex h-12 items-center justify-between border-b border-[var(--rule)] px-3">
            <span className="font-stamp text-[10px] uppercase tracking-[0.2em]">Ledger</span>
            <button type="button" onClick={() => setLedgerOpen(false)} className="rounded-[2px] border border-[var(--rule)] px-2 py-1 font-mono text-[10px]">Close</button>
          </div>
          <Ledger />
        </div>
      )}
    </main>
  )
}
