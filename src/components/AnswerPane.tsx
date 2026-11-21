import type { ReactNode } from 'react'
import type { RestoreResult } from '../lib/scrub/restore'
import { useSession } from '../lib/store/session'
import { ProvenanceStamp } from './ProvenanceStamp'

interface AnswerPaneProps {
  onClose?: () => void
}

function restoredNodes(text: string, result: RestoreResult): ReactNode[] {
  const nodes: ReactNode[] = []
  const sorted = [...result.restored].sort((left, right) => left.start - right.start)
  let cursor = 0
  for (const range of sorted) {
    if (range.start < cursor) continue
    nodes.push(text.slice(cursor, range.start))
    nodes.push(
      <span key={`${range.token}-${range.start}`} className="restored-value border-b border-dotted border-[var(--accent)] px-0.5 font-sans text-[13.5px] text-[var(--accent)]" title={`Restored on device from ${range.token}`}>
        {range.original}
      </span>,
    )
    cursor = range.end
  }
  nodes.push(text.slice(cursor))
  return nodes
}

export function AnswerPane({ onClose }: AnswerPaneProps) {
  const { answerState, showToast, crossings } = useSession()
  const { stream, result, source, error, sending, unknownTokens } = answerState
  const text = result?.text ?? stream
  const lastEntry = crossings[0]

  const copy = async (value: string): Promise<void> => {
    await navigator.clipboard.writeText(value)
    showToast('Copied.')
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-[var(--bg-surface)]" aria-label="Answer">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--rule)] px-4">
        <span className="font-stamp text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">Answer</span>
        <div className="flex items-center gap-2">
          {source && <ProvenanceStamp source={source} compact />}
          {onClose && (
            <button type="button" onClick={onClose} className="rounded-[2px] border border-[var(--rule)] px-2 py-1 font-mono text-[10px] hover:border-[var(--ink)]">
              Close answer
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {error ? (
          <div role="alert" className="border-l-2 border-[var(--accent)] pl-3">
            <p className="font-sans text-[14px] leading-[1.7] text-[var(--ink)]">{error}</p>
          </div>
        ) : sending && !text ? (
          <div className="space-y-2" aria-label="Waiting for answer">
            <div className="skeleton h-3 w-full rounded-[1px]" />
            <div className="skeleton h-3 w-4/5 rounded-[1px]" />
            <div className="skeleton h-3 w-2/3 rounded-[1px]" />
          </div>
        ) : text ? (
          <p className="whitespace-pre-wrap font-sans text-[14px] leading-[1.7] text-[var(--ink)]">
            {result ? restoredNodes(text, result) : text}
          </p>
        ) : (
          <p className="font-sans text-[13px] text-[var(--ink-muted)]">Ask a question and the answer will appear here with its provenance stamp.</p>
        )}

        {unknownTokens && unknownTokens.length > 0 && (
          <p className="mt-4 border-t border-[var(--rule)] pt-3 font-mono text-[11px] text-[var(--warn)]">
            {`No local record for ${unknownTokens.join(', ')}. Shown exactly as returned.`}
          </p>
        )}
        {result && result.restored.length === 0 && (
          <p className="mt-4 border-t border-[var(--rule)] pt-3 font-mono text-[11px] text-[var(--ink-muted)]">No token was restored. The answer is shown as returned.</p>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-[var(--rule)] px-4 py-2.5">
        <span className="font-mono text-[10px] text-[var(--ink-muted)]">{lastEntry ? `Ledger entry #${lastEntry.id.slice(0, 4).toUpperCase()}` : 'Ledger entry —'}</span>
        <div className="flex gap-2">
          <button type="button" disabled={!text} onClick={() => { void copy(text) }} className="rounded-[2px] border border-[var(--rule)] px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] hover:border-[var(--ink)] disabled:opacity-40">Copy</button>
          <button type="button" disabled={!crossings[0]?.outbound} onClick={() => { void copy(crossings[0]?.outbound ?? '') }} className="rounded-[2px] border border-[var(--rule)] px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] hover:border-[var(--ink)] disabled:opacity-40">Copy redacted</button>
        </div>
      </div>
    </section>
  )
}
