interface EmptyStateProps {
  title: string
  body: string
  children?: React.ReactNode
}

export function EmptyState({ title, body, children }: EmptyStateProps) {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 px-6 text-center">
      <span className="mb-1 h-px w-8 bg-[var(--rule-strong)]" aria-hidden="true" />
      <p className="font-sans text-[14px] font-medium text-[var(--ink)]">{title}</p>
      <p className="max-w-[36ch] font-sans text-[12.5px] text-[var(--ink-muted)]">{body}</p>
      {children}
    </div>
  )
}
