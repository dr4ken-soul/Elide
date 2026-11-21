const ROWS = [
  { type: 'NAME', original: 'Ada Lovelace', token: '⟦NAME_1⟧' },
  { type: 'ID', original: 'QQ123456C', token: '⟦ID_1⟧' },
  { type: 'ACCOUNT', original: '4111 1111 1111 1111', token: '⟦ACCT_1⟧' },
  { type: 'ADDRESS', original: '12 Baker Street', token: '⟦ADDR_1⟧' },
]

export function ManifestSpecimen() {
  return (
    <div className="overflow-hidden rounded-[3px] border border-[var(--rule)] bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--rule)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
        <span>Manifest 001</span>
        <span>4 withheld</span>
      </div>
      <dl>
        {ROWS.map((row) => (
          <div key={row.token} className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-[var(--rule)] px-3 py-2.5 last:border-0">
            <dt className="font-stamp text-[10px] uppercase tracking-[0.12em] text-[var(--mark)]">{row.type}</dt>
            <dd className="truncate font-sans text-[13px] text-[var(--ink-muted)] line-through decoration-[var(--accent)] decoration-1">{row.original}</dd>
            <dd className="font-mono text-[12px] text-[var(--accent)]">{row.token}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center justify-between border-t border-[var(--rule)] bg-[var(--bg-sunken)] px-3 py-2 font-mono text-[10px] text-[var(--ink-secondary)]">
        <span>Outbound payload</span>
        <span>0 identifiers</span>
      </div>
    </div>
  )
}
