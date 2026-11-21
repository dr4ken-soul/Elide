import { describe, expect, it } from 'vitest'
import { mergeSpans } from '../src/lib/scrub/merge'
import type { Span } from '../src/lib/scene/schema'

function span(type: Span['type'], start: number, end: number, origin: Span['origin'], confidence: Span['confidence'] = 'high'): Span {
  return { type, start, end, origin, confidence, token: `⟦${type}_1⟧` }
}

function assertCanonical(spans: Span[]): void {
  for (let index = 1; index < spans.length; index += 1) {
    const previous = spans[index - 1]
    const current = spans[index]
    expect(previous && current && previous.end <= current.start).toBe(true)
  }
  expect(new Set(spans.flatMap((item) => [...Array(item.end - item.start).keys()].map((offset) => item.start + offset))).size)
    .toBe(spans.reduce((total, item) => total + item.end - item.start, 0))
}

describe('merge', () => {
  it('lets a rule span beat an intersecting model span', () => {
    const merged = mergeSpans([
      span('NAME', 0, 8, 'model'),
      span('NAME', 2, 6, 'rule'),
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0]?.origin).toBe('rule')
    assertCanonical(merged)
  })

  it('prefers the longer span within the same origin', () => {
    const merged = mergeSpans([
      span('NAME', 4, 10, 'model'),
      span('NAME', 0, 12, 'model'),
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0]?.start).toBe(0)
    expect(merged[0]?.end).toBe(12)
  })

  it('coalesces adjacent spans of the same type', () => {
    const merged = mergeSpans([
      span('NAME', 0, 4, 'rule'),
      span('NAME', 4, 9, 'rule'),
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0]?.end).toBe(9)
  })

  it('trims a model span that covers a rule span', () => {
    const merged = mergeSpans([
      span('NAME', 10, 20, 'model'),
      span('ID', 0, 5, 'rule'),
    ])
    expect(merged).toHaveLength(2)
    expect(merged[0]?.end).toBe(5)
    expect(merged[1]?.start).toBe(10)
    assertCanonical(merged)
  })

  it('resolves nested model spans without covering a character twice', () => {
    const merged = mergeSpans([
      span('NAME', 0, 30, 'model', 'low'),
      span('NAME', 5, 12, 'model'),
      span('ID', 14, 20, 'model'),
      span('ID', 16, 18, 'rule'),
    ])
    assertCanonical(merged)
    expect(merged.some((item) => item.confidence === 'low')).toBe(true)
  })

  it('returns tokens that are unique across merged types', () => {
    const merged = mergeSpans([
      span('NAME', 0, 4, 'rule'),
      span('NAME', 8, 12, 'rule'),
      span('ID', 14, 18, 'rule'),
    ])
    expect(new Set(merged.map((item) => item.token)).size).toBe(merged.length)
    expect(merged[1]?.token).toContain('NAME_2')
  })
})
