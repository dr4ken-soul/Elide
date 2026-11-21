interface MonoLabelProps {
  children: React.ReactNode
  leadingRule?: boolean
  className?: string
}

export function MonoLabel({ children, leadingRule = false, className = '' }: MonoLabelProps) {
  return (
    <span className={`inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted)] ${className}`}>
      {leadingRule && <span className="h-px w-3 bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
}
