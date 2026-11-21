interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  small?: boolean
}

export function Switch({ checked, onChange, label, small = false }: SwitchProps) {
  const id = `switch-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <label htmlFor={id} className="inline-flex min-h-[44px] cursor-pointer items-center gap-2.5">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 rounded-full border transition-colors duration-[80ms] ${small ? 'h-[15px] w-[28px]' : 'h-[18px] w-[34px]'} ${checked ? 'border-[var(--ink)] bg-[var(--ink)]' : 'border-[var(--rule-strong)] bg-[var(--bg-sunken)]'}`}
      >
        <span
          className={`absolute left-[2px] top-[2px] rounded-full border transition-transform duration-[140ms] ease-[var(--ease-snap)] ${small ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} ${checked ? (small ? 'translate-x-[13px]' : 'translate-x-[16px]') + ' border-transparent bg-[var(--bg-page)]' : 'border-[var(--rule-strong)] bg-[var(--bg-surface)]'}`}
        />
      </button>
      <span className="font-sans text-[13px] text-[var(--ink)]">{label}</span>
    </label>
  )
}
