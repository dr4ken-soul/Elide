import { useState } from 'react'
import { Switch } from '../components/Switch'
import { CATEGORY_LABELS } from '../lib/store/policy'
import { useSession } from '../lib/store/session'
import { ENTITY_TYPES, type EntityType, type PolicyConfig } from '../lib/scene/schema'

export function PolicyEditor() {
  const { policy, savePolicy, applyRemotePolicy, remoteAvailable, status } = useSession()
  const [draft, setDraft] = useState<PolicyConfig>(policy)
  const [adding, setAdding] = useState<EntityType | null>(null)
  const [term, setTerm] = useState('')

  function toggleType(type: EntityType): void {
    if (draft.mandatoryTypes.includes(type)) return
    setDraft((current) => ({
      ...current,
      enabledTypes: current.enabledTypes.includes(type)
        ? current.enabledTypes.filter((item) => item !== type)
        : [...current.enabledTypes, type],
    }))
  }

  function addTerm(type: EntityType): void {
    const clean = term.trim()
    if (!clean) return
    setDraft((current) => ({
      ...current,
      patternLibrary: type === 'CUSTOM'
        ? current.patternLibrary
        : { ...current.patternLibrary, [`${type}_CUSTOM_${Date.now()}`]: clean },
      customTerms: type === 'CUSTOM' ? [...current.customTerms, clean] : current.customTerms,
    }))
    setTerm('')
    setAdding(null)
  }

  return (
    <main className="mx-auto max-w-[860px] px-6 pb-28 pt-8">
      <h1 className="font-sans text-[24px] font-semibold tracking-[-0.02em]">Policy</h1>
      <p className="mt-1 font-sans text-[13px] text-[var(--ink-secondary)]">What counts as an identifier. Changes apply on this device only.</p>

      <div className="mt-6 space-y-3">
        {ENTITY_TYPES.map((type) => {
          const enabled = draft.enabledTypes.includes(type)
          const mandatory = draft.mandatoryTypes.includes(type)
          const patterns = Object.entries(draft.patternLibrary).filter(([key]) => key.startsWith(`${type}_`))
          return (
            <section key={type} className="rounded-[2px] border border-[var(--rule)] bg-[var(--bg-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--rule)] px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <Switch checked={enabled || mandatory} onChange={() => toggleType(type)} label={CATEGORY_LABELS[type]} small />
                  {mandatory && <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--mark)]">Mandatory</span>}
                </div>
                <span className="shrink-0 font-mono text-[10px] text-[var(--ink-muted)]">{`${patterns.length + (type === 'CUSTOM' ? draft.customTerms.length : 0) + (type === 'CONTACT' ? 2 : 0)} PATTERNS`}</span>
              </div>
              <div className="px-3 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {patterns.map(([key, value]) => (
                    <span key={key} className="max-w-[260px] truncate rounded-[2px] border border-[var(--rule)] bg-[var(--bg-sunken)] px-1.5 py-1 font-mono text-[11px] text-[var(--ink-secondary)]" title={value}>{value}</span>
                  ))}
                  {type === 'CUSTOM' && draft.customTerms.map((value) => (
                    <span key={value} className="max-w-[260px] truncate rounded-[2px] border border-[var(--rule)] bg-[var(--bg-sunken)] px-1.5 py-1 font-mono text-[11px] text-[var(--ink-secondary)]">{value}</span>
                  ))}
                  {adding === type ? (
                    <input
                      autoFocus
                      value={term}
                      onChange={(event) => setTerm(event.target.value)}
                      onKeyDown={(event) => { if (event.key === 'Enter') addTerm(type); if (event.key === 'Escape') setAdding(null) }}
                      onBlur={() => setAdding(null)}
                      placeholder="pattern or term"
                      aria-label={`New pattern for ${CATEGORY_LABELS[type]}`}
                      className="w-[180px] rounded-[2px] border border-[var(--rule-strong)] bg-[var(--bg-surface)] px-1.5 py-1 font-mono text-[11px] outline-none"
                    />
                  ) : (
                    <button type="button" onClick={() => setAdding(type)} className="rounded-[2px] border border-dashed border-[var(--rule-strong)] px-1.5 py-1 font-mono text-[11px] text-[var(--ink-muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]">add pattern</button>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--rule)] bg-[var(--bg-page)]/95 px-6 py-3 backdrop-blur-[2px]">
        <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10.5px] text-[var(--ink-secondary)]">{`Policy version ${draft.version} · stored on this device`}</p>
            {remoteAvailable && (
              <p className="mt-1 font-mono text-[10.5px] text-[var(--ink-secondary)]">
                A workspace policy is available. Applying it will replace your local patterns.{' '}
                <button type="button" onClick={applyRemotePolicy} className="underline decoration-[var(--rule-strong)] underline-offset-4 hover:decoration-[var(--ink)]">Apply</button>
              </p>
            )}
          </div>
          <button type="button" onClick={() => savePolicy(draft)} className="rounded-[2px] bg-[var(--ink)] px-4 py-2 font-sans text-[12px] text-[var(--ink-inverse)] hover:bg-black">Save policy</button>
        </div>
      </div>
      <p className="mt-4 font-mono text-[10px] text-[var(--ink-muted)]">Remote Config policy version: {status.remotePolicy?.policy_version ?? 'none'}</p>
    </main>
  )
}
