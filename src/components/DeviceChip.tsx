import { useSession } from '../lib/store/session'

interface DeviceChipProps {
  onClick?: () => void
  compact?: boolean
}

export function DeviceChip({ onClick, compact = false }: DeviceChipProps) {
  const { device } = useSession()
  const label = device.availability === 'available' || (device.availability === 'downloading' && device.progress === 100)
    ? 'NANO READY'
    : device.initialising || device.availability === 'downloading'
      ? device.progress > 0 ? `NANO ${device.progress}%` : 'NANO STARTING'
      : 'NANO UNAVAILABLE'
  const dot = label === 'NANO READY'
    ? 'bg-[var(--ok)]'
    : label.startsWith('NANO STARTING') || label.startsWith('NANO ')
      ? 'bg-[var(--warn)]'
      : 'bg-[var(--ink-muted)]'

  const content = (
    <>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot} ${label === 'NANO STARTING' ? 'chip-initialising' : ''}`} aria-hidden="true" />
      <span>{compact ? 'NANO' : label}</span>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Device status: ${label}. Open device sheet.`}
        className="flex shrink-0 items-center gap-2 rounded-[2px] border border-[var(--rule)] bg-[var(--bg-surface)] px-2.5 py-1.5 font-mono text-[11px] text-[var(--ink-secondary)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
      >
        {content}
      </button>
    )
  }
  return <span className="flex items-center gap-2 font-mono text-[11px] text-[var(--ink-secondary)]">{content}</span>
}
