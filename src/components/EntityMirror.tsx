import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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

const SHARED = 'm-0 resize-none border-0 bg-transparent p-0 font-sans text-[15px] leading-[1.75] tracking-normal whitespace-pre-wrap break-words'

export function EntityMirror({ value, spans, onChange, onGesture, scanning = false, describedBy }: EntityMirrorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [contentWidth, setContentWidth] = useState<number>()

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const measure = (): void => setContentWidth(textarea.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(textarea)
    return () => observer.disconnect()
  }, [])

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

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className={`${SHARED} pointer-events-none absolute inset-0 z-0 overflow-hidden text-[var(--ink)]`}
        style={{
          width: contentWidth === undefined ? '100%' : `${contentWidth}px`,
          transform: `translateY(${-scrollTop}px)`,
        }}
      >
        {pieces}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        onKeyDown={() => onGesture?.()}
        onPaste={() => onGesture?.()}
        aria-label="Document text"
        aria-describedby={describedBy}
        spellCheck={false}
        placeholder=""
        className={`${SHARED} relative z-10 min-h-[40vh] w-full text-transparent caret-[var(--accent)] outline-none placeholder:text-transparent`}
      />
    </div>
  )
}
