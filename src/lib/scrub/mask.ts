import { mergeSpans } from './merge'
import type { ManifestEntry, Span } from '../scene/schema'

export interface MaskResult {
  redacted: string
  map: ManifestEntry[]
}

/**
 * Walks the text once and substitutes each merged span with its token.
 * The returned map is the only record of what was withheld and stays in memory.
 */
export function mask(text: string, spans: Span[]): MaskResult {
  const ordered = mergeSpans(spans)
  let redacted = ''
  const map: ManifestEntry[] = []
  let cursor = 0

  for (const span of ordered) {
    const start = Math.max(0, Math.min(span.start, text.length))
    const end = Math.max(start, Math.min(span.end, text.length))
    if (end === start) continue
    redacted += text.slice(cursor, start) + span.token
    map.push({
      token: span.token,
      type: span.type,
      original: text.slice(start, end),
      start,
      end,
      confidence: span.confidence,
    })
    cursor = end
  }

  redacted += text.slice(cursor)
  return { redacted, map }
}
