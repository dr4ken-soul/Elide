interface ProgressRuleProps {
  value: number
  label?: string
}

export function ProgressRule({ value, label = 'Progress' }: ProgressRuleProps) {
  const pct = Math.round(Math.max(0, Math.min(100, value)))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-[2px] w-full bg-[var(--rule)]"
    >
      <div className="h-full bg-[var(--ink)] transition-[width] duration-200 ease-linear" style={{ width: `${pct}%` }} />
    </div>
  )
}
