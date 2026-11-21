import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  title: string
  body: string
  actionLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, body, actionLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    buttonRef.current?.focus()
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-45 flex items-center justify-center bg-[rgba(19,19,19,0.28)]" onMouseDown={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-[380px] max-w-[92vw] rounded-[3px] border border-[var(--rule-strong)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-raised)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className="font-sans text-[15px] font-semibold">{title}</h2>
        <p className="mt-2 font-sans text-[13px] leading-[1.6] text-[var(--ink-secondary)]">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-[2px] border border-[var(--rule)] px-3 py-2 font-sans text-[12px] hover:border-[var(--ink)]">Cancel</button>
          <button ref={buttonRef} type="button" onClick={onConfirm} className="rounded-[2px] bg-[var(--accent)] px-3.5 py-2 font-sans text-[12px] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)]">{actionLabel}</button>
        </div>
      </div>
    </div>
  )
}
