import { useMemo, useRef, type ReactNode } from 'react'
import type { Span } from '../lib/scene/schema'

interface EntityMirrorProps {
  value: string
  spans: Span[]
  onChange: (value: string) => void
  onGesture?: () => void
  scanning?: boolean
  describedBy?: string
}

function markType(type: Span['type']): string {
  return type.toLowerCase()
}

export function EntityMirror({ value, spans, onChange, onGesture, scanning = false, describedBy }: EntityMirrorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const pieces = useMemo<ReactNode[]>(() => {
    const ordered = [...spans].sort((left, right) => left.start - right.start)
    const nodes: ReactNode[] = []
    let cursor = 0
    ordered.forEach((span, index) => {
      if (span.start < cursor || span.end > value.length) return
      nodes.push(value.slice(cursor, span.start))
      nodes.push(
        <mark
          key={`${span.token}-${index}`}
          className={`entity ${scanning && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'entity-mark-reveal' : ''}`}
          style={scanning ? { animationDelay: `${index * 24}ms` } : undefined}
          data-type={markType(span.type)}
          data-uncertain={span.confidence === 'low' ? 'true' : undefined}
          title={span.confidence === 'low' ? 'Elide is not certain this is an identifier' : undefined}
        >
          {value.slice(span.start, span.end)}
        </mark>,
      )
      cursor = span.end
    })
    nodes.push(value.slice(cursor))
    return nodes
  }, [spans, value, scanning])

  const shared = 'm-0 w-full resize-none border-0 bg-transparent p-0 font-sans text-[15px] leading-[1.75] tracking-normal whitespace-pre-wrap break-words'

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className={`${shared} pointer-events-none absolute inset-0 z-0 text-[var(--ink)]`}
      >
        {pieces}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={() => onGesture?.()}
        onPaste={() => onGesture?.()}
        aria-label="Document text"
        aria-describedby={describedBy}
        spellCheck={false}
        placeholder=""
        className={`${shared} relative z-10 min-h-[40vh] text-transparent caret-[var(--accent)] outline-none placeholder:text-transparent`}
      />
    </div>
  )
}
