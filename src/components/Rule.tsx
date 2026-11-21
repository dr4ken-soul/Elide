interface RuleProps {
  orientation?: 'horizontal' | 'vertical'
  emphasis?: boolean
  className?: string
}

export function Rule({ orientation = 'horizontal', emphasis = false, className = '' }: RuleProps) {
  return (
    <div
      role="separator"
      className={`${orientation === 'vertical' ? 'w-px h-full bg-[var(--rule-ink)]' : `h-px w-full ${emphasis ? 'bg-[var(--rule-strong)]' : 'bg-[var(--rule)]'}`} ${className}`}
    />
  )
}
