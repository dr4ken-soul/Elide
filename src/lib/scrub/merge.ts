import { allocateToken } from '../crypto/id'
import type { EntityType, Span } from '../scene/schema'

interface Interval {
  start: number
  end: number
}

function subtract(candidate: Interval, covered: Interval[]): Interval[] {
  let pieces: Interval[] = [candidate]
  for (const block of covered) {
    if (block.end <= candidate.start || block.start >= candidate.end) continue
    const next: Interval[] = []
    for (const piece of pieces) {
      if (block.end <= piece.start || block.start >= piece.end) {
        next.push(piece)
        continue
      }
      if (block.start > piece.start) next.push({ start: piece.start, end: block.start })
      if (block.end < piece.end) next.push({ start: block.end, end: piece.end })
    }
    pieces = next
  }
  return pieces.filter((piece) => piece.end > piece.start)
}

/**
 * Produces the canonical span set. The returned list is sorted by start,
 * non-overlapping, and covers no character twice; rule spans outrank model
 * spans, longer spans win within an origin, and adjacent same-type spans coalesce.
 */
export function mergeSpans(spans: Span[]): Span[] {
  const valid = spans
    .filter((span) => span.end > span.start && Number.isFinite(span.start) && Number.isFinite(span.end))
    .map((span) => ({ ...span }))
    .sort((left, right) => {
      if (left.origin !== right.origin) return left.origin === 'rule' ? -1 : 1
      const leftLength = left.end - left.start
      const rightLength = right.end - right.start
      return rightLength - leftLength || left.start - right.start
    })

  const accepted: Span[] = []
  const modelSpans = valid.filter((span) => span.origin === 'model')
  const ruleSpans = valid.filter((span) => span.origin === 'rule')

  for (const span of ruleSpans) {
    if (!accepted.some((other) => other.start < span.end && span.start < other.end)) accepted.push(span)
  }

  const ruleIntervals = accepted.filter((span) => span.origin === 'rule').map(({ start, end }) => ({ start, end }))
  for (const span of modelSpans) {
    for (const piece of subtract({ start: span.start, end: span.end }, ruleIntervals)) {
      if (!accepted.some((other) => other.start < piece.end && piece.start < other.end)) {
        accepted.push({ ...span, start: piece.start, end: piece.end })
      }
    }
  }

  accepted.sort((left, right) => left.start - right.start || right.end - left.end)

  const coalesced: Span[] = []
  for (const span of accepted) {
    const previous = coalesced[coalesced.length - 1]
    if (previous && previous.type === span.type && span.start <= previous.end) {
      previous.end = Math.max(previous.end, span.end)
      previous.confidence = previous.confidence === 'low' || span.confidence === 'low' ? 'low' : 'high'
      previous.origin = previous.origin === 'rule' || span.origin === 'rule' ? 'rule' : 'model'
    } else {
      coalesced.push(span)
    }
  }

  const used = new Set<string>()
  return coalesced.map((span) => ({ ...span, token: allocateToken(span.type as EntityType, used) }))
}
