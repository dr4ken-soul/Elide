import type { InferenceSource } from '../lib/scene/schema'

interface ProvenanceStampProps {
  source: InferenceSource
  compact?: boolean
}

export function ProvenanceStamp({ source, compact = false }: ProvenanceStampProps) {
  const onDevice = source === 'ON_DEVICE'
  const rulesOnly = source === 'RULES_ONLY'
  const className = onDevice
    ? 'border-[var(--mark)] bg-[var(--mark-wash)] text-[var(--mark)]'
    : rulesOnly
      ? 'border-[var(--rule-strong)] bg-[var(--bg-sunken)] text-[var(--ink-secondary)]'
      : 'border-[var(--accent)] bg-[var(--accent-wash)] text-[var(--accent)]'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-1 font-stamp uppercase ${compact ? 'text-[9px]' : 'text-[9.5px]'} tracking-[0.16em] ${className} ${onDevice ? 'stamp-on-device -rotate-2' : ''}`}
      title={source}
    >
      {onDevice ? 'Answered on device' : rulesOnly ? 'Rules only' : 'Answered in cloud'}
    </span>
  )
}
