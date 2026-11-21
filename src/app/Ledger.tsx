import { useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { ProvenanceStamp } from '../components/ProvenanceStamp'
import { Switch } from '../components/Switch'
import { relativeTime } from '../lib/format'
import { useSession } from '../lib/store/session'
import type { Crossing } from '../lib/scene/schema'

export function Ledger() {
  const { crossings, clearLedger, exportLedger, setTeamLedger, teamLedger, status } = useSession()
  const [confirming, setConfirming] = useState(false)
  const [detail, setDetail] = useState<Crossing | null>(null)

  const withheld = crossings.reduce((total, entry) => total + entry.withheldCount, 0)
  const onDevice = crossings.filter((entry) => entry.scrubInference === 'ON_DEVICE').length

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-[24px] font-semibold tracking-[-0.02em]">Ledger</h1>
          <p className="mt-1 font-sans text-[13px] text-[var(--ink-secondary)]">Every crossing this browser made. Stored locally, exportable.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportLedger} className="rounded-[2px] border border-[var(--rule)] px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] hover:border-[var(--ink)]">Export JSON</button>
          <button type="button" onClick={() => setConfirming(true)} className="rounded-[2px] border border-[var(--rule)] px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--accent)] hover:border-[var(--accent)]">Clear ledger</button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap divide-x divide-[var(--rule)] border-y border-[var(--rule)] bg-[var(--bg-surface)] font-mono text-[12px]">
        {[`${crossings.length} CROSSINGS`, `${withheld} VALUES WITHHELD`, `${onDevice} RUN ON DEVICE`].map((figure) => (
          <span key={figure} className="px-4 py-3 text-[var(--ink-secondary)]">{figure}</span>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[2px] border border-[var(--rule)] bg-[var(--bg-surface)] px-3 py-2">
        <Switch checked={teamLedger} onChange={setTeamLedger} label="Opt in to the team ledger" small />
        <span className="font-mono text-[10.5px] text-[var(--ink-muted)]">
          {status.uid ? `Counts only · uid ${status.uid.slice(0, 8)}` : 'Sign in is required before team writes'}
        </span>
      </div>

      {crossings.length === 0 ? (
        <div className="rounded-[3px] border border-[var(--rule)] bg-[var(--bg-surface)]">
          <EmptyState title="Nothing has crossed yet." body="Send a document from the Playground." />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[3px] border border-[var(--rule)] bg-[var(--bg-surface)]">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="sticky top-14 z-20 bg-[var(--bg-surface)]">
              <tr className="border-b border-[var(--rule-strong)]">
                {['Time', 'Document', 'Withheld', 'Answered', 'Fallback', 'Entry'].map((heading) => (
                  <th key={heading} scope="col" className="px-3 py-2 text-left font-stamp text-[9.5px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crossings.map((entry) => (
                <tr key={entry.id} className="border-b border-[var(--rule)] hover:bg-[var(--bg-sunken)]/40">
                  <td className="px-3 py-2.5 font-mono text-[11.5px] text-[var(--ink-secondary)]" title={new Date(entry.createdAt).toISOString()}>{relativeTime(entry.createdAt)}</td>
                  <td className="max-w-[180px] truncate px-3 py-2.5 font-mono text-[11.5px] text-[var(--ink-secondary)]">{entry.documentTitle}</td>
                  <td className="px-3 py-2.5 font-mono text-[11.5px] text-[var(--ink-secondary)]" title={Object.entries(entry.byType).filter(([, count]) => count > 0).map(([type, count]) => `${type} ${count}`).join(', ')}>{entry.withheldCount}</td>
                  <td className="px-3 py-2.5"><ProvenanceStamp source={entry.answerInference} compact /></td>
                  <td className={`px-3 py-2.5 font-mono text-[11.5px] ${entry.scrubInference === 'IN_CLOUD' ? 'text-[var(--accent)]' : 'text-[var(--ink-secondary)]'}`}>{entry.scrubInference === 'IN_CLOUD' ? 'yes' : '--'}</td>
                  <td className="px-3 py-2.5"><button type="button" onClick={() => setDetail(entry)} className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--ink)] underline decoration-[var(--rule-strong)] underline-offset-4">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          title="Clear the ledger?"
          body="This removes every local crossing from this tab. It does not remove team ledger records already written."
          actionLabel="Clear ledger"
          onCancel={() => setConfirming(false)}
          onConfirm={() => { clearLedger(); setConfirming(false) }}
        />
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(19,19,19,0.28)]" onClick={() => setDetail(null)}>
          <aside role="dialog" aria-modal="true" aria-label="Crossing detail" className="h-full w-[460px] max-w-[92vw] overflow-y-auto border-l border-[var(--rule)] bg-[var(--bg-surface)] p-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
              <h2 className="font-stamp text-[10px] uppercase tracking-[0.2em]">Crossing detail</h2>
              <button type="button" onClick={() => setDetail(null)} className="rounded-[2px] border border-[var(--rule)] px-2 py-1 font-mono text-[10px]">Close</button>
            </div>
            <dl className="divide-y divide-[var(--rule)]">
              {(detail.manifest ?? []).map((entry) => (
                <div key={entry.token} className="grid grid-cols-[64px_1fr_auto] gap-2 py-2.5">
                  <dt className="font-stamp text-[10px] uppercase text-[var(--mark)]">{entry.type}</dt>
                  <dd className="truncate font-sans text-[13px] text-[var(--ink-secondary)]">{entry.original}</dd>
                  <dd className="font-mono text-[11px] text-[var(--accent)]">{entry.token}</dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-5 font-stamp text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">Exact outbound payload</h3>
            <pre className="mt-2 overflow-x-auto rounded-[2px] border border-[var(--rule)] bg-[var(--bg-sunken)] p-3 font-mono text-[11px] leading-[1.6]">{detail.outbound ?? 'Not available'}</pre>
          </aside>
        </div>
      )}
    </main>
  )
}
