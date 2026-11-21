import { useEffect, useRef } from 'react'
import { useSession } from '../lib/store/session'
import { ProgressRule } from './ProgressRule'

interface DeviceSheetProps {
  open: boolean
  onClose: () => void
}

export function DeviceSheet({ open, onClose }: DeviceSheetProps) {
  const { device, status, prepare } = useSession()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const focusables = Array.from(document.querySelectorAll<HTMLElement>('[data-sheet] button, [data-sheet] a, [data-sheet] input'))
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (!first || !last) return
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const rows: Array<[string, string]> = [
    ['Availability', device.availability],
    ['Progress', `${device.progress}%`],
    ['Cloud fallback', status.cloudModel],
    ['Inference mode', 'PREFER_ON_DEVICE'],
    ['App Check', status.appCheck],
  ]

  return (
    <>
      <div className="fixed inset-0 z-45 bg-[rgba(19,19,19,0.28)]" onClick={onClose} aria-hidden="true" />
      <aside
        data-sheet
        role="dialog"
        aria-modal="true"
        aria-label="On-device model"
        className="fixed right-0 top-0 z-50 flex h-full w-[380px] max-w-[92vw] flex-col border-l border-[var(--rule)] bg-[var(--bg-surface)]"
      >
        <div className="flex h-12 items-center justify-between border-b border-[var(--rule)] px-4">
          <h2 className="font-stamp text-[10px] uppercase tracking-[0.2em]">On-device model</h2>
          <button ref={closeRef} type="button" aria-label="Close" onClick={onClose} className="flex h-6 w-6 items-center justify-center">
            <span className="relative block h-3 w-3">
              <span className="absolute left-0 top-[5px] h-px w-3 rotate-45 bg-[var(--ink)]" />
              <span className="absolute left-0 top-[5px] h-px w-3 -rotate-45 bg-[var(--ink)]" />
            </span>
          </button>
        </div>
        <div className="divide-y divide-[var(--rule)]">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="font-sans text-[13px] text-[var(--ink-secondary)]">{label}</span>
              <span className="min-w-0 truncate font-mono text-[11px] text-[var(--ink)]">{value}</span>
            </div>
          ))}
        </div>

        <div className="border-b border-[var(--rule)] px-4 py-4">
          {(device.availability === 'downloadable' || device.availability === 'downloading') && (
            <button
              type="button"
              disabled={device.initialising}
              onClick={() => { void prepare() }}
              className="w-full rounded-[2px] bg-[var(--ink)] px-4 py-2.5 font-sans text-[12px] text-[var(--ink-inverse)] hover:bg-black disabled:bg-[var(--bg-sunken)] disabled:text-[var(--ink-muted)]"
            >
              {device.initialising ? 'Preparing' : 'Prepare on-device model'}
            </button>
          )}
          {(device.initialising || device.availability === 'downloading') && <div className="mt-3"><ProgressRule value={device.progress} label="Model download" /></div>}
          <p className="mt-3 font-sans text-[12px] text-[var(--ink-muted)]">Chrome downloads the model once. It stays on this device.</p>
        </div>

        <div className="mt-auto border-t border-[var(--rule)] px-4 py-3 font-mono text-[10px] leading-[1.6] text-[var(--ink-muted)]">
          NO ON-DEVICE LOGS LEAVE THIS TAB. CLOUD CALLS ARE LOGGED IN FIREBASE AI MONITORING.
        </div>
      </aside>
    </>
  )
}
